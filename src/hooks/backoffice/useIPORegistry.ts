// src/hooks/backoffice/useIPORegistry.ts
// Hooks for IPO Master Registry

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  IPOffice, 
  IPOHealthOverview, 
  IPORegistryStats, 
  SyncLog,
  ConnectionMethod,
  IPOOfficeFormData
} from '@/types/ipo-registry.types';
import { toast } from 'sonner';

// Dashboard stats
export function useIPOStats() {
  return useQuery({
    queryKey: ['ipo-stats'],
    queryFn: async (): Promise<IPORegistryStats> => {
      const [
        officesResult,
        healthResult,
        credentialsResult,
        syncResult,
      ] = await Promise.all([
        supabase.from('ipo_offices').select('tier, status, region'),
        supabase.from('ipo_health_overview').select('*'),
        supabase.from('ipo_expiring_credentials').select('*'),
        supabase.from('ipo_sync_logs')
          .select('status')
          .gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      ]);

      const offices = (officesResult.data || []) as Array<{ tier: number; status: string; region: string }>;
      const health = (healthResult.data || []) as Array<{ traffic_light: string }>;
      const credentials = credentialsResult.data || [];
      const syncs = (syncResult.data || []) as Array<{ status: string }>;

      const activeOffices = offices.filter(o => o.status === 'active');
      
      return {
        totalOffices: offices.length,
        activeOffices: activeOffices.length,
        
        byTier: {
          tier1: activeOffices.filter(o => o.tier === 1).length,
          tier2: activeOffices.filter(o => o.tier === 2).length,
          tier3: activeOffices.filter(o => o.tier === 3).length,
        },
        
        byHealth: {
          healthy: health.filter(h => h.traffic_light === 'green').length,
          degraded: health.filter(h => h.traffic_light === 'yellow').length,
          unhealthy: health.filter(h => h.traffic_light === 'red').length,
          unknown: health.filter(h => h.traffic_light === 'gray').length,
        },
        
        byRegion: activeOffices.reduce((acc, o) => {
          const region = o.region || 'unknown';
          acc[region] = (acc[region] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        
        connectionsDown: health.filter(h => h.traffic_light === 'red').length,
        credentialsExpiring: credentials.length,
        subscriptionsExpiring: 0,
        
        lastSync: syncs[0] ? new Date().toISOString() : undefined,
        syncSuccessRate24h: syncs.length > 0 
          ? (syncs.filter(s => s.status === 'success').length / syncs.length) * 100 
          : 100,
      };
    },
    refetchInterval: 60000,
  });
}

// List offices with filters
export function useIPOOffices(filters?: {
  tier?: number;
  region?: string;
  status?: string;
  healthStatus?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['ipo-offices', filters],
    queryFn: async (): Promise<IPOHealthOverview[]> => {
      let query = supabase
        .from('ipo_health_overview')
        .select('*')
        .order('tier', { ascending: true })
        .order('code', { ascending: true });

      if (filters?.tier) {
        query = query.eq('tier', filters.tier);
      }
      if (filters?.status) {
        query = query.eq('office_status', filters.status);
      }
      if (filters?.healthStatus) {
        query = query.eq('health_status', filters.healthStatus);
      }
      if (filters?.search) {
        query = query.or(`code.ilike.%${filters.search}%,name_official.ilike.%${filters.search}%`);
      }
      if (filters?.region) {
        query = query.eq('region', filters.region);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as IPOHealthOverview[];
    },
  });
}

// Single office with all details
export function useIPOOffice(officeId: string | undefined) {
  return useQuery({
    queryKey: ['ipo-office', officeId],
    queryFn: async () => {
      if (!officeId) return null;

      const { data: office, error } = await supabase
        .from('ipo_offices')
        .select(`
          *,
          contacts:ipo_office_contacts(*),
          connection_methods:ipo_connection_methods(
            *,
            api_config:ipo_api_configs(*),
            scraper_config:ipo_scraper_configs(*),
            bulk_config:ipo_bulk_configs(*)
          ),
          field_mappings:ipo_field_mappings(*),
          knowledge_base:ipo_knowledge_base(*),
          fees:ipo_official_fees(*),
          deadline_rules:ipo_deadline_rules(*),
          holidays:ipo_holidays(*)
        `)
        .eq('id', officeId)
        .single();

      if (error) throw error;
      return office as unknown as IPOffice;
    },
    enabled: !!officeId,
  });
}

// Create office
export function useCreateOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IPOOfficeFormData) => {
      const { data: office, error } = await supabase
        .from('ipo_offices')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return office;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ipo-offices'] });
      queryClient.invalidateQueries({ queryKey: ['ipo-stats'] });
      toast.success('Oficina creada correctamente');
    },
    onError: (error) => {
      toast.error(`Error al crear oficina: ${error.message}`);
    },
  });
}

// Update office
export function useUpdateOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<IPOOfficeFormData> }) => {
      const { error } = await supabase
        .from('ipo_offices')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['ipo-office', id] });
      queryClient.invalidateQueries({ queryKey: ['ipo-offices'] });
      toast.success('Oficina actualizada');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// Delete office
export function useDeleteOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ipo_offices')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ipo-offices'] });
      queryClient.invalidateQueries({ queryKey: ['ipo-stats'] });
      toast.success('Oficina eliminada');
    },
  });
}

// Health check for a connection method
export function useRunHealthCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (connectionMethodId: string) => {
      // Simulate health check - in production this would call an edge function
      const { data, error } = await supabase
        .from('ipo_health_checks')
        .insert({
          connection_method_id: connectionMethodId,
          check_type: 'ping',
          status: 'success',
          response_time_ms: Math.floor(Math.random() * 1000) + 100,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update connection method health status
      await supabase
        .from('ipo_connection_methods')
        .update({
          health_status: 'healthy',
          last_health_check: new Date().toISOString(),
          consecutive_failures: 0,
        })
        .eq('id', connectionMethodId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ipo-offices'] });
      queryClient.invalidateQueries({ queryKey: ['ipo-stats'] });
      toast.success('Health check completado');
    },
  });
}

// Trigger manual sync
export function useTriggerSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      officeId, 
      syncType = 'delta',
      connectionMethodId 
    }: { 
      officeId: string; 
      syncType?: 'delta' | 'full';
      connectionMethodId?: string;
    }) => {
      // Create sync log
      const { data, error } = await supabase
        .from('ipo_sync_logs')
        .insert({
          office_id: officeId,
          connection_method_id: connectionMethodId,
          sync_type: syncType,
          status: 'running',
          started_at: new Date().toISOString(),
          triggered_by: 'manual',
        })
        .select()
        .single();

      if (error) throw error;

      // Simulate sync completion (in production, this would be handled by an edge function)
      setTimeout(async () => {
        await supabase
          .from('ipo_sync_logs')
          .update({
            status: 'success',
            completed_at: new Date().toISOString(),
            duration_ms: Math.floor(Math.random() * 5000) + 1000,
            records_fetched: Math.floor(Math.random() * 100),
            records_created: Math.floor(Math.random() * 10),
            records_updated: Math.floor(Math.random() * 50),
          })
          .eq('id', data.id);

        // Update last_successful_sync
        if (connectionMethodId) {
          await supabase
            .from('ipo_connection_methods')
            .update({ last_successful_sync: new Date().toISOString() })
            .eq('id', connectionMethodId);
        }

        queryClient.invalidateQueries({ queryKey: ['ipo-sync-logs'] });
        queryClient.invalidateQueries({ queryKey: ['ipo-offices'] });
      }, 3000);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ipo-sync-logs'] });
      toast.success('Sincronización iniciada');
    },
  });
}

// Sync logs
export function useSyncLogs(officeId?: string, limit = 50) {
  return useQuery({
    queryKey: ['ipo-sync-logs', officeId],
    queryFn: async (): Promise<SyncLog[]> => {
      let query = supabase
        .from('ipo_sync_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(limit);

      if (officeId) {
        query = query.eq('office_id', officeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as SyncLog[];
    },
  });
}

// Connection method CRUD
export function useCreateConnectionMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { office_id: string; method_type: string; priority?: number; is_enabled?: boolean }) => {
      const { data: method, error } = await supabase
        .from('ipo_connection_methods')
        .insert({
          office_id: data.office_id,
          method_type: data.method_type,
          priority: data.priority ?? 1,
          is_enabled: data.is_enabled ?? true,
          config: {},
        })
        .select()
        .single();

      if (error) throw error;
      return method;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ipo-office', variables.office_id] });
      toast.success('Método de conexión creado');
    },
  });
}

export function useUpdateConnectionMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { is_enabled?: boolean; priority?: number } }) => {
      const { error } = await supabase
        .from('ipo_connection_methods')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ipo-office'] });
      toast.success('Método actualizado');
    },
  });
}

// Official Fees
export function useOfficialFees(officeId?: string) {
  return useQuery({
    queryKey: ['ipo-fees', officeId],
    queryFn: async () => {
      let query = supabase
        .from('ipo_official_fees')
        .select('*')
        .order('fee_type');

      if (officeId) {
        query = query.eq('office_id', officeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// Deadline Rules
export function useDeadlineRules(officeId?: string) {
  return useQuery({
    queryKey: ['ipo-deadline-rules', officeId],
    queryFn: async () => {
      let query = supabase
        .from('ipo_deadline_rules')
        .select('*')
        .order('deadline_type');

      if (officeId) {
        query = query.eq('office_id', officeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// Alerts
export function useIPOAlerts(officeId?: string) {
  return useQuery({
    queryKey: ['ipo-alerts', officeId],
    queryFn: async () => {
      let query = supabase
        .from('ipo_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (officeId) {
        query = query.eq('office_id', officeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('ipo_alerts')
        .update({
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ipo-alerts'] });
      toast.success('Alerta reconocida');
    },
  });
}
