import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { ImportJob, JobType, JobConfig, JobStatus } from '@/types/universal-import';

export function useImportJobs(options?: { sourceId?: string; status?: JobStatus | JobStatus[] }) {
  const { currentOrganization } = useOrganization();

  const { data: jobs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['import-jobs', currentOrganization?.id, options?.sourceId, options?.status],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('import_jobs')
        .select(`
          *,
          source:import_sources(id, name, source_type, detected_system)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (options?.sourceId) {
        query = query.eq('source_id', options.sourceId);
      }

      if (options?.status) {
        if (Array.isArray(options.status)) {
          query = query.in('status', options.status);
        } else {
          query = query.eq('status', options.status);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as ImportJob[];
    },
    enabled: !!currentOrganization?.id,
    refetchInterval: (query) => {
      const data = query.state.data as ImportJob[] | undefined;
      const hasRunningJobs = data?.some((j: ImportJob) => ['running', 'queued'].includes(j.status));
      return hasRunningJobs ? 3000 : false;
    }
  });

  const activeJobs = jobs.filter((j: ImportJob) => ['running', 'queued', 'paused'].includes(j.status));
  const completedJobs = jobs.filter((j: ImportJob) => ['completed', 'completed_with_errors'].includes(j.status));
  const failedJobs = jobs.filter((j: ImportJob) => j.status === 'failed');

  return {
    jobs,
    activeJobs,
    completedJobs,
    failedJobs,
    isLoading,
    error,
    refetch
  };
}

export function useImportJob(id: string) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['import-job', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('import_jobs')
        .select(`
          *,
          source:import_sources(id, name, source_type, detected_system, config)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as ImportJob;
    },
    enabled: !!id && !!currentOrganization?.id,
    refetchInterval: (query) => {
      const data = query.state.data as ImportJob | undefined;
      return data?.status === 'running' ? 2000 : false;
    }
  });
}

export function useCreateImportJob() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: {
      source_id?: string;
      job_type: JobType;
      config: JobConfig;
      source_files?: any[];
      scheduled_at?: string;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data: result, error } = await supabase
        .from('import_jobs')
        .insert({
          organization_id: currentOrganization.id,
          source_id: data.source_id,
          job_type: data.job_type,
          config: data.config as any,
          source_files: data.source_files || [],
          scheduled_at: data.scheduled_at,
          status: data.scheduled_at ? 'queued' : 'pending',
          progress: {
            phase: 'extracting',
            processed: 0,
            total: 0,
            percentage: 0,
            current_batch: 0,
            total_batches: 0
          }
        })
        .select()
        .single();

      if (error) throw error;
      return result as unknown as ImportJob;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-jobs'] });
      toast.success('Job de importación creado');
    },
    onError: (error) => {
      toast.error('Error al crear job: ' + error.message);
    }
  });
}

export function useStartImportJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Update status to running
      await supabase
        .from('import_jobs')
        .update({ 
          status: 'running',
          started_at: new Date().toISOString()
        })
        .eq('id', id);

      // Call edge function to execute import
      const { data, error } = await supabase.functions.invoke('execute-import-job', {
        body: { job_id: id }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['import-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['import-job', id] });
      toast.success('Importación iniciada');
    },
    onError: (error) => {
      toast.error('Error al iniciar importación: ' + error.message);
    }
  });
}

export function usePauseImportJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('import_jobs')
        .update({ status: 'paused' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['import-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['import-job', id] });
      toast.success('Importación pausada');
    },
    onError: (error) => {
      toast.error('Error al pausar: ' + error.message);
    }
  });
}

export function useResumeImportJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('import_jobs')
        .update({ status: 'running' })
        .eq('id', id);

      if (error) throw error;

      // Call edge function to resume
      await supabase.functions.invoke('execute-import-job', {
        body: { job_id: id, resume: true }
      });
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['import-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['import-job', id] });
      toast.success('Importación reanudada');
    },
    onError: (error) => {
      toast.error('Error al reanudar: ' + error.message);
    }
  });
}

export function useCancelImportJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('import_jobs')
        .update({ 
          status: 'cancelled',
          completed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['import-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['import-job', id] });
      toast.success('Importación cancelada');
    },
    onError: (error) => {
      toast.error('Error al cancelar: ' + error.message);
    }
  });
}

export function useRollbackImportJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Call edge function to rollback
      const { data, error } = await supabase.functions.invoke('rollback-import-job', {
        body: { job_id: id }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['import-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['import-job', id] });
      toast.success('Rollback completado');
    },
    onError: (error) => {
      toast.error('Error en rollback: ' + error.message);
    }
  });
}

export function useDeleteImportJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('import_jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-jobs'] });
      toast.success('Job eliminado');
    },
    onError: (error) => {
      toast.error('Error al eliminar: ' + error.message);
    }
  });
}
