// ============================================================
// IP-NEXUS - DEADLINES PAGE
// PROMPT 52: Docket Deadline Engine
// ============================================================

import { useState } from 'react';
import { Calendar, List, AlertTriangle, Clock, CheckCircle2, CalendarDays } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeadlineList } from '@/components/docket/DeadlineList';
import { useDeadlineStats } from '@/hooks/useDeadlines';
import { usePageTitle } from '@/hooks/use-page-title';

export default function DeadlinesPage() {
  usePageTitle('Plazos y Deadlines');
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const { data: stats, isLoading: statsLoading } = useDeadlineStats();

  const statCards = [
    {
      title: 'Vencidos',
      value: stats?.overdue || 0,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'Urgentes (7 días)',
      value: stats?.urgent || 0,
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Próximos (30 días)',
      value: stats?.upcoming || 0,
      icon: CalendarDays,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Este mes',
      value: stats?.thisMonth || 0,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plazos y Deadlines</h1>
          <p className="text-muted-foreground">
            Gestiona todos los plazos de tus expedientes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4 mr-2" />
            Lista
          </Button>
          <Button
            variant={view === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('calendar')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendario
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className={`${stat.borderColor} border`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {statsLoading ? '...' : stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="overdue" className="text-red-600">
            Vencidos {stats?.overdue ? `(${stats.overdue})` : ''}
          </TabsTrigger>
          <TabsTrigger value="urgent" className="text-orange-600">
            Urgentes {stats?.urgent ? `(${stats.urgent})` : ''}
          </TabsTrigger>
          <TabsTrigger value="upcoming">Próximos</TabsTrigger>
          <TabsTrigger value="completed">Completados</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <DeadlineList showFilters={true} />
        </TabsContent>

        <TabsContent value="overdue">
          <DeadlineList showFilters={false} />
        </TabsContent>

        <TabsContent value="urgent">
          <DeadlineList showFilters={false} />
        </TabsContent>

        <TabsContent value="upcoming">
          <DeadlineList showFilters={false} />
        </TabsContent>

        <TabsContent value="completed">
          <DeadlineList showFilters={false} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
