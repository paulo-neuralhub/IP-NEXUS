// src/pages/backoffice/index.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Brain, Users, CreditCard, TrendingUp, AlertTriangle } from 'lucide-react';

export default function BackofficeDashboard() {
  const stats = [
    { label: 'IP Offices', value: '127', icon: Building2, color: 'text-blue-500' },
    { label: 'AI Providers', value: '4', icon: Brain, color: 'text-purple-500' },
    { label: 'Tenants Activos', value: '45', icon: Users, color: 'text-green-500' },
    { label: 'MRR', value: '€12,450', icon: CreditCard, color: 'text-amber-500' },
    { label: 'Crecimiento', value: '+12%', icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'Alertas', value: '3', icon: AlertTriangle, color: 'text-destructive' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Backoffice Dashboard</h1>
        <p className="text-muted-foreground">Control total del ecosistema IP-NEXUS</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Dashboard en desarrollo. Próximamente: métricas en tiempo real, 
              alertas del sistema, y estado de conexiones.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>AI Brain</span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Operativo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Base de Datos</span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Operativo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Conexiones IPO</span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  3 degradadas
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
