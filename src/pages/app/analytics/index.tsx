import { useEffect } from 'react';
import { usePageTitle } from '@/contexts/page-context';
import { AnalyticsDashboard } from '@/components/features/analytics';

export default function AnalyticsPage() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle('Analytics & Reportes');
  }, [setTitle]);

  return <AnalyticsDashboard />;
}
