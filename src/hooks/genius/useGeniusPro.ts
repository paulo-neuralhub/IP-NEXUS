// src/hooks/genius/useGeniusPro.ts
// Hooks for IP-GENIUS PRO features

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import { compareTrademarks } from '@/lib/services/trademark-comparator';
import type { Json } from '@/integrations/supabase/types';
import type { 
  TrademarkMark, 
  OppositionInput, 
  GeneratedDocument,
  GeniusGeneratedDocument,
  GeniusOfficialFee,
} from '@/types/genius-pro.types';

// ============================================
// TRADEMARK COMPARISON
// ============================================

export function useCompareTrademarks() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ markA, markB }: { markA: TrademarkMark; markB: TrademarkMark }) => {
      const comparison = await compareTrademarks(markA, markB);
      
      // Save to database
      if (currentOrganization?.id) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('genius_trademark_comparisons').insert([{
            organization_id: currentOrganization.id,
            user_id: user.id,
            mark_a_text: markA.text,
            mark_a_image_url: markA.imageUrl,
            mark_a_classes: markA.classes,
            mark_a_goods: markA.goods?.join(', ') || '',
            mark_b_text: markB.text,
            mark_b_image_url: markB.imageUrl,
            mark_b_classes: markB.classes,
            mark_b_goods: markB.goods?.join(', ') || '',
            visual_similarity: comparison.analysis.visual.score,
            visual_analysis: comparison.analysis.visual.analysis,
            phonetic_similarity: comparison.analysis.phonetic.score,
            phonetic_analysis: comparison.analysis.phonetic.analysis,
            phonetic_details: comparison.analysis.phonetic.algorithms as unknown as Json,
            conceptual_similarity: comparison.analysis.conceptual.score,
            conceptual_analysis: comparison.analysis.conceptual.analysis,
            conceptual_details: comparison.analysis.conceptual.concepts as unknown as Json,
            goods_similarity: comparison.analysis.goods.score,
            goods_analysis: comparison.analysis.goods.analysis,
            goods_details: {
              identicalClasses: comparison.analysis.goods.identicalClasses,
              similarClasses: comparison.analysis.goods.similarClasses,
            } as unknown as Json,
            overall_risk: comparison.overall.riskLevel,
            overall_score: comparison.overall.score,
            recommendation: comparison.overall.recommendation,
          }]);
        }
      }
      
      return comparison;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trademark-comparisons'] });
      toast.success('Análisis completado');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al comparar marcas');
    },
  });
}

export function useTrademarkComparisons() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['trademark-comparisons', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      const { data, error } = await supabase
        .from('genius_trademark_comparisons')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrganization?.id,
  });
}

// ============================================
// OPPOSITION GENERATOR
// ============================================

export function useGenerateOpposition() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: OppositionInput): Promise<GeneratedDocument> => {
      if (!currentOrganization?.id) throw new Error('No organization selected');
      
      const { data, error } = await supabase.functions.invoke('genius-generate-opposition', {
        body: { 
          input,
          organizationId: currentOrganization.id,
        },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-documents'] });
      toast.success('Borrador de oposición generado');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al generar oposición');
    },
  });
}

// ============================================
// GENERATED DOCUMENTS
// ============================================

export function useGeneratedDocuments(documentType?: string) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['generated-documents', currentOrganization?.id, documentType],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      let query = supabase
        .from('genius_generated_documents')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });
      
      if (documentType) {
        query = query.eq('document_type', documentType);
      }
      
      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      return data as unknown as GeniusGeneratedDocument[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useGeneratedDocument(id: string) {
  return useQuery({
    queryKey: ['generated-document', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genius_generated_documents')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as unknown as GeniusGeneratedDocument;
    },
    enabled: !!id,
  });
}

export function useApproveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const { error } = await supabase
        .from('genius_generated_documents')
        .update({
          user_approved: true,
          user_notes: notes,
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['generated-document', id] });
      queryClient.invalidateQueries({ queryKey: ['generated-documents'] });
      toast.success('Documento aprobado');
    },
  });
}

// ============================================
// OFFICIAL FEES
// ============================================

export function useOfficialFees(office?: string, procedureType?: string) {
  return useQuery({
    queryKey: ['official-fees', office, procedureType],
    queryFn: async () => {
      let query = supabase
        .from('genius_official_fees')
        .select('*')
        .is('effective_until', null);
      
      if (office) {
        query = query.eq('office', office);
      }
      if (procedureType) {
        query = query.eq('procedure_type', procedureType);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as unknown as GeniusOfficialFee[];
    },
  });
}

export function useOfficialFee(office: string, procedureType: string) {
  return useQuery({
    queryKey: ['official-fee', office, procedureType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genius_official_fees')
        .select('*')
        .eq('office', office)
        .eq('procedure_type', procedureType)
        .is('effective_until', null)
        .maybeSingle();
      
      if (error) throw error;
      return data as unknown as GeniusOfficialFee | null;
    },
    enabled: !!office && !!procedureType,
  });
}

// ============================================
// LEGAL SOURCES (RAG)
// ============================================

export function useLegalSources(query: string, options?: {
  sourceType?: string;
  jurisdiction?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['legal-sources', query, options],
    queryFn: async () => {
      let dbQuery = supabase
        .from('genius_legal_sources')
        .select('*')
        .eq('is_current', true)
        .ilike('content', `%${query}%`)
        .limit(options?.limit || 10);
      
      if (options?.sourceType) {
        dbQuery = dbQuery.eq('source_type', options.sourceType);
      }
      if (options?.jurisdiction) {
        dbQuery = dbQuery.eq('jurisdiction', options.jurisdiction);
      }
      
      const { data, error } = await dbQuery;
      
      if (error) throw error;
      return data;
    },
    enabled: query.length > 2,
  });
}
