// ============================================================
// IP-NEXUS - DEADLINE KPIs COMPONENT
// L125: Interactive KPI cards with NeoBadge neumorphic style
// ============================================================

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { NeoBadge } from '@/components/ui/neo-badge';
import { cn } from '@/lib/utils';

// Color mapping for KPI types (hex)
const KPI_COLORS: Record<string, string> = {
  overdue: '#ef4444',   // red
  urgent: '#f59e0b',    // amber/orange
  upcoming: '#f59e0b',  // amber
  thisMonth: '#00b4d8', // accent cyan
};

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
      label: 'VENCIDOS',
      value: stats.overdue,
      color: KPI_COLORS.overdue,
      description: 'Requieren acción urgente',
      showWarning: true,
    },
    {
      key: 'urgent',
      label: 'URGENTES',
      value: stats.urgent,
      color: KPI_COLORS.urgent,
      description: 'Próximos 7 días',
      showWarning: false,
    },
    {
      key: 'upcoming',
      label: 'PRÓXIMOS',
      value: stats.upcoming,
      color: KPI_COLORS.upcoming,
      description: 'Próximos 30 días',
      showWarning: false,
    },
    {
      key: 'thisMonth',
      label: 'ESTE MES',
      value: stats.thisMonth,
      color: KPI_COLORS.thisMonth,
      description: format(new Date(), 'MMMM yyyy', { locale: es }),
      showWarning: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpiCards.map((kpi) => {
        const isActive = activeFilter === kpi.key;

        return (
          <Card
            key={kpi.key}
            className={cn(
              'cursor-pointer transition-all border rounded-[14px] hover:border-[rgba(0,180,216,0.15)]',
              isActive && 'ring-2 ring-primary'
            )}
            style={{ 
              background: '#f1f4f9',
              borderColor: kpi.value > 0 && kpi.key === 'overdue' 
                ? 'rgba(239, 68, 68, 0.2)' 
                : kpi.value > 0 && kpi.key === 'urgent'
                ? 'rgba(245, 158, 11, 0.2)'
                : 'rgba(0,0,0,0.06)',
              boxShadow: kpi.value > 0 && (kpi.key === 'overdue' || kpi.key === 'urgent')
                ? `0 0 0 1px ${kpi.color}15`
                : 'none',
            }}
            onClick={() => onFilterChange(isActive ? 'all' : kpi.key)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {/* NeoBadge with value */}
                <NeoBadge
                  value={isLoading ? '...' : kpi.value}
                  color={kpi.value > 0 ? kpi.color : '#94a3b8'}
                  size="md"
                />
                
                {/* Label and description */}
                <div className="min-w-0 flex-1">
                  <p 
                    className="text-[11px] font-semibold uppercase tracking-wide"
                    style={{ color: '#0a2540' }}
                  >
                    {kpi.label}
                  </p>
                  
                  {kpi.showWarning && kpi.value > 0 ? (
                    <p className="text-[9px] flex items-center gap-1" style={{ color: '#ef4444' }}>
                      <AlertTriangle className="h-3 w-3" />
                      {kpi.description}
                    </p>
                  ) : (
                    <p 
                      className="text-[9px]"
                      style={{ color: kpi.value > 0 ? kpi.color : '#94a3b8' }}
                    >
                      {kpi.description}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
