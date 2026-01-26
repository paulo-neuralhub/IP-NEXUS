// ============================================================
// IP-NEXUS - LEGAL DEADLINES HOOK
// Read-only reference for official IP deadlines by jurisdiction
// ============================================================

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LegalDeadline {
  id: string;
  code: string;
  name: string;
  name_en: string | null;
  description: string | null;
  office_id: string | null;
  right_type: string;
  deadline_category: string;
  trigger_event: string;
  days_offset: number | null;
  months_offset: number | null;
  years_offset: number | null;
  is_before_event: boolean | null;
  business_days_only: boolean | null;
  grace_period_days: number | null;
  grace_period_months: number | null;
  grace_has_surcharge: boolean | null;
  window_start_months: number | null;
  window_end_months: number | null;
  is_extendable: boolean | null;
  max_extension_days: number | null;
  max_extension_months: number | null;
  legal_basis: string | null;
  legal_basis_url: string | null;
  last_verified_at: string | null;
  verified_source: string | null;
  next_review_at: string | null;
  notes: string | null;
  is_active: boolean | null;
  created_at: string | null;
  // Joined office data
  ip_offices?: {
    id: string;
    code: string;
    name: string;
    country_code: string;
    flag_emoji: string | null;
  } | null;
}

export interface LegalDeadlineFilters {
  officeCode?: string;
  rightType?: string;
  deadlineCategory?: string;
  searchQuery?: string;
}

// Get all legal deadlines
export function useLegalDeadlines(filters?: LegalDeadlineFilters) {
  return useQuery({
    queryKey: ['legal-deadlines', filters],
    queryFn: async () => {
      let query = supabase
        .from('legal_deadlines')
        .select(`
          *,
          ip_offices (
            id,
            code,
            name,
            country_code,
            flag_emoji
          )
        `)
        .eq('is_active', true)
        .order('right_type')
        .order('name');

      if (filters?.rightType) {
        query = query.eq('right_type', filters.rightType);
      }

      if (filters?.deadlineCategory) {
        query = query.eq('deadline_category', filters.deadlineCategory);
      }

      const { data, error } = await query;
      if (error) throw error;

      let results = data || [];

      // Filter by office code if provided
      if (filters?.officeCode) {
        results = results.filter(d => d.ip_offices?.code === filters.officeCode);
      }

      // Client-side search filter
      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        results = results.filter(d => 
          d.name.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          d.legal_basis?.toLowerCase().includes(q)
        );
      }

      return results as LegalDeadline[];
    },
  });
}

// Get deadlines by office
export function useLegalDeadlinesByOffice(officeCode: string) {
  return useQuery({
    queryKey: ['legal-deadlines-office', officeCode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_deadlines')
        .select(`
          *,
          ip_offices!inner (
            id,
            code,
            name,
            country_code,
            flag_emoji
          )
        `)
        .eq('ip_offices.code', officeCode)
        .eq('is_active', true)
        .order('right_type')
        .order('name');

      if (error) throw error;
      return (data || []) as LegalDeadline[];
    },
    enabled: !!officeCode,
  });
}

// Get deadlines by right type (trademark, patent, design)
export function useLegalDeadlinesByType(rightType: string) {
  return useQuery({
    queryKey: ['legal-deadlines-type', rightType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_deadlines')
        .select(`
          *,
          ip_offices (
            id,
            code,
            name,
            country_code,
            flag_emoji
          )
        `)
        .eq('right_type', rightType)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return (data || []) as LegalDeadline[];
    },
    enabled: !!rightType,
  });
}

// Get all IP offices for filter dropdowns
export function useIPOffices() {
  return useQuery({
    queryKey: ['ip-offices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ip_offices')
        .select('id, code, name, country_code, flag_emoji, office_type')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });
}

// Get verification stats for dashboard
export function useLegalDeadlinesStats() {
  return useQuery({
    queryKey: ['legal-deadlines-stats'],
    queryFn: async () => {
      const { data: deadlines, error } = await supabase
        .from('legal_deadlines')
        .select('id, right_type, last_verified_at, is_active')
        .eq('is_active', true);

      if (error) throw error;

      const total = deadlines?.length || 0;
      const byType: Record<string, number> = {};
      let lastVerified: string | null = null;

      deadlines?.forEach(d => {
        byType[d.right_type] = (byType[d.right_type] || 0) + 1;
        if (d.last_verified_at && (!lastVerified || d.last_verified_at > lastVerified)) {
          lastVerified = d.last_verified_at;
        }
      });

      return {
        total,
        byType,
        lastVerified,
      };
    },
  });
}
