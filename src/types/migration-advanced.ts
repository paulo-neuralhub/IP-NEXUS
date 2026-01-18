// =====================================================
// TIPOS AVANZADOS PARA MIGRATOR 2.0
// =====================================================

// =====================================================
// CONEXIONES
// =====================================================

export type SystemType = 
  | 'patsnap' | 'anaqua' | 'cpa_global' | 'dennemeyer' | 'ipan'
  | 'thomson_compumark' | 'corsearch' | 'orbit' | 'darts_ip' 
  | 'clarivate' | 'ipfolio' | 'filemaker' | 'custom_api' | 'custom_db';

export type AuthType = 
  | 'oauth2' | 'api_key' | 'api_key_secret' | 'basic_auth' 
  | 'bearer_token' | 'session_cookie' | 'database' | 'agent';

export type ConnectionStatus = 
  | 'pending' | 'testing' | 'connected' | 'error' | 'expired' | 'revoked';

export interface MigrationConnection {
  id: string;
  organization_id: string;
  system_type: SystemType;
  name: string;
  description?: string;
  auth_type: AuthType;
  connection_config: Record<string, any>;
  status: ConnectionStatus;
  last_test_at?: string;
  last_test_result?: {
    success: boolean;
    message: string;
    details?: Record<string, any>;
  };
  last_successful_connection?: string;
  system_metadata?: SystemMetadata;
  agent_id?: string;
  agent?: MigrationAgent;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemMetadata {
  version?: string;
  total_matters?: number;
  total_contacts?: number;
  total_deadlines?: number;
  total_documents?: number;
  available_entities: string[];
  api_version?: string;
  rate_limit?: {
    requests_per_minute?: number;
    requests_per_day?: number;
  };
  last_scan?: string;
}

// =====================================================
// AGENTES
// =====================================================

export type AgentStatus = 
  | 'pending' | 'online' | 'offline' | 'busy' | 'error' | 'disabled';

export interface MigrationAgent {
  id: string;
  organization_id: string;
  name: string;
  agent_key: string;
  hostname?: string;
  os_type?: 'windows' | 'macos' | 'linux';
  os_version?: string;
  agent_version?: string;
  status: AgentStatus;
  last_heartbeat?: string;
  last_error?: string;
  capabilities: AgentCapability[];
  active_connections: number;
  created_at: string;
  updated_at?: string;
  last_activity?: string;
}

export interface AgentCapability {
  type: 'database' | 'file_access' | 'odbc' | 'browser';
  databases?: string[];
  paths?: string[];
  drivers?: string[];
}

// =====================================================
// SINCRONIZACIÓN
// =====================================================

export type SyncType = 'manual' | 'scheduled' | 'realtime';
export type SyncDirection = 'pull' | 'push' | 'bidirectional';
export type ConflictResolution = 'source_wins' | 'target_wins' | 'manual' | 'newest_wins';

export interface MigrationSync {
  id: string;
  connection_id: string;
  organization_id: string;
  name: string;
  sync_type: SyncType;
  entities_config: Record<string, EntitySyncConfig>;
  schedule_cron?: string;
  schedule_timezone?: string;
  status: 'active' | 'paused' | 'error' | 'disabled';
  last_sync_at?: string;
  last_sync_status?: string;
  last_sync_stats?: SyncStats;
  next_sync_at?: string;
  sync_cursors: Record<string, SyncCursor>;
  created_at: string;
  updated_at?: string;
}

export interface EntitySyncConfig {
  enabled: boolean;
  direction: SyncDirection;
  conflict_resolution: ConflictResolution;
  filters?: Record<string, any>;
  field_mapping?: Record<string, string>;
}

export interface SyncStats {
  duration_ms: number;
  items_checked: number;
  items_created: number;
  items_updated: number;
  items_deleted: number;
  items_skipped: number;
  errors: SyncError[];
}

export interface SyncCursor {
  last_modified?: string;
  last_id?: string;
  page_token?: string;
}

export interface SyncError {
  entity: string;
  source_id: string;
  error: string;
  timestamp: string;
}

export interface MigrationSyncHistory {
  id: string;
  sync_id: string;
  started_at: string;
  completed_at?: string;
  status: 'running' | 'completed' | 'partial' | 'failed' | 'cancelled';
  stats: SyncStats;
  changes: SyncChange[];
  errors: SyncError[];
  triggered_by: 'schedule' | 'manual' | 'webhook' | 'system';
}

export interface SyncChange {
  entity: string;
  action: 'create' | 'update' | 'delete';
  source_id: string;
  target_id?: string;
  fields?: string[];
}

// =====================================================
// SCRAPING
// =====================================================

export type ScrapingStatus = 
  | 'initializing' | 'authenticating' | 'authenticated' 
  | 'scraping' | 'paused' | 'completed' | 'error' | 'rate_limited';

export interface ScrapingSession {
  id: string;
  connection_id: string;
  project_id?: string;
  status: ScrapingStatus;
  current_page?: string;
  current_entity?: string;
  items_scraped: number;
  items_total?: number;
  requests_made: number;
  last_request_at?: string;
  rate_limit_until?: string;
  errors: ScrapingError[];
  started_at: string;
  completed_at?: string;
  extracted_data?: Record<string, any>;
}

export interface ScrapingError {
  page: string;
  error: string;
  timestamp: string;
  recoverable: boolean;
}

// =====================================================
// MAPEOS APRENDIDOS
// =====================================================

export interface LearnedMapping {
  id: string;
  source_system: string;
  source_field: string;
  source_field_type?: string;
  source_sample_values: any[];
  target_entity: string;
  target_field: string;
  confidence_score: number;
  times_used: number;
  times_confirmed: number;
  times_rejected: number;
  recommended_transform?: MappingTransform;
  created_at: string;
  updated_at?: string;
}

export interface MappingTransform {
  type: 'value_map' | 'format' | 'split' | 'concat' | 'regex' | 'custom';
  mapping?: Record<string, string>;
  format?: string;
  delimiter?: string;
  pattern?: string;
  replacement?: string;
}
