import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { Document, DocumentType, EntityType } from '@/types/documents';
import { getBucketForEntity } from '@/types/documents';

// ============================================
// Query: Fetch documents for an entity
// ============================================
export function useDocuments(entityType: EntityType, entityId: string) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['documents', entityType, entityId],
    queryFn: async () => {
      if (!currentOrganization?.id || !entityId) return [];

      const foreignKey = entityType === 'matter' ? 'matter_id' : 'client_id';
      
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          uploader:users!documents_uploaded_by_fkey(full_name, email)
        `)
        .eq('organization_id', currentOrganization.id)
        .eq(foreignKey, entityId)
        .eq('is_current_version', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
    enabled: !!currentOrganization?.id && !!entityId,
  });
}

// ============================================
// Mutation: Upload document
// ============================================
interface UploadDocumentParams {
  file: File;
  entityType: EntityType;
  entityId: string;
  documentType: DocumentType;
  title?: string;
  description?: string;
  onProgress?: (progress: number) => void;
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async ({
      file,
      entityType,
      entityId,
      documentType,
      title,
      description,
      onProgress,
    }: UploadDocumentParams) => {
      if (!currentOrganization?.id) {
        throw new Error('No hay organización seleccionada');
      }

      const bucket = getBucketForEntity(entityType);
      const fileExt = file.name.split('.').pop();
      const uniqueId = crypto.randomUUID();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `${currentOrganization.id}/${entityId}/${uniqueId}-${sanitizedName}`;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Upload to storage
      onProgress?.(10);
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;
      
      onProgress?.(70);

      // Create document record
      const foreignKey = entityType === 'matter' ? 'matter_id' : 'client_id';
      
      const { data: doc, error: insertError } = await supabase
        .from('documents')
        .insert({
          organization_id: currentOrganization.id,
          [foreignKey]: entityId,
          storage_bucket: bucket,
          storage_path: storagePath,
          original_filename: file.name,
          mime_type: file.type,
          file_size: file.size,
          document_type: documentType,
          title: title || file.name,
          description,
          uploaded_by: user?.id,
        })
        .select()
        .single();

      if (insertError) {
        // Rollback: delete the uploaded file
        await supabase.storage.from(bucket).remove([storagePath]);
        throw insertError;
      }

      onProgress?.(100);
      return doc;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['documents', variables.entityType, variables.entityId] 
      });
      toast.success('Documento subido correctamente');
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error('Error al subir el documento');
    },
  });
}

// ============================================
// Mutation: Delete document
// ============================================
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      document, 
      entityType, 
      entityId 
    }: { 
      document: Document; 
      entityType: EntityType; 
      entityId: string;
    }) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(document.storage_bucket)
        .remove([document.storage_path]);

      if (storageError) {
        console.warn('Storage delete warning:', storageError);
      }

      // Delete record
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;

      return { entityType, entityId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ 
        queryKey: ['documents', result.entityType, result.entityId] 
      });
      toast.success('Documento eliminado');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error('Error al eliminar el documento');
    },
  });
}

// ============================================
// Download document
// ============================================
export function useDownloadDocument() {
  const [isDownloading, setIsDownloading] = useState(false);

  const download = async (document: Document) => {
    setIsDownloading(true);
    try {
      const { data, error } = await supabase.storage
        .from(document.storage_bucket)
        .download(document.storage_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.original_filename;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Error al descargar el documento');
    } finally {
      setIsDownloading(false);
    }
  };

  return { download, isDownloading };
}

// ============================================
// Get signed URL for preview
// ============================================
export async function getDocumentUrl(document: Document): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(document.storage_bucket)
    .createSignedUrl(document.storage_path, 3600); // 1 hour

  if (error) {
    console.error('Signed URL error:', error);
    return null;
  }

  return data.signedUrl;
}
