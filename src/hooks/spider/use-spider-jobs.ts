import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';

export interface SpiderJob {
  id: string;
  organization_id: string;
  watchlist_id: string;
  job_type: string;
  status: 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';
  scheduled_at: string;
  started_at: string | null;
  completed_at: string | null;
  progress_percent: number;
  progress_message: string | null;
  connectors_to_run: string[];
  connectors_completed: string[];
  connectors_failed: string[];
  results_found: number;
  results_new: number;
  alerts_created: number;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  watchlist?: {
    id: string;
    name: string;
    type: string;
  };
}

// Obtener jobs recientes
export function useSpiderJobs(watchlistId?: string, limit = 20) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['spider-jobs', currentOrganization?.id, watchlistId, limit],
    queryFn: async (): Promise<SpiderJob[]> => {
      let query = supabase
        .from('spider_jobs')
        .select(`
          *,
          watchlist:watchlists(id, name, type)
        `)
        .eq('organization_id', currentOrganization!.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (watchlistId) {
        query = query.eq('watchlist_id', watchlistId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as SpiderJob[];
    },
    enabled: !!currentOrganization?.id,
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });
}

// Obtener job activo (running)
export function useActiveJob(watchlistId: string) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['spider-active-job', watchlistId],
    queryFn: async (): Promise<SpiderJob | null> => {
      const { data, error } = await supabase
        .from('spider_jobs')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .eq('watchlist_id', watchlistId)
        .in('status', ['pending', 'queued', 'running'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as SpiderJob | null;
    },
    enabled: !!currentOrganization?.id && !!watchlistId,
    refetchInterval: 5000, // Refrescar cada 5 segundos mientras está corriendo
  });
}

// Ejecutar vigilancia manualmente
export function useRunWatchlistNow() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (watchlistId: string) => {
      // Obtener watchlist y conectores
      const { data: watchlist, error: wlError } = await supabase
        .from('watchlists')
        .select('*')
        .eq('id', watchlistId)
        .single();

      if (wlError) throw wlError;

      // Obtener conectores según tipo
      const { data: connectors } = await supabase
        .from('spider_connectors')
        .select('code')
        .eq('is_active', true)
        .in('required_tier', ['basic']); // Por defecto basic

      const connectorCodes = (connectors || []).map(c => c.code);

      // Crear job
      const { data: job, error: jobError } = await supabase
        .from('spider_jobs')
        .insert({
          organization_id: currentOrganization!.id,
          watchlist_id: watchlistId,
          job_type: 'manual',
          status: 'pending',
          scheduled_at: new Date().toISOString(),
          connectors_to_run: connectorCodes,
          timeout_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Actualizar watchlist
      await supabase
        .from('watchlists')
        .update({ last_run_at: new Date().toISOString() })
        .eq('id', watchlistId);

      return job;
    },
    onSuccess: (_, watchlistId) => {
      queryClient.invalidateQueries({ queryKey: ['spider-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['spider-active-job', watchlistId] });
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      toast.success('Vigilancia iniciada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al iniciar vigilancia');
    },
  });
}

// Cancelar job
export function useCancelJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('spider_jobs')
        .update({
          status: 'cancelled',
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId)
        .in('status', ['pending', 'queued', 'running']);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spider-jobs'] });
      toast.success('Vigilancia cancelada');
    },
  });
}

// Estadísticas de jobs
export function useJobStats() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['spider-job-stats', currentOrganization?.id],
    queryFn: async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('spider_jobs')
        .select('status, results_new, alerts_created')
        .eq('organization_id', currentOrganization!.id)
        .gte('created_at', thirtyDaysAgo);

      if (error) throw error;

      const stats = {
        total: data.length,
        completed: data.filter(j => j.status === 'completed').length,
        failed: data.filter(j => j.status === 'failed').length,
        totalResults: data.reduce((sum, j) => sum + (j.results_new || 0), 0),
        totalAlerts: data.reduce((sum, j) => sum + (j.alerts_created || 0), 0),
      };

      return stats;
    },
    enabled: !!currentOrganization?.id,
  });
}
