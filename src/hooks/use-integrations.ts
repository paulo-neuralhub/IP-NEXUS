import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import type { 
  Payment, 
  SentEmail, 
  ApiConnection, 
  StripeCheckoutRequest,
  StripeCheckoutSession,
  StripePortalSession,
} from '@/types/integrations';

// ===== PAYMENTS =====
export function usePayments() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['payments', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!currentOrganization?.id,
  });
}

// ===== SENT EMAILS =====
export function useSentEmails(limit = 100) {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['sent-emails', currentOrganization?.id, limit],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      const { data, error } = await supabase
        .from('sent_emails')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as SentEmail[];
    },
    enabled: !!currentOrganization?.id,
  });
}

// ===== SEND EMAIL =====
export function useSendEmail() {
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (request: {
      to: string | string[];
      subject?: string;
      template_code?: string;
      template_data?: Record<string, any>;
      html?: string;
      text?: string;
      from_name?: string;
      reply_to?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          ...request,
          organization_id: currentOrganization?.id,
        },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Email enviado');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// ===== API CONNECTIONS =====
export function useApiConnections() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['api-connections', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      
      const { data, error } = await supabase
        .from('api_connections')
        .select('*')
        .eq('organization_id', currentOrganization.id);
      
      if (error) throw error;
      return data as ApiConnection[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useCreateApiConnection() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: Omit<ApiConnection, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => {
      if (!currentOrganization?.id) throw new Error('No organization');
      
      const { data: result, error } = await supabase
        .from('api_connections')
        .insert({
          ...data,
          organization_id: currentOrganization.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-connections'] });
      toast.success('Conexión creada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useUpdateApiConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ApiConnection> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('api_connections')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-connections'] });
      toast.success('Conexión actualizada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useDeleteApiConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('api_connections')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-connections'] });
      toast.success('Conexión eliminada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// ===== STRIPE =====
export function useStripeCheckout() {
  return useMutation({
    mutationFn: async (data: StripeCheckoutRequest): Promise<StripeCheckoutSession> => {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await fetch(
        `https://dcdbpmbzizzzzdfkvohl.supabase.co/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.session?.access_token}`,
          },
          body: JSON.stringify(data),
        }
      );
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create checkout session');
      }
      
      return result;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useStripePortal() {
  return useMutation({
    mutationFn: async (returnUrl?: string): Promise<StripePortalSession> => {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await fetch(
        `https://dcdbpmbzizzzzdfkvohl.supabase.co/functions/v1/stripe-portal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.session?.access_token}`,
          },
          body: JSON.stringify({ return_url: returnUrl }),
        }
      );
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create portal session');
      }
      
      return result;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// ===== WEBHOOK EVENTS (Admin) =====
export function useWebhookEvents(source?: string) {
  return useQuery({
    queryKey: ['webhook-events', source],
    queryFn: async () => {
      let query = supabase
        .from('webhook_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (source) {
        query = query.eq('source', source);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
}
