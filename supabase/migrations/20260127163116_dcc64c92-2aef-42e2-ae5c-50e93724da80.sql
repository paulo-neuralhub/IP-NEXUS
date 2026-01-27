-- =============================================
-- FASE 1-B: Completar Tablas Principales
-- Añadir columnas faltantes a matters_v2 y matter_filings
-- =============================================

-- 1. AÑADIR COLUMNAS FALTANTES A matters_v2
ALTER TABLE matters_v2 ADD COLUMN IF NOT EXISTS internal_reference VARCHAR(100);
ALTER TABLE matters_v2 ADD COLUMN IF NOT EXISTS client_reference VARCHAR(100);
ALTER TABLE matters_v2 ADD COLUMN IF NOT EXISTS type_code VARCHAR(5);
ALTER TABLE matters_v2 ADD COLUMN IF NOT EXISTS category VARCHAR(30);
ALTER TABLE matters_v2 ADD COLUMN IF NOT EXISTS jurisdiction_primary VARCHAR(3) DEFAULT 'GL';
ALTER TABLE matters_v2 ADD COLUMN IF NOT EXISTS title_original VARCHAR(500);
ALTER TABLE matters_v2 ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE matters_v2 ADD COLUMN IF NOT EXISTS primary_contact_id UUID;
ALTER TABLE matters_v2 ADD COLUMN IF NOT EXISTS team_ids UUID[];
ALTER TABLE matters_v2 ADD COLUMN IF NOT EXISTS sub_status VARCHAR(50);
ALTER TABLE matters_v2 ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMPTZ;
ALTER TABLE matters_v2 ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ;
ALTER TABLE matters_v2 ADD COLUMN IF NOT EXISTS target_date DATE;
ALTER TABLE matters_v2 ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;
ALTER TABLE matters_v2 ADD COLUMN IF NOT EXISTS billing_type VARCHAR(20) DEFAULT 'standard';
ALTER TABLE matters_v2 ADD COLUMN IF NOT EXISTS estimated_budget DECIMAL(12,2);
ALTER TABLE matters_v2 ADD COLUMN IF NOT EXISTS cost_center VARCHAR(50);
ALTER TABLE matters_v2 ADD COLUMN IF NOT EXISTS business_unit VARCHAR(100);
ALTER TABLE matters_v2 ADD COLUMN IF NOT EXISTS source VARCHAR(50);
ALTER TABLE matters_v2 ADD COLUMN IF NOT EXISTS source_detail VARCHAR(200);
ALTER TABLE matters_v2 ADD COLUMN IF NOT EXISTS portal_visibility JSONB DEFAULT '{"show_timeline": true, "show_documents": true, "show_deadlines": true, "show_communications": false, "show_costs": false, "allow_document_upload": true, "allow_messages": true}';
ALTER TABLE matters_v2 ADD COLUMN IF NOT EXISTS notes_internal TEXT;
ALTER TABLE matters_v2 ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Sincronizar type_code con matter_type existente
UPDATE matters_v2 SET type_code = matter_type WHERE type_code IS NULL AND matter_type IS NOT NULL;

-- 2. AÑADIR COLUMNAS FALTANTES A matter_filings
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS filing_reference VARCHAR(50);
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS office_id UUID;
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS status_detail TEXT;
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS mark_type VARCHAR(30);
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS nice_classes INTEGER[];
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS nice_classes_detail JSONB;
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS goods_services TEXT;
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS patent_type VARCHAR(30);
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS ipc_classes VARCHAR[];
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS claims_count INTEGER;
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS entity_status VARCHAR(20);
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS entity_status_history JSONB;
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS confirmation_number VARCHAR(10);
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS art_unit VARCHAR(10);
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS patent_term_adjustment INTEGER;
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS designated_states VARCHAR[];
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS validation_deadline DATE;
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS security_review_date DATE;
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS subclasses JSONB;
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS parent_filing_id UUID;
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS relationship_type VARCHAR(20);
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS priority_claims JSONB;
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS official_fees_currency VARCHAR(3);
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS jurisdiction_data JSONB DEFAULT '{}';
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE matter_filings ADD COLUMN IF NOT EXISTS updated_by UUID;

-- 3. AÑADIR ÍNDICES ADICIONALES
CREATE INDEX IF NOT EXISTS idx_matters_v2_type_code ON matters_v2(organization_id, type_code);
CREATE INDEX IF NOT EXISTS idx_matters_v2_jurisdiction ON matters_v2(organization_id, jurisdiction_primary);
CREATE INDEX IF NOT EXISTS idx_matters_v2_number ON matters_v2(matter_number);
CREATE INDEX IF NOT EXISTS idx_matters_v2_responsible ON matters_v2(responsible_id);
CREATE INDEX IF NOT EXISTS idx_matters_v2_target_date ON matters_v2(target_date) WHERE target_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_filings_office ON matter_filings(office_id);
CREATE INDEX IF NOT EXISTS idx_filings_expiry ON matter_filings(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_filings_parent ON matter_filings(parent_filing_id) WHERE parent_filing_id IS NOT NULL;

-- Full text search para matters_v2
DROP INDEX IF EXISTS idx_matters_v2_search;
CREATE INDEX idx_matters_v2_search ON matters_v2 
USING gin(to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(matter_number, '')));

-- 4. TRIGGER: Actualizar updated_at (si no existe)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_matters_v2_updated ON matters_v2;
CREATE TRIGGER trg_matters_v2_updated
  BEFORE UPDATE ON matters_v2
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_matter_filings_updated ON matter_filings;
CREATE TRIGGER trg_matter_filings_updated
  BEFORE UPDATE ON matter_filings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. FOREIGN KEY para parent_filing_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'matter_filings_parent_filing_id_fkey'
  ) THEN
    ALTER TABLE matter_filings 
    ADD CONSTRAINT matter_filings_parent_filing_id_fkey 
    FOREIGN KEY (parent_filing_id) REFERENCES matter_filings(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 6. UNIQUE constraint para matter_number por organización
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'matters_v2_org_number_unique'
  ) THEN
    ALTER TABLE matters_v2 
    ADD CONSTRAINT matters_v2_org_number_unique UNIQUE (organization_id, matter_number);
  END IF;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;