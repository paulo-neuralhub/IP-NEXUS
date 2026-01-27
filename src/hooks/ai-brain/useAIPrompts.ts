// ============================================================
// IP-NEXUS AI BRAIN - PROMPTS HOOKS
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface AIPrompt {
  id: string;
  task_id: string | null;
  model_code: string | null;
  name: string;
  description: string | null;
  version: number;
  is_latest: boolean;
  parent_version_id: string | null;
  system_prompt: string | null;
  user_prompt_template: string;
  variables: unknown;
  output_format: string;
  output_schema: unknown;
  tools_enabled: boolean;
  tools_schema: unknown;
  suggested_temperature: number | null;
  suggested_max_tokens: number | null;
  status: string;
  execution_count: number;
  avg_input_tokens: number | null;
  avg_output_tokens: number | null;
  avg_latency_ms: number | null;
  avg_quality_score: number | null;
  success_rate: number | null;
  avg_cost: number | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  submitted_for_review_at: string | null;
  submitted_by: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
  published_at: string | null;
  published_by: string | null;
  deprecated_at: string | null;
  deprecated_by: string | null;
  deprecation_reason: string | null;
  // Joined data
  task?: {
    id: string;
    task_code: string;
    task_name: string;
    category: string;
  };
}

export interface PromptVariable {
  name: string;
  type: 'string' | 'text' | 'number' | 'boolean' | 'json';
  required: boolean;
  description?: string;
  default?: string;
  inject_from?: string;
}

export interface AIPromptFormData {
  task_id: string;
  model_code?: string | null;
  name: string;
  description?: string;
  system_prompt?: string;
  user_prompt_template: string;
  variables: PromptVariable[];
  output_format?: string;
  output_schema?: unknown;
  tools_enabled?: boolean;
  tools_schema?: unknown;
  suggested_temperature?: number;
  suggested_max_tokens?: number;
}

export interface AIPromptChange {
  id: string;
  prompt_id: string;
  field_changed: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
  changed_by: string | null;
  change_reason: string | null;
}

export interface AIPromptComment {
  id: string;
  prompt_id: string;
  comment: string;
  comment_type: string;
  line_number: number | null;
  field_reference: string | null;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  created_by: string | null;
}

// Fetch all prompts
export function useAIPrompts(filters?: { status?: string; task_id?: string }) {
  return useQuery({
    queryKey: ['ai-prompts', filters],
    queryFn: async () => {
      let query = (supabase
        .from('ai_prompts') as any)
        .select(`
          *,
          task:ai_task_assignments(id, task_code, task_name, category)
        `)
        .order('updated_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.task_id && filters.task_id !== 'all') {
        query = query.eq('task_id', filters.task_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as AIPrompt[];
    },
  });
}

// Fetch single prompt
export function useAIPrompt(id: string | undefined) {
  return useQuery({
    queryKey: ['ai-prompt', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await (supabase
        .from('ai_prompts') as any)
        .select(`
          *,
          task:ai_task_assignments(id, task_code, task_name, category)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as AIPrompt;
    },
    enabled: !!id,
  });
}

// Fetch prompt versions
export function useAIPromptVersions(taskId: string | undefined, modelCode: string | null) {
  return useQuery({
    queryKey: ['ai-prompt-versions', taskId, modelCode],
    queryFn: async () => {
      if (!taskId) return [];
      let query = (supabase
        .from('ai_prompts') as any)
        .select('id, version, status, is_latest, created_at')
        .eq('task_id', taskId)
        .order('version', { ascending: false });

      if (modelCode) {
        query = query.eq('model_code', modelCode);
      } else {
        query = query.is('model_code', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!taskId,
  });
}

// Fetch prompt changes history
export function useAIPromptChanges(promptId: string | undefined) {
  return useQuery({
    queryKey: ['ai-prompt-changes', promptId],
    queryFn: async () => {
      if (!promptId) return [];
      const { data, error } = await (supabase
        .from('ai_prompt_changes') as any)
        .select('*')
        .eq('prompt_id', promptId)
        .order('changed_at', { ascending: false });
      if (error) throw error;
      return (data || []) as AIPromptChange[];
    },
    enabled: !!promptId,
  });
}

// Fetch prompt comments
export function useAIPromptComments(promptId: string | undefined) {
  return useQuery({
    queryKey: ['ai-prompt-comments', promptId],
    queryFn: async () => {
      if (!promptId) return [];
      const { data, error } = await (supabase
        .from('ai_prompt_comments') as any)
        .select('*')
        .eq('prompt_id', promptId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as AIPromptComment[];
    },
    enabled: !!promptId,
  });
}

// Create prompt
export function useCreateAIPrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AIPromptFormData) => {
      // Use type assertion since types may not be regenerated yet
      const { data: result, error } = await (supabase
        .from('ai_prompts') as any)
        .insert({
          task_id: data.task_id,
          model_code: data.model_code || null,
          name: data.name,
          description: data.description || null,
          system_prompt: data.system_prompt || null,
          user_prompt_template: data.user_prompt_template,
          variables: data.variables,
          output_format: data.output_format || 'text',
          output_schema: data.output_schema || null,
          tools_enabled: data.tools_enabled || false,
          tools_schema: data.tools_schema || null,
          suggested_temperature: data.suggested_temperature || null,
          suggested_max_tokens: data.suggested_max_tokens || null,
          status: 'draft',
          version: 1,
          is_latest: true,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-prompts'] });
      toast.success('Prompt creado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear prompt: ${error.message}`);
    },
  });
}

// Update prompt
export function useUpdateAIPrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AIPromptFormData> }) => {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (data.task_id !== undefined) updateData.task_id = data.task_id;
      if (data.model_code !== undefined) updateData.model_code = data.model_code || null;
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.system_prompt !== undefined) updateData.system_prompt = data.system_prompt;
      if (data.user_prompt_template !== undefined) updateData.user_prompt_template = data.user_prompt_template;
      if (data.variables !== undefined) updateData.variables = data.variables;
      if (data.output_format !== undefined) updateData.output_format = data.output_format;
      if (data.output_schema !== undefined) updateData.output_schema = data.output_schema;
      if (data.tools_enabled !== undefined) updateData.tools_enabled = data.tools_enabled;
      if (data.tools_schema !== undefined) updateData.tools_schema = data.tools_schema;
      if (data.suggested_temperature !== undefined) updateData.suggested_temperature = data.suggested_temperature;
      if (data.suggested_max_tokens !== undefined) updateData.suggested_max_tokens = data.suggested_max_tokens;

      const { error } = await (supabase
        .from('ai_prompts') as any)
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ai-prompts'] });
      queryClient.invalidateQueries({ queryKey: ['ai-prompt', variables.id] });
      toast.success('Prompt actualizado');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar: ${error.message}`);
    },
  });
}

// Delete prompt
export function useDeleteAIPrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from('ai_prompts') as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-prompts'] });
      toast.success('Prompt eliminado');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar: ${error.message}`);
    },
  });
}

// Change prompt status
export function useChangePromptStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      promptId, 
      newStatus, 
      notes 
    }: { 
      promptId: string; 
      newStatus: string; 
      notes?: string;
    }) => {
      const { data, error } = await supabase.rpc('change_prompt_status', {
        p_prompt_id: promptId,
        p_new_status: newStatus,
        p_notes: notes,
      });
      if (error) throw error;
      
      // Check if the function returned success
      const result = data as { success: boolean; message: string }[] | null;
      if (result && result[0] && !result[0].success) {
        throw new Error(result[0].message);
      }
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ai-prompts'] });
      queryClient.invalidateQueries({ queryKey: ['ai-prompt', variables.promptId] });
      toast.success('Estado actualizado');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// Create new version
export function useCreatePromptVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promptId: string) => {
      const { data, error } = await supabase.rpc('create_prompt_version', {
        p_prompt_id: promptId,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-prompts'] });
      queryClient.invalidateQueries({ queryKey: ['ai-prompt-versions'] });
      toast.success('Nueva versión creada');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear versión: ${error.message}`);
    },
  });
}

// Compare prompt versions
export function useComparePromptVersions(versionAId?: string, versionBId?: string) {
  return useQuery({
    queryKey: ['ai-prompt-compare', versionAId, versionBId],
    queryFn: async () => {
      if (!versionAId || !versionBId) return [];
      const { data, error } = await supabase.rpc('compare_prompt_versions', {
        p_version_a_id: versionAId,
        p_version_b_id: versionBId,
      });
      if (error) throw error;
      return data as {
        field_name: string;
        version_a_value: string | null;
        version_b_value: string | null;
        is_different: boolean;
      }[];
    },
    enabled: !!versionAId && !!versionBId,
  });
}

// Add comment
export function useAddPromptComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      prompt_id: string;
      comment: string;
      comment_type?: string;
      line_number?: number;
      field_reference?: string;
    }) => {
      const { error } = await (supabase
        .from('ai_prompt_comments') as any)
        .insert(data);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ai-prompt-comments', variables.prompt_id] });
      toast.success('Comentario añadido');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// Resolve comment
export function useResolvePromptComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await (supabase
        .from('ai_prompt_comments') as any)
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-prompt-comments'] });
      toast.success('Comentario resuelto');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}
