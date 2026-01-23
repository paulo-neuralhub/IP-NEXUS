import * as React from "react";
import { AlertTriangle, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSystemLogs, type SystemLogSeverity } from "@/hooks/backoffice/useSystemLogs";

const severities: Array<SystemLogSeverity | "all"> = ["all", "critical", "error", "warning", "info", "debug"];

export default function SystemLogsPage() {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<string | null>(null);
  const [severity, setSeverity] = React.useState<SystemLogSeverity | null>(null);

  const q = useSystemLogs({ search, category, severity });
  const rows = q.data?.pages.flatMap((p) => p.rows) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Logs del Sistema</h1>
        <p className="text-muted-foreground">Registro completo de eventos (vista compat sobre system_events)</p>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle className="text-base">Filtros</CardTitle>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar (título, descripción, tipo)…"
                className="pl-9"
              />
            </div>

            <Select value={category ?? "all"} onValueChange={(v) => setCategory(v === "all" ? null : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {[
                  "auth",
                  "subscription",
                  "payment",
                  "voip",
                  "crm",
                  "system",
                  "security",
                  "support",
                  "ai",
                ].map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={(severity ?? "all") as string}
              onValueChange={(v) => setSeverity(v === "all" ? null : (v as SystemLogSeverity))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Severidad" />
              </SelectTrigger>
              <SelectContent>
                {severities.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "Todas las severidades" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {q.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-lg border p-6 text-center text-muted-foreground">No hay resultados.</div>
          ) : (
            <div className="space-y-2">
              {rows.map((log: any) => (
                <div key={log.id} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{log.category}</Badge>
                      <Badge variant={log.severity === "critical" || log.severity === "error" ? "destructive" : "outline"}>
                        {log.severity}
                      </Badge>
                      {log.requires_action ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Requiere acción
                        </Badge>
                      ) : null}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.occurred_at), { addSuffix: true, locale: es })}
                    </span>
                  </div>

                  <div className="mt-2">
                    <p className="font-medium text-foreground">{log.title}</p>
                    {log.description ? (
                      <p className="text-sm text-muted-foreground mt-1">{log.description}</p>
                    ) : null}
                    <p className="text-xs text-muted-foreground mt-2">{log.event_type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {q.hasNextPage ? (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => q.fetchNextPage()} disabled={q.isFetchingNextPage}>
                {q.isFetchingNextPage ? "Cargando…" : "Cargar más"}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
