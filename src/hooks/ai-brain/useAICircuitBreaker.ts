// ============================================================
// IP-NEXUS AI BRAIN - CIRCUIT BREAKER HOOK
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AICircuitBreakerState } from '@/types/ai-brain.types';
import { toast } from 'sonner';

const QUERY_KEY = 'ai-circuit-breaker';

export function useAICircuitBreakerStates() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async (): Promise<AICircuitBreakerState[]> => {
      const { data, error } = await supabase
        .from('ai_circuit_breaker_states')
        .select(`
          *,
          provider:ai_providers(id, name, code, status, health_status)
        `);

      if (error) throw error;
      return data as unknown as AICircuitBreakerState[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useAICircuitBreakerState(providerId: string) {
  return useQuery({
    queryKey: [QUERY_KEY, providerId],
    queryFn: async (): Promise<AICircuitBreakerState | null> => {
      if (!providerId) return null;

      const { data, error } = await supabase
        .from('ai_circuit_breaker_states')
        .select(`
          *,
          provider:ai_providers(id, name, code, status, health_status)
        `)
        .eq('provider_id', providerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as unknown as AICircuitBreakerState;
    },
    enabled: !!providerId,
    refetchInterval: 10000, // Refresh every 10 seconds for active monitoring
  });
}

export function useResetCircuitBreaker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (providerId: string) => {
      const { data, error } = await supabase
        .from('ai_circuit_breaker_states')
        .update({
          state: 'closed',
          failure_count: 0,
          success_count: 0,
          opened_at: null,
          half_open_at: null,
        })
        .eq('provider_id', providerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Circuit breaker reset to closed state');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reset circuit breaker: ${error.message}`);
    },
  });
}

export function useForceOpenCircuit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (providerId: string) => {
      const { data, error } = await supabase
        .from('ai_circuit_breaker_states')
        .update({
          state: 'open',
          opened_at: new Date().toISOString(),
        })
        .eq('provider_id', providerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.warning('Circuit breaker forced open');
    },
    onError: (error: Error) => {
      toast.error(`Failed to open circuit breaker: ${error.message}`);
    },
  });
}

export function useUpdateCircuitConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      providerId,
      config,
    }: {
      providerId: string;
      config: {
        failure_threshold?: number;
        success_threshold?: number;
        open_duration_ms?: number;
      };
    }) => {
      const { data, error } = await supabase
        .from('ai_circuit_breaker_states')
        .update(config)
        .eq('provider_id', providerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Circuit breaker configuration updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update configuration: ${error.message}`);
    },
  });
}
