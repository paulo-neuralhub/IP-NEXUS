import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/organization-context";
import { toast } from "sonner";

export interface SyncHistoryItem {
  id: string;
  sync_type: 'scheduled' | 'manual' | 'webhook';
  triggered_by?: string;
  status: 'running' | 'completed' | 'partial' | 'failed';
  matters_checked: number;
  matters_updated: number;
  documents_downloaded: number;
  deadlines_created: number;
  errors_count: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  duration_seconds?: number;
  office_results?: OfficeResult[];
}

export interface OfficeResult {
  office_code: string;
  office_name: string;
  matters_checked: number;
  matters_updated: number;
  documents_downloaded: number;
  deadlines_created: number;
  errors: string[];
  changes: ChangeDetail[];
}

export interface ChangeDetail {
  matter_ref: string;
  matter_id: string;
  field: string;
  old_value: string;
  new_value: string;
}

export interface SyncResult {
  success: boolean;
  sync_id?: string;
  summary?: {
    matters_checked: number;
    matters_updated: number;
    documents_downloaded: number;
    deadlines_created: number;
    errors_count: number;
  };
  error?: string;
}

export function useSyncHistory(filters?: { period?: string }) {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();

  // Get sync history
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['sync-history', currentOrganization?.id, filters?.period],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = (supabase as any)
        .from('sync_history')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false })
        .limit(50);

      // Apply period filter
      if (filters?.period) {
        const now = new Date();
        let startDate: Date;
        
        switch (filters.period) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            startDate = new Date(now.setDate(now.getDate() - 7));
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(item => ({
        ...item,
        duration_seconds: item.started_at && item.completed_at
          ? Math.round((new Date(item.completed_at).getTime() - new Date(item.started_at).getTime()) / 1000)
          : undefined,
      })) as SyncHistoryItem[];
    },
    enabled: !!currentOrganization?.id,
  });

  // Get sync detail
  const getSyncDetail = async (syncId: string): Promise<SyncHistoryItem | null> => {
    const { data, error } = await supabase
      .from('sync_history')
      .select('*')
      .eq('id', syncId)
      .single();

    if (error) return null;
    
    return {
      ...data,
      duration_seconds: data.started_at && data.completed_at
        ? Math.round((new Date(data.completed_at).getTime() - new Date(data.started_at).getTime()) / 1000)
        : undefined,
    } as SyncHistoryItem;
  };

  // Run manual sync
  const runManualSyncMutation = useMutation({
    mutationFn: async (): Promise<SyncResult> => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const response = await supabase.functions.invoke('run-manual-sync', {
        body: { organizationId: currentOrganization.id },
      });

      if (response.error) throw new Error(response.error.message);
      
      return response.data as SyncResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['sync-history'] });
      if (result.success) {
        toast.success(`Sincronización completada: ${result.summary?.matters_updated || 0} expedientes actualizados`);
      } else {
        toast.error(`Error en sincronización: ${result.error}`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Error al sincronizar: ${error.message}`);
    },
  });

  // Calculate summary stats
  const summaryStats = {
    totalSyncs: history.length,
    totalMattersChecked: history.reduce((sum, h) => sum + (h.matters_checked || 0), 0),
    totalUpdated: history.reduce((sum, h) => sum + (h.matters_updated || 0), 0),
    totalErrors: history.reduce((sum, h) => sum + (h.errors_count || 0), 0),
  };

  return {
    history,
    isLoading,
    summaryStats,
    getSyncDetail,
    runManualSync: runManualSyncMutation.mutateAsync,
    isRunningSync: runManualSyncMutation.isPending,
  };
}
