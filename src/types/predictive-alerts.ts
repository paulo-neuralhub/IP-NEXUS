// Types for Predictive Alerts System

export type AlertType =
  | 'deadline_risk'
  | 'payment_risk'
  | 'workload_imbalance'
  | 'client_churn'
  | 'cost_overrun'
  | 'renewal_upcoming'
  | 'conflict_detected'
  | 'anomaly_detected'
  | 'opportunity'
  | 'compliance_risk';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'dismissed' | 'expired';

export interface PredictiveAlert {
  id: string;
  organization_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  confidence_score: number | null;
  title: string;
  description: string;
  recommendation: string | null;
  matter_id: string | null;
  contact_id: string | null;
  invoice_id: string | null;
  user_id: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  analysis_data: {
    factors?: Array<{ name: string; value: number; weight: number }>;
    model_version?: string;
    computed_at?: string;
  };
  status: AlertStatus;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  was_useful: boolean | null;
  feedback_notes: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  matter?: { id: string; reference: string; title: string } | null;
  contact?: { id: string; full_name: string } | null;
}

export interface AlertConfiguration {
  id: string;
  organization_id: string;
  alert_type: string;
  is_enabled: boolean;
  min_severity: AlertSeverity;
  min_confidence: number;
  notify_email: boolean;
  notify_in_app: boolean;
  notify_slack: boolean;
  slack_webhook_url: string | null;
  notify_roles: string[];
  notify_matter_owner: boolean;
  auto_analyze_enabled: boolean;
  analyze_frequency: 'hourly' | 'daily' | 'weekly';
  last_analyzed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  deadline_risk: 'Riesgo de Plazo',
  payment_risk: 'Riesgo de Impago',
  workload_imbalance: 'Desbalance de Carga',
  client_churn: 'Pérdida de Cliente',
  cost_overrun: 'Sobrecosto',
  renewal_upcoming: 'Renovación Próxima',
  conflict_detected: 'Conflicto Detectado',
  anomaly_detected: 'Anomalía',
  opportunity: 'Oportunidad',
  compliance_risk: 'Riesgo Compliance',
};

export const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
};
