// ============================================================
// IP-NEXUS - EXTENDED DEADLINE TYPES
// Types for the enhanced deadline system
// ============================================================

export type DeadlineCriticality = 'low' | 'normal' | 'high' | 'critical' | 'absolute';

export type DeadlineStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'extended'
  | 'waived'
  | 'missed'
  | 'expired';

export type TriggerEvent =
  | 'filing_date'
  | 'priority_date'
  | 'publication_date'
  | 'registration_date'
  | 'grant_date'
  | 'expiry_date'
  | 'office_action_date'
  | 'opposition_filed_date'
  | 'appeal_filed_date'
  | 'international_filing_date'
  | 'designation_date'
  | 'previous_deadline'
  | 'renewal_base_date'
  | 'manual_date';

export type TimeUnit = 'days' | 'weeks' | 'months' | 'years';

export type CalendarType = 'jurisdiction' | 'wipo' | 'epo' | 'custom';

// ============================================================
// DEADLINE RULE (for automatic calculation)
// ============================================================

export interface DeadlineRuleExtended {
  id: string;
  code: string;
  name_en: string;
  name_es: string | null;
  description: string | null;
  
  // Scope
  jurisdiction_id: string | null;
  right_type: string | null;
  applies_to_phase: string | null;
  
  // Trigger
  trigger_event: TriggerEvent;
  trigger_field: string | null;
  
  // Calculation
  time_unit: TimeUnit;
  time_value: number;
  adjust_to_end_of_month: boolean;
  adjust_to_business_day: boolean;
  business_day_direction: 'forward' | 'backward';
  calendar_type: CalendarType;
  
  // Criticality & Alerts
  criticality: DeadlineCriticality;
  alert_days: number[];
  escalate_days_before: number | null;
  escalate_to_role: string | null;
  
  // Extensions
  is_extendable: boolean;
  max_extensions: number | null;
  extension_time_value: number | null;
  extension_time_unit: TimeUnit | null;
  extension_requires_fee: boolean;
  
  // Consequences
  consequence_if_missed: string | null;
  can_be_revived: boolean;
  revival_period_days: number | null;
  revival_requires_petition: boolean;
  
  // Metadata
  category: string | null;
  legal_basis: string | null;
  legal_url: string | null;
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
  
  // Joined data
  jurisdiction?: {
    id: string;
    code: string;
    name_en: string;
    flag_emoji: string | null;
  };
}

// ============================================================
// MATTER DEADLINE (calculated/manual deadline for a matter)
// ============================================================

export interface MatterDeadlineExtended {
  id: string;
  organization_id: string;
  matter_id: string;
  rule_id: string | null;
  rule_code: string | null;
  deadline_type: string | null;
  
  // Core info
  title: string;
  description: string | null;
  trigger_date: string | null;
  deadline_date: string;
  original_deadline: string | null;
  
  // Status
  status: DeadlineStatus;
  priority: string | null;
  criticality: DeadlineCriticality;
  
  // Completion
  completed_at: string | null;
  completed_by: string | null;
  completion_notes: string | null;
  
  // Extensions
  extension_count: number;
  extension_reason: string | null;
  extended_by: string | null;
  max_extensions: number | null;
  last_extended_date: string | null;
  
  // Assignment
  assigned_to: string | null;
  assigned_team: string | null;
  
  // Alerts
  alerts_enabled: boolean;
  alert_days: number[] | null;
  alerts_sent: Record<string, unknown> | null;
  next_alert_date: string | null;
  
  // Escalation
  is_escalated: boolean;
  escalated_to: string | null;
  escalated_at: string | null;
  
  // Recurrence
  is_recurring: boolean;
  recurrence_rule: string | null;
  next_recurrence_date: string | null;
  
  // External sync
  task_id: string | null;
  google_event_id: string | null;
  outlook_event_id: string | null;
  
  // Metadata
  auto_generated: boolean;
  source: string | null;
  category: string | null;
  tags: string[] | null;
  notes: string | null;
  internal_notes: string | null;
  metadata: Record<string, unknown> | null;
  
  created_by: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined data
  matter?: {
    id: string;
    reference: string;
    title: string;
    type: string;
    status: string;
    jurisdiction?: string;
  };
  assigned_user?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  rule?: DeadlineRuleExtended;
}

// ============================================================
// DEADLINE ALERT
// ============================================================

export interface DeadlineAlert {
  id: string;
  organization_id: string;
  deadline_id: string;
  alert_type: 'reminder' | 'warning' | 'urgent' | 'overdue' | 'escalation' | 'fatal';
  channel: 'email' | 'in_app' | 'sms' | 'webhook';
  recipient_id: string | null;
  recipient_email: string | null;
  recipient_role: string | null;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  scheduled_for: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  subject: string | null;
  body: string | null;
  message: string | null;
  error_message: string | null;
  response_data: Record<string, unknown> | null;
  created_at: string;
}

// ============================================================
// FILTERS AND QUERIES
// ============================================================

export interface DeadlineFilters {
  status?: DeadlineStatus[];
  criticality?: DeadlineCriticality[];
  priority?: string[];
  assignedTo?: string;
  matterId?: string;
  organizationId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  category?: string;
  search?: string;
  isOverdue?: boolean;
  includeCompleted?: boolean;
}

export interface DeadlineStats {
  total: number;
  pending: number;
  overdue: number;
  dueThisWeek: number;
  dueThisMonth: number;
  critical: number;
  completed: number;
  byStatus: Record<DeadlineStatus, number>;
  byCriticality: Record<DeadlineCriticality, number>;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export const CRITICALITY_CONFIG: Record<DeadlineCriticality, {
  label: string;
  labelEs: string;
  color: string;
  bgColor: string;
  icon: string;
  priority: number;
}> = {
  low: {
    label: 'Low',
    labelEs: 'Baja',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: '○',
    priority: 1,
  },
  normal: {
    label: 'Normal',
    labelEs: 'Normal',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: '●',
    priority: 2,
  },
  high: {
    label: 'High',
    labelEs: 'Alta',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: '▲',
    priority: 3,
  },
  critical: {
    label: 'Critical',
    labelEs: 'Crítica',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: '⚠️',
    priority: 4,
  },
  absolute: {
    label: 'Absolute',
    labelEs: 'Absoluta',
    color: 'text-red-800',
    bgColor: 'bg-red-200',
    icon: '🚨',
    priority: 5,
  },
};

export const STATUS_CONFIG: Record<DeadlineStatus, {
  label: string;
  labelEs: string;
  color: string;
  bgColor: string;
}> = {
  pending: { label: 'Pending', labelEs: 'Pendiente', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  in_progress: { label: 'In Progress', labelEs: 'En Proceso', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  completed: { label: 'Completed', labelEs: 'Completado', color: 'text-green-600', bgColor: 'bg-green-100' },
  extended: { label: 'Extended', labelEs: 'Extendido', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  waived: { label: 'Waived', labelEs: 'Renunciado', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  missed: { label: 'Missed', labelEs: 'Perdido', color: 'text-red-600', bgColor: 'bg-red-100' },
  expired: { label: 'Expired', labelEs: 'Expirado', color: 'text-red-800', bgColor: 'bg-red-200' },
};
