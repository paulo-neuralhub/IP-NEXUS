import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useToast } from '@/hooks/use-toast';
import { ALLOWED_IMAGE_TYPES, ALLOWED_DOCUMENT_TYPES, MAX_FILE_SIZE } from '@/types/matters';

// ===== VALIDATE FILE =====
export function validateFile(file: File, allowedTypes: string[]): string | null {
  if (!allowedTypes.includes(file.type)) {
    return `Tipo de archivo no permitido. Use: ${allowedTypes.join(', ')}`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `El archivo es demasiado grande. Máximo ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
  }
  return null;
}

// ===== UPLOAD MARK IMAGE =====
export function useUploadMarkImage() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ matterId, file }: { matterId: string; file: File }) => {
      const validationError = validateFile(file, ALLOWED_IMAGE_TYPES);
      if (validationError) throw new Error(validationError);
      
      const orgId = currentOrganization!.id;
      const fileExt = file.name.split('.').pop();
      const filePath = `${orgId}/${matterId}/mark-image.${fileExt}`;
      
      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('matters')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get signed URL (private bucket)
      const { data: signedUrlData, error: signError } = await supabase.storage
        .from('matters')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year
      
      if (signError) throw signError;
      
      // Update matter with the URL
      const { error: updateError } = await supabase
        .from('matters')
        .update({ mark_image_url: signedUrlData.signedUrl })
        .eq('id', matterId);
      
      if (updateError) throw updateError;
      
      return signedUrlData.signedUrl;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matter', variables.matterId] });
      queryClient.invalidateQueries({ queryKey: ['matters'] });
      toast({ title: 'Imagen subida correctamente' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error al subir la imagen', description: error.message, variant: 'destructive' });
    },
  });
}

// ===== DELETE MARK IMAGE =====
export function useDeleteMarkImage() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ matterId }: { matterId: string }) => {
      const orgId = currentOrganization!.id;
      
      // List files in matter folder to find mark-image
      const { data: files } = await supabase.storage
        .from('matters')
        .list(`${orgId}/${matterId}`);
      
      const markImage = files?.find(f => f.name.startsWith('mark-image'));
      if (markImage) {
        await supabase.storage
          .from('matters')
          .remove([`${orgId}/${matterId}/${markImage.name}`]);
      }
      
      // Clear from matter
      const { error: updateError } = await supabase
        .from('matters')
        .update({ mark_image_url: null })
        .eq('id', matterId);
      
      if (updateError) throw updateError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matter', variables.matterId] });
      toast({ title: 'Imagen eliminada' });
    },
    onError: () => {
      toast({ title: 'Error al eliminar la imagen', variant: 'destructive' });
    },
  });
}

// ===== UPLOAD DOCUMENT =====
export function useUploadDocument() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      matterId, 
      file, 
      category, 
      description,
      isOfficial,
      documentDate 
    }: { 
      matterId: string; 
      file: File; 
      category?: string;
      description?: string;
      isOfficial?: boolean;
      documentDate?: string;
    }) => {
      const validationError = validateFile(file, ALLOWED_DOCUMENT_TYPES);
      if (validationError) throw new Error(validationError);
      
      const orgId = currentOrganization!.id;
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${orgId}/${matterId}/documents/${timestamp}-${safeName}`;
      
      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('matters')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Create record in matter_documents
      const { data: doc, error: docError } = await supabase
        .from('matter_documents')
        .insert({
          matter_id: matterId,
          organization_id: orgId,
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          category,
          description,
          is_official: isOfficial,
          document_date: documentDate,
        })
        .select()
        .single();
      
      if (docError) throw docError;
      
      return doc;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matter-documents', variables.matterId] });
      toast({ title: 'Documento subido correctamente' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error al subir el documento', description: error.message, variant: 'destructive' });
    },
  });
}

// ===== DELETE DOCUMENT =====
export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ docId, filePath, matterId }: { docId: string; filePath: string; matterId: string }) => {
      // Delete from Storage
      const { error: storageError } = await supabase.storage
        .from('matters')
        .remove([filePath]);
      
      if (storageError) console.warn('Error removing file from storage:', storageError);
      
      // Delete record
      const { error: dbError } = await supabase
        .from('matter_documents')
        .delete()
        .eq('id', docId);
      
      if (dbError) throw dbError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matter-documents', variables.matterId] });
      toast({ title: 'Documento eliminado' });
    },
    onError: () => {
      toast({ title: 'Error al eliminar el documento', variant: 'destructive' });
    },
  });
}

// ===== DOWNLOAD DOCUMENT =====
export function useDownloadDocument() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ filePath, fileName }: { filePath: string; fileName: string }) => {
      const { data, error } = await supabase.storage
        .from('matters')
        .download(filePath);
      
      if (error) throw error;
      
      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    onError: () => {
      toast({ title: 'Error al descargar el documento', variant: 'destructive' });
    },
  });
}

// ===== UPLOAD GALLERY IMAGE =====
export function useUploadGalleryImage() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ matterId, file }: { matterId: string; file: File }) => {
      const validationError = validateFile(file, ALLOWED_IMAGE_TYPES);
      if (validationError) throw new Error(validationError);
      
      const orgId = currentOrganization!.id;
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const filePath = `${orgId}/${matterId}/images/${timestamp}.${fileExt}`;
      
      // Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('matters')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get signed URL
      const { data: signedUrlData, error: signError } = await supabase.storage
        .from('matters')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365);
      
      if (signError) throw signError;
      
      // Add to images array
      const { data: matter } = await supabase
        .from('matters')
        .select('images')
        .eq('id', matterId)
        .single();
      
      const currentImages = (matter?.images as string[]) || [];
      
      const { error: updateError } = await supabase
        .from('matters')
        .update({ images: [...currentImages, signedUrlData.signedUrl] })
        .eq('id', matterId);
      
      if (updateError) throw updateError;
      
      return signedUrlData.signedUrl;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matter', variables.matterId] });
      toast({ title: 'Imagen añadida a la galería' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error al subir imagen', description: error.message, variant: 'destructive' });
    },
  });
}

// ===== GET SIGNED URL FOR FILE =====
export async function getSignedUrl(filePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('matters')
    .createSignedUrl(filePath, 60 * 60); // 1 hour
  
  if (error) return null;
  return data.signedUrl;
}
