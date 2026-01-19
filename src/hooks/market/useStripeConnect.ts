// src/hooks/market/useStripeConnect.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StripeConnectAccount {
  accountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements?: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
  };
  bankAccounts?: {
    id: string;
    last4: string;
    bankName: string;
    currency: string;
  }[];
}

export function useStripeConnectAccount() {
  return useQuery({
    queryKey: ['stripe-connect-account'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get Stripe Connect ID from profile
      const { data: profile } = await (supabase
        .from('market_user_profiles' as any)
        .select('stripe_connect_id, stripe_connect_status')
        .eq('user_id', user.id)
        .single() as any);

      if (!profile?.stripe_connect_id) return null;

      // Get account details from edge function
      const { data, error } = await supabase.functions.invoke('get-stripe-connect-account', {
        body: { accountId: profile.stripe_connect_id },
      });

      if (error) throw error;
      return data as StripeConnectAccount;
    },
  });
}

export function useCreateConnectAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('create-stripe-connect-account', {});
      if (error) throw error;
      return data as { accountId: string; onboardingUrl: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-connect-account'] });
    },
    onError: () => {
      toast.error('Error al crear cuenta de Stripe');
    },
  });
}

export function useGetOnboardingLink() {
  return useMutation({
    mutationFn: async (returnUrl?: string) => {
      const { data, error } = await supabase.functions.invoke('get-stripe-onboarding-link', {
        body: { returnUrl: returnUrl || window.location.href },
      });
      if (error) throw error;
      return data as { url: string };
    },
  });
}

export function useGetDashboardLink() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-stripe-dashboard-link', {});
      if (error) throw error;
      return data as { url: string };
    },
  });
}

export function usePayoutHistory() {
  return useQuery({
    queryKey: ['payout-history'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-payout-history', {});
      if (error) throw error;
      return data as {
        payouts: {
          id: string;
          amount: number;
          currency: string;
          status: string;
          arrivalDate: string;
          transactionId: string;
        }[];
      };
    },
  });
}
