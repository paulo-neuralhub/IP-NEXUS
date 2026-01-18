import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { Webhook, WebhookDelivery, WebhookEvent } from '@/types/api';

export function useWebhooks() {
  const { currentOrganization } = useOrganization();
  
  return useQuery({
    queryKey: ['webhooks', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as Webhook[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useWebhook(id: string) {
  return useQuery({
    queryKey: ['webhook', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as unknown as Webhook;
    },
    enabled: !!id,
  });
}

export function useCreateWebhook() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      url: string;
      events: WebhookEvent[];
      headers?: Record<string, string>;
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization');
      
      // Generar secret
      const secret = generateWebhookSecret();
      
      const { data: webhook, error } = await supabase
        .from('webhooks')
        .insert({
          organization_id: currentOrganization.id,
          name: data.name,
          url: data.url,
          events: data.events,
          headers: data.headers || {},
          secret,
        })
        .select()
        .single();
      
      if (error) throw error;
      return webhook as unknown as Webhook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Webhook creado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear webhook: ${error.message}`);
    },
  });
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { 
      id: string; 
      data: Partial<Pick<Webhook, 'name' | 'url' | 'events' | 'headers' | 'is_active' | 'max_retries' | 'retry_delay_seconds'>>
    }) => {
      const { data: webhook, error } = await supabase
        .from('webhooks')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return webhook;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['webhook', id] });
      toast.success('Webhook actualizado');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Webhook eliminado');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useTestWebhook() {
  return useMutation({
    mutationFn: async (webhookId: string) => {
      const { data, error } = await supabase.functions.invoke('test-webhook', {
        body: { webhook_id: webhookId },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Webhook de prueba enviado');
    },
    onError: (error: Error) => {
      toast.error(`Error al probar webhook: ${error.message}`);
    },
  });
}

export function useWebhookDeliveries(webhookId: string, limit = 50) {
  return useQuery({
    queryKey: ['webhook-deliveries', webhookId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_deliveries')
        .select('*')
        .eq('webhook_id', webhookId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as unknown as WebhookDelivery[];
    },
    enabled: !!webhookId,
  });
}

export function useRetryWebhookDelivery() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (deliveryId: string) => {
      const { data, error } = await supabase.functions.invoke('retry-webhook', {
        body: { delivery_id: deliveryId },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-deliveries'] });
      toast.success('Reintento programado');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useRegenerateWebhookSecret() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const newSecret = generateWebhookSecret();
      
      const { data, error } = await supabase
        .from('webhooks')
        .update({ secret: newSecret, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as Webhook;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['webhook', id] });
      toast.success('Secret regenerado');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

function generateWebhookSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let secret = 'whsec_';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}
