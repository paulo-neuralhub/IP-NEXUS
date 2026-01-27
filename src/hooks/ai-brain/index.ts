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

export { useDiscoverAIModels } from './useAIModelDiscovery';

// FinOps
export { useAIFinOpsDashboard } from './useAIFinOps';

// Budgets (Phase 3)
export {
  useAIBudgets,
  useAIBudgetAlerts,
  useAIBudgetSummary,
  useAICostHistory,
  useCreateAIBudget,
  useUpdateAIBudget,
  useDeleteAIBudget,
  useAcknowledgeAlert,
  useCheckBudget,
  useEstimateCost,
} from './useAIBudgets';

// Health Monitor
export {
  useProviderHealthStats,
  useProviderHealthLog,
  useToggleCircuitBreaker,
  useResetProviderHealth,
  useReportExecution,
  useHealthSummary,
} from './useAIHealthMonitor';

// Routing Simulator
export {
  useTaskRouting,
  useSimulateModelSelection,
  useAllTasksRouting,
} from './useAIRoutingSimulator';

// Test Suites & Evaluation (Phase 5)
export {
  useAITestSuites,
  useAITestSuite,
  useCreateTestSuite,
  useUpdateTestSuite,
  useDeleteTestSuite,
  useAITestCases,
  useCreateTestCase,
  useUpdateTestCase,
  useDeleteTestCase,
  useAITestRuns,
  useStartTestRun,
  useCompleteTestRun,
  useAITestResults,
  useCheckQualityGate,
} from './useAITestSuites';

// Prompts Studio (Phase 4)
export {
  useAIPrompts,
  useAIPrompt,
  useAIPromptVersions,
  useAIPromptChanges,
  useAIPromptComments,
  useCreateAIPrompt,
  useUpdateAIPrompt,
  useDeleteAIPrompt,
  useChangePromptStatus,
  useCreatePromptVersion,
  useComparePromptVersions,
  useAddPromptComment,
  useResolvePromptComment,
} from './useAIPrompts';

export type {
  AIPrompt,
  AIPromptFormData,
  PromptVariable,
  AIPromptChange,
  AIPromptComment,
} from './useAIPrompts';

// RAG Knowledge Bases (Phase 6)
export {
  useRAGKnowledgeBases,
  useRAGKnowledgeBase,
  useRAGDocuments,
  useCreateRAGKnowledgeBase,
  useUpdateRAGKnowledgeBase,
  useDeleteRAGKnowledgeBase,
  useCreateRAGDocument,
  useDeleteRAGDocument,
  useProcessRAGDocument,
  useRAGQueryStats,
} from './useRAGKnowledgeBases';

export type {
  RAGKnowledgeBase,
  RAGDocument,
  RAGKnowledgeBaseFormData,
  RAGDocumentFormData,
} from './useRAGKnowledgeBases';

