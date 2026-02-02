// =====================================================
// IP-NEXUS - CLIENT QUICK METRICS (PROMPT 27)
// Barra de métricas rápidas estilo enterprise
// =====================================================

import { Card } from '@/components/ui/card';
import { Briefcase, FileText, Clock, AlertTriangle, CreditCard, Building2, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientMetrics {
  total_matters: number;
  active_matters: number;
  total_documents: number;
  pending_deadlines: number;
  overdue_deadlines: number;
  total_alerts: number;
  total_holders: number;
  total_contacts: number;
  total_invoiced: number;
  total_pending: number;
  total_paid: number;
}

interface ClientQuickMetricsProps {
  metrics: ClientMetrics;
}

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  variant: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'teal' | 'gray' | 'emerald';
}

function MetricCard({ icon: Icon, label, value, subValue, variant }: MetricCardProps) {
  const variants = {
    blue: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/50',
    green: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/50',
    emerald: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50',
    red: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/50',
    amber: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/50',
    purple: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/50',
    teal: 'text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-950/50',
    gray: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/50',
  };

  const iconBg = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
    teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-400',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };

  return (
    <Card className={cn("p-3 flex items-center gap-3 border-none shadow-sm", variants[variant])}>
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", iconBg[variant])}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-none">{value}</p>
        <p className="text-xs opacity-80 mt-0.5">{label}</p>
        {subValue && (
          <p className="text-[10px] opacity-60">{subValue}</p>
        )}
      </div>
    </Card>
  );
}

export function ClientQuickMetrics({ metrics }: ClientQuickMetricsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-muted/30 border-b">
      <div className="px-6 py-3">
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
          <MetricCard
            icon={Briefcase}
            label="Expedientes"
            value={metrics.total_matters}
            subValue={metrics.active_matters > 0 ? `${metrics.active_matters} activos` : undefined}
            variant="blue"
          />
          <MetricCard
            icon={FileText}
            label="Documentos"
            value={metrics.total_documents}
            variant="purple"
          />
          <MetricCard
            icon={Clock}
            label="Plazos"
            value={metrics.pending_deadlines}
            subValue={metrics.overdue_deadlines > 0 ? `${metrics.overdue_deadlines} vencidos` : undefined}
            variant={metrics.overdue_deadlines > 0 ? 'red' : 'amber'}
          />
          <MetricCard
            icon={AlertTriangle}
            label="Alertas"
            value={metrics.total_alerts}
            variant={metrics.total_alerts > 0 ? 'red' : 'gray'}
          />
          <MetricCard
            icon={TrendingUp}
            label="Facturado"
            value={formatCurrency(metrics.total_invoiced)}
            variant="emerald"
          />
          <MetricCard
            icon={CreditCard}
            label="Pendiente"
            value={formatCurrency(metrics.total_pending)}
            variant={metrics.total_pending > 0 ? 'amber' : 'gray'}
          />
          <MetricCard
            icon={Building2}
            label="Titulares"
            value={metrics.total_holders}
            variant="teal"
          />
          <MetricCard
            icon={Users}
            label="Contactos"
            value={metrics.total_contacts}
            variant="purple"
          />
        </div>
      </div>
    </div>
  );
}
