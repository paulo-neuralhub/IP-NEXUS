// =============================================
// HOOK: useModules
// src/hooks/useModules.ts
// =============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import type {
  PlatformModule,
  SubscriptionPlan,
  ModuleWithStatus,
  ModuleVisualStatus,
  SidebarSection,
  TenantModulesSummary,
  CanActivateResult,
  ModuleAccessType,
  ModuleStatus,
} from '@/types/modules';

// =============================================
// Tipos internos para BD
// =============================================

interface DBPlatformModule {
  id: string;
  code: string;
  name: string;
  short_name: string | null;
  description: string | null;
  tagline: string | null;
  sidebar_section: string | null;
  sidebar_order: number;
  sidebar_icon: string | null;
  sidebar_expanded_default: boolean;
  icon: string;
  icon_lucide: string | null;
  color: string;
  color_secondary: string | null;
  price_standalone_monthly: number | null;
  price_standalone_yearly: number | null;
  price_addon_monthly: number | null;
  price_addon_yearly: number | null;
  category: string;
  requires_modules: string[] | null;
  menu_items: unknown;
  default_limits: unknown;
  is_popular: boolean;
  is_coming_soon: boolean;
  is_beta: boolean;
  sort_order: number;
  is_active: boolean;
}

interface DBModuleLicense {
  id: string;
  organization_id: string;
  module_id: string;
  license_type: string;
  tier_code: string | null;
  status: string;
  trial_ends_at: string | null;
  starts_at: string;
  expires_at: string | null;
  module?: DBPlatformModule;
}

// =============================================
// Hook principal
// =============================================

export function useModules() {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  const tenantId = currentOrganization?.id;

  // -----------------------------------------
  // Query: Módulos de la plataforma
  // -----------------------------------------
  const {
    data: platformModulesRaw = [],
    isLoading: loadingModules,
  } = useQuery({
    queryKey: ['platform-modules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_modules')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return (data || []) as DBPlatformModule[];
    },
    staleTime: 1000 * 60 * 10,
  });

  // Convertir a tipo PlatformModule
  const platformModules: PlatformModule[] = useMemo(() => 
    platformModulesRaw.map(m => ({
      ...m,
      requires_modules: m.requires_modules || [],
      features: [],
      menu_items: Array.isArray(m.menu_items) ? m.menu_items : [],
      default_limits: typeof m.default_limits === 'object' ? m.default_limits as Record<string, number> : {},
      category: m.category as PlatformModule['category'],
      display_order: m.sort_order, // Map DB sort_order to display_order
    }))
  , [platformModulesRaw]);

  // -----------------------------------------
  // Query: Planes de suscripción
  // -----------------------------------------
  const {
    data: plansRaw = [],
    isLoading: loadingPlans,
  } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  // Normalizar planes
  const plans: SubscriptionPlan[] = useMemo(() => 
    plansRaw.map(p => ({
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
      tagline: p.tagline || null,
      price_monthly: Number(p.price_monthly) || 0,
      price_yearly: p.price_yearly ? Number(p.price_yearly) : null,
      max_users: p.max_users || 1,
      max_matters: p.max_matters || 10,
      max_clients: p.max_clients || 5,
      max_contacts: p.max_contacts || 20,
      max_storage_gb: p.max_storage_gb || 1,
      max_documents_month: p.max_documents_month || 50,
      included_modules: p.included_modules || [],
      modules_to_choose: p.modules_to_choose || 1,
      max_addon_modules: p.max_addon_modules || 0,
      addon_discount_percent: p.addon_discount_percent || 0,
      included_voice_minutes: p.included_voice_minutes || 0,
      included_sms: p.included_sms || 0,
      included_whatsapp: p.included_whatsapp || 0,
      included_emails: p.included_emails || 100,
      included_ai_queries: p.included_ai_queries || 10,
      features: typeof p.features === 'object' ? p.features as Record<string, boolean> : {},
      icon: p.icon || null,
      color: p.color || null,
      badge: p.badge || null,
      is_popular: p.is_popular || false,
      is_enterprise: p.is_enterprise || false,
      trial_days: p.trial_days || 14,
      display_order: p.display_order || 0,
    }))
  , [plansRaw]);

  // -----------------------------------------
  // Query: Suscripción del tenant
  // -----------------------------------------
  const {
    data: subscription,
    isLoading: loadingSubscription,
  } = useQuery({
    queryKey: ['tenant-subscription', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('organization_id', tenantId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  // -----------------------------------------
  // Query: Módulos activos del tenant
  // -----------------------------------------
  const {
    data: tenantModulesRaw = [],
    isLoading: loadingTenantModules,
  } = useQuery({
    queryKey: ['organization-module-licenses', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from('organization_module_licenses')
        .select('*, module:platform_modules(*)')
        .eq('organization_id', tenantId)
        .eq('status', 'active');

      if (error) throw error;
      return (data || []) as DBModuleLicense[];
    },
    enabled: !!tenantId,
  });

  // Convertir a formato interno
  const tenantModules = useMemo(() => 
    tenantModulesRaw.map(tm => ({
      id: tm.id,
      tenant_id: tm.organization_id,
      module_code: tm.module?.code || '',
      access_type: tm.license_type as ModuleAccessType,
      status: tm.status as ModuleStatus,
      trial_ends_at: tm.trial_ends_at,
      activated_at: tm.starts_at,
      expires_at: tm.expires_at,
    }))
  , [tenantModulesRaw]);

  // -----------------------------------------
  // Calcular plan actual
  // -----------------------------------------
  const currentPlan = useMemo(() => {
    const planCode = subscription?.plan_id;
    if (!planCode) return plans.find(p => p.code === 'free') || null;
    return plans.find(p => p.id === planCode || p.code === planCode) || null;
  }, [subscription, plans]);

  // -----------------------------------------
  // Verificar si tiene módulo
  // -----------------------------------------
  const hasModule = useCallback((moduleCode: string): boolean => {
    return tenantModules.some(
      tm => tm.module_code === moduleCode && ['active', 'trialing'].includes(tm.status)
    );
  }, [tenantModules]);

  // -----------------------------------------
  // Obtener módulo del tenant
  // -----------------------------------------
  const getTenantModule = useCallback((moduleCode: string) => {
    return tenantModules.find(tm => tm.module_code === moduleCode);
  }, [tenantModules]);

  // -----------------------------------------
  // Verificar dependencias
  // -----------------------------------------
  const checkDependencies = useCallback((moduleCode: string): { 
    satisfied: boolean; 
    missing: string[];
    missingNames: string[];
  } => {
    const module = platformModules.find(m => m.code === moduleCode);
    if (!module || !module.requires_modules?.length) {
      return { satisfied: true, missing: [], missingNames: [] };
    }

    const missing = module.requires_modules.filter(dep => !hasModule(dep));
    const missingNames = missing.map(code => 
      platformModules.find(m => m.code === code)?.name || code
    );

    return {
      satisfied: missing.length === 0,
      missing,
      missingNames,
    };
  }, [platformModules, hasModule]);

  // -----------------------------------------
  // Verificar si puede activar
  // -----------------------------------------
  const canActivateModule = useCallback((moduleCode: string): CanActivateResult => {
    const module = platformModules.find(m => m.code === moduleCode);
    
    if (!module) {
      return { can_activate: false, reason: 'module_not_found' };
    }

    if (hasModule(moduleCode)) {
      return { can_activate: false, reason: 'already_active' };
    }

    const deps = checkDependencies(moduleCode);
    if (!deps.satisfied) {
      return { 
        can_activate: false, 
        reason: 'missing_dependencies',
        missing_modules: deps.missingNames,
      };
    }

    // Verificar límite de addons
    const currentAddons = tenantModules.filter(tm => tm.access_type === 'addon').length;
    const maxAddons = currentPlan?.max_addon_modules ?? 0;

    if (maxAddons >= 0 && currentAddons >= maxAddons) {
      return {
        can_activate: false,
        reason: 'addon_limit_reached',
        current_addons: currentAddons,
        max_addons: maxAddons,
      };
    }

    return { can_activate: true };
  }, [platformModules, hasModule, checkDependencies, tenantModules, currentPlan]);

  // -----------------------------------------
  // Calcular precio efectivo
  // -----------------------------------------
  const getModulePrice = useCallback((moduleCode: string): {
    price: number | null;
    hasDiscount: boolean;
    discountPercent: number;
    originalPrice: number | null;
  } => {
    const module = platformModules.find(m => m.code === moduleCode);
    if (!module) return { price: null, hasDiscount: false, discountPercent: 0, originalPrice: null };

    const originalPrice = module.price_addon_monthly;
    const discountPercent = currentPlan?.addon_discount_percent || 0;
    
    if (!originalPrice) return { price: null, hasDiscount: false, discountPercent: 0, originalPrice: null };

    const price = discountPercent > 0 
      ? originalPrice * (1 - discountPercent / 100)
      : originalPrice;

    return {
      price: Math.round(price * 100) / 100,
      hasDiscount: discountPercent > 0,
      discountPercent,
      originalPrice,
    };
  }, [platformModules, currentPlan]);

  // -----------------------------------------
  // Calcular módulos con estado
  // -----------------------------------------
  const modulesWithStatus: ModuleWithStatus[] = useMemo(() => {
    return platformModules.map(module => {
      const tenantModule = getTenantModule(module.code);
      const deps = checkDependencies(module.code);
      const priceInfo = getModulePrice(module.code);
      const canActivate = canActivateModule(module.code);

      // Determinar estado visual
      let visual_status: ModuleVisualStatus = 'locked';
      
      if (module.is_coming_soon) {
        visual_status = 'coming_soon';
      } else if (tenantModule?.status === 'active') {
        visual_status = 'active';
      } else if (tenantModule?.status === 'trialing') {
        visual_status = 'trial';
      } else if (!deps.satisfied) {
        visual_status = 'unavailable';
      }

      // Calcular días restantes de trial
      let trial_days_remaining: number | undefined;
      if (tenantModule?.trial_ends_at) {
        const daysLeft = Math.ceil(
          (new Date(tenantModule.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        trial_days_remaining = Math.max(0, daysLeft);
      }

      return {
        ...module,
        visual_status,
        is_accessible: ['active', 'trial'].includes(visual_status),
        can_activate: canActivate.can_activate,
        tenant_module: tenantModule,
        access_type: tenantModule?.access_type,
        trial_days_remaining,
        missing_dependencies: deps.missing,
        dependency_names: deps.missingNames,
        effective_price: priceInfo.price,
        has_discount: priceInfo.hasDiscount,
        discount_percent: priceInfo.discountPercent,
      };
    });
  }, [platformModules, getTenantModule, checkDependencies, getModulePrice, canActivateModule]);

  // -----------------------------------------
  // Agrupar por secciones del sidebar
  // -----------------------------------------
  const sidebarSections: SidebarSection[] = useMemo(() => {
    const sections: Record<string, SidebarSection> = {};

    modulesWithStatus.forEach(module => {
      const sectionCode = module.sidebar_section || 'otros';
      
      if (!sections[sectionCode]) {
        sections[sectionCode] = {
          code: sectionCode,
          name: sectionCode.charAt(0).toUpperCase() + sectionCode.slice(1),
          label: sectionCode.toUpperCase(),
          icon: null,
          order: 99,
          is_always_visible: false,
          modules: [],
        };
      }
      
      sections[sectionCode].modules.push(module);
    });

    // Ordenar módulos dentro de cada sección
    Object.values(sections).forEach(section => {
      section.modules.sort((a, b) => a.sidebar_order - b.sidebar_order);
    });

    // Convertir a array y ordenar secciones
    const sectionOrder: Record<string, number> = {
      'gestion': 1,
      'operaciones': 2,
      'inteligencia': 3,
      'extensiones': 4,
    };

    return Object.values(sections).sort((a, b) => 
      (sectionOrder[a.code] || 99) - (sectionOrder[b.code] || 99)
    );
  }, [modulesWithStatus]);

  // -----------------------------------------
  // Resumen de módulos
  // -----------------------------------------
  const modulesSummary: TenantModulesSummary = useMemo(() => {
    const active = modulesWithStatus.filter(m => m.visual_status === 'active');
    const trial = modulesWithStatus.filter(m => m.visual_status === 'trial');
    const available = modulesWithStatus.filter(m => m.visual_status === 'locked' && m.can_activate);
    const locked = modulesWithStatus.filter(m => m.visual_status === 'locked' && !m.can_activate);
    const coming = modulesWithStatus.filter(m => m.visual_status === 'coming_soon');

    const addons = tenantModules.filter(tm => tm.access_type === 'addon');
    const addonCost = addons.reduce((sum, addon) => {
      const price = getModulePrice(addon.module_code);
      return sum + (price.price || 0);
    }, 0);

    return {
      active_modules: active,
      trial_modules: trial,
      available_modules: available,
      locked_modules: locked,
      coming_soon_modules: coming,
      total_active: active.length + trial.length,
      total_addons: addons.length,
      max_addons_allowed: currentPlan?.max_addon_modules ?? 0,
      can_add_more_addons: (currentPlan?.max_addon_modules ?? 0) < 0 || 
        addons.length < (currentPlan?.max_addon_modules ?? 0),
      monthly_addon_cost: addonCost,
    };
  }, [modulesWithStatus, tenantModules, currentPlan, getModulePrice]);

  // -----------------------------------------
  // Mutación: Iniciar trial de módulo
  // -----------------------------------------
  const startModuleTrial = useMutation({
    mutationFn: async (moduleCode: string) => {
      if (!tenantId) throw new Error('No tenant');

      const canActivate = canActivateModule(moduleCode);
      if (!canActivate.can_activate) {
        throw new Error(canActivate.reason || 'No se puede activar');
      }

      const module = platformModules.find(m => m.code === moduleCode);
      if (!module) throw new Error('Módulo no encontrado');

      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14 días de trial

      const { error } = await supabase
        .from('organization_module_licenses')
        .insert({
          organization_id: tenantId,
          module_id: module.id,
          license_type: 'trial',
          status: 'active',
          tier_code: 'trial',
          trial_ends_at: trialEndsAt.toISOString(),
          starts_at: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: (_, moduleCode) => {
      queryClient.invalidateQueries({ queryKey: ['organization-module-licenses'] });
      const module = platformModules.find(m => m.code === moduleCode);
      toast.success(`¡Trial de ${module?.name || moduleCode} activado!`, {
        description: 'Tienes 14 días para probarlo gratis.',
      });
    },
    onError: (error) => {
      toast.error('Error al activar trial', {
        description: error.message,
      });
    },
  });

  // -----------------------------------------
  // Return
  // -----------------------------------------
  return {
    // Datos
    platformModules,
    plans,
    subscription,
    currentPlan,
    tenantModules,
    modulesWithStatus,
    sidebarSections,
    modulesSummary,

    // Estados de carga
    isLoading: loadingModules || loadingPlans || loadingSubscription || loadingTenantModules,
    loadingModules,
    loadingPlans,
    loadingSubscription,
    loadingTenantModules,

    // Funciones de verificación
    hasModule,
    getTenantModule,
    checkDependencies,
    canActivateModule,
    getModulePrice,

    // Acciones
    startModuleTrial: startModuleTrial.mutate,
    isStartingTrial: startModuleTrial.isPending,
  };
}

// =============================================
// Tipo exportado del hook
// =============================================
export type UseModulesReturn = ReturnType<typeof useModules>;
