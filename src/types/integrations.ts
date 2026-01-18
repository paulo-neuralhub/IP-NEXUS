// ===== PAGOS =====
export type PaymentStatus = 
  | 'pending' | 'processing' | 'succeeded' 
  | 'failed' | 'refunded' | 'canceled';

export interface Payment {
  id: string;
  organization_id: string;
  subscription_id?: string;
  stripe_payment_intent_id?: string;
  stripe_invoice_id?: string;
  stripe_charge_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description?: string;
  internal_invoice_id?: string;
  metadata: Record<string, any>;
  failure_message?: string;
  paid_at?: string;
  created_at: string;
}

// ===== EMAILS =====
export type EmailStatus = 
  | 'pending' | 'sent' | 'delivered' 
  | 'opened' | 'clicked' | 'bounced' 
  | 'complained' | 'failed';

export type EmailProvider = 'resend' | 'sendgrid' | 'smtp';

export interface SentEmail {
  id: string;
  organization_id?: string;
  to_email: string;
  to_name?: string;
  subject: string;
  template_id?: string;
  template_data: Record<string, any>;
  provider: EmailProvider;
  provider_id?: string;
  status: EmailStatus;
  opened_at?: string;
  clicked_at?: string;
  error_message?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface SystemEmailTemplate {
  id: string;
  organization_id?: string;
  code: string;
  name: string;
  description?: string;
  subject: string;
  body_html: string;
  body_text?: string;
  variables: TemplateVariable[];
  category: 'transactional' | 'marketing' | 'notification' | 'reminder';
  is_active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateVariable {
  name: string;
  description: string;
  default?: string;
}

// ===== WEBHOOKS =====
export type WebhookStatus = 'pending' | 'processed' | 'failed' | 'ignored';

export interface WebhookEvent {
  id: string;
  source: string;
  event_type: string;
  event_id?: string;
  payload: Record<string, any>;
  status: WebhookStatus;
  processed_at?: string;
  error_message?: string;
  retry_count: number;
  created_at: string;
}

// ===== API CONNECTIONS =====
export interface ApiConnection {
  id: string;
  organization_id: string;
  provider: string;
  credentials: Record<string, any>;
  is_active: boolean;
  last_sync_at?: string;
  last_error?: string;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ===== STRIPE =====
export interface StripeCheckoutSession {
  url: string;
  session_id: string;
}

export interface StripePortalSession {
  url: string;
}

export interface StripeCheckoutRequest {
  plan_id: string;
  billing_cycle: 'monthly' | 'yearly';
  success_url?: string;
  cancel_url?: string;
}

// ===== EMAIL SENDING =====
export interface SendEmailRequest {
  to: string | string[];
  subject?: string;
  template_code?: string;
  template_data?: Record<string, any>;
  html?: string;
  text?: string;
  from_name?: string;
  reply_to?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string;  // Base64
  content_type: string;
}

export interface SendEmailResponse {
  success: boolean;
  message_id?: string;
  error?: string;
}

// ===== CONSTANTS =====
export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Procesando', color: 'bg-blue-100 text-blue-800' },
  succeeded: { label: 'Completado', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Fallido', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Reembolsado', color: 'bg-purple-100 text-purple-800' },
  canceled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800' },
};

export const EMAIL_STATUS_CONFIG: Record<EmailStatus, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  sent: { label: 'Enviado', color: 'bg-blue-100 text-blue-800' },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800' },
  opened: { label: 'Abierto', color: 'bg-teal-100 text-teal-800' },
  clicked: { label: 'Clic', color: 'bg-indigo-100 text-indigo-800' },
  bounced: { label: 'Rebotado', color: 'bg-orange-100 text-orange-800' },
  complained: { label: 'Spam', color: 'bg-red-100 text-red-800' },
  failed: { label: 'Fallido', color: 'bg-red-100 text-red-800' },
};

export const WEBHOOK_STATUS_CONFIG: Record<WebhookStatus, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  processed: { label: 'Procesado', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Fallido', color: 'bg-red-100 text-red-800' },
  ignored: { label: 'Ignorado', color: 'bg-gray-100 text-gray-800' },
};

export const API_PROVIDERS = [
  { code: 'euipo', name: 'EUIPO', description: 'Oficina de Propiedad Intelectual de la UE' },
  { code: 'oepm', name: 'OEPM', description: 'Oficina Española de Patentes y Marcas' },
  { code: 'wipo', name: 'WIPO', description: 'Organización Mundial de la Propiedad Intelectual' },
  { code: 'tmview', name: 'TMView', description: 'Base de datos de marcas global' },
  { code: 'uspto', name: 'USPTO', description: 'Oficina de Patentes de EE.UU.' },
] as const;
