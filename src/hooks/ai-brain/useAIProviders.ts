// ============================================================
// IP-NEXUS AI BRAIN - AI PROVIDERS HOOK
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AIProvider, AIProviderFormData } from '@/types/ai-brain.types';
import { toast } from 'sonner';

const QUERY_KEY = 'ai-providers';

export function useAIProviders() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async (): Promise<AIProvider[]> => {
      const { data, error } = await supabase
        .from('ai_providers')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as AIProvider[];
    },
  });
}

export function useAIProvider(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async (): Promise<AIProvider | null> => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('ai_providers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as AIProvider;
    },
    enabled: !!id,
  });
}

export function useCreateAIProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: AIProviderFormData) => {
      const { data, error } = await supabase
        .from('ai_providers')
        .insert({
          name: formData.name,
          code: formData.code,
          api_key_encrypted: formData.api_key || null,
          base_url: formData.base_url || null,
          is_gateway: formData.is_gateway,
          status: formData.status,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Provider created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create provider: ${error.message}`);
    },
  });
}

export function useUpdateAIProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: Partial<AIProviderFormData> }) => {
      const updateData: Record<string, unknown> = {
        name: formData.name,
        code: formData.code,
        base_url: formData.base_url || null,
        is_gateway: formData.is_gateway,
        status: formData.status,
      };

      // Only update API key if provided
      if (formData.api_key) {
        updateData.api_key_encrypted = formData.api_key;
      }

      const { data, error } = await supabase
        .from('ai_providers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Provider updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update provider: ${error.message}`);
    },
  });
}

export function useDeleteAIProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_providers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Provider deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete provider: ${error.message}`);
    },
  });
}

export function useTestAIProvider() {
  return useMutation({
    mutationFn: async (id: string) => {
      // Call edge function to test provider connectivity
      const { data, error } = await supabase.functions.invoke('ai-test-provider', {
        body: { provider_id: id },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Provider connection test successful');
    },
    onError: (error: Error) => {
      toast.error(`Provider test failed: ${error.message}`);
    },
  });
}

export function useUpdateProviderHealth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, health_status }: { id: string; health_status: AIProvider['health_status'] }) => {
      const { data, error } = await supabase
        .from('ai_providers')
        .update({
          health_status,
          last_health_check_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
