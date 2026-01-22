// ============================================================
// IP-NEXUS AI BRAIN - COMBINED HOOKS FOR EASY CONSUMPTION
// ============================================================

import { 
  useAIProviders as useAIProvidersQuery,
  useCreateAIProvider,
  useUpdateAIProvider,
  useDeleteAIProvider,
  useTestAIProvider,
} from './useAIProviders';

import {
  useAIModels as useAIModelsQuery,
  useCreateAIModel,
  useUpdateAIModel,
  useDeleteAIModel,
  useToggleModelActive,
} from './useAIModels';

import { useDiscoverAIModels } from './useAIModelDiscovery';

import {
  useAITaskAssignments as useAITaskAssignmentsQuery,
  useCreateAITaskAssignment,
  useUpdateAITaskAssignment,
  useDeleteAITaskAssignment,
  useToggleTaskActive,
} from './useAITaskAssignments';

import {
  useAICircuitBreakerStates,
  useResetCircuitBreaker,
  useForceOpenCircuit,
  useUpdateCircuitConfig,
} from './useAICircuitBreaker';

import {
  useAIRAGCollections as useAIRAGCollectionsQuery,
  useCreateAIRAGCollection,
  useUpdateAIRAGCollection,
  useDeleteAIRAGCollection,
  useToggleRAGActive,
  useRefreshRAGCollection,
} from './useAIRAGCollections';

import {
  useAIAnalyticsSummary,
  useAIUsageAggregates,
  useAITopConsumers,
} from './useAIAnalytics';

// Combined Providers Hook
export function useAIProviders() {
  const query = useAIProvidersQuery();
  const createProvider = useCreateAIProvider();
  const updateProvider = useUpdateAIProvider();
  const deleteProvider = useDeleteAIProvider();
  const testProvider = useTestAIProvider();

  return {
    providers: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createProvider,
    updateProvider,
    deleteProvider,
    testProvider,
  };
}

// Combined Models Hook
export function useAIModels(providerId?: string) {
  const query = useAIModelsQuery(providerId);
  const createModel = useCreateAIModel();
  const updateModel = useUpdateAIModel();
  const deleteModel = useDeleteAIModel();
  const toggleActive = useToggleModelActive();
  const discoverModels = useDiscoverAIModels();

  return {
    models: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createModel,
    updateModel,
    deleteModel,
    toggleActive,
    discoverModels,
  };
}

// Combined Task Assignments Hook
export function useAITaskAssignments() {
  const query = useAITaskAssignmentsQuery();
  const createTask = useCreateAITaskAssignment();
  const updateTask = useUpdateAITaskAssignment();
  const deleteTask = useDeleteAITaskAssignment();
  const toggleTaskActive = useToggleTaskActive();

  return {
    tasks: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskActive,
  };
}

// Combined Circuit Breaker Hook
export function useAICircuitBreaker() {
  const query = useAICircuitBreakerStates();
  const resetCircuit = useResetCircuitBreaker();
  const forceOpenCircuit = useForceOpenCircuit();
  const updateConfig = useUpdateCircuitConfig();

  return {
    circuitStates: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    resetCircuit,
    forceOpenCircuit,
    updateConfig,
  };
}

// Combined RAG Collections Hook
export function useAIRAGCollections() {
  const query = useAIRAGCollectionsQuery();
  const createRAG = useCreateAIRAGCollection();
  const updateRAG = useUpdateAIRAGCollection();
  const deleteRAG = useDeleteAIRAGCollection();
  const toggleRAGActive = useToggleRAGActive();
  const refreshRAG = useRefreshRAGCollection();

  return {
    ragCollections: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createRAG,
    updateRAG,
    deleteRAG,
    toggleRAGActive,
    refreshRAG,
  };
}

// Combined Analytics Hook
export function useAIAnalytics(filters?: { startDate?: Date; endDate?: Date; organizationId?: string }) {
  const summaryQuery = useAIAnalyticsSummary(filters);
  const aggregatesQuery = useAIUsageAggregates(filters);
  const topConsumersQuery = useAITopConsumers(filters);

  return {
    summary: summaryQuery.data || null,
    aggregates: aggregatesQuery.data || [],
    topConsumers: topConsumersQuery.data || [],
    isLoading: summaryQuery.isLoading || aggregatesQuery.isLoading || topConsumersQuery.isLoading,
    isError: summaryQuery.isError || aggregatesQuery.isError || topConsumersQuery.isError,
    refetch: () => {
      summaryQuery.refetch();
      aggregatesQuery.refetch();
      topConsumersQuery.refetch();
    },
  };
}
