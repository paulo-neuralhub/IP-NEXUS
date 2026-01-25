import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StripeConfig {
  id: string;
  publishable_key: string | null;
  has_secret_key: boolean;
  has_webhook_secret: boolean;
  mode: 'test' | 'live';
  webhook_url: string | null;
  success_url: string | null;
  cancel_url: string | null;
  customer_portal_url: string | null;
  tax_rate_id: string | null;
  default_currency: string;
  trial_days: number;
  is_configured: boolean;
  last_webhook_at: string | null;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useStripeConfig() {
  return useQuery({
    queryKey: ['stripe-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stripe_config')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as StripeConfig | null;
    },
  });
}

export function useSaveStripeConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: Partial<StripeConfig>) => {
      // Get existing config
      const { data: existing } = await supabase
        .from('stripe_config')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('stripe_config')
          .update(config)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('stripe_config')
          .insert(config);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-config'] });
      toast.success('Configuración guardada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useTestStripeConnection() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('stripe-test-connection');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.success) {
        toast.success('Conexión con Stripe verificada');
      } else {
        toast.error(data?.error || 'Error de conexión');
      }
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useTestStripeWebhook() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('stripe-test-webhook');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.success) {
        toast.success('Webhook configurado correctamente');
      } else {
        toast.error(data?.error || 'Error en webhook');
      }
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}
