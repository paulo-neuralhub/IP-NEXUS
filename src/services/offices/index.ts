// =====================================================
// IP OFFICES CONNECTION - Service exports
// =====================================================

export * from './types';

// Re-export hooks for convenience
export { 
  useIpOffices, 
  useIpOffice, 
  useStatusMappings,
  useNormalizeStatus,
  useOfficialFees,
  useCalculateFees,
  useTenantSyncConfig,
  useUpdateSyncConfig,
  useSyncHistory,
  useFileImports,
  useUploadFileImport,
  useReviewQueue,
  useApproveReviewItem,
  useRejectReviewItem,
  useOfficeDocuments,
} from '@/hooks/useIpOffices';

export {
  useOfficeStatus,
  useBatchStatusCheck,
} from '@/hooks/useOfficeStatus';
