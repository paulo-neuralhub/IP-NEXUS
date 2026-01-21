import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics, trackPageView } from '@/lib/analytics/tracking';

/**
 * Hook to automatically track page views on route changes
 */
export function usePageViewTracking() {
  const location = useLocation();
  const prevPathRef = useRef<string>('');

  useEffect(() => {
    // Only track if path actually changed
    if (location.pathname !== prevPathRef.current) {
      trackPageView(location.pathname);
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname]);
}

/**
 * Hook to track feature usage
 */
export function useFeatureTracking() {
  const trackFeature = useCallback((
    featureName: string,
    properties?: Record<string, unknown>
  ) => {
    analytics.feature(featureName, properties);
  }, []);

  return { trackFeature };
}

/**
 * Hook to track time spent on a page/component
 */
export function useEngagementTracking(componentName: string) {
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();

    return () => {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (duration > 5) { // Only track if user spent more than 5 seconds
        analytics.engagement('time_on_page', {
          component: componentName,
          duration_seconds: duration,
        });
      }
    };
  }, [componentName]);
}

/**
 * Hook to track search interactions
 */
export function useSearchTracking() {
  const trackSearch = useCallback((
    query: string,
    resultCount?: number,
    searchType?: string
  ) => {
    analytics.search(query, resultCount, searchType);
  }, []);

  return { trackSearch };
}

/**
 * Hook to track AI interactions
 */
export function useAITracking() {
  const trackAIInteraction = useCallback((
    action: string,
    agentType?: string,
    properties?: Record<string, unknown>
  ) => {
    analytics.ai(action, agentType, properties);
  }, []);

  return { trackAIInteraction };
}

/**
 * Hook to track marketplace actions
 */
export function useMarketTracking() {
  const trackMarketAction = useCallback((
    action: string,
    properties?: Record<string, unknown>
  ) => {
    analytics.market(action, properties);
  }, []);

  return { trackMarketAction };
}

/**
 * Hook to track document actions
 */
export function useDocumentTracking() {
  const trackDocumentAction = useCallback((
    action: string,
    documentType?: string,
    properties?: Record<string, unknown>
  ) => {
    analytics.document(action, documentType, properties);
  }, []);

  return { trackDocumentAction };
}

/**
 * Hook to track conversions
 */
export function useConversionTracking() {
  const trackConversion = useCallback((
    action: string,
    value?: number,
    properties?: Record<string, unknown>
  ) => {
    analytics.conversion(action, value, properties);
  }, []);

  return { trackConversion };
}

/**
 * Hook to track errors
 */
export function useErrorTracking() {
  const trackError = useCallback((
    errorCode: string,
    message?: string,
    context?: Record<string, unknown>
  ) => {
    analytics.error(errorCode, message, context);
  }, []);

  return { trackError };
}

// Re-export analytics object for direct use
export { analytics };
