-- ============================================================
-- IP-NEXUS: MOTOR DE AUTOMATIZACIONES - ARQUITECTURA 3 CAPAS
-- ============================================================

-- CAPA 1: BACKOFFICE - Templates Maestros Globales
CREATE TABLE IF NOT EXISTS master_automation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  name_es VARCHAR(255),
  description TEXT,
  description_es TEXT,
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50),
  icon VARCHAR(50) DEFAULT 'zap',
  color VARCHAR(20) DEFAULT '#3B82F6',
  trigger_type VARCHAR(50) NOT NULL,
  trigger_event VARCHAR(100),
  trigger_config JSONB DEFAULT '{}',
  conditions JSONB DEFAULT '{}',
  actions JSONB DEFAULT '[]',
  email_template_code VARCHAR(100),
  notification_template_code VARCHAR(100),
  min_plan VARCHAR(50) DEFAULT 'starter',
  required_module VARCHAR(50),
  configurable_params JSONB DEFAULT '[]',
  is_visible BOOLEAN DEFAULT true,
  is_mandatory BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  version INT DEFAULT 1,
  changelog JSONB DEFAULT '[]',
  sort_order INT DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  estimated_impact VARCHAR(20),
  complexity VARCHAR(20) DEFAULT 'simple',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- CAPA 3: TENANT - Configuración por Organización
CREATE TABLE IF NOT EXISTS tenant_automation_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  master_template_id UUID NOT NULL REFERENCES master_automation_templates(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT false,
  is_customized BOOLEAN DEFAULT false,
  custom_params JSONB DEFAULT '{}',
  custom_conditions JSONB,
  custom_actions JSONB,
  execution_count INT DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  error_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  enabled_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, master_template_id)
);

-- LOG DE EJECUCIONES
CREATE TABLE IF NOT EXISTS automation_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tenant_config_id UUID REFERENCES tenant_automation_configs(id) ON DELETE SET NULL,
  master_template_id UUID REFERENCES master_automation_templates(id) ON DELETE SET NULL,
  automation_code VARCHAR(100),
  automation_name VARCHAR(255),
  trigger_type VARCHAR(50),
  trigger_event VARCHAR(100),
  trigger_data JSONB DEFAULT '{}',
  matter_id UUID,
  contact_id UUID,
  deadline_id UUID,
  status VARCHAR(20) NOT NULL,
  actions_executed JSONB DEFAULT '[]',
  actions_total INT DEFAULT 0,
  actions_completed INT DEFAULT 0,
  actions_failed INT DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INT,
  error_message TEXT,
  error_details JSONB,
  triggered_by VARCHAR(50),
  triggered_by_user UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_master_templates_category ON master_automation_templates(category);
CREATE INDEX IF NOT EXISTS idx_master_templates_trigger ON master_automation_templates(trigger_type);
CREATE INDEX IF NOT EXISTS idx_master_templates_plan ON master_automation_templates(min_plan);
CREATE INDEX IF NOT EXISTS idx_master_templates_visible ON master_automation_templates(is_visible, is_active);
CREATE INDEX IF NOT EXISTS idx_tenant_configs_org ON tenant_automation_configs(organization_id);
CREATE INDEX IF NOT EXISTS idx_tenant_configs_template ON tenant_automation_configs(master_template_id);
CREATE INDEX IF NOT EXISTS idx_tenant_configs_enabled ON tenant_automation_configs(organization_id, is_enabled);
CREATE INDEX IF NOT EXISTS idx_exec_logs_org ON automation_execution_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_exec_logs_status ON automation_execution_logs(status);
CREATE INDEX IF NOT EXISTS idx_exec_logs_created ON automation_execution_logs(created_at DESC);

-- RLS
ALTER TABLE master_automation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_automation_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_execution_logs ENABLE ROW LEVEL SECURITY;

-- Master templates: backoffice staff puede modificar (sin argumentos)
CREATE POLICY "Backoffice staff manage master templates"
  ON master_automation_templates FOR ALL
  USING (public.is_backoffice_staff())
  WITH CHECK (public.is_backoffice_staff());

-- Usuarios autenticados pueden leer templates visibles
CREATE POLICY "Users view visible master templates"
  ON master_automation_templates FOR SELECT
  USING (is_visible = true AND is_active = true);

-- Tenant configs: solo el propio tenant
CREATE POLICY "Tenants manage their automation configs"
  ON tenant_automation_configs FOR ALL
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));

-- Execution logs: solo el propio tenant
CREATE POLICY "Tenants view their execution logs"
  ON automation_execution_logs FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));

CREATE POLICY "System insert execution logs"
  ON automation_execution_logs FOR INSERT
  WITH CHECK (true);

-- TRIGGERS
CREATE TRIGGER update_master_templates_updated_at
  BEFORE UPDATE ON master_automation_templates
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER update_tenant_configs_updated_at
  BEFORE UPDATE ON tenant_automation_configs
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- DATOS INICIALES
INSERT INTO master_automation_templates (
  code, name, name_es, description, description_es, category, subcategory, icon, color,
  trigger_type, trigger_event, trigger_config, conditions, actions, configurable_params,
  min_plan, is_mandatory, sort_order, estimated_impact, complexity
) VALUES
('deadline_reminder_30d', '30-Day Deadline Reminder', 'Recordatorio 30 días antes',
 'Sends reminder 30 days before deadline', 'Envía recordatorio 30 días antes del vencimiento',
 'deadlines', 'reminders', 'bell', '#F59E0B', 'deadline_approaching', 'deadline_due',
 '{"days_before": 30}', '{}',
 '[{"type": "send_notification", "config": {"template": "deadline_reminder"}}, {"type": "send_email", "config": {"template": "deadline_reminder_email"}}]',
 '[{"key": "days_before", "type": "number", "label": "Días antes", "default": 30, "min": 1, "max": 365}]',
 'starter', true, 1, 'high', 'simple'),
('deadline_reminder_7d', '7-Day Deadline Reminder', 'Recordatorio 7 días antes',
 'Sends urgent reminder 7 days before deadline', 'Envía recordatorio urgente 7 días antes',
 'deadlines', 'reminders', 'alert-triangle', '#EF4444', 'deadline_approaching', 'deadline_due',
 '{"days_before": 7}', '{}',
 '[{"type": "send_notification", "config": {"template": "deadline_urgent", "priority": "high"}}]',
 '[{"key": "days_before", "type": "number", "label": "Días antes", "default": 7, "min": 1, "max": 30}]',
 'starter', true, 2, 'high', 'simple'),
('matter_created_welcome', 'New Matter Welcome', 'Bienvenida nuevo expediente',
 'Sends welcome email when matter is created', 'Envía email de bienvenida al crear expediente',
 'onboarding', 'matters', 'file-plus', '#10B981', 'event', 'matter_created',
 '{}', '{}',
 '[{"type": "send_email", "config": {"template": "matter_welcome_email", "to": "client"}}]',
 '[{"key": "send_to_client", "type": "boolean", "label": "Enviar al cliente", "default": true}]',
 'starter', false, 10, 'medium', 'simple'),
('phase_changed_notify', 'Phase Change Notification', 'Notificación cambio de fase',
 'Notifies when matter changes phase', 'Notifica cuando el expediente cambia de fase',
 'notifications', 'phases', 'git-branch', '#8B5CF6', 'event', 'phase_changed',
 '{}', '{}',
 '[{"type": "send_notification", "config": {"template": "phase_changed"}}]',
 '[{"key": "notify_client", "type": "boolean", "label": "Notificar cliente", "default": false}]',
 'professional', false, 20, 'medium', 'moderate'),
('renewal_reminder_90d', '90-Day Renewal Reminder', 'Recordatorio renovación 90 días',
 'Reminds about upcoming trademark renewals', 'Recuerda renovaciones próximas de marcas',
 'deadlines', 'renewals', 'refresh-cw', '#0EA5E9', 'deadline_approaching', 'renewal_due',
 '{"days_before": 90, "deadline_type": "renewal"}', '{"matter_type": ["TM"]}',
 '[{"type": "send_email", "config": {"template": "renewal_reminder_email"}}]',
 '[{"key": "days_before", "type": "number", "label": "Días antes", "default": 90}]',
 'starter', false, 5, 'high', 'simple'),
('contact_created_welcome', 'New Contact Welcome', 'Bienvenida nuevo contacto',
 'Sends welcome when contact is created', 'Envía bienvenida al crear contacto',
 'crm', 'onboarding', 'user-plus', '#EC4899', 'event', 'contact_created',
 '{}', '{}',
 '[{"type": "send_email", "config": {"template": "contact_welcome"}}]',
 '[{"key": "send_welcome_email", "type": "boolean", "label": "Enviar email", "default": true}]',
 'professional', false, 30, 'medium', 'simple'),
('spider_alert_detected', 'Spider Alert Detected', 'Alerta Spider detectada',
 'Processes new surveillance alerts', 'Procesa nuevas alertas de vigilancia',
 'spider', 'alerts', 'search', '#EF4444', 'event', 'spider_alert_created',
 '{}', '{}',
 '[{"type": "send_notification", "config": {"template": "spider_alert", "priority": "high"}}]',
 '[{"key": "auto_notify_client", "type": "boolean", "label": "Notificar cliente", "default": false}]',
 'business', false, 40, 'high', 'moderate'),
('invoice_overdue_reminder', 'Overdue Invoice Reminder', 'Recordatorio factura vencida',
 'Sends reminder for overdue invoices', 'Envía recordatorio para facturas vencidas',
 'billing', 'reminders', 'file-warning', '#F97316', 'schedule', NULL,
 '{"cron": "0 9 * * 1", "check": "invoices_overdue"}', '{}',
 '[{"type": "send_email", "config": {"template": "invoice_overdue"}}]',
 '[{"key": "days_overdue", "type": "number", "label": "Días de retraso", "default": 7}]',
 'professional', false, 50, 'high', 'moderate')
ON CONFLICT (code) DO NOTHING;