-- =====================================================
-- SISTEMA UNIVERSAL DE IMPORTACIÓN
-- =====================================================

-- Fuentes de importación (conexiones)
CREATE TABLE import_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identificación
  name TEXT NOT NULL,
  description TEXT,
  
  -- Tipo de fuente
  source_type TEXT NOT NULL CHECK (source_type IN (
    'api',
    'database',
    'web_scraper',
    'file_upload',
    'email_forward',
    'watched_folder',
    'agent'
  )),
  
  -- Sistema de PI detectado/configurado
  detected_system TEXT,
  system_confidence DECIMAL(3,2),
  
  -- Configuración según tipo
  config JSONB NOT NULL DEFAULT '{}',
  
  -- Credenciales (referencia a Vault)
  credentials_vault_id UUID,
  
  -- Estado
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'testing',
    'active',
    'error',
    'disabled',
    'rate_limited'
  )),
  last_test_at TIMESTAMPTZ,
  last_test_result JSONB,
  
  -- Metadatos del sistema origen
  source_metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs de importación
CREATE TABLE import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source_id UUID REFERENCES import_sources(id) ON DELETE SET NULL,
  
  -- Tipo de job
  job_type TEXT NOT NULL CHECK (job_type IN (
    'full_import',
    'incremental',
    'file_import',
    'shadow_sync',
    'validation',
    'rollback'
  )),
  
  -- Configuración del job
  config JSONB NOT NULL DEFAULT '{}',
  
  -- Archivos asociados (para file_import)
  source_files JSONB DEFAULT '[]',
  
  -- Estado y progreso
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'queued',
    'running',
    'paused',
    'completed',
    'completed_with_errors',
    'failed',
    'cancelled',
    'rolled_back'
  )),
  progress JSONB DEFAULT '{}',
  
  -- Resultados
  results JSONB DEFAULT '{}',
  
  -- Shadow mode
  shadow_data JSONB,
  shadow_comparison JSONB,
  
  -- Rollback
  rollback_snapshot_id UUID,
  parent_job_id UUID REFERENCES import_jobs(id),
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Archivos de importación
CREATE TABLE import_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_id UUID REFERENCES import_jobs(id) ON DELETE SET NULL,
  
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  
  -- Estado de análisis
  analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN (
    'pending',
    'analyzing',
    'completed',
    'failed'
  )),
  analysis_result JSONB DEFAULT '{}',
  
  -- Mapeo de campos
  field_mapping JSONB,
  mapping_confirmed BOOLEAN DEFAULT FALSE,
  
  -- Estado de procesamiento
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN (
    'pending',
    'processing',
    'completed',
    'failed'
  )),
  processing_result JSONB,
  
  -- Timestamps
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  analyzed_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ
);

-- Snapshots para rollback
CREATE TABLE import_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
  
  -- Datos del snapshot
  snapshot_data JSONB NOT NULL,
  
  -- Estado antes de la importación
  affected_records JSONB NOT NULL,
  
  -- Metadata
  snapshot_size BIGINT,
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuración de sincronización incremental
CREATE TABLE import_sync_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES import_sources(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  
  sync_type TEXT NOT NULL CHECK (sync_type IN (
    'manual',
    'scheduled',
    'realtime',
    'on_change'
  )),
  
  schedule_cron TEXT,
  schedule_timezone TEXT DEFAULT 'UTC',
  
  entities_config JSONB NOT NULL,
  
  status TEXT DEFAULT 'active' CHECK (status IN (
    'active',
    'paused',
    'error',
    'disabled'
  )),
  
  sync_cursors JSONB DEFAULT '{}',
  
  -- Última sincronización
  last_sync_at TIMESTAMPTZ,
  last_sync_job_id UUID REFERENCES import_jobs(id),
  last_sync_status TEXT,
  next_sync_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reglas de extracción web (scraping)
CREATE TABLE import_scraping_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES import_sources(id) ON DELETE CASCADE,
  
  -- Sistema objetivo
  target_system TEXT NOT NULL,
  system_version TEXT,
  
  -- Reglas de navegación
  login_steps JSONB NOT NULL,
  
  -- Reglas de extracción por entidad
  extraction_rules JSONB NOT NULL,
  
  -- Rate limiting
  rate_limit_config JSONB DEFAULT '{}',
  
  -- Estado
  last_tested_at TIMESTAMPTZ,
  last_test_result JSONB,
  is_working BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plantillas de mapeo aprendidas
CREATE TABLE import_mapping_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Sistema origen
  source_system TEXT NOT NULL,
  source_type TEXT NOT NULL,
  
  -- Entidad
  entity_type TEXT NOT NULL,
  
  -- Mapeo de campos
  field_mappings JSONB NOT NULL,
  
  -- Estadísticas de uso
  times_used INT DEFAULT 0,
  times_confirmed INT DEFAULT 0,
  times_modified INT DEFAULT 0,
  avg_accuracy DECIMAL(3,2),
  
  -- Metadata
  is_system_template BOOLEAN DEFAULT FALSE,
  organization_id UUID REFERENCES organizations(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(source_system, source_type, entity_type, organization_id)
);

-- Índices
CREATE INDEX idx_import_sources_org ON import_sources(organization_id);
CREATE INDEX idx_import_sources_type ON import_sources(source_type);
CREATE INDEX idx_import_sources_status ON import_sources(status);
CREATE INDEX idx_import_jobs_org ON import_jobs(organization_id);
CREATE INDEX idx_import_jobs_status ON import_jobs(status);
CREATE INDEX idx_import_jobs_source ON import_jobs(source_id);
CREATE INDEX idx_import_files_org ON import_files(organization_id);
CREATE INDEX idx_import_files_job ON import_files(job_id);
CREATE INDEX idx_import_sync_next ON import_sync_configs(next_sync_at) WHERE enabled = TRUE;
CREATE INDEX idx_import_snapshots_job ON import_snapshots(job_id);
CREATE INDEX idx_import_scraping_source ON import_scraping_rules(source_id);
CREATE INDEX idx_import_mapping_system ON import_mapping_templates(source_system, entity_type);

-- RLS POLICIES
ALTER TABLE import_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_sync_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_scraping_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_mapping_templates ENABLE ROW LEVEL SECURITY;

-- Policies para import_sources
CREATE POLICY "Users can view own org sources" ON import_sources
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Members can manage sources" ON import_sources
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

-- Policies para import_jobs
CREATE POLICY "Users can view own org jobs" ON import_jobs
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Members can manage jobs" ON import_jobs
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

-- Policies para import_files
CREATE POLICY "Users can view own org files" ON import_files
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Members can manage files" ON import_files
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

-- Policies para import_snapshots
CREATE POLICY "Users can view own org snapshots" ON import_snapshots
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Members can manage snapshots" ON import_snapshots
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

-- Policies para import_sync_configs
CREATE POLICY "Users can view own org sync configs" ON import_sync_configs
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Members can manage sync configs" ON import_sync_configs
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

-- Policies para import_scraping_rules
CREATE POLICY "Users can view own org scraping rules" ON import_scraping_rules
  FOR SELECT USING (source_id IN (
    SELECT id FROM import_sources WHERE organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Members can manage scraping rules" ON import_scraping_rules
  FOR ALL USING (source_id IN (
    SELECT id FROM import_sources WHERE organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  ));

-- Policies para import_mapping_templates
CREATE POLICY "Users can view templates" ON import_mapping_templates
  FOR SELECT USING (
    is_system_template = TRUE 
    OR organization_id IS NULL 
    OR organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can manage own org templates" ON import_mapping_templates
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION update_import_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_import_sources_updated_at
  BEFORE UPDATE ON import_sources
  FOR EACH ROW EXECUTE FUNCTION update_import_updated_at();

CREATE TRIGGER update_import_sync_configs_updated_at
  BEFORE UPDATE ON import_sync_configs
  FOR EACH ROW EXECUTE FUNCTION update_import_updated_at();

CREATE TRIGGER update_import_scraping_rules_updated_at
  BEFORE UPDATE ON import_scraping_rules
  FOR EACH ROW EXECUTE FUNCTION update_import_updated_at();

CREATE TRIGGER update_import_mapping_templates_updated_at
  BEFORE UPDATE ON import_mapping_templates
  FOR EACH ROW EXECUTE FUNCTION update_import_updated_at();