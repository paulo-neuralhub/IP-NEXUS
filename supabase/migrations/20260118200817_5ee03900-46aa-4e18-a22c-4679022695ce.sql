-- =====================================================
-- PROMPT 10A: REPORTS - Tablas para informes y dashboards
-- =====================================================

-- PLANTILLAS DE INFORMES
CREATE TABLE report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  report_type TEXT NOT NULL CHECK (report_type IN (
    'portfolio_summary', 'matter_detail', 'deadline_report',
    'renewal_forecast', 'cost_analysis', 'client_report',
    'invoice_summary', 'activity_log', 'conflict_analysis',
    'valuation_report', 'custom'
  )),
  
  config JSONB NOT NULL DEFAULT '{}',
  style JSONB DEFAULT '{}',
  
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  UNIQUE(organization_id, code)
);

-- INFORMES GENERADOS
CREATE TABLE generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  
  parameters JSONB DEFAULT '{}',
  
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'generating', 'completed', 'failed'
  )),
  
  file_url TEXT,
  file_size INT,
  file_format TEXT DEFAULT 'pdf' CHECK (file_format IN ('pdf', 'xlsx', 'csv', 'docx')),
  
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  
  generated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- INFORMES PROGRAMADOS
CREATE TABLE scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES report_templates(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  
  schedule_type TEXT NOT NULL CHECK (schedule_type IN (
    'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  )),
  schedule_config JSONB DEFAULT '{}',
  
  parameters JSONB DEFAULT '{}',
  recipients JSONB DEFAULT '[]',
  
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  last_error TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- DASHBOARDS PERSONALIZADOS
CREATE TABLE dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  dashboard_type TEXT DEFAULT 'custom' CHECK (dashboard_type IN (
    'executive', 'operations', 'financial', 'client', 'custom'
  )),
  
  layout JSONB NOT NULL DEFAULT '[]',
  config JSONB DEFAULT '{}',
  
  is_public BOOLEAN DEFAULT false,
  shared_with JSONB DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- WIDGETS DE DASHBOARD
CREATE TABLE dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  
  widget_type TEXT NOT NULL CHECK (widget_type IN (
    'stat_card', 'chart', 'table', 'list', 'calendar', 'map', 'progress', 'timeline', 'custom'
  )),
  
  default_config JSONB DEFAULT '{}',
  data_source TEXT NOT NULL,
  available_options JSONB DEFAULT '[]',
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MÉTRICAS CALCULADAS (cache)
CREATE TABLE metrics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  metric_code TEXT NOT NULL,
  metric_value JSONB NOT NULL,
  
  period_type TEXT NOT NULL CHECK (period_type IN (
    'realtime', 'daily', 'weekly', 'monthly', 'yearly'
  )),
  period_start DATE,
  period_end DATE,
  
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  UNIQUE(organization_id, metric_code, period_type, period_start)
);

-- EXPORTACIONES
CREATE TABLE exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  export_type TEXT NOT NULL CHECK (export_type IN (
    'matters', 'contacts', 'deadlines', 'invoices',
    'costs', 'renewals', 'audit_logs', 'custom'
  )),
  
  format TEXT NOT NULL CHECK (format IN ('xlsx', 'csv', 'json', 'pdf')),
  
  filters JSONB DEFAULT '{}',
  columns JSONB DEFAULT '[]',
  
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed'
  )),
  
  file_url TEXT,
  file_size INT,
  record_count INT,
  
  error_message TEXT,
  
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- ÍNDICES
CREATE INDEX idx_report_templates_org ON report_templates(organization_id);
CREATE INDEX idx_report_templates_type ON report_templates(report_type);
CREATE INDEX idx_generated_reports_org ON generated_reports(organization_id);
CREATE INDEX idx_generated_reports_status ON generated_reports(status);
CREATE INDEX idx_generated_reports_date ON generated_reports(created_at DESC);
CREATE INDEX idx_scheduled_reports_org ON scheduled_reports(organization_id);
CREATE INDEX idx_scheduled_reports_next ON scheduled_reports(next_run_at) WHERE is_active = true;
CREATE INDEX idx_dashboards_org ON dashboards(organization_id);
CREATE INDEX idx_metrics_cache_org ON metrics_cache(organization_id);
CREATE INDEX idx_metrics_cache_metric ON metrics_cache(metric_code);
CREATE INDEX idx_metrics_cache_expires ON metrics_cache(expires_at);
CREATE INDEX idx_exports_org ON exports(organization_id);
CREATE INDEX idx_exports_status ON exports(status);

-- RLS
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org report_templates" ON report_templates FOR ALL USING (
  organization_id IS NULL OR
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Org generated_reports" ON generated_reports FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Org scheduled_reports" ON scheduled_reports FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Org dashboards" ON dashboards FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Org metrics_cache" ON metrics_cache FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Org exports" ON exports FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Public widgets" ON dashboard_widgets FOR SELECT USING (is_active = true);

-- DATOS INICIALES: Plantillas de sistema
INSERT INTO report_templates (code, name, description, report_type, config, style, is_system) VALUES
('portfolio_overview', 'Resumen de Cartera', 'Vista general de todos los activos de PI', 'portfolio_summary',
'{"sections": ["header", "summary_stats", "by_type", "by_status", "by_jurisdiction", "timeline", "footer"], "include_charts": true, "grouping": "ip_type"}',
'{"header_text": "INFORME DE CARTERA DE PROPIEDAD INTELECTUAL", "primary_color": "#EC4899"}',
true),
('deadline_calendar', 'Calendario de Plazos', 'Plazos próximos organizados por fecha', 'deadline_report',
'{"sections": ["header", "urgent", "this_week", "this_month", "next_quarter", "footer"], "filters": { "days_ahead": 90 }, "grouping": "urgency", "sorting": { "field": "due_date", "order": "asc" }}',
'{"header_text": "CALENDARIO DE PLAZOS", "primary_color": "#EF4444"}',
true),
('renewal_forecast', 'Previsión de Renovaciones', 'Renovaciones y costes previstos', 'renewal_forecast',
'{"sections": ["header", "summary", "by_month", "by_type", "cost_forecast", "footer"], "filters": { "months_ahead": 12 }, "include_costs": true}',
'{"header_text": "PREVISIÓN DE RENOVACIONES", "primary_color": "#F59E0B"}',
true),
('client_portfolio', 'Informe para Cliente', 'Resumen de cartera para enviar a cliente', 'client_report',
'{"sections": ["cover", "summary", "active_matters", "pending_actions", "costs_summary", "footer"], "include_costs": true, "include_sensitive": false}',
'{"header_text": "INFORME DE CARTERA", "include_cover_page": true}',
true),
('cost_analysis', 'Análisis de Costes', 'Desglose detallado de costes', 'cost_analysis',
'{"sections": ["header", "summary", "by_type", "by_matter", "by_month", "trends", "footer"], "grouping": "cost_type", "include_charts": true}',
'{"header_text": "ANÁLISIS DE COSTES", "primary_color": "#22C55E"}',
true),
('matter_detail', 'Ficha de Expediente', 'Informe detallado de un expediente', 'matter_detail',
'{"sections": ["header", "basic_info", "timeline", "documents", "costs", "notes", "footer"], "include_documents_list": true, "include_full_history": true}',
'{"header_text": "FICHA DE EXPEDIENTE"}',
true);

-- DATOS INICIALES: Widgets de dashboard
INSERT INTO dashboard_widgets (code, name, description, widget_type, data_source, default_config) VALUES
('total_matters', 'Total Expedientes', 'Número total de expedientes activos', 'stat_card', 'metrics.total_matters',
'{ "format": "number", "icon": "Briefcase", "color": "#3B82F6" }'),
('pending_deadlines', 'Plazos Pendientes', 'Plazos en los próximos 30 días', 'stat_card', 'metrics.pending_deadlines',
'{ "format": "number", "icon": "Clock", "color": "#EF4444", "alert_threshold": 10 }'),
('renewal_due', 'Renovaciones Próximas', 'Renovaciones en los próximos 90 días', 'stat_card', 'metrics.renewals_due',
'{ "format": "number", "icon": "RefreshCw", "color": "#F59E0B" }'),
('monthly_costs', 'Costes del Mes', 'Total de costes este mes', 'stat_card', 'metrics.monthly_costs',
'{ "format": "currency", "icon": "DollarSign", "color": "#22C55E" }'),
('matters_by_type', 'Expedientes por Tipo', 'Distribución por tipo de PI', 'chart', 'charts.matters_by_type',
'{ "chart_type": "pie" }'),
('matters_by_status', 'Expedientes por Estado', 'Distribución por estado', 'chart', 'charts.matters_by_status',
'{ "chart_type": "donut" }'),
('deadlines_timeline', 'Línea de Tiempo de Plazos', 'Plazos próximos en timeline', 'timeline', 'lists.upcoming_deadlines',
'{ "days": 30 }'),
('cost_trend', 'Tendencia de Costes', 'Evolución de costes mensual', 'chart', 'charts.cost_trend',
'{ "chart_type": "line", "months": 12 }'),
('recent_activity', 'Actividad Reciente', 'Últimas acciones en el sistema', 'list', 'lists.recent_activity',
'{ "limit": 10 }'),
('matters_by_jurisdiction', 'Por Jurisdicción', 'Mapa de expedientes por país', 'map', 'charts.matters_by_jurisdiction',
'{ "show_count": true }'),
('invoiced_vs_collected', 'Facturado vs Cobrado', 'Comparativa de facturación', 'chart', 'charts.invoiced_vs_collected',
'{ "chart_type": "bar", "months": 6 }'),
('renewal_calendar', 'Calendario de Renovaciones', 'Vista calendario de renovaciones', 'calendar', 'calendars.renewals',
'{ "months": 3 }');