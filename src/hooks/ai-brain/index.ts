// ============================================================
// IP-NEXUS AI BRAIN - HOOKS INDEX
// ============================================================

// Combined hooks for easy consumption (recommended)
export { 
  useAIProviders,
  useAIModels,
  useAITaskAssignments,
  useAICircuitBreaker,
  useAIRAGCollections,
  useAIAnalytics,
} from './useCombinedHooks';

// Individual hooks for granular control
export { 
  useAIProviders as useAIProvidersQuery,
  useAIProvider,
  useCreateAIProvider,
  useUpdateAIProvider,
  useDeleteAIProvider,
  useTestAIProvider,
  useUpdateProviderHealth,
} from './useAIProviders';

export {
  useAIModels as useAIModelsQuery,
  useActiveAIModels,
  useAIModel,
  useCreateAIModel,
  useUpdateAIModel,
  useDeleteAIModel,
  useToggleModelActive,
} from './useAIModels';

export {
  useAITaskAssignments as useAITaskAssignmentsQuery,
  useAITaskAssignment,
  useCreateAITaskAssignment,
  useUpdateAITaskAssignment,
  useDeleteAITaskAssignment,
  useToggleTaskActive,
} from './useAITaskAssignments';

export {
  useAICircuitBreakerStates,
  useAICircuitBreakerState,
  useResetCircuitBreaker,
  useForceOpenCircuit,
  useUpdateCircuitConfig,
} from './useAICircuitBreaker';

export {
  useAIRAGCollections as useAIRAGCollectionsQuery,
  useActiveAIRAGCollections,
  useAIRAGCollection,
  useCreateAIRAGCollection,
  useUpdateAIRAGCollection,
  useDeleteAIRAGCollection,
  useToggleRAGActive,
  useRefreshRAGCollection,
} from './useAIRAGCollections';

export {
  useAIUsageAggregates,
  useAIAnalyticsSummary,
  useAITopConsumers,
} from './useAIAnalytics';

export {
  useAIRequestLogs,
  useRecentAIErrors,
  useAIRequestLogStats,
} from './useAIRequestLogs';
