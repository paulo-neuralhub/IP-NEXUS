/**
 * IP-SPIDER - KPIs superiores con NeoBadge SILK
 * Sistema de diseño SILK
 */

import { NeoBadge } from '@/components/ui/neo-badge';
import { Skeleton } from '@/components/ui/skeleton';

interface SpiderKPIsProps {
  stats?: {
    activeWatchlists: number;
    unreviewedResults: number;
    activeThreats: number;
    unreadAlerts: number;
  };
  loading?: boolean;
}

const SPIDER_KPIS = [
  { 
    key: 'activeWatchlists',
    label: 'Vigilancias Activas',
    icon: '📊',
    description: 'Monitorizando marcas',
    color: '#2563eb',
    urgentThreshold: 0
  },
  { 
    key: 'unreviewedResults',
    label: 'Sin Revisar',
    icon: '📥',
    description: 'Pendientes de análisis',
    color: '#00b4d8',
    urgentThreshold: 0
  },
  { 
    key: 'activeThreats',
    label: 'Amenazas Activas',
    icon: '⚠️',
    description: 'Requieren atención',
    color: '#ef4444',
    urgentThreshold: 1
  },
  { 
    key: 'unreadAlerts',
    label: 'Alertas sin Leer',
    icon: '🔔',
    description: 'Notificaciones nuevas',
    color: '#f59e0b',
    urgentThreshold: 0
  }
] as const;

export function SpiderKPIs({ stats, loading }: SpiderKPIsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {SPIDER_KPIS.map(kpi => {
        const value = stats?.[kpi.key as keyof typeof stats] ?? 0;
        const isUrgent = value >= kpi.urgentThreshold && kpi.key === 'activeThreats';

        return (
          <div
            key={kpi.key}
            className="rounded-[14px] border border-black/[0.06] p-4 hover:border-[rgba(0,180,216,0.15)] transition-colors"
            style={{ background: '#f1f4f9' }}
          >
            <div className="flex items-center gap-3">
              {loading ? (
                <Skeleton className="h-[46px] w-[46px] rounded-xl" />
              ) : (
                <div className="relative">
                  {/* LED para amenazas activas */}
                  {isUrgent && value > 0 && (
                    <>
                      <div 
                        className="absolute -inset-1 rounded-[14px] animate-[led-pulse_2s_ease-in-out_infinite]"
                        style={{
                          background: `${kpi.color}25`,
                          border: `2px solid ${kpi.color}40`
                        }}
                      />
                      <div 
                        className="absolute -inset-1 rounded-[14px] animate-[led-ping_1.5s_ease-out_infinite]"
                        style={{
                          border: `2px solid ${kpi.color}30`
                        }}
                      />
                    </>
                  )}
                  <NeoBadge
                    value={value}
                    color={value > 0 ? kpi.color : '#94a3b8'}
                    size="md"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{kpi.icon}</span>
                  <p 
                    className="text-[11px] font-semibold uppercase tracking-wide truncate"
                    style={{ color: '#0a2540' }}
                  >
                    {kpi.label}
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
