// ============================================================
// IP-NEXUS - COMPLIANCE CHECKS HOOKS
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { ComplianceCheck, ComplianceStats, ComplianceFramework, ComplianceStatus } from '@/types/audit';

// ==========================================
// COMPLIANCE CHECKS
// ==========================================

export function useComplianceChecks(filters?: { 
  framework?: string; 
  status?: string;
  category?: string;
}) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['compliance-checks', currentOrganization?.id, filters],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      let query = supabase
        .from('compliance_checks')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      if (filters?.framework) {
        query = query.eq('framework', filters.framework);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query.order('framework', { ascending: true });

      if (error) throw error;
      return (data || []) as ComplianceCheck[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useComplianceCheck(id: string) {
  return useQuery({
    queryKey: ['compliance-check', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_checks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ComplianceCheck;
    },
    enabled: !!id,
  });
}

// ==========================================
// PENDING REVIEW & NON-COMPLIANT
// ==========================================

export function usePendingReviewChecks() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['pending-review-checks', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('compliance_checks')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .eq('status', 'pending_review')
        .order('next_review_at', { ascending: true });

      if (error) throw error;
      return (data || []) as ComplianceCheck[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useNonCompliantChecks() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['non-compliant-checks', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('compliance_checks')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .in('status', ['non_compliant', 'partial'])
        .order('remediation_due_date', { ascending: true });

      if (error) throw error;
      return (data || []) as ComplianceCheck[];
    },
    enabled: !!currentOrganization?.id,
  });
}

// ==========================================
// CREATE COMPLIANCE CHECK
// ==========================================

export function useCreateComplianceCheck() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (check: {
      framework: ComplianceFramework;
      check_code: string;
      check_name: string;
      check_description?: string;
      category?: string;
      status?: ComplianceStatus;
      owner_id?: string;
      next_review_at?: string;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data, error } = await supabase
        .from('compliance_checks')
        .insert({
          organization_id: currentOrganization.id,
          framework: check.framework,
          check_code: check.check_code,
          check_name: check.check_name,
          check_description: check.check_description,
          category: check.category,
          status: check.status || 'pending_review',
          owner_id: check.owner_id,
          next_review_at: check.next_review_at,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ComplianceCheck;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-checks'] });
      queryClient.invalidateQueries({ queryKey: ['pending-review-checks'] });
    },
  });
}

// ==========================================
// UPDATE COMPLIANCE CHECK
// ==========================================

export function useUpdateComplianceCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Omit<ComplianceCheck, 'id' | 'organization_id' | 'created_at'>>) => {
      const { data, error } = await supabase
        .from('compliance_checks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ComplianceCheck;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['compliance-checks'] });
      queryClient.invalidateQueries({ queryKey: ['compliance-check', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['pending-review-checks'] });
      queryClient.invalidateQueries({ queryKey: ['non-compliant-checks'] });
    },
  });
}

// ==========================================
// DELETE COMPLIANCE CHECK
// ==========================================

export function useDeleteComplianceCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('compliance_checks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-checks'] });
      queryClient.invalidateQueries({ queryKey: ['pending-review-checks'] });
      queryClient.invalidateQueries({ queryKey: ['non-compliant-checks'] });
    },
  });
}

// ==========================================
// RUN COMPLIANCE CHECK
// ==========================================

export function useRunComplianceCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      notes 
    }: { 
      id: string; 
      status: ComplianceStatus; 
      notes?: string;
    }) => {
      const updateData: Record<string, unknown> = {
        status,
        last_checked_at: new Date().toISOString(),
        evidence_notes: notes,
      };

      // Set next review date (e.g., 90 days from now)
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + 90);
      updateData.next_review_at = nextReview.toISOString();

      const { data, error } = await supabase
        .from('compliance_checks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ComplianceCheck;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['compliance-checks'] });
      queryClient.invalidateQueries({ queryKey: ['compliance-check', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['pending-review-checks'] });
      queryClient.invalidateQueries({ queryKey: ['non-compliant-checks'] });
    },
  });
}

// ==========================================
// COMPLIANCE STATS
// ==========================================

export function useComplianceStats() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['compliance-stats', currentOrganization?.id],
    queryFn: async (): Promise<ComplianceStats | null> => {
      if (!currentOrganization?.id) return null;

      // Get all checks
      const { data: checks } = await supabase
        .from('compliance_checks')
        .select('framework, status')
        .eq('organization_id', currentOrganization.id);

      const allChecks = checks || [];
      const total = allChecks.length;
      const compliant = allChecks.filter(c => c.status === 'compliant').length;
      const nonCompliant = allChecks.filter(c => c.status === 'non_compliant').length;
      const partial = allChecks.filter(c => c.status === 'partial').length;
      const pendingReview = allChecks.filter(c => c.status === 'pending_review').length;

      // By framework
      const byFramework: Record<string, { total: number; compliant: number; percentage: number }> = {};
      allChecks.forEach((c) => {
        const fw = c.framework || 'unknown';
        if (!byFramework[fw]) {
          byFramework[fw] = { total: 0, compliant: 0, percentage: 0 };
        }
        byFramework[fw].total++;
        if (c.status === 'compliant') {
          byFramework[fw].compliant++;
        }
      });

      // Calculate percentages
      Object.keys(byFramework).forEach((fw) => {
        byFramework[fw].percentage = byFramework[fw].total > 0
          ? Math.round((byFramework[fw].compliant / byFramework[fw].total) * 100)
          : 0;
      });

      const compliancePercentage = total > 0 ? Math.round((compliant / total) * 100) : 0;

      return {
        total_checks: total,
        compliant,
        non_compliant: nonCompliant,
        partial,
        pending_review: pendingReview,
        compliance_percentage: compliancePercentage,
        by_framework: byFramework,
      };
    },
    enabled: !!currentOrganization?.id,
  });
}
