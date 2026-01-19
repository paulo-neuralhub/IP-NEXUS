import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { ImportJobV2, EntityType, SourceFormat, ImportConfig, FieldMapping, ImportJobStatus } from '@/types/import-export';

export function useImportJobsV2(status?: ImportJobStatus) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['import-jobs-v2', currentOrganization?.id, status],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = (supabase as any)
        .from('import_jobs_v2')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ImportJobV2[];
    },
    enabled: !!currentOrganization?.id
  });
}

export function useImportJobV2(id: string) {
  return useQuery({
    queryKey: ['import-job-v2', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('import_jobs_v2')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ImportJobV2;
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const job = query.state.data as ImportJobV2 | undefined;
      if (job && ['pending', 'validating', 'importing'].includes(job.status)) {
        return 2000;
      }
      return false;
    }
  });
}

export function useCreateImportJobV2() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: {
      template_id?: string;
      source_file_name: string;
      source_file_url: string;
      source_file_size?: number;
      source_format: SourceFormat;
      entity_type: EntityType;
      config: ImportConfig;
      field_mappings: FieldMapping[];
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('No user');

      const { data: result, error } = await (supabase as any)
        .from('import_jobs_v2')
        .insert({
          organization_id: currentOrganization.id,
          template_id: data.template_id,
          source_file_name: data.source_file_name,
          source_file_url: data.source_file_url,
          source_file_size: data.source_file_size,
          source_format: data.source_format,
          entity_type: data.entity_type,
          config: data.config,
          field_mappings: data.field_mappings,
          created_by: user.user.id
        })
        .select()
        .single();

      if (error) throw error;
      return result as ImportJobV2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-jobs-v2'] });
      toast.success('Job de importación creado');
    },
    onError: (error: any) => {
      toast.error('Error al crear job: ' + error.message);
    }
  });
}

export function useUpdateImportJobV2() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<ImportJobV2> & { id: string }) => {
      const { data: result, error } = await (supabase as any)
        .from('import_jobs_v2')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as ImportJobV2;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['import-jobs-v2'] });
      queryClient.invalidateQueries({ queryKey: ['import-job-v2', variables.id] });
    },
    onError: (error: any) => {
      toast.error('Error al actualizar: ' + error.message);
    }
  });
}

export function useRollbackImportJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data: job } = await (supabase as any)
        .from('import_jobs_v2')
        .select('*')
        .eq('id', jobId)
        .single();

      if (!job) throw new Error('Job no encontrado');
      if (!job.can_rollback) throw new Error('Rollback no disponible');

      const { data: records } = await (supabase as any)
        .from('import_records')
        .select('*')
        .eq('import_job_id', jobId);

      let deleted = 0;

      for (const record of records || []) {
        if (record.action === 'created') {
          const table = record.entity_type === 'asset' ? 'matters' : 
                       record.entity_type === 'contact' ? 'contacts' : 
                       record.entity_type === 'deadline' ? 'docket_entries' : 
                       record.entity_type === 'cost' ? 'costs' : null;
          
          if (table) {
            await (supabase as any).from(table).delete().eq('id', record.entity_id);
            deleted++;
          }
        }
      }

      await (supabase as any)
        .from('import_jobs_v2')
        .update({ status: 'rolled_back', can_rollback: false })
        .eq('id', jobId);

      return { deleted };
    },
    onSuccess: (data, jobId) => {
      queryClient.invalidateQueries({ queryKey: ['import-jobs-v2'] });
      queryClient.invalidateQueries({ queryKey: ['import-job-v2', jobId] });
      toast.success(`Rollback completado: ${data.deleted} registros eliminados`);
    },
    onError: (error: any) => {
      toast.error('Error en rollback: ' + error.message);
    }
  });
}
