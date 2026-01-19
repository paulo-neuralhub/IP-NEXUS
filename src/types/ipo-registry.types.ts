// src/types/ipo-registry.types.ts
// IPO Master Registry - Gestión Global de Oficinas de PI

export type OfficeTier = 1 | 2 | 3;
export type OfficeType = 'national' | 'regional' | 'international';
export type IPType = 'trademark' | 'patent' | 'design' | 'copyright';
export type ConnectionMethodType = 'api' | 'scraper' | 'bulk_ftp' | 'bulk_http' | 'manual';
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
export type AuthType = 'none' | 'api_key' | 'oauth2' | 'basic' | 'mtls' | 'custom';
export type OfficeStatus = 'active' | 'inactive' | 'maintenance' | 'deprecated';
export type SyncType = 'delta' | 'full' | 'targeted' | 'manual';
export type SyncStatus = 'running' | 'success' | 'partial' | 'failed';

export interface IPOffice {
  id: string;
  code: string;
  code_alt?: string;
  name_official: string;
  name_short?: string;
  
  country_code?: string;
  region?: string;
  office_type: OfficeType;
  ip_types: IPType[];
  
  timezone: string;
  languages: string[];
  currency: string;
  
  address?: string;
  website_official?: string;
  website_search?: string;
  email_general?: string;
  phone_general?: string;
  
  tier: OfficeTier;
  priority_score: number;
  status: OfficeStatus;
  
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  contacts?: OfficeContact[];
  connection_methods?: ConnectionMethod[];
  field_mappings?: FieldMapping[];
  knowledge_base?: KnowledgeBaseEntry[];
  fees?: OfficialFee[];
  deadline_rules?: DeadlineRule[];
  holidays?: OfficeHoliday[];
}

export interface OfficeContact {
  id: string;
  office_id: string;
  contact_type: string;
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  hours?: string;
  notes?: string;
  is_primary: boolean;
  created_at: string;
}

export interface ConnectionMethod {
  id: string;
  office_id: string;
  method_type: ConnectionMethodType;
  priority: number;
  status: string;
  is_enabled: boolean;
  
  config: Record<string, unknown>;
  
  rate_limit_requests?: number;
  rate_limit_period?: number;
  rate_limit_burst?: number;
  
  maintenance_schedule?: Record<string, unknown>;
  preferred_hours?: Record<string, unknown>;
  
  health_status: HealthStatus;
  last_health_check?: string;
  last_successful_sync?: string;
  consecutive_failures: number;
  avg_response_time_ms?: number;
  success_rate_7d?: number;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  api_config?: APIConfig[];
  scraper_config?: ScraperConfig[];
  bulk_config?: BulkConfig[];
}

export interface APIConfig {
  id: string;
  connection_method_id: string;
  base_url: string;
  api_version?: string;
  auth_type: AuthType;
  auth_config: Record<string, unknown>;
  docs_url?: string;
  docs_format?: string;
  required_headers: Record<string, string>;
  endpoints: Record<string, string>;
  
  subscription_plan?: string;
  subscription_start?: string;
  subscription_end?: string;
  subscription_cost?: number;
  subscription_currency?: string;
  subscription_responsible?: string;
  renewal_alert_days: number;
  
  created_at: string;
}

export interface ScraperConfig {
  id: string;
  connection_method_id: string;
  target_url: string;
  search_url?: string;
  detail_url_pattern?: string;
  
  script_version?: string;
  script_generated_at?: string;
  script_generated_by?: 'ai_auto_mend' | 'manual';
  script_content?: string;
  
  browser_type: 'chromium' | 'firefox' | 'webkit';
  browser_headless: boolean;
  user_agent?: string;
  viewport_width: number;
  viewport_height: number;
  
  proxy_strategy?: 'none' | 'datacenter' | 'residential' | 'rotating';
  proxy_country?: string;
  
  captcha_strategy?: 'none' | '2captcha' | 'anticaptcha' | 'manual';
  wait_strategy?: Record<string, number>;
  
  selectors: Record<string, string>;
  previous_versions: Array<Record<string, unknown>>;
  
  created_at: string;
  updated_at: string;
}

export interface BulkConfig {
  id: string;
  connection_method_id: string;
  protocol: 'ftp' | 'sftp' | 'http' | 'https' | 's3';
  host: string;
  port?: number;
  path_pattern?: string;
  
  file_format: 'xml' | 'json' | 'csv' | 'zip';
  file_encoding: string;
  xml_standard?: 'st96' | 'st36' | 'custom';
  
  schedule_cron?: string;
  schedule_timezone?: string;
  
  decompress_strategy?: string;
  chunk_size: number;
  
  created_at: string;
}

export interface FieldMapping {
  id: string;
  office_id: string;
  data_type: IPType;
  source_format?: ConnectionMethodType;
  
  mappings: Record<string, FieldMapConfig>;
  validations: Record<string, FieldValidation>;
  
  version: number;
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface FieldMapConfig {
  source: string;
  transform: 'none' | 'date_iso' | 'date_parse' | 'clean_number' | 'uppercase' | 'lowercase' | 'trim' | 'status_map' | 'class_map' | 'custom';
  map?: Record<string, string>;
  customFn?: string;
}

export interface FieldValidation {
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}

export interface KnowledgeBaseEntry {
  id: string;
  office_id: string;
  knowledge_type: string;
  title: string;
  content?: string;
  content_url?: string;
  content_language: string;
  effective_date?: string;
  expiry_date?: string;
  last_crawled_at?: string;
  last_verified_at?: string;
  auto_update: boolean;
  created_at: string;
  updated_at: string;
}

export interface OfficialFee {
  id: string;
  office_id: string;
  fee_type: string;
  ip_type: IPType;
  amount: number;
  currency: string;
  description?: string;
  per_class: boolean;
  base_classes?: number;
  additional_class_fee?: number;
  online_discount?: number;
  small_entity_discount?: number;
  effective_from: string;
  effective_until?: string;
  source_url?: string;
  last_verified_at?: string;
  created_at: string;
}

export interface DeadlineRule {
  id: string;
  office_id: string;
  deadline_type: string;
  ip_type: IPType;
  trigger_event: string;
  days?: number;
  months?: number;
  years?: number;
  is_calendar_days: boolean;
  exclude_holidays: boolean;
  extension_available: boolean;
  max_extensions?: number;
  extension_days?: number;
  extension_fee_id?: string;
  consequence_if_missed?: string;
  notes?: string;
  created_at: string;
}

export interface OfficeHoliday {
  id: string;
  office_id: string;
  holiday_date: string;
  name?: string;
  is_recurring: boolean;
  recurring_month?: number;
  recurring_day?: number;
  created_at: string;
}

export interface SyncLog {
  id: string;
  office_id: string;
  connection_method_id?: string;
  sync_type: SyncType;
  status: SyncStatus;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  records_fetched: number;
  records_created: number;
  records_updated: number;
  records_failed: number;
  source_file?: string;
  errors: Array<{ code: string; message: string; details?: unknown }>;
  triggered_by?: string;
  triggered_by_user?: string;
}

export interface HealthCheck {
  id: string;
  connection_method_id: string;
  check_type: 'ping' | 'auth' | 'search' | 'full';
  status: 'success' | 'degraded' | 'failure';
  response_time_ms?: number;
  records_fetched?: number;
  error_code?: string;
  error_message?: string;
  error_details?: Record<string, unknown>;
  checked_at: string;
}

export interface IPOAlert {
  id: string;
  office_id?: string;
  alert_type: string;
  data: Record<string, unknown>;
  acknowledged_at?: string;
  acknowledged_by?: string;
  created_at: string;
}

export interface IPOAlertConfig {
  id: string;
  office_id?: string;
  alert_type: string;
  threshold_value?: number;
  threshold_unit?: string;
  notify_emails?: string[];
  notify_slack_channel?: string;
  notify_webhook_url?: string;
  cooldown_minutes: number;
  is_enabled: boolean;
  created_at: string;
}

// Health Overview (from view)
export interface IPOHealthOverview {
  id: string;
  code: string;
  name_official: string;
  name_short?: string;
  tier: OfficeTier;
  region?: string;
  office_status: OfficeStatus;
  connection_method_id?: string;
  method_type?: ConnectionMethodType;
  health_status?: HealthStatus;
  last_successful_sync?: string;
  consecutive_failures?: number;
  success_rate_7d?: number;
  avg_response_time_ms?: number;
  traffic_light: 'green' | 'yellow' | 'red' | 'gray';
}

// Dashboard Stats
export interface IPORegistryStats {
  totalOffices: number;
  activeOffices: number;
  
  byTier: { tier1: number; tier2: number; tier3: number };
  byHealth: { healthy: number; degraded: number; unhealthy: number; unknown: number };
  byRegion: Record<string, number>;
  
  connectionsDown: number;
  credentialsExpiring: number;
  subscriptionsExpiring: number;
  
  lastSync?: string;
  syncSuccessRate24h: number;
}

// Form types
export interface IPOOfficeFormData {
  code: string;
  code_alt?: string;
  name_official: string;
  name_short?: string;
  country_code?: string;
  region?: string;
  office_type: OfficeType;
  ip_types: IPType[];
  timezone: string;
  languages: string[];
  currency: string;
  address?: string;
  website_official?: string;
  website_search?: string;
  email_general?: string;
  phone_general?: string;
  tier: OfficeTier;
  priority_score: number;
  status: OfficeStatus;
  notes?: string;
}

export interface ConnectionMethodFormData {
  office_id: string;
  method_type: ConnectionMethodType;
  priority: number;
  is_enabled: boolean;
  rate_limit_requests?: number;
  rate_limit_period?: number;
}
