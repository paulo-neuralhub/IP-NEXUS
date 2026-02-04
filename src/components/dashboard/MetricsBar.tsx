// =============================================
// COMPONENTE: MetricsBar (SILK Hero Zone)
// Solo para Dashboard - KPIs principales
// =============================================

import { 
  Folder, 
  Users, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  CheckCircle,
  Euro,
  Calendar,
  Eye,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Metric {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: string;
  href?: string;
}

interface MetricsBarProps {
  metrics: Metric[];
}

/**
 * SILK Hero Zone - Solo Dashboard
 * Contenedor con gradiente sutil y grid de 4 KPIs principales
 */
export function MetricsBar({ metrics }: MetricsBarProps) {
  // Tomar solo los 4 primeros para Hero Zone (KPIs principales)
  // Los demás se pueden mostrar en otra sección si se desea
  const heroMetrics = metrics.slice(0, 4);
  const secondaryMetrics = metrics.slice(4);

  return (
    <div className="space-y-3">
      {/* SILK: Hero Zone Container */}
      <div 
        className="p-3 rounded-2xl mb-[18px]"
        style={{
          background: 'linear-gradient(135deg, #eceef6, #f1f4f9)',
        }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px]">
          {heroMetrics.map((metric, idx) => (
            <HeroKPICard key={idx} metric={metric} />
          ))}
        </div>
      </div>

      {/* Secondary metrics row (si hay más de 4) */}
      {secondaryMetrics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-[10px]">
          {secondaryMetrics.map((metric, idx) => (
            <SecondaryMetricCard key={idx} metric={metric} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * SILK: Card KPI dentro de Hero Zone
 */
function HeroKPICard({ metric }: { metric: Metric }) {
  return (
    <div 
      className="flex items-center gap-3 py-[13px] px-3 rounded-[14px] border border-black/[0.06] cursor-pointer transition-colors hover:border-[rgba(0,180,216,0.15)]"
      style={{ background: '#f1f4f9' }}
    >
      {/* Icon container */}
      <div 
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ 
          backgroundColor: `${metric.color}12`, 
          color: metric.color 
        }}
      >
        {metric.icon}
      </div>
      
      {/* Content */}
      <div className="min-w-0 flex-1">
        <p 
          className="text-xl font-bold truncate"
          style={{ color: '#0a2540' }}
        >
          {metric.value}
        </p>
        <p className="text-[11px] text-[#94a3b8] truncate">
          {metric.label}
        </p>
        {metric.change !== undefined && (
          <p className={cn(
            "text-[10px] font-medium",
            metric.change >= 0 ? 'text-emerald-600' : 'text-red-500'
          )}>
            {metric.change >= 0 ? '↑' : '↓'} {Math.abs(metric.change)}% {metric.changeLabel}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * SILK: Card secundaria (métricas 5-8)
 */
function SecondaryMetricCard({ metric }: { metric: Metric }) {
  return (
    <div 
      className="flex items-center gap-3 py-3 px-3 rounded-[14px] border border-black/[0.06] cursor-pointer transition-colors hover:border-[rgba(0,180,216,0.15)]"
      style={{ background: '#f1f4f9' }}
    >
      {/* Icon */}
      <div 
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ 
          backgroundColor: `${metric.color}10`, 
          color: metric.color 
        }}
      >
        {metric.icon}
      </div>
      
      {/* Content */}
      <div className="min-w-0 flex-1">
        <p 
          className="text-base font-bold truncate"
          style={{ color: '#0a2540' }}
        >
          {metric.value}
        </p>
        <p className="text-[10px] text-[#94a3b8] truncate">
          {metric.label}
        </p>
      </div>
    </div>
  );
}

// =============================================
// Hook para obtener métricas del dashboard
// =============================================

import { useQuery } from '@tanstack/react-query';
import { fromTable } from '@/lib/supabase';
import { useOrganization } from '@/hooks/useOrganization';

export function useDashboardMetrics() {
  const { organizationId } = useOrganization();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-metrics', organizationId],
    queryFn: async () => {
      if (!organizationId) throw new Error('No organization');

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      const [
        mattersRes,
        activeMattersRes,
        deadlinesTodayRes,
        urgentDeadlinesRes,
        contactsRes,
        watchlistsRes,
        alertsRes,
        invoicesRes,
      ] = await Promise.all([
        // Total matters
        fromTable('matters')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId),
        
        // Active matters
        fromTable('matters')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .eq('status', 'active'),
        
        // Deadlines today
        fromTable('matter_deadlines')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .gte('deadline_date', todayStart)
          .lt('deadline_date', todayEnd),
        
        // Urgent deadlines (priority = critical or high)
        fromTable('matter_deadlines')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .in('priority', ['critical', 'high'])
          .eq('status', 'pending'),
        
        // CRM contacts/accounts
        fromTable('crm_accounts')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId),
        
        // Active watchlists
        fromTable('watchlists')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .eq('is_active', true),
        
        // Spider alerts (unread)
        fromTable('spider_alerts')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .eq('status', 'unread'),
        
        // Month invoices total
        fromTable('invoices')
          .select('total_amount')
          .eq('organization_id', organizationId)
          .gte('invoice_date', monthStart)
          .lte('invoice_date', monthEnd),
      ]);

      const monthlyTotal = (invoicesRes.data ?? []).reduce(
        (sum: number, inv: { total_amount?: number | null }) => sum + (inv.total_amount ?? 0),
        0
      );

      return {
        totalMatters: mattersRes.count ?? 0,
        activeMatters: activeMattersRes.count ?? 0,
        deadlinesToday: deadlinesTodayRes.count ?? 0,
        urgentDeadlines: urgentDeadlinesRes.count ?? 0,
        totalContacts: contactsRes.count ?? 0,
        activeWatchlists: watchlistsRes.count ?? 0,
        unreadAlerts: alertsRes.count ?? 0,
        monthlyInvoicing: monthlyTotal,
      };
    },
    enabled: !!organizationId,
    staleTime: 30000,
  });

  const metrics: Metric[] = [
    {
      label: 'Expedientes',
      value: data?.totalMatters ?? 0,
      icon: <Folder className="h-5 w-5" />,
      color: '#3B82F6',
    },
    {
      label: 'Activos',
      value: data?.activeMatters ?? 0,
      icon: <CheckCircle className="h-5 w-5" />,
      color: '#10B981',
    },
    {
      label: 'Plazos hoy',
      value: data?.deadlinesToday ?? 0,
      icon: <Calendar className="h-5 w-5" />,
      color: '#F59E0B',
    },
    {
      label: 'Urgentes',
      value: data?.urgentDeadlines ?? 0,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: '#EF4444',
    },
    {
      label: 'Clientes',
      value: data?.totalContacts ?? 0,
      icon: <Users className="h-5 w-5" />,
      color: '#8B5CF6',
    },
    {
      label: 'Vigilancias',
      value: data?.activeWatchlists ?? 0,
      icon: <Eye className="h-5 w-5" />,
      color: '#EC4899',
    },
    {
      label: 'Alertas Spider',
      value: data?.unreadAlerts ?? 0,
      icon: <Bell className="h-5 w-5" />,
      color: '#F97316',
    },
    {
      label: 'Fact. mes',
      value: `€${(data?.monthlyInvoicing ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 0 })}`,
      icon: <Euro className="h-5 w-5" />,
      color: '#059669',
    },
  ];

  return { metrics, isLoading };
}
