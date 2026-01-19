// src/hooks/use-search.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import {
  searchAll,
  quickSearch,
  getSavedSearches,
  saveSearch,
  deleteSavedSearch,
  getRecentSearches,
  clearSearchHistory,
  logSearch,
  type SearchOptions,
  type SearchResponse,
  type SavedSearch,
  type RecentSearch,
  type QuickAction,
} from '@/services/search-service';
import { toast } from 'sonner';

// ==========================================
// GLOBAL SEARCH
// ==========================================

export function useSearch(organizationId: string, options: SearchOptions) {
  return useQuery({
    queryKey: ['search', organizationId, options.query, options.entityTypes, options.filters],
    queryFn: () => searchAll(organizationId, options),
    enabled: !!organizationId && !!options.query && options.query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ==========================================
// QUICK SEARCH (Command Palette)
// ==========================================

export function useQuickSearch(organizationId: string, query: string, userId: string) {
  return useQuery({
    queryKey: ['quick-search', organizationId, query],
    queryFn: () => quickSearch(organizationId, query, userId),
    enabled: !!organizationId && !!userId,
    staleTime: 10 * 1000,
  });
}

// ==========================================
// SAVED SEARCHES
// ==========================================

export function useSavedSearches(organizationId: string, userId: string) {
  return useQuery({
    queryKey: ['saved-searches', organizationId, userId],
    queryFn: () => getSavedSearches(organizationId, userId),
    enabled: !!organizationId && !!userId,
  });
}

export function useSaveSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      organizationId: string;
      userId: string;
      data: {
        name: string;
        description?: string;
        query: string;
        filters: Record<string, any>;
        entityTypes: string[];
        alertEnabled?: boolean;
        alertFrequency?: string;
      };
    }) => {
      return saveSearch(params.organizationId, params.userId, params.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
      toast.success('Búsqueda guardada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al guardar búsqueda');
    },
  });
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { savedSearchId: string; userId: string }) => {
      return deleteSavedSearch(params.savedSearchId, params.userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
      toast.success('Búsqueda eliminada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar búsqueda');
    },
  });
}

// ==========================================
// SEARCH HISTORY
// ==========================================

export function useRecentSearches(userId: string, organizationId: string, limit: number = 10) {

  return useQuery({
    queryKey: ['recent-searches', organizationId, userId, limit],
    queryFn: () => getRecentSearches(userId, organizationId, limit),
    enabled: !!organizationId && !!userId,
  });
}

export function useLogSearch() {
  return useMutation({
    mutationFn: async (data: {
      organizationId: string;
      userId: string;
      query: string;
      filters: Record<string, any>;
      entityTypes: string[];
      totalResults: number;
      source: string;
    }) => {
      if (!data.organizationId || !data.userId) return;
      return logSearch(
        data.organizationId,
        data.userId,
        data.query,
        data.filters,
        data.entityTypes,
        data.totalResults,
        data.source
      );
    },
  });
}

export function useClearSearchHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { userId: string; organizationId: string }) => {
      return clearSearchHistory(params.userId, params.organizationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-searches'] });
      toast.success('Historial borrado');
    },
  });
}
