// ============================================================
// IP-NEXUS - AUDIT & COMPLIANCE TYPES
// ============================================================

// ==========================================
// AUDIT LOGS
// ==========================================

export type AuditAction = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'export' 
  | 'login' 
  | 'logout' 
  | 'permission_change' 
  | 'bulk_action' 
  | 'api_call'
  | 'gdpr_request_created'
  | 'gdpr_request_completed';

export type AuditActionCategory = 
  | 'data' 
  | 'auth' 
  | 'admin' 
  | 'system' 
  | 'api' 
  | 'security';

export type AuditLogStatus = 'success' | 'failure' | 'partial';

export interface AuditLogChanges {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  fields_changed?: string[];
}

export interface AuditLogMetadata {
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  request_id?: string;
  api_key_id?: string;
  source?: 'web' | 'api' | 'system' | 'import';
  [key: string]: unknown;
}

export interface GeoLocation {
  country?: string;
  city?: string;
  lat?: number;
  lng?: number;
}

export interface AuditLog {
  id: string;
  organization_id: string | null;
  user_id: string | null;
  user_email?: string;
  user_name?: string;
  user_role?: string;
  action: string;
  action_category: AuditActionCategory;
  resource_type: string;
  resource_id: string | null;
  resource_name?: string;
  changes: AuditLogChanges | null;
  metadata: AuditLogMetadata | null;
  ip_address: string | null;
  geo_location: GeoLocation | null;
  status: AuditLogStatus;
  error_message?: string;
  duration_ms?: number;
  description?: string;
  created_at: string;
}

export interface AuditLogFilters {
  organizationId?: string;
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  actionCategory?: AuditActionCategory;
  status?: AuditLogStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// ==========================================
// CHANGE HISTORY
// ==========================================

export type ChangeDataType = 'string' | 'number' | 'boolean' | 'date' | 'json' | 'array';

export interface ChangeHistoryRecord {
  id: string;
  audit_log_id: string | null;
  resource_type: string;
  resource_id: string;
  field_name: string;
  field_path?: string;
  old_value?: string;
  new_value?: string;
  data_type?: ChangeDataType;
  created_at: string;
}

// ==========================================
// ACCESS LOGS
// ==========================================

export type AccessEventType = 
  | 'login_success' 
  | 'login_failed' 
  | 'logout' 
  | 'session_expired'
  | 'password_reset' 
  | '2fa_enabled' 
  | '2fa_disabled' 
  | 'api_key_used';

export type AuthMethod = 'password' | 'sso' | 'api_key' | 'oauth' | '2fa';

export interface DeviceInfo {
  browser?: string;
  os?: string;
  device?: string;
  is_mobile?: boolean;
}

export interface AccessLog {
  id: string;
  user_id: string | null;
  user_email: string;
  organization_id: string | null;
  event_type: AccessEventType;
  auth_method?: AuthMethod;
  ip_address?: string;
  user_agent?: string;
  device_info: DeviceInfo | null;
  geo_location: GeoLocation | null;
  status: 'success' | 'failure';
  failure_reason?: string;
  session_id?: string;
  created_at: string;
}

export interface AccessLogFilters {
  organizationId?: string;
  userId?: string;
  eventType?: AccessEventType;
  status?: 'success' | 'failure';
  dateFrom?: string;
  dateTo?: string;
}

// ==========================================
// RETENTION POLICIES
// ==========================================

export type RetentionDataType = 
  | 'audit_logs' 
  | 'assets' 
  | 'documents' 
  | 'comments' 
  | 'notifications'
  | 'access_logs'
  | 'activities';

export type RetentionAction = 'archive' | 'delete' | 'anonymize';

export interface RetentionConditions {
  status?: string[];
  older_than_days?: number;
  [key: string]: unknown;
}

export interface RetentionPolicy {
  id: string;
  organization_id: string | null;
  name: string;
  description?: string;
  data_type: string;
  retention_days: number;
  conditions: RetentionConditions;
  action: RetentionAction;
  is_active: boolean;
  legal_hold: boolean;
  legal_hold_reason?: string;
  legal_hold_until?: string;
  last_run_at?: string;
  last_run_count?: number;
  created_at: string;
  updated_at: string;
}

export type RetentionExecutionStatus = 'running' | 'completed' | 'failed' | 'cancelled';

export interface RetentionExecution {
  id: string;
  policy_id: string;
  started_at: string;
  completed_at?: string;
  records_processed: number;
  records_archived: number;
  records_deleted: number;
  records_anonymized: number;
  records_skipped: number;
  status: RetentionExecutionStatus;
  error_message?: string;
  details: Record<string, unknown>;
}

// ==========================================
// GDPR REQUESTS
// ==========================================

export type GdprRequestType = 
  | 'access'        // Derecho de acceso
  | 'rectification' // Derecho de rectificación
  | 'erasure'       // Derecho al olvido
  | 'portability'   // Derecho de portabilidad
  | 'restriction'   // Derecho a limitar el tratamiento
  | 'objection';    // Derecho de oposición

export type GdprRequestStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'completed' 
  | 'rejected' 
  | 'cancelled';

export interface GdprRequest {
  id: string;
  organization_id: string;
  requester_user_id?: string;
  requester_email: string;
  requester_name?: string;
  request_type: GdprRequestType;
  description?: string;
  status: GdprRequestStatus;
  assigned_to?: string;
  due_date: string;
  extended_until?: string;
  extension_reason?: string;
  identity_verified: boolean;
  identity_verified_at?: string;
  identity_verified_by?: string;
  resolution_notes?: string;
  completed_at?: string;
  export_file_url?: string;
  export_file_expires_at?: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// USER CONSENTS
// ==========================================

export type ConsentType = 
  | 'terms_of_service' 
  | 'privacy_policy' 
  | 'marketing_email'
  | 'analytics' 
  | 'third_party_sharing' 
  | 'data_processing';

export interface UserConsent {
  id: string;
  user_id: string;
  organization_id?: string;
  consent_type: ConsentType;
  document_version?: string;
  document_url?: string;
  granted: boolean;
  ip_address?: string;
  user_agent?: string;
  granted_at: string;
  revoked_at?: string;
}

// ==========================================
// DATA EXPORTS
// ==========================================

export type DataExportType = 
  | 'full_backup' 
  | 'gdpr_request' 
  | 'report' 
  | 'partial' 
  | 'user_data';

export type DataExportStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'expired';

export interface DataExportConfig {
  include_assets?: boolean;
  include_contacts?: boolean;
  include_documents?: boolean;
  include_audit_logs?: boolean;
  date_from?: string;
  date_to?: string;
  format?: 'json' | 'csv' | 'xlsx';
  target_user_id?: string;
}

export interface DataExport {
  id: string;
  organization_id: string;
  user_id: string;
  export_type: DataExportType;
  config: DataExportConfig;
  status: DataExportStatus;
  progress: number;
  current_step?: string;
  file_url?: string;
  file_size_bytes?: number;
  file_expires_at?: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_at: string;
}

// ==========================================
// SECURITY ALERTS
// ==========================================

export type SecurityAlertType = 
  | 'multiple_failed_logins' 
  | 'unusual_location' 
  | 'mass_delete'
  | 'permission_escalation' 
  | 'data_exfiltration' 
  | 'api_abuse'
  | 'suspicious_activity';

export type SecurityAlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export type SecurityAlertStatus = 
  | 'open' 
  | 'investigating' 
  | 'resolved' 
  | 'false_positive' 
  | 'escalated';

export interface SecurityAlertEvidence {
  ip_addresses?: string[];
  timestamps?: string[];
  actions?: string[];
  threshold_exceeded?: string;
  [key: string]: unknown;
}

export interface SecurityAlertAction {
  action: string;
  timestamp: string;
  by: string;
}

export interface SecurityAlert {
  id: string;
  organization_id: string | null;
  alert_type: SecurityAlertType;
  severity: SecurityAlertSeverity;
  title: string;
  description?: string;
  user_id?: string;
  evidence: SecurityAlertEvidence | null;
  status: SecurityAlertStatus;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  actions_taken: SecurityAlertAction[];
  created_at: string;
}

// ==========================================
// COMPLIANCE CHECKS
// ==========================================

export type ComplianceFramework = 
  | 'gdpr' 
  | 'soc2' 
  | 'iso27001' 
  | 'hipaa' 
  | 'internal';

export type ComplianceStatus = 
  | 'compliant' 
  | 'non_compliant' 
  | 'partial' 
  | 'not_applicable' 
  | 'pending_review';

export interface ComplianceCheck {
  id: string;
  organization_id: string;
  framework: ComplianceFramework;
  check_code: string;
  check_name: string;
  check_description?: string;
  category?: string;
  status: ComplianceStatus;
  evidence_notes?: string;
  evidence_documents?: string[];
  owner_id?: string;
  last_checked_at?: string;
  next_review_at?: string;
  remediation_plan?: string;
  remediation_due_date?: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// STATISTICS
// ==========================================

export interface AuditStats {
  total_logs: number;
  logs_today: number;
  logs_this_week: number;
  logs_by_action: Record<string, number>;
  logs_by_category: Record<string, number>;
  logs_by_resource: Record<string, number>;
}

export interface GdprStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  rejected: number;
  overdue: number;
  compliance_score: number;
  consents_ok: boolean;
  retention_ok: boolean;
  rights_ok: boolean;
}

export interface SecurityStats {
  total_alerts: number;
  open_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  resolved_today: number;
  avg_resolution_time_hours: number;
}

export interface ComplianceStats {
  total_checks: number;
  compliant: number;
  non_compliant: number;
  partial: number;
  pending_review: number;
  compliance_percentage: number;
  by_framework: Record<string, {
    total: number;
    compliant: number;
    percentage: number;
  }>;
}
