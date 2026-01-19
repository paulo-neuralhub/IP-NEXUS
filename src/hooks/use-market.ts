import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  MarketUserProfile,
  MarketAsset,
  MarketListing,
  MarketTransaction,
  MarketOffer,
  MarketAlert,
  MarketReview,
  AssetType,
  ListingStatus,
  TransactionStatus
} from '@/types/market.types';

// Note: These hooks use type assertions because the market tables 
// are newly created and not yet in the generated Supabase types.
// Once types are regenerated, these can be updated.

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// ============================================
// USER PROFILE HOOKS
// ============================================

export function useMarketProfile() {
  return useQuery({
    queryKey: ['market-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const result = await supabase
        .from('market_user_profiles' as any)
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data, error } = result as unknown as { data: any; error: any };
      if (error && error.code !== 'PGRST116') throw error;
      return data as MarketUserProfile | null;
    }
  });
}

export function useCreateMarketProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Partial<Omit<MarketUserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase
        .from('market_user_profiles' as any)
        .insert({ ...profile, user_id: user.id })
        .select()
        .single() as any);

      if (error) throw error;
      return data as MarketUserProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-profile'] });
    }
  });
}

export function useUpdateMarketProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Partial<Omit<MarketUserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase
        .from('market_user_profiles' as any)
        .update(profile)
        .eq('user_id', user.id)
        .select()
        .single() as any);

      if (error) throw error;
      return data as MarketUserProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-profile'] });
    }
  });
}

// ============================================
// ASSET HOOKS
// ============================================

interface AssetFilters {
  asset_type?: AssetType;
  verification_status?: string;
}

export function useMarketAssets(filters?: AssetFilters) {
  return useQuery({
    queryKey: ['market-assets', filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('market_assets' as any)
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (filters?.asset_type) {
        query = query.eq('asset_type', filters.asset_type);
      }
      if (filters?.verification_status) {
        query = query.eq('verification_status', filters.verification_status);
      }

      const { data, error } = await (query as any);
      if (error) throw error;
      return (data || []) as MarketAsset[];
    }
  });
}

export function useMarketAsset(id: string | undefined) {
  return useQuery({
    queryKey: ['market-asset', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await (supabase
        .from('market_assets' as any)
        .select('*')
        .eq('id', id)
        .single() as any);

      if (error) throw error;
      return data as MarketAsset;
    },
    enabled: !!id
  });
}

export function useCreateMarketAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (asset: Partial<Omit<MarketAsset, 'id' | 'owner_id' | 'created_at' | 'updated_at'>>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase
        .from('market_assets' as any)
        .insert({ ...asset, owner_id: user.id })
        .select()
        .single() as any);

      if (error) throw error;
      return data as MarketAsset;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-assets'] });
    }
  });
}

export function useUpdateMarketAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...asset }: { id: string } & Partial<Omit<MarketAsset, 'id' | 'owner_id' | 'created_at' | 'updated_at'>>) => {
      const { data, error } = await (supabase
        .from('market_assets' as any)
        .update(asset)
        .eq('id', id)
        .select()
        .single() as any);

      if (error) throw error;
      return data as MarketAsset;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['market-assets'] });
      queryClient.invalidateQueries({ queryKey: ['market-asset', variables.id] });
    }
  });
}

// ============================================
// LISTING HOOKS
// ============================================

interface ListingFilters {
  status?: ListingStatus;
  asset_type?: AssetType;
  min_price?: number;
  max_price?: number;
  jurisdiction?: string;
  search?: string;
}

export function useMarketListings(filters?: ListingFilters) {
  return useQuery({
    queryKey: ['market-listings', filters],
    queryFn: async () => {
      let query = supabase
        .from('market_listings' as any)
        .select('*, asset:market_assets(*), seller:market_user_profiles(*)')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.min_price) {
        query = query.gte('asking_price', filters.min_price);
      }
      if (filters?.max_price) {
        query = query.lte('asking_price', filters.max_price);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await (query as any);
      if (error) throw error;
      return (data || []) as (MarketListing & { asset: MarketAsset; seller: MarketUserProfile })[];
    }
  });
}

export function useMyListings() {
  return useQuery({
    queryKey: ['my-listings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await (supabase
        .from('market_listings' as any)
        .select('*, asset:market_assets(*)')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;
      return (data || []) as (MarketListing & { asset: MarketAsset })[];
    }
  });
}

export function useMarketListing(id: string | undefined) {
  return useQuery({
    queryKey: ['market-listing', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await (supabase
        .from('market_listings' as any)
        .select('*, asset:market_assets(*), seller:market_user_profiles(*)')
        .eq('id', id)
        .single() as any);

      if (error) throw error;
      return data as MarketListing & { asset: MarketAsset; seller: MarketUserProfile };
    },
    enabled: !!id
  });
}

export function useCreateMarketListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listing: Partial<Omit<MarketListing, 'id' | 'listing_number' | 'seller_id' | 'created_at' | 'updated_at'>>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const listingNumber = `LST-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      const { data, error } = await (supabase
        .from('market_listings' as any)
        .insert({ 
          ...listing, 
          seller_id: user.id,
          listing_number: listingNumber
        })
        .select()
        .single() as any);

      if (error) throw error;
      return data as MarketListing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    }
  });
}

export function useUpdateMarketListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...listing }: { id: string } & Partial<Omit<MarketListing, 'id' | 'listing_number' | 'seller_id' | 'created_at' | 'updated_at'>>) => {
      const { data, error } = await (supabase
        .from('market_listings' as any)
        .update(listing)
        .eq('id', id)
        .select()
        .single() as any);

      if (error) throw error;
      return data as MarketListing;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['market-listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      queryClient.invalidateQueries({ queryKey: ['market-listing', variables.id] });
    }
  });
}

// ============================================
// TRANSACTION HOOKS
// ============================================

export function useMarketTransactions(filters?: { status?: TransactionStatus; role?: 'buyer' | 'seller' }) {
  return useQuery({
    queryKey: ['market-transactions', filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('market_transactions' as any)
        .select('*, listing:market_listings(*), asset:market_assets(*)')
        .order('created_at', { ascending: false });

      if (filters?.role === 'buyer') {
        query = query.eq('buyer_id', user.id);
      } else if (filters?.role === 'seller') {
        query = query.eq('seller_id', user.id);
      } else {
        query = query.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await (query as any);
      if (error) throw error;
      return (data || []) as MarketTransaction[];
    }
  });
}

export function useMarketTransaction(id: string | undefined) {
  return useQuery({
    queryKey: ['market-transaction', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await (supabase
        .from('market_transactions' as any)
        .select('*, listing:market_listings(*), asset:market_assets(*)')
        .eq('id', id)
        .single() as any);

      if (error) throw error;
      return data as MarketTransaction;
    },
    enabled: !!id
  });
}

export function useCreateMarketTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: Partial<Omit<MarketTransaction, 'id' | 'transaction_number' | 'buyer_id' | 'created_at' | 'updated_at'>>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase
        .from('market_transactions' as any)
        .insert({ 
          ...transaction, 
          buyer_id: user.id,
          transaction_number: `TRX-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
        })
        .select()
        .single() as any);

      if (error) throw error;
      return data as MarketTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-transactions'] });
    }
  });
}

export function useUpdateMarketTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...transaction }: { id: string } & Partial<Omit<MarketTransaction, 'id' | 'transaction_number' | 'created_at' | 'updated_at'>>) => {
      const { data, error } = await (supabase
        .from('market_transactions' as any)
        .update(transaction)
        .eq('id', id)
        .select()
        .single() as any);

      if (error) throw error;
      return data as MarketTransaction;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['market-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['market-transaction', variables.id] });
    }
  });
}

// ============================================
// OFFER HOOKS
// ============================================

export function useMarketOffers(listingId?: string) {
  return useQuery({
    queryKey: ['market-offers', listingId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('market_offers' as any)
        .select('*, listing:market_listings(*), buyer:market_user_profiles(*)')
        .order('created_at', { ascending: false });

      if (listingId) {
        query = query.eq('listing_id', listingId);
      }

      const { data, error } = await (query as any);
      if (error) throw error;
      return (data || []) as MarketOffer[];
    }
  });
}

export function useCreateMarketOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offer: Partial<Omit<MarketOffer, 'id' | 'buyer_id' | 'created_at' | 'updated_at'>>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase
        .from('market_offers' as any)
        .insert({ ...offer, buyer_id: user.id })
        .select()
        .single() as any);

      if (error) throw error;
      return data as MarketOffer;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['market-offers'] });
      if (variables.listing_id) {
        queryClient.invalidateQueries({ queryKey: ['market-offers', variables.listing_id] });
      }
    }
  });
}

export function useRespondToOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, response_message }: { id: string; status: 'accepted' | 'rejected'; response_message?: string }) => {
      const { data, error } = await (supabase
        .from('market_offers' as any)
        .update({ 
          status, 
          response_message,
          responded_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single() as any);

      if (error) throw error;
      return data as MarketOffer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-offers'] });
    }
  });
}

// ============================================
// FAVORITES HOOKS
// ============================================

export function useMarketFavorites() {
  return useQuery({
    queryKey: ['market-favorites'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await (supabase
        .from('market_favorites' as any)
        .select('*, listing:market_listings(*, asset:market_assets(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;
      return (data || []) as any[];
    }
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listingId, isFavorite }: { listingId: string; isFavorite: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (isFavorite) {
        const { error } = await (supabase
          .from('market_favorites' as any)
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId) as any);

        if (error) throw error;
        return { action: 'removed' as const };
      } else {
        const { data, error } = await (supabase
          .from('market_favorites' as any)
          .insert({ user_id: user.id, listing_id: listingId })
          .select()
          .single() as any);

        if (error) throw error;
        return { action: 'added' as const, data };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-favorites'] });
    }
  });
}

// ============================================
// ALERTS HOOKS
// ============================================

export function useMarketAlerts() {
  return useQuery({
    queryKey: ['market-alerts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await (supabase
        .from('market_alerts' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;
      return (data || []) as MarketAlert[];
    }
  });
}

export function useCreateMarketAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alert: Partial<Omit<MarketAlert, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase
        .from('market_alerts' as any)
        .insert({ ...alert, user_id: user.id })
        .select()
        .single() as any);

      if (error) throw error;
      return data as MarketAlert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-alerts'] });
    }
  });
}

export function useUpdateMarketAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...alert }: { id: string } & Partial<Omit<MarketAlert, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      const { data, error } = await (supabase
        .from('market_alerts' as any)
        .update(alert)
        .eq('id', id)
        .select()
        .single() as any);

      if (error) throw error;
      return data as MarketAlert;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-alerts'] });
    }
  });
}

export function useDeleteMarketAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from('market_alerts' as any)
        .delete()
        .eq('id', id) as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-alerts'] });
    }
  });
}

// ============================================
// REVIEWS HOOKS
// ============================================

export function useMarketReviews(userId?: string) {
  return useQuery({
    queryKey: ['market-reviews', userId],
    queryFn: async () => {
      let query = supabase
        .from('market_reviews' as any)
        .select('*, reviewer:market_user_profiles(*)')
        .eq('visible', true)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('reviewed_id', userId);
      }

      const { data, error } = await (query as any);
      if (error) throw error;
      return (data || []) as MarketReview[];
    }
  });
}

export function useCreateMarketReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: Partial<Omit<MarketReview, 'id' | 'reviewer_id' | 'created_at' | 'updated_at'>>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase
        .from('market_reviews' as any)
        .insert({ ...review, reviewer_id: user.id })
        .select()
        .single() as any);

      if (error) throw error;
      return data as MarketReview;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-reviews'] });
    }
  });
}

// ============================================
// MESSAGES HOOKS
// ============================================

export function useMarketMessages(threadId?: string) {
  return useQuery({
    queryKey: ['market-messages', threadId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('market_messages' as any)
        .select('*')
        .order('created_at', { ascending: true });

      if (threadId) {
        query = query.eq('thread_id', threadId);
      } else {
        query = query.or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);
      }

      const { data, error } = await (query as any);
      if (error) throw error;
      return (data || []) as any[];
    }
  });
}

export function useSendMarketMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: { thread_id: string; recipient_id: string; message: string; listing_id?: string; transaction_id?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase
        .from('market_messages' as any)
        .insert({ ...message, sender_id: user.id })
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['market-messages', variables.thread_id] });
    }
  });
}
