/**
 * Alert System for Slack/Discord/Webhook notifications
 * Used for critical system alerts and monitoring
 */

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

interface AlertPayload {
  title: string;
  message: string;
  severity: AlertSeverity;
  context?: Record<string, unknown>;
  timestamp?: string;
}

const SEVERITY_CONFIG = {
  info: { emoji: 'ℹ️', color: '#3b82f6' },
  warning: { emoji: '⚠️', color: '#f59e0b' },
  error: { emoji: '❌', color: '#ef4444' },
  critical: { emoji: '🚨', color: '#dc2626' },
} as const;

/**
 * Send an alert to configured webhook (Slack/Discord/custom)
 */
export async function sendAlert(alert: AlertPayload): Promise<boolean> {
  const webhookUrl = import.meta.env.VITE_ALERT_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('[Alerts] Webhook URL not configured');
    return false;
  }

  const { emoji, color } = SEVERITY_CONFIG[alert.severity];
  const timestamp = alert.timestamp || new Date().toISOString();

  // Slack Block Kit format (also works with Discord via webhook)
  const payload = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} ${alert.title}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: alert.message,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `*Severity:* ${alert.severity.toUpperCase()} | *Time:* ${timestamp}`,
          },
        ],
      },
    ],
    attachments: [
      {
        color,
        fields: alert.context
          ? Object.entries(alert.context).map(([key, value]) => ({
              title: key,
              value: String(value),
              short: true,
            }))
          : [],
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('[Alerts] Failed to send alert:', response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Alerts] Error sending alert:', error);
    return false;
  }
}

/**
 * Send info level alert
 */
export function alertInfo(
  title: string,
  message: string,
  context?: Record<string, unknown>
): Promise<boolean> {
  return sendAlert({ title, message, severity: 'info', context });
}

/**
 * Send warning level alert
 */
export function alertWarning(
  title: string,
  message: string,
  context?: Record<string, unknown>
): Promise<boolean> {
  return sendAlert({ title, message, severity: 'warning', context });
}

/**
 * Send error level alert
 */
export function alertError(
  title: string,
  message: string,
  context?: Record<string, unknown>
): Promise<boolean> {
  return sendAlert({ title, message, severity: 'error', context });
}

/**
 * Send critical level alert
 */
export function alertCritical(
  title: string,
  message: string,
  context?: Record<string, unknown>
): Promise<boolean> {
  return sendAlert({ title, message, severity: 'critical', context });
}

/**
 * Alert for API errors
 */
export function alertApiError(
  endpoint: string,
  statusCode: number,
  errorMessage: string,
  userId?: string
): Promise<boolean> {
  return alertError('API Error', `Endpoint: \`${endpoint}\`\nStatus: ${statusCode}`, {
    endpoint,
    status_code: statusCode,
    error: errorMessage.substring(0, 200),
    user_id: userId || 'anonymous',
  });
}

/**
 * Alert for system health issues
 */
export function alertHealthIssue(
  component: string,
  status: 'degraded' | 'down',
  details?: string
): Promise<boolean> {
  const severity = status === 'down' ? 'critical' : 'warning';
  return sendAlert({
    title: `Health Issue: ${component}`,
    message: `Component \`${component}\` is ${status.toUpperCase()}${details ? `\n${details}` : ''}`,
    severity,
    context: { component, status },
  });
}

/**
 * Alert for security events
 */
export function alertSecurity(
  event: string,
  details: Record<string, unknown>
): Promise<boolean> {
  return alertCritical(`Security Alert: ${event}`, `A security event was detected`, details);
}

/**
 * Rate-limited alert sender to prevent alert storms
 */
class RateLimitedAlerts {
  private lastAlertTimes: Map<string, number> = new Map();
  private cooldownMs: number;

  constructor(cooldownMs = 60000) {
    this.cooldownMs = cooldownMs;
  }

  async send(key: string, alert: AlertPayload): Promise<boolean> {
    const now = Date.now();
    const lastTime = this.lastAlertTimes.get(key) || 0;

    if (now - lastTime < this.cooldownMs) {
      console.debug(`[Alerts] Rate limited: ${key}`);
      return false;
    }

    this.lastAlertTimes.set(key, now);
    return sendAlert(alert);
  }
}

export const rateLimitedAlerts = new RateLimitedAlerts();
