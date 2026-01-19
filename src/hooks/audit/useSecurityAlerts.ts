// ============================================================
// IP-NEXUS - SECURITY ALERTS HOOKS
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import type { 
  SecurityAlert, 
  SecurityAlertStatus, 
  SecurityAlertSeverity,
  SecurityStats 
} from '@/types/audit';

// ==========================================
// SECURITY ALERTS
// ==========================================

export function useSecurityAlerts(options?: {
  status?: SecurityAlertStatus | SecurityAlertStatus[];
  severity?: SecurityAlertSeverity;
  limit?: number;
}) {
  const { currentOrganization } = useOrganization();
  const limit = options?.limit ?? 100;

  return useQuery({
    queryKey: ['security-alerts', currentOrganization?.id, options],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('security_alerts')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      if (options?.status) {
        if (Array.isArray(options.status)) {
          query = query.in('status', options.status);
        } else {
          query = query.eq('status', options.status);
        }
      }

      if (options?.severity) {
        query = query.eq('severity', options.severity);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as SecurityAlert[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useSecurityAlert(alertId: string | undefined) {
  return useQuery({
    queryKey: ['security-alert', alertId],
    queryFn: async () => {
      if (!alertId) return null;

      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('id', alertId)
        .single();

      if (error) throw error;
      return data as SecurityAlert;
    },
    enabled: !!alertId,
  });
}

export function useOpenAlerts() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['open-security-alerts', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .in('status', ['open', 'investigating', 'escalated'])
        .order('severity', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SecurityAlert[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useCriticalAlerts() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['critical-security-alerts', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .in('severity', ['critical', 'high'])
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SecurityAlert[];
    },
    enabled: !!currentOrganization?.id,
  });
}

// ==========================================
// MUTATIONS
// ==========================================

export function useCreateSecurityAlert() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (alert: {
      alert_type: string;
      severity: SecurityAlertSeverity;
      title: string;
      description?: string;
      user_id?: string;
      evidence?: Record<string, unknown>;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization selected');

      const { data, error } = await supabase
        .from('security_alerts')
        .insert({
          organization_id: currentOrganization.id,
          alert_type: alert.alert_type,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          user_id: alert.user_id,
          evidence: alert.evidence || {},
        })
        .select()
        .single();

      if (error) throw error;
      return data as SecurityAlert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['open-security-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['critical-security-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['security-stats'] });
    },
  });
}

export function useUpdateSecurityAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<SecurityAlert> & { id: string }) => {
      const { data, error } = await supabase
        .from('security_alerts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as SecurityAlert;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['security-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['security-alert', data.id] });
      queryClient.invalidateQueries({ queryKey: ['open-security-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['critical-security-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['security-stats'] });
    },
  });
}

export function useResolveSecurityAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      alertId,
      status,
      notes,
    }: {
      alertId: string;
      status: 'resolved' | 'false_positive';
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('security_alerts')
        .update({
          status,
          resolved_by: user?.id,
          resolved_at: new Date().toISOString(),
          resolution_notes: notes,
        })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;
      return data as SecurityAlert;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['security-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['security-alert', data.id] });
      queryClient.invalidateQueries({ queryKey: ['open-security-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['security-stats'] });
    },
  });
}

export function useEscalateSecurityAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      alertId,
      notes,
    }: {
      alertId: string;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      // Get current alert to append action
      const { data: currentAlert } = await supabase
        .from('security_alerts')
        .select('actions_taken')
        .eq('id', alertId)
        .single();

      const actionsTaken = [...(currentAlert?.actions_taken || []), {
        action: 'escalated',
        timestamp: new Date().toISOString(),
        by: user?.id,
        notes,
      }];

      const { data, error } = await supabase
        .from('security_alerts')
        .update({
          status: 'escalated',
          actions_taken: actionsTaken,
        })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;
      return data as SecurityAlert;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['security-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['security-alert', data.id] });
    },
  });
}

// ==========================================
// SECURITY STATS
// ==========================================

export function useSecurityStats() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['security-stats', currentOrganization?.id],
    queryFn: async (): Promise<SecurityStats> => {
      if (!currentOrganization?.id) {
        return {
          total_alerts: 0,
          open_alerts: 0,
          critical_alerts: 0,
          high_alerts: 0,
          resolved_today: 0,
          avg_resolution_time_hours: 0,
        };
      }

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // Total alerts
      const { count: totalAlerts } = await supabase
        .from('security_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id);

      // Open alerts
      const { count: openAlerts } = await supabase
        .from('security_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id)
        .eq('status', 'open');

      // Critical alerts
      const { count: criticalAlerts } = await supabase
        .from('security_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id)
        .eq('severity', 'critical')
        .eq('status', 'open');

      // High alerts
      const { count: highAlerts } = await supabase
        .from('security_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id)
        .eq('severity', 'high')
        .eq('status', 'open');

      // Resolved today
      const { count: resolvedToday } = await supabase
        .from('security_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id)
        .eq('status', 'resolved')
        .gte('resolved_at', todayStart.toISOString());

      // Average resolution time
      const { data: resolvedAlerts } = await supabase
        .from('security_alerts')
        .select('created_at, resolved_at')
        .eq('organization_id', currentOrganization.id)
        .eq('status', 'resolved')
        .not('resolved_at', 'is', null)
        .limit(100);

      let avgResolutionTime = 0;
      if (resolvedAlerts && resolvedAlerts.length > 0) {
        const totalHours = resolvedAlerts.reduce((sum, alert) => {
          const created = new Date(alert.created_at).getTime();
          const resolved = new Date(alert.resolved_at!).getTime();
          return sum + (resolved - created) / (1000 * 60 * 60);
        }, 0);
        avgResolutionTime = totalHours / resolvedAlerts.length;
      }

      return {
        total_alerts: totalAlerts || 0,
        open_alerts: openAlerts || 0,
        critical_alerts: criticalAlerts || 0,
        high_alerts: highAlerts || 0,
        resolved_today: resolvedToday || 0,
        avg_resolution_time_hours: Math.round(avgResolutionTime * 10) / 10,
      };
    },
    enabled: !!currentOrganization?.id,
  });
}
