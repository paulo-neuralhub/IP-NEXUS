
-- ════════════════════════════════════════════════════════════════════════════
-- PROMPT 5B: DOCUMENT SYSTEM ENHANCEMENTS
-- Añadir columnas faltantes y crear document_versions
-- ════════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════════════
-- 1. AÑADIR COLUMNAS FALTANTES A matter_documents
-- ════════════════════════════════════════════════════════════════════════════

-- Template reference
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES document_templates(id);

-- Document type
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'uploaded'
  CHECK (document_type IN ('generated', 'uploaded', 'received', 'sent', 'internal'));

-- Storage path (renombrar file_path si existe)
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS storage_path TEXT;
UPDATE matter_documents SET storage_path = file_path WHERE storage_path IS NULL AND file_path IS NOT NULL;

-- File name
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS file_name TEXT;
UPDATE matter_documents SET file_name = name WHERE file_name IS NULL;

-- File extension
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS file_extension TEXT;

-- File hash for duplicates
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS file_hash TEXT;

-- Status
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
  CHECK (status IN ('draft', 'active', 'superseded', 'archived', 'deleted'));

-- Workflow phase
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS created_in_phase TEXT;

-- Dates
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS received_date DATE;
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS sent_date DATE;

-- Signatures
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS requires_signature BOOLEAN DEFAULT false;
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS signature_status TEXT 
  CHECK (signature_status IN ('pending', 'signed', 'rejected', 'not_required'));
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS signed_by UUID REFERENCES auth.users(id);
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ;

-- Correspondence
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS correspondent TEXT;
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS correspondent_reference TEXT;

-- Language
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

-- Tags
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Notes
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Versioning
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS parent_document_id UUID REFERENCES matter_documents(id);

-- Visibility
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS is_confidential BOOLEAN DEFAULT false;
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS visible_to_client BOOLEAN DEFAULT true;

-- Created by (rename uploaded_by)
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
UPDATE matter_documents SET created_by = uploaded_by WHERE created_by IS NULL AND uploaded_by IS NOT NULL;

-- Updated at
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- ════════════════════════════════════════════════════════════════════════════
-- 2. CREAR ÍNDICES ADICIONALES
-- ════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_md_template ON matter_documents(template_id);
CREATE INDEX IF NOT EXISTS idx_md_doc_type ON matter_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_md_status ON matter_documents(status);
CREATE INDEX IF NOT EXISTS idx_md_phase ON matter_documents(created_in_phase);
CREATE INDEX IF NOT EXISTS idx_md_tags ON matter_documents USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_md_active ON matter_documents(matter_id, category) WHERE status = 'active';

-- ════════════════════════════════════════════════════════════════════════════
-- 3. CREAR TABLA document_versions
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  document_id UUID NOT NULL REFERENCES matter_documents(id) ON DELETE CASCADE,
  
  -- Version info
  version_number INTEGER NOT NULL,
  
  -- File data for this version
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_hash TEXT,
  
  -- Changes
  change_summary TEXT,
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_doc_version UNIQUE (document_id, version_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dv_document ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_dv_version ON document_versions(document_id, version_number);

-- RLS
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dv_select" ON document_versions;
CREATE POLICY "dv_select" ON document_versions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM matter_documents md
    JOIN matters m ON md.matter_id = m.id
    JOIN memberships mem ON m.organization_id = mem.organization_id
    WHERE md.id = document_id AND mem.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "dv_insert" ON document_versions;
CREATE POLICY "dv_insert" ON document_versions FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM matter_documents md
    JOIN matters m ON md.matter_id = m.id
    JOIN memberships mem ON m.organization_id = mem.organization_id
    WHERE md.id = document_id AND mem.user_id = auth.uid()
  )
);

-- ════════════════════════════════════════════════════════════════════════════
-- 4. TRIGGER PARA AUTO-VERSIONADO
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION create_document_version()
RETURNS TRIGGER AS $$
BEGIN
  -- If file changed, create new version
  IF OLD.storage_path IS DISTINCT FROM NEW.storage_path AND OLD.storage_path IS NOT NULL THEN
    INSERT INTO document_versions (
      document_id, 
      version_number, 
      storage_path, 
      file_name, 
      file_size, 
      file_hash, 
      created_by
    )
    VALUES (
      OLD.id, 
      OLD.version, 
      OLD.storage_path, 
      OLD.file_name, 
      OLD.file_size, 
      OLD.file_hash, 
      COALESCE(NEW.created_by, auth.uid())
    );
    
    NEW.version := COALESCE(OLD.version, 0) + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_doc_version ON matter_documents;
CREATE TRIGGER trg_doc_version 
  BEFORE UPDATE ON matter_documents
  FOR EACH ROW EXECUTE FUNCTION create_document_version();

-- ════════════════════════════════════════════════════════════════════════════
-- 5. TRIGGER UPDATED_AT PARA matter_documents
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_matter_documents_timestamp()
RETURNS TRIGGER AS $$ 
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_mdoc_updated ON matter_documents;
CREATE TRIGGER trg_mdoc_updated 
  BEFORE UPDATE ON matter_documents
  FOR EACH ROW EXECUTE FUNCTION update_matter_documents_timestamp();

-- ════════════════════════════════════════════════════════════════════════════
-- 6. AÑADIR CAMPOS A document_templates PARA SISTEMA PI
-- ════════════════════════════════════════════════════════════════════════════

-- Right type
ALTER TABLE document_templates ADD COLUMN IF NOT EXISTS right_type TEXT
  CHECK (right_type IN ('trademark', 'patent', 'design', 'utility_model', 'copyright', 'all'));

-- Jurisdiction
ALTER TABLE document_templates ADD COLUMN IF NOT EXISTS jurisdiction_id UUID REFERENCES jurisdictions(id);

-- Typical phase
ALTER TABLE document_templates ADD COLUMN IF NOT EXISTS typical_phase TEXT;

-- Format
ALTER TABLE document_templates ADD COLUMN IF NOT EXISTS format TEXT DEFAULT 'docx'
  CHECK (format IN ('docx', 'pdf', 'html', 'txt', 'xlsx'));

-- Template file URL
ALTER TABLE document_templates ADD COLUMN IF NOT EXISTS template_file_url TEXT;

-- Variables as text array
ALTER TABLE document_templates ADD COLUMN IF NOT EXISTS variable_codes TEXT[] DEFAULT '{}';

-- Required for services
ALTER TABLE document_templates ADD COLUMN IF NOT EXISTS is_required_for TEXT[] DEFAULT '{}';

-- Auto generate on phase
ALTER TABLE document_templates ADD COLUMN IF NOT EXISTS auto_generate_on_phase TEXT;

-- Signature settings
ALTER TABLE document_templates ADD COLUMN IF NOT EXISTS requires_signature BOOLEAN DEFAULT false;
ALTER TABLE document_templates ADD COLUMN IF NOT EXISTS signature_type TEXT
  CHECK (signature_type IN ('client', 'attorney', 'both', 'none'));

-- Languages
ALTER TABLE document_templates ADD COLUMN IF NOT EXISTS available_languages TEXT[] DEFAULT '{en,es}';

-- Display order
ALTER TABLE document_templates ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Last modified by
ALTER TABLE document_templates ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id);

-- Indexes for new columns
CREATE INDEX IF NOT EXISTS idx_dt_right_type ON document_templates(right_type);
CREATE INDEX IF NOT EXISTS idx_dt_jurisdiction ON document_templates(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_dt_phase ON document_templates(typical_phase);

-- ════════════════════════════════════════════════════════════════════════════
-- 7. VERIFICACIÓN
-- ════════════════════════════════════════════════════════════════════════════

-- Confirm document_versions exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_versions') THEN
    RAISE EXCEPTION 'document_versions table was not created';
  END IF;
END $$;
