// =============================================
// WORKFLOW APPROVAL HOOKS
// Manage pending workflow approvals
// =============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface WorkflowApprovalItem {
  id: string;
  organization_id: string;
  workflow_id: string;
  trigger_type: string;
  trigger_data: Record<string, unknown>;
  status: string;
  requires_approval: boolean;
  approval_status: 'pending' | 'approved' | 'rejected' | null;
  approval_requested_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  requested_by: string | null;
  matter_id: string | null;
  contact_id: string | null;
  created_at: string;
  workflow?: {
    id: string;
    name: string;
    code: string;
    description?: string;
    approval_message?: string;
  };
  matter?: {
    id: string;
    reference: string;
    title: string;
  };
  contact?: {
    id: string;
    name: string;
  };
}

// Get pending approvals count
export function usePendingApprovalsCount() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['workflow-approvals-count', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return 0;
      
      const { count, error } = await supabase
        .from('workflow_queue')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', currentOrganization.id)
        .eq('approval_status', 'pending');
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!currentOrganization?.id,
    refetchInterval: 30000 // Check every 30 seconds
  });
}

// Get pending approvals list
export function usePendingApprovals() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['workflow-pending-approvals', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      const { data, error } = await supabase
        .from('workflow_queue')
        .select(`
          *,
          workflow:workflow_templates(id, name, code, description, approval_message),
          matter:matters(id, reference, title),
          contact:contacts(id, name)
        `)
        .eq('organization_id', currentOrganization.id)
        .eq('approval_status', 'pending')
        .order('approval_requested_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as WorkflowApprovalItem[];
    },
    enabled: !!currentOrganization?.id,
    refetchInterval: 10000
  });
}

// Get all approvals (history)
export function useWorkflowApprovalHistory(options?: { limit?: number }) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['workflow-approval-history', currentOrganization?.id, options],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      let query = supabase
        .from('workflow_queue')
        .select(`
          *,
          workflow:workflow_templates(id, name, code),
          matter:matters(id, reference, title)
        `)
        .eq('organization_id', currentOrganization.id)
        .not('approval_status', 'is', null)
        .order('approval_requested_at', { ascending: false });
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as unknown as WorkflowApprovalItem[];
    },
    enabled: !!currentOrganization?.id
  });
}

// Approve workflow
export function useApproveWorkflow() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (queueId: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      
      const { data, error } = await supabase.rpc('approve_workflow', {
        p_queue_id: queueId,
        p_user_id: user.id
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-approvals-count'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-approval-history'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-queue'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Workflow aprobado y en ejecución');
    },
    onError: (error: Error) => {
      toast.error(`Error al aprobar: ${error.message}`);
    }
  });
}

// Reject workflow
export function useRejectWorkflow() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ queueId, reason }: { queueId: string; reason?: string }) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      
      const { data, error } = await supabase.rpc('reject_workflow', {
        p_queue_id: queueId,
        p_user_id: user.id,
        p_reason: reason || null
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-approvals-count'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-approval-history'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-queue'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Workflow rechazado');
    },
    onError: (error: Error) => {
      toast.error(`Error al rechazar: ${error.message}`);
    }
  });
}

// Request workflow approval (trigger with approval)
export function useRequestWorkflowApproval() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      workflowId, 
      triggerType = 'manual',
      triggerData = {},
      matterId,
      contactId
    }: { 
      workflowId: string;
      triggerType?: string;
      triggerData?: Record<string, unknown>;
      matterId?: string;
      contactId?: string;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization selected');
      
      const { data, error } = await supabase.rpc('request_workflow_approval', {
        p_workflow_id: workflowId,
        p_organization_id: currentOrganization.id,
        p_trigger_type: triggerType,
        p_trigger_data: triggerData as Json,
        p_matter_id: matterId || null,
        p_contact_id: contactId || null,
        p_requested_by: user?.id || null
      });
      
      if (error) throw error;
      return data as string;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-approvals-count'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-queue'] });
      toast.info('Workflow enviado para aprobación');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
}
