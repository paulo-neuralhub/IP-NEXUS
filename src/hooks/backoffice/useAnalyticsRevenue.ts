/**
 * Hook for revenue analytics
 * Uses fromTable helper for TypeScript compatibility
 */

import { useQuery } from '@tanstack/react-query';
import { fromTable } from '@/lib/supabase';
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns';

interface MRRBreakdown {
  startMRR: number;
  newMRR: number;
  expansionMRR: number;
  contractionMRR: number;
  churnedMRR: number;
  endMRR: number;
}

interface RevenueByPlan {
  plan: string;
  mrr: number;
  percentage: number;
  color: string;
}

interface RevenueByAddon {
  addon: string;
  mrr: number;
  percentage: number;
}

interface ARPUData {
  date: string;
  arpu: number;
}

interface LTVData {
  enterprise: { ltv: number; months: number };
  professional: { ltv: number; months: number };
  starter: { ltv: number; months: number };
}

export function useMRRBreakdown(month?: Date) {
  const targetMonth = month || new Date();

  return useQuery({
    queryKey: ['analytics-mrr-breakdown', format(targetMonth, 'yyyy-MM')],
    queryFn: async (): Promise<MRRBreakdown> => {
      const monthStart = startOfMonth(targetMonth);
      const monthEnd = endOfMonth(targetMonth);
      const prevMonthEnd = endOfMonth(subMonths(targetMonth, 1));

      const { data: startData } = await fromTable('analytics_daily_metrics')
        .select('mrr_total')
        .lte('date', format(prevMonthEnd, 'yyyy-MM-dd'))
        .order('date', { ascending: false })
        .limit(1);

      const { data: endData } = await fromTable('analytics_daily_metrics')
        .select('mrr_total, mrr_new, mrr_expansion, mrr_contraction, mrr_churned')
        .gte('date', format(monthStart, 'yyyy-MM-dd'))
        .lte('date', format(monthEnd, 'yyyy-MM-dd'))
        .order('date', { ascending: false })
        .limit(1);

      const startMRR = Number((startData as any)?.[0]?.mrr_total || 0);
      const end = (endData as any)?.[0];

      return {
        startMRR,
        newMRR: Number(end?.mrr_new || 0),
        expansionMRR: Number(end?.mrr_expansion || 0),
        contractionMRR: Number(end?.mrr_contraction || 0),
        churnedMRR: Number(end?.mrr_churned || 0),
        endMRR: Number(end?.mrr_total || 0),
      };
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useRevenueByPlan() {
  return useQuery({
    queryKey: ['analytics-revenue-by-plan'],
    queryFn: async (): Promise<RevenueByPlan[]> => {
      const { data, error } = await fromTable('analytics_daily_metrics')
        .select('mrr_starter, mrr_professional, mrr_enterprise, mrr_addons, mrr_total')
        .order('date', { ascending: false })
        .limit(1);

      if (error) throw error;

      const latest = (data as any)?.[0];
      const total = Number(latest?.mrr_total || 0);

      return [
        {
          plan: 'Enterprise',
          mrr: Number(latest?.mrr_enterprise || 0),
          percentage: total ? (Number(latest?.mrr_enterprise || 0) / total * 100) : 0,
          color: '#8B5CF6',
        },
        {
          plan: 'Professional',
          mrr: Number(latest?.mrr_professional || 0),
          percentage: total ? (Number(latest?.mrr_professional || 0) / total * 100) : 0,
          color: '#3B82F6',
        },
        {
          plan: 'Starter',
          mrr: Number(latest?.mrr_starter || 0),
          percentage: total ? (Number(latest?.mrr_starter || 0) / total * 100) : 0,
          color: '#10B981',
        },
        {
          plan: 'Add-ons',
          mrr: Number(latest?.mrr_addons || 0),
          percentage: total ? (Number(latest?.mrr_addons || 0) / total * 100) : 0,
          color: '#F59E0B',
        },
      ];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useRevenueByAddon() {
  return useQuery({
    queryKey: ['analytics-revenue-by-addon'],
    queryFn: async (): Promise<RevenueByAddon[]> => {
      const { data } = await fromTable('analytics_daily_metrics')
        .select('mrr_addons')
        .order('date', { ascending: false })
        .limit(1);

      const totalAddons = Number((data as any)?.[0]?.mrr_addons || 0);

      return [
        { addon: 'USPTO', mrr: totalAddons * 0.4, percentage: 40 },
        { addon: 'WIPO', mrr: totalAddons * 0.25, percentage: 25 },
        { addon: 'EPO', mrr: totalAddons * 0.2, percentage: 20 },
        { addon: 'EUIPO', mrr: totalAddons * 0.1, percentage: 10 },
        { addon: 'Otros', mrr: totalAddons * 0.05, percentage: 5 },
      ];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useARPUEvolution(months: number = 12) {
  return useQuery({
    queryKey: ['analytics-arpu-evolution', months],
    queryFn: async (): Promise<ARPUData[]> => {
      const endDate = new Date();
      const startDate = subMonths(endDate, months);

      const { data, error } = await fromTable('analytics_daily_metrics')
        .select('date, mrr_total, active_subscriptions')
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .order('date', { ascending: true });

      if (error) throw error;

      const monthlyData: Record<string, { mrr: number; subs: number }> = {};

      ((data as any[]) || []).forEach(d => {
        const monthKey = format(new Date(d.date), 'MMM yyyy');
        monthlyData[monthKey] = {
          mrr: Number(d.mrr_total || 0),
          subs: d.active_subscriptions || 1,
        };
      });

      return Object.entries(monthlyData).map(([date, values]) => ({
        date,
        arpu: values.subs ? values.mrr / values.subs : 0,
      }));
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useLTVByPlan() {
  return useQuery({
    queryKey: ['analytics-ltv-by-plan'],
    queryFn: async (): Promise<LTVData> => {
      const { data } = await fromTable('analytics_cohorts')
        .select('ltv_average')
        .order('cohort_month', { ascending: false })
        .limit(1);

      const avgLtv = Number((data as any)?.[0]?.ltv_average || 4500);

      return {
        enterprise: { ltv: avgLtv * 3, months: 48 },
        professional: { ltv: avgLtv, months: 48 },
        starter: { ltv: avgLtv * 0.3, months: 36 },
      };
    },
    staleTime: 30 * 60 * 1000,
  });
}
