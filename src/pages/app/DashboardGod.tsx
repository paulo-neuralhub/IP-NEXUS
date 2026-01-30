// ============================================================
// IP-NEXUS - Dashboard GOD Level
// Executive dashboard with critical zones and metrics
// ============================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, subMonths, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Briefcase,
  Users,
  Euro,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Mail,
  Phone,
  FileText,
  Target,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';

export default function DashboardGod() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { currentOrganization } = useOrganization();
  const today = new Date();
  const orgId = currentOrganization?.id;

  const firstName = profile?.full_name?.split(' ')[0] || 'Usuario';

  // ============================================
  // QUERIES PARA DATOS
  // ============================================

  // Plazos urgentes (próximos 7 días)
  const { data: plazosUrgentes = [] } = useQuery({
    queryKey: ['dashboard-god-plazos-urgentes', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const in7Days = new Date();
      in7Days.setDate(in7Days.getDate() + 7);
      
      const { data } = await supabase
        .from('matters')
        .select('id, reference, title, next_deadline, current_phase, client:client_id(name)')
        .eq('organization_id', orgId)
        .lte('next_deadline', in7Days.toISOString())
        .gte('next_deadline', today.toISOString())
        .eq('status', 'active')
        .order('next_deadline', { ascending: true })
        .limit(10);
      
      return data || [];
    },
    enabled: !!orgId
  });

  // Plazos vencidos
  const { data: plazosVencidos = [] } = useQuery({
    queryKey: ['dashboard-god-plazos-vencidos', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data } = await supabase
        .from('matters')
        .select('id, reference, title, next_deadline, current_phase')
        .eq('organization_id', orgId)
        .lt('next_deadline', today.toISOString())
        .eq('status', 'active')
        .order('next_deadline', { ascending: true })
        .limit(5);
      
      return data || [];
    },
    enabled: !!orgId
  });

  // Tareas pendientes hoy
  const { data: tareasHoy = [] } = useQuery({
    queryKey: ['dashboard-god-tareas-hoy', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data } = await supabase
        .from('activities')
        .select('id, subject, type, due_date, matter_id, is_completed')
        .eq('organization_id', orgId)
        .eq('type', 'task')
        .eq('is_completed', false)
        .lte('due_date', format(today, 'yyyy-MM-dd'))
        .order('due_date', { ascending: true })
        .limit(10);
      
      return data || [];
    },
    enabled: !!orgId
  });

  // KPIs principales
  const { data: kpis } = useQuery({
    queryKey: ['dashboard-god-kpis', orgId],
    queryFn: async () => {
      if (!orgId) return null;
      
      const [matters, contacts, activities, invoices] = await Promise.all([
        supabase.from('matters').select('id, current_phase, status').eq('organization_id', orgId),
        supabase.from('contacts').select('id').eq('organization_id', orgId).eq('type', 'client'),
        supabase.from('activities').select('id, is_completed, type').eq('organization_id', orgId).eq('type', 'task'),
        supabase.from('invoices')
          .select('total')
          .eq('organization_id', orgId)
          .gte('created_at', startOfMonth(today).toISOString())
          .lte('created_at', endOfMonth(today).toISOString())
          .eq('status', 'paid')
      ]);

      const mattersData = matters.data || [];
      const activitiesData = activities.data || [];

      return {
        expedientesActivos: mattersData.filter(e => e.status === 'active').length,
        expedientesTotal: mattersData.length,
        clientesActivos: contacts.data?.length || 0,
        tareasPendientes: activitiesData.filter(t => !t.is_completed).length,
        tareasCompletadas: activitiesData.filter(t => t.is_completed).length,
        facturacionMes: invoices.data?.reduce((acc, inv) => acc + (Number(inv.total) || 0), 0) || 0
      };
    },
    enabled: !!orgId
  });

  // Comparativa mes anterior
  const { data: comparativa } = useQuery({
    queryKey: ['dashboard-god-comparativa', orgId],
    queryFn: async () => {
      if (!orgId) return null;
      const mesAnteriorStart = startOfMonth(subMonths(today, 1));
      const mesAnteriorEnd = endOfMonth(subMonths(today, 1));

      const [expMesAnterior, facMesAnterior, expMesActual] = await Promise.all([
        supabase.from('matters')
          .select('id')
          .eq('organization_id', orgId)
          .gte('created_at', mesAnteriorStart.toISOString())
          .lte('created_at', mesAnteriorEnd.toISOString()),
        supabase.from('invoices')
          .select('total')
          .eq('organization_id', orgId)
          .gte('created_at', mesAnteriorStart.toISOString())
          .lte('created_at', mesAnteriorEnd.toISOString())
          .eq('status', 'paid'),
        supabase.from('matters')
          .select('id')
          .eq('organization_id', orgId)
          .gte('created_at', startOfMonth(today).toISOString())
          .lte('created_at', today.toISOString())
      ]);

      return {
        expedientesMesAnterior: expMesAnterior.data?.length || 0,
        expedientesMesActual: expMesActual.data?.length || 0,
        facturacionMesAnterior: facMesAnterior.data?.reduce((acc, inv) => acc + (Number(inv.total) || 0), 0) || 0
      };
    },
    enabled: !!orgId
  });

  // Expedientes por fase (funnel)
  const { data: funnelData = [] } = useQuery({
    queryKey: ['dashboard-god-funnel', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data } = await supabase
        .from('matters')
        .select('current_phase')
        .eq('organization_id', orgId)
        .eq('status', 'active');
      
      const fases = ['F0', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9'];
      return fases.map(fase => ({
        fase,
        count: data?.filter(e => e.current_phase === fase).length || 0
      }));
    },
    enabled: !!orgId
  });

  // Actividad reciente
  const { data: actividadReciente = [] } = useQuery({
    queryKey: ['dashboard-god-actividad', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      
      const [comms, matters] = await Promise.all([
        supabase.from('communications')
          .select('id, channel, subject, received_at, direction')
          .eq('organization_id', orgId)
          .order('received_at', { ascending: false })
          .limit(5),
        supabase.from('matters')
          .select('id, reference, title, updated_at, current_phase')
          .eq('organization_id', orgId)
          .order('updated_at', { ascending: false })
          .limit(5)
      ]);

      const actividad = [
        ...(comms.data || []).map(c => ({
          type: 'communication' as const,
          icon: c.channel === 'email' ? Mail : Phone,
          title: c.subject || 'Comunicación',
          subtitle: c.direction === 'inbound' ? 'Recibido' : 'Enviado',
          time: c.received_at,
          color: 'text-purple-500'
        })),
        ...(matters.data || []).map(e => ({
          type: 'matter' as const,
          icon: Briefcase,
          title: e.reference || e.title,
          subtitle: `Fase ${e.current_phase || 'N/A'}`,
          time: e.updated_at,
          color: 'text-blue-500'
        }))
      ];

      return actividad
        .sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime())
        .slice(0, 8);
    },
    enabled: !!orgId
  });

  // ============================================
  // CÁLCULOS
  // ============================================

  const calcularTendencia = (actual: number, anterior: number) => {
    if (anterior === 0) return { valor: actual > 0 ? 100 : 0, positivo: true };
    const diff = ((actual - anterior) / anterior) * 100;
    return { valor: Math.abs(Math.round(diff)), positivo: diff >= 0 };
  };

  const tendenciaExp = comparativa 
    ? calcularTendencia(comparativa.expedientesMesActual, comparativa.expedientesMesAnterior)
    : { valor: 0, positivo: true };

  const tendenciaFac = comparativa && kpis
    ? calcularTendencia(kpis.facturacionMes, comparativa.facturacionMesAnterior)
    : { valor: 0, positivo: true };

  const tareasVencidasHoy = tareasHoy.filter(t => t.due_date && isPast(new Date(t.due_date)));

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header con saludo */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {getGreeting()}, {firstName} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              {format(today, "EEEE, d 'de' MMMM yyyy", { locale: es })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('/app/docket/new')} className="gap-2">
              <Briefcase className="h-4 w-4" />
              Nuevo Expediente
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => navigate('/app/genius')}>
              <Sparkles className="h-4 w-4" />
              IP-Genius
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* ============================================ */}
        {/* ZONA CRÍTICA - Atención Inmediata */}
        {/* ============================================ */}
        
        {(plazosVencidos.length > 0 || tareasVencidasHoy.length > 0) && (
          <Card className="border-destructive/50 bg-gradient-to-r from-destructive/5 to-destructive/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/20">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-destructive">
                    ⚠️ Requiere Atención Inmediata
                  </CardTitle>
                  <CardDescription className="text-destructive/80">
                    {plazosVencidos.length} plazos vencidos • {tareasVencidasHoy.length} tareas atrasadas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {plazosVencidos.slice(0, 3).map((plazo) => (
                  <div
                    key={plazo.id}
                    className="flex items-center justify-between p-3 bg-background/60 rounded-lg cursor-pointer hover:bg-background transition-colors"
                    onClick={() => navigate(`/app/docket/${plazo.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <XCircle className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-semibold text-sm">{plazo.reference}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{plazo.title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive" className="text-xs">
                        Vencido hace {plazo.next_deadline ? Math.abs(differenceInDays(new Date(plazo.next_deadline), today)) : 0} días
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ============================================ */}
        {/* ZONA HOY - Lo que pasa hoy */}
        {/* ============================================ */}
        
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Plazos Hoy/Mañana */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Próximos Plazos</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/calendar')}>
                  Ver calendario <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {plazosUrgentes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-primary mb-3" />
                  <p className="font-semibold text-primary">¡Todo al día!</p>
                  <p className="text-sm text-muted-foreground">No hay plazos urgentes esta semana</p>
                </div>
              ) : (
                <ScrollArea className="h-[280px]">
                  <div className="space-y-2 pr-4">
                    {plazosUrgentes.map((plazo) => {
                      const fechaLimite = plazo.next_deadline ? new Date(plazo.next_deadline) : null;
                      const esHoy = fechaLimite && isToday(fechaLimite);
                      const esManana = fechaLimite && isTomorrow(fechaLimite);
                      const diasRestantes = fechaLimite ? differenceInDays(fechaLimite, today) : 0;
                      
                      return (
                        <div
                          key={plazo.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50",
                            esHoy && "border-destructive/50 bg-destructive/5",
                            esManana && "border-warning/50 bg-warning/5"
                          )}
                          onClick={() => navigate(`/app/docket/${plazo.id}`)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={cn(
                              "w-2 h-2 rounded-full flex-shrink-0",
                              esHoy ? "bg-destructive" : esManana ? "bg-warning" : "bg-primary"
                            )} />
                            <div className="min-w-0">
                              <p className="font-medium text-sm">{plazo.reference}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {plazo.title}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant={esHoy ? "destructive" : esManana ? "default" : "secondary"} className="text-xs">
                              {esHoy ? 'HOY' : esManana ? 'MAÑANA' : `${diasRestantes} días`}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{plazo.current_phase}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Tareas del día */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Tareas Hoy</CardTitle>
                </div>
                <Badge variant="outline">{tareasHoy.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px]">
                {tareasHoy.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CheckCircle2 className="h-12 w-12 text-primary mb-3" />
                    <p className="font-semibold">Sin tareas pendientes</p>
                  </div>
                ) : (
                  <div className="space-y-2 pr-4">
                    {tareasHoy.map((tarea) => (
                      <div
                        key={tarea.id}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/app/tareas`)}
                      >
                        <div className="w-4 h-4 rounded border-2 border-primary flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{tarea.subject}</p>
                          {tarea.matter_id && (
                            <p className="text-xs text-muted-foreground">
                              Expediente vinculado
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* ============================================ */}
        {/* ZONA KPIS - Métricas principales */}
        {/* ============================================ */}
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Expedientes Activos */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Briefcase className="h-5 w-5 text-primary" />
                {tendenciaExp.positivo ? (
                  <TrendingUp className="h-4 w-4 text-primary" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
              </div>
              <p className="text-2xl font-bold">{kpis?.expedientesActivos || 0}</p>
              <p className="text-xs text-muted-foreground">Expedientes activos</p>
              <p className={cn(
                "text-xs mt-1 font-medium",
                tendenciaExp.positivo ? "text-primary" : "text-destructive"
              )}>
                {tendenciaExp.positivo ? '+' : '-'}{tendenciaExp.valor}% vs mes ant.
              </p>
            </CardContent>
          </Card>

          {/* Clientes */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold">{kpis?.clientesActivos || 0}</p>
              <p className="text-xs text-muted-foreground">Clientes activos</p>
            </CardContent>
          </Card>

          {/* Facturación */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Euro className="h-5 w-5 text-primary" />
                {tendenciaFac.positivo ? (
                  <TrendingUp className="h-4 w-4 text-primary" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
              </div>
              <p className="text-2xl font-bold">
                €{((kpis?.facturacionMes || 0) / 1000).toFixed(1)}k
              </p>
              <p className="text-xs text-muted-foreground">Facturado este mes</p>
              <p className={cn(
                "text-xs mt-1 font-medium",
                tendenciaFac.positivo ? "text-primary" : "text-destructive"
              )}>
                {tendenciaFac.positivo ? '+' : '-'}{tendenciaFac.valor}% vs mes ant.
              </p>
            </CardContent>
          </Card>

          {/* Tareas */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold">{kpis?.tareasPendientes || 0}</p>
              <p className="text-xs text-muted-foreground">Tareas pendientes</p>
              <Progress value={kpis ? (kpis.tareasCompletadas / Math.max(kpis.tareasPendientes + kpis.tareasCompletadas, 1)) * 100 : 0} className="mt-2 h-1.5" />
            </CardContent>
          </Card>

          {/* Plazos próximos */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <p className="text-2xl font-bold">{plazosUrgentes.length}</p>
              <p className="text-xs text-muted-foreground">Plazos esta semana</p>
            </CardContent>
          </Card>

          {/* Vencidos */}
          <Card className={cn(
            "hover:shadow-md transition-shadow",
            plazosVencidos.length > 0 && "border-destructive/50 bg-destructive/5"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className={cn(
                  "h-5 w-5",
                  plazosVencidos.length > 0 ? "text-destructive" : "text-muted-foreground"
                )} />
              </div>
              <p className={cn(
                "text-2xl font-bold",
                plazosVencidos.length > 0 && "text-destructive"
              )}>
                {plazosVencidos.length}
              </p>
              <p className="text-xs text-muted-foreground">Plazos vencidos</p>
            </CardContent>
          </Card>
        </div>

        {/* ============================================ */}
        {/* ZONA FUNNEL + ACTIVIDAD */}
        {/* ============================================ */}
        
        <div className="grid lg:grid-cols-5 gap-4">
          {/* Pipeline/Funnel de expedientes */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Pipeline de Expedientes</CardTitle>
              </div>
              <CardDescription>Distribución por fase del workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {funnelData.map((item, index) => {
                  const maxCount = Math.max(...funnelData.map(f => f.count), 1);
                  const percentage = (item.count / maxCount) * 100;
                  const faseNames: Record<string, string> = {
                    'F0': 'Consulta Inicial',
                    'F1': 'Análisis',
                    'F2': 'Presupuesto',
                    'F3': 'Contratación',
                    'F4': 'Preparación',
                    'F5': 'Presentación',
                    'F6': 'Examen',
                    'F7': 'Publicación',
                    'F8': 'Resolución',
                    'F9': 'Seguimiento'
                  };

                  if (item.count === 0) return null;

                  return (
                    <div key={item.fase} className="flex items-center gap-3">
                      <div className="w-8 text-center">
                        <Badge variant="outline" className="text-xs font-mono">
                          {item.fase}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500 bg-primary"
                              style={{ width: `${percentage}%`, opacity: 0.4 + (index * 0.06) }}
                            />
                          </div>
                          <span className="text-sm font-semibold w-8 text-right">
                            {item.count}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {faseNames[item.fase]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Actividad reciente */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Actividad Reciente</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3 pr-4">
                  {actividadReciente.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No hay actividad reciente
                    </p>
                  ) : (
                    actividadReciente.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div key={index} className="flex items-start gap-3">
                          <div className={cn("p-1.5 rounded-lg bg-primary/10", item.color)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {item.time ? formatTimeAgo(new Date(item.time)) : ''}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helpers
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

function formatTimeAgo(date: Date) {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  
  if (diffInMinutes < 1) return 'ahora';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
  return `${Math.floor(diffInMinutes / 1440)}d`;
}
