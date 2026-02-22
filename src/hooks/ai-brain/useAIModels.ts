// ============================================================
// IP-NEXUS AI BRAIN - AI MODELS HOOK
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AIModel, AIModelFormData } from '@/types/ai-brain.types';
import { toast } from 'sonner';

const QUERY_KEY = 'ai-models';

export function useAIModels(providerId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, providerId],
    queryFn: async (): Promise<AIModel[]> => {
      let query = supabase
        .from('ai_models')
        .select(`
          *,
          provider:ai_providers(id, name, code, status, health_status)
        `)
        .order('name');

      if (providerId) {
        query = query.eq('provider_id', providerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data as unknown) as AIModel[];
    },
  });
}

export function useActiveAIModels() {
  return useQuery({
    queryKey: [QUERY_KEY, 'active'],
    queryFn: async (): Promise<AIModel[]> => {
      const { data, error } = await supabase
        .from('ai_models')
        .select(`
          *,
          provider:ai_providers(id, name, code, status, health_status)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return (data as unknown) as AIModel[];
    },
  });
}

export function useAIModel(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async (): Promise<AIModel | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('ai_models')
        .select(`
          *,
          provider:ai_providers(id, name, code, status, health_status)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return (data as unknown) as AIModel;
    },
    enabled: !!id,
  });
}

export function useCreateAIModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: AIModelFormData) => {
      const { data, error } = await supabase
        .from('ai_models')
        .insert({
          provider_id: formData.provider_id,
          model_id: formData.model_id,
          name: formData.name,
          capabilities: formData.capabilities,
          context_window: formData.context_window,
          max_output_tokens: formData.max_output_tokens,
          input_cost_per_1m: formData.input_cost_per_1m,
          output_cost_per_1m: formData.output_cost_per_1m,
          is_active: formData.is_active,
          tier: formData.tier,
          speed_rating: formData.speed_rating,
          quality_rating: formData.quality_rating,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Model created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create model: ${error.message}`);
    },
  });
}

export function useUpdateAIModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: Partial<AIModelFormData> }) => {
      const { data, error } = await supabase
        .from('ai_models')
        .update({
          provider_id: formData.provider_id,
          model_id: formData.model_id,
          name: formData.name,
          capabilities: formData.capabilities,
          context_window: formData.context_window,
          max_output_tokens: formData.max_output_tokens,
          input_cost_per_1m: formData.input_cost_per_1m,
          output_cost_per_1m: formData.output_cost_per_1m,
          is_active: formData.is_active,
          tier: formData.tier,
          speed_rating: formData.speed_rating,
          quality_rating: formData.quality_rating,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Model updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update model: ${error.message}`);
    },
  });
}

export function useDeleteAIModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_models')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Model deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete model: ${error.message}`);
    },
  });
}

export function useToggleModelActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('ai_models')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success(`Model ${variables.is_active ? 'activated' : 'deactivated'}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update model: ${error.message}`);
    },
  });
}
