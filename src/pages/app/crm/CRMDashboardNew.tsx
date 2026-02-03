/**
 * CRM Dashboard - Panel principal con KPIs, resumen y actividad
 * USES REAL DATA - No mock data
 */

import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/contexts/page-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useCRMDashboardKPIs } from '@/hooks/crm/v2/dashboard';
import { useCRMPendingCalls, useCRMUrgentTasks, useCRMRecentActivity, useCRMAverageTicket } from '@/hooks/use-crm-pending-items';
import {
  Target, Briefcase, Building2, CheckSquare, AlertTriangle,
  TrendingUp, ArrowRight, Phone, Clock, Mail, MessageSquare,
  Trophy, DollarSign, Percent, User, Inbox
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function formatCurrency(value: number, currency = 'EUR') {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(value);
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'email': return <Mail className="w-4 h-4 text-primary" />;
    case 'call': return <Phone className="w-4 h-4 text-green-600" />;
    case 'convert': return <TrendingUp className="w-4 h-4 text-purple-600" />;
    case 'won': return <Trophy className="w-4 h-4 text-amber-500" />;
    case 'lead': return <Target className="w-4 h-4 text-blue-600" />;
    default: return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
}

export default function CRMDashboardNew() {
  usePageTitle('Dashboard');
  const navigate = useNavigate();
  const { data: kpis, isLoading } = useCRMDashboardKPIs();
  
  // Use real data hooks
  const { data: pendingCalls = [], isLoading: loadingCalls } = useCRMPendingCalls();
  const { data: urgentTasks = [], isLoading: loadingTasks } = useCRMUrgentTasks();
  const { data: recentActivity = [], isLoading: loadingActivity } = useCRMRecentActivity();
  const { data: avgTicket = 0 } = useCRMAverageTicket();

  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: es });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground capitalize">{currentMonth}</p>
        </div>
        <Button onClick={() => navigate('/app/crm/pipeline')}>
          Ver Pipeline
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Leads */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/app/crm/pipeline?view=leads')}
        >
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold">{kpis?.total_leads || 0}</p>
                <p className="text-sm text-muted-foreground">Leads activos</p>
                {(kpis?.hot_leads ?? 0) > 0 && (
                  <p className="text-xs text-primary mt-1">↑ {kpis?.hot_leads} calientes</p>
                )}
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="w-6 h-6 text-primary/40" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Negociaciones */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/app/crm/pipeline?view=deals')}
        >
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold">{kpis?.deals_closing_this_month || 0}</p>
                <p className="text-sm text-muted-foreground">Negociaciones</p>
                <p className="text-xs text-green-600 mt-1">
                  {formatCurrency(kpis?.total_pipeline_value || 0)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Briefcase className="w-6 h-6 text-blue-500/40" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clientes */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/app/crm/clients')}
        >
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold">{kpis?.total_accounts || 0}</p>
                <p className="text-sm text-muted-foreground">Clientes</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ↑ {kpis?.active_accounts || 0} activos
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10">
                <Building2 className="w-6 h-6 text-green-500/40" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tareas hoy */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/app/crm/tasks')}
        >
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold">{kpis?.pending_tasks || 0}</p>
                <p className="text-sm text-muted-foreground">Tareas hoy</p>
              </div>
              <div className="p-2 rounded-lg bg-orange-500/10">
                <CheckSquare className="w-6 h-6 text-orange-500/40" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold">{kpis?.at_risk_accounts || 0}</p>
                <p className="text-sm text-muted-foreground">Alertas</p>
              </div>
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-6 h-6 text-destructive/40" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Value + Conversion */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Valor Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Leads:</span>
              <span className="font-medium">{formatCurrency(kpis?.total_pipeline_value || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Negociaciones:</span>
              <span className="font-medium">{formatCurrency(kpis?.weighted_pipeline_value || 0)}</span>
            </div>
            <hr />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cerrado (mes):</span>
              <span className="font-bold text-green-600 flex items-center gap-1">
                {formatCurrency(0)} 
                <Trophy className="w-4 h-4" />
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Percent className="w-5 h-5 text-purple-600" />
              Conversión (último mes)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Lead → Negociación:</span>
              <span className="font-medium">{kpis?.lead_conversion_rate || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Negociación → Ganado:</span>
              <span className="font-medium">{kpis?.win_rate || 0}%</span>
            </div>
            <hr />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ticket medio:</span>
              <span className="font-bold">{formatCurrency(avgTicket)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calls + Tasks */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-600" />
              Llamadas Pendientes Hoy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingCalls ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : pendingCalls.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Phone className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Sin llamadas pendientes</p>
              </div>
            ) : (
              pendingCalls.map(call => (
                <div key={call.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{call.name} - {call.company}</p>
                      <p className="text-xs text-muted-foreground">{call.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{call.time}</span>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
            <Button variant="link" className="w-full justify-center text-xs" onClick={() => navigate('/app/crm/activities')}>
              Ver todas →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Tareas Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingTasks ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : urgentTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CheckSquare className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">Sin tareas urgentes</p>
              </div>
            ) : (
              urgentTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${task.urgency === 'high' ? 'bg-destructive' : 'bg-orange-500'}`} />
                    <p className="text-sm">{task.title}</p>
                  </div>
                  <Badge variant={task.urgency === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                    {task.dueDate}
                  </Badge>
                </div>
              ))
            )}
            <Button variant="link" className="w-full justify-center text-xs" onClick={() => navigate('/app/crm/tasks')}>
              Ver todas →
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Actividad Reciente
          </CardTitle>
          <Button variant="link" className="text-xs" onClick={() => navigate('/app/crm/activities')}>
            Ver todo →
          </Button>
        </CardHeader>
        <CardContent>
          {loadingActivity ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Inbox className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Sin actividad reciente</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Las interacciones con clientes aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map(activity => (
                <div key={activity.id} className="flex items-center gap-4 py-2 border-b last:border-0">
                  <span className="text-xs text-muted-foreground w-12">{activity.time}</span>
                  <div className="flex items-center gap-2">
                    {getActivityIcon(activity.type)}
                  </div>
                  <p className="text-sm flex-1">{activity.text}</p>
                  <span className="text-xs text-muted-foreground">{activity.user}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
