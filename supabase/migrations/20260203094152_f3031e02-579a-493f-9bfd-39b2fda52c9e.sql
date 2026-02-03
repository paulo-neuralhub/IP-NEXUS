-- ============================================================
-- EXTERNAL API CONNECTIONS - Configuración de APIs externas
-- ============================================================

CREATE TABLE IF NOT EXISTS external_api_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación
  provider VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  website VARCHAR(255),
  api_base_url VARCHAR(255),
  api_docs_url VARCHAR(255),
  
  -- Autenticación
  auth_type VARCHAR(50) DEFAULT 'none',
  api_key_encrypted TEXT,
  client_id TEXT,
  client_secret_encrypted TEXT,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  username TEXT,
  password_encrypted TEXT,
  
  -- Configuración
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_day INTEGER DEFAULT 1000,
  timeout_seconds INTEGER DEFAULT 30,
  
  -- Endpoints disponibles
  available_endpoints JSONB DEFAULT '[]',
  enabled_endpoints TEXT[] DEFAULT '{}',
  
  -- Estado
  status VARCHAR(20) DEFAULT 'inactive',
  last_test_at TIMESTAMPTZ,
  last_test_result VARCHAR(20),
  last_error TEXT,
  
  -- Métricas
  total_requests INTEGER DEFAULT 0,
  requests_today INTEGER DEFAULT 0,
  requests_this_month INTEGER DEFAULT 0,
  avg_response_ms INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de llamadas a APIs externas
CREATE TABLE IF NOT EXISTS external_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  connection_id UUID REFERENCES external_api_connections(id) ON DELETE SET NULL,
  provider VARCHAR(50) NOT NULL,
  endpoint VARCHAR(255),
  method VARCHAR(10) DEFAULT 'GET',
  
  -- Request
  request_params JSONB,
  request_body JSONB,
  request_headers JSONB,
  
  -- Response
  response_status INTEGER,
  response_body JSONB,
  response_time_ms INTEGER,
  
  -- Estado
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  error_code VARCHAR(50),
  
  -- Context
  triggered_by VARCHAR(50) DEFAULT 'manual',
  triggered_by_user UUID REFERENCES users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_api_logs_provider ON external_api_logs(provider);
CREATE INDEX IF NOT EXISTS idx_api_logs_created ON external_api_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_success ON external_api_logs(success);
CREATE INDEX IF NOT EXISTS idx_api_logs_connection ON external_api_logs(connection_id);
CREATE INDEX IF NOT EXISTS idx_api_connections_provider ON external_api_connections(provider);
CREATE INDEX IF NOT EXISTS idx_api_connections_status ON external_api_connections(status);

-- Cache de datos de mercado (para WIPO Statistics, etc.)
CREATE TABLE IF NOT EXISTS market_data_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  data_type VARCHAR(100) NOT NULL,
  country_code VARCHAR(10),
  year INTEGER,
  nice_class INTEGER,
  
  data JSONB NOT NULL,
  
  source VARCHAR(255),
  source_url TEXT,
  
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(data_type, country_code, year, nice_class)
);

CREATE INDEX IF NOT EXISTS idx_market_cache_type ON market_data_cache(data_type);
CREATE INDEX IF NOT EXISTS idx_market_cache_country ON market_data_cache(country_code);
CREATE INDEX IF NOT EXISTS idx_market_cache_expires ON market_data_cache(expires_at);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_external_api_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_external_api_connections_updated_at ON external_api_connections;
CREATE TRIGGER trigger_external_api_connections_updated_at
  BEFORE UPDATE ON external_api_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_external_api_connections_updated_at();

-- RLS
ALTER TABLE external_api_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data_cache ENABLE ROW LEVEL SECURITY;

-- Políticas para super admins (backoffice)
CREATE POLICY "Super admins can manage API connections"
  ON external_api_connections
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Super admins can view API logs"
  ON external_api_logs
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Super admins can manage market cache"
  ON market_data_cache
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid() AND is_active = true)
  );

-- Insertar conexiones predefinidas
INSERT INTO external_api_connections (
  provider, name, description, website, api_base_url, api_docs_url, auth_type, 
  rate_limit_per_minute, rate_limit_per_day, available_endpoints, status
) VALUES 
(
  'euipo',
  'EUIPO - European Union IP Office',
  'Oficina de Propiedad Intelectual de la Unión Europea. APIs para búsqueda de marcas, clasificación Nice y más.',
  'https://euipo.europa.eu',
  'https://api.euipo.europa.eu/v1',
  'https://dev.euipo.europa.eu',
  'oauth2',
  60, 1000,
  '[
    {"name": "Trademark Search", "method": "GET", "path": "/trademark/search", "description": "Buscar marcas en la base de datos de EUIPO", "params": ["text", "niceClass", "status", "applicant"]},
    {"name": "Goods & Services", "method": "GET", "path": "/gs/terms", "description": "Buscar términos de clasificación Nice (TMclass)", "params": ["text", "lang", "niceClass"]},
    {"name": "Goods & Services Validate", "method": "POST", "path": "/gs/validate", "description": "Validar lista de productos/servicios", "params": ["terms", "language"]},
    {"name": "Person Search", "method": "GET", "path": "/person/search", "description": "Buscar titulares y representantes", "params": ["name", "country", "type"]},
    {"name": "Trademark Details", "method": "GET", "path": "/trademark/{id}", "description": "Obtener detalles de una marca específica", "params": ["id"]},
    {"name": "Similar Marks", "method": "GET", "path": "/trademark/similar", "description": "Buscar marcas similares", "params": ["text", "niceClass"]}
  ]'::jsonb,
  'inactive'
),
(
  'wipo_madrid',
  'WIPO - Madrid System (eMadrid)',
  'Sistema de Madrid para registro internacional de marcas. Monitor de actualizaciones y estadísticas.',
  'https://www.wipo.int/madrid',
  'https://emadrid.wipo.int',
  'https://www.wipo.int/madrid/monitor',
  'bearer',
  30, 500,
  '[
    {"name": "Madrid Monitor Search", "method": "GET", "path": "/monitor/search", "description": "Buscar marcas internacionales", "params": ["brandName", "holderName", "designatedCountry"]},
    {"name": "Madrid Monitor Updates", "method": "GET", "path": "/monitor/updates", "description": "Obtener actualizaciones diarias (XML)", "params": ["date", "type"]},
    {"name": "International Details", "method": "GET", "path": "/intl/{regNumber}", "description": "Detalles de registro internacional", "params": ["regNumber"]}
  ]'::jsonb,
  'inactive'
),
(
  'wipo_statistics',
  'WIPO - IP Statistics Data Center',
  'Centro de datos estadísticos de PI de WIPO. Datos oficiales de solicitudes y registros por país.',
  'https://www3.wipo.int/ipstats',
  'https://www3.wipo.int/ipstats/data',
  'https://www.wipo.int/ipstats',
  'none',
  10, 100,
  '[
    {"name": "Trademark Applications", "method": "GET", "path": "/trademark_applications", "description": "Solicitudes de marcas por país y año", "params": ["year", "country", "type"]},
    {"name": "Trademark Registrations", "method": "GET", "path": "/trademark_registrations", "description": "Registros de marcas por país y año", "params": ["year", "country"]},
    {"name": "Madrid Designations", "method": "GET", "path": "/madrid_designations", "description": "Designaciones Madrid por país", "params": ["year", "country"]},
    {"name": "Nice Class Statistics", "method": "GET", "path": "/nice_class_stats", "description": "Estadísticas por clase Nice", "params": ["year", "class"]}
  ]'::jsonb,
  'active'
),
(
  'wipo_branddb',
  'WIPO - Global Brand Database',
  'Base de datos global de marcas. Más de 50 millones de marcas de 70+ oficinas. Sin API directa.',
  'https://branddb.wipo.int',
  'https://branddb.wipo.int',
  'https://www.wipo.int/branddb',
  'none',
  0, 0,
  '[
    {"name": "Web Search", "method": "REDIRECT", "path": "/quicksearch/brand", "description": "Búsqueda web manual (sin API directa)", "params": ["brandName", "niceClass", "holderName"]}
  ]'::jsonb,
  'active'
),
(
  'oepm',
  'OEPM - Oficina Española de Patentes y Marcas',
  'Oficina nacional de PI de España. Marcas y patentes nacionales.',
  'https://www.oepm.es',
  'https://consultas2.oepm.es/LocalizadorWeb',
  'https://www.oepm.es/es/sobre_oepm/servicios_informaticos',
  'none',
  30, 500,
  '[
    {"name": "Trademark Search", "method": "GET", "path": "/search", "description": "Buscar marcas españolas", "params": ["denomination", "niceClass", "holder"]},
    {"name": "Trademark Details", "method": "GET", "path": "/details/{id}", "description": "Detalles de marca española", "params": ["id"]}
  ]'::jsonb,
  'inactive'
),
(
  'uspto',
  'USPTO - United States Patent & Trademark Office',
  'Oficina de patentes y marcas de Estados Unidos. API pública disponible.',
  'https://www.uspto.gov',
  'https://api.uspto.gov',
  'https://developer.uspto.gov',
  'api_key',
  60, 10000,
  '[
    {"name": "Trademark Search", "method": "GET", "path": "/v1/trademark/search", "description": "Buscar marcas en TESS", "params": ["mark", "serial", "registration"]},
    {"name": "Trademark Status", "method": "GET", "path": "/v1/trademark/{serial}", "description": "Estado de solicitud", "params": ["serial"]},
    {"name": "Design Search", "method": "GET", "path": "/v1/design/search", "description": "Búsqueda por código de diseño", "params": ["designCode"]}
  ]'::jsonb,
  'inactive'
),
(
  'ukipo',
  'UKIPO - UK Intellectual Property Office',
  'Oficina de PI del Reino Unido.',
  'https://www.gov.uk/government/organisations/intellectual-property-office',
  'https://api.ipo.gov.uk',
  'https://developer.ipo.gov.uk',
  'api_key',
  60, 5000,
  '[
    {"name": "Trademark Search", "method": "GET", "path": "/trademark/search", "description": "Buscar marcas UK", "params": ["text", "class", "owner"]},
    {"name": "Trademark Details", "method": "GET", "path": "/trademark/{number}", "description": "Detalles de marca UK", "params": ["number"]}
  ]'::jsonb,
  'inactive'
)
ON CONFLICT (provider) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  available_endpoints = EXCLUDED.available_endpoints,
  updated_at = NOW();