// ============================================================
// IP-NEXUS - ALERT BANNER COMPONENT
// L89: Banner prominente para alertas críticas/fatales
// ============================================================

import { useState } from 'react';
import { useDeadlineNotifications, getPriorityConfig } from '@/hooks/useDeadlineNotifications';
import { AlertTriangle, X, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface AlertBannerProps {
  className?: string;
}

export function AlertBanner({ className }: AlertBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const { data: notifications, isLoading } = useDeadlineNotifications(10);

  // Filtrar solo notificaciones críticas/high y no descartadas
  const criticalAlerts = notifications?.filter(
    (n) => (n.priority === 'critical' || n.priority === 'high') && !dismissedIds.includes(n.id)
  ) || [];

  if (isLoading || criticalAlerts.length === 0) {
    return null;
  }

  const urgentCount = criticalAlerts.length;
  const mostUrgent = criticalAlerts[0];
  const priorityConfig = getPriorityConfig(mostUrgent.priority);

  return (
    <div
      className={cn(
        'bg-destructive text-destructive-foreground',
        'border-b border-destructive/20',
        'px-4 py-2 flex items-center justify-between gap-4',
        'animate-pulse-subtle',
        className
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Icono de alerta */}
        <div className="shrink-0 h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
          <AlertTriangle className="h-4 w-4" />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">
            {urgentCount === 1
              ? `⚠️ PLAZO CRÍTICO: ${mostUrgent.title}`
              : `⚠️ ${urgentCount} PLAZOS CRÍTICOS PENDIENTES`}
          </p>
          {urgentCount === 1 && mostUrgent.message && (
            <p className="text-xs text-white/80 truncate flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {mostUrgent.message}
            </p>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 shrink-0">
        <Link
          to="/app/docket/deadlines"
          className="flex items-center gap-1 text-xs font-medium bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
        >
          Ver todos
          <ChevronRight className="h-3 w-3" />
        </Link>

        {urgentCount === 1 && (
          <button
            type="button"
            onClick={() => setDismissedIds([...dismissedIds, mostUrgent.id])}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Descartar temporalmente"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// CSS animation for subtle pulse
const pulseStyles = `
  @keyframes pulse-subtle {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.85; }
  }
  .animate-pulse-subtle {
    animation: pulse-subtle 2s ease-in-out infinite;
  }
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = pulseStyles;
  document.head.appendChild(style);
}
