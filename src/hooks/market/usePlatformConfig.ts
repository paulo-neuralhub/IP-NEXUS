/**
 * usePlatformConfig — Hook for reading/writing marketplace commission configuration
 */
import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CommissionRates {
  seller_fee_percent: number;
  buyer_fee_percent: number;
  official_fees_commission: number;
  min_platform_fee: number;
  currency: string;
}

export interface MarketplaceSettings {
  request_expiry_days: number;
  offer_validity_days: number;
  max_offers_per_request: number;
  auto_expire_requests: boolean;
  escrow_release_delay_hours: number;
}

const DEFAULT_COMMISSION: CommissionRates = {
  seller_fee_percent: 10,
  buyer_fee_percent: 5,
  official_fees_commission: 0,
  min_platform_fee: 5,
  currency: 'EUR',
};

const DEFAULT_SETTINGS: MarketplaceSettings = {
  request_expiry_days: 30,
  offer_validity_days: 15,
  max_offers_per_request: 20,
  auto_expire_requests: true,
  escrow_release_delay_hours: 24,
};

export function useCommissionRates() {
  return useQuery({
    queryKey: ['market-commission-rates'],
    queryFn: async (): Promise<CommissionRates> => {
      const { data, error } = await (supabase as any)
        .from('market_platform_config')
        .select('config_value')
        .eq('config_key', 'commission_rates')
        .maybeSingle();

      if (error || !data) return DEFAULT_COMMISSION;
      return { ...DEFAULT_COMMISSION, ...(data.config_value as any) };
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useMarketplaceSettings() {
  return useQuery({
    queryKey: ['market-platform-settings'],
    queryFn: async (): Promise<MarketplaceSettings> => {
      const { data, error } = await (supabase as any)
        .from('market_platform_config')
        .select('config_value')
        .eq('config_key', 'marketplace_settings')
        .maybeSingle();

      if (error || !data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...(data.config_value as any) };
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdatePlatformConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase as any)
        .from('market_platform_config')
        .update({
          config_value: value,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('config_key', key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-commission-rates'] });
      queryClient.invalidateQueries({ queryKey: ['market-platform-settings'] });
      toast.success('Configuración guardada');
    },
    onError: () => {
      toast.error('Error al guardar configuración');
    },
  });
}

/**
 * Calculate fees using configurable commission rates
 */
export function calculateFeesWithConfig(
  professionalFees: number,
  officialFees: number,
  config: CommissionRates
) {
  const platformFeeSeller = professionalFees * (config.seller_fee_percent / 100);
  const platformFeeBuyer = professionalFees * (config.buyer_fee_percent / 100);
  const totalBuyerPays = professionalFees + officialFees + platformFeeBuyer;
  const totalSellerReceives = professionalFees - platformFeeSeller;
  const totalPlatformRevenue = platformFeeSeller + platformFeeBuyer;

  return {
    professionalFees,
    officialFees,
    platformFeeSeller,
    platformFeeBuyer,
    totalBuyerPays,
    totalSellerReceives,
    totalPlatformRevenue,
  };
}
