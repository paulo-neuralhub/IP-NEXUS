// src/hooks/market/useEscrow.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EscrowDetails {
  transactionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'funded' | 'released' | 'refunded' | 'disputed';
  stripePaymentIntentId?: string;
  stripeTransferId?: string;
  fundedAt?: string;
  releasedAt?: string;
  platformFee: number;
  sellerPayout: number;
}

export function useEscrowDetails(transactionId: string | undefined) {
  return useQuery({
    queryKey: ['escrow', transactionId],
    queryFn: async () => {
      if (!transactionId) return null;

      const { data, error } = await (supabase
        .from('market_transactions' as any)
        .select(`
          id,
          agreed_price,
          currency,
          escrow_status,
          escrow_funded_at,
          escrow_released_at,
          stripe_payment_intent_id,
          stripe_transfer_id,
          commission_amount,
          commission_rate
        `)
        .eq('id', transactionId)
        .single() as any);

      if (error) throw error;

      const commissionAmount = data.commission_amount || (data.agreed_price * (data.commission_rate || 5) / 100);

      return {
        transactionId: data.id,
        amount: data.agreed_price,
        currency: data.currency,
        status: data.escrow_status || 'pending',
        stripePaymentIntentId: data.stripe_payment_intent_id,
        stripeTransferId: data.stripe_transfer_id,
        fundedAt: data.escrow_funded_at,
        releasedAt: data.escrow_released_at,
        platformFee: commissionAmount,
        sellerPayout: data.agreed_price - commissionAmount,
      } as EscrowDetails;
    },
    enabled: !!transactionId,
  });
}

export function useInitiatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const { data, error } = await supabase.functions.invoke('create-market-payment-intent', {
        body: { transactionId },
      });

      if (error) throw error;
      return data as { clientSecret: string; paymentIntentId: string };
    },
    onSuccess: (_, transactionId) => {
      queryClient.invalidateQueries({ queryKey: ['escrow', transactionId] });
    },
    onError: () => {
      toast.error('Error al iniciar pago');
    },
  });
}

export function useConfirmEscrowFunded() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      paymentIntentId,
    }: {
      transactionId: string;
      paymentIntentId: string;
    }) => {
      const { data, error } = await (supabase
        .from('market_transactions' as any)
        .update({
          escrow_status: 'funded',
          escrow_funded_at: new Date().toISOString(),
          stripe_payment_intent_id: paymentIntentId,
          status: 'payment_in_escrow',
        })
        .eq('id', transactionId)
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['escrow', variables.transactionId] });
      queryClient.invalidateQueries({ queryKey: ['transaction', variables.transactionId] });
      toast.success('Pago recibido y en escrow');
    },
  });
}

export function useReleaseEscrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const { data, error } = await supabase.functions.invoke('release-market-escrow', {
        body: { transactionId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, transactionId) => {
      queryClient.invalidateQueries({ queryKey: ['escrow', transactionId] });
      queryClient.invalidateQueries({ queryKey: ['transaction', transactionId] });
      toast.success('Fondos liberados al vendedor');
    },
    onError: () => {
      toast.error('Error al liberar fondos');
    },
  });
}

export function useRequestRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      reason,
    }: {
      transactionId: string;
      reason: string;
    }) => {
      const { data, error } = await (supabase
        .from('market_transactions' as any)
        .update({
          escrow_status: 'disputed',
          status: 'disputed',
          status_notes: reason,
        })
        .eq('id', transactionId)
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['escrow', variables.transactionId] });
      queryClient.invalidateQueries({ queryKey: ['transaction', variables.transactionId] });
      toast.success('Solicitud de reembolso enviada');
    },
    onError: () => {
      toast.error('Error al solicitar reembolso');
    },
  });
}
