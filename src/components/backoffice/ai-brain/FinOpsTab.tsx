import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Clock, Coins, TrendingUp, TriangleAlert } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAIFinOpsDashboard } from '@/hooks/ai-brain';

function formatEUR(v: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v);
}

function formatInt(v: number) {
  return new Intl.NumberFormat('es-ES').format(v);
}

export function FinOpsTab() {
  const { data, isLoading, isError, error, refetch, isFetching } = useAIFinOpsDashboard();

  const daily = useMemo(() => {
    const list = data?.daily_trend ?? [];
    return list.map((d) => ({
      ...d,
      date_label: new Date(d.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      profit: (d.cost_billable ?? 0) - (d.cost_internal ?? 0),
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent className="grid gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>FinOps</CardTitle>
          <CardDescription>Error cargando métricas</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {(error as Error)?.message ?? 'Error desconocido'}
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>FinOps</CardTitle>
          <CardDescription>No hay datos aún</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>El dashboard se rellenará cuando empecemos a registrar transacciones en el ledger.</p>
        </CardContent>
      </Card>
    );
  }

  const totals = data.totals;
  const internal = totals.total_cost_internal ?? 0;
  const billable = totals.total_cost_billable ?? 0;
  const profit = totals.profit ?? (billable - internal);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>FinOps</CardTitle>
            <CardDescription>
              Periodo: {new Date(data.period.start).toLocaleDateString('es-ES')} → {new Date(data.period.end).toLocaleDateString('es-ES')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{isFetching ? 'Actualizando…' : 'En vivo'}</Badge>
            <button
              className="text-sm text-primary underline-offset-4 hover:underline"
              onClick={() => refetch()}
              type="button"
            >
              Refrescar
            </button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Coste interno</p>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-semibold">{formatEUR(internal)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatInt(totals.total_transactions)} transacciones</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Facturable</p>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-semibold">{formatEUR(billable)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Markup/chargeback</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Beneficio</p>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-semibold">{formatEUR(profit)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{totals.profit_margin.toFixed(2)}% margen</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Latencia / error</p>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-semibold">{Math.round(totals.avg_latency_ms)} ms</p>
              <p className="mt-1 text-xs text-muted-foreground">{totals.error_rate.toFixed(2)}% errores</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evolución</CardTitle>
          <CardDescription>Coste interno vs facturable (diario)</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          {daily.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Sin datos en el periodo</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date_label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `€${Number(v).toFixed(2)}`} />
                <Tooltip formatter={(v: number) => formatEUR(v)} />
                <Line type="monotone" dataKey="cost_internal" name="Coste interno" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="cost_billable" name="Facturable" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="profit" name="Beneficio" stroke="hsl(var(--foreground))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Coste por modelo</CardTitle>
            <CardDescription>Top por coste interno</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(data.by_model ?? []).slice(0, 8).map((m) => {
              const pct = internal > 0 ? (m.cost_internal / internal) * 100 : 0;
              return (
                <div key={`${m.model_id}-${m.model_code}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{m.model_name || m.model_code || 'Modelo'}</p>
                      <p className="text-xs text-muted-foreground">{formatInt(m.transactions)} req · ~{Math.round(m.avg_latency_ms)}ms</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatEUR(m.cost_internal)}</p>
                      <p className="text-xs text-muted-foreground">{pct.toFixed(1)}%</p>
                    </div>
                  </div>
                  <Progress value={pct} className="mt-2" />
                </div>
              );
            })}
            {(data.by_model ?? []).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No hay datos por modelo</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas pendientes</CardTitle>
            <CardDescription>Últimas 10 sin reconocer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(data.pending_alerts ?? []).map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-lg border p-3">
                <TriangleAlert className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{a.alert_type}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.budget_amount != null ? `Presupuesto: ${formatEUR(a.budget_amount)} · ` : ''}
                    {a.current_spend != null ? `Gastado: ${formatEUR(a.current_spend)}` : ''}
                  </p>
                </div>
                <Badge variant="outline">{new Date(a.created_at).toLocaleString('es-ES')}</Badge>
              </div>
            ))}
            {(data.pending_alerts ?? []).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No hay alertas pendientes</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
