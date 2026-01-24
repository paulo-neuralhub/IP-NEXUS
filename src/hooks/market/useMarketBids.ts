// src/hooks/market/useMarketBids.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MarketBid {
  id: string;
  request_id: string;
  agent_id: string;
  amount: number;
  currency: string;
  estimated_days: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  updated_at: string;
  agent?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    rating_avg: number;
    ratings_count: number;
    is_verified_agent: boolean;
    total_transactions: number;
    success_rate: number;
    response_time_avg: number;
  };
}

export interface CreateBidInput {
  request_id: string;
  amount: number;
  currency?: string;
  estimated_days: number;
  message: string;
}

// Get all bids for a specific RFQ request
export function useBidsForRequest(requestId: string | undefined) {
  return useQuery({
    queryKey: ['market-bids', 'request', requestId],
    queryFn: async () => {
      if (!requestId) return [];

      const { data, error } = await supabase
        .from('rfq_quotes')
        .select(`
          id,
          request_id,
          agent_id,
          total_price,
          currency,
          estimated_duration_days,
          proposal_summary,
          status,
          created_at,
          updated_at,
          agent:market_users!rfq_quotes_agent_id_fkey(
            id, 
            display_name, 
            avatar_url, 
            rating_avg, 
            ratings_count,
            is_verified_agent,
            total_transactions,
            success_rate,
            response_time_avg
          )
        `)
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform to MarketBid format
      return (data || []).map((item: any) => ({
        id: item.id,
        request_id: item.request_id,
        agent_id: item.agent_id,
        amount: item.total_price,
        currency: item.currency,
        estimated_days: item.estimated_duration_days,
        message: item.proposal_summary,
        status: item.status === 'awarded' ? 'accepted' : 
                item.status === 'rejected' ? 'rejected' : 
                item.status === 'withdrawn' ? 'withdrawn' : 'pending',
        created_at: item.created_at,
        updated_at: item.updated_at,
        agent: item.agent,
      })) as MarketBid[];
    },
    enabled: !!requestId,
  });
}

// Get current user's bids (for agents)
export function useMyBids(status?: string[]) {
  return useQuery({
    queryKey: ['market-bids', 'my-bids', status],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get the market user id
      const { data: marketUser } = await supabase
        .from('market_users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!marketUser) return [];

      let query = supabase
        .from('rfq_quotes')
        .select(`
          id,
          request_id,
          agent_id,
          total_price,
          currency,
          estimated_duration_days,
          proposal_summary,
          status,
          created_at,
          updated_at,
          request:rfq_requests(
            id,
            reference_number,
            title,
            service_category,
            jurisdictions,
            budget_min,
            budget_max,
            budget_currency,
            status,
            requester:market_users!rfq_requests_requester_id_fkey(
              id, display_name, avatar_url
            )
          )
        `)
        .eq('agent_id', marketUser.id)
        .order('created_at', { ascending: false });

      if (status && status.length > 0) {
        query = query.in('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

// Create a new bid on a request
export function useCreateBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBidInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // Get the market user id
      const { data: marketUser } = await supabase
        .from('market_users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!marketUser) throw new Error('No tienes un perfil de agente en el marketplace');

      // Check if already submitted a quote
      const { data: existingQuote } = await supabase
        .from('rfq_quotes')
        .select('id')
        .eq('request_id', input.request_id)
        .eq('agent_id', marketUser.id)
        .maybeSingle();

      if (existingQuote) {
        throw new Error('Ya has enviado una oferta para esta solicitud');
      }

      // Generate reference number
      const refNumber = `QT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const { data, error } = await supabase
        .from('rfq_quotes')
        .insert({
          reference_number: refNumber,
          request_id: input.request_id,
          agent_id: marketUser.id,
          total_price: input.amount,
          currency: input.currency || 'EUR',
          estimated_duration_days: input.estimated_days,
          proposal_summary: input.message,
          price_breakdown: { professional_fees: input.amount },
          payment_terms: 'completion',
          deliverables: [],
          attachments: [],
          questions: [],
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update request quotes_received count manually
      const { data: reqData } = await supabase
        .from('rfq_requests')
        .select('quotes_received')
        .eq('id', input.request_id)
        .single();

      if (reqData) {
        await supabase
          .from('rfq_requests')
          .update({ quotes_received: (reqData.quotes_received || 0) + 1 })
          .eq('id', input.request_id);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['market-bids', 'request', variables.request_id] });
      queryClient.invalidateQueries({ queryKey: ['market-bids', 'my-bids'] });
      queryClient.invalidateQueries({ queryKey: ['rfq-request', variables.request_id] });
      toast.success('Oferta enviada correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al enviar la oferta');
    },
  });
}

// Accept a bid (for request owners)
export function useAcceptBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bidId: string) => {
      // Get the bid details
      const { data: bid, error: bidError } = await supabase
        .from('rfq_quotes')
        .select('request_id')
        .eq('id', bidId)
        .single();

      if (bidError || !bid) throw new Error('Oferta no encontrada');

      // Update accepted bid
      const { error: acceptError } = await supabase
        .from('rfq_quotes')
        .update({ 
          status: 'awarded',
          awarded_at: new Date().toISOString(),
        })
        .eq('id', bidId);

      if (acceptError) throw acceptError;

      // Reject all other bids
      await supabase
        .from('rfq_quotes')
        .update({ 
          status: 'rejected',
          rejected_at: new Date().toISOString(),
        })
        .eq('request_id', bid.request_id)
        .neq('id', bidId);

      // Update request status
      await supabase
        .from('rfq_requests')
        .update({ 
          status: 'awarded',
          awarded_quote_id: bidId,
          awarded_at: new Date().toISOString(),
        })
        .eq('id', bid.request_id);

      return { bidId, requestId: bid.request_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['market-bids', 'request', data.requestId] });
      queryClient.invalidateQueries({ queryKey: ['market-bids', 'my-bids'] });
      queryClient.invalidateQueries({ queryKey: ['rfq-request', data.requestId] });
      toast.success('Oferta aceptada. El agente ha sido notificado.');
    },
    onError: () => {
      toast.error('Error al aceptar la oferta');
    },
  });
}

// Reject a bid (for request owners)
export function useRejectBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bidId, reason }: { bidId: string; reason?: string }) => {
      const { data: bid, error: bidError } = await supabase
        .from('rfq_quotes')
        .select('request_id')
        .eq('id', bidId)
        .single();

      if (bidError || !bid) throw new Error('Oferta no encontrada');

      const { error } = await supabase
        .from('rfq_quotes')
        .update({ 
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', bidId);

      if (error) throw error;
      return { bidId, requestId: bid.request_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['market-bids', 'request', data.requestId] });
      queryClient.invalidateQueries({ queryKey: ['market-bids', 'my-bids'] });
      toast.success('Oferta rechazada');
    },
    onError: () => {
      toast.error('Error al rechazar la oferta');
    },
  });
}

// Withdraw a bid (for agents)
export function useWithdrawBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bidId: string) => {
      const { data: bid, error: bidError } = await supabase
        .from('rfq_quotes')
        .select('request_id')
        .eq('id', bidId)
        .single();

      if (bidError || !bid) throw new Error('Oferta no encontrada');

      const { error } = await supabase
        .from('rfq_quotes')
        .update({ status: 'withdrawn' })
        .eq('id', bidId);

      if (error) throw error;
      return { bidId, requestId: bid.request_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['market-bids', 'request', data.requestId] });
      queryClient.invalidateQueries({ queryKey: ['market-bids', 'my-bids'] });
      toast.success('Oferta retirada');
    },
    onError: () => {
      toast.error('Error al retirar la oferta');
    },
  });
}
