-- ============================================
-- LEGAL LIBRARY SYSTEM - IP-NEXUS
-- ============================================

-- Documentos Legales
CREATE TABLE ipo_legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES ipo_offices(id) ON DELETE CASCADE,
  
  -- Identificación
  title VARCHAR(500) NOT NULL,
  title_original VARCHAR(500),
  title_english VARCHAR(500),
  
  -- Clasificación jerárquica
  document_level VARCHAR(30) NOT NULL CHECK (document_level IN ('primary', 'secondary', 'operational')),
  document_type VARCHAR(50) NOT NULL,
  
  -- Identificadores oficiales
  official_number VARCHAR(100),
  publication_date DATE,
  effective_date DATE NOT NULL,
  expiry_date DATE,
  
  -- Estado
  status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'amended', 'partially_repealed', 'repealed', 'superseded', 'expired')),
  
  -- Fuente y confiabilidad
  source_type VARCHAR(30) NOT NULL CHECK (source_type IN ('official_gazette', 'government_portal', 'wipo_lex', 'office_website', 'manual_upload')),
  source_url TEXT,
  source_reliability VARCHAR(20) NOT NULL DEFAULT 'primary' CHECK (source_reliability IN ('primary', 'secondary', 'tertiary')),
  
  -- Idioma
  language_original VARCHAR(10) NOT NULL,
  languages_available VARCHAR(10)[] DEFAULT '{}',
  
  -- Aplicabilidad
  ip_types VARCHAR(30)[] DEFAULT '{}',
  applies_to_nationals BOOLEAN DEFAULT true,
  applies_to_foreigners BOOLEAN DEFAULT true,
  
  -- Contenido
  content_summary TEXT,
  content_full TEXT,
  content_url TEXT,
  
  -- Archivo local
  file_path TEXT,
  file_hash VARCHAR(64),
  file_size_bytes INTEGER,
  
  -- Procesamiento
  processing_status VARCHAR(30) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'indexed', 'failed', 'needs_review')),
  processing_error TEXT,
  
  -- Indexación para RAG
  is_indexed BOOLEAN DEFAULT false,
  indexed_at TIMESTAMPTZ,
  chunk_count INTEGER DEFAULT 0,
  
  -- Metadatos
  tags VARCHAR(100)[] DEFAULT '{}',
  notes TEXT,
  
  -- Auditoría
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_verified_at TIMESTAMPTZ,
  last_verified_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_legal_docs_office ON ipo_legal_documents(office_id, status);
CREATE INDEX idx_legal_docs_type ON ipo_legal_documents(document_level, document_type);
CREATE INDEX idx_legal_docs_effective ON ipo_legal_documents(effective_date, expiry_date);

-- Versiones de Documentos
CREATE TABLE ipo_legal_document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES ipo_legal_documents(id) ON DELETE CASCADE,
  
  version_number INTEGER NOT NULL,
  version_label VARCHAR(50),
  
  change_type VARCHAR(30) NOT NULL CHECK (change_type IN ('original', 'amendment', 'revision', 'correction', 'consolidation')),
  change_description TEXT,
  change_date DATE NOT NULL,
  
  content_snapshot TEXT,
  file_path TEXT,
  file_hash VARCHAR(64),
  
  diff_from_previous JSONB,
  
  is_current BOOLEAN DEFAULT false,
  superseded_at TIMESTAMPTZ,
  superseded_by UUID REFERENCES ipo_legal_document_versions(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_legal_versions_doc ON ipo_legal_document_versions(document_id, is_current);

-- Artículos/Secciones (Granularidad para citación)
CREATE TABLE ipo_legal_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES ipo_legal_documents(id) ON DELETE CASCADE,
  version_id UUID REFERENCES ipo_legal_document_versions(id),
  
  article_type VARCHAR(30) NOT NULL CHECK (article_type IN ('title', 'chapter', 'section', 'article', 'paragraph', 'item', 'annex')),
  
  number VARCHAR(50),
  full_reference VARCHAR(200),
  
  parent_id UUID REFERENCES ipo_legal_articles(id),
  hierarchy_path TEXT,
  sort_order INTEGER,
  
  heading TEXT,
  content TEXT NOT NULL,
  content_english TEXT,
  
  status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'amended', 'repealed', 'suspended')),
  
  ip_types VARCHAR(30)[] DEFAULT '{}',
  keywords VARCHAR(100)[] DEFAULT '{}',
  
  citation_format VARCHAR(300),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_legal_articles_doc ON ipo_legal_articles(document_id, status);
CREATE INDEX idx_legal_articles_ref ON ipo_legal_articles(full_reference);

-- Relaciones entre Documentos
CREATE TABLE ipo_legal_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  source_document_id UUID NOT NULL REFERENCES ipo_legal_documents(id) ON DELETE CASCADE,
  source_article_id UUID REFERENCES ipo_legal_articles(id),
  
  target_document_id UUID NOT NULL REFERENCES ipo_legal_documents(id) ON DELETE CASCADE,
  target_article_id UUID REFERENCES ipo_legal_articles(id),
  
  relation_type VARCHAR(50) NOT NULL CHECK (relation_type IN ('repeals', 'partially_repeals', 'amends', 'implements', 'supersedes', 'references', 'complements', 'conflicts_with')),
  
  effective_date DATE,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_legal_relations_source ON ipo_legal_relations(source_document_id);
CREATE INDEX idx_legal_relations_target ON ipo_legal_relations(target_document_id);

-- Tratados Internacionales
CREATE TABLE ipo_treaty_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES ipo_offices(id) ON DELETE CASCADE,
  
  treaty_code VARCHAR(50) NOT NULL,
  treaty_name VARCHAR(200) NOT NULL,
  
  status VARCHAR(30) NOT NULL CHECK (status IN ('member', 'signatory', 'not_member', 'withdrawn')),
  
  ratification_date DATE,
  entry_into_force_date DATE,
  withdrawal_date DATE,
  
  has_reservations BOOLEAN DEFAULT false,
  reservations_text TEXT,
  
  source_url TEXT,
  last_verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(office_id, treaty_code)
);

-- Historial de Tasas
CREATE TABLE ipo_fee_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_id UUID NOT NULL REFERENCES ipo_official_fees(id) ON DELETE CASCADE,
  
  amount_old DECIMAL(12,2),
  amount_new DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  
  change_date DATE NOT NULL,
  change_reason TEXT,
  
  source_document_id UUID REFERENCES ipo_legal_documents(id),
  source_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fee_history ON ipo_fee_history(fee_id, change_date DESC);

-- Formularios Oficiales
CREATE TABLE ipo_official_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES ipo_offices(id) ON DELETE CASCADE,
  
  form_code VARCHAR(50),
  form_name VARCHAR(300) NOT NULL,
  form_name_english VARCHAR(300),
  
  form_type VARCHAR(50) NOT NULL CHECK (form_type IN ('application', 'renewal', 'assignment', 'opposition', 'appeal', 'power_of_attorney', 'declaration', 'response', 'withdrawal', 'other')),
  
  ip_type VARCHAR(30),
  
  file_path_original TEXT,
  file_path_fillable TEXT,
  file_format VARCHAR(20),
  
  supports_efiling BOOLEAN DEFAULT false,
  efiling_url TEXT,
  efiling_format VARCHAR(20),
  efiling_schema TEXT,
  
  requires_signature BOOLEAN DEFAULT true,
  requires_legalization BOOLEAN DEFAULT false,
  requires_notarization BOOLEAN DEFAULT false,
  
  language VARCHAR(10) NOT NULL,
  
  version VARCHAR(50),
  effective_date DATE,
  expiry_date DATE,
  
  status VARCHAR(30) DEFAULT 'active',
  
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forms_office ON ipo_official_forms(office_id, form_type, status);

-- Chunks para RAG
CREATE TABLE ipo_legal_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  document_id UUID REFERENCES ipo_legal_documents(id) ON DELETE CASCADE,
  article_id UUID REFERENCES ipo_legal_articles(id) ON DELETE CASCADE,
  
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  chunk_size INTEGER,
  
  context_before TEXT,
  context_after TEXT,
  
  citation_info JSONB NOT NULL,
  
  language VARCHAR(10),
  office_id UUID REFERENCES ipo_offices(id),
  ip_types VARCHAR(30)[],
  keywords VARCHAR(100)[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_legal_chunks_doc ON ipo_legal_chunks(document_id);
CREATE INDEX idx_legal_chunks_office ON ipo_legal_chunks(office_id);

-- Jobs de Ingesta
CREATE TABLE ipo_legal_ingestion_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID REFERENCES ipo_offices(id),
  
  channel VARCHAR(30) NOT NULL CHECK (channel IN ('wipo_lex', 'legal_crawler', 'pdf_intelligence', 'manual_upload')),
  
  source_url TEXT,
  config JSONB DEFAULT '{}',
  
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'needs_review')),
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  documents_found INTEGER DEFAULT 0,
  documents_imported INTEGER DEFAULT 0,
  documents_updated INTEGER DEFAULT 0,
  documents_skipped INTEGER DEFAULT 0,
  
  errors JSONB DEFAULT '[]',
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ingestion_jobs_office ON ipo_legal_ingestion_jobs(office_id, status);

-- Alertas de Cambio Legal
CREATE TABLE ipo_legal_change_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES ipo_offices(id) ON DELETE CASCADE,
  
  document_id UUID REFERENCES ipo_legal_documents(id) ON DELETE CASCADE,
  
  change_type VARCHAR(30) NOT NULL CHECK (change_type IN ('new_law', 'amendment', 'repeal', 'fee_change', 'form_change', 'deadline_change', 'other')),
  
  title VARCHAR(300) NOT NULL,
  summary TEXT,
  
  impact_level VARCHAR(20) NOT NULL CHECK (impact_level IN ('critical', 'high', 'medium', 'low')),
  affected_ip_types VARCHAR(30)[] DEFAULT '{}',
  
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  effective_date DATE,
  
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  
  diff_data JSONB,
  source_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_legal_alerts_office ON ipo_legal_change_alerts(office_id, status);
CREATE INDEX idx_legal_alerts_impact ON ipo_legal_change_alerts(impact_level, status);

-- Enable RLS
ALTER TABLE ipo_legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipo_legal_document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipo_legal_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipo_legal_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipo_treaty_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipo_fee_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipo_official_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipo_legal_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipo_legal_ingestion_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipo_legal_change_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (backoffice access - authenticated users)
CREATE POLICY "Authenticated users can read legal documents" ON ipo_legal_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage legal documents" ON ipo_legal_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read document versions" ON ipo_legal_document_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage document versions" ON ipo_legal_document_versions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read articles" ON ipo_legal_articles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage articles" ON ipo_legal_articles FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read relations" ON ipo_legal_relations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage relations" ON ipo_legal_relations FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read treaty status" ON ipo_treaty_status FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage treaty status" ON ipo_treaty_status FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read fee history" ON ipo_fee_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage fee history" ON ipo_fee_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read forms" ON ipo_official_forms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage forms" ON ipo_official_forms FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read chunks" ON ipo_legal_chunks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage chunks" ON ipo_legal_chunks FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read ingestion jobs" ON ipo_legal_ingestion_jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage ingestion jobs" ON ipo_legal_ingestion_jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read alerts" ON ipo_legal_change_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage alerts" ON ipo_legal_change_alerts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_legal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ipo_legal_documents_updated_at BEFORE UPDATE ON ipo_legal_documents FOR EACH ROW EXECUTE FUNCTION update_legal_updated_at();
CREATE TRIGGER update_ipo_legal_articles_updated_at BEFORE UPDATE ON ipo_legal_articles FOR EACH ROW EXECUTE FUNCTION update_legal_updated_at();
CREATE TRIGGER update_ipo_treaty_status_updated_at BEFORE UPDATE ON ipo_treaty_status FOR EACH ROW EXECUTE FUNCTION update_legal_updated_at();
CREATE TRIGGER update_ipo_official_forms_updated_at BEFORE UPDATE ON ipo_official_forms FOR EACH ROW EXECUTE FUNCTION update_legal_updated_at();