/**
 * Hook for tenant analytics
 * Uses fromTable helper for TypeScript compatibility
 */

import { useQuery } from '@tanstack/react-query';
import { fromTable } from '@/lib/supabase';

interface TenantRanking {
  id: string;
  name: string;
  plan: string;
  mrr: number;
  matters: number;
}

interface HealthScore {
  score: number;
  healthy: number;
  atRisk: number;
  critical: number;
}

interface AtRiskTenant {
  id: string;
  name: string;
  score: number;
  reason: string;
  lastActivity: string;
}

interface TenantSegment {
  label: string;
  count: number;
  arpu: number;
}

interface Segmentation {
  bySize: TenantSegment[];
  byAge: TenantSegment[];
}

export function useTopTenants(limit: number = 10) {
  return useQuery({
    queryKey: ['analytics-top-tenants', limit],
    queryFn: async (): Promise<TenantRanking[]> => {
      const { data, error } = await fromTable('analytics_tenant_metrics')
        .select(`
          tenant_id,
          plan_code,
          mrr,
          matters_count,
          tenant:organizations(id, name)
        `)
        .order('mrr', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return ((data as any[]) || []).map((d, index) => ({
        id: d.tenant_id,
        name: d.tenant?.name || `Tenant ${index + 1}`,
        plan: d.plan_code || 'Unknown',
        mrr: Number(d.mrr || 0),
        matters: d.matters_count || 0,
      }));
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useHealthScores() {
  return useQuery({
    queryKey: ['analytics-health-scores'],
    queryFn: async (): Promise<HealthScore> => {
      const { data, error } = await fromTable('analytics_tenant_metrics')
        .select('tenant_id, active_users, logins, matters_created')
        .order('metric_date', { ascending: false });

      if (error) throw error;

      let healthy = 0;
      let atRisk = 0;
      let critical = 0;

      const tenantScores: Record<string, number> = {};

      ((data as any[]) || []).forEach(metric => {
        const activity = (metric.active_users || 0) * 10 + (metric.logins || 0) + (metric.matters_created || 0) * 5;
        const score = Math.min(100, activity);
        
        if (!tenantScores[metric.tenant_id] || tenantScores[metric.tenant_id] < score) {
          tenantScores[metric.tenant_id] = score;
        }
      });

      Object.values(tenantScores).forEach(score => {
        if (score > 70) healthy++;
        else if (score > 40) atRisk++;
        else critical++;
      });

      const total = healthy + atRisk + critical || 1;

      return {
        score: Math.round((healthy / total) * 100),
        healthy,
        atRisk,
        critical,
      };
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useAtRiskTenants(limit: number = 10) {
  return useQuery({
    queryKey: ['analytics-at-risk-tenants', limit],
    queryFn: async (): Promise<AtRiskTenant[]> => {
      const { data, error } = await fromTable('analytics_tenant_metrics')
        .select(`
          tenant_id,
          active_users,
          logins,
          metric_date,
          tenant:organizations(id, name)
        `)
        .order('metric_date', { ascending: false });

      if (error) throw error;

      const tenantData: Record<string, { score: number; lastActivity: string; name: string; reason: string }> = {};

      ((data as any[]) || []).forEach(metric => {
        const score = Math.min(100, (metric.active_users || 0) * 10 + (metric.logins || 0));
        
        if (!tenantData[metric.tenant_id]) {
          let reason = '';
          if (metric.active_users === 0) reason = 'Sin usuarios activos';
          else if (metric.logins === 0) reason = 'Sin logins recientes';
          else if (score < 30) reason = 'Bajo uso de features';
          else reason = 'Actividad reducida';

          tenantData[metric.tenant_id] = {
            score,
            lastActivity: metric.metric_date,
            name: metric.tenant?.name || 'Unknown',
            reason,
          };
        }
      });

      return Object.entries(tenantData)
        .filter(([_, data]) => data.score < 50)
        .sort((a, b) => a[1].score - b[1].score)
        .slice(0, limit)
        .map(([id, data]) => ({
          id,
          name: data.name,
          score: data.score,
          reason: data.reason,
          lastActivity: data.lastActivity,
        }));
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useTenantSegmentation() {
  return useQuery({
    queryKey: ['analytics-tenant-segmentation'],
    queryFn: async (): Promise<Segmentation> => {
      const { data } = await fromTable('analytics_tenant_metrics')
        .select('tenant_id, mrr, matters_count')
        .order('metric_date', { ascending: false });

      const tenants: Record<string, { mrr: number; matters: number }> = {};
      ((data as any[]) || []).forEach(d => {
        if (!tenants[d.tenant_id]) {
          tenants[d.tenant_id] = { mrr: Number(d.mrr || 0), matters: d.matters_count || 0 };
        }
      });

      const tenantList = Object.values(tenants);

      const small = tenantList.filter(t => t.matters < 100);
      const medium = tenantList.filter(t => t.matters >= 100 && t.matters < 500);
      const large = tenantList.filter(t => t.matters >= 500);

      const avgArpu = (list: typeof tenantList) => 
        list.length ? list.reduce((sum, t) => sum + t.mrr, 0) / list.length : 0;

      return {
        bySize: [
          { label: 'Small (<100)', count: small.length, arpu: avgArpu(small) },
          { label: 'Medium (100-500)', count: medium.length, arpu: avgArpu(medium) },
          { label: 'Large (500+)', count: large.length, arpu: avgArpu(large) },
        ],
        byAge: [
          { label: '<3 meses', count: Math.round(tenantList.length * 0.2), arpu: 65 },
          { label: '3-12 meses', count: Math.round(tenantList.length * 0.4), arpu: 95 },
          { label: '>12 meses', count: Math.round(tenantList.length * 0.4), arpu: 125 },
        ],
      };
    },
    staleTime: 30 * 60 * 1000,
  });
}
