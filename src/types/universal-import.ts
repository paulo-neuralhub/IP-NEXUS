// =====================================================
// FUENTES DE IMPORTACIÓN
// =====================================================

export type SourceType = 'api' | 'database' | 'web_scraper' | 'file_upload' | 'email_forward' | 'watched_folder' | 'agent';

export type SourceStatus = 'pending' | 'testing' | 'active' | 'error' | 'disabled' | 'rate_limited';

export interface ImportSource {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  source_type: SourceType;
  detected_system?: string;
  system_confidence?: number;
  config: SourceConfig;
  credentials_vault_id?: string;
  status: SourceStatus;
  last_test_at?: string;
  last_test_result?: TestResult;
  source_metadata?: SourceMetadata;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export type SourceConfig = ApiSourceConfig | DatabaseSourceConfig | WebScraperConfig | FileUploadConfig | WatchedFolderConfig | Record<string, any>;

export interface ApiSourceConfig {
  base_url: string;
  auth_type: 'oauth2' | 'api_key' | 'basic' | 'bearer';
  endpoints: Record<string, string>;
  rate_limit?: { requests_per_minute: number };
  headers?: Record<string, string>;
}

export interface DatabaseSourceConfig {
  type: 'sqlserver' | 'oracle' | 'mysql' | 'postgresql' | 'sqlite' | 'mongodb';
  host: string;
  port: number;
  database: string;
  schema?: string;
  tables: Record<string, string>;
  query_templates?: Record<string, string>;
}

export interface WebScraperConfig {
  login_url: string;
  base_url: string;
  navigation_config: NavigationStep[];
  extraction_rules: Record<string, ExtractionRule>;
  rate_limit?: RateLimitConfig;
}

export interface FileUploadConfig {
  accepted_formats: string[];
  max_file_size_mb: number;
  auto_detect_structure: boolean;
  default_encoding?: string;
}

export interface WatchedFolderConfig {
  path: string;
  pattern: string;
  poll_interval_seconds: number;
  move_processed_to?: string;
}

export interface TestResult {
  success: boolean;
  message: string;
  metadata?: Record<string, any>;
  error?: string;
}

export interface SourceMetadata {
  version?: string;
  total_records?: Record<string, number>;
  available_entities?: string[];
  last_modified?: string;
}

// =====================================================
// JOBS DE IMPORTACIÓN
// =====================================================

export type JobType = 'full_import' | 'incremental' | 'file_import' | 'shadow_sync' | 'validation' | 'rollback';

export type JobStatus = 'pending' | 'queued' | 'running' | 'paused' | 'completed' | 'completed_with_errors' | 'failed' | 'cancelled' | 'rolled_back';

export interface ImportJob {
  id: string;
  organization_id: string;
  source_id?: string;
  job_type: JobType;
  config: JobConfig;
  source_files?: SourceFile[];
  status: JobStatus;
  progress: JobProgress;
  results?: JobResults;
  shadow_data?: any;
  shadow_comparison?: ShadowComparison;
  rollback_snapshot_id?: string;
  parent_job_id?: string;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  created_by?: string;
  created_at: string;
  source?: ImportSource;
}

export interface SourceFile {
  file_id: string;
  filename: string;
  size: number;
  sheets?: string[];
  pages?: number;
}

export interface JobConfig {
  entities: string[];
  filters?: Record<string, any>;
  options: {
    skip_duplicates: boolean;
    update_existing: boolean;
    dry_run: boolean;
    batch_size: number;
    create_snapshot: boolean;
  };
  field_mapping?: Record<string, FieldMapping>;
  transformations?: Record<string, Transformation>;
}

export interface JobProgress {
  phase: 'extracting' | 'transforming' | 'loading' | 'validating';
  current_entity?: string;
  processed: number;
  total: number;
  percentage: number;
  current_batch: number;
  total_batches: number;
  estimated_remaining_seconds?: number;
  current_step?: string;
}

export interface JobResults {
  summary: Record<string, EntityResult>;
  duration_seconds: number;
  data_quality_score: number;
  warnings: Warning[];
  errors: ImportJobError[];
}

export interface EntityResult {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  duplicates: number;
}

// =====================================================
// ARCHIVOS
// =====================================================

export type FileAnalysisType = 'spreadsheet' | 'pdf' | 'xml' | 'json' | 'unknown';

export type FileAnalysisStatus = 'pending' | 'analyzing' | 'completed' | 'failed';

export type FileProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ImportFile {
  id: string;
  organization_id: string;
  job_id?: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  storage_path: string;
  analysis_status: FileAnalysisStatus;
  analysis_result?: FileAnalysisResult;
  field_mapping?: Record<string, FieldMapping>;
  mapping_confirmed: boolean;
  processing_status: FileProcessingStatus;
  processing_result?: any;
  uploaded_by?: string;
  uploaded_at: string;
  analyzed_at?: string;
  processed_at?: string;
}

export interface FileAnalysisResult {
  type: FileAnalysisType;
  // Para spreadsheets
  sheets?: SheetAnalysis[];
  encoding?: string;
  delimiter?: string;
  // Para PDFs
  pages?: number;
  has_text?: boolean;
  has_images?: boolean;
  ocr_required?: boolean;
  detected_documents?: DetectedDocument[];
  // Para XML
  root_element?: string;
  schema_detected?: string;
  records?: number;
}

export interface SheetAnalysis {
  name: string;
  rows: number;
  columns: string[];
  detected_entity?: string;
  confidence: number;
  sample_data: Record<string, any>[];
  data_types: Record<string, string>;
}

export interface DetectedDocument {
  type: 'certificate' | 'renewal_notice' | 'official_action' | 'invoice' | 'correspondence' | 'unknown';
  page_range: [number, number];
  confidence: number;
  extracted_data: Record<string, any>;
  related_matter_ref?: string;
}

// =====================================================
// SHADOW MODE
// =====================================================

export interface ShadowComparison {
  summary: {
    new_records: number;
    modified_records: number;
    deleted_records: number;
    unchanged_records: number;
    conflicts: number;
  };
  details: ShadowDetail[];
  recommendations: Recommendation[];
}

export interface ShadowDetail {
  entity: string;
  source_id: string;
  action: 'create' | 'update' | 'delete' | 'conflict';
  current_data?: Record<string, any>;
  new_data?: Record<string, any>;
  diff?: FieldDiff[];
}

export interface FieldDiff {
  field: string;
  current_value: any;
  new_value: any;
  significance: 'low' | 'medium' | 'high';
}

export interface Recommendation {
  type: 'info' | 'warning' | 'action_required';
  message: string;
  affected_records: number;
  suggested_action?: string;
}

// =====================================================
// WEB SCRAPING
// =====================================================

export interface NavigationStep {
  action: 'goto' | 'fill' | 'click' | 'wait' | 'scroll' | 'screenshot' | 'extract';
  url?: string;
  selector?: string;
  value?: string;
  timeout?: number;
}

export interface ExtractionRule {
  list_url: string;
  list_selector: string;
  pagination?: PaginationConfig;
  detail_url_pattern?: string;
  fields: Record<string, FieldExtractionRule>;
}

export interface FieldExtractionRule {
  selector: string;
  attribute?: string;
  transform?: 'trim' | 'lowercase' | 'uppercase' | 'number' | 'date';
  map?: Record<string, string>;
  regex?: string;
}

export interface PaginationConfig {
  type: 'click' | 'url_param' | 'infinite_scroll';
  selector?: string;
  param_name?: string;
  max_pages?: number;
}

export interface RateLimitConfig {
  requests_per_minute: number;
  delay_between_pages_ms: number;
  max_concurrent: number;
}

// =====================================================
// SINCRONIZACIÓN
// =====================================================

export type SyncType = 'manual' | 'scheduled' | 'realtime' | 'on_change';

export type SyncStatus = 'active' | 'paused' | 'error' | 'disabled';

export interface ImportSyncConfig {
  id: string;
  source_id: string;
  organization_id: string;
  name: string;
  enabled: boolean;
  sync_type: SyncType;
  schedule_cron?: string;
  schedule_timezone: string;
  entities_config: Record<string, EntitySyncConfig>;
  status: SyncStatus;
  sync_cursors: Record<string, SyncCursor>;
  last_sync_at?: string;
  last_sync_job_id?: string;
  last_sync_status?: string;
  next_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EntitySyncConfig {
  enabled: boolean;
  direction: 'pull' | 'push' | 'bidirectional';
  conflict_resolution: 'source_wins' | 'target_wins' | 'manual';
  filters?: Record<string, any>;
  sync_fields?: string[];
}

export interface SyncCursor {
  last_modified?: string;
  last_id?: string;
}

// =====================================================
// SNAPSHOTS
// =====================================================

export interface ImportSnapshot {
  id: string;
  organization_id: string;
  job_id: string;
  snapshot_data: Record<string, any>;
  affected_records: Record<string, string[]>;
  snapshot_size?: number;
  expires_at?: string;
  created_at: string;
}

// =====================================================
// SCRAPING RULES
// =====================================================

export interface ImportScrapingRule {
  id: string;
  source_id: string;
  target_system: string;
  system_version?: string;
  login_steps: NavigationStep[];
  extraction_rules: Record<string, ExtractionRule>;
  rate_limit_config: RateLimitConfig;
  last_tested_at?: string;
  last_test_result?: TestResult;
  is_working: boolean;
  created_at: string;
  updated_at: string;
}

// =====================================================
// MAPPING TEMPLATES
// =====================================================

export interface ImportMappingTemplate {
  id: string;
  source_system: string;
  source_type: string;
  entity_type: string;
  field_mappings: Record<string, FieldMappingConfig>;
  times_used: number;
  times_confirmed: number;
  times_modified: number;
  avg_accuracy?: number;
  is_system_template: boolean;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

export interface FieldMappingConfig {
  target: string;
  confidence: number;
  transform?: Transformation;
}

// =====================================================
// MAPEO Y TRANSFORMACIONES
// =====================================================

export interface FieldMapping {
  source_field: string;
  target_field: string;
  target_entity: string;
  confidence: number;
  transformation?: Transformation;
}

export interface Transformation {
  type: 'value_map' | 'date_format' | 'split' | 'concatenate' | 'regex' | 'lookup' | 'custom';
  config: Record<string, any>;
}

// =====================================================
// ERRORES Y VALIDACIÓN
// =====================================================

export interface ImportJobError {
  entity: string;
  source_id: string;
  row_number?: number;
  field?: string;
  error_type: 'validation' | 'duplicate' | 'reference' | 'transformation' | 'system';
  message: string;
  source_data?: Record<string, any>;
  recoverable: boolean;
}

export interface Warning {
  entity: string;
  field?: string;
  message: string;
  affected_count: number;
  suggestion?: string;
}

export interface ValidationResult {
  is_valid: boolean;
  errors: ImportJobError[];
  warnings: Warning[];
  data_quality_score: number;
  field_completeness: Record<string, number>;
  duplicate_check: {
    potential_duplicates: number;
    exact_duplicates: number;
  };
}
