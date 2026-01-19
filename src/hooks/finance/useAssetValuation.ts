// src/hooks/finance/useAssetValuation.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import type { 
  ValuationInput, 
  Valuation, 
  ValuationMethod, 
  ValuationResult,
  ValuationParameters 
} from '@/types/ip-finance.types';
import { 
  calculateCostApproach, 
  calculateMarketApproach, 
  calculateIncomeApproach,
  calculateConfidence,
  determinePrimaryMethod 
} from '@/lib/services/valuation-engine';
import { toast } from 'sonner';

export function useValuationParameters(assetType?: string) {
  return useQuery({
    queryKey: ['valuation-parameters', assetType],
    queryFn: async () => {
      let query = supabase
        .from('finance_valuation_parameters')
        .select('*');
      
      if (assetType) {
        query = query.eq('asset_type', assetType);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ValuationParameters[];
    },
  });
}

export function useCalculateValuation() {
  return useMutation({
    mutationFn: async ({
      input,
      methods,
    }: {
      input: ValuationInput;
      methods: ValuationMethod[];
    }): Promise<ValuationResult> => {
      // Get valuation parameters
      const { data: paramsArray } = await supabase
        .from('finance_valuation_parameters')
        .select('*')
        .eq('asset_type', input.assetType)
        .limit(1);

      const params = paramsArray?.[0] || null;

      const results: Record<string, number> = {};
      
      // Calculate using each method
      if (methods.includes('cost')) {
        results.cost = calculateCostApproach(input, params);
      }
      if (methods.includes('market')) {
        results.market = calculateMarketApproach(input, params);
      }
      if (methods.includes('income')) {
        results.income = calculateIncomeApproach(input, params);
      }

      // Calculate weighted average
      const values = Object.values(results);
      const avgValue = values.length > 0 
        ? values.reduce((a, b) => a + b, 0) / values.length 
        : 0;

      // Calculate range
      const minValue = values.length > 0 ? Math.min(...values) * 0.9 : 0;
      const maxValue = values.length > 0 ? Math.max(...values) * 1.1 : 0;

      return {
        estimated_value: Math.round(avgValue),
        value_range_low: Math.round(minValue),
        value_range_high: Math.round(maxValue),
        cost_approach_value: results.cost,
        market_approach_value: results.market,
        income_approach_value: results.income,
        confidence_level: calculateConfidence(results, input),
        methods_used: methods,
        primary_method: determinePrimaryMethod(results),
      };
    },
  });
}

export function useSaveValuation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: async ({
      assetId,
      portfolioId,
      valuation,
    }: {
      assetId?: string;
      portfolioId?: string;
      valuation: Partial<Valuation>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const insertData = {
        asset_id: assetId,
        portfolio_id: portfolioId,
        valuation_date: new Date().toISOString().split('T')[0],
        valuation_type: assetId ? 'asset' : 'portfolio',
        created_by: user.id,
        estimated_value: valuation.estimated_value || 0,
        methods_used: valuation.methods_used || [],
        primary_method: valuation.primary_method,
        value_range_low: valuation.value_range_low,
        value_range_high: valuation.value_range_high,
        confidence_level: valuation.confidence_level,
        cost_approach_value: valuation.cost_approach_value,
        market_approach_value: valuation.market_approach_value,
        income_approach_value: valuation.income_approach_value,
        factors: valuation.factors || {},
        ai_analysis: valuation.ai_analysis,
        status: 'draft',
      };

      const { data, error } = await supabase
        .from('finance_valuations')
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;

      // Update asset current value if asset valuation
      if (assetId) {
        await supabase
          .from('finance_portfolio_assets')
          .update({
            current_value: valuation.estimated_value,
            last_valuation_date: new Date().toISOString().split('T')[0],
            valuation_method: valuation.primary_method,
          })
          .eq('id', assetId);
      }

      return data as unknown as Valuation;
    },
    onSuccess: (_, { portfolioId, assetId }) => {
      if (portfolioId) {
        queryClient.invalidateQueries({ queryKey: ['portfolio-valuations', portfolioId] });
        queryClient.invalidateQueries({ queryKey: ['finance-portfolio', portfolioId] });
        queryClient.invalidateQueries({ queryKey: ['finance-portfolios'] });
      }
      if (assetId) {
        queryClient.invalidateQueries({ queryKey: ['asset-valuations', assetId] });
      }
      toast.success('Valoración guardada');
    },
    onError: (error) => {
      toast.error('Error al guardar valoración: ' + error.message);
    },
  });
}

export function useAssetValuations(assetId: string | undefined) {
  return useQuery({
    queryKey: ['asset-valuations', assetId],
    queryFn: async () => {
      if (!assetId) return [];

      const { data, error } = await supabase
        .from('finance_valuations')
        .select('*')
        .eq('asset_id', assetId)
        .order('valuation_date', { ascending: false });

      if (error) throw error;
      return data as unknown as Valuation[];
    },
    enabled: !!assetId,
  });
}

export function useApproveValuation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (valuationId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('finance_valuations')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', valuationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-valuations'] });
      queryClient.invalidateQueries({ queryKey: ['asset-valuations'] });
      toast.success('Valoración aprobada');
    },
  });
}
