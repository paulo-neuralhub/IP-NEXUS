// =====================================================
// P72: Analytics Tracker Service
// =====================================================
// Servicio para trackear eventos de analytics desde el frontend.
// Usa la edge function track-event.
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

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
  referrer?: string;
  feature_key?: string;
  duration_seconds?: number;
  success?: boolean;
}

// Session ID persistente durante la sesión del navegador
let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    // Intentar recuperar de sessionStorage
    sessionId = sessionStorage.getItem('analytics_session_id');
    
    if (!sessionId) {
      // Generar nuevo session_id
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
  }
  return sessionId;
}

/**
 * Trackear un evento de analytics
 */
export async function trackEvent(options: TrackEventOptions): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const payload = {
      ...options,
      session_id: getSessionId(),
      page_path: options.page_path || window.location.pathname,
      page_title: options.page_title || document.title,
      referrer: options.referrer || document.referrer,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Añadir auth header si hay sesión
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const response = await fetch(
      `https://dcdbpmbzizzzzdfkvohl.supabase.co/functions/v1/track-event`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      logger.warn('Analytics track failed', { error, payload });
    }
  } catch (error) {
    // No bloquear la app por errores de analytics
    logger.debug('Analytics track error', { error });
  }
}

/**
 * Trackear vista de página
 */
export function trackPageView(pagePath?: string, pageTitle?: string): void {
  trackEvent({
    event_name: 'page_view',
    event_category: 'page_view',
    page_path: pagePath,
    page_title: pageTitle,
  });
}

/**
 * Trackear uso de feature
 */
export function trackFeatureUse(
  featureKey: string, 
  properties?: Record<string, unknown>,
  durationSeconds?: number
): void {
  trackEvent({
    event_name: `feature_${featureKey}`,
    event_category: 'feature_use',
    feature_key: featureKey,
    properties,
    duration_seconds: durationSeconds,
  });
}

/**
 * Trackear búsqueda
 */
export function trackSearch(query: string, resultCount?: number): void {
  trackEvent({
    event_name: 'search',
    event_category: 'search',
    properties: { query, result_count: resultCount },
  });
}

/**
 * Trackear interacción con AI
 */
export function trackAIInteraction(
  agentType: string, 
  action: string, 
  properties?: Record<string, unknown>
): void {
  trackEvent({
    event_name: `ai_${agentType}_${action}`,
    event_category: 'ai_interaction',
    properties: { agent_type: agentType, action, ...properties },
  });
}

/**
 * Trackear acción en marketplace
 */
export function trackMarketAction(
  action: string, 
  properties?: Record<string, unknown>
): void {
  trackEvent({
    event_name: `market_${action}`,
    event_category: 'market_action',
    properties,
  });
}

/**
 * Trackear error de usuario
 */
export function trackError(
  errorCode: string, 
  errorMessage: string, 
  context?: Record<string, unknown>
): void {
  trackEvent({
    event_name: `error_${errorCode}`,
    event_category: 'error',
    properties: { code: errorCode, message: errorMessage, ...context },
    success: false,
  });
}

/**
 * Trackear conversión
 */
export function trackConversion(
  type: string, 
  value?: number, 
  properties?: Record<string, unknown>
): void {
  trackEvent({
    event_name: `conversion_${type}`,
    event_category: 'conversion',
    properties: { type, value, ...properties },
  });
}

/**
 * Hook para trackear tiempo en página
 */
export function createEngagementTracker(featureKey: string): () => void {
  const startTime = Date.now();
  
  return () => {
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);
    
    if (durationSeconds > 1) { // Solo trackear si estuvo más de 1 segundo
      trackEvent({
        event_name: `engagement_${featureKey}`,
        event_category: 'engagement',
        feature_key: featureKey,
        duration_seconds: durationSeconds,
      });
    }
  };
}
