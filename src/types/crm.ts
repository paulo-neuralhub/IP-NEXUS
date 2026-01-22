// ===== CONTACTS =====
export type ContactType = 'person' | 'company';

export type LifecycleStage = 
  | 'subscriber' 
  | 'lead' 
  | 'mql' 
  | 'sql' 
  | 'opportunity' 
  | 'customer' 
  | 'evangelist' 
  | 'other';

export interface Contact {
  id: string;
  organization_id: string;
  owner_type: 'tenant' | 'backoffice';
  type: ContactType;
  name: string;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  company_name?: string | null;
  job_title?: string | null;
  department?: string | null;
  tax_id?: string | null;
  website?: string | null;
  industry?: string | null;
  employee_count?: string | null;
  annual_revenue?: number | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  source?: string | null;
  source_detail?: string | null;
  assigned_to?: string | null;
  lifecycle_stage: LifecycleStage;
  tags?: string[] | null;
  custom_fields?: Record<string, unknown> | null;
  avatar_url?: string | null;
  notes?: string | null;
  last_contacted_at?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

// ===== PIPELINES =====
export type PipelineType = 'sales' | 'registration' | 'opposition' | 'renewal' | 'support' | 'custom';

export interface Pipeline {
  id: string;
  organization_id: string;
  owner_type: 'tenant' | 'backoffice';
  name: string;
  description?: string | null;
  pipeline_type: PipelineType;
  is_default: boolean;
  is_active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
  stages?: PipelineStage[];
}

export interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  color: string;
  position: number;
  is_won_stage: boolean;
  is_lost_stage: boolean;
  probability: number;
  required_fields?: string[] | null;
  auto_actions?: unknown[] | null;
  created_at: string;
}

// ===== DEALS =====
export type DealStatus = 'open' | 'won' | 'lost';
export type DealPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Deal {
  id: string;
  organization_id: string;
  owner_type: 'tenant' | 'backoffice';
  pipeline_id: string;
  stage_id: string;
  title: string;
  description?: string | null;
  value?: number | null;
  currency: string;
  contact_id?: string | null;
  company_id?: string | null;
  matter_id?: string | null;
  assigned_to?: string | null;
  expected_close_date?: string | null;
  actual_close_date?: string | null;
  status: DealStatus;
  lost_reason?: string | null;
  won_reason?: string | null;
  tags?: string[] | null;
  custom_fields?: Record<string, unknown> | null;
  priority: DealPriority;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  closed_at?: string | null;
  // Relaciones cargadas
  contact?: Contact;
  stage?: PipelineStage;
}

// ===== ACTIVITIES =====
export type ActivityType = 
  | 'email' 
  | 'call' 
  | 'whatsapp' 
  | 'meeting' 
  | 'note' 
  | 'task' 
  | 'stage_change' 
  | 'document' 
  | 'deal_created'
  | 'deal_won'
  | 'deal_lost'
  | 'contact_created'
  | 'other';

export interface Activity {
  id: string;
  organization_id: string;
  owner_type: 'tenant' | 'backoffice';
  type: ActivityType;
  contact_id?: string | null;
  deal_id?: string | null;
  matter_id?: string | null;
  subject?: string | null;
  content?: string | null;
  metadata?: Record<string, unknown> | null;
  direction?: 'inbound' | 'outbound' | null;
  email_from?: string | null;
  email_to?: string[] | null;
  email_cc?: string[] | null;
  email_message_id?: string | null;
  call_duration?: number | null;
  call_outcome?: string | null;
  call_recording_url?: string | null;
  meeting_start?: string | null;
  meeting_end?: string | null;
  meeting_location?: string | null;
  meeting_attendees?: string[] | null;
  due_date?: string | null;
  completed_at?: string | null;
  is_completed?: boolean | null;
  created_by?: string | null;
  created_at: string;
}

// ===== FILTERS =====
export interface ContactFilters {
  search?: string;
  type?: ContactType;
  lifecycle_stage?: LifecycleStage | LifecycleStage[];
  assigned_to?: string;
  tags?: string[];
  source?: string;
}

export interface DealFilters {
  search?: string;
  pipeline_id?: string;
  stage_id?: string;
  status?: DealStatus;
  assigned_to?: string;
  contact_id?: string;
  priority?: DealPriority;
}

// ============================================================
// CRM V2 (Backoffice-style) Types - used by new hooks (use-crm-v2)
// Kept separate from the existing tenant CRM types.
// ============================================================

export interface CRMAccount {
  id: string;
  organization_id: string;
  name: string;
  legal_name?: string | null;
  status: string;
  tier: string;
  health_score?: number | null;
  churn_risk_level?: string | null;
  account_manager_id?: string | null;
  tags?: string[];
  last_interaction_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type CRMAccountInsert = Omit<CRMAccount, "id" | "created_at" | "updated_at">;
export type CRMAccountUpdate = Partial<Omit<CRMAccount, "id" | "organization_id" | "created_at" | "updated_at">>;

export interface CRMContact {
  id: string;
  organization_id: string;
  account_id?: string | null;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  photo_url?: string | null;
  is_lead: boolean;
  lead_score: number;
  lead_status: string;
  whatsapp_enabled: boolean;
  portal_access_enabled: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export type CRMContactInsert = Omit<CRMContact, "id" | "created_at" | "updated_at">;
export type CRMContactUpdate = Partial<Omit<CRMContact, "id" | "organization_id" | "created_at" | "updated_at">>;

export interface CRMDeal {
  id: string;
  organization_id: string;
  account_id?: string | null;
  contact_id?: string | null;
  owner_id?: string | null;
  name: string;
  stage: string;
  opportunity_type?: string | null;
  amount?: number | null;
  weighted_amount?: number | null;
  expected_close_date?: string | null;
  actual_close_date?: string | null;
  stage_entered_at?: string | null;
  stage_history?: unknown[];
  close_reason?: string | null;
  lost_to_competitor?: string | null;
  created_at: string;
  updated_at: string;
}

export type CRMDealInsert = Omit<CRMDeal, "id" | "created_at" | "updated_at">;
export type CRMDealUpdate = Partial<Omit<CRMDeal, "id" | "organization_id" | "created_at" | "updated_at">>;

export interface CRMInteraction {
  id: string;
  organization_id: string;
  account_id?: string | null;
  contact_id?: string | null;
  assigned_to?: string | null;
  channel: string;
  direction?: string | null;
  status?: string | null;
  subject?: string | null;
  content?: string | null;
  ai_suggested_response?: string | null;
  created_at: string;
}

export type CRMInteractionInsert = Omit<CRMInteraction, "id" | "created_at">;

export interface CRMTask {
  id: string;
  organization_id: string;
  account_id?: string | null;
  contact_id?: string | null;
  assigned_to?: string | null;
  title: string;
  description?: string | null;
  status: string;
  due_date?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type CRMTaskInsert = Omit<CRMTask, "id" | "created_at" | "updated_at">;
export type CRMTaskUpdate = Partial<Omit<CRMTask, "id" | "organization_id" | "created_at" | "updated_at">>;

export interface CRMAIRecommendation {
  id: string;
  organization_id: string;
  account_id?: string | null;
  contact_id?: string | null;
  deal_id?: string | null;
  type: string;
  title: string;
  description?: string | null;
  priority?: string | null;
  urgency?: number | null;
  status?: string | null;
  action_taken?: string | null;
  outcome?: string | null;
  created_at: string;
}

export interface Client360Data {
  account: unknown;
  contacts: unknown[];
  deals: unknown[];
  interactions: unknown[];
}

export interface PipelineSummary {
  total: number;
  total_amount: number;
  total_weighted_amount: number;
  by_stage: Array<{ stage: string; count: number; amount: number; weighted_amount: number }>;
}

export interface InteractionFilters {
  account_id?: string;
  contact_id?: string;
  channel?: string[];
  direction?: string[];
  status?: string[];
  assigned_to?: string;
  date_from?: string;
  date_to?: string;
  has_ai_draft?: boolean;
}

export interface AccountFilters {
  status?: string[];
  tier?: string[];
  health_score_min?: number;
  health_score_max?: number;
  churn_risk_level?: string[];
  account_manager_id?: string;
  tags?: string[];
  search?: string;
}

export interface ContactFiltersV2 {
  account_id?: string;
  is_lead?: boolean;
  lead_status?: string[];
  lead_score_min?: number;
  lead_score_max?: number;
  whatsapp_enabled?: boolean;
  portal_access_enabled?: boolean;
  search?: string;
}

export interface DealFiltersV2 {
  stage?: string[];
  owner_id?: string;
  account_id?: string;
  opportunity_type?: string[];
  amount_min?: number;
  amount_max?: number;
  expected_close_from?: string;
  expected_close_to?: string;
  search?: string;
}

export interface AIDraftFeedback {
  interaction_id?: string;
  learning_type: string;
  original_input: Record<string, unknown>;
  ai_draft: string;
  human_action?: string;
  final_sent_text?: string;
  edit_reason?: string;
}

export interface CRMDashboardKPIs {
  total_accounts: number;
  active_accounts: number;
  at_risk_accounts: number;
  avg_health_score: number;
  total_contacts: number;
  total_leads: number;
  hot_leads: number;
  lead_conversion_rate: number;
  total_pipeline_value: number;
  weighted_pipeline_value: number;
  deals_closing_this_month: number;
  avg_deal_cycle_days: number;
  win_rate: number;
  interactions_today: number;
  interactions_this_week: number;
  avg_response_time_hours: number;
  pending_tasks: number;
  ai_drafts_accepted_rate: number;
  nba_completion_rate: number;
}

