// src/services/search-service.ts
import { supabase } from '@/integrations/supabase/client';

export interface SearchOptions {
  query: string;
  entityTypes?: string[];
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  entity_type: string;
  entity_id: string;
  title: string;
  subtitle: string;
  metadata: Record<string, any>;
  rank: number;
  highlight?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  facets: Record<string, number>;
  total: number;
  query: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  query: string;
  filters: Record<string, any>;
  entity_types: string[];
  is_shared: boolean;
  alert_enabled: boolean;
  alert_frequency?: string;
  use_count: number;
  is_pinned: boolean;
  created_at: string;
}

export interface RecentSearch {
  query: string;
  filters: Record<string, any>;
  entity_types: string[];
  total_results: number;
  created_at: string;
}

// ==========================================
// MAIN SEARCH
// ==========================================

export async function searchAll(
  organizationId: string,
  options: SearchOptions
): Promise<SearchResponse> {
  const { query, entityTypes, filters = {}, limit = 20, offset = 0 } = options;

  if (!query || query.length < 2) {
    return { results: [], facets: {}, total: 0, query };
  }

  // Execute search
  const { data: results, error } = await supabase.rpc('search_all', {
    p_organization_id: organizationId,
    p_query: query,
    p_entity_types: entityTypes || null,
    p_filters: filters,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) {
    console.error('Search error:', error);
    throw error;
  }

  // Get facets
  const { data: facetData } = await supabase.rpc('search_facets', {
    p_organization_id: organizationId,
    p_query: query,
  });

  const facets: Record<string, number> = {};
  for (const f of facetData || []) {
    facets[f.entity_type] = Number(f.count);
  }

  const total = Object.values(facets).reduce((a, b) => a + b, 0);

  // Map results to correct types
  const mappedResults: SearchResult[] = (results || []).map((r: any) => ({
    entity_type: r.entity_type,
    entity_id: r.entity_id,
    title: r.title,
    subtitle: r.subtitle,
    metadata: typeof r.metadata === 'object' ? r.metadata : {},
    rank: r.rank,
    highlight: r.highlight,
  }));

  return {
    results: mappedResults,
    facets,
    total,
    query,
  };
}

// ==========================================
// QUICK SEARCH (Command Palette)
// ==========================================

export async function quickSearch(
  organizationId: string,
  query: string,
  userId: string
): Promise<{
  results: SearchResult[];
  recent: RecentSearch[];
  actions: QuickAction[];
}> {
  // If query is empty, show recent and actions
  if (!query || query.length < 2) {
    const recent = await getRecentSearches(userId, organizationId, 5);
    const actions = getQuickActions();
    return { results: [], recent, actions };
  }

  // Quick search with low limit
  const { results } = await searchAll(organizationId, { query, limit: 8 });

  return {
    results,
    recent: [],
    actions: getContextualActions(query),
  };
}

// ==========================================
// SAVED SEARCHES
// ==========================================

export async function saveSearch(
  organizationId: string,
  userId: string,
  data: {
    name: string;
    description?: string;
    query: string;
    filters: Record<string, any>;
    entityTypes: string[];
    alertEnabled?: boolean;
    alertFrequency?: string;
  }
): Promise<string> {
  const { data: saved, error } = await supabase
    .from('saved_searches')
    .insert({
      organization_id: organizationId,
      user_id: userId,
      name: data.name,
      description: data.description,
      query: data.query,
      filters: data.filters,
      entity_types: data.entityTypes,
      alert_enabled: data.alertEnabled || false,
      alert_frequency: data.alertFrequency,
    })
    .select()
    .single();

  if (error) throw error;
  return saved.id;
}

export async function getSavedSearches(
  organizationId: string,
  userId: string
): Promise<SavedSearch[]> {
  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('organization_id', organizationId)
    .or(`user_id.eq.${userId},is_shared.eq.true`)
    .order('is_pinned', { ascending: false })
    .order('use_count', { ascending: false });

  if (error) throw error;
  return (data || []) as SavedSearch[];
}

export async function deleteSavedSearch(
  savedSearchId: string,
  userId: string
): Promise<void> {
  await supabase
    .from('saved_searches')
    .delete()
    .eq('id', savedSearchId)
    .eq('user_id', userId);
}

export async function updateSavedSearchUsage(savedSearchId: string): Promise<void> {
  const { data: saved } = await supabase
    .from('saved_searches')
    .select('use_count')
    .eq('id', savedSearchId)
    .single();

  if (saved) {
    await supabase
      .from('saved_searches')
      .update({
        use_count: (saved.use_count || 0) + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', savedSearchId);
  }
}

// ==========================================
// SEARCH HISTORY
// ==========================================

export async function logSearch(
  organizationId: string,
  userId: string,
  query: string,
  filters: Record<string, any>,
  entityTypes: string[],
  totalResults: number,
  source: string
): Promise<void> {
  await supabase.from('search_history').insert({
    organization_id: organizationId,
    user_id: userId,
    query,
    filters,
    entity_types: entityTypes,
    total_results: totalResults,
    source,
  });
}

export async function getRecentSearches(
  userId: string,
  organizationId: string,
  limit: number = 10
): Promise<RecentSearch[]> {
  const { data } = await supabase
    .from('search_history')
    .select('query, filters, entity_types, total_results, created_at')
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(limit * 2); // Get more to remove duplicates

  // Remove duplicates
  const seen = new Set<string>();
  const unique: RecentSearch[] = [];
  for (const item of data || []) {
    const key = item.query.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item as RecentSearch);
    }
    if (unique.length >= limit) break;
  }

  return unique;
}

export async function clearSearchHistory(
  userId: string,
  organizationId: string
): Promise<void> {
  await supabase
    .from('search_history')
    .delete()
    .eq('user_id', userId)
    .eq('organization_id', organizationId);
}

// ==========================================
// QUICK ACTIONS
// ==========================================

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  action: string;
}

function getQuickActions(): QuickAction[] {
  return [
    { id: 'new_matter', label: 'Nuevo Expediente', icon: 'file-plus', shortcut: 'N', action: '/app/docket/new' },
    { id: 'new_contact', label: 'Nuevo Contacto', icon: 'user-plus', shortcut: 'C', action: '/app/crm/contacts?new=true' },
    { id: 'new_deal', label: 'Nuevo Deal', icon: 'handshake', shortcut: 'D', action: '/app/crm/deals?new=true' },
    { id: 'search_page', label: 'Búsqueda Avanzada', icon: 'search', action: '/app/search' },
  ];
}

function getContextualActions(query: string): QuickAction[] {
  const actions: QuickAction[] = [];
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('new') || lowerQuery.includes('nuevo') || lowerQuery.includes('crear')) {
    actions.push(...getQuickActions().slice(0, 3));
  }

  if (lowerQuery.includes('exp') || lowerQuery.includes('venc') || lowerQuery.includes('renov')) {
    actions.push({
      id: 'expiring',
      label: 'Ver próximos a vencer',
      icon: 'calendar-clock',
      action: '/app/docket?status=expiring',
    });
  }

  return actions;
}

// ==========================================
// ENTITY-SPECIFIC SEARCH
// ==========================================

export async function searchMatters(
  organizationId: string,
  query: string,
  filters: {
    type?: string[];
    status?: string[];
    jurisdiction?: string[];
  } = {},
  pagination = { limit: 20, offset: 0 }
): Promise<{ results: any[]; total: number }> {
  let queryBuilder = supabase
    .from('matters')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId);

  if (query) {
    queryBuilder = queryBuilder.textSearch('search_vector', query, {
      type: 'websearch',
      config: 'spanish',
    });
  }

  if (filters.type?.length) {
    queryBuilder = queryBuilder.in('type', filters.type);
  }
  if (filters.status?.length) {
    queryBuilder = queryBuilder.in('status', filters.status);
  }
  if (filters.jurisdiction?.length) {
    queryBuilder = queryBuilder.in('jurisdiction_code', filters.jurisdiction);
  }

  queryBuilder = queryBuilder
    .range(pagination.offset, pagination.offset + pagination.limit - 1)
    .order('updated_at', { ascending: false });

  const { data, count, error } = await queryBuilder;

  if (error) throw error;

  return { results: data || [], total: count || 0 };
}

export async function searchContacts(
  organizationId: string,
  query: string,
  filters: {
    type?: string[];
    country?: string[];
    tags?: string[];
  } = {},
  pagination = { limit: 20, offset: 0 }
): Promise<{ results: any[]; total: number }> {
  let queryBuilder = supabase
    .from('contacts')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId);

  if (query) {
    queryBuilder = queryBuilder.textSearch('search_vector', query, {
      type: 'websearch',
      config: 'spanish',
    });
  }

  if (filters.type?.length) {
    queryBuilder = queryBuilder.in('type', filters.type);
  }
  if (filters.country?.length) {
    queryBuilder = queryBuilder.in('country', filters.country);
  }
  if (filters.tags?.length) {
    queryBuilder = queryBuilder.overlaps('tags', filters.tags);
  }

  queryBuilder = queryBuilder
    .range(pagination.offset, pagination.offset + pagination.limit - 1)
    .order('name', { ascending: true });

  const { data, count, error } = await queryBuilder;

  if (error) throw error;

  return { results: data || [], total: count || 0 };
}
