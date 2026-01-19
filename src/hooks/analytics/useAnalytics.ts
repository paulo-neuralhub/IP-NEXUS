import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

// =============================================
// REPORT DEFINITIONS
// =============================================

export function useReportDefinitions(options?: { category?: string; isFavorite?: boolean }) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['report-definitions', currentOrganization?.id, options],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      let query = supabase
        .from('report_definitions')
        .select('*')
        .eq('is_active', true)
        .or(`organization_id.eq.${currentOrganization.id},organization_id.is.null`)
        .order('is_favorite', { ascending: false })
        .order('run_count', { ascending: false });
      
      if (options?.category) {
        query = query.eq('category', options.category);
      }
      
      if (options?.isFavorite) {
        query = query.eq('is_favorite', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
    enabled: !!currentOrganization?.id
  });
}

export function useReportDefinition(id: string | undefined) {
  return useQuery({
    queryKey: ['report-definition', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('report_definitions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as any;
    },
    enabled: !!id
  });
}

export function useToggleFavoriteReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const { error } = await supabase
        .from('report_definitions')
        .update({ is_favorite: !isFavorite })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-definitions'] });
    }
  });
}

// =============================================
// REPORT EXECUTIONS
// =============================================

export function useReportExecutions(options?: { reportId?: string; limit?: number }) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['report-executions', currentOrganization?.id, options],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      let query = supabase
        .from('report_executions')
        .select(`
          *,
          report:report_definitions(id, name, slug, icon, category)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false })
        .limit(options?.limit || 20);
      
      if (options?.reportId) {
        query = query.eq('report_id', options.reportId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
    enabled: !!currentOrganization?.id
  });
}

export function useRunReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ reportId, params, format }: { 
      reportId: string; 
      params?: Record<string, unknown>; 
      format?: string 
    }) => {
      const { data, error } = await supabase.functions.invoke('analytics-run-report', {
        body: { reportId, params, format }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-executions'] });
      queryClient.invalidateQueries({ queryKey: ['report-definitions'] });
      toast.success('Reporte generado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al generar reporte: ${error.message}`);
    }
  });
}

// =============================================
// ANALYTICS STATS
// =============================================

export function useAnalyticsStats(days: number = 30) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['analytics-stats', currentOrganization?.id, days],
    queryFn: async () => {
      if (!currentOrganization?.id) return null;
      
      const { data, error } = await supabase.rpc('get_analytics_stats', {
        p_organization_id: currentOrganization.id,
        p_days: days
      });
      
      if (error) throw error;
      return data as Record<string, number>;
    },
    enabled: !!currentOrganization?.id
  });
}

// =============================================
// CHART DATA
// =============================================

export function useAssetsGrouped(groupBy: 'ip_type' | 'status' | 'office_code') {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['assets-grouped', currentOrganization?.id, groupBy],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      const { data, error } = await supabase.rpc('get_assets_grouped', {
        p_organization_id: currentOrganization.id,
        p_group_by: groupBy
      });
      
      if (error) throw error;
      return (data || []) as { label: string; value: number }[];
    },
    enabled: !!currentOrganization?.id
  });
}

// =============================================
// METRICS CACHE
// =============================================

export function useCachedMetric(metricKey: string) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['cached-metric', currentOrganization?.id, metricKey],
    queryFn: async () => {
      if (!currentOrganization?.id) return null;
      
      const { data, error } = await supabase
        .from('metrics_cache')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .eq('metric_key', metricKey)
        .gte('expires_at', new Date().toISOString())
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrganization?.id
  });
}

// =============================================
// SCHEDULED EXPORTS
// =============================================

export function useScheduledExports() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['scheduled-exports', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      const { data, error } = await supabase
        .from('scheduled_exports')
        .select(`
          *,
          report:report_definitions(id, name, slug)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!currentOrganization?.id
  });
}

export function useCreateScheduledExport() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      report_id: string;
      schedule_type: string;
      schedule_config: Json;
      export_format: string;
      recipients: Json;
      fixed_parameters?: Json;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');
      
      const { data: result, error } = await supabase
        .from('scheduled_exports')
        .insert([{
          report_id: data.report_id,
          schedule_type: data.schedule_type,
          schedule_config: data.schedule_config,
          export_format: data.export_format,
          recipients: data.recipients,
          fixed_parameters: data.fixed_parameters || {},
          organization_id: currentOrganization.id,
          created_by: user?.id,
          is_active: true
        }])
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-exports'] });
      toast.success('Exportación programada creada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
}

export function useDeleteScheduledExport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scheduled_exports')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-exports'] });
      toast.success('Exportación programada eliminada');
    }
  });
}
