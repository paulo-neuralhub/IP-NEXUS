// ===== TIPOS BACKOFFICE =====
// Generado desde PROMPT 8A

import type { User } from './index';

// ===== PLANES =====
export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  limits: PlanLimits;
  features: string[];
  is_popular: boolean;
  is_enterprise: boolean;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PlanLimits {
  max_users: number;
  max_matters: number;
  max_storage_gb: number;
  max_contacts: number;
  max_ai_messages_day: number;
  max_ai_docs_month: number;
  max_email_campaigns_month: number;
  max_watchlists: number;
  [key: string]: number;
}

// ===== SUSCRIPCIONES =====
export type SubscriptionStatus = 
  | 'trialing' | 'active' | 'past_due' 
  | 'canceled' | 'unpaid' | 'paused';

export interface Subscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  trial_start?: string | null;
  trial_end?: string | null;
  stripe_subscription_id?: string | null;
  stripe_customer_id?: string | null;
  cancel_at_period_end: boolean;
  canceled_at?: string | null;
  cancellation_reason?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at?: string;
  // Relaciones
  plan?: SubscriptionPlan;
  organization?: Organization;
}

export interface SubscriptionHistory {
  id: string;
  subscription_id: string;
  organization_id: string;
  event_type: SubscriptionEventType;
  previous_plan_id?: string | null;
  new_plan_id?: string | null;
  amount?: number | null;
  currency?: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export type SubscriptionEventType = 
  | 'created' | 'upgraded' | 'downgraded' | 'renewed'
  | 'canceled' | 'reactivated' | 'trial_started' | 'trial_ended'
  | 'payment_failed' | 'payment_succeeded';

// ===== FEATURE FLAGS =====
export interface FeatureFlag {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  is_enabled: boolean;
  rollout_percentage: number;
  enabled_for_plans: string[];
  enabled_for_orgs: string[];
  enabled_for_users: string[];
  metadata: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

// ===== CONFIGURACIÓN =====
export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  category: SettingCategory;
  description?: string | null;
  value_type: 'string' | 'number' | 'boolean' | 'json' | 'secret';
  is_required: boolean;
  is_public: boolean;
  updated_at?: string;
  updated_by?: string | null;
}

export type SettingCategory = 
  | 'general' | 'email' | 'integrations' 
  | 'security' | 'billing' | 'limits' | 'ui';

// ===== AUDIT LOGS =====
export interface AuditLog {
  id: string;
  user_id?: string | null;
  organization_id?: string | null;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  description?: string | null;
  changes?: Record<string, { old: any; new: any }>;
  metadata: Record<string, any>;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  // Relaciones
  user?: User;
}

// ===== INVITACIONES =====
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  role: string;
  token: string;
  status: InvitationStatus;
  expires_at: string;
  accepted_at?: string | null;
  invited_by: string;
  created_at: string;
  // Relaciones
  organization?: Organization;
  inviter?: User;
}

// ===== MÉTRICAS =====
export interface UsageMetrics {
  id: string;
  organization_id: string;
  period_start: string;
  period_end: string;
  metrics: UsageMetricsData;
  created_at?: string;
}

export interface UsageMetricsData {
  matters_created?: number;
  matters_total?: number;
  contacts_created?: number;
  contacts_total?: number;
  documents_uploaded?: number;
  storage_used_mb?: number;
  ai_messages?: number;
  ai_documents?: number;
  emails_sent?: number;
  api_calls?: number;
  active_users?: number;
  logins?: number;
  [key: string]: number | undefined;
}

// ===== ANUNCIOS =====
export type AnnouncementType = 'info' | 'warning' | 'success' | 'error';
export type TargetAudience = 'all' | 'admins' | 'specific_plans' | 'specific_orgs';

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  target_audience: TargetAudience;
  target_plans: string[];
  target_orgs: string[];
  starts_at: string;
  ends_at?: string | null;
  is_dismissible: boolean;
  show_on_dashboard: boolean;
  show_as_banner: boolean;
  is_active: boolean;
  created_by?: string | null;
  created_at?: string;
}

// ===== FEEDBACK =====
export type FeedbackType = 'bug' | 'feature' | 'improvement' | 'question' | 'other';
export type FeedbackStatus = 'new' | 'reviewing' | 'planned' | 'in_progress' | 'resolved' | 'closed';
export type FeedbackPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface UserFeedback {
  id: string;
  user_id?: string | null;
  organization_id?: string | null;
  type: FeedbackType;
  subject: string;
  message: string;
  page_url?: string | null;
  screenshot_url?: string | null;
  metadata: Record<string, any>;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  admin_notes?: string | null;
  resolved_at?: string | null;
  resolved_by?: string | null;
  created_at: string;
  // Relaciones
  user?: User;
}

// ===== SUPERADMIN =====
export interface Superadmin {
  id: string;
  user_id: string;
  permissions: string[];
  is_active: boolean;
  created_at: string;
  created_by?: string | null;
  // Relaciones
  user?: User;
}

// ===== ADMIN DASHBOARD =====
export interface AdminStats {
  total_organizations: number;
  total_users: number;
  total_matters: number;
  active_subscriptions: number;
  mrr: number;  // Monthly Recurring Revenue
  arr: number;  // Annual Recurring Revenue
  trial_conversions: number;
  churn_rate: number;
}

export interface AdminFilters {
  status?: string;
  plan?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// ===== ORGANIZATION (redefinido para contexto de backoffice) =====
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  website?: string | null;
  settings?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  // Relaciones para backoffice
  subscription?: Subscription;
  members_count?: number;
  matters_count?: number;
}

// ===== FILTROS =====
export interface OrganizationFilters {
  search?: string;
  plan?: string;
  status?: SubscriptionStatus;
  created_from?: string;
  created_to?: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  organization_id?: string;
  is_active?: boolean;
}

export interface AuditLogFilters {
  user_id?: string;
  organization_id?: string;
  action?: string;
  resource_type?: string;
  date_from?: string;
  date_to?: string;
}
