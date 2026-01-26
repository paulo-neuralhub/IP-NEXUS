// =============================================
// PÁGINA: Dashboard
// Dashboard principal rediseñado (L57-B)
// =============================================

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useOrganization } from "@/contexts/organization-context";
import { usePageTitle } from "@/contexts/page-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardHome } from "@/hooks/use-dashboard-home";
import { 
  MetricsBar, 
  useDashboardMetrics,
  TodaySection,
  ExpedientesChart,
  FacturacionChart,
  TiposChart,
  PlazosChart,
  RecentActivity,
} from "@/components/dashboard";
import { FeatureGuide } from "@/components/help";
import { useContextualHelp } from "@/hooks/useContextualHelp";

const Dashboard = () => {
  const { featureKey, currentGuide, shouldShowGuide } = useContextualHelp();
  const { profile } = useAuth();
  const { currentOrganization } = useOrganization();
  const { setTitle } = usePageTitle();
  const { isLoading } = useDashboardHome();
  const { metrics } = useDashboardMetrics();

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

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {currentGuide && shouldShowGuide(featureKey) ? (
        <FeatureGuide
          featureKey={featureKey}
          title={currentGuide.title}
          steps={currentGuide.steps}
        />
      ) : null}

      {/* Header compacto */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="text-muted-foreground">
          Esto es lo que tienes pendiente hoy en <span className="font-medium text-foreground">{currentOrganization?.name}</span>
        </p>
      </div>

      {/* Métricas compactas */}
      <MetricsBar metrics={metrics} />

      {/* Grid principal */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Columna izquierda: Hoy */}
        <div className="lg:col-span-4">
          <TodaySection />
        </div>

        {/* Columna central y derecha: Gráficos y Actividad */}
        <div className="lg:col-span-8 space-y-6">
          {/* Primera fila de gráficos */}
          <div className="grid md:grid-cols-2 gap-6">
            <ExpedientesChart />
            <FacturacionChart />
          </div>

          {/* Segunda fila */}
          <div className="grid md:grid-cols-2 gap-6">
            <TiposChart />
            <RecentActivity />
          </div>

          {/* Tercera fila: Plazos */}
          <PlazosChart />
        </div>
      </div>
    </div>
  );
};

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="space-y-1">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Metrics bar skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>

      {/* Main grid skeleton */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <Skeleton className="h-[500px] rounded-xl" />
        </div>
        <div className="lg:col-span-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
