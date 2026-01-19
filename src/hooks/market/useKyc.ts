// src/hooks/market/useKyc.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KycLevel, KYC_LEVELS, VerificationRecord, VerificationType } from '@/types/kyc.types';
import { toast } from 'sonner';

export interface KycStatus {
  currentLevel: KycLevel;
  nextLevel: KycLevel | null;
  verifications: Record<VerificationType, VerificationRecord | null>;
  completedRequirements: string[];
  pendingRequirements: string[];
  missingRequirements: string[];
  canUpgrade: boolean;
  upgradeBlockers: string[];
}

export function useKycStatus() {
  return useQuery({
    queryKey: ['kyc-status'],
    queryFn: async (): Promise<KycStatus> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user profile with KYC level
      const { data: profile } = await (supabase
        .from('market_user_profiles' as any)
        .select('kyc_level')
        .eq('user_id', user.id)
        .single() as any);

      const currentLevel = (profile?.kyc_level || 0) as KycLevel;
      const nextLevel = currentLevel < 5 ? (currentLevel + 1) as KycLevel : null;

      // Get all verifications
      const { data: verifications } = await (supabase
        .from('market_verifications' as any)
        .select('*')
        .eq('user_id', user.id) as any);

      // Map verifications by type
      const verificationsMap: Record<VerificationType, VerificationRecord | null> = {
        email: null,
        phone: null,
        identity: null,
        address: null,
        source_of_funds: null,
        business: null,
        ubo: null,
        agent_license: null,
        professional_insurance: null,
      };

      verifications?.forEach((v: any) => {
        verificationsMap[v.type as VerificationType] = v as VerificationRecord;
      });

      // Calculate requirements status
      const nextLevelConfig = nextLevel ? KYC_LEVELS[nextLevel] : null;
      const completedRequirements: string[] = [];
      const pendingRequirements: string[] = [];
      const missingRequirements: string[] = [];

      if (nextLevelConfig) {
        for (const req of nextLevelConfig.requirements) {
          const verification = verificationsMap[req as VerificationType];
          if (verification?.status === 'approved') {
            completedRequirements.push(req);
          } else if (verification?.status === 'pending' || verification?.status === 'in_review') {
            pendingRequirements.push(req);
          } else {
            missingRequirements.push(req);
          }
        }
      }

      const canUpgrade = nextLevel !== null && 
        missingRequirements.length === 0 && 
        pendingRequirements.length === 0;

      const upgradeBlockers: string[] = [];
      if (missingRequirements.length > 0) {
        upgradeBlockers.push(`Falta completar: ${missingRequirements.join(', ')}`);
      }
      if (pendingRequirements.length > 0) {
        upgradeBlockers.push(`En revisión: ${pendingRequirements.join(', ')}`);
      }

      return {
        currentLevel,
        nextLevel,
        verifications: verificationsMap,
        completedRequirements,
        pendingRequirements,
        missingRequirements,
        canUpgrade,
        upgradeBlockers,
      };
    },
  });
}

export function useVerificationStatus(type: VerificationType) {
  return useQuery({
    queryKey: ['verification', type],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await (supabase
        .from('market_verifications' as any)
        .select(`
          *,
          documents:market_verification_documents(*)
        `)
        .eq('user_id', user.id)
        .eq('type', type)
        .single() as any);

      if (error && error.code !== 'PGRST116') throw error;
      return data as VerificationRecord | null;
    },
  });
}

export function useStartVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (type: VerificationType) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase
        .from('market_verifications' as any)
        .upsert({
          user_id: user.id,
          type,
          status: 'pending',
          submitted_at: new Date().toISOString(),
          attempt_count: 1,
          last_attempt_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,type',
        })
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: (_, type) => {
      queryClient.invalidateQueries({ queryKey: ['verification', type] });
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
    },
    onError: () => {
      toast.error('Error al iniciar verificación');
    },
  });
}

export function useSubmitVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      type,
      documents,
      metadata,
    }: {
      type: VerificationType;
      documents?: { file: File; documentType: string }[];
      metadata?: Record<string, any>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get or create verification record
      let { data: verification } = await (supabase
        .from('market_verifications' as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('type', type)
        .single() as any);

      if (!verification) {
        const { data: newVerification, error } = await (supabase
          .from('market_verifications' as any)
          .insert({
            user_id: user.id,
            type,
            status: 'pending',
            metadata,
          })
          .select()
          .single() as any);

        if (error) throw error;
        verification = newVerification;
      }

      // Upload documents if provided
      if (documents && documents.length > 0) {
        for (const doc of documents) {
          const fileName = `${user.id}/${type}/${Date.now()}_${doc.file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('verification-documents')
            .upload(fileName, doc.file);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('verification-documents')
            .getPublicUrl(fileName);

          await (supabase
            .from('market_verification_documents' as any)
            .insert({
              verification_id: verification.id,
              user_id: user.id,
              document_type: doc.documentType,
              file_url: urlData.publicUrl,
              file_name: doc.file.name,
              file_size: doc.file.size,
              mime_type: doc.file.type,
            }) as any);
        }
      }

      // Update verification status
      const { data: updated, error: updateError } = await (supabase
        .from('market_verifications' as any)
        .update({
          status: 'in_review',
          submitted_at: new Date().toISOString(),
          metadata,
        })
        .eq('id', verification.id)
        .select()
        .single() as any);

      if (updateError) throw updateError;
      return updated;
    },
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: ['verification', type] });
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
      toast.success('Verificación enviada correctamente');
    },
    onError: () => {
      toast.error('Error al enviar verificación');
    },
  });
}

export function useKycLimits() {
  const { data: kycStatus } = useKycStatus();
  const currentLevel = kycStatus?.currentLevel || 0;
  const limits = KYC_LEVELS[currentLevel as KycLevel].limits;

  const checkTransactionAllowed = (amount: number, action: 'buy' | 'sell' | 'auction') => {
    if (action === 'buy' && !limits.canBuy) {
      return { allowed: false, reason: 'Tu nivel KYC no permite compras', requiredLevel: 1 as KycLevel };
    }
    if (action === 'sell' && !limits.canSell) {
      return { allowed: false, reason: 'Tu nivel KYC no permite ventas', requiredLevel: 2 as KycLevel };
    }
    if (action === 'auction' && !limits.canAuction) {
      return { allowed: false, reason: 'Tu nivel KYC no permite subastas', requiredLevel: 3 as KycLevel };
    }
    if (limits.maxTransactionValue && amount > limits.maxTransactionValue) {
      const requiredLevel = Object.entries(KYC_LEVELS).find(
        ([_, config]) => !config.limits.maxTransactionValue || config.limits.maxTransactionValue >= amount
      )?.[0];
      return {
        allowed: false,
        reason: `El monto excede tu límite de €${limits.maxTransactionValue.toLocaleString()}`,
        requiredLevel: requiredLevel ? parseInt(requiredLevel) as KycLevel : 5 as KycLevel,
      };
    }
    return { allowed: true, reason: null, requiredLevel: null };
  };

  return {
    currentLevel: currentLevel as KycLevel,
    limits,
    checkTransactionAllowed,
  };
}
