/**
 * useLeads - Hook para gestión de Leads del CRM simplificado
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';

export type LeadStatus = 'new' | 'contacted' | 'standby' | 'converted';

export interface Lead {
  id: string;
  organization_id: string;
  contact_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  company_name: string | null;
  company_tax_id: string | null;
  status: LeadStatus;
  interested_in: string[];
  estimated_value: number | null;
  source: string | null;
  next_action: string | null;
  next_action_date: string | null;
  standby_until: string | null;
  standby_reason: string | null;
  converted_to_deal_id: string | null;
  converted_to_client_id: string | null;
  converted_at: string | null;
  assigned_to: string | null;
  notes: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadData {
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
  company_name?: string;
  company_tax_id?: string;
  status?: LeadStatus;
  interested_in?: string[];
  estimated_value?: number;
  source?: string;
  next_action?: string;
  next_action_date?: string;
  notes?: string;
  tags?: string[];
  assigned_to?: string;
}

export function useLeads(filters?: { status?: LeadStatus; assigned_to?: string }) {
  const { currentOrganization } = useOrganization();
  const orgId = currentOrganization?.id;

  return useQuery({
    queryKey: ['crm-leads', orgId, filters],
    queryFn: async () => {
      if (!orgId) return [];

      let query = supabase
        .from('crm_leads')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!orgId,
  });
}

export function useLead(leadId: string | undefined) {
  const { currentOrganization } = useOrganization();
  const orgId = currentOrganization?.id;

  return useQuery({
    queryKey: ['crm-lead', leadId],
    queryFn: async () => {
      if (!leadId || !orgId) return null;

      const { data, error } = await supabase
        .from('crm_leads')
        .select('*')
        .eq('id', leadId)
        .eq('organization_id', orgId)
        .single();

      if (error) throw error;
      return data as Lead;
    },
    enabled: !!leadId && !!orgId,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: CreateLeadData) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data: result, error } = await supabase
        .from('crm_leads')
        .insert({
          ...data,
          organization_id: currentOrganization.id,
          status: data.status || 'new',
          interested_in: data.interested_in || [],
          tags: data.tags || [],
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
      toast.success('Lead creado correctamente');
    },
    onError: (error) => {
      toast.error(`Error al crear lead: ${error.message}`);
    },
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const orgId = currentOrganization?.id;

  return useMutation({
    mutationFn: async ({
      leadId,
      status,
      standbyUntil,
      standbyReason,
    }: {
      leadId: string;
      status: LeadStatus;
      standbyUntil?: string;
      standbyReason?: string;
    }) => {
      const { data, error } = await supabase.rpc('update_lead_status', {
        p_lead_id: leadId,
        p_new_status: status,
        p_standby_until: standbyUntil || null,
        p_standby_reason: standbyReason || null,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Error al actualizar status');
      }
      
      return { ...result, leadId, status };
    },
    // Optimistic update - update UI immediately
    onMutate: async ({ leadId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['crm-leads'] });
      
      // Snapshot the previous value
      const previousLeads = queryClient.getQueryData(['crm-leads', orgId]);
      
      // Optimistically update the cache
      queryClient.setQueryData(['crm-leads', orgId], (old: Lead[] | undefined) => {
        if (!old) return old;
        return old.map(lead => 
          lead.id === leadId 
            ? { ...lead, status } 
            : lead
        );
      });
      
      return { previousLeads };
    },
    onSuccess: () => {
      // Invalidate to sync with server
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousLeads) {
        queryClient.setQueryData(['crm-leads', orgId], context.previousLeads);
      }
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useApproveLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      leadId,
      dealTitle,
      dealValue,
    }: {
      leadId: string;
      dealTitle?: string;
      dealValue?: number;
    }) => {
      const { data, error } = await supabase.rpc('approve_lead', {
        p_lead_id: leadId,
        p_deal_title: dealTitle || null,
        p_deal_value: dealValue || null,
      });

      if (error) throw error;
      
      const result = data as { 
        success: boolean; 
        client_id?: string;
        client_number?: string;
        deal_id?: string;
        deal_number?: string;
        error?: string;
      };
      
      if (!result.success) {
        throw new Error(result.error || 'Error al aprobar lead');
      }
      
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success(`Lead convertido: Cliente ${result.client_number}, Deal ${result.deal_number}`);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, reason }: { leadId: string; reason?: string }) => {
      const { data, error } = await supabase.rpc('delete_lead', {
        p_lead_id: leadId,
        p_reason: reason || null,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; lead_name?: string };
      if (!result.success) {
        throw new Error(result.error || 'Error al eliminar lead');
      }
      
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
      toast.success(`Lead "${result.lead_name}" eliminado`);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}
