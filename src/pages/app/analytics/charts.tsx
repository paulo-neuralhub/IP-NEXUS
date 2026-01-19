import { useEffect } from 'react';
import { usePageTitle } from '@/contexts/page-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PortfolioByTypeChart, 
  PortfolioByStatusChart, 
  PortfolioByCountryChart 
} from '@/components/features/analytics';
import { AnalyticsStatsCards } from '@/components/features/analytics';
import { useAnalyticsStats } from '@/hooks/analytics/useAnalytics';

export default function AnalyticsChartsPage() {
  const { setTitle } = usePageTitle();
  const { data: stats } = useAnalyticsStats();

  useEffect(() => {
    setTitle('Dashboard de Analytics');
  }, [setTitle]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard de Analytics</h1>
        <p className="text-muted-foreground">
          Visualiza métricas y gráficos de tu portfolio
        </p>
      </div>

      <AnalyticsStatsCards stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PortfolioByTypeChart />
        <PortfolioByStatusChart />
        <PortfolioByCountryChart />
      </div>
    </div>
  );
}
