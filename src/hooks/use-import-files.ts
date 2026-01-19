import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { ImportFile, FieldMapping } from '@/types/universal-import';

export function useImportFiles(jobId?: string) {
  const { currentOrganization } = useOrganization();

  const { data: files = [], isLoading, error, refetch } = useQuery({
    queryKey: ['import-files', currentOrganization?.id, jobId],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('import_files')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('uploaded_at', { ascending: false });

      if (jobId) {
        query = query.eq('job_id', jobId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as ImportFile[];
    },
    enabled: !!currentOrganization?.id
  });

  return {
    files,
    isLoading,
    error,
    refetch,
    pendingFiles: files.filter((f: ImportFile) => f.analysis_status === 'pending'),
    analyzedFiles: files.filter((f: ImportFile) => f.analysis_status === 'completed'),
    processedFiles: files.filter((f: ImportFile) => f.processing_status === 'completed')
  };
}

export function useImportFile(id: string) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['import-file', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('import_files')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as ImportFile;
    },
    enabled: !!id && !!currentOrganization?.id,
    refetchInterval: (query) => {
      const data = query.state.data as ImportFile | undefined;
      return data?.analysis_status === 'analyzing' || data?.processing_status === 'processing' 
        ? 2000 
        : false;
    }
  });
}

export function useUploadImportFile() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async ({ file, jobId }: { file: File; jobId?: string }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      // Upload file to storage
      const filename = `${Date.now()}-${file.name}`;
      const storagePath = `imports/${currentOrganization.id}/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from('import-files')
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      // Create file record
      const { data, error } = await supabase
        .from('import_files')
        .insert({
          organization_id: currentOrganization.id,
          job_id: jobId,
          filename,
          original_filename: file.name,
          file_size: file.size,
          mime_type: file.type,
          storage_path: storagePath,
          analysis_status: 'pending',
          processing_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as ImportFile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-files'] });
      toast.success('Archivo subido correctamente');
    },
    onError: (error) => {
      toast.error('Error al subir archivo: ' + error.message);
    }
  });
}

export function useAnalyzeImportFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Update status to analyzing
      await supabase
        .from('import_files')
        .update({ analysis_status: 'analyzing' })
        .eq('id', id);

      // Call edge function to analyze
      const { data, error } = await supabase.functions.invoke('analyze-import-file', {
        body: { file_id: id }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['import-files'] });
      queryClient.invalidateQueries({ queryKey: ['import-file', id] });
      toast.success('Análisis completado');
    },
    onError: (error) => {
      toast.error('Error al analizar: ' + error.message);
    }
  });
}

export function useUpdateFileMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, mapping, confirmed }: { 
      id: string; 
      mapping: Record<string, FieldMapping>; 
      confirmed?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('import_files')
        .update({
          field_mapping: mapping as any,
          mapping_confirmed: confirmed ?? false
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as ImportFile;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['import-files'] });
      queryClient.invalidateQueries({ queryKey: ['import-file', variables.id] });
      toast.success('Mapeo guardado');
    },
    onError: (error) => {
      toast.error('Error al guardar mapeo: ' + error.message);
    }
  });
}

export function useProcessImportFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Update status to processing
      await supabase
        .from('import_files')
        .update({ processing_status: 'processing' })
        .eq('id', id);

      // Call edge function to process
      const { data, error } = await supabase.functions.invoke('process-import-file', {
        body: { file_id: id }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['import-files'] });
      queryClient.invalidateQueries({ queryKey: ['import-file', id] });
      toast.success('Procesamiento completado');
    },
    onError: (error) => {
      toast.error('Error al procesar: ' + error.message);
    }
  });
}

export function useDeleteImportFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Get file info first
      const { data: file } = await supabase
        .from('import_files')
        .select('storage_path')
        .eq('id', id)
        .single();

      // Delete from storage
      if (file?.storage_path) {
        await supabase.storage
          .from('import-files')
          .remove([file.storage_path]);
      }

      // Delete record
      const { error } = await supabase
        .from('import_files')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-files'] });
      toast.success('Archivo eliminado');
    },
    onError: (error) => {
      toast.error('Error al eliminar: ' + error.message);
    }
  });
}
