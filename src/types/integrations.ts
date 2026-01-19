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

// ===== INTEGRATION PROVIDERS (para Hub de Integraciones) =====
export type IntegrationCategory = 
  | 'billing' | 'email' | 'ip_office' | 'ai' 
  | 'calendar' | 'storage' | 'communication';

export interface IntegrationProvider {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  website?: string;
  docsUrl?: string;
  icon?: string;
  fields: IntegrationField[];
  isOAuth?: boolean;
  isSystem?: boolean;
}

export interface IntegrationField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url';
  required?: boolean;
  placeholder?: string;
}

export interface IntegrationConnection {
  id: string;
  organization_id: string;
  provider: string;
  credentials: Record<string, any>;
  config: Record<string, any>;
  is_active: boolean;
  last_sync_at?: string;
  last_error?: string;
  created_at: string;
  updated_at: string;
}

export const INTEGRATION_PROVIDERS: Record<string, IntegrationProvider> = {
  // Pagos
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    category: 'billing',
    description: 'Pagos y suscripciones',
    website: 'https://stripe.com',
    docsUrl: 'https://stripe.com/docs',
    fields: [],
    isSystem: true,
  },
  
  // Email
  resend: {
    id: 'resend',
    name: 'Resend',
    category: 'email',
    description: 'Emails transaccionales',
    website: 'https://resend.com',
    docsUrl: 'https://resend.com/docs',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true },
    ],
  },
  sendgrid: {
    id: 'sendgrid',
    name: 'SendGrid',
    category: 'email',
    description: 'Email marketing y transaccional',
    website: 'https://sendgrid.com',
    docsUrl: 'https://docs.sendgrid.com',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true },
    ],
  },
  
  // Oficinas PI
  euipo: {
    id: 'euipo',
    name: 'EUIPO',
    category: 'ip_office',
    description: 'Oficina de PI de la UE',
    website: 'https://euipo.europa.eu',
    docsUrl: 'https://euipo.europa.eu/ohimportal/en/web-services',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true },
    ],
  },
  tmview: {
    id: 'tmview',
    name: 'TMView',
    category: 'ip_office',
    description: 'Base de datos mundial de marcas',
    website: 'https://www.tmdn.org/tmview',
    fields: [
      { key: 'username', label: 'Usuario', type: 'text', required: true },
      { key: 'password', label: 'Contraseña', type: 'password', required: true },
    ],
  },
  wipo: {
    id: 'wipo',
    name: 'WIPO',
    category: 'ip_office',
    description: 'Sistema Madrid y PCT',
    website: 'https://www.wipo.int',
    docsUrl: 'https://www.wipo.int/webservices/',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true },
    ],
  },
  oepm: {
    id: 'oepm',
    name: 'OEPM',
    category: 'ip_office',
    description: 'Oficina Española de Patentes y Marcas',
    website: 'https://www.oepm.es',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true },
    ],
  },
  uspto: {
    id: 'uspto',
    name: 'USPTO',
    category: 'ip_office',
    description: 'Oficina de Patentes de EE.UU.',
    website: 'https://www.uspto.gov',
    docsUrl: 'https://developer.uspto.gov/',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true },
    ],
  },
  
  // IA
  openai: {
    id: 'openai',
    name: 'OpenAI',
    category: 'ai',
    description: 'GPT y procesamiento de lenguaje',
    website: 'https://openai.com',
    docsUrl: 'https://platform.openai.com/docs',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true },
    ],
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    category: 'ai',
    description: 'Claude AI',
    website: 'https://anthropic.com',
    docsUrl: 'https://docs.anthropic.com',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true },
    ],
  },
  
  // Calendario
  google_calendar: {
    id: 'google_calendar',
    name: 'Google Calendar',
    category: 'calendar',
    description: 'Sincronización de calendario',
    website: 'https://calendar.google.com',
    fields: [],
    isOAuth: true,
  },
  microsoft_outlook: {
    id: 'microsoft_outlook',
    name: 'Microsoft Outlook',
    category: 'calendar',
    description: 'Calendario y email de Microsoft',
    website: 'https://outlook.com',
    fields: [],
    isOAuth: true,
  },
};

export const INTEGRATION_CATEGORIES: Record<IntegrationCategory, { name: string; description: string }> = {
  billing: { name: 'Pagos', description: 'Procesamiento de pagos y suscripciones' },
  email: { name: 'Email', description: 'Envío de correos transaccionales y marketing' },
  ip_office: { name: 'Oficinas de PI', description: 'Conexiones con oficinas de propiedad intelectual' },
  ai: { name: 'Inteligencia Artificial', description: 'Proveedores de IA y procesamiento de lenguaje' },
  calendar: { name: 'Calendario', description: 'Sincronización de calendarios' },
  storage: { name: 'Almacenamiento', description: 'Servicios de almacenamiento en la nube' },
  communication: { name: 'Comunicación', description: 'WhatsApp, Slack, etc.' },
};
