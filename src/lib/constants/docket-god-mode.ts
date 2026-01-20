// =============================================
// DOCKET GOD MODE - CONSTANTS
// =============================================

export const TASK_TYPES = {
  renewal: { label: 'Renovación', icon: 'RefreshCw', color: '#22C55E' },
  opposition: { label: 'Oposición', icon: 'Shield', color: '#EF4444' },
  response: { label: 'Respuesta', icon: 'MessageSquare', color: '#3B82F6' },
  payment: { label: 'Pago', icon: 'CreditCard', color: '#F59E0B' },
  filing: { label: 'Presentación', icon: 'FileText', color: '#8B5CF6' },
  review: { label: 'Revisión', icon: 'Eye', color: '#0EA5E9' },
  deadline: { label: 'Plazo', icon: 'Clock', color: '#EC4899' },
  custom: { label: 'Personalizada', icon: 'Settings', color: '#6B7280' },
} as const;

export const TASK_STATUSES = {
  pending: { label: 'Pendiente', color: '#F59E0B', icon: 'Clock' },
  in_progress: { label: 'En progreso', color: '#3B82F6', icon: 'Play' },
  completed: { label: 'Completada', color: '#22C55E', icon: 'CheckCircle' },
  cancelled: { label: 'Cancelada', color: '#6B7280', icon: 'XCircle' },
  overdue: { label: 'Vencida', color: '#EF4444', icon: 'AlertTriangle' },
} as const;

export const TASK_PRIORITIES = {
  low: { label: 'Baja', color: '#6B7280', icon: 'ArrowDown' },
  medium: { label: 'Media', color: '#F59E0B', icon: 'Minus' },
  high: { label: 'Alta', color: '#F97316', icon: 'ArrowUp' },
  critical: { label: 'Crítica', color: '#EF4444', icon: 'AlertOctagon' },
} as const;

export const RELATION_TYPES = {
  priority: { label: 'Prioridad', description: 'Reclama prioridad de' },
  continuation: { label: 'Continuación', description: 'Continuación de' },
  divisional: { label: 'Divisional', description: 'División de' },
  conversion: { label: 'Conversión', description: 'Conversión de' },
  national_phase: { label: 'Fase Nacional', description: 'Fase nacional de' },
  regional_phase: { label: 'Fase Regional', description: 'Fase regional de' },
  pct_filing: { label: 'Solicitud PCT', description: 'PCT basado en' },
  madrid_filing: { label: 'Marca Madrid', description: 'Madrid basado en' },
  hague_filing: { label: 'Diseño Haya', description: 'Haya basado en' },
  parent: { label: 'Padre', description: 'Expediente padre' },
  child: { label: 'Hijo', description: 'Expediente hijo' },
} as const;

export const TRIGGER_EVENTS = {
  filing_date: { label: 'Fecha de presentación', field: 'filing_date' },
  registration_date: { label: 'Fecha de registro', field: 'registration_date' },
  expiry_date: { label: 'Fecha de expiración', field: 'expiry_date' },
  publication_date: { label: 'Fecha de publicación', field: 'publication_date' },
  grant_date: { label: 'Fecha de concesión', field: 'grant_date' },
} as const;

export const RULE_TYPES = {
  renewal: { label: 'Renovación', description: 'Plazos de renovación' },
  opposition: { label: 'Oposición', description: 'Plazos de oposición' },
  response: { label: 'Respuesta', description: 'Plazos de respuesta a oficina' },
  annuity: { label: 'Anualidad', description: 'Pagos de anualidades' },
  maintenance: { label: 'Mantenimiento', description: 'Tasas de mantenimiento' },
  publication: { label: 'Publicación', description: 'Alertas de publicación' },
  custom: { label: 'Personalizada', description: 'Regla personalizada' },
} as const;

export const EMAIL_INGESTION_STATUS = {
  pending: { label: 'Pendiente', color: '#F59E0B' },
  processing: { label: 'Procesando', color: '#3B82F6' },
  completed: { label: 'Completado', color: '#22C55E' },
  failed: { label: 'Fallido', color: '#EF4444' },
  manual_review: { label: 'Revisión manual', color: '#8B5CF6' },
} as const;

// Default jurisdiction rules (system rules)
export const DEFAULT_JURISDICTION_RULES = [
  // EUIPO - Marcas
  {
    jurisdiction_code: 'EU',
    ip_type: 'trademark',
    rule_type: 'renewal',
    rule_name: 'Renovación marca UE',
    description: 'La marca de la UE debe renovarse cada 10 años',
    base_days: -180, // 6 meses antes de expiración
    trigger_event: 'expiry_date',
    business_days_only: false,
    exclude_holidays: false,
    is_system: true,
  },
  {
    jurisdiction_code: 'EU',
    ip_type: 'trademark',
    rule_type: 'opposition',
    rule_name: 'Plazo oposición marca UE',
    description: 'Plazo de 3 meses para oposición desde publicación',
    base_days: 90,
    trigger_event: 'publication_date',
    business_days_only: false,
    exclude_holidays: false,
    is_system: true,
  },
  // OEPM - España
  {
    jurisdiction_code: 'ES',
    ip_type: 'trademark',
    rule_type: 'renewal',
    rule_name: 'Renovación marca España',
    description: 'La marca española debe renovarse cada 10 años',
    base_days: -180,
    trigger_event: 'expiry_date',
    business_days_only: false,
    exclude_holidays: false,
    is_system: true,
  },
  {
    jurisdiction_code: 'ES',
    ip_type: 'trademark',
    rule_type: 'opposition',
    rule_name: 'Plazo oposición marca España',
    description: 'Plazo de 2 meses para oposición desde publicación',
    base_days: 60,
    trigger_event: 'publication_date',
    business_days_only: true,
    exclude_holidays: true,
    is_system: true,
  },
  // USPTO - EEUU
  {
    jurisdiction_code: 'US',
    ip_type: 'trademark',
    rule_type: 'renewal',
    rule_name: 'Renovación marca USA',
    description: 'Declaration of Use entre años 5-6, luego cada 10 años',
    base_days: -180,
    trigger_event: 'expiry_date',
    business_days_only: false,
    exclude_holidays: false,
    is_system: true,
  },
  {
    jurisdiction_code: 'US',
    ip_type: 'trademark',
    rule_type: 'maintenance',
    rule_name: 'Section 8 Declaration',
    description: 'Declaración de uso entre 5º y 6º año',
    base_days: 1825, // 5 años
    trigger_event: 'registration_date',
    business_days_only: false,
    exclude_holidays: false,
    is_system: true,
  },
  // Patentes
  {
    jurisdiction_code: 'ES',
    ip_type: 'patent',
    rule_type: 'annuity',
    rule_name: 'Anualidad patente España',
    description: 'Pago de anualidad cada año desde presentación',
    base_days: 365,
    trigger_event: 'filing_date',
    business_days_only: false,
    exclude_holidays: false,
    is_system: true,
  },
  {
    jurisdiction_code: 'EU',
    ip_type: 'patent',
    rule_type: 'annuity',
    rule_name: 'Anualidad patente europea',
    description: 'Tasa de renovación anual EPO',
    base_days: 365,
    trigger_event: 'filing_date',
    business_days_only: false,
    exclude_holidays: false,
    is_system: true,
  },
] as const;

// Common Spanish holidays
export const SPANISH_HOLIDAYS_2025 = [
  { date: '2025-01-01', name: 'Año Nuevo' },
  { date: '2025-01-06', name: 'Epifanía del Señor' },
  { date: '2025-04-18', name: 'Viernes Santo' },
  { date: '2025-05-01', name: 'Fiesta del Trabajo' },
  { date: '2025-08-15', name: 'Asunción de la Virgen' },
  { date: '2025-10-12', name: 'Fiesta Nacional de España' },
  { date: '2025-11-01', name: 'Todos los Santos' },
  { date: '2025-12-06', name: 'Día de la Constitución' },
  { date: '2025-12-08', name: 'Inmaculada Concepción' },
  { date: '2025-12-25', name: 'Navidad' },
];

export const SPANISH_HOLIDAYS_2026 = [
  { date: '2026-01-01', name: 'Año Nuevo' },
  { date: '2026-01-06', name: 'Epifanía del Señor' },
  { date: '2026-04-03', name: 'Viernes Santo' },
  { date: '2026-05-01', name: 'Fiesta del Trabajo' },
  { date: '2026-08-15', name: 'Asunción de la Virgen' },
  { date: '2026-10-12', name: 'Fiesta Nacional de España' },
  { date: '2026-11-01', name: 'Todos los Santos' },
  { date: '2026-12-06', name: 'Día de la Constitución' },
  { date: '2026-12-08', name: 'Inmaculada Concepción' },
  { date: '2026-12-25', name: 'Navidad' },
];

export type TaskType = keyof typeof TASK_TYPES;
export type TaskStatus = keyof typeof TASK_STATUSES;
export type TaskPriority = keyof typeof TASK_PRIORITIES;
export type RelationType = keyof typeof RELATION_TYPES;
export type TriggerEvent = keyof typeof TRIGGER_EVENTS;
export type RuleType = keyof typeof RULE_TYPES;
