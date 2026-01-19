// =====================================================
// TIPOS IMPORT/EXPORT - PROMPT 35
// =====================================================

// =====================================================
// PLANTILLAS DE IMPORTACIÓN
// =====================================================

export interface ImportConfig {
  delimiter?: string;
  encoding?: string;
  hasHeader?: boolean;
  dateFormat?: string;
  decimalSeparator?: string;
  sheetName?: string;
}

export interface FieldMapping {
  sourceColumn: string;
  targetField: string;
  transform?: TransformType;
  dateFormat?: string;
  required?: boolean;
  defaultValue?: any;
}

export type TransformType = 
  | 'uppercase' 
  | 'lowercase' 
  | 'trim' 
  | 'parse_date' 
  | 'parse_number' 
  | 'split_array'
  | 'lookup';

export interface ValidationRule {
  field: string;
  rule: 'required' | 'unique' | 'in_list' | 'regex' | 'min' | 'max';
  values?: string[];
  pattern?: string;
  min?: number;
  max?: number;
}

export interface ImportTemplate {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  entity_type: EntityType;
  source_format: SourceFormat;
  config: ImportConfig;
  field_mappings: FieldMapping[];
  validation_rules: ValidationRule[];
  duplicate_handling: DuplicateHandling;
  duplicate_check_fields: string[];
  use_count: number;
  last_used_at?: string;
  is_active: boolean;
  is_default: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export type EntityType = 'asset' | 'contact' | 'deadline' | 'cost' | 'document';
export type SourceFormat = 'csv' | 'excel' | 'xml' | 'json';
export type DuplicateHandling = 'skip' | 'update' | 'create_new' | 'error';

// =====================================================
// JOBS DE IMPORTACIÓN
// =====================================================

export type ImportJobStatus = 
  | 'pending' 
  | 'validating' 
  | 'validated' 
  | 'importing' 
  | 'completed' 
  | 'partial' 
  | 'failed' 
  | 'rolled_back';

export interface ImportJobV2 {
  id: string;
  organization_id: string;
  template_id?: string;
  source_file_name: string;
  source_file_url: string;
  source_file_size?: number;
  source_format: SourceFormat;
  entity_type: EntityType;
  config: ImportConfig;
  field_mappings: FieldMapping[];
  status: ImportJobStatus;
  progress: number;
  current_step?: string;
  total_rows: number;
  processed_rows: number;
  successful_rows: number;
  failed_rows: number;
  skipped_rows: number;
  errors: ImportError[];
  preview_data?: any[];
  validation_summary?: ValidationSummary;
  started_at?: string;
  completed_at?: string;
  can_rollback: boolean;
  rollback_until?: string;
  rollback_data?: any;
  created_by: string;
  created_at: string;
}

export interface ImportError {
  row: number;
  field: string;
  error: string;
  value: any;
}

export interface ValidationSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicates: number;
}

export interface ImportRecord {
  id: string;
  import_job_id: string;
  entity_type: EntityType;
  entity_id: string;
  original_data: Record<string, any>;
  action: 'created' | 'updated' | 'skipped';
  source_row: number;
  created_at: string;
}

// =====================================================
// PLANTILLAS DE EXPORTACIÓN
// =====================================================

export type TargetFormat = 'excel' | 'csv' | 'pdf' | 'xml' | 'json';

export interface ExportColumn {
  field: string;
  header: string;
  width?: number;
  transform?: ExportTransform;
}

export type ExportTransform = 
  | 'format_date' 
  | 'format_currency' 
  | 'array_join' 
  | 'boolean_text';

export interface ExportTemplate {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  entity_type: EntityType;
  target_format: TargetFormat;
  columns: ExportColumn[];
  default_filters: Record<string, any>;
  default_sort?: { field: string; direction: 'asc' | 'desc' };
  format_options: FormatOptions;
  is_scheduled: boolean;
  schedule_cron?: string;
  schedule_recipients?: string[];
  use_count: number;
  last_used_at?: string;
  is_active: boolean;
  is_default: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FormatOptions {
  include_header?: boolean;
  date_format?: string;
  decimal_places?: number;
  currency_format?: string;
}

// =====================================================
// JOBS DE EXPORTACIÓN
// =====================================================

export type ExportJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ExportJob {
  id: string;
  organization_id: string;
  template_id?: string;
  entity_type: EntityType;
  target_format: TargetFormat;
  columns: ExportColumn[];
  filters: Record<string, any>;
  sort?: { field: string; direction: 'asc' | 'desc' };
  format_options: FormatOptions;
  status: ExportJobStatus;
  progress: number;
  total_records: number;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  expires_at?: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_by?: string;
  created_at: string;
}

// =====================================================
// MIGRACIONES
// =====================================================

export type MigrationSourceSystem = 
  | 'patricia' 
  | 'anaqua' 
  | 'dennemeyer' 
  | 'webtms' 
  | 'foundationip' 
  | 'inprotech' 
  | 'pattsy'
  | 'patsnap'
  | 'cpa_global'
  | 'custom';

export interface MigrationConfig {
  id: string;
  organization_id: string;
  source_system: MigrationSourceSystem;
  source_version?: string;
  name: string;
  description?: string;
  connection_config?: ConnectionConfig;
  entity_mappings: Record<string, EntityMapping>;
  field_mappings: Record<string, FieldMapping[]>;
  value_mappings: Record<string, Record<string, string>>;
  is_active: boolean;
  last_used_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ConnectionConfig {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string; // encrypted
  api_url?: string;
  api_key?: string; // encrypted
}

export interface EntityMapping {
  target: string;
  type_value?: string;
}

// =====================================================
// JOBS DE MIGRACIÓN
// =====================================================

export type MigrationJobType = 'test' | 'preview' | 'full' | 'incremental' | 'rollback';
export type MigrationJobStatus = 'pending' | 'running' | 'completed' | 'partial' | 'failed';

export interface MigrationJob {
  id: string;
  migration_config_id: string;
  organization_id: string;
  job_type: MigrationJobType;
  status: MigrationJobStatus;
  progress: number;
  current_entity?: string;
  current_step?: string;
  stats: Record<string, MigrationEntityStats>;
  errors: MigrationError[];
  log_file_url?: string;
  started_at?: string;
  completed_at?: string;
  created_by?: string;
  created_at: string;
}

export interface MigrationEntityStats {
  total: number;
  processed: number;
  success: number;
  failed: number;
}

export interface MigrationError {
  entity: string;
  source_id: string;
  error: string;
  row?: number;
}

// =====================================================
// CAMPOS IMPORTABLES
// =====================================================

export interface ImportableField {
  id: string;
  entity_type: EntityType;
  field_name: string;
  field_label: string;
  data_type: DataType;
  is_required: boolean;
  is_unique: boolean;
  max_length?: number;
  allowed_values?: string[];
  available_transforms?: TransformType[];
  description?: string;
  example_value?: string;
  display_order: number;
}

export type DataType = 'string' | 'number' | 'date' | 'boolean' | 'array' | 'json';

// =====================================================
// VALIDACIÓN
// =====================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ImportError[];
  warnings: ImportWarning[];
  preview: any[];
  summary: ValidationSummary;
}

export interface ImportWarning {
  row: number;
  field: string;
  warning: string;
  value: any;
}

// =====================================================
// PARSING
// =====================================================

export interface ParsedFile {
  headers: string[];
  data: any[];
  totalRows: number;
  sheets?: string[];
}

// =====================================================
// SISTEMAS CONOCIDOS
// =====================================================

export const KNOWN_MIGRATION_SYSTEMS: Record<MigrationSourceSystem, { name: string; icon: string; description: string }> = {
  patricia: { name: 'Patricia', icon: '🏢', description: 'IP Management System' },
  anaqua: { name: 'Anaqua', icon: '🏢', description: 'IP Management Platform' },
  dennemeyer: { name: 'Dennemeyer', icon: '🏢', description: 'IP Solutions' },
  webtms: { name: 'WebTMS', icon: '🏢', description: 'Trademark Management' },
  foundationip: { name: 'FoundationIP', icon: '🏢', description: 'IP Lifecycle Management' },
  inprotech: { name: 'Inprotech', icon: '🏢', description: 'IP Practice Management' },
  pattsy: { name: 'PATTSY', icon: '🏢', description: 'Patent Management' },
  patsnap: { name: 'PatSnap', icon: '🏢', description: 'IP Analytics Platform' },
  cpa_global: { name: 'CPA Global', icon: '🏢', description: 'IP Renewals' },
  custom: { name: 'Sistema Custom', icon: '⚙️', description: 'Sistema personalizado' },
};

export const ENTITY_TYPES: { value: EntityType; label: string }[] = [
  { value: 'asset', label: 'Activos de PI' },
  { value: 'contact', label: 'Contactos' },
  { value: 'deadline', label: 'Deadlines' },
  { value: 'cost', label: 'Costes' },
  { value: 'document', label: 'Documentos' },
];

export const SOURCE_FORMATS: { value: SourceFormat; label: string; extensions: string[] }[] = [
  { value: 'csv', label: 'CSV', extensions: ['.csv'] },
  { value: 'excel', label: 'Excel', extensions: ['.xlsx', '.xls'] },
  { value: 'json', label: 'JSON', extensions: ['.json'] },
  { value: 'xml', label: 'XML', extensions: ['.xml'] },
];

export const TARGET_FORMATS: { value: TargetFormat; label: string }[] = [
  { value: 'excel', label: 'Excel (.xlsx)' },
  { value: 'csv', label: 'CSV (.csv)' },
  { value: 'pdf', label: 'PDF (.pdf)' },
  { value: 'json', label: 'JSON (.json)' },
  { value: 'xml', label: 'XML (.xml)' },
];
