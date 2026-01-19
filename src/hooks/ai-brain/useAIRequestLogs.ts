// ============================================================
// IP-NEXUS AI BRAIN - REQUEST LOGS HOOK
// ============================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AIRequestLog } from '@/types/ai-brain.types';
import { startOfDay, endOfDay, subDays } from 'date-fns';

const QUERY_KEY = 'ai-request-logs';

interface LogFilters {
  startDate?: Date;
  endDate?: Date;
  taskCode?: string;
  status?: string;
  organizationId?: string;
  limit?: number;
}

export function useAIRequestLogs(filters: LogFilters = {}) {
  const {
    startDate = subDays(new Date(), 7),
    endDate = new Date(),
    taskCode,
    status,
    organizationId,
    limit = 100,
  } = filters;

  return useQuery({
    queryKey: [QUERY_KEY, startDate, endDate, taskCode, status, organizationId, limit],
    queryFn: async (): Promise<AIRequestLog[]> => {
      let query = supabase
        .from('ai_request_logs')
        .select(`
          *,
          model:ai_models(id, name, model_id),
          provider:ai_providers(id, name, code)
        `)
        .gte('created_at', startOfDay(startDate).toISOString())
        .lte('created_at', endOfDay(endDate).toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (taskCode) {
        query = query.eq('task_code', taskCode);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as AIRequestLog[];
    },
  });
}

export function useRecentAIErrors(limit = 20) {
  return useQuery({
    queryKey: [QUERY_KEY, 'errors', limit],
    queryFn: async (): Promise<AIRequestLog[]> => {
      const { data, error } = await supabase
        .from('ai_request_logs')
        .select(`
          *,
          model:ai_models(id, name, model_id),
          provider:ai_providers(id, name, code)
        `)
        .neq('status', 'success')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as unknown as AIRequestLog[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useAIRequestLogStats(filters: LogFilters = {}) {
  const {
    startDate = subDays(new Date(), 7),
    endDate = new Date(),
    organizationId,
  } = filters;

  return useQuery({
    queryKey: [QUERY_KEY, 'stats', startDate, endDate, organizationId],
    queryFn: async () => {
      let query = supabase
        .from('ai_request_logs')
        .select('status, latency_ms, cost_usd, total_tokens')
        .gte('created_at', startOfDay(startDate).toISOString())
        .lte('created_at', endOfDay(endDate).toISOString());

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const logs = data || [];
      const total = logs.length;
      const successful = logs.filter(l => l.status === 'success').length;
      const errors = logs.filter(l => l.status === 'error').length;
      const timeouts = logs.filter(l => l.status === 'timeout').length;
      const rateLimited = logs.filter(l => l.status === 'rate_limited').length;
      const fallbacks = logs.filter(l => l.status === 'fallback_used').length;

      const latencies = logs.map(l => l.latency_ms || 0).filter(l => l > 0).sort((a, b) => a - b);
      const avgLatency = latencies.length > 0
        ? latencies.reduce((a, b) => a + b, 0) / latencies.length
        : 0;
      const p50Latency = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.5)] : 0;
      const p95Latency = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.95)] : 0;
      const p99Latency = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.99)] : 0;

      const totalCost = logs.reduce((sum, l) => sum + (l.cost_usd || 0), 0);
      const totalTokens = logs.reduce((sum, l) => sum + (l.total_tokens || 0), 0);

      return {
        total,
        successful,
        errors,
        timeouts,
        rateLimited,
        fallbacks,
        successRate: total > 0 ? (successful / total) * 100 : 100,
        avgLatency,
        p50Latency,
        p95Latency,
        p99Latency,
        totalCost,
        totalTokens,
      };
    },
  });
}
