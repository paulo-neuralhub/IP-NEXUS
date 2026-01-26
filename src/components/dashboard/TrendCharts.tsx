// =============================================
// COMPONENTE: TrendCharts
// Gráficos de tendencia del negocio
// =============================================

import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// =============================================
// Gráfico: Expedientes por mes
// =============================================

export function ExpedientesChart() {
  const data = [
    { mes: 'Jul', nuevos: 12, cerrados: 8 },
    { mes: 'Ago', nuevos: 15, cerrados: 10 },
    { mes: 'Sep', nuevos: 18, cerrados: 12 },
    { mes: 'Oct', nuevos: 14, cerrados: 15 },
    { mes: 'Nov', nuevos: 22, cerrados: 11 },
    { mes: 'Dic', nuevos: 19, cerrados: 14 },
    { mes: 'Ene', nuevos: 25, cerrados: 18 },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Expedientes por mes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'hsl(var(--background))',
                }}
              />
              <Bar dataKey="nuevos" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Nuevos" />
              <Bar dataKey="cerrados" fill="#10B981" radius={[4, 4, 0, 0]} name="Cerrados" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-[#3B82F6]" />
            Nuevos
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-[#10B981]" />
            Cerrados
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================
// Gráfico: Facturación
// =============================================

export function FacturacionChart() {
  const [periodo, setPeriodo] = useState<'6m' | '12m'>('6m');
  
  const data = [
    { mes: 'Ago', valor: 8500 },
    { mes: 'Sep', valor: 9200 },
    { mes: 'Oct', valor: 11000 },
    { mes: 'Nov', valor: 9800 },
    { mes: 'Dic', valor: 14500 },
    { mes: 'Ene', valor: 12400 },
  ];

  return (
    <Card>
      <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-medium">
          Facturación
        </CardTitle>
        <Tabs value={periodo} onValueChange={(v) => setPeriodo(v as '6m' | '12m')}>
          <TabsList className="h-7">
            <TabsTrigger value="6m" className="text-xs px-2 h-6">6M</TabsTrigger>
            <TabsTrigger value="12m" className="text-xs px-2 h-6">12M</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <YAxis 
                tick={{ fontSize: 12 }} 
                className="text-muted-foreground"
                tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => [`€${value.toLocaleString()}`, 'Facturado']}
                contentStyle={{ 
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'hsl(var(--background))',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="valor" 
                stroke="#059669" 
                strokeWidth={2}
                dot={{ fill: '#059669', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================
// Gráfico: Distribución por tipo
// =============================================

export function TiposChart() {
  const data = [
    { name: 'Marcas', value: 65, color: '#3B82F6' },
    { name: 'Patentes', value: 20, color: '#10B981' },
    { name: 'Diseños', value: 10, color: '#F59E0B' },
    { name: 'Otros', value: 5, color: '#6B7280' },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Por tipo de expediente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="h-[140px] w-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, '']}
                  contentStyle={{ 
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                    backgroundColor: 'hsl(var(--background))',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {data.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="h-2.5 w-2.5 rounded-sm" 
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </div>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================
// Gráfico: Plazos próximos
// =============================================

export function PlazosChart() {
  const data = [
    { periodo: 'Hoy', count: 5, color: '#EF4444' },
    { periodo: 'Mañana', count: 3, color: '#F59E0B' },
    { periodo: '7 días', count: 12, color: '#3B82F6' },
    { periodo: '30 días', count: 28, color: '#10B981' },
  ];

  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Plazos próximos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.periodo} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.periodo}</span>
                <span className="font-medium">{item.count}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${(item.count / maxCount) * 100}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
