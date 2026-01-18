import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { DashboardMetrics, ChartData } from '@/types/reports';

export function useDashboardMetrics() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['dashboard-metrics', currentOrganization?.id],
    queryFn: async () => {
      const orgId = currentOrganization!.id;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const ninetyDaysAhead = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      
      // Total expedientes
      const { count: totalMatters } = await supabase
        .from('matters')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);
      
      // Expedientes activos
      const { count: activeMatters } = await supabase
        .from('matters')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .in('status', ['active', 'pending', 'filed']);
      
      // Renovaciones próximos 90 días
      const { count: renewalsDue } = await supabase
        .from('renewal_schedule')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .in('status', ['upcoming', 'due', 'in_grace'])
        .lte('due_date', ninetyDaysAhead.toISOString());
      
      // Costes del mes
      const { data: monthlyCostsData } = await supabase
        .from('matter_costs')
        .select('total_amount')
        .eq('organization_id', orgId)
        .gte('cost_date', startOfMonth.toISOString());
      
      const monthlyCosts = monthlyCostsData?.reduce((sum, c) => sum + (c.total_amount || 0), 0) || 0;
      
      // Facturado este mes
      const { data: invoicedData } = await supabase
        .from('invoices')
        .select('total')
        .eq('organization_id', orgId)
        .gte('invoice_date', startOfMonth.toISOString());
      
      const invoicedThisMonth = invoicedData?.reduce((sum, i) => sum + (i.total || 0), 0) || 0;
      
      // Cobrado este mes
      const { data: collectedData } = await supabase
        .from('invoices')
        .select('paid_amount')
        .eq('organization_id', orgId)
        .eq('status', 'paid')
        .gte('invoice_date', startOfMonth.toISOString());
      
      const collectedThisMonth = collectedData?.reduce((sum, i) => sum + (i.paid_amount || 0), 0) || 0;
      
      // Total contactos
      const { count: totalContacts } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);
      
      // Campañas activas
      const { count: activeCampaigns } = await supabase
        .from('email_campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .in('status', ['active', 'sending', 'scheduled']);
      
      // Deals abiertos (en lugar de watch_alerts que puede no existir)
      const { count: openDeals } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'open');
      
      return {
        total_matters: { value: totalMatters || 0 },
        active_matters: { value: activeMatters || 0 },
        pending_deadlines: { value: 0 }, // TODO: add when table exists
        overdue_deadlines: { value: 0 }, // TODO: add when table exists
        renewals_due_90: { value: renewalsDue || 0 },
        monthly_costs: { value: monthlyCosts },
        yearly_costs: { value: 0 },
        invoiced_this_month: { value: invoicedThisMonth },
        collected_this_month: { value: collectedThisMonth },
        total_contacts: { value: totalContacts || 0 },
        active_campaigns: { value: activeCampaigns || 0 },
        watch_alerts: { value: openDeals || 0 },
      } as DashboardMetrics;
    },
    enabled: !!currentOrganization?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useMattersByType() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['chart-matters-by-type', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matters')
        .select('type')
        .eq('organization_id', currentOrganization!.id);
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach(m => {
        const ipType = m.type || 'unknown';
        counts[ipType] = (counts[ipType] || 0) + 1;
      });
      
      const labels = Object.keys(counts);
      const values = Object.values(counts);
      
      return {
        labels,
        datasets: [{
          label: 'Expedientes',
          data: values,
          backgroundColor: ['#EC4899', '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6'],
        }],
      } as ChartData;
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useMattersByStatus() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['chart-matters-by-status', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matters')
        .select('status')
        .eq('organization_id', currentOrganization!.id);
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach(m => {
        counts[m.status] = (counts[m.status] || 0) + 1;
      });
      
      return {
        labels: Object.keys(counts),
        datasets: [{
          label: 'Expedientes',
          data: Object.values(counts),
          backgroundColor: ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#6B7280'],
        }],
      } as ChartData;
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useCostTrend(months = 12) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['chart-cost-trend', currentOrganization?.id, months],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      
      const { data, error } = await supabase
        .from('matter_costs')
        .select('cost_date, total_amount')
        .eq('organization_id', currentOrganization!.id)
        .gte('cost_date', startDate.toISOString())
        .order('cost_date');
      
      if (error) throw error;
      
      // Agrupar por mes
      const byMonth: Record<string, number> = {};
      data?.forEach(c => {
        const month = c.cost_date.substring(0, 7); // YYYY-MM
        byMonth[month] = (byMonth[month] || 0) + (c.total_amount || 0);
      });
      
      // Generar todos los meses
      const labels: string[] = [];
      const values: number[] = [];
      const current = new Date(startDate);
      
      while (current <= new Date()) {
        const month = current.toISOString().substring(0, 7);
        labels.push(month);
        values.push(byMonth[month] || 0);
        current.setMonth(current.getMonth() + 1);
      }
      
      return {
        labels,
        datasets: [{
          label: 'Costes',
          data: values,
          borderColor: '#EC4899',
          backgroundColor: '#EC489920',
        }],
      } as ChartData;
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useRenewalsByMonth(months = 12) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['chart-renewals-by-month', currentOrganization?.id, months],
    queryFn: async () => {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + months);
      
      const { data, error } = await supabase
        .from('renewal_schedule')
        .select('due_date')
        .eq('organization_id', currentOrganization!.id)
        .gte('due_date', new Date().toISOString())
        .lte('due_date', endDate.toISOString());
      
      if (error) throw error;
      
      const countByMonth: Record<string, number> = {};
      
      data?.forEach(r => {
        const month = r.due_date.substring(0, 7);
        countByMonth[month] = (countByMonth[month] || 0) + 1;
      });
      
      const labels: string[] = [];
      const counts: number[] = [];
      const current = new Date();
      
      for (let i = 0; i < months; i++) {
        const month = current.toISOString().substring(0, 7);
        labels.push(month);
        counts.push(countByMonth[month] || 0);
        current.setMonth(current.getMonth() + 1);
      }
      
      return {
        labels,
        datasets: [{
          label: 'Renovaciones',
          data: counts,
          backgroundColor: '#22C55E',
        }],
      } as ChartData;
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useRecentActivity(limit = 10) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['recent-activity', currentOrganization?.id, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          user:users(id, full_name, email)
        `)
        .eq('organization_id', currentOrganization!.id)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useMattersByJurisdiction() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['chart-matters-by-jurisdiction', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matters')
        .select('jurisdiction')
        .eq('organization_id', currentOrganization!.id)
        .not('jurisdiction', 'is', null);
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach(m => {
        if (m.jurisdiction) {
          counts[m.jurisdiction] = (counts[m.jurisdiction] || 0) + 1;
        }
      });
      
      return {
        labels: Object.keys(counts),
        datasets: [{
          label: 'Expedientes',
          data: Object.values(counts),
          backgroundColor: ['#3B82F6', '#EC4899', '#22C55E', '#F59E0B', '#8B5CF6', '#14B8A6'],
        }],
      } as ChartData;
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useDeadlinesByMonth(months = 6) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['chart-deadlines-by-month', currentOrganization?.id, months],
    queryFn: async () => {
      // Return empty chart data since matter_deadlines might not exist
      const labels: string[] = [];
      const values: number[] = [];
      const current = new Date();
      
      for (let i = 0; i < months; i++) {
        const month = current.toISOString().substring(0, 7);
        labels.push(month);
        values.push(0);
        current.setMonth(current.getMonth() + 1);
      }
      
      return {
        labels,
        datasets: [{
          label: 'Plazos',
          data: values,
          backgroundColor: '#3B82F6',
        }],
      } as ChartData;
    },
    enabled: !!currentOrganization?.id,
  });
}
