// src/hooks/finance/usePortfolioValuation.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { FinancePortfolio, PortfolioAsset, PortfolioMetrics } from '@/types/ip-finance.types';
import { toast } from 'sonner';

export function usePortfolios() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['finance-portfolios', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('finance_portfolios')
        .select('*')
        .eq('organization_id', currentOrganization!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FinancePortfolio[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function usePortfolio(portfolioId: string | undefined) {
  return useQuery({
    queryKey: ['finance-portfolio', portfolioId],
    queryFn: async () => {
      if (!portfolioId) return null;

      const { data, error } = await supabase
        .from('finance_portfolios')
        .select('*')
        .eq('id', portfolioId)
        .single();

      if (error) throw error;

      // Get assets separately
      const { data: assets } = await supabase
        .from('finance_portfolio_assets')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('title');

      return { ...data, assets: assets || [] } as FinancePortfolio;
    },
    enabled: !!portfolioId,
  });
}

export function useCreatePortfolio() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async (data: Partial<FinancePortfolio>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: portfolio, error } = await supabase
        .from('finance_portfolios')
        .insert({
          organization_id: currentOrganization!.id,
          name: data.name || 'Nuevo Portfolio',
          description: data.description,
          currency: data.currency || 'EUR',
          valuation_frequency: data.valuation_frequency || 'quarterly',
          auto_revalue: data.auto_revalue ?? true,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return portfolio as FinancePortfolio;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-portfolios'] });
      toast.success('Portfolio creado');
    },
    onError: (error) => {
      toast.error('Error al crear portfolio: ' + error.message);
    },
  });
}

export function useUpdatePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FinancePortfolio> }) => {
      const { data: portfolio, error } = await supabase
        .from('finance_portfolios')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return portfolio as FinancePortfolio;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['finance-portfolios'] });
      queryClient.invalidateQueries({ queryKey: ['finance-portfolio', id] });
      toast.success('Portfolio actualizado');
    },
  });
}

export function useDeletePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('finance_portfolios')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-portfolios'] });
      toast.success('Portfolio eliminado');
    },
  });
}

// Portfolio Assets
export function usePortfolioAssets(portfolioId: string | undefined) {
  return useQuery({
    queryKey: ['portfolio-assets', portfolioId],
    queryFn: async () => {
      if (!portfolioId) return [];

      const { data, error } = await supabase
        .from('finance_portfolio_assets')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('title');

      if (error) throw error;
      return data as PortfolioAsset[];
    },
    enabled: !!portfolioId,
  });
}

export function useAddAssetToPortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ portfolioId, asset }: { portfolioId: string; asset: Partial<PortfolioAsset> }) => {
      const { data, error } = await supabase
        .from('finance_portfolio_assets')
        .insert({
          portfolio_id: portfolioId,
          asset_type: asset.asset_type || 'trademark',
          title: asset.title || 'Sin título',
          ...asset,
        })
        .select()
        .single();

      if (error) throw error;
      return data as PortfolioAsset;
    },
    onSuccess: (_, { portfolioId }) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-assets', portfolioId] });
      queryClient.invalidateQueries({ queryKey: ['finance-portfolio', portfolioId] });
      queryClient.invalidateQueries({ queryKey: ['finance-portfolios'] });
      toast.success('Activo añadido al portfolio');
    },
  });
}

export function useUpdatePortfolioAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, portfolioId, data }: { id: string; portfolioId: string; data: Partial<PortfolioAsset> }) => {
      const { data: asset, error } = await supabase
        .from('finance_portfolio_assets')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return asset as PortfolioAsset;
    },
    onSuccess: (_, { portfolioId }) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-assets', portfolioId] });
      queryClient.invalidateQueries({ queryKey: ['finance-portfolio', portfolioId] });
    },
  });
}

export function useRemoveAssetFromPortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, portfolioId }: { id: string; portfolioId: string }) => {
      const { error } = await supabase
        .from('finance_portfolio_assets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { portfolioId }) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-assets', portfolioId] });
      queryClient.invalidateQueries({ queryKey: ['finance-portfolio', portfolioId] });
      queryClient.invalidateQueries({ queryKey: ['finance-portfolios'] });
      toast.success('Activo eliminado del portfolio');
    },
  });
}

// Valuation History
export function usePortfolioValuationHistory(portfolioId: string | undefined) {
  return useQuery({
    queryKey: ['portfolio-valuations', portfolioId],
    queryFn: async () => {
      if (!portfolioId) return [];

      const { data, error } = await supabase
        .from('finance_valuations')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('valuation_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!portfolioId,
  });
}

// Portfolio Metrics
export function usePortfolioMetrics(portfolioId: string | undefined): PortfolioMetrics | null {
  const { data: portfolio } = usePortfolio(portfolioId);
  const { data: valuations } = usePortfolioValuationHistory(portfolioId);

  if (!portfolio) return null;

  const totalValue = portfolio.total_value || 0;
  const totalCost = portfolio.total_cost || 0;
  const unrealizedGain = totalValue - totalCost;
  const roi = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

  // Value change from last valuation
  const lastValuation = valuations?.[1];
  const valueChange = lastValuation 
    ? totalValue - (lastValuation.estimated_value || 0)
    : 0;
  const valueChangePercent = lastValuation && lastValuation.estimated_value > 0
    ? (valueChange / lastValuation.estimated_value) * 100
    : 0;

  return {
    totalValue,
    totalCost,
    unrealizedGain,
    roi,
    valueChange,
    valueChangePercent,
    assetCount: portfolio.total_assets || 0,
    currency: portfolio.currency,
  };
}
