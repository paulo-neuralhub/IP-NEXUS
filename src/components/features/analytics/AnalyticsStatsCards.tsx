import { Card, CardContent } from '@/components/ui/card';
import { 
  Briefcase, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
} from 'lucide-react';

interface AnalyticsStatsCardsProps {
  stats: Record<string, number> | null | undefined;
}

export function AnalyticsStatsCards({ stats }: AnalyticsStatsCardsProps) {
  const statCards = [
    {
      label: 'Total Expedientes',
      value: stats?.total_matters || 0,
      icon: Briefcase,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Marcas',
      value: stats?.total_trademarks || 0,
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Patentes',
      value: stats?.total_patents || 0,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Diseños',
      value: stats?.total_designs || 0,
      icon: BarChart3,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Registrados',
      value: stats?.registered || 0,
      icon: CheckCircle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Pendientes',
      value: stats?.pending || 0,
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Expiran 30d',
      value: stats?.expiring_30d || 0,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Reportes Generados',
      value: stats?.reports_generated || 0,
      icon: FileText,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
