/**
 * MODULE REGISTRY
 * Centralized definition of all platform modules
 * PROMPT 50: Platform Modularization
 */

export const MODULE_REGISTRY = {
  core: {
    code: 'core',
    name: 'Core',
    description: 'Funcionalidades base de la plataforma',
    icon: 'LayoutDashboard',
    color: '#3B82F6',
    routes: '/app',
    standalone: false,
    dependencies: [],
    features: {
      basic: ['auth', 'navigation', 'settings'],
    },
  },
  docket: {
    code: 'docket',
    name: 'Docket',
    description: 'Gestión de expedientes de PI',
    icon: 'Briefcase',
    color: '#3B82F6',
    routes: '/app/matters',
    standalone: true,
    dependencies: [],
    features: {
      basic: ['matters_crud', 'tasks_basic', 'documents'],
      pro: ['auto_deadlines', 'email_parsing', 'family_trees', 'bulk_actions'],
      enterprise: ['api', 'custom_rules', 'white_label', 'unlimited'],
    },
    limits: {
      basic: { matters: 50, tasks_per_matter: 20 },
      pro: { matters: 500, tasks_per_matter: -1 },
      enterprise: { matters: -1 },
    },
  },
  crm: {
    code: 'crm',
    name: 'CRM',
    description: 'Gestión de relaciones con clientes',
    icon: 'Users',
    color: '#EC4899',
    routes: '/app/crm',
    standalone: true,
    dependencies: [],
    recommended: ['docket'],
    features: {
      basic: ['contacts', 'companies', 'deals_basic'],
      pro: ['pipeline_custom', 'automation', 'email_tracking', 'activities'],
      enterprise: ['api', 'linkedin_integration', 'custom_fields_unlimited'],
    },
    limits: {
      basic: { contacts: 100, deals: 50 },
      pro: { contacts: 1000, deals: -1 },
      enterprise: { contacts: -1 },
    },
  },
  marketing: {
    code: 'marketing',
    name: 'Marketing',
    description: 'Automatización de marketing',
    icon: 'Megaphone',
    color: '#F59E0B',
    routes: '/app/marketing',
    standalone: false,
    dependencies: ['crm'],
    features: {
      basic: ['templates', 'campaigns_manual', 'lists'],
      pro: ['automation', 'ab_testing', 'analytics'],
      enterprise: ['custom_domain', 'api', 'sms'],
    },
    limits: {
      basic: { emails_month: 1000, campaigns: 5 },
      pro: { emails_month: 10000, campaigns: -1 },
      enterprise: { emails_month: -1 },
    },
  },
  spider: {
    code: 'spider',
    name: 'Spider',
    description: 'Vigilancia de PI',
    icon: 'Radar',
    color: '#8B5CF6',
    routes: '/app/spider',
    standalone: true,
    dependencies: [],
    features: {
      basic: ['watchlists_5', 'eu_gazettes', 'weekly_scan'],
      pro: ['watchlists_25', 'global_gazettes', 'domains', 'daily_scan'],
      enterprise: ['unlimited', 'social', 'marketplaces', '6h_scan', 'api'],
    },
    limits: {
      basic: { watchlists: 5 },
      pro: { watchlists: 25 },
      enterprise: { watchlists: -1 },
    },
  },
  genius: {
    code: 'genius',
    name: 'Genius',
    description: 'Asistente IA para PI',
    icon: 'Sparkles',
    color: '#A855F7',
    routes: '/app/genius',
    standalone: false,
    dependencies: [],
    recommended: ['docket', 'crm'],
    features: {
      basic: ['chat', 'basic_analysis'],
      pro: ['document_analysis', 'personas', 'translator'],
      enterprise: ['training', 'api', 'unlimited'],
    },
    limits: {
      basic: { queries_month: 100 },
      pro: { queries_month: 500 },
      enterprise: { queries_month: -1 },
    },
  },
  finance: {
    code: 'finance',
    name: 'Finance',
    description: 'Facturación y costes',
    icon: 'Wallet',
    color: '#0EA5E9',
    routes: '/app/finance',
    standalone: false,
    dependencies: ['docket'],
    features: {
      basic: ['invoices_basic', 'cost_tracking'],
      pro: ['time_tracking', 'profitability', 'reports', 'multi_currency'],
    },
    limits: {
      basic: { invoices_month: 20 },
      pro: { invoices_month: -1 },
    },
  },
  market: {
    code: 'market',
    name: 'Market',
    description: 'Marketplace de PI',
    icon: 'Store',
    color: '#22C55E',
    routes: '/app/market',
    standalone: true,
    dependencies: [],
    recommended: ['docket'],
    features: {
      browser: ['browse', 'search', 'saved_searches'],
      seller: ['listings', 'analytics', 'messaging'],
      broker: ['unlimited_listings', 'featured', 'api'],
    },
    limits: {
      browser: { view_only: true },
      seller: { listings: 10 },
      broker: { listings: -1 },
    },
  },
  datahub: {
    code: 'datahub',
    name: 'Data Hub',
    description: 'Datos de registros mundiales',
    icon: 'Database',
    color: '#6366F1',
    routes: '/app/datahub',
    standalone: false,
    dependencies: [],
    recommended: ['docket'],
    features: {
      basic: ['search', 'basic_lookup'],
      pro: ['auto_enrich', 'alerts'],
      enterprise: ['api', 'unlimited'],
    },
    limits: {
      basic: { lookups_month: 50 },
      pro: { lookups_month: 500 },
      enterprise: { lookups_month: -1 },
    },
  },
  analytics: {
    code: 'analytics',
    name: 'Analytics',
    description: 'Business Intelligence',
    icon: 'BarChart3',
    color: '#8B5CF6',
    routes: '/app/analytics',
    standalone: false,
    dependencies: [],
    recommended: ['docket', 'crm', 'finance'],
    features: {
      basic: ['dashboard', 'reports_basic'],
      pro: ['custom_dashboards', 'unlimited_reports', 'export', 'scheduled'],
    },
    limits: {
      basic: { reports: 5 },
      pro: { reports: -1 },
    },
  },
  legalops: {
    code: 'legalops',
    name: 'Legal Ops',
    description: 'Operaciones legales avanzadas',
    icon: 'Scale',
    color: '#DC2626',
    routes: '/app/legalops',
    standalone: false,
    dependencies: ['docket', 'crm'],
    recommended: ['finance', 'genius'],
    features: {
      pro: ['client_360', 'comms_hub', 'ai_assistants', 'onboarding'],
      enterprise: ['client_portal', 'workflow_builder', 'custom_forms'],
    },
  },
  migrator: {
    code: 'migrator',
    name: 'Migrator',
    description: 'Importa tus datos',
    icon: 'Upload',
    color: '#94A3B8',
    routes: '/app/settings/import',
    standalone: false,
    dependencies: [],
    features: {
      basic: ['csv_import', 'basic_mapping'],
      pro: ['ai_mapping', 'unlimited_imports'],
    },
    limits: {
      basic: { imports_month: 3 },
      pro: { imports_month: -1 },
    },
  },
  communications: {
    code: 'communications',
    name: 'Comunicaciones',
    description: 'Inbox unificado (Email + WhatsApp) y templates',
    icon: 'MessageSquare',
    color: '#0EA5E9',
    routes: '/app/communications',
    standalone: false,
    dependencies: ['crm'],
    features: {
      basic: ['inbox', 'email', 'whatsapp'],
      pro: ['templates', 'automation_hooks'],
    },
  },
  api: {
    code: 'api',
    name: 'API',
    description: 'API REST para integraciones',
    icon: 'Code',
    color: '#0891B2',
    routes: '/app/settings/api',
    standalone: false,
    dependencies: [],
    features: {
      basic: ['rest_api', 'webhooks'],
      pro: ['graphql', 'priority_support'],
      enterprise: ['dedicated_support', 'sla'],
    },
    limits: {
      basic: { requests_month: 10000 },
      pro: { requests_month: 100000 },
      enterprise: { requests_month: -1 },
    },
  },
} as const;

export type ModuleCode = keyof typeof MODULE_REGISTRY;
export type TierCode = 'basic' | 'pro' | 'enterprise' | 'browser' | 'seller' | 'broker';

export interface ModuleConfig {
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  routes: string;
  standalone: boolean;
  dependencies: readonly string[];
  recommended?: readonly string[];
  features: Record<string, readonly string[]>;
  limits?: Record<string, Record<string, number | boolean>>;
}

/**
 * Get module configuration by code
 */
export function getModule(code: ModuleCode): ModuleConfig {
  return MODULE_REGISTRY[code] as unknown as ModuleConfig;
}

/**
 * Check if a module can work standalone
 */
export function isStandalone(code: ModuleCode): boolean {
  return MODULE_REGISTRY[code].standalone;
}

/**
 * Get dependencies for a module
 */
export function getDependencies(code: ModuleCode): readonly string[] {
  return MODULE_REGISTRY[code].dependencies;
}

/**
 * Get all standalone modules
 */
export function getStandaloneModules(): ModuleCode[] {
  return (Object.keys(MODULE_REGISTRY) as ModuleCode[]).filter(
    code => MODULE_REGISTRY[code].standalone
  );
}

/**
 * Get modules by category
 */
export function getModulesByCategory(): { core: ModuleCode[]; addons: ModuleCode[] } {
  const core: ModuleCode[] = [];
  const addons: ModuleCode[] = [];
  
  (Object.keys(MODULE_REGISTRY) as ModuleCode[]).forEach(code => {
    if (['core', 'docket', 'crm'].includes(code)) {
      core.push(code);
    } else {
      addons.push(code);
    }
  });
  
  return { core, addons };
}
