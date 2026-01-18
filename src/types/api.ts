export type ApiScope = 
  | 'read' | 'write' | 'delete' | 'admin'
  | 'matters:read' | 'matters:write'
  | 'contacts:read' | 'contacts:write'
  | 'deadlines:read' | 'deadlines:write'
  | 'documents:read' | 'documents:write'
  | 'invoices:read' | 'invoices:write';

export interface ApiKey {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  key_prefix: string;
  scopes: ApiScope[];
  allowed_ips: string[];
  allowed_origins: string[];
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
  is_active: boolean;
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
  created_by?: string;
}

export interface ApiKeyWithSecret extends ApiKey {
  key: string;  // Solo disponible al crear
}

export interface ApiLog {
  id: string;
  organization_id?: string;
  api_key_id?: string;
  method: string;
  endpoint: string;
  query_params?: Record<string, any>;
  request_body?: Record<string, any>;
  status_code: number;
  response_time_ms?: number;
  response_size_bytes?: number;
  ip_address?: string;
  user_agent?: string;
  error_message?: string;
  created_at: string;
}

export type WebhookEvent = 
  | 'matter.created' | 'matter.updated' | 'matter.deleted'
  | 'deadline.created' | 'deadline.completed' | 'deadline.overdue'
  | 'contact.created' | 'contact.updated'
  | 'invoice.created' | 'invoice.paid'
  | 'document.uploaded'
  | 'renewal.due' | 'renewal.completed'
  | 'watch_alert.created';

export interface Webhook {
  id: string;
  organization_id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  headers: Record<string, string>;
  is_active: boolean;
  max_retries: number;
  retry_delay_seconds: number;
  total_deliveries: number;
  successful_deliveries: number;
  failed_deliveries: number;
  last_delivery_at?: string;
  last_error?: string;
  created_at: string;
  updated_at: string;
}

export type WebhookDeliveryStatus = 'pending' | 'delivered' | 'failed' | 'retrying';

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: Record<string, any>;
  status: WebhookDeliveryStatus;
  response_status?: number;
  response_body?: string;
  response_time_ms?: number;
  attempt_count: number;
  next_retry_at?: string;
  error_message?: string;
  created_at: string;
  delivered_at?: string;
}

export interface WebhookPayload {
  id: string;
  event: WebhookEvent;
  created_at: string;
  data: Record<string, any>;
  organization_id: string;
}

export interface ApiRateLimit {
  id: string;
  api_key_id: string;
  window_start: string;
  window_type: 'minute' | 'day';
  request_count: number;
}
