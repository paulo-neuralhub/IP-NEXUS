// =============================================
// TIPOS: Sistema de Módulos IP-NEXUS
// src/types/modules.ts
// =============================================

// Categorías de módulos
export type ModuleCategory = 'standalone' | 'addon' | 'transversal' | 'core';

// Estados de módulo para el tenant
export type ModuleStatus = 'active' | 'trialing' | 'suspended' | 'expired' | 'canceled';

// Tipos de acceso al módulo
export type ModuleAccessType = 'included' | 'selected' | 'addon' | 'trial' | 'promotional';

// Estados de suscripción
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused' | 'incomplete';

// Ciclo de facturación
export type BillingCycle = 'monthly' | 'yearly';

// =============================================
// Interfaces principales
// =============================================

// Feature de un módulo
export interface ModuleFeature {
  title: string;
  description?: string;
  icon?: string;
}

// Item del menú del módulo
export interface ModuleMenuItem {
  label: string;
  path: string;
  icon?: string;
  badge?: string; // 'deadlines' | 'tasks' | 'alerts' - para contadores dinámicos
}

// Módulo de la plataforma (desde BD)
export interface PlatformModule {
  id: string;
  code: string;
  name: string;
  short_name: string | null;
  description: string | null;
  tagline: string | null;
  
  // Sidebar
  sidebar_section: string | null;
  sidebar_order: number;
  sidebar_icon: string | null;
  sidebar_expanded_default: boolean;
  
  // Visual
  icon: string;
  icon_lucide: string | null;
  color: string;
  color_secondary: string | null;
  
  // Pricing
  price_standalone_monthly: number | null;
  price_standalone_yearly: number | null;
  price_addon_monthly: number | null;
  price_addon_yearly: number | null;
  
  // Categoría y dependencias
  category: ModuleCategory;
  requires_modules: string[];
  
  // Features y menú
  features: ModuleFeature[];
  menu_items: ModuleMenuItem[];
  default_limits: Record<string, number>;
  
  // Marketing
  is_popular: boolean;
  is_coming_soon: boolean;
  is_beta: boolean;
  
  // Control
  display_order: number;
  is_active: boolean;
}

// Plan de suscripción (desde BD)
export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  tagline: string | null;
  
  // Precios
  price_monthly: number;
  price_yearly: number | null;
  
  // Límites
  max_users: number;
  max_matters: number;
  max_clients: number;
  max_contacts: number;
  max_storage_gb: number;
  max_documents_month: number;
  
  // Módulos
  included_modules: string[];
  modules_to_choose: number;
  max_addon_modules: number;
  addon_discount_percent: number;
  
  // Comunicaciones incluidas
  included_voice_minutes: number;
  included_sms: number;
  included_whatsapp: number;
  included_emails: number;
  included_ai_queries: number;
  
  // Features
  features: Record<string, boolean>;
  
  // Visual
  icon: string | null;
  color: string | null;
  badge: string | null;
  is_popular: boolean;
  is_enterprise: boolean;
  
  trial_days: number;
  display_order: number;
}

// Suscripción del tenant (desde BD)
export interface TenantSubscription {
  id: string;
  tenant_id: string;
  plan_code: string;
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  
  trial_start_at: string | null;
  trial_end_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  cancel_at_period_end: boolean;
  
  selected_modules: string[];
  
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  
  // Relación con plan (join)
  plan?: SubscriptionPlan;
}

// Módulo activo del tenant (desde BD)
export interface TenantModule {
  id: string;
  tenant_id: string;
  module_code: string;
  access_type: ModuleAccessType;
  status: ModuleStatus;
  trial_ends_at: string | null;
  activated_at: string;
  expires_at: string | null;
  
  // Relación con módulo (join)
  module?: PlatformModule;
}

// =============================================
// Tipos para UI
// =============================================

// Estado visual del módulo
export type ModuleVisualStatus = 'active' | 'trial' | 'locked' | 'coming_soon' | 'unavailable';

// Módulo con estado calculado para UI
export interface ModuleWithStatus extends PlatformModule {
  // Estado calculado
  visual_status: ModuleVisualStatus;
  is_accessible: boolean;
  can_activate: boolean;
  
  // Info del tenant (si está activo)
  tenant_module?: TenantModule;
  access_type?: ModuleAccessType;
  trial_days_remaining?: number;
  
  // Dependencias
  missing_dependencies: string[];
  dependency_names: string[];
  
  // Precio efectivo
  effective_price: number | null;
  has_discount: boolean;
  discount_percent: number;
}

// Sección del sidebar
export interface SidebarSection {
  code: string;
  name: string;
  label: string | null;
  icon: string | null;
  order: number;
  is_always_visible: boolean;
  modules: ModuleWithStatus[];
}

// Resumen de módulos del tenant
export interface TenantModulesSummary {
  active_modules: ModuleWithStatus[];
  trial_modules: ModuleWithStatus[];
  available_modules: ModuleWithStatus[];
  locked_modules: ModuleWithStatus[];
  coming_soon_modules: ModuleWithStatus[];
  
  total_active: number;
  total_addons: number;
  max_addons_allowed: number;
  can_add_more_addons: boolean;
  
  monthly_addon_cost: number;
}

// Resultado de verificación de activación
export interface CanActivateResult {
  can_activate: boolean;
  reason?: 'already_active' | 'missing_dependencies' | 'addon_limit_reached' | 'module_not_found';
  missing_modules?: string[];
  current_addons?: number;
  max_addons?: number;
}

// =============================================
// TIPOS: Categorías de Add-ons
// =============================================

export type AddonCategory = 
  | 'jurisdictions'
  | 'communications'
  | 'integrations'
  | 'storage'
  | 'support';

export interface PlatformAddon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  icon: string | null;
  flag_emoji: string | null;
  price_monthly: number;
  price_yearly: number;
  applies_to_modules: string[];
  is_popular: boolean;
  is_included_free: boolean;
  is_visible: boolean;
  display_order: number;
}

export interface TenantAddon {
  id: string;
  tenant_id: string;
  addon_code: string;
  status: 'active' | 'trialing' | 'canceled';
  access_type: 'included' | 'paid' | 'trial' | 'promotional';
  activated_at: string;
  trial_ends_at: string | null;
  expires_at: string | null;
}

export interface AddonWithStatus extends PlatformAddon {
  is_active: boolean;
  tenant_addon?: TenantAddon;
}

// Configuración de categorías de addons para UI
export const ADDON_CATEGORY_CONFIG: Record<string, { 
  label: string; 
  icon: string; 
  description: string;
}> = {
  jurisdictions: {
    label: 'Jurisdicciones',
    icon: '🌍',
    description: 'Cobertura geográfica para expedientes y vigilancia',
  },
  communications: {
    label: 'Comunicaciones',
    icon: '📞',
    description: 'Canales de comunicación con clientes',
  },
  integrations: {
    label: 'Integraciones',
    icon: '🔌',
    description: 'Conecta con herramientas externas',
  },
  storage: {
    label: 'Almacenamiento',
    icon: '💾',
    description: 'Espacio adicional para documentos',
  },
  support: {
    label: 'Soporte',
    icon: '🎯',
    description: 'Soporte prioritario y dedicado',
  },
};
