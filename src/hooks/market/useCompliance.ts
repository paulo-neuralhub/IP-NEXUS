// src/hooks/market/useCompliance.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ComplianceCheck, RiskAssessment, RiskLevel } from '@/types/kyc.types';
import { toast } from 'sonner';

export function useComplianceChecks(userId?: string) {
  return useQuery({
    queryKey: ['compliance-checks', userId],
    queryFn: async () => {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!targetUserId) return [];

      const { data, error } = await (supabase
        .from('market_compliance_checks' as any)
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;
      return data as ComplianceCheck[];
    },
    enabled: true,
  });
}

export function useRiskAssessment(userId?: string) {
  return useQuery({
    queryKey: ['risk-assessment', userId],
    queryFn: async () => {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!targetUserId) return null;

      const { data, error } = await (supabase
        .from('market_risk_assessments' as any)
        .select('*')
        .eq('user_id', targetUserId)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .single() as any);

      if (error && error.code !== 'PGRST116') throw error;
      return data as RiskAssessment | null;
    },
  });
}

export function useRunComplianceCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      checkType,
    }: {
      userId: string;
      checkType: 'aml' | 'sanctions' | 'pep' | 'adverse_media';
    }) => {
      const { data, error } = await supabase.functions.invoke('run-compliance-check', {
        body: { userId, checkType },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['compliance-checks', userId] });
      queryClient.invalidateQueries({ queryKey: ['risk-assessment', userId] });
      toast.success('Verificación de compliance completada');
    },
    onError: () => {
      toast.error('Error en verificación de compliance');
    },
  });
}

export function useCalculateRiskScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Get user data for risk calculation
      const { data: profile } = await (supabase
        .from('market_user_profiles' as any)
        .select('*')
        .eq('user_id', userId)
        .single() as any);

      const { data: transactions } = await (supabase
        .from('market_transactions' as any)
        .select('agreed_price, currency, status')
        .or(`buyer_id.eq.${userId}`)
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()) as any);

      const { data: complianceChecks } = await (supabase
        .from('market_compliance_checks' as any)
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'flagged') as any);

      // Calculate risk factors
      const kycLevel = profile?.kyc_level || 0;
      const transactionVolume = transactions?.reduce((sum: number, tx: any) => sum + (tx.agreed_price || 0), 0) || 0;
      const transactionCount = transactions?.length || 0;
      const flaggedChecks = complianceChecks?.length || 0;

      // Simple risk scoring (0-100)
      let score = 0;
      
      // KYC level (lower level = higher risk)
      score += (5 - kycLevel) * 10;
      
      // Transaction volume
      if (transactionVolume > 100000) score += 15;
      else if (transactionVolume > 50000) score += 10;
      else if (transactionVolume > 10000) score += 5;
      
      // Transaction frequency
      if (transactionCount > 10) score += 10;
      
      // Flagged compliance checks
      score += flaggedChecks * 20;

      // Determine level
      let level: RiskLevel = 'low';
      if (score >= 70) level = 'critical';
      else if (score >= 50) level = 'high';
      else if (score >= 30) level = 'medium';

      // Save assessment
      const { data, error } = await (supabase
        .from('market_risk_assessments' as any)
        .insert({
          user_id: userId,
          overall_score: score,
          overall_level: level,
          factors: {
            kyc_level: kycLevel,
            transaction_volume: transactionVolume,
            transaction_frequency: transactionCount,
            flagged_checks: flaggedChecks,
          },
          flags: flaggedChecks > 0 ? ['compliance_flags'] : [],
          recommendations: score >= 50 ? ['enhanced_monitoring'] : [],
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['risk-assessment', userId] });
    },
  });
}
