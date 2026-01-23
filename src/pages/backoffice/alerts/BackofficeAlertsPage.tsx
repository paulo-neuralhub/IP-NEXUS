import * as React from "react";
import { AlertTriangle, CheckCircle2, Clock, ShieldAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveBackofficeAlerts, useAlertActions } from "@/hooks/backoffice/useBackofficeAlerts";

function priorityBadgeVariant(priority: string) {
  if (priority === "critical" || priority === "high") return "destructive" as const;
  if (priority === "medium") return "secondary" as const;
  return "outline" as const;
}

export default function BackofficeAlertsPage() {
  const { data, isLoading } = useActiveBackofficeAlerts({ limit: 100 });
  const actions = useAlertActions();

  const alerts = data ?? [];
  const critical = alerts.filter((a: any) => a.priority === "critical").length;
  const high = alerts.filter((a: any) => a.priority === "high").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alertas</h1>
          <p className="text-muted-foreground">Pendientes por prioridad y estado</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={critical ? "destructive" : "outline"} className="gap-1">
            <ShieldAlert className="h-3.5 w-3.5" />
            {critical} críticas
          </Badge>
          <Badge variant={high ? "destructive" : "outline"} className="gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            {high} altas
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="rounded-lg border p-6 text-center text-muted-foreground">No hay alertas pendientes.</div>
          ) : (
            alerts.map((a: any) => (
              <div key={a.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={priorityBadgeVariant(a.priority)}>{a.priority}</Badge>
                      <Badge variant="outline">{a.alert_type}</Badge>
                      {a.organization_name ? (
                        <Badge variant="secondary">{a.organization_name}</Badge>
                      ) : null}
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {a.status}
                      </Badge>
                    </div>
                    <p className="font-medium text-foreground mt-2 break-words">{a.title}</p>
                    {a.message ? <p className="text-sm text-muted-foreground mt-1">{a.message}</p> : null}
                    {a.suggested_action ? (
                      <p className="text-sm text-muted-foreground mt-2">
                        <span className="font-medium text-foreground">Sugerencia:</span> {a.suggested_action}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end">
                    {a.status === "active" ? (
                      <Button variant="secondary" size="sm" onClick={() => actions.acknowledge(a.id)}>
                        Ver
                      </Button>
                    ) : null}
                    {a.status !== "resolved" ? (
                      <Button variant="outline" size="sm" onClick={() => actions.inProgress(a.id)}>
                        En progreso
                      </Button>
                    ) : null}
                    <Button variant="outline" size="sm" onClick={() => actions.resolve(a.id)} className="gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Resolver
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => actions.dismiss(a.id)}>
                      Ignorar
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
