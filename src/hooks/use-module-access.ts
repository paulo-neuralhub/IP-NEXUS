import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';

export type ModuleCode = 
  | 'core' 
  | 'docket' 
  | 'spider' 
  | 'crm' 
  | 'marketing' 
  | 'market' 
  | 'genius' 
  | 'finance';

export type TierCode = 'basic' | 'pro' | 'enterprise';

export interface ModuleLicense {
  module_code: ModuleCode;
  module_name: string;
  tier_code: TierCode;
  tier_name: string;
  license_type: 'included' | 'addon' | 'standalone' | 'trial';
  status: 'active' | 'suspended' | 'cancelled' | 'expired';
  expires_at: string | null;
  trial_ends_at: string | null;
  features: string[];
  limits: Record<string, number>;
}

export interface PlatformModule {
  id: string;
  code: string;
  name: string;
  description: string | null;
  tagline: string | null;
  category: string;
  is_standalone_available: boolean;
  is_addon_available: boolean;
  tiers: Array<{
    code: string;
    name: string;
    price: number;
    features: string[];
  }>;
  icon: string | null;
  color: string | null;
  base_price_monthly: number | null;
  base_price_yearly: number | null;
}

// Hook para obtener todos los módulos disponibles
export function usePlatformModules() {
  return useQuery({
    queryKey: ['platform-modules'],
    queryFn: async (): Promise<PlatformModule[]> => {
      const { data, error } = await supabase
        .from('platform_modules')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      return (data || []).map((m: any) => ({
        ...m,
        tiers: m.tiers || [],
      })) as PlatformModule[];
    },
  });
}

// Hook para obtener todas las licencias de la organización
export function useOrganizationLicenses() {
  const { currentOrganization } = useOrganization();

  return useQuery({
    queryKey: ['organization-licenses', currentOrganization?.id],
    queryFn: async (): Promise<ModuleLicense[]> => {
      const { data, error } = await supabase
        .from('organization_module_licenses')
        .select(`
          *,
          module:platform_modules(*)
        `)
        .eq('organization_id', currentOrganization!.id)
        .eq('status', 'active');

      if (error) throw error;

      return (data || []).map((license: any) => {
        const tier = license.module?.tiers?.find(
          (t: any) => t.code === license.tier_code
        );

        return {
          module_code: license.module?.code as ModuleCode,
          module_name: license.module?.name || '',
          tier_code: license.tier_code as TierCode,
          tier_name: tier?.name || license.tier_code,
          license_type: license.license_type,
          status: license.status,
          expires_at: license.expires_at,
          trial_ends_at: license.trial_ends_at,
          features: tier?.features || [],
          limits: license.limits_override || {},
        };
      });
    },
    enabled: !!currentOrganization?.id,
  });
}

// Hook para verificar acceso a un módulo específico
export function useModuleAccess(moduleCode: ModuleCode) {
  const { data: licenses, isLoading } = useOrganizationLicenses();

  const license = licenses?.find(l => l.module_code === moduleCode);

  return {
    hasAccess: !!license,
    license,
    isLoading,
    tier: license?.tier_code || null,
    features: license?.features || [],
    isTrialing: license?.trial_ends_at !== null,
    trialDaysLeft: license?.trial_ends_at
      ? Math.ceil((new Date(license.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null,
  };
}

// Hook para verificar si puede usar una feature específica
export function useFeatureAccess(moduleCode: ModuleCode, featureKey: string) {
  const { license, hasAccess } = useModuleAccess(moduleCode);

  if (!hasAccess || !license) {
    return { hasFeature: false, limit: 0, isUnlimited: false };
  }

  const feature = license.features.find(f => f.includes(featureKey));
  
  if (!feature) {
    return { hasFeature: false, limit: 0, isUnlimited: false };
  }

  // Extraer límite numérico si existe (ej: "25_watchlists" -> 25)
  const limitMatch = feature.match(/^(\d+)_/);
  const limit = limitMatch ? parseInt(limitMatch[1]) : -1;

  return {
    hasFeature: true,
    limit,
    isUnlimited: feature.startsWith('unlimited') || limit === -1,
  };
}

// Verificar límite en servidor
export async function checkResourceLimit(
  organizationId: string,
  moduleCode: ModuleCode,
  resourceType: string
): Promise<{ canCreate: boolean; limit: number }> {
  const { data: limit, error } = await supabase.rpc('get_module_limit', {
    p_organization_id: organizationId,
    p_module_code: moduleCode,
    p_limit_key: resourceType,
  });

  if (error) throw error;

  return {
    canCreate: limit === -1 || limit > 0,
    limit: limit || 0,
  };
}
