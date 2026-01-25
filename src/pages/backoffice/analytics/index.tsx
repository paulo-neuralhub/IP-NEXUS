/**
 * Analytics Dashboard - Backoffice BI Overview
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Users, DollarSign, UserMinus, Clock } from 'lucide-react';
import { useState } from 'react';
import { useAnalyticsKPIs, useMRREvolution, useSubscriptionDistribution, useRecentActivity } from '@/hooks/backoffice/useAnalyticsDashboard';
import { formatCurrency } from '@/lib/format';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'];

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState('30');
  const { data: kpis, isLoading: kpisLoading } = useAnalyticsKPIs(Number(period));
  const { data: mrrData } = useMRREvolution(12);
  const { data: distribution } = useSubscriptionDistribution();
  const { data: activity } = useRecentActivity(5);

  const KPICard = ({ title, value, change, icon: Icon, format: fmt = 'number' }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">
              {fmt === 'currency' ? formatCurrency(value) : fmt === 'percent' ? `${value.toFixed(1)}%` : value}
            </p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-xs mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{change >= 0 ? '+' : ''}{typeof change === 'number' ? change.toFixed(1) : change}%</span>
              </div>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-full">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 días</SelectItem>
            <SelectItem value="30">Últimos 30 días</SelectItem>
            <SelectItem value="90">Últimos 90 días</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="MRR" value={kpis?.mrr || 0} change={kpis?.mrrChange} icon={DollarSign} format="currency" />
        <KPICard title="MRR Nuevo" value={kpis?.mrrNew || 0} change={kpis?.mrrNewChange} icon={TrendingUp} format="currency" />
        <KPICard title="Churn Rate" value={kpis?.churnRate || 0} change={kpis?.churnRateChange} icon={UserMinus} format="percent" />
        <KPICard title="LTV" value={kpis?.ltv || 0} change={kpis?.ltvChange} icon={Clock} format="currency" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Clientes" value={kpis?.totalClients || 0} change={kpis?.clientsChange} icon={Users} />
        <KPICard title="En Trial" value={kpis?.trialing || 0} change={kpis?.trialingChange} icon={Clock} />
        <KPICard title="Churned" value={kpis?.churned || 0} change={kpis?.churnedChange} icon={UserMinus} />
        <KPICard title="Usuarios" value={kpis?.totalUsers || 0} change={kpis?.usersChange} icon={Users} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Evolución MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mrrData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(v) => `€${v/1000}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Area type="monotone" dataKey="enterprise" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" />
                  <Area type="monotone" dataKey="professional" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
                  <Area type="monotone" dataKey="starter" stackId="1" stroke="#10B981" fill="#10B981" />
                  <Area type="monotone" dataKey="addons" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 justify-center mt-4 text-sm">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#8B5CF6]" /> Enterprise</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#3B82F6]" /> Professional</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#10B981]" /> Starter</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#F59E0B]" /> Add-ons</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distribution || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={80}>
                    {(distribution || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {(distribution || []).map((item, i) => (
                <div key={item.name} className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[i] }} />
                    {item.name}
                  </span>
                  <span>{item.value} ({item.percentage.toFixed(0)}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(activity || []).map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    item.type === 'cancellation' ? 'bg-red-500' : 
                    item.type === 'downgrade' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <span className="text-sm">{item.description}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.amount && <span className="font-medium mr-2">{formatCurrency(item.amount)}</span>}
                  {format(new Date(item.timestamp), 'HH:mm')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
