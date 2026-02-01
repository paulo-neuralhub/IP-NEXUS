
-- ════════════════════════════════════════════════════════════════════════════
-- IP-NEXUS: Extensión de tabla jurisdictions + jurisdiction_field_configs
-- ════════════════════════════════════════════════════════════════════════════

-- PASO 1: Añadir columnas IP a jurisdictions existente
ALTER TABLE jurisdictions 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS name_es TEXT,
ADD COLUMN IF NOT EXISTS jurisdiction_type TEXT DEFAULT 'country',
ADD COLUMN IF NOT EXISTS office_acronym TEXT,
ADD COLUMN IF NOT EXISTS office_website TEXT,
ADD COLUMN IF NOT EXISTS official_languages TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS filing_languages TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS currency_code TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT,
ADD COLUMN IF NOT EXISTS phone_code TEXT,
ADD COLUMN IF NOT EXISTS supports_trademarks BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS supports_patents BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS supports_utility_models BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS supports_designs BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_madrid_member BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_pct_member BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_hague_member BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_paris_member BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS paris_priority_months_tm INTEGER DEFAULT 6,
ADD COLUMN IF NOT EXISTS paris_priority_months_pt INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS paris_priority_months_ds INTEGER DEFAULT 6,
ADD COLUMN IF NOT EXISTS opposition_period_days INTEGER,
ADD COLUMN IF NOT EXISTS trademark_duration_years INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS patent_duration_years INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS requires_local_agent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS requires_translation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_subclasses BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS use_requirement BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS use_declaration_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS flag_code TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Añadir CHECK constraint para jurisdiction_type
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'jurisdictions_type_check'
  ) THEN
    ALTER TABLE jurisdictions 
    ADD CONSTRAINT jurisdictions_type_check 
    CHECK (jurisdiction_type IN ('country', 'regional', 'international', 'supranational'));
  END IF;
END $$;

-- Índices para nuevas columnas
CREATE INDEX IF NOT EXISTS idx_jurisdictions_type ON jurisdictions(jurisdiction_type);
CREATE INDEX IF NOT EXISTS idx_jurisdictions_madrid ON jurisdictions(is_madrid_member) WHERE is_madrid_member;
CREATE INDEX IF NOT EXISTS idx_jurisdictions_pct ON jurisdictions(is_pct_member) WHERE is_pct_member;

-- PASO 2: Crear tabla jurisdiction_field_configs
CREATE TABLE IF NOT EXISTS jurisdiction_field_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id UUID NOT NULL REFERENCES jurisdictions(id) ON DELETE CASCADE,
  right_type TEXT NOT NULL CHECK (right_type IN ('trademark', 'patent', 'utility_model', 'design', 'copyright')),
  field_key TEXT NOT NULL,
  field_label_en TEXT NOT NULL,
  field_label_es TEXT,
  field_description TEXT,
  field_placeholder TEXT,
  field_type TEXT NOT NULL CHECK (field_type IN (
    'text', 'textarea', 'number', 'date', 'select', 'multi_select', 
    'checkbox', 'radio', 'file', 'country_select'
  )),
  field_options JSONB,
  is_required BOOLEAN DEFAULT false,
  is_required_condition TEXT,
  visible_condition TEXT,
  validation_regex TEXT,
  min_length INTEGER,
  max_length INTEGER,
  field_group TEXT,
  display_order INTEGER DEFAULT 0,
  grid_column TEXT DEFAULT 'full' CHECK (grid_column IN ('full', 'half', 'third')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (jurisdiction_id, right_type, field_key)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_jfc_jurisdiction ON jurisdiction_field_configs(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_jfc_right_type ON jurisdiction_field_configs(right_type);

-- Trigger updated_at para jurisdiction_field_configs
CREATE OR REPLACE FUNCTION update_jurisdiction_field_configs_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_jfc_updated ON jurisdiction_field_configs;
CREATE TRIGGER trg_jfc_updated BEFORE UPDATE ON jurisdiction_field_configs
FOR EACH ROW EXECUTE FUNCTION update_jurisdiction_field_configs_timestamp();

-- RLS para jurisdiction_field_configs
ALTER TABLE jurisdiction_field_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jfc_select_policy" ON jurisdiction_field_configs
FOR SELECT TO authenticated USING (true);

CREATE POLICY "jfc_insert_policy" ON jurisdiction_field_configs
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "jfc_update_policy" ON jurisdiction_field_configs
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "jfc_delete_policy" ON jurisdiction_field_configs
FOR DELETE TO authenticated USING (true);

-- Actualizar datos existentes con name_en
UPDATE jurisdictions SET 
  name_en = name,
  name_es = CASE code
    WHEN 'ES' THEN 'España'
    WHEN 'US' THEN 'Estados Unidos'
    WHEN 'EU' THEN 'Unión Europea'
    WHEN 'GB' THEN 'Reino Unido'
    WHEN 'DE' THEN 'Alemania'
    WHEN 'FR' THEN 'Francia'
    WHEN 'CN' THEN 'China'
    WHEN 'JP' THEN 'Japón'
    WHEN 'KR' THEN 'Corea del Sur'
    WHEN 'BR' THEN 'Brasil'
    WHEN 'MX' THEN 'México'
    WHEN 'CA' THEN 'Canadá'
    WHEN 'AU' THEN 'Australia'
    WHEN 'IT' THEN 'Italia'
    WHEN 'PT' THEN 'Portugal'
    WHEN 'NL' THEN 'Países Bajos'
    ELSE name
  END,
  jurisdiction_type = CASE 
    WHEN code IN ('EU', 'EP') THEN 'regional'
    WHEN code IN ('WIPO', 'WO', 'PCT') THEN 'international'
    ELSE 'country'
  END,
  office_acronym = ipo_name,
  is_madrid_member = CASE WHEN code IN ('ES','EU','US','GB','DE','FR','CN','JP','KR','BR','MX','CA','AU','IT','PT','NL') THEN true ELSE false END,
  is_pct_member = CASE WHEN code IN ('ES','EU','US','GB','DE','FR','CN','JP','KR','BR','MX','CA','AU','IT','PT','NL') THEN true ELSE false END,
  flag_code = LOWER(code)
WHERE name_en IS NULL;
