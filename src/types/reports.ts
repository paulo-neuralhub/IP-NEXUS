// ===== PLANTILLAS =====
export type ReportType = 
  | 'portfolio_summary' | 'matter_detail' | 'deadline_report'
  | 'renewal_forecast' | 'cost_analysis' | 'client_report'
  | 'invoice_summary' | 'activity_log' | 'conflict_analysis'
  | 'valuation_report' | 'custom';

export interface ReportTemplate {
  id: string;
  organization_id?: string;
  code: string;
  name: string;
  description?: string;
  report_type: ReportType;
  config: ReportConfig;
  style: ReportStyle;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ReportConfig {
  sections: string[];
  filters?: {
    ip_types?: string[];
    statuses?: string[];
    date_range?: string;
    days_ahead?: number;
    months_ahead?: number;
  };
  columns?: string[];
  grouping?: string;
  sorting?: { field: string; order: 'asc' | 'desc' };
  include_charts?: boolean;
  include_costs?: boolean;
  include_documents_list?: boolean;
  include_full_history?: boolean;
  include_sensitive?: boolean;
  language?: string;
}

export interface ReportStyle {
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
  header_text?: string;
  footer_text?: string;
  include_cover_page?: boolean;
}

// ===== INFORMES GENERADOS =====
export type ReportStatus = 'pending' | 'generating' | 'completed' | 'failed';
export type ReportFormat = 'pdf' | 'xlsx' | 'csv' | 'docx';

export interface GeneratedReport {
  id: string;
  organization_id: string;
  template_id?: string;
  name: string;
  report_type: ReportType;
  parameters: Record<string, any>;
  status: ReportStatus;
  file_url?: string;
  file_size?: number;
  file_format: ReportFormat;
  metadata: {
    total_records?: number;
    generation_time_ms?: number;
    pages?: number;
  };
  error_message?: string;
  generated_at?: string;
  expires_at: string;
  created_at: string;
  created_by?: string;
  // Relaciones
  template?: ReportTemplate;
}

// ===== INFORMES PROGRAMADOS =====
export type ScheduleType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface ScheduledReport {
  id: string;
  organization_id: string;
  template_id: string;
  name: string;
  schedule_type: ScheduleType;
  schedule_config: {
    day_of_week?: number;
    day_of_month?: number;
    time?: string;
    timezone?: string;
  };
  parameters: Record<string, any>;
  recipients: Array<{ email?: string; user_id?: string; name?: string }>;
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  last_error?: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  // Relaciones
  template?: ReportTemplate;
}

// ===== DASHBOARDS =====
export type DashboardType = 'executive' | 'operations' | 'financial' | 'client' | 'custom';
export type WidgetType = 'stat_card' | 'chart' | 'table' | 'list' | 'calendar' | 'map' | 'progress' | 'timeline' | 'custom';

export interface Dashboard {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  dashboard_type: DashboardType;
  layout: DashboardWidget[];
  config: {
    refresh_interval?: number;
    default_date_range?: string;
    filters?: Record<string, any>;
  };
  is_public: boolean;
  shared_with: string[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  config: Record<string, any>;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  data_source?: string;
}

export interface WidgetDefinition {
  id: string;
  code: string;
  name: string;
  description?: string;
  widget_type: WidgetType;
  default_config: Record<string, any>;
  data_source: string;
  available_options?: any[];
  is_active: boolean;
}

// ===== MÉTRICAS =====
export interface MetricValue {
  value: number | string | Record<string, any>;
  change?: number;
  change_period?: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface DashboardMetrics {
  total_matters: MetricValue;
  active_matters: MetricValue;
  pending_deadlines: MetricValue;
  overdue_deadlines: MetricValue;
  renewals_due_90: MetricValue;
  monthly_costs: MetricValue;
  yearly_costs: MetricValue;
  invoiced_this_month: MetricValue;
  collected_this_month: MetricValue;
  total_contacts: MetricValue;
  active_campaigns: MetricValue;
  watch_alerts: MetricValue;
}

export interface MetricsCache {
  id: string;
  organization_id: string;
  metric_code: string;
  metric_value: MetricValue;
  period_type: 'realtime' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  period_start?: string;
  period_end?: string;
  calculated_at: string;
  expires_at?: string;
}

// ===== EXPORTACIONES =====
export type ExportType = 
  | 'matters' | 'contacts' | 'deadlines' | 'invoices'
  | 'costs' | 'renewals' | 'audit_logs' | 'custom';

export type ExportFormat = 'xlsx' | 'csv' | 'json' | 'pdf';

export interface Export {
  id: string;
  organization_id: string;
  export_type: ExportType;
  format: ExportFormat;
  filters: Record<string, any>;
  columns: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_url?: string;
  file_size?: number;
  record_count?: number;
  error_message?: string;
  completed_at?: string;
  expires_at: string;
  created_at: string;
  created_by?: string;
}

// ===== CHART DATA =====
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }>;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}
