/**
 * Sentry Error Tracking Configuration
 * Provides error tracking, performance monitoring, and session replay
 */

// Dynamic import to avoid loading Sentry if not configured
let Sentry: typeof import('@sentry/react') | null = null;

export async function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.info('Sentry DSN not configured, error tracking disabled');
    return;
  }

  try {
    Sentry = await import('@sentry/react');
    
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
      
      // Performance Monitoring
      tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
      
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // Filter out common noise errors
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        'Non-Error promise rejection captured',
        /Loading chunk \d+ failed/,
        'Network request failed',
        'Failed to fetch',
        'NetworkError',
        'AbortError',
        'ChunkLoadError',
        // Browser extension errors
        /^chrome-extension:\/\//,
        /^moz-extension:\/\//,
      ],
      
      // Deny URLs from extensions
      denyUrls: [
        /extensions\//i,
        /^chrome:\/\//i,
        /^chrome-extension:\/\//i,
        /^moz-extension:\/\//i,
      ],
      
      // Before send hook to sanitize PII
      beforeSend(event) {
        // Redact email from URLs
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
            if (breadcrumb.data?.url) {
              breadcrumb.data.url = breadcrumb.data.url
                .replace(/email=[^&]+/g, 'email=[REDACTED]')
                .replace(/token=[^&]+/g, 'token=[REDACTED]')
                .replace(/password=[^&]+/g, 'password=[REDACTED]')
                .replace(/api_key=[^&]+/g, 'api_key=[REDACTED]');
            }
            return breadcrumb;
          });
        }
        
        // Redact user email if present
        if (event.user?.email) {
          const emailParts = event.user.email.split('@');
          if (emailParts.length === 2) {
            event.user.email = `${emailParts[0].charAt(0)}***@${emailParts[1]}`;
          }
        }
        
        return event;
      },
      
      // Before breadcrumb to filter sensitive data
      beforeBreadcrumb(breadcrumb) {
        // Filter out noisy console logs
        if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
          return null;
        }
        return breadcrumb;
      },
    });
    
    console.info('Sentry initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize Sentry:', error);
  }
}

/**
 * Capture an error with optional context
 */
export function captureError(
  error: Error | unknown,
  context?: Record<string, unknown>
) {
  if (Sentry) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    console.error('Error captured (Sentry not initialized):', error, context);
  }
}

/**
 * Capture a message
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, unknown>
) {
  if (Sentry) {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  } else {
    console.log(`[${level.toUpperCase()}] ${message}`, context);
  }
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  organizationId?: string;
  organizationName?: string;
  role?: string;
}) {
  if (Sentry) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
    });
    
    if (user.organizationId) {
      Sentry.setTag('organization_id', user.organizationId);
    }
    if (user.organizationName) {
      Sentry.setTag('organization_name', user.organizationName);
    }
    if (user.role) {
      Sentry.setTag('user_role', user.role);
    }
  }
}

/**
 * Clear user context on logout
 */
export function clearUserContext() {
  if (Sentry) {
    Sentry.setUser(null);
  }
}

/**
 * Set a custom tag
 */
export function setTag(key: string, value: string) {
  if (Sentry) {
    Sentry.setTag(key, value);
  }
}

/**
 * Set multiple tags
 */
export function setTags(tags: Record<string, string>) {
  if (Sentry) {
    Object.entries(tags).forEach(([key, value]) => {
      Sentry!.setTag(key, value);
    });
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: {
  category: string;
  message: string;
  level?: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}) {
  if (Sentry) {
    Sentry.addBreadcrumb({
      ...breadcrumb,
      level: breadcrumb.level || 'info',
    });
  }
}

/**
 * Start a performance transaction
 */
export function startTransaction(name: string, op: string) {
  if (Sentry) {
    return Sentry.startInactiveSpan({
      name,
      op,
    });
  }
  return null;
}

/**
 * Wrap a function with error boundary
 */
export function withErrorTracking<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context?: Record<string, unknown>
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch((error) => {
          captureError(error, { ...context, args });
          throw error;
        });
      }
      return result;
    } catch (error) {
      captureError(error, { ...context, args });
      throw error;
    }
  }) as T;
}
