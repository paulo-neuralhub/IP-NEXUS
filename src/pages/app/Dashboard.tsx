 // =============================================
 // PÁGINA: Dashboard - Command Center
 // Dashboard principal con diseño SILK
 // =============================================
 
 import { useEffect, useMemo } from "react";
 import { useAuth } from "@/contexts/auth-context";
 import { useOrganization } from "@/contexts/organization-context";
 import { usePageTitle } from "@/contexts/page-context";
 import { Skeleton } from "@/components/ui/skeleton";
 import { useDashboardHome } from "@/hooks/use-dashboard-home";
 import { useDashboardMetrics } from "@/components/dashboard";
 import { FeatureGuide } from "@/components/help";
 import { useContextualHelp } from "@/hooks/useContextualHelp";
 import { format } from "date-fns";
 import { es } from "date-fns/locale";
 
 // Command Center Components
 import {
   UrgentBadges,
   OperationalKPIs,
   AgendaToday,
   MiniCalendar,
   UpcomingDeadlinesList,
   ExpedientesTiposChart,
   FacturacionEvolucionChart,
   PipelineChart,
   RecentActivityFeed,
   type AgendaEvent,
   type UpcomingDeadline,
   type ActivityItem,
 } from "@/components/dashboard/CommandCenter";
 
 import { 
   useExpedientesChart, 
   useFacturacionChart, 
   useTiposChart 
 } from "@/hooks/use-dashboard-charts";
 
 const Dashboard = () => {
   const { featureKey, currentGuide, shouldShowGuide } = useContextualHelp();
   const { profile } = useAuth();
   const { currentOrganization } = useOrganization();
   const { setTitle } = usePageTitle();
   const { data, isLoading } = useDashboardHome();
   const { metrics } = useDashboardMetrics();
 
   // Charts data
   const { data: tiposData } = useTiposChart();
   const { data: facturacionData } = useFacturacionChart();
   const { data: expedientesData } = useExpedientesChart();
 
   useEffect(() => {
     setTitle("Dashboard");
   }, [setTitle]);
 
   const firstName = profile?.full_name?.split(" ")[0] || "Usuario";
   
   // Saludo según hora del día
   const getGreeting = () => {
     const hour = new Date().getHours();
     if (hour < 12) return "Buenos días";
     if (hour < 19) return "Buenas tardes";
     return "Buenas noches";
   };
 
   // Fecha actual formateada
   const fechaActual = format(new Date(), "EEEE d 'de' MMMM yyyy", { locale: es });
 
   // Mapear métricas para badges urgentes
   const urgentMetrics = useMemo(() => {
     const plazosHoy = metrics.find(m => m.label === 'Plazos hoy')?.value ?? 0;
     const urgentes = metrics.find(m => m.label === 'Urgentes')?.value ?? 0;
     const alertas = metrics.find(m => m.label === 'Alertas Spider')?.value ?? 0;
     return {
       plazosHoy: typeof plazosHoy === 'number' ? plazosHoy : parseInt(String(plazosHoy)) || 0,
       expedientesUrgentes: typeof urgentes === 'number' ? urgentes : parseInt(String(urgentes)) || 0,
       alertasSpider: typeof alertas === 'number' ? alertas : parseInt(String(alertas)) || 0,
     };
   }, [metrics]);
 
   // Mapear métricas operacionales
   const operationalMetrics = useMemo(() => {
     const expedientes = metrics.find(m => m.label === 'Expedientes')?.value ?? 0;
     const activos = metrics.find(m => m.label === 'Activos')?.value ?? 0;
     const vigilancias = metrics.find(m => m.label === 'Vigilancias')?.value ?? 0;
     return {
       expedientesActivos: typeof activos === 'number' ? activos : parseInt(String(activos)) || 0,
       vigilanciasActivas: typeof vigilancias === 'number' ? vigilancias : parseInt(String(vigilancias)) || 0,
       emailsSinLeer: 0, // TODO: Conectar con integración email
       whatsappSinLeer: 0, // TODO: Conectar con integración WhatsApp
     };
   }, [metrics]);
 
   // Mapear agenda del día (mock por ahora - conectar a calendar)
   const agendaHoy: AgendaEvent[] = useMemo(() => {
     // TODO: Conectar con datos reales del calendario
     return [];
   }, []);
 
   // Mapear plazos próximos
   const plazosProximos: UpcomingDeadline[] = useMemo(() => {
     if (!data?.deadlines) return [];
     return data.deadlines.slice(0, 5).map(d => ({
       id: d.id,
       titulo: d.title,
       expediente: d.matterRef || 'Sin referencia',
       fecha: new Date(d.dueDate),
       oficina: 'OEPM', // TODO: Obtener de datos reales
       matterId: d.matterId,
     }));
   }, [data?.deadlines]);
 
   // Mapear deadlines para calendario
   const calendarDeadlines = useMemo(() => {
     if (!data?.deadlines) return [];
     return data.deadlines.map(d => ({
       date: new Date(d.dueDate),
       type: d.priority === 'critical' || d.priority === 'high' ? 'plazo' as const : 'tarea' as const,
     }));
   }, [data?.deadlines]);
 
   // Mapear tipos para gráfico
   const tiposChartData = useMemo(() => {
     if (!tiposData) return [];
     return tiposData.map(t => ({
       tipo: t.name,
       count: Math.round((t.value / 100) * (data?.totalMatters || 10)),
       color: t.color,
     }));
   }, [tiposData, data?.totalMatters]);
 
   // Mapear facturación para gráfico
   const facturacionChartData = useMemo(() => {
     if (!facturacionData) return [];
     return facturacionData.map(f => ({
       mes: f.mes,
       valor: f.valor,
     }));
   }, [facturacionData]);
 
   // Pipeline por fase (mock - conectar a datos reales)
   const pipelineData = useMemo(() => {
     return [
       { fase: 'F0', nombre: 'Consulta', count: 5, color: '#94a3b8', max: 12 },
       { fase: 'F1', nombre: 'Búsqueda', count: 8, color: '#64748b', max: 12 },
       { fase: 'F2', nombre: 'Preparación', count: 12, color: '#00b4d8', max: 12 },
       { fase: 'F3', nombre: 'Presentación', count: 7, color: '#2563eb', max: 12 },
       { fase: 'F4', nombre: 'Examen', count: 9, color: '#10b981', max: 12 },
       { fase: 'F5', nombre: 'Registro', count: 6, color: '#10b981', max: 12 },
     ];
   }, []);
 
   // Actividad reciente
   const actividadReciente: ActivityItem[] = useMemo(() => {
     if (!data?.recentActivity) return [];
     return data.recentActivity.slice(0, 4).map(a => ({
       id: a.id,
       type: a.type,
       titulo: a.title,
       usuario: undefined, // TODO: Obtener usuario de la actividad
       tiempo: new Date(a.timestamp),
       link: a.link,
     }));
   }, [data?.recentActivity]);
 
   if (isLoading) {
     return <DashboardSkeleton />;
   }
 
   return (
     <div className="space-y-4 animate-fade-in">
       {/* LED animation styles */}
       <style>{`
         @keyframes pulse-glow {
           0%, 100% { opacity: 0.4; }
           50% { opacity: 0.7; }
         }
         .animate-pulse-glow {
           animation: pulse-glow 2s ease-in-out infinite;
         }
       `}</style>
 
       {currentGuide && shouldShowGuide(featureKey) ? (
         <FeatureGuide
           featureKey={featureKey}
           title={currentGuide.title}
           steps={currentGuide.steps}
         />
       ) : null}
 
       {/* Header SILK */}
       <div className="flex items-start justify-between">
         <div>
           <h1 
             className="text-[23px] font-light m-0"
             style={{ color: '#0a2540' }}
           >
             {getGreeting()}, <span className="font-bold">{firstName}</span>
           </h1>
           <p 
             className="text-[13px] mt-1"
             style={{ color: '#64748b' }}
           >
             <span style={{ color: '#00b4d8', fontWeight: 600 }}>
               {data?.upcomingDeadlines || 0} plazos esta semana
             </span>
             {' · '}
             <span className="capitalize">{fechaActual}</span>
           </p>
         </div>
       </div>
 
       {/* 1. BADGES URGENTES (Solo si hay valores > 0) */}
       <UrgentBadges 
         plazosHoy={urgentMetrics.plazosHoy}
         expedientesUrgentes={urgentMetrics.expedientesUrgentes}
         alertasSpider={urgentMetrics.alertasSpider}
       />
 
       {/* 2. KPIs OPERACIONALES */}
       <OperationalKPIs 
         expedientesActivos={operationalMetrics.expedientesActivos}
         vigilanciasActivas={operationalMetrics.vigilanciasActivas}
         emailsSinLeer={operationalMetrics.emailsSinLeer}
         whatsappSinLeer={operationalMetrics.whatsappSinLeer}
       />
 
       {/* 3. AGENDA + CALENDARIO + PLAZOS */}
       <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
         {/* Agenda HOY - 3 cols */}
         <div className="lg:col-span-3">
           <AgendaToday eventos={agendaHoy} />
         </div>
         
         {/* Calendario + Plazos - 7 cols */}
         <div className="lg:col-span-7">
           <div className="grid grid-cols-1 md:grid-cols-10 gap-4 h-full">
             {/* Calendario - 6 cols */}
             <div className="md:col-span-6">
               <MiniCalendar deadlines={calendarDeadlines} />
             </div>
             {/* Plazos - 4 cols */}
             <div className="md:col-span-4">
               <UpcomingDeadlinesList plazos={plazosProximos} />
             </div>
           </div>
         </div>
       </div>
 
       {/* 4. GRÁFICOS - Analytics */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <ExpedientesTiposChart data={tiposChartData} />
         <FacturacionEvolucionChart 
           data={facturacionChartData}
           metricas={{
             mes: '+12%',
             trimestre: '+23%',
             año: '+45%',
           }}
         />
         <PipelineChart data={pipelineData} />
       </div>
 
       {/* 5. ACTIVIDAD RECIENTE */}
       <RecentActivityFeed actividades={actividadReciente} />
     </div>
   );
 };
 
 function DashboardSkeleton() {
   return (
     <div className="space-y-4 animate-fade-in">
       {/* Header skeleton */}
       <div className="space-y-1">
         <Skeleton className="h-8 w-64" />
         <Skeleton className="h-4 w-48" />
       </div>
 
       {/* Urgent badges skeleton */}
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
         {Array.from({ length: 3 }).map((_, i) => (
           <Skeleton key={i} className="h-20 rounded-[14px]" />
         ))}
       </div>
 
       {/* KPIs skeleton */}
       <Skeleton className="h-24 rounded-2xl" />
 
       {/* Agenda + Calendar skeleton */}
       <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
         <Skeleton className="lg:col-span-3 h-[280px] rounded-[14px]" />
         <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-10 gap-4">
           <Skeleton className="md:col-span-6 h-[280px] rounded-[14px]" />
           <Skeleton className="md:col-span-4 h-[280px] rounded-[14px]" />
         </div>
       </div>
 
       {/* Charts skeleton */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {Array.from({ length: 3 }).map((_, i) => (
           <Skeleton key={i} className="h-[240px] rounded-[14px]" />
         ))}
       </div>
 
       {/* Activity skeleton */}
       <Skeleton className="h-32 rounded-[14px]" />
     </div>
   );
 }
 
 export default Dashboard;
