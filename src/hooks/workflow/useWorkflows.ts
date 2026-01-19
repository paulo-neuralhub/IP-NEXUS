import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

// =============================================
// WORKFLOW TEMPLATES
// =============================================

export function useWorkflowTemplates(options?: { category?: string; isActive?: boolean }) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['workflow-templates', currentOrganization?.id, options],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      let query = supabase
        .from('workflow_templates')
        .select('*')
        .or(`organization_id.eq.${currentOrganization.id},organization_id.is.null`)
        .order('created_at', { ascending: false });
      
      if (options?.category) {
        query = query.eq('category', options.category);
      }
      
      if (options?.isActive !== undefined) {
        query = query.eq('is_active', options.isActive);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!currentOrganization?.id
  });
}

export function useWorkflowTemplate(id: string | undefined) {
  return useQuery({
    queryKey: ['workflow-template', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as any;
    },
    enabled: !!id
  });
}

export function useCreateWorkflowTemplate() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (template: any) => {
      if (!currentOrganization?.id) throw new Error('No organization selected');
      
      const { data, error } = await supabase
        .from('workflow_templates')
        .insert({
          ...template,
          organization_id: currentOrganization.id,
          created_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-templates'] });
      toast.success('Workflow creado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear workflow: ${error.message}`);
    }
  });
}

export function useUpdateWorkflowTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('workflow_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-templates'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-template', data.id] });
      toast.success('Workflow actualizado');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar: ${error.message}`);
    }
  });
}

export function useDeleteWorkflowTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workflow_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-templates'] });
      toast.success('Workflow eliminado');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar: ${error.message}`);
    }
  });
}

export function useToggleWorkflowActive() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('workflow_templates')
        .update({ is_active: isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-templates'] });
      toast.success('Estado actualizado');
    }
  });
}

// =============================================
// WORKFLOW EXECUTIONS
// =============================================

export function useWorkflowExecutions(options?: { 
  workflowId?: string; 
  status?: string;
  limit?: number;
}) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['workflow-executions', currentOrganization?.id, options],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      let query = supabase
        .from('workflow_executions')
        .select(`
          *,
          workflow:workflow_templates(id, name, code, category)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });
      
      if (options?.workflowId) {
        query = query.eq('workflow_id', options.workflowId);
      }
      
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!currentOrganization?.id,
    refetchInterval: 5000
  });
}

export function useWorkflowExecution(id: string | undefined) {
  return useQuery({
    queryKey: ['workflow-execution', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('workflow_executions')
        .select(`
          *,
          workflow:workflow_templates(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as any;
    },
    enabled: !!id
  });
}

export function useWorkflowActionLogs(executionId: string | undefined) {
  return useQuery({
    queryKey: ['workflow-action-logs', executionId],
    queryFn: async () => {
      if (!executionId) return [];
      
      const { data, error } = await supabase
        .from('workflow_action_logs')
        .select('*')
        .eq('execution_id', executionId)
        .order('action_index', { ascending: true });
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!executionId,
    refetchInterval: 3000
  });
}

// =============================================
// WORKFLOW QUEUE
// =============================================

export function useWorkflowQueue(options?: { status?: string }) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['workflow-queue', currentOrganization?.id, options],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      let query = supabase
        .from('workflow_queue')
        .select(`
          *,
          workflow:workflow_templates(id, name, code)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('priority', { ascending: true })
        .order('scheduled_for', { ascending: true });
      
      if (options?.status) {
        query = query.eq('status', options.status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as any[];
    },
    enabled: !!currentOrganization?.id,
    refetchInterval: 10000
  });
}

// =============================================
// MANUAL TRIGGER
// =============================================

export function useTriggerWorkflowManually() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ workflowId, triggerData }: { workflowId: string; triggerData?: Record<string, unknown> }) => {
      const { data, error } = await supabase.rpc('trigger_workflow_manually', {
        p_workflow_id: workflowId,
        p_trigger_data: (triggerData || {}) as Json
      });
      
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-queue'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-executions'] });
      toast.success('Workflow disparado manualmente');
    },
    onError: (error: Error) => {
      toast.error(`Error al disparar workflow: ${error.message}`);
    }
  });
}

// =============================================
// WORKFLOW STATS
// =============================================

export function useWorkflowStats(days: number = 30) {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['workflow-stats', currentOrganization?.id, days],
    queryFn: async () => {
      if (!currentOrganization?.id) return null;
      
      const { data, error } = await supabase.rpc('get_workflow_stats', {
        p_organization_id: currentOrganization.id,
        p_days: days
      });
      
      if (error) throw error;
      return data?.[0] as any;
    },
    enabled: !!currentOrganization?.id
  });
}
