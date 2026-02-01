-- ════════════════════════════════════════════════════════════════════════════
-- PROMPT 4B: service_templates con configuración de workflow
-- ════════════════════════════════════════════════════════════════════════════

-- Ajustar service_categories para añadir right_type si falta
ALTER TABLE service_categories 
  ADD COLUMN IF NOT EXISTS right_type TEXT DEFAULT 'all',
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- ════════════════════════════════════════════════════════════════════════════
-- TABLA: service_templates
-- Propósito: Plantillas de servicio con configuración de workflow
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS service_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- IDENTIFICACIÓN
  code TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_es TEXT NOT NULL,
  description_en TEXT,
  description_es TEXT,
  
  -- Categoría
  category_id UUID REFERENCES service_categories(id),
  
  -- ÁMBITO
  right_type TEXT NOT NULL CHECK (right_type IN ('trademark', 'patent', 'design', 'utility_model', 'copyright', 'domain', 'all')),
  jurisdiction_id UUID REFERENCES jurisdictions(id),
  international_system TEXT CHECK (international_system IN ('madrid', 'pct', 'hague', 'none', NULL)),
  
  -- WORKFLOW
  initial_phase TEXT NOT NULL DEFAULT 'F0',
  applicable_phases TEXT[] DEFAULT '{F0,F1,F2,F3,F4,F5,F6,F7,F8,F9}',
  skippable_phases TEXT[] DEFAULT '{}',
  phase_durations JSONB DEFAULT '{}',
  
  -- CONFIGURACIÓN
  required_fields TEXT[] DEFAULT '{}',
  optional_fields TEXT[] DEFAULT '{}',
  required_documents TEXT[] DEFAULT '{}',
  auto_deadlines TEXT[] DEFAULT '{}',
  
  -- PRICING (referencia)
  base_official_fee DECIMAL(10,2),
  base_professional_fee DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  fee_notes TEXT,
  
  -- METADATOS
  tags TEXT[] DEFAULT '{}',
  related_services TEXT[] DEFAULT '{}',
  internal_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_st_category ON service_templates(category_id);
CREATE INDEX IF NOT EXISTS idx_st_right_type ON service_templates(right_type);
CREATE INDEX IF NOT EXISTS idx_st_jurisdiction ON service_templates(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_st_system ON service_templates(international_system);
CREATE INDEX IF NOT EXISTS idx_st_active ON service_templates(is_active) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_st_code ON service_templates(code);
CREATE INDEX IF NOT EXISTS idx_st_tags ON service_templates USING gin(tags);

-- RLS
ALTER TABLE service_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "st_select" ON service_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "st_modify" ON service_templates FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM memberships m WHERE m.user_id = auth.uid() AND m.role IN ('owner', 'admin'))
);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_service_templates_timestamp()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_st_updated ON service_templates;
CREATE TRIGGER trg_st_updated BEFORE UPDATE ON service_templates
FOR EACH ROW EXECUTE FUNCTION update_service_templates_timestamp();

-- ════════════════════════════════════════════════════════════════════════════
-- Actualizar service_categories con right_type correcto
-- ════════════════════════════════════════════════════════════════════════════

UPDATE service_categories SET right_type = 'trademark' WHERE code IN ('TM_REG', 'TM_RENEWAL', 'TM_SEARCH', 'TM_OPPOSITION', 'TM_WATCH');
UPDATE service_categories SET right_type = 'patent' WHERE code IN ('PT_FILING', 'PT_PROSECUTION', 'PT_MAINTENANCE');
UPDATE service_categories SET right_type = 'design' WHERE code = 'DS_REG';
UPDATE service_categories SET right_type = 'domain' WHERE code = 'DN_REG';
UPDATE service_categories SET right_type = 'all' WHERE code IN ('LEGAL_ADV', 'LITIGATION', 'MISC');