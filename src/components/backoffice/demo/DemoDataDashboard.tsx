import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, DonutChart, LineChart, PieChart } from "@/components/ui/charts";
import { Skeleton } from "@/components/ui/skeleton";
import { useDemoDataDashboard } from "@/hooks/backoffice/demo/useDemoDataDashboard";
import { useSeedDemoData } from "@/hooks/backoffice/useDemoData";
import { useOrganization } from "@/contexts/organization-context";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { toast } from "sonner";
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
  const { currentOrganization, userRole, hasAddon } = useOrganization();
  const seed = useSeedDemoData();

  const isAdmin = userRole === "owner" || userRole === "admin";
  const hideDemoPromptKey = `ipnexus:demo_prompt:hidden:${currentOrganization?.id || "none"}`;
  const hideDemoPrompt = typeof window !== "undefined" && localStorage.getItem(hideDemoPromptKey) === "1";
  const setHideDemoPrompt = (value: boolean) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(hideDemoPromptKey, value ? "1" : "0");
  };

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

  const hasAnyDemoData =
    data.kpis.totalMatters > 0 ||
    data.kpis.activeClients > 0 ||
    data.kpis.pendingInvoicesEur > 0 ||
    data.kpis.upcomingDeadlines30d > 0;

  // Nota: en entornos dev el gating puede estar en progreso; usamos señales de datos para evitar falsos negativos.
  const hasDocket = hasAddon("docket") || data.kpis.totalMatters > 0 || data.kpis.upcomingDeadlines30d > 0;
  const hasCrm = hasAddon("crm") || data.kpis.activeClients > 0 || data.lists.tasks.length > 0;
  const hasFinance = hasAddon("finance") || data.kpis.pendingInvoicesEur > 0;

  const handleSeedDemo = async () => {
    const organizationId = currentOrganization?.id;
    if (!organizationId) return;
    try {
      const res = await seed.mutateAsync(organizationId);
      if (res.ok === false) {
        toast.error(res.error);
        return;
      }
      toast.success("Datos demo cargados");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error cargando datos demo");
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Verificación de datos demo</h2>
        <p className="text-sm text-muted-foreground">
          KPIs, gráficos y listas calculados desde la DB de la organización seleccionada.
        </p>
      </div>

      {!hasAnyDemoData && !hideDemoPrompt ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">¿Quieres cargar datos de ejemplo?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Cargaremos un dataset de demo para que puedas validar dashboards, listas y flujos end-to-end.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hide-demo-prompt"
                  checked={hideDemoPrompt}
                  onCheckedChange={(v) => setHideDemoPrompt(v === true)}
                />
                <label htmlFor="hide-demo-prompt" className="text-sm text-muted-foreground">
                  No mostrar de nuevo
                </label>
              </div>
              {isAdmin ? (
                <Button onClick={handleSeedDemo} disabled={seed.isPending}>
                  {seed.isPending ? "Cargando…" : "Cargar demo"}
                </Button>
              ) : (
                <Badge variant="secondary">Solo admins</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Cards principales */}
      <div className="grid gap-4 md:grid-cols-4">
        {data.kpis.totalMatters === 0 ? (
          <EmptyKpiCard
            title="Expedientes"
            description="Crea tu primer expediente para empezar a medir tu cartera."
            actionLabel="Crear expediente"
            to="/app/docket/new"
          />
        ) : (
          <KpiCard title="Total expedientes" value={data.kpis.totalMatters.toLocaleString("es-ES")} />
        )}

        {data.kpis.upcomingDeadlines30d === 0 ? (
          <KpiCard title="Plazos próximos (30d)" value="0" />
        ) : (
          <KpiCard title="Plazos próximos (30d)" value={data.kpis.upcomingDeadlines30d.toLocaleString("es-ES")} />
        )}

        {!hasFinance ? (
          <EmptyKpiCard
            title="Facturas"
            description="Activa Finance para emitir facturas, cobrar y ver métricas."
            actionLabel="Ver planes"
            to="/pricing"
          />
        ) : data.kpis.pendingInvoicesEur === 0 ? (
          <EmptyKpiCard
            title="Facturas"
            description="Emite tu primera factura para ver métricas de cobro y pendientes."
            actionLabel="Crear factura"
            to="/app/finance/invoices"
          />
        ) : (
          <KpiCard title="Facturas pendientes (EUR)" value={formatCurrencyEUR(data.kpis.pendingInvoicesEur)} />
        )}

        {data.kpis.activeClients === 0 ? (
          <EmptyKpiCard
            title="Clientes"
            description="Añade tu primer cliente para activar CRM y facturación por cliente."
            actionLabel="Añadir cliente"
            to="/app/crm/contacts"
          />
        ) : (
          <KpiCard title="Clientes activos" value={data.kpis.activeClients.toLocaleString("es-ES")} />
        )}
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        {!hasDocket ? (
          <ModuleInactiveCard
            title="Docket (Expedientes)"
            bullets={["Estados y KPIs de cartera", "Plazos y alertas", "Jurisdicciones y reporting"]}
            ctaLabel="Activar módulo"
            ctaTo="/pricing"
          />
        ) : data.charts.mattersByStatus.labels.length === 0 ? (
          <EmptyChartCard
            title="Expedientes por estado (pie)"
            description="Crea tu primer expediente para ver distribución por estado."
            actionLabel="Crear expediente"
            to="/app/docket/new"
          />
        ) : (
          <ChartCard title="Expedientes por estado (pie)">
            <PieChart data={data.charts.mattersByStatus} />
          </ChartCard>
        )}

        {!hasDocket ? (
          <ModuleInactiveCard
            title="Distribución por tipo PI"
            bullets={["Mix marca/patente/diseño", "Comparativas por periodos", "Insights rápidos"]}
            ctaLabel="Ver planes"
            ctaTo="/pricing"
          />
        ) : data.charts.mattersByType.labels.length === 0 ? (
          <EmptyChartCard
            title="Por tipo PI (donut)"
            description="Añade expedientes para ver el mix por tipo de PI."
            actionLabel="Crear expediente"
            to="/app/docket/new"
          />
        ) : (
          <ChartCard title="Por tipo PI (donut)">
            <DonutChart data={data.charts.mattersByType} />
          </ChartCard>
        )}

        {!hasDocket ? (
          <ModuleInactiveCard
            title="Jurisdicciones"
            bullets={["Top 10 jurisdicciones", "Workload por oficina", "Priorización por país"]}
            ctaLabel="Activar módulo"
            ctaTo="/pricing"
          />
        ) : data.charts.mattersByJurisdiction.labels.length === 0 ? (
          <EmptyChartCard
            title="Por jurisdicción (bar)"
            description="Añade expedientes con jurisdicción para ver el desglose."
            actionLabel="Crear expediente"
            to="/app/docket/new"
          />
        ) : (
          <ChartCard title="Por jurisdicción (bar)">
            <BarChart data={data.charts.mattersByJurisdiction} />
          </ChartCard>
        )}

        {data.charts.monthlyEvolution.labels.length === 0 ? (
          <EmptyChartCard
            title="Evolución mensual (line)"
            description="Necesitas expedientes para ver la evolución de altas mensuales."
            actionLabel="Crear expediente"
            to="/app/docket/new"
          />
        ) : (
          <ChartCard title="Evolución mensual (line)">
            <LineChart data={data.charts.monthlyEvolution} />
          </ChartCard>
        )}
      </div>

      {/* Listas */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plazos (5 más urgentes)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!hasDocket ? (
              <ModuleInactiveInline
                title="Plazos y alertas"
                description="Activa Docket para gestionar plazos críticos, alertas y vencimientos."
                ctaLabel="Ver planes"
                ctaTo="/pricing"
              />
            ) : data.lists.deadlines.length === 0 ? (
              <InlineEmptyState
                title="Aún no hay plazos"
                description="Crea expedientes y añade plazos para que aparezcan aquí los 5 más urgentes."
                actionLabel="Ir a plazos"
                to="/app/docket/deadlines"
              />
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
            {!hasCrm ? (
              <ModuleInactiveInline
                title="Smart Tasks"
                description="Activa CRM para asignación, prioridades y workflows de tareas."
                ctaLabel="Activar módulo"
                ctaTo="/pricing"
              />
            ) : data.lists.tasks.length === 0 ? (
              <InlineEmptyState
                title="No hay tareas asignadas"
                description="Cuando haya tareas activas asignadas a tu usuario, aparecerán aquí ordenadas por prioridad."
                actionLabel="Ver tareas"
                to="/app/crm/tasks"
              />
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

function EmptyKpiCard({
  title,
  description,
  actionLabel,
  to,
}: {
  title: string;
  description: string;
  actionLabel: string;
  to: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button asChild size="sm" variant="secondary">
          <Link to={to}>{actionLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyChartCard({
  title,
  description,
  actionLabel,
  to,
}: {
  title: string;
  description: string;
  actionLabel: string;
  to: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-64 flex flex-col items-start justify-center gap-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button asChild size="sm" variant="secondary">
          <Link to={to}>{actionLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function ModuleInactiveCard({
  title,
  bullets,
  ctaLabel,
  ctaTo,
}: {
  title: string;
  bullets: string[];
  ctaLabel: string;
  ctaTo: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title} (no activo)</CardTitle>
      </CardHeader>
      <CardContent className="h-64 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Preview de la funcionalidad:</p>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        <Button asChild>
          <Link to={ctaTo}>{ctaLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function ModuleInactiveInline({
  title,
  description,
  ctaLabel,
  ctaTo,
}: {
  title: string;
  description: string;
  ctaLabel: string;
  ctaTo: string;
}) {
  return (
    <div className="rounded-lg border p-4 space-y-2">
      <p className="text-sm font-medium text-foreground">{title} (no activo)</p>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Button asChild size="sm">
        <Link to={ctaTo}>{ctaLabel}</Link>
      </Button>
    </div>
  );
}

function InlineEmptyState({
  title,
  description,
  actionLabel,
  to,
}: {
  title: string;
  description: string;
  actionLabel: string;
  to: string;
}) {
  return (
    <div className="rounded-lg border p-4 space-y-2">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Button asChild size="sm" variant="secondary">
        <Link to={to}>{actionLabel}</Link>
      </Button>
    </div>
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
