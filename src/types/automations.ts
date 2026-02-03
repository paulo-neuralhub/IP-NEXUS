// =====================================================================
// TIPOS PARA EL MOTOR DE AUTOMATIZACIONES
// IP-NEXUS - Sistema de automatizaciones multi-tenant
// =====================================================================

export type AutomationCategory =
  | 'deadlines'
  | 'communication'
  | 'case_management'
  | 'billing'
  | 'ip_surveillance'
  | 'internal'
  | 'reporting'
  | 'custom';

export type AutomationVisibility = 'system' | 'mandatory' | 'recommended' | 'optional';

export type PlanTier = 'free' | 'starter' | 'professional' | 'enterprise';

export type TriggerType =
  | 'db_event'
  | 'field_change'
  | 'cron'
  | 'date_relative'
  | 'webhook'
  | 'manual';

export type ActionType =
  | 'send_email'
  | 'create_notification'
  | 'create_task'
  | 'update_field'
  | 'create_record'
  | 'webhook_call'
  | 'delay'
  | 'condition'
  | 'calculate'
  | 'generate_document';

export type ExecutionStatus =
  | 'running'
  | 'success'
  | 'partial'
  | 'error'
  | 'skipped'
  | 'cancelled';

export type ParamType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'textarea'
  | 'select'
  | 'multi_select'
  | 'number_array'
  | 'string_array'
  | 'date'
  | 'cron_expression'
  | 'email';

// ─── Interfaces ─────────────────────────────────────────────

export interface ConfigurableParam {
  key: string;
  label: string;
  label_en?: string;
  type: ParamType;
  default_value: unknown;
  validation?: Record<string, unknown>;
  description?: string;
  options?: { value: string; label: string }[];
}

export interface TriggerConfig {
  table?: string;
  event?: string;
  field?: string;
  from?: string | null;
  to?: string | null;
  schedule?: string;
  timezone?: string;
  date_field?: string;
  offset_days?: number;
  repeat_offsets?: number[];
  filter?: Record<string, unknown>;
  path?: string;
  auth?: string;
  button_label?: string;
  confirm_message?: string;
}

export interface ConditionConfig {
  field?: string;
  operator?: string;
  value?: unknown;
  value_param?: string;
  logic?: 'AND' | 'OR';
  conditions?: ConditionConfig[];
}

export interface ActionConfig {
  order: number;
  type: ActionType;
  config: Record<string, unknown>;
}

export interface AutomationMasterTemplate {
  id: string;
  code: string;
  name: string;
  name_en?: string;
  description?: string;
  description_en?: string;
  category: AutomationCategory;
  icon: string;
  color: string;
  visibility: AutomationVisibility;
  min_plan_tier: PlanTier;
  trigger_type: TriggerType;
  trigger_config: TriggerConfig;
  conditions: ConditionConfig[];
  actions: ActionConfig[];
  configurable_params: ConfigurableParam[];
  version: number;
  is_published: boolean;
  is_active: boolean;
  tags: string[];
  related_entity?: string;
  sort_order: number;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TenantAutomation {
  id: string;
  organization_id: string;
  master_template_id?: string;
  master_template_version?: number;
  name: string;
  description?: string;
  category: AutomationCategory;
  icon: string;
  is_active: boolean;
  is_custom: boolean;
  is_locked: boolean;
  trigger_type: TriggerType;
  trigger_config: TriggerConfig;
  conditions: ConditionConfig[];
  actions: ActionConfig[];
  custom_params: Record<string, unknown>;
  last_run_at?: string;
  run_count: number;
  success_count: number;
  error_count: number;
  last_error?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  // Joined
  master_template?: AutomationMasterTemplate;
}

export interface AutomationExecution {
  id: string;
  organization_id: string;
  tenant_automation_id: string;
  trigger_type: TriggerType;
  trigger_data: Record<string, unknown>;
  entity_type?: string;
  entity_id?: string;
  status: ExecutionStatus;
  actions_log: ActionLog[];
  error_message?: string;
  retry_count: number;
  max_retries: number;
  next_retry_at?: string;
  duration_ms?: number;
  started_at: string;
  completed_at?: string;
  idempotency_key?: string;
  // Joined
  tenant_automation?: TenantAutomation;
  organization?: { name: string };
}

export interface ActionLog {
  order: number;
  type: ActionType;
  status: 'success' | 'error' | 'skipped';
  started_at: string;
  completed_at: string;
  result?: Record<string, unknown>;
  error?: string;
}

export interface AutomationVariable {
  id: string;
  organization_id: string | null;
  key: string;
  value: string;
  description?: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Constantes de UI ───────────────────────────────────────

export const CATEGORY_CONFIG: Record<AutomationCategory, { label: string; labelEn: string; icon: string; color: string }> = {
  deadlines: { label: 'Plazos y Vencimientos', labelEn: 'Deadlines', icon: '🔔', color: '#EF4444' },
  communication: { label: 'Comunicación', labelEn: 'Communication', icon: '📧', color: '#3B82F6' },
  case_management: { label: 'Gestión de Casos', labelEn: 'Case Management', icon: '📁', color: '#6366F1' },
  billing: { label: 'Facturación', labelEn: 'Billing', icon: '💰', color: '#059669' },
  ip_surveillance: { label: 'Vigilancia PI', labelEn: 'IP Surveillance', icon: '🔍', color: '#8B5CF6' },
  internal: { label: 'Gestión Interna', labelEn: 'Internal', icon: '👥', color: '#F59E0B' },
  reporting: { label: 'Reporting', labelEn: 'Reporting', icon: '📊', color: '#0EA5E9' },
  custom: { label: 'Personalizada', labelEn: 'Custom', icon: '⚡', color: '#6B7280' },
};

export const VISIBILITY_CONFIG: Record<AutomationVisibility, { label: string; labelEn: string; badge: string; color: string; bgClass: string }> = {
  system: { label: 'Sistema', labelEn: 'System', badge: '🔧', color: 'gray', bgClass: 'bg-slate-100 text-slate-700' },
  mandatory: { label: 'Obligatoria', labelEn: 'Mandatory', badge: '🔒', color: 'red', bgClass: 'bg-red-100 text-red-700' },
  recommended: { label: 'Recomendada', labelEn: 'Recommended', badge: '⭐', color: 'blue', bgClass: 'bg-blue-100 text-blue-700' },
  optional: { label: 'Opcional', labelEn: 'Optional', badge: '○', color: 'slate', bgClass: 'bg-slate-100 text-slate-600' },
};

export const TRIGGER_TYPE_CONFIG: Record<TriggerType, { label: string; labelEn: string; icon: string; description: string }> = {
  db_event: { label: 'Evento en BD', labelEn: 'Database Event', icon: '🗄️', description: 'INSERT, UPDATE o DELETE en una tabla' },
  field_change: { label: 'Cambio de campo', labelEn: 'Field Change', icon: '✏️', description: 'Cuando un campo específico cambia de valor' },
  cron: { label: 'Programado', labelEn: 'Scheduled', icon: '⏰', description: 'Ejecutar en horarios programados (cron)' },
  date_relative: { label: 'Fecha relativa', labelEn: 'Relative Date', icon: '📅', description: 'X días antes/después de una fecha' },
  webhook: { label: 'Webhook', labelEn: 'Webhook', icon: '🔗', description: 'HTTP POST desde sistema externo' },
  manual: { label: 'Manual', labelEn: 'Manual', icon: '👆', description: 'Click del usuario' },
};

export const PLAN_TIER_CONFIG: Record<PlanTier, { label: string; order: number; color: string }> = {
  free: { label: 'Free', order: 0, color: '#6B7280' },
  starter: { label: 'Starter', order: 1, color: '#3B82F6' },
  professional: { label: 'Professional', order: 2, color: '#8B5CF6' },
  enterprise: { label: 'Enterprise', order: 3, color: '#F59E0B' },
};

export const ACTION_TYPE_CONFIG: Record<ActionType, { label: string; labelEn: string; icon: string; description: string }> = {
  send_email: { label: 'Enviar email', labelEn: 'Send Email', icon: '📧', description: 'Envía un email usando un template' },
  create_notification: { label: 'Crear notificación', labelEn: 'Create Notification', icon: '🔔', description: 'Notificación in-app para un usuario' },
  create_task: { label: 'Crear tarea', labelEn: 'Create Task', icon: '📋', description: 'Crea una tarea asignada a un usuario' },
  update_field: { label: 'Actualizar campo', labelEn: 'Update Field', icon: '✏️', description: 'Modifica un campo en la base de datos' },
  create_record: { label: 'Crear registro', labelEn: 'Create Record', icon: '➕', description: 'Inserta un nuevo registro en una tabla' },
  webhook_call: { label: 'Llamar webhook', labelEn: 'Call Webhook', icon: '🔗', description: 'HTTP POST a una URL externa' },
  delay: { label: 'Esperar', labelEn: 'Delay', icon: '⏳', description: 'Pausa X tiempo antes de continuar' },
  condition: { label: 'Condición', labelEn: 'Condition', icon: '🔀', description: 'IF/ELSE dentro del flujo' },
  calculate: { label: 'Calcular', labelEn: 'Calculate', icon: '🧮', description: 'Operación sobre valores' },
  generate_document: { label: 'Generar documento', labelEn: 'Generate Document', icon: '📄', description: 'Genera un PDF desde template' },
};

export const EXECUTION_STATUS_CONFIG: Record<ExecutionStatus, { label: string; color: string; bgClass: string }> = {
  running: { label: 'Ejecutando', color: '#3B82F6', bgClass: 'bg-blue-100 text-blue-700' },
  success: { label: 'Exitoso', color: '#22C55E', bgClass: 'bg-green-100 text-green-700' },
  partial: { label: 'Parcial', color: '#F59E0B', bgClass: 'bg-amber-100 text-amber-700' },
  error: { label: 'Error', color: '#EF4444', bgClass: 'bg-red-100 text-red-700' },
  skipped: { label: 'Omitido', color: '#6B7280', bgClass: 'bg-slate-100 text-slate-600' },
  cancelled: { label: 'Cancelado', color: '#6B7280', bgClass: 'bg-slate-100 text-slate-600' },
};

// ─── Helpers ───────────────────────────────────────────────

export function getTriggerDescription(trigger: TriggerType, config: TriggerConfig): string {
  switch (trigger) {
    case 'db_event':
      return `Cuando se hace ${config.event || 'INSERT'} en ${config.table || 'tabla'}`;
    case 'field_change':
      return `Cuando ${config.table}.${config.field} cambia${config.to ? ` a "${config.to}"` : ''}`;
    case 'cron':
      return `Programado: ${config.schedule || '* * * * *'}`;
    case 'date_relative':
      const days = Math.abs(config.offset_days || 0);
      const direction = (config.offset_days || 0) < 0 ? 'antes de' : 'después de';
      return `${days} días ${direction} ${config.table}.${config.date_field}`;
    case 'webhook':
      return `Webhook en ${config.path || '/api/webhook'}`;
    case 'manual':
      return config.button_label || 'Ejecutar manualmente';
    default:
      return 'Trigger desconocido';
  }
}

export function getOperatorLabel(operator: string): string {
  const operators: Record<string, string> = {
    equals: 'es igual a',
    not_equals: 'no es igual a',
    contains: 'contiene',
    not_contains: 'no contiene',
    starts_with: 'empieza con',
    ends_with: 'termina con',
    greater_than: 'mayor que',
    less_than: 'menor que',
    greater_equal: 'mayor o igual que',
    less_equal: 'menor o igual que',
    in: 'está en',
    not_in: 'no está en',
    is_empty: 'está vacío',
    not_empty: 'no está vacío',
    is_true: 'es verdadero',
    is_false: 'es falso',
    between: 'entre',
    not_between: 'no entre',
  };
  return operators[operator] || operator;
}
