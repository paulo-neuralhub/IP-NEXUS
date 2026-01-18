-- =====================================================
-- IMPORTACIONES
-- =====================================================
CREATE TABLE imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Tipo y fuente
  import_type TEXT NOT NULL,
  source_type TEXT NOT NULL,
  
  -- Archivo
  file_name TEXT,
  file_url TEXT,
  file_size INT,
  
  -- Configuración
  mapping JSONB DEFAULT '{}',
  options JSONB DEFAULT '{}',
  
  -- Estado
  status TEXT DEFAULT 'pending',
  
  -- Progreso
  total_rows INT DEFAULT 0,
  processed_rows INT DEFAULT 0,
  success_rows INT DEFAULT 0,
  error_rows INT DEFAULT 0,
  skipped_rows INT DEFAULT 0,
  
  -- Errores
  errors JSONB DEFAULT '[]',
  
  -- Resultado
  created_ids JSONB DEFAULT '[]',
  updated_ids JSONB DEFAULT '[]',
  
  -- Metadata
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- =====================================================
-- CONECTORES DE DATOS
-- =====================================================
CREATE TABLE data_connectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identificación
  name TEXT NOT NULL,
  connector_type TEXT NOT NULL,
  
  -- Configuración
  config JSONB DEFAULT '{}',
  
  -- Credenciales (encriptadas)
  credentials JSONB DEFAULT '{}',
  
  -- Sincronización
  sync_enabled BOOLEAN DEFAULT false,
  sync_frequency TEXT,
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  connection_status TEXT DEFAULT 'unknown',
  last_error TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SINCRONIZACIONES
-- =====================================================
CREATE TABLE sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  connector_id UUID NOT NULL REFERENCES data_connectors(id) ON DELETE CASCADE,
  
  -- Tipo
  sync_type TEXT NOT NULL,
  
  -- Filtros
  filters JSONB DEFAULT '{}',
  
  -- Estado
  status TEXT DEFAULT 'pending',
  
  -- Progreso
  total_items INT DEFAULT 0,
  processed_items INT DEFAULT 0,
  new_items INT DEFAULT 0,
  updated_items INT DEFAULT 0,
  errors INT DEFAULT 0,
  
  -- Resultado
  result JSONB DEFAULT '{}',
  error_message TEXT,
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PLANTILLAS DE MAPEO
-- =====================================================
CREATE TABLE import_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identificación
  name TEXT NOT NULL,
  description TEXT,
  import_type TEXT NOT NULL,
  source_type TEXT NOT NULL,
  
  -- Mapeo
  mapping JSONB NOT NULL,
  options JSONB DEFAULT '{}',
  
  -- Sistema o personalizada
  is_system BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DATOS INICIALES - PLANTILLAS DE SISTEMA
-- =====================================================
INSERT INTO import_templates (name, description, import_type, source_type, mapping, options, is_system) VALUES
-- Plantilla Excel expedientes
(
  'Excel Expedientes Estándar',
  'Importar expedientes desde Excel con formato estándar',
  'matters',
  'excel',
  '{"reference": "A", "title": "B", "ip_type": {"column": "C", "transform": "ip_type_map"}, "status": {"column": "D", "transform": "status_map"}, "client_name": {"column": "E", "create_contact": true}, "filing_date": {"column": "F", "format": "DD/MM/YYYY"}, "registration_number": "G", "registration_date": {"column": "H", "format": "DD/MM/YYYY"}, "expiry_date": {"column": "I", "format": "DD/MM/YYYY"}, "classes": {"column": "J", "separator": ","}, "notes": "K"}',
  '{"skip_header": true, "date_format": "DD/MM/YYYY"}',
  true
),
-- Plantilla CSV contactos
(
  'CSV Contactos',
  'Importar contactos desde CSV',
  'contacts',
  'csv',
  '{"name": "0", "email": "1", "phone": "2", "company_name": {"column": "3", "create_company": true}, "position": "4", "address": "5", "city": "6", "country": "7"}',
  '{"skip_header": true, "delimiter": ","}',
  true
),
-- Plantilla plazos
(
  'Excel Plazos',
  'Importar plazos desde Excel',
  'deadlines',
  'excel',
  '{"matter_reference": {"column": "A", "match_matter": true}, "title": "B", "due_date": {"column": "C", "format": "DD/MM/YYYY"}, "deadline_type": "D", "priority": "E", "notes": "F"}',
  '{"skip_header": true}',
  true
),
-- Plantilla costes
(
  'Excel Costes',
  'Importar costes desde Excel',
  'costs',
  'excel',
  '{"matter_reference": {"column": "A", "match_matter": true}, "description": "B", "amount": {"column": "C", "type": "number"}, "cost_type": "D", "date": {"column": "E", "format": "DD/MM/YYYY"}, "currency": {"column": "F", "default": "EUR"}}',
  '{"skip_header": true}',
  true
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_imports_org ON imports(organization_id);
CREATE INDEX idx_imports_status ON imports(status);
CREATE INDEX idx_imports_type ON imports(import_type);

CREATE INDEX idx_data_connectors_org ON data_connectors(organization_id);
CREATE INDEX idx_data_connectors_type ON data_connectors(connector_type);

CREATE INDEX idx_sync_jobs_org ON sync_jobs(organization_id);
CREATE INDEX idx_sync_jobs_connector ON sync_jobs(connector_id);
CREATE INDEX idx_sync_jobs_status ON sync_jobs(status);

CREATE INDEX idx_import_templates_org ON import_templates(organization_id);
CREATE INDEX idx_import_templates_type ON import_templates(import_type);

-- =====================================================
-- RLS
-- =====================================================
ALTER TABLE imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org imports" ON imports FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Org data_connectors" ON data_connectors FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Org sync_jobs" ON sync_jobs FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Org or system import_templates" ON import_templates FOR SELECT USING (
  is_system = true OR
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Org import_templates insert" ON import_templates FOR INSERT WITH CHECK (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Org import_templates update" ON import_templates FOR UPDATE USING (
  is_system = false AND
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "Org import_templates delete" ON import_templates FOR DELETE USING (
  is_system = false AND
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

-- =====================================================
-- TRIGGER para updated_at en data_connectors
-- =====================================================
CREATE TRIGGER update_data_connectors_updated_at
  BEFORE UPDATE ON data_connectors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_import_templates_updated_at
  BEFORE UPDATE ON import_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();