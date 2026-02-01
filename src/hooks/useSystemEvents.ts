import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type SystemEventSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical';

export interface SystemEventFilters {
  search?: string;
  category?: string | null;
  severity?: SystemEventSeverity | null;
  source?: string | null;
  organizationId?: string | null;
  requiresAction?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface SystemEvent {
  id: string;
  event_category: string;
  severity: SystemEventSeverity;
  source: string;
  organization_id: string | null;
  requires_action: boolean;
  action_status: string | null;
  created_at: string;
  organizations?: { name: string } | null;
}

export interface PendingEvent {
  id: string;
  organization_id: string;
  source_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
}

export interface EventStat {
  organization_id: string;
  source_type: string;
  total_events: number;
  processed_events: number;
  pending_events: number;
  last_event_at: string | null;
}

export function useSystemEvents(filters: SystemEventFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['system-events', filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('system_events')
        .select('*, organizations(name)')
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + 49);

      if (filters.search?.trim()) {
        query = query.textSearch('search_vector', filters.search.trim());
      }
      if (filters.category) query = query.eq('event_category', filters.category);
      if (filters.severity) query = query.eq('severity', filters.severity);
      if (filters.source) query = query.eq('source', filters.source);
      if (filters.organizationId) query = query.eq('organization_id', filters.organizationId);
      if (filters.requiresAction) {
        query = query.eq('requires_action', true).in('action_status', ['pending', 'in_progress']);
      }
      if (filters.startDate) query = query.gte('created_at', filters.startDate.toISOString());
      if (filters.endDate) query = query.lte('created_at', filters.endDate.toISOString());

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as SystemEvent[];
    },
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage || lastPage.length < 50) return undefined;
      return pages.length * 50;
    },
    initialPageParam: 0,
  });
}

/**
 * Hook to fetch pending spider events
 * NOTE: spider_events table may not exist in all environments
 * Returns empty array if table doesn't exist
 */
export function usePendingEvents() {
  return useQuery({
    queryKey: ['pending-events'],
    queryFn: async (): Promise<PendingEvent[]> => {
      // spider_events table not in types - return empty array
      // When the table is created and types regenerated, this can query it
      return [];
    },
    refetchInterval: 30_000,
  });
}

/**
 * Hook to get count of pending spider events
 */
export function usePendingEventsCount() {
  return useQuery({
    queryKey: ['pending-events-count'],
    queryFn: async (): Promise<number> => {
      // spider_events table not in types - return 0
      return 0;
    },
    refetchInterval: 30_000,
  });
}

/**
 * Hook to get spider event statistics by organization and source type
 * Returns empty array until spider_events table is created
 */
export function useEventStats() {
  return useQuery({
    queryKey: ['event-stats'],
    queryFn: async (): Promise<EventStat[]> => {
      // spider_events table not in types - return empty array
      return [];
    },
  });
}

export function useResolveEvent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, notes }: { eventId: string; notes?: string }) => {
      const { data, error } = await supabase.rpc('resolve_event', {
        p_event_id: eventId,
        p_resolution_notes: notes ?? null,
      });
      if (error) throw error;
      return data as boolean;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['system-events'] });
      qc.invalidateQueries({ queryKey: ['pending-events'] });
      qc.invalidateQueries({ queryKey: ['pending-events-count'] });
    },
  });
}
