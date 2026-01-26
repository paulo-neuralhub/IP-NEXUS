// =============================================
// COMPONENTE: MetricsBar
// Barra compacta de métricas principales
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
import { Card } from '@/components/ui/card';

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

export function MetricsBar({ metrics }: MetricsBarProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {metrics.map((metric, idx) => (
        <MetricCard key={idx} metric={metric} />
      ))}
    </div>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <Card className="flex items-center gap-3 p-3 hover:shadow-md transition-shadow cursor-pointer">
      <div 
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${metric.color}15`, color: metric.color }}
      >
        {metric.icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-bold text-foreground truncate">
          {metric.value}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {metric.label}
        </p>
        {metric.change !== undefined && (
          <p className={cn(
            "text-[10px] font-medium",
            metric.change >= 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {metric.change >= 0 ? '↑' : '↓'} {Math.abs(metric.change)}% {metric.changeLabel}
          </p>
        )}
      </div>
    </Card>
  );
}

// =============================================
// Hook para obtener métricas del dashboard
// =============================================

export function useDashboardMetrics() {
  // TODO: Reemplazar con datos reales de Supabase
  const metrics: Metric[] = [
    {
      label: 'Expedientes',
      value: 127,
      change: 12,
      changeLabel: 'mes',
      icon: <Folder className="h-5 w-5" />,
      color: '#3B82F6',
    },
    {
      label: 'Activos',
      value: 84,
      icon: <CheckCircle className="h-5 w-5" />,
      color: '#10B981',
    },
    {
      label: 'Plazos hoy',
      value: 5,
      icon: <Calendar className="h-5 w-5" />,
      color: '#F59E0B',
    },
    {
      label: 'Urgentes',
      value: 3,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: '#EF4444',
    },
    {
      label: 'Clientes',
      value: 42,
      change: 8,
      changeLabel: 'mes',
      icon: <Users className="h-5 w-5" />,
      color: '#8B5CF6',
    },
    {
      label: 'Vigilancias',
      value: 18,
      icon: <Eye className="h-5 w-5" />,
      color: '#EC4899',
    },
    {
      label: 'Alertas Spider',
      value: 7,
      icon: <Bell className="h-5 w-5" />,
      color: '#F97316',
    },
    {
      label: 'Fact. mes',
      value: '€12.4k',
      change: 23,
      changeLabel: 'vs ant.',
      icon: <Euro className="h-5 w-5" />,
      color: '#059669',
    },
  ];

  return { metrics };
}
