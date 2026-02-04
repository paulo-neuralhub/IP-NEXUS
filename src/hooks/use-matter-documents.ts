/**
 * use-matter-documents - Hook para documentos del expediente
 * Extended for PROMPT 5: Document & Template Management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { 
  MatterDocument, 
  DocumentVersion, 
  DocumentFilters,
  DocumentCategory,
  MatterDocumentType 
} from '@/types/documents';

// Re-export the type for backwards compatibility
export type { MatterDocument };

// ══════════════════════════════════════════════════════════════════════════
// HOOK: Get matter documents with filters
// ══════════════════════════════════════════════════════════════════════════

export function useMatterDocuments(matterId?: string, filters?: DocumentFilters) {
  return useQuery({
    queryKey: ['matter-documents', matterId, filters],
    queryFn: async () => {
      if (!matterId) return [];
      
      const client: any = supabase;
      // Simple query without JOINs to avoid failures when created_by is null
      let query = client
        .from('matter_documents')
        .select('*')
        .eq('matter_id', matterId)
        .order('created_at', { ascending: false });

      // Filter out deleted documents (handle NULL status as well)
      query = query.or('status.is.null,status.neq.deleted');

      if (filters?.category?.length) {
        query = query.in('category', filters.category);
      }

      if (filters?.documentType?.length) {
        query = query.in('document_type', filters.documentType);
      }

      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching matter documents:', error);
        throw error;
      }
      
      // Map to include file_url for backwards compatibility
      return (data || []).map((doc: any) => ({
        ...doc,
        file_url: doc.file_path || doc.storage_path || '',
      })) as MatterDocument[];
    },
    enabled: !!matterId,
  });
}

// ══════════════════════════════════════════════════════════════════════════
// HOOK: Get document versions
// ══════════════════════════════════════════════════════════════════════════

export function useDocumentVersions(documentId?: string) {
  return useQuery({
    queryKey: ['document-versions', documentId],
    queryFn: async () => {
      if (!documentId) return [];

      const client: any = supabase;
      const { data, error } = await client
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return data as DocumentVersion[];
    },
    enabled: !!documentId,
  });
}

// ══════════════════════════════════════════════════════════════════════════
// HOOK: Upload document
// ══════════════════════════════════════════════════════════════════════════

interface UploadDocumentParams {
  matterId: string;
  file: File;
  name: string;
  category: DocumentCategory | string;
  documentType?: MatterDocumentType;
  description?: string;
  documentDate?: string;
  tags?: string[];
}

export function useUploadMatterDocument() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (params: UploadDocumentParams) => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!currentOrganization?.id) {
        throw new Error('Organization not found');
      }

      const fileExt = params.file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const storagePath = `${currentOrganization.id}/${params.matterId}/${fileName}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('matter-documents')
        .upload(storagePath, params.file, {
          contentType: params.file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Create record
      const client: any = supabase;
      const { data, error } = await client
        .from('matter_documents')
        .insert({
          matter_id: params.matterId,
          organization_id: currentOrganization.id,
          name: params.name,
          description: params.description,
          category: params.category,
          document_type: params.documentType ?? 'uploaded',
          storage_path: storagePath,
          file_path: storagePath,
          file_name: params.file.name,
          file_size: params.file.size,
          mime_type: params.file.type,
          file_extension: fileExt,
          document_date: params.documentDate,
          tags: params.tags ?? [],
          created_by: user.user?.id,
          uploaded_by: user.user?.id,
        })
        .select()
        .single();

      if (error) {
        await supabase.storage.from('matter-documents').remove([storagePath]);
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matter-documents', variables.matterId] });
      toast.success('Documento subido correctamente');
    },
    onError: (error) => {
      toast.error('Error al subir documento: ' + (error as Error).message);
    },
  });
}

// ══════════════════════════════════════════════════════════════════════════
// HOOK: Delete document (soft delete)
// ══════════════════════════════════════════════════════════════════════════

export function useDeleteMatterDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const client: any = supabase;
      const { error } = await client
        .from('matter_documents')
        .update({ status: 'deleted' })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matter-documents'] });
      toast.success('Documento eliminado');
    },
    onError: (error) => {
      toast.error('Error al eliminar: ' + (error as Error).message);
    },
  });
}

// ══════════════════════════════════════════════════════════════════════════
// HOOK: Get download URL
// ══════════════════════════════════════════════════════════════════════════

export function useDocumentDownloadUrl(storagePath?: string) {
  return useQuery({
    queryKey: ['document-download-url', storagePath],
    queryFn: async () => {
      if (!storagePath) return null;

      const { data, error } = await supabase.storage
        .from('matter-documents')
        .createSignedUrl(storagePath, 3600);

      if (error) throw error;
      return data.signedUrl;
    },
    enabled: !!storagePath,
    staleTime: 1000 * 60 * 30,
  });
}

// ══════════════════════════════════════════════════════════════════════════
// Legacy exports for backwards compatibility
// ══════════════════════════════════════════════════════════════════════════

export function useCreateMatterDocument() {
  return useUploadMatterDocument();
}
