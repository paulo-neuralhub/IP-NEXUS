// =====================================================
// Quote to Matter Conversion Hook
// =====================================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import { Matter } from '@/types/matters';

export interface QuoteItemWithMatterInfo {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  generates_matter: boolean;
  matter_type: string | null;
  matter_subtype: string | null;
  matter_jurisdiction: string | null;
  generated_matter_id: string | null;
  service_catalog?: {
    id: string;
    name: string;
    reference_code: string;
    generates_matter: boolean;
    default_matter_type: string | null;
    default_matter_subtype: string | null;
    default_jurisdiction: string | null;
  } | null;
}

export interface MatterCreationData {
  reference: string;
  title: string;
  type: string;
  status?: string;
  jurisdiction?: string;
  jurisdiction_code?: string;
  mark_name?: string;
  mark_type?: string;
  nice_classes?: number[];
  assigned_to?: string;
  owner_name?: string;
}

export interface MatterCreationOptions {
  addClientAsOwner: boolean;
  importClientRelationships: boolean;
  linkInvoice: boolean;
  linkQuote: boolean;
}

export interface CreateMatterResult {
  success: boolean;
  matter?: Matter;
  error?: string;
}

export function useQuoteToMatter(quoteId?: string) {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  // Get quote items that can generate matters
  const { data: quoteItems = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['quote-items-for-matter', quoteId],
    queryFn: async (): Promise<QuoteItemWithMatterInfo[]> => {
      if (!quoteId) return [];

      const { data, error } = await supabase
        .from('quote_items')
        .select(`
          id,
          description,
          quantity,
          unit_price,
          generates_matter,
          matter_type,
          matter_subtype,
          matter_jurisdiction,
          generated_matter_id,
          service_id
        `)
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get service catalog info for each item
      const itemsWithService = await Promise.all((data || []).map(async (item: any) => {
        let serviceInfo = null;
        
        if (item.service_id) {
          const { data: service } = await supabase
            .from('service_catalog')
            .select('id, name, reference_code, generates_matter, default_matter_type, default_matter_subtype, default_jurisdiction')
            .eq('id', item.service_id)
            .single();
          
          serviceInfo = service;
        }

        // Determine if item generates matter (from item or service)
        const generatesMatter = item.generates_matter || serviceInfo?.generates_matter || false;
        const matterType = item.matter_type || serviceInfo?.default_matter_type || null;
        const matterSubtype = item.matter_subtype || serviceInfo?.default_matter_subtype || null;
        const matterJurisdiction = item.matter_jurisdiction || serviceInfo?.default_jurisdiction || null;

        return {
          ...item,
          generates_matter: generatesMatter,
          matter_type: matterType,
          matter_subtype: matterSubtype,
          matter_jurisdiction: matterJurisdiction,
          service_catalog: serviceInfo,
        };
      }));

      return itemsWithService;
    },
    enabled: !!quoteId,
  });

  // Get generated matters for this quote
  const { data: generatedMatters = [], isLoading: isLoadingMatters } = useQuery({
    queryKey: ['generated-matters', quoteId],
    queryFn: async (): Promise<Matter[]> => {
      if (!quoteId) return [];

      const { data, error } = await supabase
        .from('matters')
        .select('*')
        .eq('source_quote_id', quoteId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as Matter[];
    },
    enabled: !!quoteId,
  });

  // Check if quote can generate matters
  const canCreateMatter = (items: QuoteItemWithMatterInfo[]) => {
    return items.some(item => item.generates_matter && !item.generated_matter_id);
  };

  // Get items that can still generate matters (not yet created)
  const pendingMatterItems = quoteItems.filter(
    item => item.generates_matter && !item.generated_matter_id
  );

  // Create matter from quote
  const createMatterMutation = useMutation({
    mutationFn: async ({
      quoteItemIds,
      matterData,
      options,
    }: {
      quoteItemIds: string[];
      matterData: MatterCreationData;
      options: MatterCreationOptions;
    }): Promise<CreateMatterResult> => {
      if (!currentOrganization?.id || !quoteId) {
        throw new Error('No organization or quote selected');
      }

      setIsCreating(true);

      try {
        // Get quote info
        const { data: quote, error: quoteError } = await supabase
          .from('quotes')
          .select('*, contact:contacts(*)')
          .eq('id', quoteId)
          .single();

        if (quoteError || !quote) {
          throw new Error('Quote not found');
        }

        if (quote.status !== 'accepted') {
          throw new Error('Quote must be accepted to create matter');
        }

        // Generate reference if needed
        let reference = matterData.reference;
        if (!reference || reference === 'auto') {
          const year = new Date().getFullYear();
          const { count } = await supabase
            .from('matters')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', currentOrganization.id);
          
          const nextNum = (count || 0) + 1;
          const clientPrefix = (quote.contact as any)?.company_name?.substring(0, 4)?.toUpperCase() || 'MAT';
          reference = `${clientPrefix}-${year}-${String(nextNum).padStart(3, '0')}`;
        }

        // Create matter
        const { data: matter, error: matterError } = await supabase
          .from('matters')
          .insert({
            organization_id: currentOrganization.id,
            reference,
            title: matterData.title,
            type: matterData.type as any,
            status: (matterData.status || 'pending') as any,
            jurisdiction: matterData.jurisdiction,
            jurisdiction_code: matterData.jurisdiction_code,
            mark_name: matterData.mark_name,
            mark_type: matterData.mark_type as any,
            nice_classes: matterData.nice_classes,
            assigned_to: matterData.assigned_to,
            owner_name: matterData.owner_name || (quote.contact as any)?.name,
            source_quote_id: quoteId,
            source_type: 'quote',
          })
          .select()
          .single();

        if (matterError) throw matterError;

        // Update quote items with generated matter
        for (const itemId of quoteItemIds) {
          await supabase
            .from('quote_items')
            .update({ generated_matter_id: matter.id })
            .eq('id', itemId);
        }

        // Update quote with first generated matter (if not already set)
        if (!quote.generated_matter_id) {
          await supabase
            .from('quotes')
            .update({ generated_matter_id: matter.id })
            .eq('id', quoteId);
        }

        // Add client as party if requested
        if (options.addClientAsOwner && quote.contact_id) {
          await supabase
            .from('matter_parties')
            .insert({
              matter_id: matter.id,
              organization_id: currentOrganization.id,
              contact_id: quote.contact_id,
              role: 'owner',
              is_primary: true,
            } as any);
        }

        // Link invoice if exists and requested - invoice linking handled separately
        // since invoices table may not have matter_id column yet

        // Create activity log
        await supabase
          .from('activity_log')
          .insert({
            organization_id: currentOrganization.id,
            entity_type: 'matter',
            entity_id: matter.id,
            action: 'matter_created_from_quote',
            title: 'Expediente creado desde presupuesto',
            description: `Expediente ${reference} creado desde presupuesto ${(quote as any).quote_number}`,
            metadata: {
              quote_id: quoteId,
              quote_number: (quote as any).quote_number,
              items_count: quoteItemIds.length,
            },
          } as any);

        return { success: true, matter: matter as Matter };
      } finally {
        setIsCreating(false);
      }
    },
    onSuccess: (result) => {
      if (result.success && result.matter) {
        toast.success('Expediente creado', {
          description: `${result.matter.reference} creado correctamente`,
        });
        queryClient.invalidateQueries({ queryKey: ['quote-items-for-matter'] });
        queryClient.invalidateQueries({ queryKey: ['generated-matters'] });
        queryClient.invalidateQueries({ queryKey: ['matters'] });
        queryClient.invalidateQueries({ queryKey: ['quotes'] });
      }
    },
    onError: (error: Error) => {
      toast.error('Error al crear expediente', {
        description: error.message,
      });
    },
  });

  return {
    quoteItems,
    pendingMatterItems,
    generatedMatters,
    canCreateMatter: canCreateMatter(quoteItems),
    isLoading: isLoadingItems || isLoadingMatters,
    isCreating,
    createMatterFromQuote: createMatterMutation.mutateAsync,
  };
}
