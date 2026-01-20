// ============================================
// src/components/legal-ops/ClientAlerts.tsx
// ============================================

import { AlertTriangle, Clock, FileText, MessageSquare } from 'lucide-react';
import { ClientAlert } from '@/hooks/legal-ops/useClientDetail';
import { cn } from '@/lib/utils';

interface ClientAlertsProps {
  alerts: ClientAlert[];
  maxItems?: number;
}

export function ClientAlerts({ alerts, maxItems = 5 }: ClientAlertsProps) {
  const displayedAlerts = alerts.slice(0, maxItems);
  const hasMore = alerts.length > maxItems;

  const getAlertIcon = (type: ClientAlert['type']) => {
    switch (type) {
      case 'deadline':
        return <Clock className="w-4 h-4" />;
      case 'document_expiry':
        return <FileText className="w-4 h-4" />;
      case 'pending_response':
        return <MessageSquare className="w-4 h-4" />;
      case 'document_awaiting':
        return <FileText className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSeverityClasses = (severity: ClientAlert['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
      case 'medium':
        return 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400';
    }
  };

  if (alerts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay alertas activas
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {displayedAlerts.map((alert) => (
        <div
          key={alert.id}
          className={cn(
            'flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:opacity-80',
            getSeverityClasses(alert.severity)
          )}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getAlertIcon(alert.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {alert.title}
            </p>
            <p className="text-xs opacity-80">
              {alert.description}
            </p>
          </div>
          {alert.days_remaining !== undefined && alert.days_remaining <= 7 && (
            <span className="flex-shrink-0 text-xs font-medium">
              {alert.days_remaining}d
            </span>
          )}
        </div>
      ))}

      {hasMore && (
        <button className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
          Ver {alerts.length - maxItems} alertas más
        </button>
      )}
    </div>
  );
}
