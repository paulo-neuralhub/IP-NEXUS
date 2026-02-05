/**
 * IP-SPIDER - Alerts Panel con diseño SILK
 */

import { Bell, CheckCheck, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ALERT_SEVERITIES } from '@/lib/constants/spider';
import { useSpiderAlerts, useMarkAlertRead, useMarkAllAlertsRead } from '@/hooks/use-spider';
import type { SpiderAlert, AlertSeverity } from '@/types/spider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  limit?: number;
  showMarkAll?: boolean;
}

const SEVERITY_BORDER_COLORS: Record<AlertSeverity, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#94a3b8'
};

export function SilkAlertsPanel({ limit = 10, showMarkAll = true }: Props) {
  const { data: alerts, isLoading } = useSpiderAlerts({ status: 'unread' });
  const markRead = useMarkAlertRead();
  const markAllRead = useMarkAllAlertsRead();
  
  const displayAlerts = alerts?.slice(0, limit) || [];
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20 rounded-[14px]" />
        ))}
      </div>
    );
  }
  
  if (displayAlerts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay alertas pendientes</p>
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
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1" />
            Marcar todas leídas
          </Button>
        </div>
      )}
      
      <div className="space-y-2">
        {displayAlerts.map(alert => (
          <AlertItem 
            key={alert.id} 
            alert={alert}
            onMarkRead={() => markRead.mutate(alert.id)}
          />
        ))}
      </div>
    </div>
  );
}

function AlertItem({ alert, onMarkRead }: { alert: SpiderAlert; onMarkRead: () => void }) {
  const severityConfig = ALERT_SEVERITIES[alert.severity as AlertSeverity];
  const borderColor = SEVERITY_BORDER_COLORS[alert.severity as AlertSeverity];
  
  return (
    <div 
      className={cn(
        "rounded-[14px] border border-black/[0.06] p-4 cursor-pointer transition-all hover:border-[rgba(0,180,216,0.15)]",
        "border-l-4"
      )}
      style={{ 
        background: '#f1f4f9',
        borderLeftColor: borderColor
      }}
      onClick={onMarkRead}
    >
      <div className="flex items-start gap-3">
        {/* Icon circle */}
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ 
            background: `${borderColor}15`
          }}
        >
          <AlertCircle 
            className="w-4 h-4" 
            style={{ color: borderColor }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-[#0a2540] leading-tight">{alert.title}</p>
            <span className="text-[10px] text-muted-foreground flex-shrink-0">
              {formatDistanceToNow(new Date(alert.created_at), { addSuffix: false, locale: es })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{alert.message}</p>
        </div>
      </div>
    </div>
  );
}
