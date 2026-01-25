import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OfficeEvent {
  id: string;
  type: 'status_change' | 'document_download' | 'deadline_created' | 'sync_completed' | 'sync_failed' | 'manual_update' | 'linked' | 'unlinked';
  title: string;
  description?: string;
  previousValue?: string;
  newValue?: string;
  source: 'auto' | 'manual';
  createdAt: string;
  createdBy?: string;
  metadata?: Record<string, unknown>;
}

const OFFICE_ACTION_TYPES: Record<string, { type: OfficeEvent['type']; icon: string }> = {
  'office_status_changed': { type: 'status_change', icon: '🏛️' },
  'office_document_downloaded': { type: 'document_download', icon: '📄' },
  'office_deadline_created': { type: 'deadline_created', icon: '📅' },
  'office_sync_completed': { type: 'sync_completed', icon: '🔄' },
  'office_sync_failed': { type: 'sync_failed', icon: '❌' },
  'office_manual_update': { type: 'manual_update', icon: '✏️' },
  'office_linked': { type: 'linked', icon: '🔗' },
  'office_unlinked': { type: 'unlinked', icon: '🔓' },
};

export function useOfficeHistory(matterId: string, options?: { limit?: number }) {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['office-history', matterId, options?.limit],
    queryFn: async (): Promise<OfficeEvent[]> => {
      let query = supabase
        .from('activity_log')
        .select('*')
        .eq('matter_id', matterId)
        .in('action', Object.keys(OFFICE_ACTION_TYPES))
        .order('created_at', { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(log => {
        const actionInfo = OFFICE_ACTION_TYPES[log.action] || { type: 'sync_completed', icon: '🔄' };
        return {
          id: log.id,
          type: actionInfo.type,
          title: log.title,
          description: log.description || undefined,
          previousValue: log.old_value || undefined,
          newValue: log.new_value || undefined,
          source: log.action.includes('manual') ? 'manual' : 'auto',
          createdAt: log.created_at,
          createdBy: log.created_by || undefined,
          metadata: log.metadata as Record<string, unknown> || undefined,
        };
      });
    },
    enabled: !!matterId,
  });

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const date = new Date(event.createdAt).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, OfficeEvent[]>);

  return {
    events,
    eventsByDate,
    isLoading,
  };
}
