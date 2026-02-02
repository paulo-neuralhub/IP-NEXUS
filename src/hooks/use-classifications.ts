// ============================================================
// IP-NEXUS - CLASSIFICATION HOOKS
// Unified hooks for Nice, IPC, Locarno, Vienna classifications
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============================================================
// TYPES
// ============================================================

// Nice Class - matches actual DB schema
export interface NiceClass {
  id: string;
  class_number: number;
  class_type: string;
  title_es: string | null;
  title_en: string;
  explanatory_note_es: string | null;
  explanatory_note_en: string | null;
  includes_en: string[] | null;
  includes_es: string[] | null;
  excludes_en: string[] | null;
  excludes_es: string[] | null;
  version_id: string | null;
}

export interface NiceProduct {
  id: string;
  class_number: number;
  name_es: string;
  name_en: string | null;
  is_common: boolean;
  is_active?: boolean;
  wipo_code: string | null;
}

// Nice search result - matches actual RPC return type
export interface NiceSearchResult {
  item_id: string;
  class_number: number;
  class_title: string;
  class_type: string;
  item_code: string;
  item_name_en: string;
  is_generic_term: boolean;
  similarity: number;
}

export interface IPCSection {
  id: string;
  code: string;
  title_es: string;
  title_en: string | null;
  description_es: string | null;
}

export interface IPCClass {
  id: string;
  section_id: string;
  code: string;
  title_es: string;
  title_en: string | null;
}

export interface IPCSubclass {
  id: string;
  class_id: string;
  code: string;
  title_es: string;
  title_en: string | null;
  definition_es: string | null;
}

export interface IPCGroup {
  id: string;
  subclass_id: string;
  code: string;
  title_es: string;
  title_en: string | null;
  is_main_group: boolean;
  hierarchy_level: number;
}

export interface IPCSearchResult {
  id: string;
  full_code: string;
  section_code: string;
  class_code: string;
  subclass_code: string;
  title: string;
  relevance: number;
}

export interface LocarnoClass {
  id: string;
  class_number: number;
  title_es: string;
  title_en: string | null;
  note_es: string | null;
}

export interface LocarnoSearchResult {
  id: string;
  class_number: number;
  class_title: string;
  subclass_code: string;
  item_number: string;
  term: string;
  relevance: number;
}

export interface ViennaCategory {
  id: string;
  code: string;
  title_es: string;
  title_en: string | null;
}

export interface ViennaSearchResult {
  id: string;
  category_code: string;
  category_title: string;
  division_code: string;
  section_code: string;
  title: string;
  relevance: number;
}

export interface ClassificationSystem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  current_version: string;
  version_date: string;
  source_url: string;
  last_sync_at: string | null;
  is_active: boolean;
}

// ============================================================
// NICE CLASSIFICATION HOOKS
// ============================================================

export function useNiceClasses() {
  return useQuery({
    queryKey: ['nice-classes'],
    queryFn: async (): Promise<NiceClass[]> => {
      const { data, error } = await supabase
        .from('nice_classes')
        .select('*')
        .order('class_number', { ascending: true });
      
      if (error) throw error;
      return (data || []) as unknown as NiceClass[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour - data is static
  });
}

export function useNiceProducts(classNumber?: number) {
  return useQuery({
    queryKey: ['nice-products', classNumber],
    queryFn: async (): Promise<NiceProduct[]> => {
      let query = supabase
        .from('nice_products')
        .select('*')
        .eq('is_active', true)
        .order('is_common', { ascending: false })
        .order('name_es', { ascending: true });
      
      if (classNumber) {
        query = query.eq('class_number', classNumber);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useNiceSearch(query: string, classNumbers?: number[]) {
  return useQuery({
    queryKey: ['nice-search', query, classNumbers],
    queryFn: async (): Promise<NiceSearchResult[]> => {
      if (!query || query.length < 2) return [];
      
      const { data, error } = await supabase.rpc('search_nice_items', {
        p_search_term: query,
        p_limit: 50,
      });
      
      if (error) throw error;
      return (data || []) as unknown as NiceSearchResult[];
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes for search results
  });
}

// ============================================================
// IPC CLASSIFICATION HOOKS
// ============================================================

export function useIPCSections() {
  return useQuery({
    queryKey: ['ipc-sections'],
    queryFn: async (): Promise<IPCSection[]> => {
      const { data, error } = await supabase
        .from('ipc_sections')
        .select('*')
        .eq('is_active', true)
        .order('code');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useIPCClasses(sectionCode?: string) {
  return useQuery({
    queryKey: ['ipc-classes', sectionCode],
    queryFn: async (): Promise<IPCClass[]> => {
      let query = supabase
        .from('ipc_classes')
        .select(`
          *,
          section:ipc_sections!inner(code)
        `)
        .eq('is_active', true)
        .order('code');
      
      if (sectionCode) {
        query = query.eq('section.code', sectionCode);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useIPCSearch(query: string, sectionCode?: string) {
  return useQuery({
    queryKey: ['ipc-search', query, sectionCode],
    queryFn: async (): Promise<IPCSearchResult[]> => {
      if (!query || query.length < 2) return [];
      
      const { data, error } = await supabase.rpc('search_ipc_groups', {
        p_query: query,
        p_section: sectionCode || null,
        p_limit: 50,
      });
      
      if (error) throw error;
      return (data || []) as IPCSearchResult[];
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================================
// LOCARNO CLASSIFICATION HOOKS
// ============================================================

export function useLocarnoClasses() {
  return useQuery({
    queryKey: ['locarno-classes'],
    queryFn: async (): Promise<LocarnoClass[]> => {
      const { data, error } = await supabase
        .from('locarno_classes')
        .select('*')
        .eq('is_active', true)
        .order('class_number');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useLocarnoSearch(query: string, classNumber?: number) {
  return useQuery({
    queryKey: ['locarno-search', query, classNumber],
    queryFn: async (): Promise<LocarnoSearchResult[]> => {
      if (!query || query.length < 2) return [];
      
      const { data, error } = await supabase.rpc('search_locarno_items', {
        p_query: query,
        p_class_number: classNumber || null,
        p_limit: 50,
      });
      
      if (error) throw error;
      return (data || []) as LocarnoSearchResult[];
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================================
// VIENNA CLASSIFICATION HOOKS
// ============================================================

export function useViennaCategories() {
  return useQuery({
    queryKey: ['vienna-categories'],
    queryFn: async (): Promise<ViennaCategory[]> => {
      const { data, error } = await supabase
        .from('vienna_categories')
        .select('*')
        .eq('is_active', true)
        .order('code');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useViennaSearch(query: string, categoryCode?: string) {
  return useQuery({
    queryKey: ['vienna-search', query, categoryCode],
    queryFn: async (): Promise<ViennaSearchResult[]> => {
      if (!query || query.length < 2) return [];
      
      const { data, error } = await supabase.rpc('search_vienna_sections', {
        p_query: query,
        p_category_code: categoryCode || null,
        p_limit: 50,
      });
      
      if (error) throw error;
      return (data || []) as ViennaSearchResult[];
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================================
// CLASSIFICATION SYSTEM HOOKS
// ============================================================

export function useClassificationSystems() {
  return useQuery({
    queryKey: ['classification-systems'],
    queryFn: async (): Promise<ClassificationSystem[]> => {
      const { data, error } = await supabase
        .from('classification_systems')
        .select('*')
        .eq('is_active', true)
        .order('code');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useSyncClassifications() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: { system: string; action: string }) => {
      const { data, error } = await supabase.functions.invoke('wipo-sync', {
        body: params,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate all classification queries
      queryClient.invalidateQueries({ queryKey: ['nice-classes'] });
      queryClient.invalidateQueries({ queryKey: ['ipc-sections'] });
      queryClient.invalidateQueries({ queryKey: ['locarno-classes'] });
      queryClient.invalidateQueries({ queryKey: ['vienna-categories'] });
      queryClient.invalidateQueries({ queryKey: ['classification-systems'] });
    },
  });
}
