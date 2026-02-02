-- =====================================================
-- PROMPT 23: TEMPLATE CATEGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name_es VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  description_es TEXT,
  icon VARCHAR(50) DEFAULT 'FileText',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;

-- Public read policy
CREATE POLICY "public_read_template_categories" ON template_categories
  FOR SELECT USING (is_active = true);

-- Insert initial categories
INSERT INTO template_categories (code, name_es, name_en, icon, sort_order) VALUES
('commercial', 'Documentos Comerciales', 'Commercial Documents', 'FileText', 1),
('powers', 'Poderes de Representación', 'Powers of Attorney', 'Shield', 2),
('applications', 'Solicitudes y Formularios', 'Applications & Forms', 'ClipboardList', 3),
('contracts', 'Contratos y Acuerdos', 'Contracts & Agreements', 'FileSignature', 4),
('transfers', 'Cesiones y Licencias', 'Assignments & Licenses', 'ArrowLeftRight', 5),
('correspondence', 'Correspondencia', 'Correspondence', 'Mail', 6),
('internal', 'Documentos Internos', 'Internal Documents', 'FolderLock', 7)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- ADD COLUMNS TO document_templates IF MISSING
-- =====================================================
DO $$ 
BEGIN
  -- Add category_code column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'document_templates' AND column_name = 'category_code') THEN
    ALTER TABLE document_templates ADD COLUMN category_code VARCHAR(50);
  END IF;
  
  -- Add output_format if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'document_templates' AND column_name = 'output_format') THEN
    ALTER TABLE document_templates ADD COLUMN output_format VARCHAR(20) DEFAULT 'pdf';
  END IF;
  
  -- Add available_variables if not exists  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'document_templates' AND column_name = 'available_variables') THEN
    ALTER TABLE document_templates ADD COLUMN available_variables JSONB DEFAULT '[]';
  END IF;
  
  -- Add paper_size if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'document_templates' AND column_name = 'paper_size') THEN
    ALTER TABLE document_templates ADD COLUMN paper_size VARCHAR(10) DEFAULT 'A4';
  END IF;
  
  -- Add orientation if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'document_templates' AND column_name = 'orientation') THEN
    ALTER TABLE document_templates ADD COLUMN orientation VARCHAR(20) DEFAULT 'portrait';
  END IF;
  
  -- Add margins if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'document_templates' AND column_name = 'margins') THEN
    ALTER TABLE document_templates ADD COLUMN margins JSONB DEFAULT '{"top": 20, "right": 20, "bottom": 20, "left": 20}';
  END IF;
  
  -- Add applicable_matter_types if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'document_templates' AND column_name = 'applicable_matter_types') THEN
    ALTER TABLE document_templates ADD COLUMN applicable_matter_types TEXT[];
  END IF;
  
  -- Add applicable_jurisdictions if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'document_templates' AND column_name = 'applicable_jurisdictions') THEN
    ALTER TABLE document_templates ADD COLUMN applicable_jurisdictions TEXT[];
  END IF;
  
  -- Add applicable_offices if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'document_templates' AND column_name = 'applicable_offices') THEN
    ALTER TABLE document_templates ADD COLUMN applicable_offices TEXT[];
  END IF;
  
  -- Add applicable_phases if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'document_templates' AND column_name = 'applicable_phases') THEN
    ALTER TABLE document_templates ADD COLUMN applicable_phases TEXT[];
  END IF;
  
  -- Add signature_positions if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'document_templates' AND column_name = 'signature_positions') THEN
    ALTER TABLE document_templates ADD COLUMN signature_positions JSONB DEFAULT '[]';
  END IF;
  
  -- Add version if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'document_templates' AND column_name = 'version') THEN
    ALTER TABLE document_templates ADD COLUMN version INT DEFAULT 1;
  END IF;
END $$;

-- =====================================================
-- GENERATED DOCUMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
  
  -- Origin
  template_id UUID REFERENCES document_templates(id) ON DELETE SET NULL,
  template_code VARCHAR(50),
  
  -- Identification
  document_number VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50),
  
  -- Content
  content_html TEXT,
  variables_used JSONB,
  
  -- Files
  file_url TEXT,
  file_size INTEGER,
  file_hash TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft',
  
  -- Signature (if applicable)
  signature_request_id UUID,
  signed_at TIMESTAMPTZ,
  signed_file_url TEXT,
  
  -- Sending (if applicable)
  sent_to TEXT[],
  sent_at TIMESTAMPTZ,
  sent_method VARCHAR(20),
  
  -- Metadata
  generated_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "org_isolation_generated_documents" ON generated_documents
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gen_docs_org ON generated_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_gen_docs_matter ON generated_documents(matter_id);
CREATE INDEX IF NOT EXISTS idx_gen_docs_status ON generated_documents(status);

-- =====================================================
-- FUNCTION: Generate document number
-- =====================================================
CREATE OR REPLACE FUNCTION generate_document_number(p_organization_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year TEXT;
  v_count INTEGER;
BEGIN
  v_year := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COUNT(*) + 1 INTO v_count
  FROM generated_documents
  WHERE organization_id = p_organization_id
    AND document_number LIKE 'DOC-' || v_year || '-%';
  
  RETURN 'DOC-' || v_year || '-' || LPAD(v_count::TEXT, 4, '0');
END;
$$;