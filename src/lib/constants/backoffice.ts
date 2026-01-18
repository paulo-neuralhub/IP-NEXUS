// ===== CONSTANTES BACKOFFICE =====
// Generado desde PROMPT 8A

export const SUBSCRIPTION_STATUSES = {
  trialing: { label: 'En prueba', color: 'hsl(var(--module-genius))', icon: 'Clock' },
  active: { label: 'Activa', color: 'hsl(var(--success))', icon: 'CheckCircle' },
  past_due: { label: 'Pago pendiente', color: 'hsl(var(--warning))', icon: 'AlertTriangle' },
  canceled: { label: 'Cancelada', color: 'hsl(var(--muted-foreground))', icon: 'XCircle' },
  unpaid: { label: 'Impagada', color: 'hsl(var(--destructive))', icon: 'AlertOctagon' },
  paused: { label: 'Pausada', color: 'hsl(var(--muted-foreground))', icon: 'Pause' },
} as const;

export const PLAN_FEATURES = {
  docket: { label: 'Gestión de expedientes', icon: 'Folder' },
  crm: { label: 'CRM completo', icon: 'Users' },
  crm_basic: { label: 'CRM básico', icon: 'Users' },
  spider: { label: 'Vigilancia IP', icon: 'Eye' },
  spider_basic: { label: 'Vigilancia básica', icon: 'Eye' },
  genius: { label: 'Asistente IA', icon: 'Sparkles' },
  finance: { label: 'Facturación', icon: 'DollarSign' },
  marketing: { label: 'Marketing completo', icon: 'Mail' },
  marketing_basic: { label: 'Marketing básico', icon: 'Mail' },
  api_access: { label: 'Acceso API', icon: 'Code' },
  audit_logs: { label: 'Logs de auditoría', icon: 'FileText' },
  custom_branding: { label: 'Marca personalizada', icon: 'Palette' },
  priority_support: { label: 'Soporte prioritario', icon: 'Headphones' },
  dedicated_account_manager: { label: 'Account Manager', icon: 'UserCheck' },
  sso: { label: 'Single Sign-On', icon: 'Key' },
  custom_integrations: { label: 'Integraciones custom', icon: 'Plug' },
} as const;

export const FEEDBACK_TYPES = {
  bug: { label: 'Error', color: 'hsl(var(--destructive))', icon: 'Bug' },
  feature: { label: 'Nueva función', color: 'hsl(var(--primary))', icon: 'Lightbulb' },
  improvement: { label: 'Mejora', color: 'hsl(var(--success))', icon: 'TrendingUp' },
  question: { label: 'Pregunta', color: 'hsl(var(--module-genius))', icon: 'HelpCircle' },
  other: { label: 'Otro', color: 'hsl(var(--muted-foreground))', icon: 'MoreHorizontal' },
} as const;

export const FEEDBACK_STATUSES = {
  new: { label: 'Nuevo', color: 'hsl(var(--primary))' },
  reviewing: { label: 'En revisión', color: 'hsl(var(--module-genius))' },
  planned: { label: 'Planificado', color: 'hsl(var(--success))' },
  in_progress: { label: 'En progreso', color: 'hsl(var(--warning))' },
  resolved: { label: 'Resuelto', color: 'hsl(var(--success))' },
  closed: { label: 'Cerrado', color: 'hsl(var(--muted-foreground))' },
} as const;

export const FEEDBACK_PRIORITIES = {
  low: { label: 'Baja', color: 'hsl(var(--muted-foreground))' },
  normal: { label: 'Normal', color: 'hsl(var(--primary))' },
  high: { label: 'Alta', color: 'hsl(var(--warning))' },
  urgent: { label: 'Urgente', color: 'hsl(var(--destructive))' },
} as const;

export const SETTING_CATEGORIES = {
  general: { label: 'General', icon: 'Settings' },
  email: { label: 'Email', icon: 'Mail' },
  integrations: { label: 'Integraciones', icon: 'Plug' },
  security: { label: 'Seguridad', icon: 'Shield' },
  billing: { label: 'Facturación', icon: 'CreditCard' },
  limits: { label: 'Límites', icon: 'Gauge' },
  ui: { label: 'Interfaz', icon: 'Layout' },
} as const;

export const AUDIT_ACTIONS = {
  INSERT: { label: 'Crear', color: 'hsl(var(--success))' },
  UPDATE: { label: 'Actualizar', color: 'hsl(var(--primary))' },
  DELETE: { label: 'Eliminar', color: 'hsl(var(--destructive))' },
  login: { label: 'Login', color: 'hsl(var(--module-genius))' },
  logout: { label: 'Logout', color: 'hsl(var(--muted-foreground))' },
  export: { label: 'Exportar', color: 'hsl(var(--warning))' },
  import: { label: 'Importar', color: 'hsl(var(--success))' },
  invite: { label: 'Invitar', color: 'hsl(var(--primary))' },
} as const;

export const ANNOUNCEMENT_TYPES = {
  info: { label: 'Información', color: 'hsl(var(--primary))', icon: 'Info' },
  warning: { label: 'Advertencia', color: 'hsl(var(--warning))', icon: 'AlertTriangle' },
  success: { label: 'Éxito', color: 'hsl(var(--success))', icon: 'CheckCircle' },
  error: { label: 'Error', color: 'hsl(var(--destructive))', icon: 'XCircle' },
} as const;

export const SUPERADMIN_PERMISSIONS = [
  'all',
  'view_organizations',
  'manage_organizations',
  'view_users',
  'manage_users',
  'view_subscriptions',
  'manage_subscriptions',
  'view_metrics',
  'manage_settings',
  'manage_feature_flags',
  'manage_announcements',
  'view_audit_logs',
  'manage_feedback',
  'impersonate_users',
] as const;

export const INVITATION_STATUSES = {
  pending: { label: 'Pendiente', color: 'hsl(var(--warning))' },
  accepted: { label: 'Aceptada', color: 'hsl(var(--success))' },
  expired: { label: 'Expirada', color: 'hsl(var(--muted-foreground))' },
  revoked: { label: 'Revocada', color: 'hsl(var(--destructive))' },
} as const;

export const BILLING_CYCLES = {
  monthly: { label: 'Mensual', discount: 0 },
  yearly: { label: 'Anual', discount: 0.17 }, // ~2 meses gratis
} as const;

// Límites legibles
export const PLAN_LIMIT_LABELS: Record<string, string> = {
  max_users: 'Usuarios',
  max_matters: 'Expedientes',
  max_storage_gb: 'Almacenamiento (GB)',
  max_contacts: 'Contactos',
  max_ai_messages_day: 'Mensajes IA/día',
  max_ai_docs_month: 'Documentos IA/mes',
  max_email_campaigns_month: 'Campañas email/mes',
  max_watchlists: 'Listas de vigilancia',
};

// Helper para formatear límites (-1 = ilimitado)
export function formatLimit(value: number): string {
  if (value === -1) return 'Ilimitado';
  return value.toLocaleString('es-ES');
}

// Helper para verificar si tiene feature
export function hasFeature(planFeatures: string[], feature: string): boolean {
  return planFeatures.includes(feature);
}

// Helper para calcular precio con descuento anual
export function calculateAnnualPrice(monthlyPrice: number): number {
  const yearlyWithDiscount = monthlyPrice * 12 * (1 - BILLING_CYCLES.yearly.discount);
  return Math.round(yearlyWithDiscount);
}

// Helper para calcular ahorro anual
export function calculateAnnualSavings(monthlyPrice: number): number {
  const yearlyWithoutDiscount = monthlyPrice * 12;
  const yearlyWithDiscount = calculateAnnualPrice(monthlyPrice);
  return yearlyWithoutDiscount - yearlyWithDiscount;
}
