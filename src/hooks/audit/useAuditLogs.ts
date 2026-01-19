// ============================================================
// IP-NEXUS - AUDIT LOGS HOOKS
// ============================================================

import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { AuditLog, AuditLogFilters, ChangeHistoryRecord, AuditStats } from '@/types/audit';

// ==========================================
// AUDIT LOGS
// ==========================================

export function useAuditLogs(filters: AuditLogFilters = {}, limit = 100) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['audit-logs', currentOrganization?.id, filters, limit],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.resourceType) {
        query = query.eq('resource_type', filters.resourceType);
      }
      if (filters.resourceId) {
        query = query.eq('resource_id', filters.resourceId);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      if (filters.search) {
        query = query.or(`description.ilike.%${filters.search}%,action.ilike.%${filters.search}%`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as unknown as AuditLog[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useAuditLog(id: string) {
  return useQuery({
    queryKey: ['audit-log', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as AuditLog;
    },
    enabled: !!id,
  });
}

// ==========================================
// RESOURCE HISTORY
// ==========================================

export function useResourceHistory(resourceType: string, resourceId: string) {
  return useQuery({
    queryKey: ['resource-history', resourceType, resourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as AuditLog[];
    },
    enabled: !!resourceType && !!resourceId,
  });
}

// ==========================================
// CHANGE HISTORY
// ==========================================

export function useChangeHistory(resourceType: string, resourceId: string) {
  return useQuery({
    queryKey: ['change-history', resourceType, resourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('change_history')
        .select('*')
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ChangeHistoryRecord[];
    },
    enabled: !!resourceType && !!resourceId,
  });
}

export function useFieldHistory(resourceType: string, resourceId: string, fieldName: string) {
  return useQuery({
    queryKey: ['field-history', resourceType, resourceId, fieldName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('change_history')
        .select('*')
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .eq('field_name', fieldName)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ChangeHistoryRecord[];
    },
    enabled: !!resourceType && !!resourceId && !!fieldName,
  });
}

// ==========================================
// AUDIT STATS
// ==========================================

export function useAuditStats() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['audit-stats', currentOrganization?.id],
    queryFn: async (): Promise<AuditStats | null> => {
      if (!currentOrganization?.id) return null;

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Total logs
      const { count: totalLogs } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id);

      // Logs today
      const { count: logsToday } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id)
        .gte('created_at', todayStart);

      // Logs this week
      const { count: logsThisWeek } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id)
        .gte('created_at', weekAgo);

      // By action
      const { data: actionData } = await supabase
        .from('audit_logs')
        .select('action')
        .eq('organization_id', currentOrganization.id)
        .gte('created_at', weekAgo);

      const byAction: Record<string, number> = {};
      (actionData || []).forEach((d) => {
        const action = d.action || 'unknown';
        byAction[action] = (byAction[action] || 0) + 1;
      });

      // By resource type
      const { data: resourceData } = await supabase
        .from('audit_logs')
        .select('resource_type')
        .eq('organization_id', currentOrganization.id)
        .gte('created_at', weekAgo);

      const byResourceType: Record<string, number> = {};
      (resourceData || []).forEach((d) => {
        const type = d.resource_type || 'unknown';
        byResourceType[type] = (byResourceType[type] || 0) + 1;
      });

      return {
        total_logs: totalLogs || 0,
        logs_today: logsToday || 0,
        logs_this_week: logsThisWeek || 0,
        by_action: byAction,
        by_resource_type: byResourceType,
      };
    },
    enabled: !!currentOrganization?.id,
  });
}

// ==========================================
// EXPORT AUDIT LOGS
// ==========================================

export function useExportAuditLogs() {
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (filters: AuditLogFilters) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as AuditLog[];
    },
  });
}
