// ============================================================
// IP-NEXUS AI BRAIN - COST ANALYTICS TAB (PHASE 3)
// ============================================================

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fromTable } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { useAICostHistory } from '@/hooks/ai-brain/useAIBudgets';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}

function formatInt(value: number) {
  return new Intl.NumberFormat('es-ES').format(value);
}

export function CostAnalyticsTab() {
  const [period, setPeriod] = useState('30');

  const { data: costHistory, isLoading } = useAICostHistory(parseInt(period));

  // Get cost by provider from executions
  const { data: costByProvider } = useQuery({
    queryKey: ['cost-by-provider', period],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      const { data } = await fromTable('ai_request_logs')
        .select('provider_id, cost_usd')
        .gte('created_at', startDate.toISOString())
        .not('cost_usd', 'is', null);

      // Also try ai_executions if ai_request_logs is empty
      if (!data || data.length === 0) {
        const { data: execData } = await fromTable('ai_executions')
          .select('provider_code, cost_actual')
          .gte('started_at', startDate.toISOString())
          .not('cost_actual', 'is', null);

        if (execData) {
          const grouped: Record<string, number> = {};
          execData.forEach((d: any) => {
            const key = d.provider_code || 'unknown';
            grouped[key] = (grouped[key] || 0) + (d.cost_actual || 0);
          });
          return Object.entries(grouped)
            .map(([provider, cost]) => ({ provider, cost }))
            .sort((a, b) => b.cost - a.cost);
        }
      }

      const grouped: Record<string, number> = {};
      (data || []).forEach((d: any) => {
        const key = d.provider_id || 'unknown';
        grouped[key] = (grouped[key] || 0) + (d.cost_usd || 0);
      });

      return Object.entries(grouped)
        .map(([provider, cost]) => ({ provider, cost }))
        .sort((a, b) => b.cost - a.cost);
    },
  });

  // Get cost by task
  const { data: costByTask } = useQuery({
    queryKey: ['cost-by-task', period],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      const { data } = await fromTable('ai_request_logs')
        .select('task_code, cost_usd')
        .gte('created_at', startDate.toISOString())
        .not('cost_usd', 'is', null);

      // Also try ai_executions
      if (!data || data.length === 0) {
        const { data: execData } = await fromTable('ai_executions')
          .select('task_code, cost_actual')
          .gte('started_at', startDate.toISOString())
          .not('cost_actual', 'is', null);

        if (execData) {
          const grouped: Record<string, number> = {};
          execData.forEach((d: any) => {
            const key = d.task_code || 'unknown';
            grouped[key] = (grouped[key] || 0) + (d.cost_actual || 0);
          });
          return Object.entries(grouped)
            .map(([task, cost]) => ({ task, cost }))
            .sort((a, b) => b.cost - a.cost)
            .slice(0, 10);
        }
      }

      const grouped: Record<string, number> = {};
      (data || []).forEach((d: any) => {
        const key = d.task_code || 'unknown';
        grouped[key] = (grouped[key] || 0) + (d.cost_usd || 0);
      });

      return Object.entries(grouped)
        .map(([task, cost]) => ({ task, cost }))
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 10);
    },
  });

  // Get cost by tenant
  const { data: costByTenant } = useQuery({
    queryKey: ['cost-by-tenant', period],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      const { data } = await fromTable('ai_executions')
        .select('tenant_id, cost_actual')
        .gte('started_at', startDate.toISOString())
        .not('cost_actual', 'is', null)
        .not('tenant_id', 'is', null);

      if (!data) return [];

      // Get tenant names
      const tenantIds = [...new Set(data.map((d: any) => d.tenant_id))];
      const { data: tenants } = await supabase
        .from('organizations')
        .select('id, name')
        .in('id', tenantIds);

      const tenantMap = new Map(tenants?.map((t: any) => [t.id, t.name]) || []);

      const grouped: Record<string, { name: string; cost: number }> = {};
      data.forEach((d: any) => {
        const id = d.tenant_id;
        if (!grouped[id]) {
          grouped[id] = { name: tenantMap.get(id) || 'Desconocido', cost: 0 };
        }
        grouped[id].cost += d.cost_actual || 0;
      });

      return Object.values(grouped)
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 10);
    },
  });

  // Calculate totals from cost history
  const totals = useMemo(() => {
    if (!costHistory) return { cost: 0, executions: 0, tokens: 0, avgCost: 0 };

    const cost = costHistory.reduce((sum, d) => sum + (d.total_cost || 0), 0);
    const executions = costHistory.reduce((sum, d) => sum + (d.total_executions || 0), 0);
    const tokens = costHistory.reduce((sum, d) => sum + (d.total_tokens || 0), 0);

    return {
      cost,
      executions,
      tokens,
      avgCost: executions > 0 ? cost / executions : 0,
      avgDaily: costHistory.length > 0 ? cost / costHistory.length : 0,
    };
  }, [costHistory]);

  // Chart data
  const chartData = useMemo(() => {
    if (!costHistory) return [];
    return costHistory.map((d) => ({
      ...d,
      date_label: new Date(d.date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
      }),
    }));
  }, [costHistory]);

  // Provider total for percentage calc
  const providerTotal = costByProvider?.reduce((sum, p) => sum + p.cost, 0) || 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Analítica de Costes</h3>
          <p className="text-sm text-muted-foreground">
            Gasto por proveedor, tarea y tenant
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 días</SelectItem>
            <SelectItem value="30">Últimos 30 días</SelectItem>
            <SelectItem value="90">Últimos 90 días</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Coste Total</p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(totals.cost)}</p>
            <p className="text-xs text-muted-foreground">en {period} días</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Ejecuciones</p>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold">{formatInt(totals.executions)}</p>
            <p className="text-xs text-muted-foreground">requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Coste Medio</p>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(totals.avgCost)}</p>
            <p className="text-xs text-muted-foreground">por request</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Media Diaria</p>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(totals.avgDaily || 0)}</p>
            <p className="text-xs text-muted-foreground">por día</p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución del Coste</CardTitle>
          <CardDescription>Gasto diario en el período seleccionado</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No hay datos en el período
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date_label" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `$${Number(v).toFixed(2)}`}
                />
                <Tooltip
                  formatter={(v: number) => formatCurrency(v)}
                  labelFormatter={(label) => `Fecha: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="total_cost"
                  name="Coste"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cost by Provider */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por Proveedor</CardTitle>
            <CardDescription>Distribución de gasto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {costByProvider?.slice(0, 6).map(({ provider, cost }) => {
              const pct = providerTotal > 0 ? (cost / providerTotal) * 100 : 0;
              return (
                <div key={provider}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium capitalize">{provider}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium">{formatCurrency(cost)}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              );
            })}
            {(!costByProvider || costByProvider.length === 0) && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Sin datos
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost by Task */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 10 Tareas</CardTitle>
            <CardDescription>Mayor consumo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {costByTask?.map(({ task, cost }, idx) => (
              <div key={task} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-4">{idx + 1}</span>
                  <span className="text-sm truncate max-w-[140px]">{task}</span>
                </div>
                <Badge variant="secondary">{formatCurrency(cost)}</Badge>
              </div>
            ))}
            {(!costByTask || costByTask.length === 0) && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Sin datos
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost by Tenant */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 10 Tenants</CardTitle>
            <CardDescription>Mayor consumo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {costByTenant?.map(({ name, cost }, idx) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-4">{idx + 1}</span>
                  <span className="text-sm truncate max-w-[140px]">{name}</span>
                </div>
                <Badge variant="secondary">{formatCurrency(cost)}</Badge>
              </div>
            ))}
            {(!costByTenant || costByTenant.length === 0) && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Sin datos
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
