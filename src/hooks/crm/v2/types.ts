// ============================================================
// IP-NEXUS CRM V2 - Shared types for hooks
// ============================================================

export type UUID = string;

export interface AccountFilters {
  status?: string[];
  tier?: string[];
  health_score_min?: number;
  health_score_max?: number;
  churn_risk_level?: string[];
  account_manager_id?: UUID;
  tags?: string[];
  search?: string;
}

export interface ContactFilters {
  account_id?: UUID;
  is_lead?: boolean;
  lead_status?: string[];
  lead_score_min?: number;
  lead_score_max?: number;
  whatsapp_enabled?: boolean;
  portal_access_enabled?: boolean;
  search?: string;
}

export interface DealFilters {
  stage?: string[];
  owner_id?: UUID;
  account_id?: UUID;
  opportunity_type?: string[];
  amount_min?: number;
  amount_max?: number;
  expected_close_from?: string;
  expected_close_to?: string;
  search?: string;
}

export interface InteractionFilters {
  account_id?: UUID;
  contact_id?: UUID;
  channel?: string[];
  direction?: string[];
  status?: string[];
  assigned_to?: UUID;
  date_from?: string;
  date_to?: string;
  has_ai_draft?: boolean;
}

export interface PipelineSummary {
  total: number;
  total_amount: number;
  total_weighted_amount: number;
  by_stage: Array<{
    stage: string;
    count: number;
    amount: number;
    weighted_amount: number;
  }>;
}

export interface Client360Data {
  account: unknown;
  contacts: unknown[];
  deals: unknown[];
  interactions: unknown[];
}

export interface AIDraftFeedback {
  interaction_id?: UUID;
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
