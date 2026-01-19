import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line,
  ResponsiveContainer 
} from 'recharts';
import { useAssetsGrouped } from '@/hooks/analytics/useAnalytics';
import { Loader2 } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export function PortfolioByTypeChart() {
  const { data, isLoading } = useAssetsGrouped('ip_type');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.map(d => ({
    name: formatLabel(d.label),
    value: d.value
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Portfolio por Tipo</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function PortfolioByStatusChart() {
  const { data, isLoading } = useAssetsGrouped('status');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.map(d => ({
    name: formatLabel(d.label),
    value: d.value
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Portfolio por Estado</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function PortfolioByCountryChart() {
  const { data, isLoading } = useAssetsGrouped('office_code');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.map(d => ({
    name: d.label,
    value: d.value
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top 10 Países/Oficinas</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={80} />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function formatLabel(label: string): string {
  const labels: Record<string, string> = {
    trademark: 'Marcas',
    patent: 'Patentes',
    design: 'Diseños',
    copyright: 'Derechos de Autor',
    domain: 'Dominios',
    registered: 'Registrado',
    pending: 'Pendiente',
    filed: 'Presentado',
    published: 'Publicado',
    granted: 'Concedido',
    expired: 'Expirado',
    abandoned: 'Abandonado',
  };
  return labels[label] || label;
}
