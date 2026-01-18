import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { OCRResult } from '@/types/advanced';

export function useOCRResults(documentId?: string) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['ocr-results', currentOrganization?.id, documentId],
    queryFn: async () => {
      let query = supabase
        .from('ocr_results')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .order('created_at', { ascending: false });
      
      if (documentId) query = query.eq('document_id', documentId);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as OCRResult[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useOCRResult(id: string) {
  return useQuery({
    queryKey: ['ocr-result', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ocr_results')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as unknown as OCRResult;
    },
    enabled: !!id,
  });
}

export function useProcessOCR() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: {
      file?: File;
      fileUrl?: string;
      documentId?: string;
    }) => {
      let fileUrl = data.fileUrl;
      
      // Subir archivo si se proporciona
      if (data.file) {
        const filePath = `ocr/${currentOrganization!.id}/${Date.now()}_${data.file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, data.file);
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);
        
        fileUrl = urlData.publicUrl;
      }
      
      // Crear registro
      const { data: ocrResult, error } = await supabase
        .from('ocr_results')
        .insert({
          organization_id: currentOrganization!.id,
          document_id: data.documentId,
          file_url: fileUrl,
          file_name: data.file?.name,
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Procesar OCR
      await supabase.functions.invoke('process-ocr', {
        body: { ocr_id: ocrResult.id },
      });
      
      return ocrResult as unknown as OCRResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocr-results'] });
    },
  });
}

export function useDeleteOCRResult() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ocr_results')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ocr-results'] });
    },
  });
}
