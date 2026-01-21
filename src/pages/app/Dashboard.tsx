import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useOrganization } from "@/contexts/organization-context";
import { usePageTitle } from "@/contexts/page-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardHome } from "@/hooks/use-dashboard-home";
import { PLANS } from "@/lib/constants";
import { 
  LayoutDashboard, 
  Plus, 
  Sparkles,
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  QuickStats,
  CriticalAlertsBanner,
  PortfolioSummary,
  RecentActivity,
  UpcomingDeadlines,
  AICreditsCard,
  QuickAccess,
  ExpiringAssetsWarning,
} from "@/components/dashboard";
import { PendingSignaturesWidget } from "@/components/signatures";
import { AlertsWidget } from "@/components/dashboard/AlertsWidget";
import { FeatureGuide } from "@/components/help";
import { useContextualHelp } from "@/hooks/useContextualHelp";

const Dashboard = () => {
  const { featureKey, currentGuide, shouldShowGuide } = useContextualHelp();
  const { profile } = useAuth();
  const { currentOrganization } = useOrganization();
  const { setTitle } = usePageTitle();
  const { data, isLoading, refetch, isRefetching } = useDashboardHome();

  useEffect(() => {
    setTitle("Dashboard");
  }, [setTitle]);

  const planInfo = PLANS[currentOrganization?.plan as keyof typeof PLANS];
  const firstName = profile?.full_name?.split(" ")[0] || "Usuario";

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">No se pudo cargar el dashboard</p>
      </div>
    );
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="bg-background-card rounded-xl p-6 border border-border flex-1 mr-4">
          <h1 className="text-2xl font-bold text-secondary flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            👋 Bienvenido, {firstName}
          </h1>
          <p className="text-muted-foreground mt-1">
            {currentOrganization?.name} · Plan{" "}
            <Badge variant="secondary">{planInfo?.name || "Starter"}</Badge>
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" asChild>
            <Link to="/app/spider/watchlists/new">
              <Plus className="h-4 w-4 mr-2" />
              Nueva vigilancia
            </Link>
          </Button>
          <Button asChild>
            <Link to="/app/genius">
              <Sparkles className="h-4 w-4 mr-2" />
              Consultar IA
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Access (full-width) */}
      <QuickAccess variant="bar" />

      {/* Critical Alerts */}
      <CriticalAlertsBanner count={data.criticalAlerts} />

      {/* Expiring Assets Warning */}
      <ExpiringAssetsWarning count={data.expiringMatters} />

      {/* Quick Stats */}
      <QuickStats
        totalMatters={data.totalMatters}
        activeWatchlists={data.activeWatchlists}
        pendingDeals={data.pendingDeals}
        upcomingDeadlines={data.upcomingDeadlines}
        criticalAlerts={data.criticalAlerts}
        totalContacts={data.totalContacts}
      />

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Portfolio & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Portfolio Value */}
          <PortfolioSummary
            value={data.portfolioValue}
            change={data.portfolioChange}
            currency={data.portfolioCurrency}
            breakdown={data.portfolioBreakdown}
          />

          {/* Recent Activity */}
          <RecentActivity activities={data.recentActivity} />
        </div>

        {/* Right Column - Alerts, Deadlines, Signatures, AI Credits, Quick Access */}
        <div className="space-y-6">
          {/* Predictive Alerts */}
          <AlertsWidget />

          {/* Upcoming Deadlines */}
          <UpcomingDeadlines deadlines={data.deadlines} />

          {/* Pending Signatures */}
          <PendingSignaturesWidget />

          {/* AI Credits */}
          <AICreditsCard
            used={data.aiCreditsUsed}
            total={data.aiCreditsTotal}
          />

        </div>
      </div>
    </div>
  );
};

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="bg-background-card rounded-xl p-6 border border-border flex-1 mr-4">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      {/* Main grid skeleton */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
