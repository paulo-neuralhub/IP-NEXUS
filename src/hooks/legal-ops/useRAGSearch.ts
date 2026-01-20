// ============================================
// src/hooks/legal-ops/useRAGSearch.ts
// RAG Search Hook for Document Retrieval
// ============================================

import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';

interface RAGSearchParams {
  query: string;
  client_id?: string;
  matter_id?: string;
  doc_types?: string[];
  limit?: number;
}

export interface RAGResult {
  id: string;
  source_type: 'document' | 'communication' | 'transcription';
  source_id: string;
  chunk_text: string;
  relevance: number;
  metadata: {
    title?: string;
    doc_type?: string;
    client_name?: string;
    matter_ref?: string;
  };
}

export function useRAGSearch() {
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (params: RAGSearchParams): Promise<RAGResult[]> => {
      if (!currentOrganization?.id) {
        throw new Error('Organization not found');
      }

      const { data, error } = await supabase.functions.invoke('rag-search', {
        body: {
          ...params,
          organization_id: currentOrganization.id
        }
      });

      if (error) throw error;
      return data.results || [];
    }
  });
}

// Hook for searching within a specific context (matter/client)
export function useContextualRAGSearch(context?: { 
  client_id?: string; 
  matter_id?: string; 
}) {
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (query: string): Promise<RAGResult[]> => {
      if (!currentOrganization?.id) {
        throw new Error('Organization not found');
      }

      const { data, error } = await supabase.functions.invoke('rag-search', {
        body: {
          query,
          ...context,
          organization_id: currentOrganization.id,
          limit: 10
        }
      });

      if (error) throw error;
      return data.results || [];
    }
  });
}
