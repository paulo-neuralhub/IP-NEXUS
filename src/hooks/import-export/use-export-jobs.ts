import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { ExportJob, EntityType, TargetFormat, ExportColumn, FormatOptions, ExportJobStatus } from '@/types/import-export';

export function useExportJobs(status?: ExportJobStatus) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['export-jobs', currentOrganization?.id, status],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = (supabase as any)
        .from('export_jobs')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ExportJob[];
    },
    enabled: !!currentOrganization?.id
  });
}

export function useExportJob(id: string) {
  return useQuery({
    queryKey: ['export-job', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('export_jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ExportJob;
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const job = query.state.data as ExportJob | undefined;
      if (job && ['pending', 'processing'].includes(job.status)) {
        return 2000;
      }
      return false;
    }
  });
}

export function useCreateExportJob() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: {
      template_id?: string;
      entity_type: EntityType;
      target_format: TargetFormat;
      columns: ExportColumn[];
      filters?: Record<string, any>;
      sort?: { field: string; direction: 'asc' | 'desc' };
      format_options?: FormatOptions;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data: user } = await supabase.auth.getUser();

      const { data: result, error } = await (supabase as any)
        .from('export_jobs')
        .insert({
          organization_id: currentOrganization.id,
          template_id: data.template_id,
          entity_type: data.entity_type,
          target_format: data.target_format,
          columns: data.columns,
          filters: data.filters || {},
          sort: data.sort,
          format_options: data.format_options || {},
          created_by: user.user?.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return result as ExportJob;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export-jobs'] });
      toast.success('Exportación iniciada');
    },
    onError: (error: any) => {
      toast.error('Error al crear exportación: ' + error.message);
    }
  });
}

export function useDownloadExport() {
  return useMutation({
    mutationFn: async (job: ExportJob) => {
      if (!job.file_url) throw new Error('No hay archivo disponible');

      const response = await fetch(job.file_url);
      if (!response.ok) throw new Error('Error al descargar archivo');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = job.file_name || `export.${job.target_format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast.success('Archivo descargado');
    },
    onError: (error: any) => {
      toast.error('Error al descargar: ' + error.message);
    }
  });
}
