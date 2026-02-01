-- ════════════════════════════════════════════════════════════════════════════
-- TABLA: deadline_rules (versión mejorada, compatible con ipo_deadline_rules)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS deadline_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- IDENTIFICACIÓN
  code TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_es TEXT,
  description TEXT,
  
  -- ÁMBITO DE APLICACIÓN
  jurisdiction_id UUID REFERENCES jurisdictions(id),
  right_type TEXT CHECK (right_type IN ('trademark', 'patent', 'utility_model', 'design', 'copyright', 'all')),
  applies_to_phase TEXT,
  
  -- EVENTO DISPARADOR
  trigger_event TEXT NOT NULL CHECK (trigger_event IN (
    'filing_date', 'priority_date', 'publication_date', 'registration_date', 'grant_date', 'expiry_date',
    'office_action_date', 'opposition_filed_date', 'appeal_filed_date',
    'international_filing_date', 'designation_date',
    'previous_deadline', 'renewal_base_date', 'manual_date'
  )),
  trigger_field TEXT,
  
  -- CÁLCULO DEL PLAZO
  time_unit TEXT NOT NULL CHECK (time_unit IN ('days', 'weeks', 'months', 'years')),
  time_value INTEGER NOT NULL,
  adjust_to_end_of_month BOOLEAN DEFAULT false,
  adjust_to_business_day BOOLEAN DEFAULT true,
  business_day_direction TEXT DEFAULT 'forward' CHECK (business_day_direction IN ('forward', 'backward')),
  calendar_type TEXT DEFAULT 'jurisdiction' CHECK (calendar_type IN ('jurisdiction', 'wipo', 'epo', 'custom')),
  
  -- CRITICIDAD Y ALERTAS
  criticality TEXT NOT NULL DEFAULT 'normal' CHECK (criticality IN ('low', 'normal', 'high', 'critical', 'absolute')),
  alert_days INTEGER[] DEFAULT '{30, 14, 7, 1}',
  escalate_days_before INTEGER DEFAULT 7,
  escalate_to_role TEXT,
  
  -- EXTENSIONES
  is_extendable BOOLEAN DEFAULT false,
  max_extensions INTEGER,
  extension_time_value INTEGER,
  extension_time_unit TEXT CHECK (extension_time_unit IN ('days', 'weeks', 'months')),
  extension_requires_fee BOOLEAN DEFAULT false,
  
  -- CONSECUENCIAS
  consequence_if_missed TEXT,
  can_be_revived BOOLEAN DEFAULT false,
  revival_period_days INTEGER,
  revival_requires_petition BOOLEAN DEFAULT false,
  
  -- METADATOS
  category TEXT,
  legal_basis TEXT,
  legal_url TEXT,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_dr_jurisdiction ON deadline_rules(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_dr_right_type ON deadline_rules(right_type);
CREATE INDEX IF NOT EXISTS idx_dr_trigger ON deadline_rules(trigger_event);
CREATE INDEX IF NOT EXISTS idx_dr_active ON deadline_rules(is_active) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_dr_code ON deadline_rules(code);

-- RLS
ALTER TABLE deadline_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dr_select" ON deadline_rules FOR SELECT TO authenticated USING (true);

-- ════════════════════════════════════════════════════════════════════════════
-- MEJORAR matter_deadlines: añadir columnas faltantes
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE matter_deadlines 
  ADD COLUMN IF NOT EXISTS criticality TEXT DEFAULT 'normal' CHECK (criticality IN ('low', 'normal', 'high', 'critical', 'absolute')),
  ADD COLUMN IF NOT EXISTS max_extensions INTEGER,
  ADD COLUMN IF NOT EXISTS last_extended_date DATE,
  ADD COLUMN IF NOT EXISTS completion_document_id UUID,
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS assigned_team TEXT,
  ADD COLUMN IF NOT EXISTS alerts_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS alert_days INTEGER[],
  ADD COLUMN IF NOT EXISTS is_escalated BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS escalated_to UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurrence_rule TEXT,
  ADD COLUMN IF NOT EXISTS next_recurrence_date DATE,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS internal_notes TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Índices adicionales para matter_deadlines
CREATE INDEX IF NOT EXISTS idx_md_pending_due ON matter_deadlines(deadline_date, priority)
WHERE status IN ('pending', 'in_progress');

CREATE INDEX IF NOT EXISTS idx_md_alerts ON matter_deadlines(next_alert_date)
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_md_assigned ON matter_deadlines(assigned_to);

-- Trigger auto-expire
CREATE OR REPLACE FUNCTION auto_expire_deadlines()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.deadline_date < CURRENT_DATE AND NEW.status = 'pending' THEN
    NEW.status := 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_md_auto_expire ON matter_deadlines;
CREATE TRIGGER trg_md_auto_expire BEFORE UPDATE ON matter_deadlines
FOR EACH ROW EXECUTE FUNCTION auto_expire_deadlines();

-- Comentarios
COMMENT ON TABLE deadline_rules IS 'Reglas configurables para cálculo automático de plazos por jurisdicción y tipo de derecho';
COMMENT ON COLUMN deadline_rules.criticality IS 'low, normal, high, critical (pérdida de derechos), absolute (improrrogable)';