-- ============================================================
-- DOCUMENTO EXTRACTIONS - Sugerencias de extracción inteligente
-- ============================================================

-- Tabla principal de extracciones
CREATE TABLE IF NOT EXISTS document_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Documento origen
  document_id UUID,  -- Referencia genérica (puede ser matter_documents, client_documents)
  document_source VARCHAR(50) DEFAULT 'matter_documents',  -- matter_documents, client_documents
  storage_path TEXT,
  file_name VARCHAR(255),
  file_type VARCHAR(50),
  
  -- Contexto
  matter_id UUID REFERENCES matters_v2(id) ON DELETE SET NULL,
  client_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  
  -- Clasificación del documento
  document_type VARCHAR(50),  -- certificate, power_of_attorney, invoice, communication, order, grant_certificate, etc.
  detected_jurisdiction VARCHAR(10),
  detected_language VARCHAR(10),
  confidence_score DECIMAL(3,2),
  
  -- Texto extraído (para debug y auditoría)
  raw_text TEXT,
  
  -- Entidades extraídas (JSON estructurado)
  extracted_entities JSONB DEFAULT '{}',
  
  -- Sugerencias generadas
  suggestions JSONB DEFAULT '[]',
  
  -- Datos de cliente si se detecta nuevo
  client_data JSONB DEFAULT NULL,
  
  -- Estado de revisión
  status VARCHAR(20) DEFAULT 'pending',  -- pending, reviewed, applied, partial, rejected
  suggestions_applied INTEGER DEFAULT 0,
  suggestions_rejected INTEGER DEFAULT 0,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  
  -- Auditoría y métricas
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processing_time_ms INTEGER,
  ai_model_used VARCHAR(100),
  ai_tokens_input INTEGER,
  ai_tokens_output INTEGER,
  ai_cost_usd DECIMAL(10,6)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_doc_extractions_org ON document_extractions(organization_id);
CREATE INDEX IF NOT EXISTS idx_doc_extractions_matter ON document_extractions(matter_id);
CREATE INDEX IF NOT EXISTS idx_doc_extractions_status ON document_extractions(status);
CREATE INDEX IF NOT EXISTS idx_doc_extractions_created ON document_extractions(created_at DESC);

-- RLS
ALTER TABLE document_extractions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for document_extractions"
  ON document_extractions
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- Historial de aplicación de sugerencias
-- ============================================================
CREATE TABLE IF NOT EXISTS extraction_suggestion_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  extraction_id UUID NOT NULL REFERENCES document_extractions(id) ON DELETE CASCADE,
  
  -- Qué sugerencia
  field_name VARCHAR(100) NOT NULL,
  target_table VARCHAR(50) NOT NULL,  -- matters_v2, matter_filings, contacts
  target_id UUID,
  
  -- Valores
  old_value TEXT,
  new_value TEXT,
  
  -- Acción
  action VARCHAR(20) NOT NULL,  -- applied, rejected
  applied_by UUID REFERENCES users(id),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Notas
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_suggestion_log_extraction ON extraction_suggestion_log(extraction_id);

ALTER TABLE extraction_suggestion_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for extraction_suggestion_log"
  ON extraction_suggestion_log
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- Añadir campos de extracción a matter_documents
-- ============================================================
ALTER TABLE matter_documents 
  ADD COLUMN IF NOT EXISTS extraction_id UUID REFERENCES document_extractions(id),
  ADD COLUMN IF NOT EXISTS extraction_status VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ocr_text TEXT;