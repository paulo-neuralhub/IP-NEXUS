export type ImportType = 'matters' | 'contacts' | 'deadlines' | 'costs' | 'documents' | 'renewals';
export type SourceType = 'excel' | 'csv' | 'json' | 'euipo' | 'wipo' | 'tmview' | 'api';
export type ImportStatus = 'pending' | 'validating' | 'validated' | 'importing' | 'completed' | 'failed' | 'cancelled';

export interface Import {
  id: string;
  organization_id: string;
  import_type: ImportType;
  source_type: SourceType;
  file_name?: string;
  file_url?: string;
  file_size?: number;
  mapping: Record<string, any>;
  options: ImportOptions;
  status: ImportStatus;
  total_rows: number;
  processed_rows: number;
  success_rows: number;
  error_rows: number;
  skipped_rows: number;
  errors: ImportError[];
  created_ids: string[];
  updated_ids: string[];
  started_at?: string;
  completed_at?: string;
  created_at: string;
  created_by?: string;
}

export interface ImportOptions {
  skip_header?: boolean;
  skip_rows?: number;
  date_format?: string;
  delimiter?: string;
  encoding?: string;
  update_existing?: boolean;
  match_by?: string;
}

export interface ImportError {
  row: number;
  field: string;
  error: string;
  value: any;
}

export interface FieldMapping {
  column: string | number;
  transform?: string;
  format?: string;
  default?: any;
  create_contact?: boolean;
  create_company?: boolean;
  match_matter?: boolean;
  separator?: string;
  type?: 'string' | 'number' | 'date' | 'boolean';
}

export type ConnectorType = 'euipo' | 'wipo' | 'tmview' | 'inpi_es' | 'oepm' | 'epo' | 'uspto' | 'ukipo' | 'custom_api';
export type SyncFrequency = 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly';
export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'unknown';

export interface DataConnector {
  id: string;
  organization_id: string;
  name: string;
  connector_type: ConnectorType;
  config: Record<string, any>;
  credentials: Record<string, any>;
  sync_enabled: boolean;
  sync_frequency?: SyncFrequency;
  last_sync_at?: string;
  next_sync_at?: string;
  is_active: boolean;
  connection_status: ConnectionStatus;
  last_error?: string;
  created_at: string;
  updated_at: string;
}

export type SyncType = 'full' | 'incremental' | 'specific';
export type SyncStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface SyncJob {
  id: string;
  organization_id: string;
  connector_id: string;
  sync_type: SyncType;
  filters: Record<string, any>;
  status: SyncStatus;
  total_items: number;
  processed_items: number;
  new_items: number;
  updated_items: number;
  errors: number;
  result: Record<string, any>;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  connector?: DataConnector;
}

export interface ImportTemplate {
  id: string;
  organization_id?: string;
  name: string;
  description?: string;
  import_type: ImportType;
  source_type: SourceType;
  mapping: Record<string, any>;
  options: ImportOptions;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface ParsedFile {
  headers: string[];
  rows: any[][];
  total_rows: number;
  preview: any[][];
}

// Validation result from the validate-import edge function
export interface ValidationResult {
  valid: boolean;
  total_rows: number;
  valid_rows: number;
  errors: ImportError[];
  warnings: { row: number; field: string; message: string; value: any }[];
}
