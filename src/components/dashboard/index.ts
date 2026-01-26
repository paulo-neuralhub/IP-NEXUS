// =============================================
// Exports de componentes de dashboard
// =============================================

// Componentes legacy (mantenidos para compatibilidad)
export { QuickStats, StatCard } from "./quick-stats";
export { CriticalAlertsBanner } from "./critical-alerts-banner";
export { PortfolioSummary } from "./portfolio-summary";
export { RecentActivity as RecentActivityLegacy } from "./recent-activity";
export { UpcomingDeadlines } from "./upcoming-deadlines";
export { AICreditsCard } from "./ai-credits-card";
export { QuickAccess } from "./quick-access";
export { ExpiringAssetsWarning } from "./expiring-assets-warning";
export { ModuleCards } from "./module-cards";

// Nuevos componentes rediseñados (L57-B)
export { MetricsBar, useDashboardMetrics } from './MetricsBar';
export { TodaySection } from './TodaySection';
export { 
  ExpedientesChart, 
  FacturacionChart, 
  TiposChart,
  PlazosChart,
} from './TrendCharts';
export { RecentActivity } from './RecentActivity';
