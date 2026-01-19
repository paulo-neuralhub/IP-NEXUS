// ============================================================
// IP-NEXUS AI BRAIN - RAG COLLECTIONS HOOK
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AIRAGCollection, AIRAGCollectionFormData } from '@/types/ai-brain.types';
import { toast } from 'sonner';

const QUERY_KEY = 'ai-rag-collections';

export function useAIRAGCollections() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async (): Promise<AIRAGCollection[]> => {
      const { data, error } = await supabase
        .from('ai_rag_collections')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as AIRAGCollection[];
    },
  });
}

export function useActiveAIRAGCollections() {
  return useQuery({
    queryKey: [QUERY_KEY, 'active'],
    queryFn: async (): Promise<AIRAGCollection[]> => {
      const { data, error } = await supabase
        .from('ai_rag_collections')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as AIRAGCollection[];
    },
  });
}

export function useAIRAGCollection(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async (): Promise<AIRAGCollection | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('ai_rag_collections')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as AIRAGCollection;
    },
    enabled: !!id,
  });
}

export function useCreateAIRAGCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: AIRAGCollectionFormData) => {
      const { data, error } = await supabase
        .from('ai_rag_collections')
        .insert({
          name: formData.name,
          description: formData.description,
          collection_type: formData.collection_type,
          embedding_model: formData.embedding_model,
          chunk_size: formData.chunk_size,
          chunk_overlap: formData.chunk_overlap,
          auto_update_enabled: formData.auto_update_enabled,
          update_frequency: formData.update_frequency,
          is_active: formData.is_active,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('RAG collection created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create RAG collection: ${error.message}`);
    },
  });
}

export function useUpdateAIRAGCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: Partial<AIRAGCollectionFormData> }) => {
      const { data, error } = await supabase
        .from('ai_rag_collections')
        .update({
          name: formData.name,
          description: formData.description,
          collection_type: formData.collection_type,
          embedding_model: formData.embedding_model,
          chunk_size: formData.chunk_size,
          chunk_overlap: formData.chunk_overlap,
          auto_update_enabled: formData.auto_update_enabled,
          update_frequency: formData.update_frequency,
          is_active: formData.is_active,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('RAG collection updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update RAG collection: ${error.message}`);
    },
  });
}

export function useDeleteAIRAGCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_rag_collections')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('RAG collection deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete RAG collection: ${error.message}`);
    },
  });
}

export function useToggleRAGActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('ai_rag_collections')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(`RAG collection ${variables.is_active ? 'activated' : 'deactivated'}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update RAG collection: ${error.message}`);
    },
  });
}

export function useRefreshRAGCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Call edge function to refresh the RAG collection
      const { data, error } = await supabase.functions.invoke('ai-refresh-rag', {
        body: { collection_id: id },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('RAG collection refresh started');
    },
    onError: (error: Error) => {
      toast.error(`Failed to refresh RAG collection: ${error.message}`);
    },
  });
}
