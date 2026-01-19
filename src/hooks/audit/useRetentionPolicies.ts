// ============================================================
// IP-NEXUS - RETENTION POLICIES HOOKS
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { RetentionPolicy, RetentionExecution, RetentionAction } from '@/types/audit';
import type { Json } from '@/integrations/supabase/types';

// ==========================================
// RETENTION POLICIES
// ==========================================

export function useRetentionPolicies() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['retention-policies', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await supabase
        .from('retention_policies')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as RetentionPolicy[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useRetentionPolicy(id: string) {
  return useQuery({
    queryKey: ['retention-policy', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('retention_policies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as RetentionPolicy;
    },
    enabled: !!id,
  });
}

// ==========================================
// CREATE RETENTION POLICY
// ==========================================

export function useCreateRetentionPolicy() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (policy: {
      name: string;
      description?: string;
      data_type: string;
      retention_days: number;
      conditions?: Record<string, unknown>;
      action: RetentionAction;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');

      const { data, error } = await supabase
        .from('retention_policies')
        .insert({
          organization_id: currentOrganization.id,
          name: policy.name,
          description: policy.description,
          data_type: policy.data_type,
          retention_days: policy.retention_days,
          conditions: (policy.conditions || null) as Json,
          action: policy.action,
        })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as RetentionPolicy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retention-policies'] });
    },
  });
}

// ==========================================
// UPDATE RETENTION POLICY
// ==========================================

export function useUpdateRetentionPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Omit<RetentionPolicy, 'id' | 'organization_id' | 'created_at'>>) => {
      const updateData: Record<string, unknown> = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.data_type !== undefined) updateData.data_type = updates.data_type;
      if (updates.retention_days !== undefined) updateData.retention_days = updates.retention_days;
      if (updates.conditions !== undefined) updateData.conditions = updates.conditions;
      if (updates.action !== undefined) updateData.action = updates.action;
      if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
      if (updates.legal_hold !== undefined) updateData.legal_hold = updates.legal_hold;
      if (updates.legal_hold_reason !== undefined) updateData.legal_hold_reason = updates.legal_hold_reason;

      const { data, error } = await supabase
        .from('retention_policies')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as RetentionPolicy;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['retention-policies'] });
      queryClient.invalidateQueries({ queryKey: ['retention-policy', variables.id] });
    },
  });
}

// ==========================================
// DELETE RETENTION POLICY
// ==========================================

export function useDeleteRetentionPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('retention_policies')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retention-policies'] });
    },
  });
}

// ==========================================
// SET LEGAL HOLD
// ==========================================

export function useSetLegalHold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      policyId, 
      legalHold, 
      reason 
    }: { 
      policyId: string; 
      legalHold: boolean; 
      reason?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('retention_policies')
        .update({
          legal_hold: legalHold,
          legal_hold_reason: legalHold ? reason : null,
          legal_hold_set_by: legalHold ? user?.id : null,
          legal_hold_set_at: legalHold ? new Date().toISOString() : null,
        })
        .eq('id', policyId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['retention-policies'] });
      queryClient.invalidateQueries({ queryKey: ['retention-policy', variables.policyId] });
    },
  });
}

// ==========================================
// RETENTION EXECUTIONS
// ==========================================

export function useRetentionExecutions(policyId: string) {
  return useQuery({
    queryKey: ['retention-executions', policyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('retention_executions')
        .select('*')
        .eq('policy_id', policyId)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as RetentionExecution[];
    },
    enabled: !!policyId,
  });
}

// ==========================================
// EXECUTE RETENTION POLICY
// ==========================================

export function useExecuteRetentionPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (policyId: string) => {
      // Create execution record
      const { data: execution, error: execError } = await supabase
        .from('retention_executions')
        .insert({
          policy_id: policyId,
          status: 'running',
        })
        .select()
        .single();

      if (execError) throw execError;

      // In a real implementation, this would trigger a background job
      // For now, we'll just mark it as completed
      const { error: updateError } = await supabase
        .from('retention_executions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          records_processed: 0,
          records_affected: 0,
        })
        .eq('id', execution.id);

      if (updateError) throw updateError;

      return execution;
    },
    onSuccess: (_, policyId) => {
      queryClient.invalidateQueries({ queryKey: ['retention-executions', policyId] });
      queryClient.invalidateQueries({ queryKey: ['retention-policies'] });
    },
  });
}
