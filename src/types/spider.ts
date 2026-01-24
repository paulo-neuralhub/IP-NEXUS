import type { Matter } from './matters';

// ===== WATCH TYPE =====
export type WatchType = 'text' | 'image' | 'combined';

// ===== WATCHLISTS =====
export type WatchlistType = 
  | 'trademark' 
  | 'patent' 
  | 'domain' 
  | 'web' 
  | 'social' 
  | 'marketplace';

export type NotifyFrequency = 'instant' | 'daily' | 'weekly';
export type RunFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly';

export interface Watchlist {
  id: string;
  organization_id: string;
  owner_type: 'tenant' | 'backoffice';
  name: string;
  description?: string;
  type: WatchlistType;
  // Text-based watch
  watch_terms: string[];
  watch_classes: number[];
  watch_jurisdictions: string[];
  matter_id?: string;
  similarity_threshold: number;
  filter_config?: Record<string, unknown>;
  // Image-based watch (L35)
  watch_type: WatchType;
  image_url?: string;
  image_embedding?: number[];
  color_palette?: string[];
  visual_threshold: number;
  // Notifications
  notify_email: boolean;
  notify_in_app: boolean;
  notify_frequency: NotifyFrequency;
  notify_users: string[];
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  run_frequency: RunFrequency;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  matter?: Matter;
  results_count?: number;
  unreviewed_count?: number;
}

// ===== WATCH RESULTS =====
export type WatchResultType = 
  | 'trademark_filing'
  | 'trademark_published'
  | 'patent_filing'
  | 'domain_registered'
  | 'web_mention'
  | 'social_mention'
  | 'marketplace_listing'
  | 'similar_logo'
  | 'renewal_due'
  | 'opposition_window';

export type WatchResultStatus = 'new' | 'reviewing' | 'threat' | 'dismissed' | 'actioned';
export type WatchResultPriority = 'low' | 'medium' | 'high' | 'critical';

export interface SimilarityDetails {
  phonetic_score?: number;
  visual_score?: number;
  conceptual_score?: number;
  matched_term?: string;
  analysis?: string;
}

export interface WatchResult {
  id: string;
  watchlist_id: string;
  organization_id: string;
  result_type: WatchResultType;
  title: string;
  description?: string;
  source?: string;
  source_url?: string;
  source_id?: string;
  applicant_name?: string;
  applicant_country?: string;
  filing_date?: string;
  publication_date?: string;
  classes?: number[];
  domain_name?: string;
  registrar?: string;
  registration_date?: string;
  expiry_date?: string;
  found_url?: string;
  found_text?: string;
  screenshot_url?: string;
  similarity_score?: number;
  similarity_type?: string;
  similarity_details?: SimilarityDetails;
  status: WatchResultStatus;
  priority: WatchResultPriority;
  action_taken?: string;
  action_date?: string;
  action_by?: string;
  action_notes?: string;
  related_matter_id?: string;
  related_deal_id?: string;
  opposition_deadline?: string;
  detected_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  raw_data?: Record<string, unknown>;
  // Relaciones
  watchlist?: Watchlist;
}

// ===== ALERTS =====
export type AlertType = 
  | 'new_conflict'
  | 'opposition_window'
  | 'deadline_approaching'
  | 'high_similarity'
  | 'renewal_due'
  | 'status_change'
  | 'web_mention'
  | 'domain_alert'
  | 'infringement';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'unread' | 'read' | 'actioned' | 'dismissed';

export interface SpiderAlert {
  id: string;
  organization_id: string;
  watchlist_id?: string;
  watch_result_id?: string;
  matter_id?: string;
  alert_type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  data?: Record<string, unknown>;
  action_url?: string;
  status: AlertStatus;
  notified_at?: string;
  notified_via?: string[];
  created_at: string;
  read_at?: string;
  read_by?: string;
  actioned_at?: string;
  actioned_by?: string;
}

// ===== DEADLINES =====
export type DeadlineType = 
  | 'opposition'
  | 'renewal'
  | 'response'
  | 'priority'
  | 'pct_entry'
  | 'annuity'
  | 'use_proof'
  | 'custom';

export type DeadlineStatus = 'pending' | 'completed' | 'missed' | 'cancelled';

export interface MonitoredDeadline {
  id: string;
  organization_id: string;
  matter_id?: string;
  watch_result_id?: string;
  deadline_type: DeadlineType;
  title: string;
  description?: string;
  deadline_date: string;
  reminder_days: number[];
  last_reminder_sent?: string;
  status: DeadlineStatus;
  completed_at?: string;
  completed_by?: string;
  assigned_to?: string;
  created_at: string;
}

// ===== SIMILARITY ANALYSIS =====
export type AnalysisMethod = 'ai' | 'algorithmic' | 'manual';

export interface SimilarityAnalysis {
  id: string;
  organization_id: string;
  term_a: string;
  term_b: string;
  image_a_url?: string;
  image_b_url?: string;
  overall_score: number;
  phonetic_score?: number;
  visual_score?: number;
  conceptual_score?: number;
  analysis_method: AnalysisMethod;
  analysis_details?: Record<string, unknown>;
  ai_explanation?: string;
  ai_recommendation?: string;
  created_by?: string;
  created_at: string;
}

// ===== GAZETTE SOURCES =====
export type GazetteSourceType = 'trademark' | 'patent' | 'design' | 'mixed';

export interface GazetteSource {
  id: string;
  name: string;
  code: string;
  country?: string;
  url?: string;
  source_type: GazetteSourceType;
  scrape_config?: Record<string, unknown>;
  last_scraped_at?: string;
  last_issue_date?: string;
  scrape_frequency: string;
  is_active: boolean;
  created_at: string;
}

// ===== FILTERS =====
export interface WatchResultFilters {
  watchlist_id?: string;
  status?: WatchResultStatus | WatchResultStatus[];
  priority?: WatchResultPriority | WatchResultPriority[];
  result_type?: WatchResultType | WatchResultType[];
  min_similarity?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface AlertFilters {
  status?: AlertStatus | AlertStatus[];
  severity?: AlertSeverity | AlertSeverity[];
  alert_type?: AlertType | AlertType[];
  watchlist_id?: string;
  matter_id?: string;
}

export interface DeadlineFilters {
  status?: DeadlineStatus | DeadlineStatus[];
  deadline_type?: DeadlineType | DeadlineType[];
  matter_id?: string;
  date_from?: string;
  date_to?: string;
  assigned_to?: string;
}
