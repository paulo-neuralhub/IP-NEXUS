import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { PredictiveAlert, AlertConfiguration, AlertStatus, AlertSeverity, AlertType } from '@/types/predictive-alerts';

// ============= Alerts Queries =============

export function usePredictiveAlerts(filters?: {
  status?: AlertStatus | 'all';
  severity?: AlertSeverity | 'all';
  type?: AlertType | 'all';
  limit?: number;
}) {
  const { currentOrganization } = useOrganization();
  const { status = 'active', severity = 'all', type = 'all', limit = 50 } = filters || {};

  return useQuery({
    queryKey: ['predictive-alerts', currentOrganization?.id, status, severity, type],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('predictive_alerts')
        .select(`
          *,
          matter:matters(id, reference, title),
          contact:contacts(id, name)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (status !== 'all') query = query.eq('status', status);
      if (severity !== 'all') query = query.eq('severity', severity);
      if (type !== 'all') query = query.eq('alert_type', type);

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform contact name to full_name for interface compatibility
      return (data || []).map(alert => ({
        ...alert,
        contact: alert.contact ? { 
          id: (alert.contact as any).id, 
          full_name: (alert.contact as any).name 
        } : null
      })) as PredictiveAlert[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useAlertStats() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['alert-stats', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return { total: 0, critical: 0, high: 0, medium: 0, low: 0 };

      const { data, error } = await supabase
        .from('predictive_alerts')
        .select('severity')
        .eq('organization_id', currentOrganization.id)
        .eq('status', 'active');

      if (error) throw error;

      return {
        total: data?.length || 0,
        critical: data?.filter(a => a.severity === 'critical').length || 0,
        high: data?.filter(a => a.severity === 'high').length || 0,
        medium: data?.filter(a => a.severity === 'medium').length || 0,
        low: data?.filter(a => a.severity === 'low').length || 0,
      };
    },
    enabled: !!currentOrganization?.id,
  });
}

// ============= Alerts Mutations =============

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('predictive_alerts')
        .update({
          status: 'acknowledged',
          acknowledged_by: user?.id,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictive-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-alerts'] });
    },
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ alertId, notes }: { alertId: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('predictive_alerts')
        .update({
          status: 'resolved',
          resolved_by: user?.id,
          resolved_at: new Date().toISOString(),
          resolution_notes: notes,
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictive-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-alerts'] });
    },
  });
}

export function useDismissAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('predictive_alerts')
        .update({ status: 'dismissed' })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictive-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-alerts'] });
    },
  });
}

export function useAlertFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ alertId, wasUseful, notes }: { alertId: string; wasUseful: boolean; notes?: string }) => {
      const { error } = await supabase
        .from('predictive_alerts')
        .update({
          was_useful: wasUseful,
          feedback_notes: notes,
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictive-alerts'] });
    },
  });
}

// ============= Configuration Queries =============

export function useAlertConfigurations() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['alert-configurations', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('alert_configurations')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;
      return data as AlertConfiguration[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useUpdateAlertConfiguration() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (config: Partial<AlertConfiguration> & { alert_type: string }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { error } = await supabase
        .from('alert_configurations')
        .upsert({
          ...config,
          organization_id: currentOrganization.id,
        }, {
          onConflict: 'organization_id,alert_type',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-configurations'] });
    },
  });
}

// ============= Run Analysis =============

export function useRunPredictiveAnalysis() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data, error } = await supabase.functions.invoke('run-predictive-analysis', {
        body: { organizationId: currentOrganization.id },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictive-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-alerts'] });
    },
  });
}

// Dashboard widget hook
export function useDashboardAlerts(limit = 5) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['dashboard-alerts', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('predictive_alerts')
        .select('id, title, severity, alert_type, created_at')
        .eq('organization_id', currentOrganization.id)
        .eq('status', 'active')
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    enabled: !!currentOrganization?.id,
  });
}
