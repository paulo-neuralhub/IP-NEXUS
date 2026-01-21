/**
 * Monitoring Module Exports
 * Centralized exports for error tracking, alerts, and health monitoring
 */

// Sentry Error Tracking
export {
  initSentry,
  captureError,
  captureMessage,
  setUserContext,
  clearUserContext,
  setTag,
  setTags,
  addBreadcrumb,
  startTransaction,
  withErrorTracking,
} from './sentry';

// Alert System
export {
  sendAlert,
  alertInfo,
  alertWarning,
  alertError,
  alertCritical,
  alertApiError,
  alertHealthIssue,
  alertSecurity,
  rateLimitedAlerts,
  type AlertSeverity,
} from './alerts';

// Re-export health from existing location
export {
  getHealthStatus,
  getLivenessStatus,
  getReadinessStatus,
} from '@/lib/health';
