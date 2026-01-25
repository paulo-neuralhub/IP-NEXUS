import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProductWithStripe {
  id: string;
  name: string;
  description: string | null;
  product_type: string;
  is_active: boolean;
  stripe_product_id: string | null;
  stripe_synced_at: string | null;
  prices: PriceWithStripe[];
}

export interface PriceWithStripe {
  id: string;
  product_id: string;
  price: number;
  currency: string;
  billing_period: string;
  is_active: boolean;
  stripe_price_id: string | null;
  stripe_synced_at: string | null;
}

export function useStripeProducts() {
  return useQuery({
    queryKey: ['stripe-products-sync'],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          product_type,
          is_active,
          stripe_product_id,
          stripe_synced_at
        `)
        .order('name');

      if (error) throw error;

      const productIds = (products || []).map((p: { id: string }) => p.id);
      const { data: prices } = await supabase
        .from('product_prices')
        .select(`
          id,
          product_id,
          price,
          currency,
          billing_period,
          is_active,
          stripe_price_id,
          stripe_synced_at
        `)
        .in('product_id', productIds.length > 0 ? productIds : ['none']);

      return (products || []).map((product: { id: string }) => ({
        ...product,
        prices: (prices || []).filter((p: { product_id: string }) => p.product_id === product.id),
      })) as unknown as ProductWithStripe[];
    },
  });
}

export function useSyncProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { data, error } = await supabase.functions.invoke('stripe-sync-products', {
        body: { productIds: [productId] },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-products-sync'] });
      toast.success('Producto sincronizado con Stripe');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useSyncAllProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('stripe-sync-products', {
        body: {},
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stripe-products-sync'] });
      toast.success(`${data?.synced || 0} productos sincronizados`);
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useUnlinkProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .update({
          stripe_product_id: null,
          stripe_synced_at: null,
        })
        .eq('id', productId);

      if (error) throw error;

      // Also unlink prices
      await supabase
        .from('product_prices')
        .update({
          stripe_price_id: null,
          stripe_synced_at: null,
        })
        .eq('product_id', productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripe-products-sync'] });
      toast.success('Producto desvinculado de Stripe');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useStripeProductStats() {
  return useQuery({
    queryKey: ['stripe-product-stats'],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from('products')
        .select('id, stripe_product_id');

      if (error) throw error;

      const { data: prices } = await supabase
        .from('product_prices')
        .select('id, stripe_price_id');

      const productsSynced = (products || []).filter((p: { stripe_product_id: string | null }) => p.stripe_product_id)?.length || 0;
      const pricesSynced = (prices || []).filter((p: { stripe_price_id: string | null }) => p.stripe_price_id)?.length || 0;

      return {
        totalProducts: products?.length || 0,
        productsSynced,
        productsNotSynced: (products?.length || 0) - productsSynced,
        totalPrices: prices?.length || 0,
        pricesSynced,
        pricesNotSynced: (prices?.length || 0) - pricesSynced,
      };
    },
  });
}
