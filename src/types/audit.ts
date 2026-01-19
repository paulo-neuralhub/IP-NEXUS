// ============================================================
// IP-NEXUS - AUDIT & COMPLIANCE TYPES
// ============================================================

import type { Json } from '@/integrations/supabase/types';

// ==========================================
// AUDIT LOGS (Aligned with existing DB schema)
// ==========================================

export interface AuditLog {
  id: string;
  organization_id: string | null;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  description: string | null;
  changes: Json | null;
  metadata: Json | null;
  ip_address: unknown;
  user_agent: string | null;
  created_at: string | null;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface AuditStats {
  total_logs: number;
  logs_today: number;
  logs_this_week: number;
  by_action: Record<string, number>;
  by_resource_type: Record<string, number>;
}

// ==========================================
// CHANGE HISTORY
// ==========================================

export interface ChangeHistoryRecord {
  id: string;
  audit_log_id: string | null;
  resource_type: string;
  resource_id: string;
  field_name: string;
  field_path: string | null;
  old_value: string | null;
  new_value: string | null;
  data_type: string | null;
  created_at: string | null;
}

// ==========================================
// ACCESS LOGS
// ==========================================

export type AccessEventType = 
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'password_change'
  | 'password_reset'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'session_expired'
  | 'session_revoked'
  | 'api_access';

export interface AccessLog {
  id: string;
  organization_id: string | null;
  user_id: string | null;
  user_email: string;
  event_type: string;
  status: string;
  auth_method: string | null;
  failure_reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  device_info: Json | null;
  geo_location: Json | null;
  session_id: string | null;
  created_at: string | null;
}

export interface AccessLogFilters {
  userId?: string;
  eventType?: string;
  status?: 'success' | 'failure';
  dateFrom?: string;
  dateTo?: string;
}

export interface AccessStats {
  logins_today: number;
  failed_today: number;
  unique_users_this_week: number;
  by_auth_method: Record<string, number>;
}

// ==========================================
// RETENTION POLICIES
// ==========================================

export type RetentionAction = 'delete' | 'archive' | 'anonymize';

export interface RetentionConditions {
  older_than_days?: number;
  status?: string[];
  exclude_tags?: string[];
  include_tags?: string[];
  [key: string]: unknown;
}

export interface RetentionPolicy {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  data_type: string;
  retention_days: number;
  conditions: Json | null;
  action: string;
  is_active: boolean | null;
  legal_hold: boolean | null;
  legal_hold_reason: string | null;
  legal_hold_set_by: string | null;
  legal_hold_set_at: string | null;
  last_run_at: string | null;
  last_run_count: number | null;
  next_run_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface RetentionExecution {
  id: string;
  policy_id: string;
  started_at: string | null;
  completed_at: string | null;
  status: string | null;
  records_processed: number | null;
  records_affected: number | null;
  errors: Json | null;
  execution_log: Json | null;
}

// ==========================================
// GDPR
// ==========================================

export type GdprRequestType = 
  | 'access'
  | 'rectification'
  | 'erasure'
  | 'portability'
  | 'restriction'
  | 'objection';

export type GdprRequestStatus = 
  | 'pending'
  | 'identity_verification'
  | 'in_progress'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export interface GdprRequest {
  id: string;
  organization_id: string;
  requester_email: string;
  requester_name: string | null;
  request_type: string;
  status: string | null;
  description: string | null;
  data_categories: string[] | null;
  identity_verified: boolean | null;
  identity_verified_at: string | null;
  identity_verified_by: string | null;
  processing_notes: string | null;
  completed_at: string | null;
  completed_by: string | null;
  due_date: string | null;
  response_data: Json | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserConsent {
  id: string;
  organization_id: string;
  user_id: string | null;
  user_email: string;
  consent_type: string;
  is_granted: boolean | null;
  granted_at: string | null;
  revoked_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  consent_version: string | null;
  legal_basis: string | null;
  metadata: Json | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DataExport {
  id: string;
  organization_id: string;
  gdpr_request_id: string | null;
  user_id: string | null;
  user_email: string;
  export_type: string | null;
  status: string | null;
  data_categories: string[] | null;
  file_path: string | null;
  file_size: number | null;
  download_count: number | null;
  expires_at: string | null;
  created_at: string | null;
  completed_at: string | null;
}

export interface GdprStats {
  total_requests: number;
  pending_requests: number;
  completed_requests: number;
  avg_completion_days: number;
  by_type: Record<string, number>;
  by_status: Record<string, number>;
}

// ==========================================
// SECURITY ALERTS
// ==========================================

export type SecurityAlertType = 
  | 'suspicious_login'
  | 'brute_force'
  | 'unauthorized_access'
  | 'data_breach'
  | 'policy_violation'
  | 'anomaly_detected'
  | 'rate_limit_exceeded';

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';
export type SecurityAlertStatus = 'open' | 'investigating' | 'resolved' | 'false_positive';

export interface SecurityAlert {
  id: string;
  organization_id: string;
  alert_type: string;
  severity: string;
  status: string | null;
  title: string;
  description: string | null;
  source: string | null;
  source_ip: string | null;
  user_id: string | null;
  resource_type: string | null;
  resource_id: string | null;
  evidence: Json | null;
  actions_taken: Json | null;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  created_at: string | null;
}

export interface SecurityStats {
  total_alerts: number;
  open_alerts: number;
  critical_alerts: number;
  resolved_today: number;
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
}

// ==========================================
// COMPLIANCE CHECKS
// ==========================================

export type ComplianceFramework = 
  | 'gdpr'
  | 'ccpa'
  | 'hipaa'
  | 'soc2'
  | 'iso27001'
  | 'pci_dss'
  | 'internal';

export type ComplianceStatus = 
  | 'compliant'
  | 'non_compliant'
  | 'partial'
  | 'pending_review'
  | 'not_applicable';

export interface ComplianceCheck {
  id: string;
  organization_id: string;
  framework: string;
  check_code: string;
  check_name: string;
  check_description: string | null;
  category: string | null;
  status: string;
  owner_id: string | null;
  evidence_notes: string | null;
  evidence_documents: string[] | null;
  remediation_plan: string | null;
  remediation_due_date: string | null;
  last_checked_at: string | null;
  next_review_at: string | null;
  created_at: string | null;
  updated_at: string | null;
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
