-- ============================================================
-- IP-NEXUS: Tabla unificada automation_rules + seed marcas
-- ============================================================

-- Eliminar tabla duplicada si existe
DROP TABLE IF EXISTS deadline_rules CASCADE;

-- Crear tabla unificada de reglas de automatización
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identificación
  code VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  
  -- Tipo de regla
  rule_type VARCHAR NOT NULL,
  
  -- Categorización
  category VARCHAR NOT NULL,
  subcategory VARCHAR,
  
  -- Configuración del trigger
  trigger_type VARCHAR NOT NULL,
  trigger_event VARCHAR,
  trigger_config JSONB DEFAULT '{}',
  
  -- Condiciones de aplicación
  conditions JSONB DEFAULT '{}',
  
  -- Vinculación a plazo legal
  legal_deadline_id UUID REFERENCES legal_deadlines(id) ON DELETE SET NULL,
  
  -- Configuración específica según rule_type
  deadline_config JSONB,
  notification_config JSONB,
  task_config JSONB,
  email_config JSONB,
  
  -- Estado
  is_system_rule BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT false,
  is_customized BOOLEAN DEFAULT false,
  
  -- Ejecución
  last_executed_at TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0,
  
  -- Orden
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT automation_rules_unique_code UNIQUE(tenant_id, code)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_automation_rules_tenant ON automation_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_type ON automation_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_automation_rules_category ON automation_rules(category);
CREATE INDEX IF NOT EXISTS idx_automation_rules_active ON automation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_automation_rules_legal ON automation_rules(legal_deadline_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger ON automation_rules(trigger_type, trigger_event);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_automation_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_automation_rules_updated_at ON automation_rules;
CREATE TRIGGER trigger_automation_rules_updated_at
  BEFORE UPDATE ON automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_automation_rules_updated_at();

-- RLS
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

-- Política: ver reglas del sistema + propias (corregido para array)
CREATE POLICY "View system and own automation rules"
  ON automation_rules FOR SELECT
  USING (
    tenant_id IS NULL 
    OR tenant_id = ANY(get_user_organization_ids())
  );

-- Política: crear/editar solo propias (corregido para array)
CREATE POLICY "Manage own automation rules"
  ON automation_rules FOR ALL
  USING (tenant_id = ANY(get_user_organization_ids()))
  WITH CHECK (tenant_id = ANY(get_user_organization_ids()));

-- ============================================================
-- SEED: Reglas EUIPO para marcas
-- ============================================================

INSERT INTO automation_rules (
  code, name, description, rule_type, category, subcategory,
  trigger_type, trigger_event, trigger_config, conditions,
  legal_deadline_id, deadline_config,
  is_system_rule, is_active, display_order
) VALUES
('EUIPO_TM_OPPOSITION_DEADLINE',
 'Crear plazo oposición marca UE',
 'Cuando una marca UE es publicada, crear plazo de 3 meses para oposición.',
 'deadline', 'trademarks', 'opposition',
 'event', 'matter_status_changed',
 '{"new_status": "published"}',
 '{"matter_types": ["trademark"], "offices": ["EUIPO"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'EUIPO_TM_OPPOSITION_PERIOD'),
 '{
   "title_template": "Fin plazo oposición: {{matter.mark_name}}",
   "description_template": "La marca {{matter.mark_name}} ({{matter.reference}}) fue publicada.",
   "priority": "high",
   "notify_before_days": [30, 14, 7, 1],
   "auto_create_task": true,
   "task_title": "Vigilar publicación oposiciones"
 }',
 true, false, 10),

('EUIPO_TM_RENEWAL_6M',
 'Aviso renovación marca UE (6 meses)',
 'Avisar 6 meses antes del vencimiento de marca UE.',
 'deadline', 'trademarks', 'renewal',
 'deadline_approaching', 'matter_expiry',
 '{"days_before": 180}',
 '{"matter_types": ["trademark"], "offices": ["EUIPO"], "statuses": ["registered"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'EUIPO_TM_RENEWAL'),
 '{
   "title_template": "Renovación: {{matter.mark_name}} vence en 6 meses",
   "priority": "medium",
   "notify_before_days": [180],
   "auto_create_task": true,
   "task_title": "Preparar renovación marca UE"
 }',
 true, false, 20),

('EUIPO_TM_RENEWAL_3M',
 'Aviso renovación marca UE (3 meses)',
 'Avisar 3 meses antes del vencimiento de marca UE.',
 'deadline', 'trademarks', 'renewal',
 'deadline_approaching', 'matter_expiry',
 '{"days_before": 90}',
 '{"matter_types": ["trademark"], "offices": ["EUIPO"], "statuses": ["registered"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'EUIPO_TM_RENEWAL'),
 '{
   "title_template": "RENOVACIÓN URGENTE: {{matter.mark_name}} vence en 3 meses",
   "priority": "high",
   "notify_before_days": [90],
   "auto_send_email": true,
   "email_template": "RENEWAL_3_MONTHS"
 }',
 true, false, 21),

('EUIPO_TM_RENEWAL_1M',
 'Aviso URGENTE renovación marca UE (1 mes)',
 'Avisar 1 mes antes del vencimiento de marca UE.',
 'deadline', 'trademarks', 'renewal',
 'deadline_approaching', 'matter_expiry',
 '{"days_before": 30}',
 '{"matter_types": ["trademark"], "offices": ["EUIPO"], "statuses": ["registered"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'EUIPO_TM_RENEWAL'),
 '{
   "title_template": "⚠️ URGENTE: {{matter.mark_name}} vence en 1 MES",
   "priority": "urgent",
   "notify_before_days": [30],
   "auto_send_email": true,
   "email_template": "RENEWAL_1_MONTH",
   "auto_create_task": true,
   "task_title": "URGENTE: Confirmar renovación",
   "task_priority": "urgent"
 }',
 true, false, 22),

('EUIPO_TM_COOLING_OFF',
 'Crear plazo cooling-off tras oposición',
 'Cuando se recibe oposición, crear plazo de cooling-off de 2 meses.',
 'deadline', 'trademarks', 'opposition',
 'event', 'matter_status_changed',
 '{"new_status": "opposition_received"}',
 '{"matter_types": ["trademark"], "offices": ["EUIPO"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'EUIPO_TM_COOLING_OFF'),
 '{
   "title_template": "Fin cooling-off: {{matter.reference}}",
   "priority": "high",
   "notify_before_days": [14, 7],
   "auto_create_task": true,
   "task_title": "Negociar acuerdo oposición"
 }',
 true, false, 30)

ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  deadline_config = EXCLUDED.deadline_config,
  legal_deadline_id = EXCLUDED.legal_deadline_id,
  updated_at = now();

-- ============================================================
-- SEED: Reglas OEPM para marcas
-- ============================================================

INSERT INTO automation_rules (
  code, name, description, rule_type, category, subcategory,
  trigger_type, trigger_event, trigger_config, conditions,
  legal_deadline_id, deadline_config,
  is_system_rule, is_active, display_order
) VALUES
('OEPM_TM_OPPOSITION_DEADLINE',
 'Crear plazo oposición marca España',
 'Cuando una marca España es publicada, crear plazo de 2 meses para oposición.',
 'deadline', 'trademarks', 'opposition',
 'event', 'matter_status_changed',
 '{"new_status": "published"}',
 '{"matter_types": ["trademark"], "offices": ["OEPM"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'OEPM_TM_OPPOSITION_PERIOD'),
 '{
   "title_template": "Fin plazo oposición: {{matter.mark_name}}",
   "priority": "high",
   "notify_before_days": [14, 7, 1]
 }',
 true, false, 100),

('OEPM_TM_OPPOSITION_RESPONSE',
 'Plazo respuesta a oposición recibida',
 'Cuando se recibe oposición, crear plazo de 1 mes para responder.',
 'deadline', 'trademarks', 'opposition',
 'event', 'matter_status_changed',
 '{"new_status": "opposition_received"}',
 '{"matter_types": ["trademark"], "offices": ["OEPM"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'OEPM_TM_OPPOSITION_RESPONSE'),
 '{
   "title_template": "Responder oposición: {{matter.reference}}",
   "priority": "urgent",
   "notify_before_days": [7, 3, 1],
   "auto_create_task": true,
   "task_title": "Preparar contestación oposición",
   "task_priority": "urgent"
 }',
 true, false, 101),

('OEPM_TM_RENEWAL_6M',
 'Aviso renovación marca España (6 meses)',
 'Avisar 6 meses antes del vencimiento de marca España.',
 'deadline', 'trademarks', 'renewal',
 'deadline_approaching', 'matter_expiry',
 '{"days_before": 180}',
 '{"matter_types": ["trademark"], "offices": ["OEPM"], "statuses": ["registered"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'OEPM_TM_RENEWAL'),
 '{
   "title_template": "Renovación: {{matter.mark_name}} vence en 6 meses",
   "priority": "medium",
   "auto_create_task": true
 }',
 true, false, 110),

('OEPM_TM_DEFECT_RESPONSE',
 'Plazo subsanación defectos',
 'Cuando se recibe requerimiento de subsanación, crear plazo de 1 mes.',
 'deadline', 'trademarks', 'response',
 'event', 'notification_received',
 '{"notification_type": "defect"}',
 '{"matter_types": ["trademark"], "offices": ["OEPM"]}',
 (SELECT id FROM legal_deadlines WHERE code = 'OEPM_TM_DEFECT_CORRECTION'),
 '{
   "title_template": "Subsanar defectos: {{matter.reference}}",
   "priority": "high",
   "notify_before_days": [7, 3, 1],
   "auto_create_task": true
 }',
 true, false, 120)

ON CONFLICT (tenant_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  deadline_config = EXCLUDED.deadline_config,
  legal_deadline_id = EXCLUDED.legal_deadline_id,
  updated_at = now();