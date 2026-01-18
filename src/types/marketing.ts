// ===== TEMPLATES =====
export type TemplateCategory = 
  | 'general' 
  | 'welcome' 
  | 'newsletter' 
  | 'promotion' 
  | 'reminder' 
  | 'notification' 
  | 'renewal' 
  | 'invoice' 
  | 'custom';

export interface EmailTemplate {
  id: string;
  organization_id: string;
  owner_type: 'tenant' | 'backoffice';
  name: string;
  description?: string;
  category: TemplateCategory;
  subject: string;
  preview_text?: string;
  html_content: string;
  json_content?: EmailEditorContent;
  plain_text?: string;
  is_system: boolean;
  is_active: boolean;
  thumbnail_url?: string;
  available_variables?: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Estructura del editor de email (bloques)
export interface EmailEditorContent {
  blocks: EmailBlock[];
  settings: EmailSettings;
}

export interface EmailSettings {
  backgroundColor: string;
  contentWidth: number;
  fontFamily: string;
  linkColor: string;
}

export type EmailBlockType = 
  | 'header' 
  | 'text' 
  | 'image' 
  | 'button' 
  | 'divider' 
  | 'spacer' 
  | 'columns' 
  | 'social' 
  | 'footer'
  | 'html';

export interface EmailBlock {
  id: string;
  type: EmailBlockType;
  content: Record<string, unknown>;
  styles?: Record<string, string>;
}

// ===== CONTACT LISTS =====
export type ListType = 'static' | 'dynamic';

export interface ContactList {
  id: string;
  organization_id: string;
  owner_type: 'tenant' | 'backoffice';
  name: string;
  description?: string;
  type: ListType;
  filter_conditions?: FilterCondition[];
  contact_count: number;
  last_count_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactListMember {
  id: string;
  list_id: string;
  contact_id: string;
  added_at: string;
  added_by?: string;
}

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export type FilterOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'is_set'
  | 'is_not_set'
  | 'older_than'
  | 'newer_than';

// ===== CAMPAIGNS =====
export type CampaignType = 'regular' | 'automated' | 'ab_test' | 'rss' | 'transactional';
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled' | 'failed';

export interface EmailCampaign {
  id: string;
  organization_id: string;
  owner_type: 'tenant' | 'backoffice';
  name: string;
  description?: string;
  campaign_type: CampaignType;
  template_id?: string;
  subject: string;
  preview_text?: string;
  from_name: string;
  from_email: string;
  reply_to?: string;
  html_content?: string;
  json_content?: EmailEditorContent;
  list_ids: string[];
  segment_conditions?: FilterCondition[];
  exclude_list_ids: string[];
  status: CampaignStatus;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  is_ab_test: boolean;
  ab_test_config?: ABTestConfig;
  total_recipients: number;
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_unsubscribed: number;
  total_complained: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ABTestConfig {
  type: 'subject' | 'content' | 'from_name' | 'send_time';
  variants: ABVariant[];
  winner_criteria: 'open_rate' | 'click_rate';
  test_duration_hours: number;
  winner_id?: string;
}

export interface ABVariant {
  id: string;
  subject?: string;
  content?: EmailEditorContent;
  from_name?: string;
  percentage: number;
}

// ===== EMAIL SENDS =====
export type SendStatus = 
  | 'pending' 
  | 'sent' 
  | 'delivered' 
  | 'opened' 
  | 'clicked' 
  | 'bounced' 
  | 'unsubscribed' 
  | 'complained' 
  | 'failed';

export interface EmailSend {
  id: string;
  campaign_id: string;
  contact_id: string;
  status: SendStatus;
  ab_variant?: string;
  sent_at?: string;
  delivered_at?: string;
  first_opened_at?: string;
  last_opened_at?: string;
  open_count: number;
  first_clicked_at?: string;
  click_count: number;
  bounce_type?: 'hard' | 'soft';
  bounce_reason?: string;
  email_provider_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface EmailClick {
  id: string;
  send_id: string;
  campaign_id: string;
  contact_id: string;
  url: string;
  clicked_at: string;
  user_agent?: string;
  ip_address?: string;
  device_type?: string;
  browser?: string;
  os?: string;
}

// ===== AUTOMATIONS =====
export type AutomationTrigger = 
  | 'contact_created'
  | 'contact_updated'
  | 'tag_added'
  | 'tag_removed'
  | 'list_joined'
  | 'list_left'
  | 'deal_created'
  | 'deal_stage_changed'
  | 'deal_won'
  | 'deal_lost'
  | 'matter_created'
  | 'matter_expiring'
  | 'form_submitted'
  | 'email_opened'
  | 'email_clicked'
  | 'date_based'
  | 'manual'
  | 'api';

export type AutomationStatus = 'draft' | 'active' | 'paused' | 'archived';

export interface Automation {
  id: string;
  organization_id: string;
  owner_type: 'tenant' | 'backoffice';
  name: string;
  description?: string;
  trigger_type: AutomationTrigger;
  trigger_config: Record<string, unknown>;
  filter_conditions: FilterCondition[];
  actions: AutomationAction[];
  status: AutomationStatus;
  total_enrolled: number;
  total_completed: number;
  total_exited: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export type AutomationActionType = 
  | 'send_email'
  | 'wait'
  | 'condition'
  | 'add_tag'
  | 'remove_tag'
  | 'add_to_list'
  | 'remove_from_list'
  | 'update_contact'
  | 'create_task'
  | 'notify_team'
  | 'webhook';

export interface AutomationAction {
  id: string;
  type: AutomationActionType;
  config: Record<string, unknown>;
}

export type EnrollmentStatus = 'active' | 'completed' | 'exited' | 'failed';

export interface AutomationEnrollment {
  id: string;
  automation_id: string;
  contact_id: string;
  status: EnrollmentStatus;
  current_action_id?: string;
  enrolled_at: string;
  completed_at?: string;
  exited_at?: string;
  exit_reason?: string;
  action_history: ActionHistoryEntry[];
  next_action_at?: string;
  metadata?: Record<string, unknown>;
}

export interface ActionHistoryEntry {
  action_id: string;
  executed_at: string;
  result: 'success' | 'failed' | 'skipped';
  email_send_id?: string;
  error?: string;
}

// ===== UNSUBSCRIBES =====
export type UnsubscribeSource = 'link' | 'manual' | 'complaint' | 'bounce' | 'api';

export interface EmailUnsubscribe {
  id: string;
  organization_id: string;
  contact_id?: string;
  email: string;
  reason?: string;
  feedback?: string;
  campaign_id?: string;
  source: UnsubscribeSource;
  unsubscribed_at: string;
}

// ===== ANALYTICS =====
export interface CampaignAnalytics {
  campaign: EmailCampaign;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
  unsubscribe_rate: number;
  delivery_rate: number;
  clicks_by_link: { url: string; clicks: number }[];
  opens_by_hour: { hour: number; opens: number }[];
  opens_by_device: { device: string; opens: number }[];
}
