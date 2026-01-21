import { supabase } from '@/integrations/supabase/client';

// =====================================================
// ANALYTICS TRACKING SERVICE
// =====================================================

type EventCategory = 
  | 'page_view'
  | 'feature_use'
  | 'search'
  | 'ai_interaction'
  | 'market_action'
  | 'document_action'
  | 'error'
  | 'conversion'
  | 'engagement';

interface TrackEventOptions {
  event_name: string;
  event_category: EventCategory;
  properties?: Record<string, unknown>;
  page_path?: string;
  page_title?: string;
}

// Session ID persists for the browser session
let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    // Try to get from sessionStorage
    sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
  }
  return sessionId;
}

function getScreenResolution(): string {
  if (typeof window !== 'undefined') {
    return `${window.screen.width}x${window.screen.height}`;
  }
  return 'unknown';
}

/**
 * Track an analytics event
 */
export async function trackEvent(options: TrackEventOptions): Promise<void> {
  try {
    const { event_name, event_category, properties = {}, page_path, page_title } = options;

    await supabase.functions.invoke('track-event', {
      body: {
        event_name,
        event_category,
        properties,
        page_path: page_path || (typeof window !== 'undefined' ? window.location.pathname : undefined),
        page_title: page_title || (typeof document !== 'undefined' ? document.title : undefined),
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        session_id: getSessionId(),
        screen_resolution: getScreenResolution(),
      }
    });
  } catch (error) {
    // Silently fail - analytics shouldn't break the app
    console.warn('Analytics tracking failed:', error);
  }
}

/**
 * Track a page view
 */
export function trackPageView(path?: string, title?: string): void {
  trackEvent({
    event_name: 'page_view',
    event_category: 'page_view',
    page_path: path,
    page_title: title,
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUse(
  featureName: string, 
  properties?: Record<string, unknown>
): void {
  trackEvent({
    event_name: featureName,
    event_category: 'feature_use',
    properties,
  });
}

/**
 * Track search
 */
export function trackSearch(
  query: string, 
  resultCount?: number, 
  searchType?: string
): void {
  trackEvent({
    event_name: 'search',
    event_category: 'search',
    properties: {
      query,
      result_count: resultCount,
      search_type: searchType,
    },
  });
}

/**
 * Track AI interaction
 */
export function trackAIInteraction(
  action: string, 
  agentType?: string, 
  properties?: Record<string, unknown>
): void {
  trackEvent({
    event_name: action,
    event_category: 'ai_interaction',
    properties: {
      agent_type: agentType,
      ...properties,
    },
  });
}

/**
 * Track marketplace action
 */
export function trackMarketAction(
  action: string, 
  properties?: Record<string, unknown>
): void {
  trackEvent({
    event_name: action,
    event_category: 'market_action',
    properties,
  });
}

/**
 * Track document action
 */
export function trackDocumentAction(
  action: string, 
  documentType?: string, 
  properties?: Record<string, unknown>
): void {
  trackEvent({
    event_name: action,
    event_category: 'document_action',
    properties: {
      document_type: documentType,
      ...properties,
    },
  });
}

/**
 * Track error
 */
export function trackError(
  errorCode: string, 
  message?: string, 
  context?: Record<string, unknown>
): void {
  trackEvent({
    event_name: 'error',
    event_category: 'error',
    properties: {
      code: errorCode,
      message,
      ...context,
    },
  });
}

/**
 * Track conversion
 */
export function trackConversion(
  action: string, 
  value?: number, 
  properties?: Record<string, unknown>
): void {
  trackEvent({
    event_name: action,
    event_category: 'conversion',
    properties: {
      value,
      ...properties,
    },
  });
}

/**
 * Track engagement (time on page, scroll depth, etc.)
 */
export function trackEngagement(
  action: string, 
  properties?: Record<string, unknown>
): void {
  trackEvent({
    event_name: action,
    event_category: 'engagement',
    properties,
  });
}

// Export all tracking functions
export const analytics = {
  track: trackEvent,
  pageView: trackPageView,
  feature: trackFeatureUse,
  search: trackSearch,
  ai: trackAIInteraction,
  market: trackMarketAction,
  document: trackDocumentAction,
  error: trackError,
  conversion: trackConversion,
  engagement: trackEngagement,
  getSessionId,
};
