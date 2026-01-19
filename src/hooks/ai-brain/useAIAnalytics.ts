// ============================================================
// IP-NEXUS AI BRAIN - ANALYTICS HOOK
// ============================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AIUsageAggregate, AIAnalyticsSummary, PeriodType } from '@/types/ai-brain.types';
import { format, subDays, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

const QUERY_KEY = 'ai-analytics';

interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  periodType?: PeriodType;
  organizationId?: string;
}

export function useAIUsageAggregates(filters: AnalyticsFilters = {}) {
  const {
    startDate = subDays(new Date(), 30),
    endDate = new Date(),
    periodType = 'daily',
    organizationId,
  } = filters;

  return useQuery({
    queryKey: [QUERY_KEY, 'aggregates', startDate, endDate, periodType, organizationId],
    queryFn: async (): Promise<AIUsageAggregate[]> => {
      let query = supabase
        .from('ai_usage_aggregates')
        .select('*')
        .eq('period_type', periodType)
        .gte('period_start', startOfDay(startDate).toISOString())
        .lte('period_end', endOfDay(endDate).toISOString())
        .order('period_start', { ascending: true });

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AIUsageAggregate[];
    },
  });
}

export function useAIAnalyticsSummary(filters: AnalyticsFilters = {}) {
  const {
    startDate = startOfMonth(new Date()),
    endDate = endOfMonth(new Date()),
    organizationId,
  } = filters;

  return useQuery({
    queryKey: [QUERY_KEY, 'summary', startDate, endDate, organizationId],
    queryFn: async (): Promise<AIAnalyticsSummary> => {
      // Fetch request logs for the period
      let query = supabase
        .from('ai_request_logs')
        .select(`
          *,
          model:ai_models(id, name, model_id, provider:ai_providers(id, name, code))
        `)
        .gte('created_at', startOfDay(startDate).toISOString())
        .lte('created_at', endOfDay(endDate).toISOString());

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data: logs, error } = await query;

      if (error) throw error;

      // Calculate summary from logs
      const totalRequests = logs?.length || 0;
      const successfulRequests = logs?.filter(l => l.status === 'success').length || 0;
      const totalTokensInput = logs?.reduce((sum, l) => sum + (l.input_tokens || 0), 0) || 0;
      const totalTokensOutput = logs?.reduce((sum, l) => sum + (l.output_tokens || 0), 0) || 0;
      const totalCost = logs?.reduce((sum, l) => sum + (l.cost_usd || 0), 0) || 0;
      const avgLatency = totalRequests > 0
        ? (logs?.reduce((sum, l) => sum + (l.latency_ms || 0), 0) || 0) / totalRequests
        : 0;
      const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 100;

      // Group by provider
      const byProviderMap = new Map<string, { requests: number; cost: number }>();
      logs?.forEach(log => {
        const providerName = (log.model as any)?.provider?.name || 'Unknown';
        const existing = byProviderMap.get(providerName) || { requests: 0, cost: 0 };
        byProviderMap.set(providerName, {
          requests: existing.requests + 1,
          cost: existing.cost + (log.cost_usd || 0),
        });
      });

      const byProvider = Array.from(byProviderMap.entries()).map(([provider, data]) => ({
        provider,
        requests: data.requests,
        cost: data.cost,
        percentage: totalRequests > 0 ? (data.requests / totalRequests) * 100 : 0,
      }));

      // Group by task
      const byTaskMap = new Map<string, { requests: number; cost: number }>();
      logs?.forEach(log => {
        const task = log.task_code || 'Unknown';
        const existing = byTaskMap.get(task) || { requests: 0, cost: 0 };
        byTaskMap.set(task, {
          requests: existing.requests + 1,
          cost: existing.cost + (log.cost_usd || 0),
        });
      });

      const byTask = Array.from(byTaskMap.entries()).map(([task, data]) => ({
        task,
        requests: data.requests,
        cost: data.cost,
        percentage: totalRequests > 0 ? (data.requests / totalRequests) * 100 : 0,
      }));

      // Group by day
      const byDayMap = new Map<string, { requests: number; cost: number; tokens: number }>();
      logs?.forEach(log => {
        const date = format(new Date(log.created_at), 'yyyy-MM-dd');
        const existing = byDayMap.get(date) || { requests: 0, cost: 0, tokens: 0 };
        byDayMap.set(date, {
          requests: existing.requests + 1,
          cost: existing.cost + (log.cost_usd || 0),
          tokens: existing.tokens + (log.total_tokens || 0),
        });
      });

      const byDay = Array.from(byDayMap.entries())
        .map(([date, data]) => ({
          date,
          requests: data.requests,
          cost: data.cost,
          tokens: data.tokens,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalRequests,
        totalTokensInput,
        totalTokensOutput,
        totalCost,
        avgLatency,
        successRate,
        byProvider,
        byTask,
        byDay,
      };
    },
  });
}

export function useAITopConsumers(filters: AnalyticsFilters = {}) {
  const {
    startDate = startOfMonth(new Date()),
    endDate = endOfMonth(new Date()),
  } = filters;

  return useQuery({
    queryKey: [QUERY_KEY, 'top-consumers', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_request_logs')
        .select(`
          organization_id,
          cost_usd,
          total_tokens
        `)
        .gte('created_at', startOfDay(startDate).toISOString())
        .lte('created_at', endOfDay(endDate).toISOString())
        .not('organization_id', 'is', null);

      if (error) throw error;

      // Aggregate by organization
      const byOrgMap = new Map<string, { cost: number; tokens: number; requests: number }>();
      data?.forEach(log => {
        const orgId = log.organization_id!;
        const existing = byOrgMap.get(orgId) || { cost: 0, tokens: 0, requests: 0 };
        byOrgMap.set(orgId, {
          cost: existing.cost + (log.cost_usd || 0),
          tokens: existing.tokens + (log.total_tokens || 0),
          requests: existing.requests + 1,
        });
      });

      // Get organization names
      const orgIds = Array.from(byOrgMap.keys());
      const { data: orgs } = await supabase
        .from('organizations')
        .select('id, name')
        .in('id', orgIds);

      const orgNameMap = new Map(orgs?.map(o => [o.id, o.name]) || []);

      return Array.from(byOrgMap.entries())
        .map(([orgId, data]) => ({
          organizationId: orgId,
          organizationName: orgNameMap.get(orgId) || 'Unknown',
          ...data,
        }))
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 10);
    },
  });
}
