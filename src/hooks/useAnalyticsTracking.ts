import React, { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// =====================================================
// CONFIGURATION
// =====================================================

const TRACKING_ENABLED = true; // Can be controlled via feature flag
const BATCH_SIZE = 10;
const BATCH_INTERVAL = 5000; // 5 seconds
const SUPABASE_URL = 'https://dcdbpmbzizzzzdfkvohl.supabase.co';

// Session ID persists for the browser session
const getSessionId = (): string => {
  if (typeof window === 'undefined') return 'ssr';
  
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// =====================================================
// EVENT QUEUE & BATCHING
// =====================================================

interface QueuedEvent {
  event_name: string;
  event_category: string;
  page_path?: string;
  page_title?: string;
  referrer?: string;
  properties?: Record<string, unknown>;
  session_id: string;
  timestamp: string;
}

let eventQueue: QueuedEvent[] = [];
let batchTimeout: ReturnType<typeof setTimeout> | null = null;

async function sendEvents(events: QueuedEvent[]): Promise<void> {
  if (events.length === 0) return;
  
  try {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token || '';
    
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/track-event`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZGJwbWJ6aXp6enpkZmt2b2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MjgzNTcsImV4cCI6MjA4NDMwNDM1N30.m-eYHXgQAPEejDLHKgJQaBiwEB19HJT3zjQSsPqLf5g',
        },
        body: JSON.stringify({ events }),
      }
    );
    
    if (!response.ok) {
      console.warn('Analytics: Failed to send events');
    }
  } catch (error) {
    // Silently fail - analytics shouldn't break the app
    console.warn('Analytics: Error sending events', error);
  }
}

function queueEvent(event: Omit<QueuedEvent, 'session_id' | 'timestamp'>): void {
  if (!TRACKING_ENABLED) return;
  
  eventQueue.push({
    ...event,
    session_id: getSessionId(),
    timestamp: new Date().toISOString(),
  });
  
  // If we reach batch size, send immediately
  if (eventQueue.length >= BATCH_SIZE) {
    const toSend = [...eventQueue];
    eventQueue = [];
    if (batchTimeout) {
      clearTimeout(batchTimeout);
      batchTimeout = null;
    }
    sendEvents(toSend);
  } else if (!batchTimeout) {
    // Otherwise wait for interval
    batchTimeout = setTimeout(() => {
      const toSend = [...eventQueue];
      eventQueue = [];
      batchTimeout = null;
      sendEvents(toSend);
    }, BATCH_INTERVAL);
  }
}

// Send pending events on page unload using sendBeacon
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (eventQueue.length > 0) {
      const blob = new Blob(
        [JSON.stringify({ events: eventQueue })],
        { type: 'application/json' }
      );
      navigator.sendBeacon(
        `${SUPABASE_URL}/functions/v1/track-event`,
        blob
      );
      eventQueue = [];
    }
  });
}

// =====================================================
// MAIN HOOK
// =====================================================

export function useAnalyticsTracking() {
  const location = useLocation();
  const lastPath = useRef<string | null>(null);
  const pageLoadTime = useRef<number>(Date.now());

  // Track page views automatically
  useEffect(() => {
    if (location.pathname !== lastPath.current) {
      // Calculate time on previous page
      if (lastPath.current) {
        const timeOnPage = Date.now() - pageLoadTime.current;
        queueEvent({
          event_name: 'page_exit',
          event_category: 'engagement',
          page_path: lastPath.current,
          properties: { time_on_page_ms: timeOnPage },
        });
      }
      
      // Track new page view
      queueEvent({
        event_name: 'page_view',
        event_category: 'page_view',
        page_path: location.pathname,
        page_title: typeof document !== 'undefined' ? document.title : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      });
      
      lastPath.current = location.pathname;
      pageLoadTime.current = Date.now();
    }
  }, [location.pathname]);

  // Generic event tracking
  const trackEvent = useCallback((
    eventName: string,
    category: string,
    properties?: Record<string, unknown>
  ) => {
    queueEvent({
      event_name: eventName,
      event_category: category,
      page_path: location.pathname,
      properties,
    });
  }, [location.pathname]);

  // Feature usage tracking
  const trackFeatureUse = useCallback((
    feature: string,
    properties?: Record<string, unknown>
  ) => {
    trackEvent(`feature_${feature}`, 'feature_use', { feature, ...properties });
  }, [trackEvent]);

  // Search tracking
  const trackSearch = useCallback((
    query: string,
    resultsCount: number,
    searchType: 'basic' | 'advanced' | 'ai'
  ) => {
    trackEvent('search', 'search', { 
      query: query.substring(0, 100), // Limit query length
      results_count: resultsCount, 
      search_type: searchType 
    });
  }, [trackEvent]);

  // AI interaction tracking
  const trackAIInteraction = useCallback((
    action: 'query' | 'analyze' | 'draft' | 'translate' | 'other',
    properties?: Record<string, unknown>
  ) => {
    trackEvent(`ai_${action}`, 'ai_interaction', properties);
  }, [trackEvent]);

  // Error tracking
  const trackError = useCallback((
    errorCode: string,
    errorMessage: string,
    properties?: Record<string, unknown>
  ) => {
    trackEvent('error', 'error', { 
      error_code: errorCode, 
      error_message: errorMessage.substring(0, 200),
      ...properties 
    });
  }, [trackEvent]);

  // Conversion tracking
  const trackConversion = useCallback((
    conversionType: 'signup' | 'upgrade' | 'purchase' | 'other',
    value?: number,
    properties?: Record<string, unknown>
  ) => {
    trackEvent(`conversion_${conversionType}`, 'conversion', { value, ...properties });
  }, [trackEvent]);

  // Market action tracking
  const trackMarketAction = useCallback((
    action: 'view_listing' | 'request_quote' | 'send_quote' | 'favorite' | 'message',
    properties?: Record<string, unknown>
  ) => {
    trackEvent(`market_${action}`, 'market_action', properties);
  }, [trackEvent]);

  // Document action tracking
  const trackDocumentAction = useCallback((
    action: 'view' | 'download' | 'upload' | 'generate' | 'sign',
    documentType?: string,
    properties?: Record<string, unknown>
  ) => {
    trackEvent(`document_${action}`, 'document_action', { document_type: documentType, ...properties });
  }, [trackEvent]);

  return {
    trackEvent,
    trackFeatureUse,
    trackSearch,
    trackAIInteraction,
    trackError,
    trackConversion,
    trackMarketAction,
    trackDocumentAction,
  };
}

// =====================================================
// HIGHER ORDER COMPONENT
// =====================================================

export function withAnalytics<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  featureName: string
) {
  const WithAnalyticsComponent = (props: P) => {
    const { trackFeatureUse } = useAnalyticsTracking();
    
    useEffect(() => {
      trackFeatureUse(featureName, { mounted: true });
    }, [trackFeatureUse]);
    
    return React.createElement(WrappedComponent, props);
  };
  
  WithAnalyticsComponent.displayName = `withAnalytics(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return WithAnalyticsComponent;
}

// =====================================================
// EXPORTS
// =====================================================

export { getSessionId, queueEvent };
