import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TenantSubscription {
  id: string;
  organization_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  product_id: string | null;
  price_id: string | null;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete';
  trial_start: string | null;
  trial_end: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  cancel_at_period_end: boolean;
  billing_cycle: 'monthly' | 'yearly' | null;
  next_invoice_date: string | null;
  stripe_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined data
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
  product?: {
    id: string;
    name: string;
  };
  price?: {
    id: string;
    price: number;
    currency: string;
    billing_period: string;
  };
  items?: SubscriptionItem[];
}

export interface SubscriptionItem {
  id: string;
  subscription_id: string;
  stripe_subscription_item_id: string | null;
  product_id: string | null;
  price_id: string | null;
  quantity: number;
  status: string;
  product?: {
    id: string;
    name: string;
  };
  price?: {
    id: string;
    price: number;
  };
}

export interface SubscriptionFilters {
  status?: string;
  productId?: string;
  search?: string;
}

export function useStripeSubscriptions(filters?: SubscriptionFilters) {
  return useQuery({
    queryKey: ['stripe-subscriptions', filters],
    queryFn: async () => {
      let query = supabase
        .from('tenant_subscriptions')
        .select(`
          *,
          organization:organizations(id, name, slug),
          product:products(id, name),
          price:product_prices(id, price, currency, billing_period)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.productId) {
        query = query.eq('product_id', filters.productId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch items for each subscription
      const subscriptionIds = (data || []).map((s: { id: string }) => s.id);
      const { data: items } = await supabase
        .from('subscription_items')
        .select(`
          *,
          product:products(id, name),
          price:product_prices(id, price)
        `)
        .in('subscription_id', subscriptionIds.length > 0 ? subscriptionIds : ['none']);

      // Map items to subscriptions
      return (data || []).map((sub: { id: string }) => ({
        ...sub,
        items: items?.filter((i: { subscription_id: string }) => i.subscription_id === sub.id) || [],
      })) as unknown as TenantSubscription[];
    },
  });
}

export function useStripeSubscription(id: string) {
  return useQuery({
    queryKey: ['stripe-subscription', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenant_subscriptions')
        .select(`
          *,
          organization:organizations(id, name, slug),
          product:products(id, name),
          price:product_prices(id, price, currency, billing_period)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Fetch items
      const { data: items } = await supabase
        .from('subscription_items')
        .select(`
          *,
          product:products(id, name),
          price:product_prices(id, price)
        `)
        .eq('subscription_id', id);

      // Fetch recent invoices
      const { data: invoices } = await supabase
        .from('stripe_invoices')
        .select('*')
        .eq('organization_id', (data as { organization_id: string }).organization_id)
        .order('created_at', { ascending: false })
        .limit(5);

      return {
        ...data,
        items: items || [],
        invoices: invoices || [],
      } as unknown as TenantSubscription & { invoices: StripeInvoiceRecord[] };
    },
    enabled: !!id,
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subscriptionId, atPeriodEnd }: { subscriptionId: string; atPeriodEnd: boolean }) => {
      const { data, error } = await supabase.functions.invoke('stripe-cancel-subscription', {
        body: { subscriptionId, cancelAtPeriodEnd: atPeriodEnd },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-subscriptions'] });
      toast.success('Suscripción cancelada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export interface StripeInvoiceRecord {
  id: string;
  organization_id: string | null;
  stripe_invoice_id: string | null;
  invoice_number: string | null;
  hosted_invoice_url: string | null;
  invoice_pdf_url: string | null;
  subtotal_cents: number | null;
  tax_cents: number | null;
  total_cents: number | null;
  amount_paid_cents: number | null;
  amount_due_cents: number | null;
  currency: string;
  status: string | null;
  period_start: string | null;
  period_end: string | null;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
}

export function useStripeSubscriptionStats() {
  return useQuery({
    queryKey: ['stripe-subscription-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenant_subscriptions')
        .select(`
          status,
          price:product_prices(price, billing_period)
        `);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        active: 0,
        trialing: 0,
        pastDue: 0,
        canceled: 0,
        mrr: 0,
      };

      (data || []).forEach((sub: { status: string; price: { price: number; billing_period: string } | null }) => {
        switch (sub.status) {
          case 'active':
            stats.active++;
            break;
          case 'trialing':
            stats.trialing++;
            break;
          case 'past_due':
            stats.pastDue++;
            break;
          case 'canceled':
            stats.canceled++;
            break;
        }

        // Calculate MRR
        if (sub.status === 'active' && sub.price) {
          const amount = sub.price.price || 0;
          if (sub.price.billing_period === 'yearly') {
            stats.mrr += Math.round(amount / 12);
          } else {
            stats.mrr += amount;
          }
        }
      });

      return stats;
    },
  });
}
