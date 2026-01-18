-- =====================================================
-- BLOCKCHAIN TIMESTAMPS (IP-CHAIN)
-- =====================================================
CREATE TABLE blockchain_timestamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Referencia
  resource_type TEXT NOT NULL CHECK (resource_type IN (
    'document', 'matter', 'contract', 'design', 'invention', 'custom'
  )),
  resource_id UUID,
  
  -- Contenido hasheado
  file_name TEXT,
  file_hash TEXT NOT NULL,  -- SHA-256 del archivo
  file_size INT,
  content_hash TEXT NOT NULL,  -- Hash del contenido + metadata
  
  -- Metadata adicional
  metadata JSONB DEFAULT '{}',
  
  -- Blockchain
  blockchain TEXT DEFAULT 'ethereum' CHECK (blockchain IN (
    'ethereum', 'polygon', 'bitcoin', 'opentimestamps'
  )),
  
  -- Estado
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Esperando envío
    'submitted',    -- Enviado a blockchain
    'confirmed',    -- Confirmado en blockchain
    'failed'        -- Error
  )),
  
  -- Transacción
  tx_hash TEXT,
  block_number BIGINT,
  block_timestamp TIMESTAMPTZ,
  
  -- Certificado
  certificate_url TEXT,
  certificate_data JSONB,
  
  -- Error
  error_message TEXT,
  
  -- Fechas
  submitted_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- =====================================================
-- OCR RESULTS
-- =====================================================
CREATE TABLE ocr_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Documento origen
  document_id UUID REFERENCES matter_documents(id) ON DELETE CASCADE,
  file_url TEXT,
  file_name TEXT,
  
  -- Resultado
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed'
  )),
  
  -- Texto extraído
  extracted_text TEXT,
  confidence DECIMAL(5,2),  -- 0-100
  
  -- Estructura
  pages JSONB DEFAULT '[]',
  
  -- Entidades detectadas
  entities JSONB DEFAULT '[]',
  
  -- Metadata
  language TEXT,
  processing_time_ms INT,
  
  -- Error
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- =====================================================
-- AI VISION ANALYSIS
-- =====================================================
CREATE TABLE vision_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Imagen origen
  image_url TEXT NOT NULL,
  image_hash TEXT,
  
  -- Tipo de análisis
  analysis_type TEXT NOT NULL CHECK (analysis_type IN (
    'logo_detection',      -- Detectar logos
    'trademark_similarity', -- Similitud con otras marcas
    'text_extraction',     -- Texto en imagen
    'color_analysis',      -- Colores predominantes
    'object_detection',    -- Objetos en imagen
    'brand_recognition'    -- Reconocimiento de marca
  )),
  
  -- Estado
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed'
  )),
  
  -- Resultados
  results JSONB DEFAULT '{}',
  
  -- Comparación (para trademark_similarity)
  compare_with_id UUID,
  similarity_score DECIMAL(5,4),
  
  -- Error
  error_message TEXT,
  
  -- Metadata
  processing_time_ms INT,
  model_version TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- =====================================================
-- TRADEMARK VISUAL DATABASE
-- =====================================================
CREATE TABLE trademark_visuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  matter_id UUID REFERENCES matters(id) ON DELETE CASCADE,
  
  -- Imagen
  image_url TEXT NOT NULL,
  image_hash TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Características visuales
  color_histogram JSONB,
  shape_descriptor JSONB,
  
  -- Metadata
  mark_name TEXT,
  nice_classes INT[],
  
  -- Flags
  is_text_mark BOOLEAN DEFAULT false,
  is_device_mark BOOLEAN DEFAULT true,
  is_combination BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_blockchain_timestamps_org ON blockchain_timestamps(organization_id);
CREATE INDEX idx_blockchain_timestamps_status ON blockchain_timestamps(status);
CREATE INDEX idx_blockchain_timestamps_resource ON blockchain_timestamps(resource_type, resource_id);
CREATE INDEX idx_blockchain_timestamps_hash ON blockchain_timestamps(content_hash);

CREATE INDEX idx_ocr_results_org ON ocr_results(organization_id);
CREATE INDEX idx_ocr_results_document ON ocr_results(document_id);
CREATE INDEX idx_ocr_results_status ON ocr_results(status);

CREATE INDEX idx_vision_analyses_org ON vision_analyses(organization_id);
CREATE INDEX idx_vision_analyses_type ON vision_analyses(analysis_type);
CREATE INDEX idx_vision_analyses_status ON vision_analyses(status);

CREATE INDEX idx_trademark_visuals_org ON trademark_visuals(organization_id);
CREATE INDEX idx_trademark_visuals_matter ON trademark_visuals(matter_id);

-- =====================================================
-- RLS
-- =====================================================
ALTER TABLE blockchain_timestamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocr_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE trademark_visuals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org blockchain_timestamps" ON blockchain_timestamps FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Org ocr_results" ON ocr_results FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Org vision_analyses" ON vision_analyses FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Org trademark_visuals" ON trademark_visuals FOR ALL USING (
  organization_id IS NULL OR
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);