// src/hooks/market/useOffers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MarketOffer } from '@/types/market.types';
import { toast } from 'sonner';

export interface CreateOfferInput {
  listingId: string;
  offerType: 'buy' | 'license' | 'negotiate';
  amount: number;
  currency: string;
  message?: string;
  proposedTerms?: Record<string, any>;
  expiresAt?: Date;
}

export function useListingOffers(listingId: string | undefined) {
  return useQuery({
    queryKey: ['listing-offers', listingId],
    queryFn: async () => {
      if (!listingId) return [];

      const { data, error } = await (supabase
        .from('market_offers' as any)
        .select(`
          *,
          buyer:market_user_profiles(
            id, display_name, avatar_url, kyc_level, is_verified_agent
          ),
          counter_offers:market_offers(*)
        `)
        .eq('listing_id', listingId)
        .is('parent_offer_id', null)
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;
      return (data || []) as MarketOffer[];
    },
    enabled: !!listingId,
  });
}

export function useMyOffers(status?: string[]) {
  return useQuery({
    queryKey: ['my-offers', status],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('market_offers' as any)
        .select(`
          *,
          listing:market_listings(
            id, title, asking_price, currency,
            asset:market_assets(id, asset_type, images),
            seller:market_user_profiles(id, display_name, avatar_url)
          )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (status && status.length > 0) {
        query = query.in('status', status);
      }

      const { data, error } = await (query as any);
      if (error) throw error;
      return (data || []) as MarketOffer[];
    },
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOfferInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase
        .from('market_offers' as any)
        .insert({
          listing_id: input.listingId,
          buyer_id: user.id,
          offer_type: input.offerType,
          amount: input.amount,
          currency: input.currency,
          message: input.message,
          proposed_terms: input.proposedTerms,
          expires_at: input.expiresAt?.toISOString(),
          status: 'pending',
        })
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['listing-offers', variables.listingId] });
      queryClient.invalidateQueries({ queryKey: ['my-offers'] });
      toast.success('Oferta enviada');
    },
    onError: () => {
      toast.error('Error al enviar oferta');
    },
  });
}

export function useRespondToOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      offerId,
      response,
      counterAmount,
      counterTerms,
      message,
    }: {
      offerId: string;
      response: 'accept' | 'reject' | 'counter';
      counterAmount?: number;
      counterTerms?: Record<string, any>;
      message?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (response === 'counter') {
        // Get original offer
        const { data: originalOffer } = await (supabase
          .from('market_offers' as any)
          .select('*')
          .eq('id', offerId)
          .single() as any);

        if (!originalOffer) throw new Error('Offer not found');

        // Mark original as countered
        await (supabase
          .from('market_offers' as any)
          .update({ status: 'countered' })
          .eq('id', offerId) as any);

        // Create counter offer
        const { data, error } = await (supabase
          .from('market_offers' as any)
          .insert({
            listing_id: originalOffer.listing_id,
            buyer_id: originalOffer.buyer_id,
            parent_offer_id: offerId,
            offer_type: originalOffer.offer_type,
            amount: counterAmount || originalOffer.amount,
            currency: originalOffer.currency,
            message,
            proposed_terms: counterTerms || originalOffer.proposed_terms,
            status: 'pending',
            is_counter_offer: true,
          })
          .select()
          .single() as any);

        if (error) throw error;
        return data;
      } else {
        // Accept or reject
        const { data, error } = await (supabase
          .from('market_offers' as any)
          .update({
            status: response === 'accept' ? 'accepted' : 'rejected',
            response_message: message,
            responded_at: new Date().toISOString(),
          })
          .eq('id', offerId)
          .select()
          .single() as any);

        if (error) throw error;

        // If accepted, update listing
        if (response === 'accept') {
          await (supabase
            .from('market_listings' as any)
            .update({ status: 'under_offer' })
            .eq('id', data.listing_id) as any);
        }

        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-offers'] });
      queryClient.invalidateQueries({ queryKey: ['my-offers'] });
      toast.success('Respuesta enviada');
    },
    onError: () => {
      toast.error('Error al responder');
    },
  });
}
