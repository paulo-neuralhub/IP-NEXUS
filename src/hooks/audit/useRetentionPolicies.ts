// ============================================================
// IP-NEXUS - RETENTION POLICIES HOOKS
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import type { RetentionPolicy, RetentionExecution, RetentionAction } from '@/types/audit';

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
      return data as RetentionPolicy[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useRetentionPolicy(policyId: string | undefined) {
  return useQuery({
    queryKey: ['retention-policy', policyId],
    queryFn: async () => {
      if (!policyId) return null;

      const { data, error } = await supabase
        .from('retention_policies')
        .select('*')
        .eq('id', policyId)
        .single();

      if (error) throw error;
      return data as RetentionPolicy;
    },
    enabled: !!policyId,
  });
}

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
      action?: RetentionAction;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization selected');

      const { data, error } = await supabase
        .from('retention_policies')
        .insert({
          organization_id: currentOrganization.id,
          name: policy.name,
          description: policy.description,
          data_type: policy.data_type,
          retention_days: policy.retention_days,
          conditions: policy.conditions || {},
          action: policy.action || 'archive',
        })
        .select()
        .single();

      if (error) throw error;
      return data as RetentionPolicy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retention-policies'] });
    },
  });
}

export function useUpdateRetentionPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<RetentionPolicy> & { id: string }) => {
      const { data, error } = await supabase
        .from('retention_policies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as RetentionPolicy;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['retention-policies'] });
      queryClient.invalidateQueries({ queryKey: ['retention-policy', data.id] });
    },
  });
}

export function useDeleteRetentionPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (policyId: string) => {
      const { error } = await supabase
        .from('retention_policies')
        .delete()
        .eq('id', policyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retention-policies'] });
    },
  });
}

// ==========================================
// LEGAL HOLD
// ==========================================

export function useSetLegalHold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      policyId,
      enabled,
      reason,
      until,
    }: {
      policyId: string;
      enabled: boolean;
      reason?: string;
      until?: string;
    }) => {
      const { data, error } = await supabase
        .from('retention_policies')
        .update({
          legal_hold: enabled,
          legal_hold_reason: reason,
          legal_hold_until: until,
        })
        .eq('id', policyId)
        .select()
        .single();

      if (error) throw error;
      return data as RetentionPolicy;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['retention-policies'] });
      queryClient.invalidateQueries({ queryKey: ['retention-policy', data.id] });
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
      return data as RetentionExecution[];
    },
    enabled: !!policyId,
  });
}

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
          records_archived: 0,
          records_deleted: 0,
        })
        .eq('id', execution.id);

      if (updateError) throw updateError;

      return execution as RetentionExecution;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['retention-executions', data.policy_id] });
      queryClient.invalidateQueries({ queryKey: ['retention-policies'] });
    },
  });
}
