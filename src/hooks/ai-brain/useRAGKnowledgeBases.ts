// ============================================================
// IP-NEXUS AI BRAIN - RAG KNOWLEDGE BASES HOOKS
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface RAGKnowledgeBase {
  id: string;
  tenant_id: string | null;
  code: string;
  name: string;
  description: string | null;
  type: string;
  jurisdictions: string[] | null;
  languages: string[] | null;
  embedding_provider: string;
  embedding_model: string;
  embedding_dimensions: number;
  chunk_size: number;
  chunk_overlap: number;
  default_top_k: number;
  similarity_threshold: number;
  visibility: string;
  allowed_roles: string[] | null;
  associated_tasks: string[] | null;
  is_active: boolean;
  document_count: number;
  chunk_count: number;
  total_tokens: number;
  last_updated_at: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  // Joined
  tenant?: { name: string } | null;
}

export interface RAGDocument {
  id: string;
  knowledge_base_id: string;
  title: string;
  source_url: string | null;
  source_type: string | null;
  jurisdiction: string | null;
  language: string;
  version: string | null;
  effective_from: string | null;
  effective_to: string | null;
  is_current: boolean;
  supersedes_id: string | null;
  document_type: string | null;
  tags: string[] | null;
  raw_content: string | null;
  content_hash: string | null;
  processed_at: string | null;
  chunk_count: number;
  token_count: number;
  status: string;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  created_by: string | null;
  updated_at: string;
}

export interface RAGKnowledgeBaseFormData {
  code: string;
  name: string;
  description?: string;
  type?: string;
  jurisdictions?: string[];
  languages?: string[];
  visibility?: string;
  chunk_size?: number;
  chunk_overlap?: number;
  default_top_k?: number;
  similarity_threshold?: number;
}

export interface RAGDocumentFormData {
  knowledge_base_id: string;
  title: string;
  source_url?: string;
  source_type?: string;
  jurisdiction?: string;
  language?: string;
  document_type?: string;
  raw_content: string;
  tags?: string[];
}

// Fetch all knowledge bases
export function useRAGKnowledgeBases() {
  return useQuery({
    queryKey: ['rag-knowledge-bases'],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('rag_knowledge_bases') as any)
        .select('*, tenant:organizations(name)')
        .order('name');
      if (error) throw error;
      return (data || []) as RAGKnowledgeBase[];
    },
  });
}

// Fetch single knowledge base
export function useRAGKnowledgeBase(id: string | undefined) {
  return useQuery({
    queryKey: ['rag-knowledge-base', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await (supabase
        .from('rag_knowledge_bases') as any)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as RAGKnowledgeBase;
    },
    enabled: !!id,
  });
}

// Fetch documents for a knowledge base
export function useRAGDocuments(knowledgeBaseId: string | undefined) {
  return useQuery({
    queryKey: ['rag-documents', knowledgeBaseId],
    queryFn: async () => {
      if (!knowledgeBaseId) return [];
      const { data, error } = await (supabase
        .from('rag_documents') as any)
        .select('*')
        .eq('knowledge_base_id', knowledgeBaseId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as RAGDocument[];
    },
    enabled: !!knowledgeBaseId,
  });
}

// Create knowledge base
export function useCreateRAGKnowledgeBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RAGKnowledgeBaseFormData) => {
      const { data: result, error } = await (supabase
        .from('rag_knowledge_bases') as any)
        .insert({
          code: data.code,
          name: data.name,
          description: data.description || null,
          type: data.type || 'general',
          jurisdictions: data.jurisdictions || null,
          languages: data.languages || ['es'],
          visibility: data.visibility || 'global',
          chunk_size: data.chunk_size || 1000,
          chunk_overlap: data.chunk_overlap || 200,
          default_top_k: data.default_top_k || 5,
          similarity_threshold: data.similarity_threshold || 0.7,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rag-knowledge-bases'] });
      toast.success('Knowledge base creada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// Update knowledge base
export function useUpdateRAGKnowledgeBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RAGKnowledgeBaseFormData> }) => {
      const { error } = await (supabase
        .from('rag_knowledge_bases') as any)
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rag-knowledge-bases'] });
      queryClient.invalidateQueries({ queryKey: ['rag-knowledge-base', variables.id] });
      toast.success('Knowledge base actualizada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// Delete knowledge base
export function useDeleteRAGKnowledgeBase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from('rag_knowledge_bases') as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rag-knowledge-bases'] });
      toast.success('Knowledge base eliminada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// Create document
export function useCreateRAGDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RAGDocumentFormData) => {
      const { data: result, error } = await (supabase
        .from('rag_documents') as any)
        .insert({
          knowledge_base_id: data.knowledge_base_id,
          title: data.title,
          source_url: data.source_url || null,
          source_type: data.source_type || 'manual',
          jurisdiction: data.jurisdiction || null,
          language: data.language || 'es',
          document_type: data.document_type || null,
          raw_content: data.raw_content,
          tags: data.tags || null,
          status: 'pending',
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rag-documents', variables.knowledge_base_id] });
      toast.success('Documento añadido');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// Delete document
export function useDeleteRAGDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, knowledgeBaseId }: { id: string; knowledgeBaseId: string }) => {
      const { error } = await (supabase
        .from('rag_documents') as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return knowledgeBaseId;
    },
    onSuccess: (knowledgeBaseId) => {
      queryClient.invalidateQueries({ queryKey: ['rag-documents', knowledgeBaseId] });
      toast.success('Documento eliminado');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// Process document (trigger chunking + embedding)
export function useProcessRAGDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, knowledgeBaseId }: { id: string; knowledgeBaseId: string }) => {
      // Update status to processing
      const { error } = await (supabase
        .from('rag_documents') as any)
        .update({ status: 'processing' })
        .eq('id', id);
      if (error) throw error;
      
      // In production, this would call an edge function for chunking + embeddings
      // For now, we simulate marking as ready after a delay
      toast.info('Procesamiento iniciado (simulado)');
      
      return knowledgeBaseId;
    },
    onSuccess: (knowledgeBaseId) => {
      queryClient.invalidateQueries({ queryKey: ['rag-documents', knowledgeBaseId] });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// RAG Query stats
export function useRAGQueryStats(knowledgeBaseId?: string) {
  return useQuery({
    queryKey: ['rag-query-stats', knowledgeBaseId],
    queryFn: async () => {
      let query = (supabase
        .from('rag_queries') as any)
        .select('id, created_at, latency_ms, chunks_retrieved, chunks_used')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (knowledgeBaseId) {
        query = query.eq('knowledge_base_id', knowledgeBaseId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}
