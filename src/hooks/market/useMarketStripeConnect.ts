import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ConnectAccountStatus {
  status: 'not_created' | 'pending' | 'active' | 'restricted';
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements?: string[];
}

export function useMarketConnectStatus() {
  return useQuery({
    queryKey: ['market-connect-status'],
    queryFn: async (): Promise<ConnectAccountStatus> => {
      const { data, error } = await supabase.functions.invoke('market-stripe-account-status');
      // 503 = Stripe not configured yet — treat as not_created gracefully
      if (error) {
        const isNotConfigured =
          error.message?.includes('Stripe not configured') ||
          error.message?.includes('503');
        if (isNotConfigured) {
          return { status: 'not_created', chargesEnabled: false, payoutsEnabled: false, detailsSubmitted: false };
        }
        throw error;
      }
      return data as ConnectAccountStatus;
    },
    retry: false,
  });
}

export function useMarketConnectOnboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (returnUrl?: string) => {
      const { data, error } = await supabase.functions.invoke('market-stripe-onboard', {
        body: { returnUrl: returnUrl || window.location.href },
      });
      if (error) throw error;
      return data as { url: string; accountId: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['market-connect-status'] });
      if (data.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error: Error) => {
      toast.error(`Error al configurar Stripe: ${error.message}`);
    },
  });
}

export function useMarketConnectDashboard() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('market-stripe-dashboard');
      if (error) throw error;
      return data as { url: string };
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useMarketCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const { data, error } = await supabase.functions.invoke('market-stripe-create-payment', {
        body: { transactionId },
      });
      if (error) throw error;
      return data as { clientSecret: string; paymentIntentId: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-transactions'] });
    },
    onError: (error: Error) => {
      toast.error(`Error al crear pago: ${error.message}`);
    },
  });
}

export function useMarketReleaseMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (milestoneId: string) => {
      const { data, error } = await supabase.functions.invoke('market-stripe-release-milestone', {
        body: { milestoneId },
      });
      if (error) throw error;
      return data as { success: boolean; transferId: string; amountReleased: number };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['market-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['market-milestones'] });
      toast.success(`€${data.amountReleased.toFixed(2)} liberados al agente`);
    },
    onError: (error: Error) => {
      toast.error(`Error al liberar fondos: ${error.message}`);
    },
  });
}
