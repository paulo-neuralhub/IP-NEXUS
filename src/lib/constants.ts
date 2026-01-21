// Planes disponibles
export const PLANS = {
  starter: {
    name: 'Starter',
    price: 99,
    expedientes: 50,
    usuarios: 2,
  },
  professional: {
    name: 'Professional',
    price: 249,
    expedientes: 500,
    usuarios: 10,
  },
  business: {
    name: 'Business',
    price: 499,
    expedientes: 2000,
    usuarios: 25,
  },
  enterprise: {
    name: 'Enterprise',
    price: null, // Custom
    expedientes: null, // Unlimited
    usuarios: null, // Unlimited
  },
} as const;

// Add-ons
export const ADDONS = {
  crm: { name: 'CRM', price: 99 },
  marketing: { name: 'Marketing', price: 149 },
  market: { name: 'Market Access', price: 49 },
  genius_spain: { name: 'Genius España', price: 79 },
  genius_europe: { name: 'Genius Europa', price: 149 },
  genius_global: { name: 'Genius Global', price: 249 },
} as const;

// Colores de módulos
export const MODULE_COLORS = {
  dashboard: '#3B82F6',
  docket: '#0EA5E9',
  datahub: '#1E293B',
  spider: '#8B5CF6',
  market: '#10B981',
  genius: '#F59E0B',
  finance: '#14B8A6',
  crm: '#EC4899',
  marketing: '#F97316',
  collab: '#06B6D4',
  alerts: '#EF4444',
  help: '#6B7280',
} as const;

// Colores de backoffice
export const BACKOFFICE_COLORS = {
  dashboard: '#3B82F6',
  ai: '#8B5CF6',
  tenants: '#10B981',
  billing: '#F59E0B',
  analytics: '#0EA5E9',
  crm: '#EC4899',
  marketing: '#F97316',
  calendar: '#14B8A6',
  docs: '#6B7280',
  killswitch: '#EF4444',
} as const;

// Roles del sistema
export const ROLES = {
  owner: { name: 'Propietario', level: 100 },
  admin: { name: 'Administrador', level: 80 },
  manager: { name: 'Gestor', level: 60 },
  member: { name: 'Miembro', level: 40 },
  viewer: { name: 'Visor', level: 20 },
  external: { name: 'Externo', level: 10 },
} as const;
