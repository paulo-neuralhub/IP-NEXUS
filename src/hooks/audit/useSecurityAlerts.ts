// ============================================================
// IP-NEXUS - SECURITY ALERTS HOOKS
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { SecurityAlert, SecurityStats, SecurityAlertType, SecuritySeverity, SecurityAlertStatus } from '@/types/audit';
import type { Json } from '@/integrations/supabase/types';

// ==========================================
// SECURITY ALERTS
// ==========================================

export function useSecurityAlerts(filters?: { 
  status?: string; 
  severity?: string;
  type?: string;
}) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['security-alerts', currentOrganization?.id, filters],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('security_alerts')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters?.type) {
        query = query.eq('alert_type', filters.type);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as SecurityAlert[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useSecurityAlert(id: string) {
  return useQuery({
    queryKey: ['security-alert', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as SecurityAlert;
    },
    enabled: !!id,
  });
}

// ==========================================
// OPEN & CRITICAL ALERTS
// ==========================================

export function useOpenAlerts() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['open-alerts', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .in('status', ['open', 'investigating'])
        .order('severity', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as SecurityAlert[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useCriticalAlerts() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['critical-alerts', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .eq('severity', 'critical')
        .in('status', ['open', 'investigating'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as SecurityAlert[];
    },
    enabled: !!currentOrganization?.id,
  });
}

// ==========================================
// CREATE SECURITY ALERT
// ==========================================

export function useCreateSecurityAlert() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (alert: {
      alert_type: SecurityAlertType;
      severity: SecuritySeverity;
      title: string;
      description?: string;
      source?: string;
      source_ip?: string;
      user_id?: string;
      resource_type?: string;
      resource_id?: string;
      evidence?: Record<string, unknown>;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data, error } = await supabase
        .from('security_alerts')
        .insert({
          organization_id: currentOrganization.id,
          alert_type: alert.alert_type,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          source: alert.source,
          source_ip: alert.source_ip,
          user_id: alert.user_id,
          resource_type: alert.resource_type,
          resource_id: alert.resource_id,
          evidence: (alert.evidence || null) as Json,
        })
        .select()
        .single();

      if (error) throw error;
      return data as SecurityAlert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['open-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['critical-alerts'] });
    },
  });
}

// ==========================================
// UPDATE SECURITY ALERT
// ==========================================

export function useUpdateSecurityAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Omit<SecurityAlert, 'id' | 'organization_id' | 'created_at'>>) => {
      const { data, error } = await supabase
        .from('security_alerts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as SecurityAlert;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['security-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['security-alert', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['open-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['critical-alerts'] });
    },
  });
}

// ==========================================
// RESOLVE SECURITY ALERT
// ==========================================

export function useResolveSecurityAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      notes 
    }: { 
      id: string; 
      status: 'resolved' | 'false_positive'; 
      notes?: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      const { data, error } = await supabase
        .from('security_alerts')
        .update({
          status,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
          resolution_notes: notes,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as SecurityAlert;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['security-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['security-alert', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['open-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['critical-alerts'] });
    },
  });
}

// ==========================================
// ESCALATE SECURITY ALERT
// ==========================================

export function useEscalateSecurityAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      newSeverity 
    }: { 
      id: string; 
      newSeverity: SecuritySeverity;
    }) => {
      const { data, error } = await supabase
        .from('security_alerts')
        .update({
          severity: newSeverity,
          status: 'investigating',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as SecurityAlert;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['security-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['security-alert', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['open-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['critical-alerts'] });
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
    queryFn: async (): Promise<SecurityStats | null> => {
      if (!currentOrganization?.id) return null;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // Total alerts
      const { count: total } = await supabase
        .from('security_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id);

      // Open alerts
      const { count: open } = await supabase
        .from('security_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id)
        .in('status', ['open', 'investigating']);

      // Critical alerts
      const { count: critical } = await supabase
        .from('security_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id)
        .eq('severity', 'critical')
        .in('status', ['open', 'investigating']);

      // Resolved today
      const { count: resolvedToday } = await supabase
        .from('security_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id)
        .eq('status', 'resolved')
        .gte('resolved_at', todayStart.toISOString());

      // By type
      const { data: typeData } = await supabase
        .from('security_alerts')
        .select('alert_type')
        .eq('organization_id', currentOrganization.id);

      const byType: Record<string, number> = {};
      (typeData || []).forEach((d) => {
        const type = d.alert_type || 'unknown';
        byType[type] = (byType[type] || 0) + 1;
      });

      // By severity
      const { data: severityData } = await supabase
        .from('security_alerts')
        .select('severity')
        .eq('organization_id', currentOrganization.id);

      const bySeverity: Record<string, number> = {};
      (severityData || []).forEach((d) => {
        const severity = d.severity || 'unknown';
        bySeverity[severity] = (bySeverity[severity] || 0) + 1;
      });

      return {
        total_alerts: total || 0,
        open_alerts: open || 0,
        critical_alerts: critical || 0,
        resolved_today: resolvedToday || 0,
        by_type: byType,
        by_severity: bySeverity,
      };
    },
    enabled: !!currentOrganization?.id,
  });
}
