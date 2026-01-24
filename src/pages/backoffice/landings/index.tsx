// ============================================
// src/pages/backoffice/landings/index.tsx
// Landing Pages Dashboard - Overview with stats
// ============================================

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Globe,
  Users,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  MessageSquare,
  Star,
} from 'lucide-react';
import {
  useLandingAnalytics,
  useVisitsByLanding,
  useDailyVisits,
  useRecentLeads,
  useChatbotPerformance,
} from '@/hooks/backoffice/useLandingAnalytics';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function LandingsDashboard() {
  const { data: stats, isLoading: statsLoading } = useLandingAnalytics(30);
  const { data: visitsByLanding } = useVisitsByLanding(30);
  const { data: dailyVisits } = useDailyVisits(30);
  const { data: recentLeads } = useRecentLeads(5);
  const { data: chatbotStats } = useChatbotPerformance(30);

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Visitas',
      value: stats?.totalVisits.toLocaleString() || '0',
      trend: stats?.visitsTrend || 0,
      icon: Eye,
    },
    {
      title: 'Leads',
      value: stats?.totalLeads.toLocaleString() || '0',
      trend: stats?.leadsTrend || 0,
      icon: Users,
    },
    {
      title: 'Conversión',
      value: `${(stats?.conversionRate || 0).toFixed(1)}%`,
      trend: stats?.conversionTrend || 0,
      icon: TrendingUp,
    },
    {
      title: 'Demos',
      value: stats?.demosScheduled.toLocaleString() || '0',
      trend: stats?.demosTrend || 0,
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Landings</h1>
          <p className="text-muted-foreground">Últimos 30 días</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/backoffice/landings/analytics">Ver analytics</Link>
          </Button>
          <Button asChild>
            <Link to="/backoffice/landings/paginas">Gestionar páginas</Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className={stat.trend >= 0 ? 'text-green-500 text-sm' : 'text-red-500 text-sm'}>
                      {Math.abs(stat.trend).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visits by Landing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visitas por Landing</CardTitle>
          </CardHeader>
          <CardContent>
            {visitsByLanding && visitsByLanding.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={visitsByLanding} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Sin datos disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leads this week */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leads esta semana</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyVisits && dailyVisits.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={dailyVisits.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    tickFormatter={(v) => format(new Date(v), 'dd/MM')}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(v) => format(new Date(v), 'dd MMM yyyy', { locale: es })}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="leads" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary) / 0.2)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Sin datos disponibles
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Últimos Leads</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/backoffice/landings/leads">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLeads && recentLeads.length > 0 ? (
                recentLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    to={`/backoffice/landings/leads/${lead.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{lead.email}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {lead.company || lead.name || 'Sin empresa'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">
                        {(lead.conversation as { landing_slug?: string })?.landing_slug || 'N/A'}
                      </Badge>
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: Math.min(lead.lead_score || 0, 5) }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: es })}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No hay leads recientes
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chatbot Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Rendimiento Chatbot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Conversaciones</span>
                <span className="font-medium">{chatbotStats?.totalConversations.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Leads capturados</span>
                <span className="font-medium">{chatbotStats?.leadsCaptures.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tasa de captura</span>
                <span className="font-medium">{(chatbotStats?.captureRate || 0).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Demos agendadas</span>
                <span className="font-medium">{chatbotStats?.demosScheduled || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Mensajes promedio</span>
                <span className="font-medium">{(chatbotStats?.avgMessages || 0).toFixed(1)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
