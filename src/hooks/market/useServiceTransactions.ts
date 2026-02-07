/**
 * useServiceTransactions — Hook for RFQ-based service transactions
 * Reads from market_service_transactions + market_milestones
 * This is the PRIMARY transaction system for the IP-Market RFQ flow.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ── Types ──

export interface ServiceMilestone {
  id: string;
  transaction_id: string;
  name: string;
  description: string | null;
  sequence_order: number;
  amount: number | null;
  percentage: number | null;
  status: 'pending' | 'in_progress' | 'delivered' | 'approved' | 'disputed';
  delivered_at: string | null;
  delivered_note: string | null;
  approved_at: string | null;
  approved_note: string | null;
  payment_released: boolean;
  payment_released_at: string | null;
  created_at: string;
}

export interface ServiceTransaction {
  id: string;
  transaction_number: string;
  request_id: string | null;
  offer_id: string | null;
  buyer_user_id: string | null;
  buyer_organization_id: string | null;
  seller_user_id: string | null;
  seller_organization_id: string | null;
  currency: string;
  professional_fees: number | null;
  official_fees: number | null;
  platform_fee_buyer: number | null;
  platform_fee_seller: number | null;
  total_amount: number;
  escrow_held: number | null;
  escrow_released: number | null;
  status: string;
  stripe_payment_intent_id: string | null;
  stripe_connected_account_id: string | null;
  stripe_transfer_id: string | null;
  buyer_confirmed: boolean;
  seller_confirmed: boolean;
  buyer_reviewed: boolean;
  seller_reviewed: boolean;
  confidential_data: any;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  milestones?: ServiceMilestone[];
  request?: any;
  offer?: any;
}

// ── Fetch service transactions for current user ──

export function useServiceTransactions(role: 'buyer' | 'seller' | 'all' = 'all') {
  return useQuery({
    queryKey: ['service-transactions', role],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get user's org
      const { data: membership } = await supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!membership) return [];

      let query = supabase
        .from('market_service_transactions')
        .select(`
          *,
          milestones:market_milestones(*),
          offer:rfq_quotes!market_service_transactions_offer_id_rfq_fkey(agent_id)
        `)
        .order('created_at', { ascending: false });

      if (role === 'buyer') {
        query = query.eq('buyer_user_id', user.id);
      } else if (role === 'seller') {
        query = query.eq('seller_user_id', user.id);
      } else {
        query = query.or(`buyer_user_id.eq.${user.id},seller_user_id.eq.${user.id}`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Sort milestones by sequence_order
      return ((data || []) as unknown as ServiceTransaction[]).map(tx => ({
        ...tx,
        milestones: (tx.milestones || []).sort((a: any, b: any) => a.sequence_order - b.sequence_order),
      }));
    },
  });
}

export function useServiceTransaction(id: string | undefined) {
  return useQuery({
    queryKey: ['service-transaction', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('market_service_transactions')
        .select(`
          *,
          milestones:market_milestones(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const tx = data as unknown as ServiceTransaction;
      tx.milestones = (tx.milestones || []).sort((a: any, b: any) => a.sequence_order - b.sequence_order);
      return tx;
    },
    enabled: !!id,
  });
}

// ── Accept quote and create transaction ──

export function useAcceptQuoteAndCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quoteId,
      requestId,
    }: {
      quoteId: string;
      requestId: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Get the quote details
      const { data: quote, error: qErr } = await supabase
        .from('rfq_quotes')
        .select('*')
        .eq('id', quoteId)
        .single();
      if (qErr || !quote) throw new Error('Quote not found');

      // 2. Get agent info  
      const { data: agent } = await supabase
        .from('market_users')
        .select('id, auth_user_id, organization_id')
        .eq('id', (quote as any).agent_id)
        .single();

      // 3. Get requester info
      const { data: requester } = await supabase
        .from('market_users')
        .select('id, auth_user_id, organization_id')
        .eq('auth_user_id', user.id)
        .single();

      // 4. Award the quote
      await supabase
        .from('rfq_quotes')
        .update({
          status: 'awarded',
          awarded_at: new Date().toISOString(),
        })
        .eq('id', quoteId);

      // 5. Reject other quotes
      await supabase
        .from('rfq_quotes')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
        })
        .eq('request_id', requestId)
        .neq('id', quoteId)
        .in('status', ['submitted', 'viewed', 'shortlisted']);

      // 6. Update request status
      await supabase
        .from('rfq_requests')
        .update({
          status: 'awarded',
          awarded_quote_id: quoteId,
          awarded_at: new Date().toISOString(),
          agent_id: (quote as any).agent_id,
          agreed_price: (quote as any).total_price,
        })
        .eq('id', requestId);

      // 7. Calculate fees
      const professionalFees = (quote as any).price_breakdown?.professional_fees || (quote as any).total_price;
      const officialFees = (quote as any).price_breakdown?.official_fees || 0;
      const platformFeeSeller = professionalFees * 0.10;
      const platformFeeBuyer = professionalFees * 0.05;
      const totalAmount = professionalFees + officialFees + platformFeeBuyer;

      const txNumber = `TX-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      // 8. Create service transaction
      const { data: transaction, error: txErr } = await supabase
        .from('market_service_transactions')
        .insert({
          transaction_number: txNumber,
          request_id: requestId,
          offer_id: quoteId,
          buyer_user_id: user.id,
          buyer_organization_id: (requester as any)?.organization_id || null,
          seller_user_id: (agent as any)?.auth_user_id || null,
          seller_organization_id: (agent as any)?.organization_id || null,
          currency: (quote as any).currency || 'EUR',
          professional_fees: professionalFees,
          official_fees: officialFees,
          platform_fee_buyer: platformFeeBuyer,
          platform_fee_seller: platformFeeSeller,
          total_amount: totalAmount,
          status: 'pending_payment',
        })
        .select()
        .single();

      if (txErr) throw txErr;

      // 9. Create milestones from quote's payment_milestones
      const milestones = (quote as any).payment_milestones || [];
      if (milestones.length > 0) {
        const milestoneInserts = milestones.map((ms: any, idx: number) => ({
          transaction_id: (transaction as any).id,
          name: ms.description || `Milestone ${idx + 1}`,
          description: ms.description,
          sequence_order: idx + 1,
          percentage: ms.percentage || 0,
          amount: professionalFees * ((ms.percentage || 0) / 100),
          status: idx === 0 ? 'in_progress' : 'pending',
        }));

        await supabase
          .from('market_milestones')
          .insert(milestoneInserts);
      }

      // 10. Update request with transaction_id
      await supabase
        .from('rfq_requests')
        .update({ transaction_id: (transaction as any).id })
        .eq('id', requestId);

      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-rfq-requests-with-quotes'] });
      queryClient.invalidateQueries({ queryKey: ['rfq-requests'] });
      queryClient.invalidateQueries({ queryKey: ['service-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['my-rfq-quotes'] });
      toast.success('¡Oferta aceptada! Transacción creada.');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

// ── Simulate escrow payment (when Stripe not configured) ──

export function useSimulateEscrowPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      // Get total to set escrow_held
      const { data: tx } = await supabase
        .from('market_service_transactions')
        .select('total_amount')
        .eq('id', transactionId)
        .single();

      if (!tx) throw new Error('Transaction not found');

      const { error } = await supabase
        .from('market_service_transactions')
        .update({
          escrow_held: (tx as any).total_amount,
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId);

      if (error) throw error;

      // Set first milestone to in_progress
      const { data: milestones } = await supabase
        .from('market_milestones')
        .select('id')
        .eq('transaction_id', transactionId)
        .eq('status', 'pending')
        .order('sequence_order', { ascending: true })
        .limit(1);

      if (milestones?.length) {
        await supabase
          .from('market_milestones')
          .update({ status: 'in_progress' })
          .eq('id', (milestones[0] as any).id);
      }

      return { success: true };
    },
    onSuccess: (_, transactionId) => {
      queryClient.invalidateQueries({ queryKey: ['service-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['service-transaction', transactionId] });
      toast.success('Pago simulado — fondos en escrow');
    },
    onError: () => {
      toast.error('Error al simular pago');
    },
  });
}

// ── Deliver milestone (seller action) ──

export function useDeliverMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      milestoneId,
      note,
    }: {
      milestoneId: string;
      note?: string;
    }) => {
      const { error } = await supabase
        .from('market_milestones')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString(),
          delivered_note: note || null,
        })
        .eq('id', milestoneId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-transactions'] });
      toast.success('Milestone marcado como entregado');
    },
    onError: () => {
      toast.error('Error al entregar milestone');
    },
  });
}

// ── Approve milestone and release payment (buyer action) ──

export function useApproveMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      milestoneId,
      transactionId,
      note,
    }: {
      milestoneId: string;
      transactionId: string;
      note?: string;
    }) => {
      // Get milestone amount
      const { data: milestone } = await supabase
        .from('market_milestones')
        .select('amount, transaction_id')
        .eq('id', milestoneId)
        .single();

      if (!milestone) throw new Error('Milestone not found');

      // Approve milestone
      await supabase
        .from('market_milestones')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_note: note || null,
          payment_released: true,
          payment_released_at: new Date().toISOString(),
        })
        .eq('id', milestoneId);

      // Update escrow_released
      const { data: tx } = await supabase
        .from('market_service_transactions')
        .select('escrow_released')
        .eq('id', transactionId)
        .single();

      const newReleased = ((tx as any)?.escrow_released || 0) + ((milestone as any).amount || 0);
      await supabase
        .from('market_service_transactions')
        .update({
          escrow_released: newReleased,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId);

      // Activate next pending milestone
      const { data: nextMilestones } = await supabase
        .from('market_milestones')
        .select('id')
        .eq('transaction_id', transactionId)
        .eq('status', 'pending')
        .order('sequence_order', { ascending: true })
        .limit(1);

      if (nextMilestones?.length) {
        await supabase
          .from('market_milestones')
          .update({ status: 'in_progress' })
          .eq('id', (nextMilestones[0] as any).id);
      }

      // Check if all milestones are completed
      const { data: remainingMilestones } = await supabase
        .from('market_milestones')
        .select('id')
        .eq('transaction_id', transactionId)
        .in('status', ['pending', 'in_progress', 'delivered']);

      if (!remainingMilestones?.length) {
        await supabase
          .from('market_service_transactions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', transactionId);
      }

      return { success: true, amountReleased: (milestone as any).amount };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['service-transactions'] });
      toast.success(`€${(data.amountReleased || 0).toFixed(2)} liberados al agente`);
    },
    onError: () => {
      toast.error('Error al aprobar milestone');
    },
  });
}

// ── Submit review after completion ──

export function useSubmitServiceReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      reviewedUserId,
      ratingOverall,
      ratingCommunication,
      ratingQuality,
      ratingTimeliness,
      ratingValue,
      comment,
    }: {
      transactionId: string;
      reviewedUserId: string;
      ratingOverall: number;
      ratingCommunication?: number;
      ratingQuality?: number;
      ratingTimeliness?: number;
      ratingValue?: number;
      comment?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get reviewer's market_users id
      const { data: reviewer } = await supabase
        .from('market_users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!reviewer) throw new Error('Reviewer profile not found');

      // reviewedUserId could be a market_users.id directly (for demo agents without auth)
      // or an auth user id — try market_users.id first, then auth_user_id
      let reviewedMarketId = reviewedUserId;
      const { data: reviewedCheck } = await supabase
        .from('market_users')
        .select('id')
        .eq('id', reviewedUserId)
        .maybeSingle();

      if (!reviewedCheck) {
        // Try by auth_user_id
        const { data: byAuth } = await supabase
          .from('market_users')
          .select('id')
          .eq('auth_user_id', reviewedUserId)
          .maybeSingle();
        if (!byAuth) throw new Error('Reviewed user not found');
        reviewedMarketId = (byAuth as any).id;
      }

      await supabase
        .from('market_user_reviews')
        .insert({
          reviewer_id: (reviewer as any).id,
          reviewed_user_id: reviewedMarketId,
          transaction_id: transactionId,
          rating_overall: ratingOverall,
          rating_communication: ratingCommunication || ratingOverall,
          rating_quality: ratingQuality || ratingOverall,
          rating_timeliness: ratingTimeliness || ratingOverall,
          rating_value: ratingValue || ratingOverall,
          comment: comment || '',
        } as any);

      // Mark as reviewed
      const { data: tx } = await supabase
        .from('market_service_transactions')
        .select('buyer_user_id')
        .eq('id', transactionId)
        .single();

      const isBuyer = (tx as any)?.buyer_user_id === user.id;
      await supabase
        .from('market_service_transactions')
        .update({
          [isBuyer ? 'buyer_reviewed' : 'seller_reviewed']: true,
        })
        .eq('id', transactionId);

      // Update agent's avg rating
      const { data: allReviews } = await supabase
        .from('market_user_reviews')
        .select('rating_overall')
        .eq('reviewed_user_id', reviewedMarketId)
        .eq('is_visible', true);

      if (allReviews?.length) {
        const avgRating = allReviews.reduce((sum: number, r: any) => sum + r.rating_overall, 0) / allReviews.length;
        await supabase
          .from('market_users')
          .update({
            rating_avg: Math.round(avgRating * 10) / 10,
            ratings_count: allReviews.length,
          })
          .eq('id', reviewedMarketId);
      }

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['service-transaction', variables.transactionId] });
      toast.success('¡Gracias por tu valoración!');
    },
    onError: () => {
      toast.error('Error al enviar valoración');
    },
  });
}
