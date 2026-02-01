// ============================================================
// IP-NEXUS - JURISDICTION HOOKS
// Data fetching hooks for jurisdiction system
// ============================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import type { 
  Jurisdiction, 
  JurisdictionFieldConfig, 
  JurisdictionFilters,
  JurisdictionFieldOption,
  GroupedJurisdictionFields 
} from '@/types/jurisdiction';

// ============================================================
// FETCH ALL JURISDICTIONS
// ============================================================

export function useJurisdictions(filters?: JurisdictionFilters) {
  return useQuery({
    queryKey: ['jurisdictions', filters],
    queryFn: async () => {
      let query = supabase
        .from('jurisdictions')
        .select('*')
        .order('tier')
        .order('sort_order')
        .order('name');

      // Apply filters
      if (filters?.active !== undefined) {
        query = query.eq('is_active', filters.active);
      } else {
        query = query.eq('is_active', true);
      }

      if (filters?.types?.length) {
        query = query.in('jurisdiction_type', filters.types);
      }
      
      if (filters?.tiers?.length) {
        query = query.in('tier', filters.tiers);
      }
      
      if (filters?.regions?.length) {
        query = query.in('region', filters.regions);
      }
      
      if (filters?.madridMember) {
        query = query.eq('is_madrid_member', true);
      }
      
      if (filters?.pctMember) {
        query = query.eq('is_pct_member', true);
      }
      
      if (filters?.hagueMember) {
        query = query.eq('is_hague_member', true);
      }
      
      if (filters?.supportsTrademarks) {
        query = query.eq('supports_trademarks', true);
      }
      
      if (filters?.supportsPatents) {
        query = query.eq('supports_patents', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Jurisdiction[];
    },
    staleTime: 10 * 60 * 1000, // 10 min cache
  });
}

// ============================================================
// FETCH SINGLE JURISDICTION
// ============================================================

export function useJurisdiction(idOrCode?: string) {
  return useQuery({
    queryKey: ['jurisdiction', idOrCode],
    queryFn: async () => {
      if (!idOrCode) return null;
      
      // Try by code first (more common), then by id
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrCode);
      
      const { data, error } = await supabase
        .from('jurisdictions')
        .select('*')
        .eq(isUUID ? 'id' : 'code', idOrCode)
        .maybeSingle();

      if (error) throw error;
      return data as Jurisdiction | null;
    },
    enabled: !!idOrCode,
    staleTime: 10 * 60 * 1000,
  });
}

// ============================================================
// FETCH JURISDICTION FIELDS
// ============================================================

// Helper to parse field_options from Json
function parseFieldOptions(options: Json | null): JurisdictionFieldOption[] | null {
  if (!options || !Array.isArray(options)) return null;
  return options.map(opt => ({
    value: String((opt as Record<string, unknown>).value ?? ''),
    label: String((opt as Record<string, unknown>).label ?? ''),
  }));
}

export function useJurisdictionFields(
  jurisdictionId?: string, 
  rightType?: string
) {
  return useQuery({
    queryKey: ['jurisdiction-fields', jurisdictionId, rightType],
    queryFn: async () => {
      if (!jurisdictionId || !rightType) return [];

      const { data, error } = await supabase
        .from('jurisdiction_field_configs')
        .select('*')
        .eq('jurisdiction_id', jurisdictionId)
        .eq('right_type', rightType)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      
      // Map the data to proper types
      return (data || []).map(row => ({
        ...row,
        field_options: parseFieldOptions(row.field_options),
      })) as JurisdictionFieldConfig[];
    },
    enabled: !!jurisdictionId && !!rightType,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================
// FETCH JURISDICTION FIELDS BY CODE
// ============================================================

export function useJurisdictionFieldsByCode(
  jurisdictionCode?: string, 
  rightType?: string
) {
  // First get the jurisdiction ID
  const { data: jurisdiction } = useJurisdiction(jurisdictionCode);
  
  return useQuery({
    queryKey: ['jurisdiction-fields-by-code', jurisdictionCode, rightType],
    queryFn: async () => {
      if (!jurisdiction?.id || !rightType) return [];

      const { data, error } = await supabase
        .from('jurisdiction_field_configs')
        .select('*')
        .eq('jurisdiction_id', jurisdiction.id)
        .eq('right_type', rightType)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      
      // Map the data to proper types
      return (data || []).map(row => ({
        ...row,
        field_options: parseFieldOptions(row.field_options),
      })) as JurisdictionFieldConfig[];
    },
    enabled: !!jurisdiction?.id && !!rightType,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================
// GROUP FIELDS BY FIELD_GROUP
// ============================================================

export function groupFieldsByGroup(
  fields: JurisdictionFieldConfig[]
): GroupedJurisdictionFields {
  return fields.reduce((acc, field) => {
    const group = field.field_group || 'general';
    if (!acc[group]) acc[group] = [];
    acc[group].push(field);
    return acc;
  }, {} as GroupedJurisdictionFields);
}

// ============================================================
// FETCH MADRID MEMBER COUNTRIES
// ============================================================

export function useMadridMembers() {
  return useJurisdictions({ 
    madridMember: true, 
    types: ['country'] 
  });
}

// ============================================================
// FETCH PCT MEMBER COUNTRIES
// ============================================================

export function usePctMembers() {
  return useJurisdictions({ 
    pctMember: true, 
    types: ['country'] 
  });
}

// ============================================================
// POPULAR JURISDICTIONS (Tier 1)
// ============================================================

export function usePopularJurisdictions() {
  return useJurisdictions({ tiers: [1] });
}

// ============================================================
// JURISDICTION LOOKUP MAP
// ============================================================

export function useJurisdictionMap() {
  const { data: jurisdictions = [] } = useJurisdictions();
  
  return {
    byCode: new Map(jurisdictions.map(j => [j.code, j])),
    byId: new Map(jurisdictions.map(j => [j.id, j])),
    getByCode: (code: string) => jurisdictions.find(j => j.code === code),
    getById: (id: string) => jurisdictions.find(j => j.id === id),
  };
}
