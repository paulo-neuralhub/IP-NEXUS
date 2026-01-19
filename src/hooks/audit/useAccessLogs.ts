// ============================================================
// IP-NEXUS - ACCESS LOGS HOOKS
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { AccessLog, AccessLogFilters, AccessEventType, AccessStats } from '@/types/audit';

// ==========================================
// ACCESS LOGS
// ==========================================

export function useAccessLogs(filters: AccessLogFilters = {}, limit = 100) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['access-logs', currentOrganization?.id, filters, limit],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('access_logs')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
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

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as AccessLog[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useUserAccessLogs(userId: string, limit = 50) {
  return useQuery({
    queryKey: ['user-access-logs', userId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as AccessLog[];
    },
    enabled: !!userId,
  });
}

// ==========================================
// FAILED LOGINS
// ==========================================

export function useFailedLogins(options?: { limit?: number; since?: string }) {
  const { currentOrganization } = useOrganization();
  const limit = options?.limit ?? 100;

  return useQuery({
    queryKey: ['failed-logins', currentOrganization?.id, options],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('access_logs')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .eq('status', 'failure');

      if (options?.since) {
        query = query.gte('created_at', options.since);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as AccessLog[];
    },
    enabled: !!currentOrganization?.id,
  });
}

// ==========================================
// ACCESS STATS
// ==========================================

export function useAccessStats() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['access-stats', currentOrganization?.id],
    queryFn: async (): Promise<AccessStats | null> => {
      if (!currentOrganization?.id) return null;

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Total logins today
      const { count: loginsToday } = await supabase
        .from('access_logs')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id)
        .eq('event_type', 'login_success')
        .gte('created_at', todayStart);

      // Failed logins today
      const { count: failedToday } = await supabase
        .from('access_logs')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id)
        .eq('status', 'failure')
        .gte('created_at', todayStart);

      // Unique users this week
      const { data: uniqueUsersData } = await supabase
        .from('access_logs')
        .select('user_id')
        .eq('organization_id', currentOrganization.id)
        .eq('event_type', 'login_success')
        .gte('created_at', weekAgo);

      const uniqueUsers = new Set((uniqueUsersData || []).map(d => d.user_id)).size;

      // Logins by auth method
      const { data: authMethodData } = await supabase
        .from('access_logs')
        .select('auth_method')
        .eq('organization_id', currentOrganization.id)
        .eq('event_type', 'login_success')
        .gte('created_at', weekAgo);

      const byAuthMethod: Record<string, number> = {};
      (authMethodData || []).forEach((d) => {
        const method = d.auth_method || 'unknown';
        byAuthMethod[method] = (byAuthMethod[method] || 0) + 1;
      });

      return {
        logins_today: loginsToday || 0,
        failed_today: failedToday || 0,
        unique_users_this_week: uniqueUsers,
        by_auth_method: byAuthMethod,
      };
    },
    enabled: !!currentOrganization?.id,
  });
}

// ==========================================
// LOG ACCESS EVENT
// ==========================================

export function useLogAccessEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: {
      user_email: string;
      event_type: AccessEventType;
      status: 'success' | 'failure';
      auth_method?: string;
      failure_reason?: string;
      ip_address?: string;
      user_agent?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('access_logs')
        .insert({
          user_id: user?.id,
          user_email: event.user_email,
          event_type: event.event_type,
          status: event.status,
          auth_method: event.auth_method,
          failure_reason: event.failure_reason,
          ip_address: event.ip_address,
          user_agent: event.user_agent || navigator.userAgent,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-logs'] });
    },
  });
}
