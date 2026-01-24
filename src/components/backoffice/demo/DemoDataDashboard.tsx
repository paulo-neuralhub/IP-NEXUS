import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, DonutChart, LineChart, PieChart } from "@/components/ui/charts";
import { Skeleton } from "@/components/ui/skeleton";
import { useDemoDataDashboard } from "@/hooks/backoffice/demo/useDemoDataDashboard";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function formatCurrencyEUR(value: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);
}

function priorityBadgeVariant(priority: string | null | undefined): "default" | "secondary" | "destructive" | "outline" {
  switch ((priority || "").toLowerCase()) {
    case "critical":
      return "destructive";
    case "high":
      return "default";
    case "medium":
      return "secondary";
    case "low":
      return "outline";
    default:
      return "secondary";
  }
}

export function DemoDataDashboard() {
  const { data, isLoading, error } = useDemoDataDashboard();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Demo Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No se pudo cargar el dashboard demo.
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Verificación de datos demo</h2>
        <p className="text-sm text-muted-foreground">
          KPIs, gráficos y listas calculados desde la DB de la organización seleccionada.
        </p>
      </div>

      {/* Cards principales */}
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard title="Total expedientes" value={data.kpis.totalMatters.toLocaleString("es-ES")} />
        <KpiCard title="Plazos próximos (30d)" value={data.kpis.upcomingDeadlines30d.toLocaleString("es-ES")} />
        <KpiCard title="Facturas pendientes (EUR)" value={formatCurrencyEUR(data.kpis.pendingInvoicesEur)} />
        <KpiCard title="Clientes activos" value={data.kpis.activeClients.toLocaleString("es-ES")} />
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Expedientes por estado (pie)">
          <PieChart data={data.charts.mattersByStatus} />
        </ChartCard>

        <ChartCard title="Por tipo PI (donut)">
          <DonutChart data={data.charts.mattersByType} />
        </ChartCard>

        <ChartCard title="Por jurisdicción (bar)">
          <BarChart data={data.charts.mattersByJurisdiction} />
        </ChartCard>

        <ChartCard title="Evolución mensual (line)">
          <LineChart data={data.charts.monthlyEvolution} />
        </ChartCard>
      </div>

      {/* Listas */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plazos (5 más urgentes)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.lists.deadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin plazos urgentes.</p>
            ) : (
              data.lists.deadlines.map((d) => (
                <div key={d.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{d.title}</p>
                      {d.deadline_type ? (
                        <Badge variant="outline" className="shrink-0">
                          {d.deadline_type}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {d.matter_ref ? `${d.matter_ref} · ` : ""}
                      {format(new Date(d.deadline_date), "dd MMM yyyy", { locale: es })}
                    </p>
                  </div>
                  <Badge variant={priorityBadgeVariant(d.priority)} className="shrink-0">
                    {(d.priority || "medium").toUpperCase()}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tareas asignadas a mí</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.lists.tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay tareas asignadas.</p>
            ) : (
              data.lists.tasks.map((t) => (
                <div key={t.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.matter_ref ? `${t.matter_ref} · ` : ""}
                      {t.due_date ? format(new Date(t.due_date), "dd MMM yyyy", { locale: es }) : "Sin fecha"}
                    </p>
                  </div>
                  <Badge variant={priorityBadgeVariant(t.priority)} className="shrink-0">
                    {(t.priority || "medium").toUpperCase()}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function KpiCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-64">{children}</CardContent>
    </Card>
  );
}
