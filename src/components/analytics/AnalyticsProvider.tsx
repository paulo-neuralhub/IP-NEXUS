import { usePageViewTracking } from '@/hooks/analytics/useTracking';

/**
 * Analytics Provider - Tracks page views automatically on route changes.
 * Must be placed inside BrowserRouter.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  usePageViewTracking();
  return <>{children}</>;
}
