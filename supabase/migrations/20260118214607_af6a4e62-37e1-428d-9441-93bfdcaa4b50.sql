-- =====================================================
-- NEXUS MIGRATOR 2.0 - TABLAS AVANZADAS
-- =====================================================

-- =====================================================
-- AGENTES DE MIGRACIÓN (Desktop Agents) - CREAR PRIMERO
-- =====================================================
CREATE TABLE migration_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identificación
  name TEXT NOT NULL,
  agent_key TEXT UNIQUE NOT NULL,
  agent_secret_hash TEXT NOT NULL,
  
  -- Información del agente
  hostname TEXT,
  os_type TEXT CHECK (os_type IN ('windows', 'macos', 'linux')),
  os_version TEXT,
  agent_version TEXT,
  
  -- Estado
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'online', 'offline', 'busy', 'error', 'disabled'
  )),
  last_heartbeat TIMESTAMPTZ,
  last_error TEXT,
  
  -- Capacidades
  capabilities JSONB DEFAULT '[]',
  
  -- Conexiones activas a través del agente
  active_connections INT DEFAULT 0,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ
);

-- =====================================================
-- CONEXIONES A SISTEMAS EXTERNOS
-- =====================================================
CREATE TABLE migration_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Sistema destino
  system_type TEXT NOT NULL CHECK (system_type IN (
    'patsnap', 'anaqua', 'cpa_global', 'dennemeyer', 'ipan',
    'thomson_compumark', 'corsearch', 'orbit', 'darts_ip', 
    'clarivate', 'ipfolio', 'filemaker', 'custom_api', 'custom_db'
  )),
  
  -- Nombre descriptivo
  name TEXT NOT NULL,
  description TEXT,
  
  -- Tipo de autenticación
  auth_type TEXT NOT NULL CHECK (auth_type IN (
    'oauth2', 'api_key', 'api_key_secret', 'basic_auth', 
    'bearer_token', 'session_cookie', 'database', 'agent'
  )),
  
  -- Credenciales encriptadas
  credentials_vault_id UUID,
  
  -- Configuración de conexión
  connection_config JSONB DEFAULT '{}',
  
  -- Estado de conexión
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'testing', 'connected', 'error', 'expired', 'revoked'
  )),
  last_test_at TIMESTAMPTZ,
  last_test_result JSONB,
  last_successful_connection TIMESTAMPTZ,
  
  -- Metadatos del sistema origen
  system_metadata JSONB DEFAULT '{}',
  
  -- Agente asociado
  agent_id UUID REFERENCES migration_agents(id),
  
  -- Auditoría
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SESIONES DE SCRAPING WEB
-- =====================================================
CREATE TABLE migration_scraping_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES migration_connections(id) ON DELETE CASCADE,
  project_id UUID REFERENCES migration_projects(id),
  
  -- Estado de sesión
  status TEXT DEFAULT 'initializing' CHECK (status IN (
    'initializing', 'authenticating', 'authenticated', 
    'scraping', 'paused', 'completed', 'error', 'rate_limited'
  )),
  
  -- Cookies y tokens de sesión
  session_data_vault_id UUID,
  
  -- Progreso
  current_page TEXT,
  current_entity TEXT,
  items_scraped INT DEFAULT 0,
  items_total INT,
  
  -- Rate limiting
  requests_made INT DEFAULT 0,
  last_request_at TIMESTAMPTZ,
  rate_limit_until TIMESTAMPTZ,
  
  -- Errores
  errors JSONB DEFAULT '[]',
  retry_count INT DEFAULT 0,
  
  -- Tiempos
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Datos extraídos temporales
  extracted_data JSONB DEFAULT '{}'
);

-- =====================================================
-- SINCRONIZACIONES INCREMENTALES
-- =====================================================
CREATE TABLE migration_syncs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES migration_connections(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Configuración
  name TEXT NOT NULL,
  sync_type TEXT NOT NULL CHECK (sync_type IN (
    'manual', 'scheduled', 'realtime'
  )),
  
  -- Entidades a sincronizar
  entities_config JSONB NOT NULL,
  
  -- Programación
  schedule_cron TEXT,
  schedule_timezone TEXT DEFAULT 'UTC',
  
  -- Estado
  status TEXT DEFAULT 'active' CHECK (status IN (
    'active', 'paused', 'error', 'disabled'
  )),
  
  -- Última sincronización
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT,
  last_sync_stats JSONB,
  
  -- Siguiente sincronización
  next_sync_at TIMESTAMPTZ,
  
  -- Marcadores de sincronización
  sync_cursors JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- HISTORIAL DE SINCRONIZACIONES
-- =====================================================
CREATE TABLE migration_sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_id UUID NOT NULL REFERENCES migration_syncs(id) ON DELETE CASCADE,
  
  -- Ejecución
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Resultado
  status TEXT NOT NULL CHECK (status IN (
    'running', 'completed', 'partial', 'failed', 'cancelled'
  )),
  
  -- Estadísticas
  stats JSONB DEFAULT '{}',
  
  -- Cambios detectados
  changes JSONB DEFAULT '[]',
  
  -- Errores
  errors JSONB DEFAULT '[]',
  
  -- Trigger
  triggered_by TEXT CHECK (triggered_by IN (
    'schedule', 'manual', 'webhook', 'system'
  ))
);

-- =====================================================
-- MAPEOS DE CAMPOS APRENDIDOS (AI)
-- =====================================================
CREATE TABLE migration_learned_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Sistema origen
  source_system TEXT NOT NULL,
  source_field TEXT NOT NULL,
  source_field_type TEXT,
  source_sample_values JSONB DEFAULT '[]',
  
  -- Campo destino en IP-NEXUS
  target_entity TEXT NOT NULL,
  target_field TEXT NOT NULL,
  
  -- Confianza y uso
  confidence_score DECIMAL(3,2) DEFAULT 0.00,
  times_used INT DEFAULT 0,
  times_confirmed INT DEFAULT 0,
  times_rejected INT DEFAULT 0,
  
  -- Transformación recomendada
  recommended_transform JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(source_system, source_field, target_entity, target_field)
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_migration_connections_org ON migration_connections(organization_id);
CREATE INDEX idx_migration_connections_status ON migration_connections(status);
CREATE INDEX idx_migration_agents_org ON migration_agents(organization_id);
CREATE INDEX idx_migration_agents_status ON migration_agents(status);
CREATE INDEX idx_migration_syncs_connection ON migration_syncs(connection_id);
CREATE INDEX idx_migration_syncs_next ON migration_syncs(next_sync_at) WHERE status = 'active';
CREATE INDEX idx_migration_learned_mappings_source ON migration_learned_mappings(source_system, source_field);
CREATE INDEX idx_migration_scraping_sessions_connection ON migration_scraping_sessions(connection_id);
CREATE INDEX idx_migration_sync_history_sync ON migration_sync_history(sync_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================
ALTER TABLE migration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_scraping_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_syncs ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_sync_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_learned_mappings ENABLE ROW LEVEL SECURITY;

-- Policies para conexiones
CREATE POLICY "Users can view own org connections"
  ON migration_connections FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage connections"
  ON migration_connections FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Policies para agentes
CREATE POLICY "Users can view own org agents"
  ON migration_agents FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage agents"
  ON migration_agents FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Policies para scraping sessions
CREATE POLICY "Users can view scraping sessions"
  ON migration_scraping_sessions FOR SELECT
  USING (connection_id IN (
    SELECT id FROM migration_connections WHERE organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Admins can manage scraping sessions"
  ON migration_scraping_sessions FOR ALL
  USING (connection_id IN (
    SELECT id FROM migration_connections WHERE organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  ));

-- Policies para syncs
CREATE POLICY "Users can view own org syncs"
  ON migration_syncs FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage syncs"
  ON migration_syncs FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Policies para sync history
CREATE POLICY "Users can view sync history"
  ON migration_sync_history FOR SELECT
  USING (sync_id IN (
    SELECT id FROM migration_syncs WHERE organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  ));

-- Policies para learned mappings (global, todos pueden leer)
CREATE POLICY "Anyone can read learned mappings"
  ON migration_learned_mappings FOR SELECT
  USING (true);

CREATE POLICY "System can manage learned mappings"
  ON migration_learned_mappings FOR ALL
  USING (true);