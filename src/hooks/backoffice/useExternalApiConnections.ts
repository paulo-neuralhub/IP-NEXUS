import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ExternalApiConnection {
  id: string;
  provider: string;
  name: string;
  description: string | null;
  website: string | null;
  api_base_url: string | null;
  api_docs_url: string | null;
  auth_type: string | null;
  client_id: string | null;
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
  timeout_seconds: number;
  available_endpoints: any[];
  enabled_endpoints: string[];
  status: string;
  last_test_at: string | null;
  last_test_result: string | null;
  last_error: string | null;
  total_requests: number;
  requests_today: number;
  requests_this_month: number;
  avg_response_ms: number;
  created_at: string;
  updated_at: string;
}

export interface ExternalApiLog {
  id: string;
  connection_id: string | null;
  provider: string;
  endpoint: string | null;
  method: string;
  request_params: any;
  request_body: any;
  response_status: number | null;
  response_body: any;
  response_time_ms: number | null;
  success: boolean;
  error_message: string | null;
  triggered_by: string;
  created_at: string;
}

export function useExternalApiConnections() {
  return useQuery({
    queryKey: ['external-api-connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_api_connections')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as ExternalApiConnection[];
    },
  });
}

export function useExternalApiConnection(provider: string) {
  return useQuery({
    queryKey: ['external-api-connection', provider],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_api_connections')
        .select('*')
        .eq('provider', provider)
        .single();
      
      if (error) throw error;
      return data as ExternalApiConnection;
    },
    enabled: !!provider,
  });
}

export function useExternalApiLogs(connectionId?: string, limit = 100) {
  return useQuery({
    queryKey: ['external-api-logs', connectionId, limit],
    queryFn: async () => {
      let query = supabase
        .from('external_api_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (connectionId) {
        query = query.eq('connection_id', connectionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ExternalApiLog[];
    },
  });
}

export function useUpdateExternalApiConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; data: Partial<ExternalApiConnection> }) => {
      const { error } = await supabase
        .from('external_api_connections')
        .update(params.data)
        .eq('id', params.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-api-connections'] });
      toast.success('Conexión actualizada');
    },
    onError: (error: any) => {
      toast.error('Error al actualizar: ' + error.message);
    },
  });
}

export function useTestApiConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (provider: string) => {
      const { data, error } = await supabase.functions.invoke('test-api-connection', {
        body: { provider },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, provider) => {
      queryClient.invalidateQueries({ queryKey: ['external-api-connections'] });
      
      if (data.success) {
        toast.success(`Conexión ${provider} verificada correctamente`);
      } else {
        toast.error(`Error en ${provider}: ${data.error}`);
      }
    },
    onError: (error: any) => {
      toast.error('Error al probar conexión: ' + error.message);
    },
  });
}

// EUIPO Goods & Services hooks
export function useEUIPOGoodsServices() {
  return useMutation({
    mutationFn: async (params: {
      action: 'search' | 'validate' | 'translate' | 'suggest';
      text?: string;
      terms?: string[];
      language?: string;
      niceClass?: number;
      targetLanguage?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('euipo-goods-services', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
  });
}

// WIPO Statistics hooks
export function useWIPOStatistics() {
  return useMutation({
    mutationFn: async (params: {
      action?: string;
      indicator?: string;
      years?: number[];
      countries?: string[];
      niceClass?: number;
      forceRefresh?: boolean;
    }) => {
      const { data, error } = await supabase.functions.invoke('wipo-statistics', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
  });
}

export function useWIPOOverviewStats() {
  return useQuery({
    queryKey: ['wipo-overview-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('wipo-statistics', {
        body: { action: 'overview' },
      });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useWIPOCountryRanking(year?: number) {
  return useQuery({
    queryKey: ['wipo-country-ranking', year],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('wipo-statistics', {
        body: { action: 'get_country_ranking', years: year ? [year] : undefined },
      });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

// Market data cache
export function useMarketDataCache(dataType: string, filters?: {
  countryCode?: string;
  year?: number;
}) {
  return useQuery({
    queryKey: ['market-data-cache', dataType, filters],
    queryFn: async () => {
      let query = supabase
        .from('market_data_cache')
        .select('*')
        .eq('data_type', dataType)
        .gt('expires_at', new Date().toISOString());

      if (filters?.countryCode) {
        query = query.eq('country_code', filters.countryCode);
      }
      if (filters?.year) {
        query = query.eq('year', filters.year);
      }

      const { data, error } = await query.order('year', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}