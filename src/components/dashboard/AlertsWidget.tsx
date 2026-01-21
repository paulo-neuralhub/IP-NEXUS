import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, AlertTriangle, ChevronRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardAlerts } from '@/hooks/usePredictiveAlerts';
import type { AlertSeverity } from '@/types/predictive-alerts';

const SEVERITY_ICON_COLORS: Record<AlertSeverity, string> = {
  critical: 'text-destructive',
  high: 'text-orange-500',
  medium: 'text-warning',
  low: 'text-info',
};

const SEVERITY_BG: Record<AlertSeverity, string> = {
  critical: 'border-destructive/20 bg-destructive/5',
  high: 'border-orange-200 bg-orange-50',
  medium: 'border-warning/20 bg-warning/5',
  low: 'border-info/20 bg-info/5',
};

export function AlertsWidget() {
  const { data: alerts, isLoading } = useDashboardAlerts(5);
  
  const criticalCount = alerts?.filter(a => a.severity === 'critical').length || 0;
  const highCount = alerts?.filter(a => a.severity === 'high').length || 0;
  const urgentCount = criticalCount + highCount;

  return (
    <Card className={cn(urgentCount > 0 && 'border-destructive/30')}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className={cn("h-4 w-4", urgentCount > 0 && "text-destructive")} />
          Alertas IA
          {urgentCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {urgentCount}
            </Badge>
          )}
        </CardTitle>
        <Link to="/app/alerts">
          <Button variant="ghost" size="sm">
            Ver todas <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : alerts && alerts.length > 0 ? (
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {alerts.map((alert) => (
                <Link
                  key={alert.id}
                  to="/app/alerts"
                  className={cn(
                    "block p-3 rounded-lg border transition-colors hover:bg-muted",
                    SEVERITY_BG[alert.severity as AlertSeverity]
                  )}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle 
                      className={cn(
                        "h-4 w-4 mt-0.5 shrink-0",
                        SEVERITY_ICON_COLORS[alert.severity as AlertSeverity]
                      )} 
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium line-clamp-2">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(alert.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Sin alertas activas</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
