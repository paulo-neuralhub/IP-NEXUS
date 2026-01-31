// ============================================================
// IP-NEXUS - DEADLINE KPIs COMPONENT
// L125: Interactive KPI cards with semantic colors
// ============================================================

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, Clock, CalendarDays, CheckCircle2, AlertOctagon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DeadlineKPIsProps {
  stats: {
    overdue: number;
    urgent: number;
    upcoming: number;
    thisMonth: number;
  };
  isLoading?: boolean;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function DeadlineKPIs({ stats, isLoading, activeFilter, onFilterChange }: DeadlineKPIsProps) {
  const kpiCards = [
    {
      key: 'overdue',
      label: 'Vencidos',
      value: stats.overdue,
      icon: AlertOctagon,
      hasData: stats.overdue > 0,
      colors: {
        active: 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/30',
        ring: 'ring-2 ring-red-500',
        iconBg: 'bg-red-100 dark:bg-red-900/50',
        iconColor: 'text-red-600',
        valueColor: 'text-red-600',
      },
      description: 'Requieren acción urgente',
      showWarning: true,
    },
    {
      key: 'urgent',
      label: 'Urgentes',
      value: stats.urgent,
      icon: Clock,
      hasData: stats.urgent > 0,
      colors: {
        active: 'border-orange-300 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/30',
        ring: 'ring-2 ring-orange-500',
        iconBg: 'bg-orange-100 dark:bg-orange-900/50',
        iconColor: 'text-orange-600',
        valueColor: 'text-orange-600',
      },
      description: 'Próximos 7 días',
      showWarning: false,
    },
    {
      key: 'upcoming',
      label: 'Próximos',
      value: stats.upcoming,
      icon: CalendarDays,
      hasData: true,
      colors: {
        active: 'border-yellow-300 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/30',
        ring: 'ring-2 ring-yellow-500',
        iconBg: 'bg-yellow-100 dark:bg-yellow-900/50',
        iconColor: 'text-yellow-600',
        valueColor: 'text-yellow-600',
      },
      description: 'Próximos 30 días',
      showWarning: false,
    },
    {
      key: 'thisMonth',
      label: 'Este mes',
      value: stats.thisMonth,
      icon: CheckCircle2,
      hasData: true,
      colors: {
        active: '',
        ring: 'ring-2 ring-primary',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
        valueColor: 'text-foreground',
      },
      description: format(new Date(), 'MMMM yyyy', { locale: es }),
      showWarning: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpiCards.map((kpi) => {
        const Icon = kpi.icon;
        const isActive = activeFilter === kpi.key;

        return (
          <Card
            key={kpi.key}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              kpi.hasData && kpi.colors.active,
              isActive && kpi.colors.ring
            )}
            onClick={() => onFilterChange(isActive ? 'all' : kpi.key)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className={cn(
                      'text-2xl font-bold',
                      kpi.hasData && kpi.value > 0 ? kpi.colors.valueColor : 'text-muted-foreground'
                    )}
                  >
                    {isLoading ? '...' : kpi.value}
                  </p>
                  <p className="text-sm font-medium">{kpi.label}</p>
                </div>
                <div
                  className={cn(
                    'p-2 rounded-lg',
                    kpi.hasData && kpi.value > 0 ? kpi.colors.iconBg : 'bg-muted'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      kpi.hasData && kpi.value > 0 ? kpi.colors.iconColor : 'text-muted-foreground'
                    )}
                  />
                </div>
              </div>

              {kpi.showWarning && kpi.value > 0 ? (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {kpi.description}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-2">{kpi.description}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
