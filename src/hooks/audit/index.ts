// ============================================================
// IP-NEXUS - AUDIT HOOKS INDEX
// ============================================================

// Audit Logs
export {
  useAuditLogs,
  useAuditLog,
  useResourceHistory,
  useChangeHistory,
  useFieldHistory,
  useAuditStats,
  useExportAuditLogs,
} from './useAuditLogs';

// Access Logs
export {
  useAccessLogs,
  useUserAccessLogs,
  useFailedLogins,
  useAccessStats,
  useLogAccessEvent,
} from './useAccessLogs';

// Retention Policies
export {
  useRetentionPolicies,
  useRetentionPolicy,
  useCreateRetentionPolicy,
  useUpdateRetentionPolicy,
  useDeleteRetentionPolicy,
  useSetLegalHold,
  useRetentionExecutions,
  useExecuteRetentionPolicy,
} from './useRetentionPolicies';

// GDPR
export {
  useGdprRequests,
  useGdprRequest,
  useCreateGdprRequest,
  useUpdateGdprRequest,
  useProcessGdprRequest,
  useVerifyGdprIdentity,
  useUserConsents,
  useUpdateConsent,
  useDataExports,
  useCreateDataExport,
  useGdprStats,
} from './useGdpr';

// Security Alerts
export {
  useSecurityAlerts,
  useSecurityAlert,
  useOpenAlerts,
  useCriticalAlerts,
  useCreateSecurityAlert,
  useUpdateSecurityAlert,
  useResolveSecurityAlert,
  useEscalateSecurityAlert,
  useSecurityStats,
} from './useSecurityAlerts';

// Compliance Checks
export {
  useComplianceChecks,
  useComplianceCheck,
  usePendingReviewChecks,
  useNonCompliantChecks,
  useCreateComplianceCheck,
  useUpdateComplianceCheck,
  useDeleteComplianceCheck,
  useRunComplianceCheck,
  useComplianceStats,
} from './useComplianceChecks';
