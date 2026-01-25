import { 
  Briefcase, 
  Clock, 
  RefreshCw, 
  DollarSign,
  TrendingUp,
  Users,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  useDashboardMetrics,
  useMattersByType,
  useMattersByStatus,
  useCostTrend,
  useRecentActivity
} from '@/hooks/use-metrics';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PieChart, LineChart, StatCard } from '@/components/ui/charts';
import { InlineHelp } from '@/components/help';

export default function ExecutiveDashboard() {
  const { data: metrics, isLoading } = useDashboardMetrics();
  const { data: mattersByType } = useMattersByType();
  const { data: mattersByStatus } = useMattersByStatus();
  const { data: costTrend } = useCostTrend(12);
  const { data: activity = [] } = useRecentActivity(5);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const getMetricNumber = (metric: { value: number | string | Record<string, unknown> } | undefined): number => {
    if (!metric) return 0;
    if (typeof metric.value === 'number') return metric.value;
    if (typeof metric.value === 'string') return parseFloat(metric.value) || 0;
    return 0;
  };
  
  if (isLoading) {
    return <DashboardSkeleton />;
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Dashboard
            <InlineHelp text="Panel ejecutivo con métricas clave de tu cartera de PI: total de expedientes, costes, renovaciones próximas y distribución por tipo y estado." />
          </h1>
          <p className="text-muted-foreground">Resumen de tu cartera de propiedad intelectual</p>
        </div>
        <div className="flex gap-2">
          <Link 
            to="/app/reports"
            className="px-4 py-2 border rounded-lg hover:bg-muted/50 text-sm"
          >
            Ver informes
          </Link>
          <Link 
            to="/app/reports/new"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm"
          >
            Generar informe
          </Link>
        </div>
      </div>
      
      {/* KPIs principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Expedientes"
          value={getMetricNumber(metrics?.total_matters)}
          icon={Briefcase}
          color="#3B82F6"
          href="/app/docket"
        />
        <StatCard
          title="Expedientes Activos"
          value={getMetricNumber(metrics?.active_matters)}
          icon={Clock}
          color={getMetricNumber(metrics?.active_matters) > 50 ? "#EF4444" : "#F59E0B"}
          href="/app/docket?status=active"
        />
        <StatCard
          title="Renovaciones 90d"
          value={getMetricNumber(metrics?.renewals_due_90)}
          icon={RefreshCw}
          color="#F59E0B"
          href="/app/finance/renewals"
        />
        <StatCard
          title="Costes del Mes"
          value={formatCurrency(getMetricNumber(metrics?.monthly_costs))}
          icon={DollarSign}
          color="#22C55E"
          href="/app/finance/costs"
          isFormatted
        />
      </div>
      
      {/* Segunda fila de KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Facturado"
          value={formatCurrency(getMetricNumber(metrics?.invoiced_this_month))}
          icon={TrendingUp}
          color="#8B5CF6"
          href="/app/finance/invoices"
          isFormatted
          subtitle="este mes"
        />
        <StatCard
          title="Cobrado"
          value={formatCurrency(getMetricNumber(metrics?.collected_this_month))}
          icon={TrendingUp}
          color="#22C55E"
          href="/app/finance/invoices?status=paid"
          isFormatted
          subtitle="este mes"
        />
        <StatCard
          title="Contactos"
          value={getMetricNumber(metrics?.total_contacts)}
          icon={Users}
          color="#EC4899"
          href="/app/crm/contacts"
        />
        <StatCard
          title="Alertas Vigilancia"
          value={getMetricNumber(metrics?.watch_alerts)}
          icon={Eye}
          color={getMetricNumber(metrics?.watch_alerts) > 0 ? "#EF4444" : "#6B7280"}
          href="/app/spider"
          alert={getMetricNumber(metrics?.watch_alerts) > 0}
        />
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border p-6">
          <h3 className="font-semibold text-foreground mb-4">Expedientes por Tipo</h3>
          {mattersByType && mattersByType.labels.length > 0 ? (
            <div className="h-64">
              <PieChart data={mattersByType} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Sin datos
            </div>
          )}
        </div>
        
        <div className="bg-card rounded-xl border p-6">
          <h3 className="font-semibold text-foreground mb-4">Expedientes por Estado</h3>
          {mattersByStatus && mattersByStatus.labels.length > 0 ? (
            <div className="h-64">
              <PieChart data={mattersByStatus} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Sin datos
            </div>
          )}
        </div>
      </div>
      
      {/* Tendencia de costes */}
      <div className="bg-card rounded-xl border p-6">
        <h3 className="font-semibold text-foreground mb-4">Evolución de Costes (12 meses)</h3>
        {costTrend && costTrend.labels.length > 0 ? (
          <div className="h-64">
            <LineChart data={costTrend} />
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Sin datos de costes
          </div>
        )}
      </div>
      
      {/* Actividad reciente */}
      <div className="bg-card rounded-xl border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-foreground">Actividad Reciente</h3>
        </div>
        <div className="divide-y">
          {activity.slice(0, 5).map(item => (
            <ActivityRow key={item.id} activity={item} />
          ))}
          {activity.length === 0 && (
            <p className="p-4 text-center text-muted-foreground text-sm">Sin actividad reciente</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ activity }: { activity: { id: string; action: string; resource_type: string; created_at: string; user?: { full_name: string } } }) {
  const actionLabels: Record<string, string> = {
    create: 'creó',
    update: 'actualizó',
    delete: 'eliminó',
  };
  
  return (
    <div className="p-3">
      <p className="text-sm">
        <span className="font-medium">{activity.user?.full_name || 'Usuario'}</span>
        {' '}{actionLabels[activity.action] || activity.action}{' '}
        <span className="text-muted-foreground">{activity.resource_type}</span>
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">
        {format(new Date(activity.created_at), 'dd/MM HH:mm', { locale: es })}
      </p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 bg-muted rounded w-48"></div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl"></div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="h-80 bg-muted rounded-xl"></div>
        <div className="h-80 bg-muted rounded-xl"></div>
      </div>
    </div>
  );
}
