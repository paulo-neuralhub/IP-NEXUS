// =====================================================
// P72: useAnalytics Hook
// =====================================================
// Hook para integrar analytics en componentes React.
// Trackea automáticamente vistas de página y proporciona
// métodos para trackear eventos custom.
// =====================================================

import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  trackPageView,
  trackFeatureUse,
  trackSearch,
  trackAIInteraction,
  trackMarketAction,
  trackError,
  trackConversion,
  createEngagementTracker,
} from '@/lib/analytics/tracker';

interface UseAnalyticsOptions {
  /** Trackear automáticamente vistas de página */
  trackPageViews?: boolean;
  /** Trackear tiempo de engagement en la página */
  trackEngagement?: boolean;
  /** Nombre de la feature para engagement tracking */
  featureKey?: string;
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { 
    trackPageViews = true, 
    trackEngagement = false,
    featureKey,
  } = options;
  
  const location = useLocation();
  const engagementCleanupRef = useRef<(() => void) | null>(null);

  // Trackear vista de página cuando cambia la ruta
  useEffect(() => {
    if (trackPageViews) {
      trackPageView(location.pathname);
    }
  }, [location.pathname, trackPageViews]);

  // Trackear engagement (tiempo en página)
  useEffect(() => {
    if (trackEngagement && featureKey) {
      engagementCleanupRef.current = createEngagementTracker(featureKey);
      
      return () => {
        if (engagementCleanupRef.current) {
          engagementCleanupRef.current();
          engagementCleanupRef.current = null;
        }
      };
    }
  }, [trackEngagement, featureKey]);

  // Métodos de tracking
  const track = {
    pageView: useCallback((path?: string, title?: string) => {
      trackPageView(path, title);
    }, []),

    feature: useCallback((
      feature: string, 
      properties?: Record<string, unknown>,
      duration?: number
    ) => {
      trackFeatureUse(feature, properties, duration);
    }, []),

    search: useCallback((query: string, resultCount?: number) => {
      trackSearch(query, resultCount);
    }, []),

    ai: useCallback((
      agentType: string, 
      action: string, 
      properties?: Record<string, unknown>
    ) => {
      trackAIInteraction(agentType, action, properties);
    }, []),

    market: useCallback((
      action: string, 
      properties?: Record<string, unknown>
    ) => {
      trackMarketAction(action, properties);
    }, []),

    error: useCallback((
      code: string, 
      message: string, 
      context?: Record<string, unknown>
    ) => {
      trackError(code, message, context);
    }, []),

    conversion: useCallback((
      type: string, 
      value?: number, 
      properties?: Record<string, unknown>
    ) => {
      trackConversion(type, value, properties);
    }, []),
  };

  return { track };
}

/**
 * Hook simplificado para trackear una feature específica
 */
export function useFeatureTracking(featureKey: string) {
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    // Trackear inicio de uso
    trackFeatureUse(featureKey, { action: 'start' });

    return () => {
      // Trackear fin de uso con duración
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      trackFeatureUse(featureKey, { action: 'end' }, duration);
    };
  }, [featureKey]);
}
