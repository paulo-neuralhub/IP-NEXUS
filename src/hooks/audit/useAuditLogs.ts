// ============================================================
// IP-NEXUS - AUDIT LOGS HOOKS
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import type {
  AuditLog,
  AuditLogFilters,
  ChangeHistoryRecord,
  AuditStats,
} from '@/types/audit';

// ==========================================
// AUDIT LOGS
// ==========================================

export function useAuditLogs(filters: AuditLogFilters = {}, options?: { limit?: number; offset?: number }) {
  const { currentOrganization } = useOrganization();
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  return useQuery({
    queryKey: ['audit-logs', currentOrganization?.id, filters, limit, offset],
    queryFn: async () => {
      if (!currentOrganization?.id) return { logs: [], total: 0 };

      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .eq('organization_id', currentOrganization.id);

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.resourceType) {
        query = query.eq('resource_type', filters.resourceType);
      }
      if (filters.resourceId) {
        query = query.eq('resource_id', filters.resourceId);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.actionCategory) {
        query = query.eq('action_category', filters.actionCategory);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      if (filters.search) {
        query = query.or(`resource_name.ilike.%${filters.search}%,user_email.ilike.%${filters.search}%`);
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        logs: (data || []) as AuditLog[],
        total: count || 0,
      };
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useAuditLog(logId: string | undefined) {
  return useQuery({
    queryKey: ['audit-log', logId],
    queryFn: async () => {
      if (!logId) return null;

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('id', logId)
        .single();

      if (error) throw error;
      return data as AuditLog;
    },
    enabled: !!logId,
  });
}

// ==========================================
// RESOURCE HISTORY
// ==========================================

export function useResourceHistory(resourceType: string, resourceId: string) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['resource-history', resourceType, resourceId],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AuditLog[];
    },
    enabled: !!currentOrganization?.id && !!resourceType && !!resourceId,
  });
}

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
      return data as ChangeHistoryRecord[];
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
      return data as ChangeHistoryRecord[];
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
    queryFn: async () => {
      if (!currentOrganization?.id) return null;

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Total logs
      const { count: totalLogs } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id);

      // Today's logs
      const { count: logsToday } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id)
        .gte('created_at', todayStart);

      // This week's logs
      const { count: logsThisWeek } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id)
        .gte('created_at', weekAgo);

      // Recent logs for breakdown
      const { data: recentLogs } = await supabase
        .from('audit_logs')
        .select('action, action_category, resource_type')
        .eq('organization_id', currentOrganization.id)
        .gte('created_at', weekAgo);

      const logsByAction: Record<string, number> = {};
      const logsByCategory: Record<string, number> = {};
      const logsByResource: Record<string, number> = {};

      (recentLogs || []).forEach((log) => {
        logsByAction[log.action] = (logsByAction[log.action] || 0) + 1;
        logsByCategory[log.action_category] = (logsByCategory[log.action_category] || 0) + 1;
        logsByResource[log.resource_type] = (logsByResource[log.resource_type] || 0) + 1;
      });

      return {
        total_logs: totalLogs || 0,
        logs_today: logsToday || 0,
        logs_this_week: logsThisWeek || 0,
        logs_by_action: logsByAction,
        logs_by_category: logsByCategory,
        logs_by_resource: logsByResource,
      } as AuditStats;
    },
    enabled: !!currentOrganization?.id,
  });
}

// ==========================================
// EXPORT LOGS
// ==========================================

export function useExportAuditLogs() {
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (filters: AuditLogFilters) => {
      if (!currentOrganization?.id) throw new Error('No organization selected');

      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
      if (filters.dateTo) query = query.lte('created_at', filters.dateTo);
      if (filters.actionCategory) query = query.eq('action_category', filters.actionCategory);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as AuditLog[];
    },
  });
}
