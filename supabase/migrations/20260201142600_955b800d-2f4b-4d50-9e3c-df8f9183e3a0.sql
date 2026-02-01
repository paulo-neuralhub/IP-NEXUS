-- ════════════════════════════════════════════════════════════════════════════
-- PROMPT 4: Service Categories + Workflow Phases Enhancement
-- ════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- PASO 1: Tabla service_categories (13 categorías principales)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE,
  name_en VARCHAR(100) NOT NULL,
  name_es VARCHAR(100) NOT NULL,
  description_en TEXT,
  description_es TEXT,
  icon VARCHAR(50) DEFAULT 'folder',
  color VARCHAR(20) DEFAULT '#6B7280',
  parent_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  position INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  right_types TEXT[] DEFAULT '{}', -- trademark, patent, design, copyright, domain
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_service_categories_parent ON service_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_service_categories_code ON service_categories(code);

-- RLS
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_categories_read_all" ON service_categories
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "service_categories_admin_write" ON service_categories
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM memberships m WHERE m.user_id = auth.uid() AND m.role IN ('owner', 'admin'))
  );

-- ═══════════════════════════════════════════════════════════════
-- PASO 2: Agregar campos adicionales a workflow_phases
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE workflow_phases 
  ADD COLUMN IF NOT EXISTS estimated_days INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS required_documents TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS required_approvals TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS auto_tasks JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS exit_conditions JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS can_skip BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sla_hours INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS notification_template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL;

-- Actualizar fases existentes con estimaciones
UPDATE workflow_phases SET estimated_days = 1, can_skip = FALSE WHERE code = 'F0';
UPDATE workflow_phases SET estimated_days = 3, can_skip = FALSE, requires_approval = TRUE WHERE code = 'F1';
UPDATE workflow_phases SET estimated_days = 5, can_skip = TRUE WHERE code = 'F2';
UPDATE workflow_phases SET estimated_days = 7, can_skip = FALSE WHERE code = 'F3';
UPDATE workflow_phases SET estimated_days = 10, can_skip = FALSE, requires_approval = TRUE WHERE code = 'F4';
UPDATE workflow_phases SET estimated_days = 3, can_skip = FALSE, requires_approval = TRUE WHERE code = 'F5';
UPDATE workflow_phases SET estimated_days = 1, can_skip = FALSE WHERE code = 'F6';
UPDATE workflow_phases SET estimated_days = 30, can_skip = FALSE WHERE code = 'F7';
UPDATE workflow_phases SET estimated_days = 5, can_skip = FALSE WHERE code = 'F8';
UPDATE workflow_phases SET estimated_days = 0, can_skip = TRUE WHERE code = 'F9';

-- ═══════════════════════════════════════════════════════════════
-- PASO 3: Agregar FK a service_catalog → service_categories
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE service_catalog 
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_service_catalog_category ON service_catalog(category_id);

-- ═══════════════════════════════════════════════════════════════
-- PASO 4: Tabla matter_phase_history (historial detallado)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS matter_phase_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  from_phase VARCHAR(10),
  to_phase VARCHAR(10) NOT NULL,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT now(),
  time_in_phase_hours INT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  is_automatic BOOLEAN DEFAULT FALSE,
  trigger_event VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_matter_phase_history_matter ON matter_phase_history(matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_phase_history_org ON matter_phase_history(organization_id);
CREATE INDEX IF NOT EXISTS idx_matter_phase_history_changed_at ON matter_phase_history(changed_at DESC);

-- RLS
ALTER TABLE matter_phase_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "matter_phase_history_org_read" ON matter_phase_history
  FOR SELECT TO authenticated USING (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "matter_phase_history_org_insert" ON matter_phase_history
  FOR INSERT TO authenticated WITH CHECK (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

-- ═══════════════════════════════════════════════════════════════
-- PASO 5: Trigger para registrar cambios de fase automáticamente
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION log_matter_phase_change()
RETURNS TRIGGER AS $$
DECLARE
  v_hours_in_phase INT;
BEGIN
  -- Solo si cambió la fase
  IF OLD.current_phase IS DISTINCT FROM NEW.current_phase THEN
    -- Calcular tiempo en fase anterior
    IF OLD.phase_started_at IS NOT NULL THEN
      v_hours_in_phase := EXTRACT(EPOCH FROM (now() - OLD.phase_started_at)) / 3600;
    END IF;
    
    -- Insertar en historial
    INSERT INTO matter_phase_history (
      organization_id,
      matter_id,
      from_phase,
      to_phase,
      changed_by,
      time_in_phase_hours,
      is_automatic,
      trigger_event
    ) VALUES (
      NEW.organization_id,
      NEW.id,
      OLD.current_phase,
      NEW.current_phase,
      auth.uid(),
      v_hours_in_phase,
      FALSE,
      'manual_change'
    );
    
    -- Actualizar timestamp de inicio de fase
    NEW.phase_started_at := now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Crear trigger solo si no existe
DROP TRIGGER IF EXISTS trg_log_matter_phase_change ON matters;
CREATE TRIGGER trg_log_matter_phase_change
  BEFORE UPDATE ON matters
  FOR EACH ROW
  EXECUTE FUNCTION log_matter_phase_change();

-- ═══════════════════════════════════════════════════════════════
-- PASO 6: Seed data - Categorías de servicios (13 principales)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO service_categories (code, name_en, name_es, description_en, description_es, icon, color, position, right_types) VALUES
  -- Marcas
  ('TM_REG', 'Trademark Registration', 'Registro de Marcas', 'Filing and registration of trademarks', 'Presentación y registro de marcas', 'stamp', '#3B82F6', 1, ARRAY['trademark']),
  ('TM_RENEWAL', 'Trademark Renewal', 'Renovación de Marcas', 'Renewal and maintenance of trademark registrations', 'Renovación y mantenimiento de registros de marca', 'refresh-cw', '#10B981', 2, ARRAY['trademark']),
  ('TM_SEARCH', 'Trademark Search', 'Búsquedas de Marcas', 'Prior art and availability searches', 'Búsquedas de anterioridades y disponibilidad', 'search', '#8B5CF6', 3, ARRAY['trademark']),
  ('TM_OPPOSITION', 'Opposition & Cancellation', 'Oposiciones y Nulidades', 'Opposition proceedings and cancellation actions', 'Procedimientos de oposición y acciones de nulidad', 'shield-alert', '#EF4444', 4, ARRAY['trademark']),
  ('TM_WATCH', 'Trademark Watching', 'Vigilancia de Marcas', 'Monitoring services for conflicting marks', 'Servicios de vigilancia de marcas conflictivas', 'eye', '#F59E0B', 5, ARRAY['trademark']),
  
  -- Patentes
  ('PT_FILING', 'Patent Filing', 'Solicitud de Patentes', 'Patent applications and filings', 'Solicitudes y presentaciones de patentes', 'file-text', '#6366F1', 10, ARRAY['patent']),
  ('PT_PROSECUTION', 'Patent Prosecution', 'Tramitación de Patentes', 'Office actions and prosecution', 'Requerimientos y tramitación oficial', 'settings', '#06B6D4', 11, ARRAY['patent']),
  ('PT_MAINTENANCE', 'Patent Maintenance', 'Mantenimiento de Patentes', 'Annuities and maintenance fees', 'Anualidades y tasas de mantenimiento', 'calendar-check', '#10B981', 12, ARRAY['patent']),
  
  -- Diseños
  ('DS_REG', 'Design Registration', 'Registro de Diseños', 'Design filing and registration', 'Presentación y registro de diseños', 'palette', '#EC4899', 20, ARRAY['design']),
  
  -- Dominios
  ('DN_REG', 'Domain Registration', 'Registro de Dominios', 'Domain name registration and management', 'Registro y gestión de nombres de dominio', 'globe', '#0EA5E9', 30, ARRAY['domain']),
  
  -- Servicios legales
  ('LEGAL_ADV', 'Legal Advisory', 'Asesoría Legal', 'IP strategy and legal consulting', 'Estrategia de PI y consultoría legal', 'scale', '#475569', 40, ARRAY['trademark', 'patent', 'design', 'domain', 'copyright']),
  ('LITIGATION', 'Litigation', 'Litigios', 'IP disputes and enforcement', 'Disputas de PI y enforcement', 'gavel', '#DC2626', 41, ARRAY['trademark', 'patent', 'design']),
  
  -- Otros
  ('MISC', 'Other Services', 'Otros Servicios', 'Administrative and miscellaneous services', 'Servicios administrativos y varios', 'folder', '#6B7280', 99, ARRAY['trademark', 'patent', 'design', 'domain', 'copyright'])
ON CONFLICT (code) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_es = EXCLUDED.name_es,
  description_en = EXCLUDED.description_en,
  description_es = EXCLUDED.description_es,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  position = EXCLUDED.position,
  right_types = EXCLUDED.right_types;

-- Actualizar service_catalog existente con category_ids
UPDATE service_catalog sc
SET category_id = cat.id
FROM service_categories cat
WHERE 
  (sc.service_type LIKE 'tm_reg%' AND cat.code = 'TM_REG') OR
  (sc.service_type LIKE 'tm_renewal%' AND cat.code = 'TM_RENEWAL') OR
  (sc.service_type LIKE 'tm_search%' AND cat.code = 'TM_SEARCH') OR
  (sc.service_type LIKE 'tm_oppos%' AND cat.code = 'TM_OPPOSITION') OR
  (sc.service_type LIKE 'tm_watch%' AND cat.code = 'TM_WATCH') OR
  (sc.service_type LIKE 'pt_filing%' AND cat.code = 'PT_FILING') OR
  (sc.service_type LIKE 'pt_maint%' AND cat.code = 'PT_MAINTENANCE') OR
  (sc.service_type LIKE 'ds_%' AND cat.code = 'DS_REG') OR
  (sc.service_type = 'marca' AND cat.code = 'TM_REG') OR
  (sc.service_type = 'patente' AND cat.code = 'PT_FILING') OR
  (sc.service_type = 'diseño' AND cat.code = 'DS_REG') OR
  (sc.service_type = 'renovacion' AND cat.code = 'TM_RENEWAL') OR
  (sc.service_type = 'oposicion' AND cat.code = 'TM_OPPOSITION') OR
  (sc.service_type = 'vigilancia' AND cat.code = 'TM_WATCH');

-- Los 'general' van a MISC
UPDATE service_catalog SET category_id = (SELECT id FROM service_categories WHERE code = 'MISC')
WHERE category_id IS NULL;