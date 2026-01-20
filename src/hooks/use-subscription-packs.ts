/**
 * Subscription Packs Hook
 * PROMPT 50: Platform Modularization
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionPack {
  id: string;
  code: string;
  name: string;
  tagline: string | null;
  description: string | null;
  pack_type: string;
  included_modules: unknown;
  price_monthly: number;
  price_yearly: number | null;
  currency: string;
  max_users: number | null;
  is_featured: boolean;
  badge_text: string | null;
  display_order: number;
  features_highlight: string[] | null;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  trial_days: number;
}

/**
 * Fetch all public subscription packs for pricing page
 */
export function useSubscriptionPacks() {
  return useQuery({
    queryKey: ['subscription-packs'],
    queryFn: async (): Promise<SubscriptionPack[]> => {
      const { data, error } = await supabase
        .from('subscription_packs')
        .select('*')
        .eq('is_active', true)
        .eq('is_public', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return (data || []).map(pack => ({
        ...pack,
        included_modules: pack.included_modules || [],
        price_yearly: pack.price_yearly ?? null,
        features_highlight: pack.features_highlight ?? null,
        trial_days: (pack as any).trial_days ?? 14,
      })) as SubscriptionPack[];
    },
  });
}

/**
 * Fetch main packs only (for main pricing page)
 */
export function useMainPacks() {
  return useQuery({
    queryKey: ['subscription-packs', 'main'],
    queryFn: async (): Promise<SubscriptionPack[]> => {
      const { data, error } = await supabase
        .from('subscription_packs')
        .select('*')
        .eq('is_active', true)
        .eq('is_public', true)
        .in('code', ['starter', 'professional', 'enterprise'])
        .order('display_order', { ascending: true });

      if (error) throw error;
      return (data || []).map(pack => ({
        ...pack,
        included_modules: pack.included_modules || [],
        price_yearly: pack.price_yearly ?? null,
        features_highlight: pack.features_highlight ?? null,
        trial_days: (pack as any).trial_days ?? 14,
      })) as SubscriptionPack[];
    },
  });
}

/**
 * Fetch standalone packs
 */
export function useStandalonePacks() {
  return useQuery({
    queryKey: ['subscription-packs', 'standalone'],
    queryFn: async (): Promise<SubscriptionPack[]> => {
      const { data, error } = await supabase
        .from('subscription_packs')
        .select('*')
        .eq('is_active', true)
        .eq('is_public', true)
        .eq('pack_type', 'standalone')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return (data || []).map(pack => ({
        ...pack,
        included_modules: pack.included_modules || [],
        price_yearly: pack.price_yearly ?? null,
        features_highlight: pack.features_highlight ?? null,
        trial_days: (pack as any).trial_days ?? 14,
      })) as SubscriptionPack[];
    },
  });
}

/**
 * Get a single pack by code
 */
export function usePack(code: string) {
  return useQuery({
    queryKey: ['subscription-pack', code],
    queryFn: async (): Promise<SubscriptionPack | null> => {
      const { data, error } = await supabase
        .from('subscription_packs')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return {
        ...data,
        included_modules: data.included_modules || [],
        price_yearly: data.price_yearly ?? null,
        features_highlight: data.features_highlight ?? null,
        trial_days: (data as any).trial_days ?? 14,
      } as SubscriptionPack;
    },
    enabled: !!code,
  });
}
