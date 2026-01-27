-- ============================================================
-- AI BRAIN FASE 6: RAG + KNOWLEDGE BASES
-- Bases de conocimiento multi-tenant con embeddings
-- ============================================================

-- 1. Knowledge Bases
CREATE TABLE IF NOT EXISTS rag_knowledge_bases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Scope
  tenant_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identificación
  code VARCHAR(100) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Clasificación
  type VARCHAR(30) DEFAULT 'general',
  jurisdictions TEXT[],
  languages TEXT[],
  
  -- Configuración de embeddings
  embedding_provider VARCHAR(20) DEFAULT 'google',
  embedding_model VARCHAR(100) DEFAULT 'text-embedding-004',
  embedding_dimensions INTEGER DEFAULT 768,
  
  -- Configuración de chunking
  chunk_size INTEGER DEFAULT 1000,
  chunk_overlap INTEGER DEFAULT 200,
  
  -- Configuración de retrieval
  default_top_k INTEGER DEFAULT 5,
  similarity_threshold DECIMAL(3,2) DEFAULT 0.7,
  
  -- Permisos
  visibility VARCHAR(20) DEFAULT 'tenant',
  allowed_roles TEXT[],
  
  -- Asociación con tareas
  associated_tasks UUID[],
  
  -- Estado
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Stats
  document_count INTEGER DEFAULT 0,
  chunk_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  last_updated_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rag_kb_tenant ON rag_knowledge_bases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rag_kb_type ON rag_knowledge_bases(type);

-- 2. Documents
CREATE TABLE IF NOT EXISTS rag_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_base_id UUID NOT NULL REFERENCES rag_knowledge_bases(id) ON DELETE CASCADE,
  
  -- Identificación
  title VARCHAR(500) NOT NULL,
  source_url VARCHAR(1000),
  source_type VARCHAR(50),
  
  -- Metadata legal
  jurisdiction VARCHAR(10),
  language VARCHAR(10) DEFAULT 'es',
  
  -- Versionado
  version VARCHAR(50),
  effective_from DATE,
  effective_to DATE,
  is_current BOOLEAN DEFAULT TRUE,
  supersedes_id UUID REFERENCES rag_documents(id),
  
  -- Clasificación
  document_type VARCHAR(50),
  tags TEXT[],
  
  -- Contenido original
  raw_content TEXT,
  content_hash VARCHAR(64),
  
  -- Procesamiento
  processed_at TIMESTAMPTZ,
  chunk_count INTEGER DEFAULT 0,
  token_count INTEGER DEFAULT 0,
  
  -- Estado
  status VARCHAR(20) DEFAULT 'pending',
  error_message TEXT,
  
  -- Metadata adicional
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rag_docs_kb ON rag_documents(knowledge_base_id);
CREATE INDEX IF NOT EXISTS idx_rag_docs_status ON rag_documents(status);
CREATE INDEX IF NOT EXISTS idx_rag_docs_jurisdiction ON rag_documents(jurisdiction);

-- 3. Chunks (sin vector por ahora, se añadirá cuando se habilite pgvector)
CREATE TABLE IF NOT EXISTS rag_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
  knowledge_base_id UUID NOT NULL REFERENCES rag_knowledge_bases(id) ON DELETE CASCADE,
  
  -- Contenido
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  
  -- Embedding como JSONB (alternativa a pgvector)
  embedding JSONB,
  
  -- Metadata heredada del documento
  jurisdiction VARCHAR(10),
  language VARCHAR(10),
  document_type VARCHAR(50),
  is_current BOOLEAN DEFAULT TRUE,
  
  -- Posición en documento
  start_char INTEGER,
  end_char INTEGER,
  
  -- Tokens
  token_count INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rag_chunks_doc ON rag_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_rag_chunks_kb ON rag_chunks(knowledge_base_id);

-- 4. Queries (Auditoría)
CREATE TABLE IF NOT EXISTS rag_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contexto
  tenant_id UUID REFERENCES organizations(id),
  execution_id UUID,
  knowledge_base_id UUID NOT NULL REFERENCES rag_knowledge_bases(id),
  task_code VARCHAR(100),
  
  -- Query
  query_text TEXT NOT NULL,
  query_embedding JSONB,
  
  -- Filtros aplicados
  filters_applied JSONB,
  
  -- Resultados
  top_k_requested INTEGER,
  chunks_retrieved INTEGER,
  chunks_used INTEGER,
  
  -- Sources usados
  sources JSONB,
  
  -- Timing
  latency_ms INTEGER,
  
  -- Usuario
  user_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rag_queries_kb ON rag_queries(knowledge_base_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rag_queries_tenant ON rag_queries(tenant_id, created_at DESC);

-- 5. Configuración RAG por Tarea
CREATE TABLE IF NOT EXISTS ai_task_rag_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES ai_task_assignments(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES organizations(id),
  
  -- Knowledge bases a usar
  knowledge_base_ids UUID[] NOT NULL,
  
  -- Configuración de retrieval
  top_k INTEGER DEFAULT 5,
  similarity_threshold DECIMAL(3,2) DEFAULT 0.7,
  
  -- Filtros automáticos
  auto_filter_jurisdiction BOOLEAN DEFAULT TRUE,
  auto_filter_language BOOLEAN DEFAULT TRUE,
  auto_filter_current BOOLEAN DEFAULT TRUE,
  
  -- Cómo inyectar en prompt
  injection_template TEXT DEFAULT '## Información Relevante:

{{chunks}}',
  max_context_tokens INTEGER DEFAULT 4000,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Function: Update KB Stats
CREATE OR REPLACE FUNCTION update_rag_kb_stats(p_kb_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE rag_knowledge_bases SET
    document_count = (SELECT COUNT(*) FROM rag_documents WHERE knowledge_base_id = p_kb_id AND status = 'ready'),
    chunk_count = (SELECT COUNT(*) FROM rag_chunks WHERE knowledge_base_id = p_kb_id),
    total_tokens = (SELECT COALESCE(SUM(token_count), 0) FROM rag_chunks WHERE knowledge_base_id = p_kb_id),
    last_updated_at = NOW(),
    updated_at = NOW()
  WHERE id = p_kb_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Function: Log RAG Query
CREATE OR REPLACE FUNCTION log_rag_query(
  p_tenant_id UUID,
  p_knowledge_base_id UUID,
  p_execution_id UUID,
  p_task_code VARCHAR,
  p_query_text TEXT,
  p_filters JSONB,
  p_top_k INTEGER,
  p_chunks_retrieved INTEGER,
  p_chunks_used INTEGER,
  p_sources JSONB,
  p_latency_ms INTEGER
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO rag_queries (
    tenant_id, knowledge_base_id, execution_id, task_code,
    query_text, filters_applied, top_k_requested,
    chunks_retrieved, chunks_used, sources, latency_ms
  ) VALUES (
    p_tenant_id, p_knowledge_base_id, p_execution_id, p_task_code,
    p_query_text, p_filters, p_top_k,
    p_chunks_retrieved, p_chunks_used, p_sources, p_latency_ms
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE rag_knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_task_rag_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow all for rag_knowledge_bases" ON rag_knowledge_bases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for rag_documents" ON rag_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for rag_chunks" ON rag_chunks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for rag_queries" ON rag_queries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for ai_task_rag_config" ON ai_task_rag_config FOR ALL USING (true) WITH CHECK (true);

-- Seed: Global knowledge bases
INSERT INTO rag_knowledge_bases (tenant_id, code, name, description, type, jurisdictions, languages, visibility)
VALUES (
  NULL,
  'ip-legal-global',
  'Legislación PI Global',
  'Base de conocimiento con legislación de propiedad intelectual de múltiples jurisdicciones',
  'legal',
  ARRAY['ES', 'EU', 'US', 'WIPO'],
  ARRAY['es', 'en'],
  'global'
) ON CONFLICT DO NOTHING;

INSERT INTO rag_knowledge_bases (tenant_id, code, name, description, type, languages, visibility)
VALUES (
  NULL,
  'templates-legal',
  'Plantillas Legales',
  'Plantillas y modelos de documentos legales para PI',
  'technical',
  ARRAY['es'],
  'global'
) ON CONFLICT DO NOTHING;

INSERT INTO rag_knowledge_bases (tenant_id, code, name, description, type, languages, visibility)
VALUES (
  NULL,
  'faq-ip',
  'Preguntas Frecuentes PI',
  'Respuestas a preguntas comunes sobre propiedad intelectual',
  'faq',
  ARRAY['es', 'en'],
  'global'
) ON CONFLICT DO NOTHING;