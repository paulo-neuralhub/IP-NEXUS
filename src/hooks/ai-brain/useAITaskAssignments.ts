// ============================================================
// IP-NEXUS AI BRAIN - AI TASK ASSIGNMENTS HOOK
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AITaskAssignment, AITaskAssignmentFormData } from '@/types/ai-brain.types';
import { toast } from 'sonner';

const QUERY_KEY = 'ai-task-assignments';

export function useAITaskAssignments() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async (): Promise<AITaskAssignment[]> => {
      const { data, error } = await supabase
        .from('ai_task_assignments')
        .select(`
          *,
          primary_model:ai_models!ai_task_assignments_primary_model_id_fkey(
            id, model_id, name,
            provider:ai_providers(id, name, code)
          ),
          fallback_1_model:ai_models!ai_task_assignments_fallback_1_model_id_fkey(
            id, model_id, name,
            provider:ai_providers(id, name, code)
          ),
          fallback_2_model:ai_models!ai_task_assignments_fallback_2_model_id_fkey(
            id, model_id, name,
            provider:ai_providers(id, name, code)
          )
        `)
        .order('category', { ascending: true })
        .order('task_name', { ascending: true });

      if (error) throw error;
      return data as unknown as AITaskAssignment[];
    },
  });
}

export function useAITaskAssignment(taskCode: string) {
  return useQuery({
    queryKey: [QUERY_KEY, taskCode],
    queryFn: async (): Promise<AITaskAssignment | null> => {
      if (!taskCode) return null;

      const { data, error } = await supabase
        .from('ai_task_assignments')
        .select(`
          *,
          primary_model:ai_models!ai_task_assignments_primary_model_id_fkey(
            id, model_id, name,
            provider:ai_providers(id, name, code)
          ),
          fallback_1_model:ai_models!ai_task_assignments_fallback_1_model_id_fkey(
            id, model_id, name,
            provider:ai_providers(id, name, code)
          ),
          fallback_2_model:ai_models!ai_task_assignments_fallback_2_model_id_fkey(
            id, model_id, name,
            provider:ai_providers(id, name, code)
          )
        `)
        .eq('task_code', taskCode)
        .single();

      if (error) throw error;
      return data as unknown as AITaskAssignment;
    },
    enabled: !!taskCode,
  });
}

export function useCreateAITaskAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: AITaskAssignmentFormData) => {
      const { data, error } = await supabase
        .from('ai_task_assignments')
        .insert({
          task_code: formData.task_code,
          task_name: formData.task_name,
          description: formData.description,
          category: formData.category,
          primary_model_id: formData.primary_model_id || null,
          fallback_1_model_id: formData.fallback_1_model_id || null,
          fallback_2_model_id: formData.fallback_2_model_id || null,
          temperature: formData.temperature,
          max_tokens: formData.max_tokens,
          timeout_ms: formData.timeout_ms,
          max_retries: formData.max_retries,
          rag_enabled: formData.rag_enabled,
          rag_collection_ids: formData.rag_collection_ids,
          rag_top_k: formData.rag_top_k,
          is_active: formData.is_active,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Task assignment created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create task assignment: ${error.message}`);
    },
  });
}

export function useUpdateAITaskAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: Partial<AITaskAssignmentFormData> }) => {
      const { data, error } = await supabase
        .from('ai_task_assignments')
        .update({
          task_name: formData.task_name,
          description: formData.description,
          category: formData.category,
          primary_model_id: formData.primary_model_id || null,
          fallback_1_model_id: formData.fallback_1_model_id || null,
          fallback_2_model_id: formData.fallback_2_model_id || null,
          temperature: formData.temperature,
          max_tokens: formData.max_tokens,
          timeout_ms: formData.timeout_ms,
          max_retries: formData.max_retries,
          rag_enabled: formData.rag_enabled,
          rag_collection_ids: formData.rag_collection_ids,
          rag_top_k: formData.rag_top_k,
          is_active: formData.is_active,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Task assignment updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update task assignment: ${error.message}`);
    },
  });
}

export function useDeleteAITaskAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_task_assignments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Task assignment deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete task assignment: ${error.message}`);
    },
  });
}

export function useToggleTaskActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('ai_task_assignments')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(`Task ${variables.is_active ? 'activated' : 'deactivated'}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update task: ${error.message}`);
    },
  });
}
