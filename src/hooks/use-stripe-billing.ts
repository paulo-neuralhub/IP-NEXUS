import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';

export interface SubscriptionData {
  id: string;
  status: string;
  plan: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

// Get current subscription
export function useSubscription() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['subscription', currentOrganization?.id],
    queryFn: async (): Promise<SubscriptionData | null> => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      // Get plan from price_id or organization
      const { data: org } = await supabase
        .from('organizations')
        .select('plan')
        .eq('id', currentOrganization!.id)
        .single();

      return {
        id: data.id,
        status: data.status || 'inactive',
        plan: org?.plan || 'starter',
        currentPeriodStart: data.current_period_start || '',
        currentPeriodEnd: data.current_period_end || '',
        cancelAtPeriodEnd: data.cancel_at_period_end || false,
      };
    },
    enabled: !!currentOrganization?.id,
  });
}

// Create checkout session
export function useCreateCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      priceId, 
      successUrl, 
      cancelUrl 
    }: { 
      priceId: string; 
      successUrl?: string; 
      cancelUrl?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: { 
          priceId,
          successUrl: successUrl || `${window.location.origin}/app/settings/billing?success=true`,
          cancelUrl: cancelUrl || `${window.location.origin}/pricing`,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear sesión de pago');
    },
  });
}

// Open customer portal
export function useOpenPortal() {
  return useMutation({
    mutationFn: async (returnUrl?: string) => {
      const { data, error } = await supabase.functions.invoke('stripe-portal', {
        body: { 
          returnUrl: returnUrl || `${window.location.origin}/app/settings/billing`,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al abrir portal de facturación');
    },
  });
}

// Get available plans/prices from stripe_prices table
export function useAvailablePlans() {
  return useQuery({
    queryKey: ['available-plans'],
    queryFn: async () => {
      const { data: prices, error: pricesError } = await supabase
        .from('stripe_prices')
        .select('*')
        .eq('active', true)
        .order('unit_amount', { ascending: true });

      if (pricesError || !prices?.length) {
        // Fallback to static plans if table not populated
        return [
          { id: 'starter', name: 'Starter', price: 0, interval: 'month' as const },
          { id: 'professional', name: 'Professional', price: 299, interval: 'month' as const },
          { id: 'business', name: 'Business', price: 499, interval: 'month' as const },
          { id: 'enterprise', name: 'Enterprise', price: 999, interval: 'month' as const },
        ];
      }

      // Get products separately
      const productIds = [...new Set(prices.map(p => p.stripe_product_id))];
      const { data: products } = await supabase
        .from('stripe_products')
        .select('*')
        .in('stripe_product_id', productIds);

      const productMap = new Map(products?.map(p => [p.stripe_product_id, p]) || []);

      return prices.map(p => {
        const product = productMap.get(p.stripe_product_id);
        return {
          id: p.stripe_price_id,
          name: product?.name || p.nickname || 'Plan',
          price: (p.unit_amount || 0) / 100,
          interval: (p.recurring_interval || 'month') as 'month' | 'year',
          features: product?.features || [],
          productId: p.stripe_product_id,
        };
      });
    },
  });
}

// Get billing history from payments table
export function useBillingHistory() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['billing-history', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrganization?.id,
  });
}
