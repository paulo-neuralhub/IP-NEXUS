import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ALERT_TYPES, ALERT_SEVERITIES } from '@/lib/constants/spider';
import { useSpiderAlerts, useMarkAlertRead, useMarkAllAlertsRead } from '@/hooks/use-spider';
import type { SpiderAlert, AlertType, AlertSeverity } from '@/types/spider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  limit?: number;
  showMarkAll?: boolean;
}

export function AlertsPanel({ limit = 10, showMarkAll = true }: Props) {
  const { data: alerts, isLoading } = useSpiderAlerts({ status: 'unread' });
  const markRead = useMarkAlertRead();
  const markAllRead = useMarkAllAlertsRead();
  
  const displayAlerts = alerts?.slice(0, limit) || [];
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }
  
  if (displayAlerts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p>No hay alertas pendientes</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {showMarkAll && displayAlerts.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="w-4 h-4 mr-1" />
            Marcar todas leídas
          </Button>
        </div>
      )}
      
      {displayAlerts.map(alert => (
        <AlertItem 
          key={alert.id} 
          alert={alert}
          onMarkRead={() => markRead.mutate(alert.id)}
        />
      ))}
    </div>
  );
}

function AlertItem({ alert, onMarkRead }: { alert: SpiderAlert; onMarkRead: () => void }) {
  const typeConfig = ALERT_TYPES[alert.alert_type as AlertType];
  const severityConfig = ALERT_SEVERITIES[alert.severity as AlertSeverity];
  
  return (
    <div 
      className={cn(
        "p-3 rounded-lg border transition-colors cursor-pointer hover:bg-accent/50",
        alert.severity === 'critical' && "border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20",
        alert.severity === 'high' && "border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20"
      )}
      onClick={onMarkRead}
    >
      <div className="flex items-start gap-3">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${typeConfig?.color || '#6B7280'}20` }}
        >
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: severityConfig?.color || '#6B7280' }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <p className="font-medium text-foreground text-sm">{alert.title}</p>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: es })}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{alert.message}</p>
          
          {alert.action_url && (
            <a
              href={alert.action_url}
              className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              Ver detalles <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
