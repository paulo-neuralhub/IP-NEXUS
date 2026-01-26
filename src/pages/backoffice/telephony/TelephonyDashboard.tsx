// ============================================================
// IP-NEXUS BACKOFFICE - Telephony Dashboard
// ============================================================

import { Link } from 'react-router-dom';
import { 
  Phone, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Settings,
  Package,
  BarChart3,
  Users,
  Power
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  useTelephonyConfig, 
  useTelephonyProviders, 
  useTelephonyMetrics,
  useUpdateTelephonyConfig
} from '@/hooks/backoffice/useTelephonyConfig';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function TelephonyDashboard() {
  const { data: config, isLoading: loadingConfig } = useTelephonyConfig();
  const { data: providers } = useTelephonyProviders();
  const { data: metrics, isLoading: loadingMetrics } = useTelephonyMetrics();
  const updateConfig = useUpdateTelephonyConfig();

  const activeProvider = providers?.find(p => p.id === config?.active_provider_id);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Telefonía</h1>
          <p className="text-muted-foreground">
            Gestión del servicio de telefonía multi-proveedor
          </p>
        </div>
      </div>

      {/* VoIP Global Toggle */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${config?.voip_enabled ? 'bg-success/10' : 'bg-muted'}`}>
                <Power className={`h-5 w-5 ${config?.voip_enabled ? 'text-success' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <CardTitle className="text-lg">Módulo VoIP</CardTitle>
                <CardDescription>
                  {config?.voip_enabled 
                    ? 'El softphone está activo para todos los tenants' 
                    : 'El softphone está desactivado globalmente'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="voip-toggle" className="text-sm font-medium">
                {config?.voip_enabled ? 'Activado' : 'Desactivado'}
              </Label>
              <Switch
                id="voip-toggle"
                checked={config?.voip_enabled ?? false}
                disabled={updateConfig.isPending || loadingConfig}
                onCheckedChange={(checked) => {
                  if (!config?.id) {
                    toast.error('Primero configura un proveedor de telefonía');
                    return;
                  }
                  updateConfig.mutate({ id: config.id, voip_enabled: checked });
                }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estado del Servicio</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingConfig ? (
            <Skeleton className="h-24" />
          ) : config ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {activeProvider?.logo_url ? (
                  <img 
                    src={activeProvider.logo_url} 
                    alt={activeProvider.name} 
                    className="h-12 w-12 object-contain"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {activeProvider?.name || 'Sin proveedor'}
                    </span>
                    <Badge variant={config.test_mode ? 'secondary' : 'default'}>
                      {config.test_mode ? 'Test' : 'Producción'}
                    </Badge>
                    <span className="flex items-center gap-1 text-sm text-success">
                      <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      Conectado
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {config.phone_numbers?.length || 0} números activos
                  </p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link to="/backoffice/telephony/provider">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar proveedor
                </Link>
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">
                No hay proveedor de telefonía configurado
              </p>
              <Button asChild>
                <Link to="/backoffice/telephony/provider">
                  Configurar ahora
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loadingMetrics ? (
          <>
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </>
        ) : (
          <>
            <MetricCard
              label="Llamadas"
              value={metrics?.today.calls || 0}
              icon={Phone}
              change={12}
              color="hsl(var(--primary))"
            />
            <MetricCard
              label="Minutos"
              value={`${Math.floor((metrics?.today.minutes || 0) / 60)}:${String(Math.round((metrics?.today.minutes || 0) % 60)).padStart(2, '0')}`}
              icon={Clock}
              change={8}
              color="hsl(var(--module-genius))"
            />
            <MetricCard
              label="Ingresos"
              value={formatCurrency(metrics?.today.revenue || 0)}
              icon={DollarSign}
              change={15}
              color="hsl(var(--success))"
            />
            <MetricCard
              label="Coste"
              value={formatCurrency(metrics?.today.cost || 0)}
              icon={TrendingUp}
              change={10}
              color="hsl(var(--warning))"
            />
          </>
        )}
      </div>

      {/* Weekly Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actividad Últimos 7 Días</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingMetrics ? (
            <Skeleton className="h-[300px]" />
          ) : metrics?.weeklyActivity && metrics.weeklyActivity.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => format(new Date(val), 'EEE', { locale: es })}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  labelFormatter={(val) => format(new Date(val), 'EEEE d MMM', { locale: es })}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="calls" 
                  name="Llamadas"
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="minutes" 
                  name="Minutos"
                  stroke="hsl(var(--module-genius))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No hay datos de actividad
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Low Balance Tenants */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Tenants con Bajo Saldo</CardTitle>
            <Link 
              to="/backoffice/telephony/consumption" 
              className="text-sm text-primary hover:underline"
            >
              Ver todos →
            </Link>
          </CardHeader>
          <CardContent>
            {loadingMetrics ? (
              <Skeleton className="h-32" />
            ) : metrics?.lowBalanceTenants && metrics.lowBalanceTenants.length > 0 ? (
              <div className="space-y-3">
                {metrics.lowBalanceTenants.map((tenant) => (
                  <div 
                    key={tenant.id} 
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      {tenant.minutes_balance === 0 ? (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      )}
                      <span className="text-sm font-medium">{tenant.name}</span>
                    </div>
                    <Badge variant={tenant.minutes_balance === 0 ? 'destructive' : 'secondary'}>
                      {tenant.minutes_balance} min
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Todos los tenants tienen saldo suficiente
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Consumers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Top Consumidores</CardTitle>
            <Link 
              to="/backoffice/telephony/consumption" 
              className="text-sm text-primary hover:underline"
            >
              Ver análisis →
            </Link>
          </CardHeader>
          <CardContent>
            {loadingMetrics ? (
              <Skeleton className="h-32" />
            ) : metrics?.topConsumers && metrics.topConsumers.length > 0 ? (
              <div className="space-y-3">
                {metrics.topConsumers.map((tenant, idx) => (
                  <div 
                    key={tenant.id} 
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {idx + 1}.
                      </span>
                      <span className="text-sm font-medium">{tenant.name}</span>
                    </div>
                    <span className="text-sm font-medium text-primary">
                      {tenant.total_minutes} min
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Sin datos de consumo este mes
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Packs Sold This Month */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Packs Vendidos Este Mes</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/backoffice/telephony/packs">
              <Package className="h-4 w-4 mr-2" />
              Gestionar Packs
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loadingMetrics ? (
            <Skeleton className="h-40" />
          ) : metrics?.packsSoldThisMonth && metrics.packsSoldThisMonth.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-muted-foreground">Pack</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Vendidos</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.packsSoldThisMonth.map((pack) => (
                    <tr key={pack.name} className="border-b last:border-0">
                      <td className="py-2 font-medium">{pack.name}</td>
                      <td className="py-2 text-right">{pack.count}</td>
                      <td className="py-2 text-right font-medium text-success">
                        {formatCurrency(pack.revenue)}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td className="py-2">TOTAL</td>
                    <td className="py-2 text-right">
                      {metrics.packsSoldThisMonth.reduce((acc, p) => acc + p.count, 0)}
                    </td>
                    <td className="py-2 text-right text-success">
                      {formatCurrency(metrics.packsSoldThisMonth.reduce((acc, p) => acc + p.revenue, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No se han vendido packs este mes
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ 
  label, 
  value, 
  icon: Icon, 
  change, 
  color 
}: { 
  label: string; 
  value: string | number; 
  icon: any; 
  change?: number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div 
            className="h-10 w-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        </div>
        {change !== undefined && (
          <div className="mt-2 flex items-center gap-1 text-sm">
            <TrendingUp className="h-3 w-3 text-success" />
            <span className="text-success">+{change}%</span>
            <span className="text-muted-foreground">vs ayer</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
