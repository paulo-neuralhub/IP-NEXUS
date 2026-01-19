// src/hooks/market/useTransaction.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MarketTransaction, TransactionStatus } from '@/types/market.types';
import { toast } from 'sonner';

export function useTransaction(transactionId: string | undefined) {
  return useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: async () => {
      if (!transactionId) return null;

      const { data, error } = await (supabase
        .from('market_transactions' as any)
        .select(`
          *,
          listing:market_listings(
            *,
            asset:market_assets(*),
            seller:market_user_profiles(*)
          ),
          buyer:market_user_profiles(*),
          offers:market_offers(*)
        `)
        .eq('id', transactionId)
        .single() as any);

      if (error) throw error;
      return data as MarketTransaction;
    },
    enabled: !!transactionId,
  });
}

export function useTransactions(role: 'buyer' | 'seller' | 'all' = 'all', status?: TransactionStatus[]) {
  return useQuery({
    queryKey: ['transactions', role, status],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('market_transactions' as any)
        .select(`
          *,
          listing:market_listings(
            id, title, asking_price, currency,
            asset:market_assets(id, asset_type, images)
          ),
          buyer:market_user_profiles(id, display_name, avatar_url),
          seller:market_user_profiles(id, display_name, avatar_url)
        `)
        .order('updated_at', { ascending: false });

      // Filter by role
      if (role === 'buyer') {
        query = query.eq('buyer_id', user.id);
      } else if (role === 'seller') {
        query = query.eq('seller_id', user.id);
      } else {
        query = query.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
      }

      // Filter by status
      if (status && status.length > 0) {
        query = query.in('status', status);
      }

      const { data, error } = await (query as any);
      if (error) throw error;
      return (data || []) as MarketTransaction[];
    },
  });
}

export function useUpdateTransactionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      transactionId, 
      status, 
      notes 
    }: { 
      transactionId: string; 
      status: TransactionStatus; 
      notes?: string;
    }) => {
      const { data, error } = await (supabase
        .from('market_transactions' as any)
        .update({ 
          status, 
          status_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transaction', variables.transactionId] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Estado actualizado');
    },
    onError: () => {
      toast.error('Error al actualizar estado');
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listingId,
      sellerId,
      offerId,
      transactionType,
      agreedPrice,
      currency,
    }: {
      listingId: string;
      sellerId: string;
      offerId?: string;
      transactionType: string;
      agreedPrice: number;
      currency: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const transactionNumber = `TRX-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      const { data, error } = await (supabase
        .from('market_transactions' as any)
        .insert({
          listing_id: listingId,
          seller_id: sellerId,
          offer_id: offerId,
          buyer_id: user.id,
          transaction_type: transactionType,
          agreed_price: agreedPrice,
          currency,
          status: 'pending_payment',
          transaction_number: transactionNumber,
        })
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transacción iniciada');
    },
    onError: () => {
      toast.error('Error al crear transacción');
    },
  });
}
