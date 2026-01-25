import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StripeWebhookLog {
  id: string;
  stripe_event_id: string | null;
  event_type: string;
  payload: Record<string, unknown> | null;
  status: 'received' | 'processing' | 'processed' | 'failed';
  error_message: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface WebhookFilters {
  status?: string;
  eventType?: string;
  period?: 'today' | 'week' | 'month' | 'all';
}

export function useStripeWebhooks(filters?: WebhookFilters) {
  return useQuery({
    queryKey: ['stripe-webhooks', filters],
    queryFn: async () => {
      let query = supabase
        .from('stripe_webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.eventType && filters.eventType !== 'all') {
        query = query.eq('event_type', filters.eventType);
      }

      // Date filter
      if (filters?.period && filters.period !== 'all') {
        const now = new Date();
        let startDate: Date;

        switch (filters.period) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            startDate = new Date(0);
        }

        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []) as StripeWebhookLog[];
    },
  });
}

export function useStripeWebhookLog(id: string) {
  return useQuery({
    queryKey: ['stripe-webhook', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stripe_webhook_logs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as StripeWebhookLog;
    },
    enabled: !!id,
  });
}

export function useRetryWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (webhookId: string) => {
      const { data, error } = await supabase.functions.invoke('stripe-retry-webhook', {
        body: { webhookId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-webhooks'] });
      toast.success('Webhook reintentado');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useStripeWebhookStats() {
  return useQuery({
    queryKey: ['stripe-webhook-stats'],
    queryFn: async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data, error } = await supabase
        .from('stripe_webhook_logs')
        .select('status')
        .gte('created_at', yesterday.toISOString());

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        processed: 0,
        failed: 0,
        pending: 0,
      };

      data?.forEach((log) => {
        switch (log.status) {
          case 'processed':
            stats.processed++;
            break;
          case 'failed':
            stats.failed++;
            break;
          case 'received':
          case 'processing':
            stats.pending++;
            break;
        }
      });

      return stats;
    },
  });
}

export function useStripeEventTypes() {
  return useQuery({
    queryKey: ['stripe-event-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stripe_webhook_logs')
        .select('event_type')
        .order('event_type');

      if (error) throw error;

      // Get unique event types
      const types = [...new Set(data?.map(d => d.event_type))];
      return types;
    },
  });
}
