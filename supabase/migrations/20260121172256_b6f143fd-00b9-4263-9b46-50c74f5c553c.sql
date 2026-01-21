-- =====================================================
-- P72: ANALYTICS DATABASE
-- Sistema de tracking de comportamiento de usuario
-- =====================================================

-- =====================================================
-- TABLA: analytics_events (eventos de usuario)
-- =====================================================
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  
  -- Evento
  event_name TEXT NOT NULL,
  event_category TEXT NOT NULL CHECK (event_category IN (
    'page_view',
    'feature_use',
    'search',
    'ai_interaction',
    'market_action',
    'document_action',
    'error',
    'conversion',
    'engagement'
  )),
  
  -- Contexto
  page_path TEXT,
  page_title TEXT,
  referrer TEXT,
  properties JSONB DEFAULT '{}',
  
  -- Dispositivo
  device_type TEXT CHECK (device_type IN ('desktop', 'tablet', 'mobile')),
  browser TEXT,
  os TEXT,
  screen_resolution TEXT,
  
  -- Ubicación
  country_code TEXT,
  region TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  event_date DATE DEFAULT CURRENT_DATE
);

-- Trigger para mantener event_date sincronizado
CREATE OR REPLACE FUNCTION set_analytics_event_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.event_date := DATE(NEW.created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_analytics_event_date
  BEFORE INSERT OR UPDATE ON analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION set_analytics_event_date();

-- Índices para analytics_events
CREATE INDEX idx_analytics_events_org_date ON analytics_events(organization_id, event_date DESC);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id, created_at DESC);
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name, created_at DESC);
CREATE INDEX idx_analytics_events_category ON analytics_events(event_category, event_date);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_page ON analytics_events(page_path, event_date);

-- =====================================================
-- TABLA: analytics_daily_metrics (métricas agregadas)
-- =====================================================
CREATE TABLE analytics_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  metric_date DATE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Métricas de usuarios
  daily_active_users INT DEFAULT 0,
  weekly_active_users INT DEFAULT 0,
  monthly_active_users INT DEFAULT 0,
  new_users INT DEFAULT 0,
  returning_users INT DEFAULT 0,
  
  -- Métricas de sesión
  total_sessions INT DEFAULT 0,
  avg_session_duration_seconds INT DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  pages_per_session DECIMAL(5,2) DEFAULT 0,
  
  -- Métricas de features
  ai_queries INT DEFAULT 0,
  searches_performed INT DEFAULT 0,
  documents_generated INT DEFAULT 0,
  matters_created INT DEFAULT 0,
  quote_requests_created INT DEFAULT 0,
  quotes_sent INT DEFAULT 0,
  
  -- Métricas de errores
  client_errors INT DEFAULT 0,
  server_errors INT DEFAULT 0,
  
  -- Performance
  avg_page_load_ms INT DEFAULT 0,
  p95_page_load_ms INT DEFAULT 0,
  
  -- Top data (JSON)
  top_pages JSONB DEFAULT '[]',
  top_features JSONB DEFAULT '[]',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(metric_date, organization_id)
);

CREATE INDEX idx_analytics_daily_metrics_date ON analytics_daily_metrics(metric_date DESC);
CREATE INDEX idx_analytics_daily_metrics_org ON analytics_daily_metrics(organization_id, metric_date DESC);

-- =====================================================
-- TABLA: analytics_feature_usage
-- =====================================================
CREATE TABLE analytics_feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  feature_key TEXT NOT NULL CHECK (feature_key IN (
    'dashboard', 'matters_list', 'matter_detail',
    'search_basic', 'search_advanced', 'search_ai',
    'document_viewer', 'document_generator', 'document_upload',
    'ai_genius_chat', 'ai_genius_analyze', 'ai_genius_draft',
    'ai_spider_search', 'ai_spider_monitor',
    'market_browse', 'market_request_quote', 'market_send_quote',
    'settings', 'team_management', 'billing',
    'calendar', 'reports', 'export'
  )),
  
  context JSONB DEFAULT '{}',
  duration_seconds INT,
  success BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_feature_usage_org ON analytics_feature_usage(organization_id, created_at DESC);
CREATE INDEX idx_analytics_feature_usage_feature ON analytics_feature_usage(feature_key, created_at DESC);
CREATE INDEX idx_analytics_feature_usage_user ON analytics_feature_usage(user_id, created_at DESC);

-- =====================================================
-- FUNCIÓN: Calcular métricas diarias
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_daily_analytics(p_date DATE DEFAULT CURRENT_DATE - 1)
RETURNS void AS $$
DECLARE
  org RECORD;
  v_dau INT;
  v_wau INT;
  v_mau INT;
  v_new_users INT;
  v_sessions INT;
  v_ai_queries INT;
  v_searches INT;
  v_docs_generated INT;
  v_matters_created INT;
  v_client_errors INT;
  v_top_pages JSONB;
  v_top_features JSONB;
BEGIN
  FOR org IN (SELECT id FROM organizations WHERE status = 'active')
  LOOP
    -- DAU
    SELECT COUNT(DISTINCT user_id) INTO v_dau
    FROM analytics_events
    WHERE organization_id = org.id
    AND event_date = p_date
    AND user_id IS NOT NULL;
    
    -- WAU
    SELECT COUNT(DISTINCT user_id) INTO v_wau
    FROM analytics_events
    WHERE organization_id = org.id
    AND event_date BETWEEN p_date - 6 AND p_date
    AND user_id IS NOT NULL;
    
    -- MAU
    SELECT COUNT(DISTINCT user_id) INTO v_mau
    FROM analytics_events
    WHERE organization_id = org.id
    AND event_date BETWEEN p_date - 29 AND p_date
    AND user_id IS NOT NULL;
    
    -- New users (first event ever)
    SELECT COUNT(DISTINCT ae.user_id) INTO v_new_users
    FROM analytics_events ae
    WHERE ae.organization_id = org.id
    AND ae.event_date = p_date
    AND ae.user_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM analytics_events ae2
      WHERE ae2.user_id = ae.user_id
      AND ae2.event_date < p_date
    );
    
    -- Sessions
    SELECT COUNT(DISTINCT session_id) INTO v_sessions
    FROM analytics_events
    WHERE organization_id = org.id
    AND event_date = p_date;
    
    -- AI queries
    SELECT COUNT(*) INTO v_ai_queries
    FROM analytics_events
    WHERE organization_id = org.id
    AND event_date = p_date
    AND event_category = 'ai_interaction';
    
    -- Searches
    SELECT COUNT(*) INTO v_searches
    FROM analytics_events
    WHERE organization_id = org.id
    AND event_date = p_date
    AND event_category = 'search';
    
    -- Documents generated
    SELECT COUNT(*) INTO v_docs_generated
    FROM analytics_events
    WHERE organization_id = org.id
    AND event_date = p_date
    AND event_category = 'document_action'
    AND event_name = 'document_generated';
    
    -- Matters created
    SELECT COUNT(*) INTO v_matters_created
    FROM analytics_events
    WHERE organization_id = org.id
    AND event_date = p_date
    AND event_name = 'matter_created';
    
    -- Client errors
    SELECT COUNT(*) INTO v_client_errors
    FROM analytics_events
    WHERE organization_id = org.id
    AND event_date = p_date
    AND event_category = 'error';
    
    -- Top pages
    SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) INTO v_top_pages
    FROM (
      SELECT page_path as path, COUNT(*) as views
      FROM analytics_events
      WHERE organization_id = org.id
      AND event_date = p_date
      AND event_category = 'page_view'
      AND page_path IS NOT NULL
      GROUP BY page_path
      ORDER BY COUNT(*) DESC
      LIMIT 10
    ) t;
    
    -- Top features
    SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) INTO v_top_features
    FROM (
      SELECT feature_key as feature, COUNT(*) as uses
      FROM analytics_feature_usage
      WHERE organization_id = org.id
      AND DATE(created_at) = p_date
      GROUP BY feature_key
      ORDER BY COUNT(*) DESC
      LIMIT 10
    ) t;
    
    -- Upsert metrics
    INSERT INTO analytics_daily_metrics (
      metric_date, organization_id,
      daily_active_users, weekly_active_users, monthly_active_users,
      new_users, returning_users,
      total_sessions, ai_queries, searches_performed,
      documents_generated, matters_created, client_errors,
      top_pages, top_features
    ) VALUES (
      p_date, org.id,
      v_dau, v_wau, v_mau,
      v_new_users, GREATEST(v_dau - v_new_users, 0),
      v_sessions, v_ai_queries, v_searches,
      v_docs_generated, v_matters_created, v_client_errors,
      v_top_pages, v_top_features
    )
    ON CONFLICT (metric_date, organization_id) DO UPDATE SET
      daily_active_users = EXCLUDED.daily_active_users,
      weekly_active_users = EXCLUDED.weekly_active_users,
      monthly_active_users = EXCLUDED.monthly_active_users,
      new_users = EXCLUDED.new_users,
      returning_users = EXCLUDED.returning_users,
      total_sessions = EXCLUDED.total_sessions,
      ai_queries = EXCLUDED.ai_queries,
      searches_performed = EXCLUDED.searches_performed,
      documents_generated = EXCLUDED.documents_generated,
      matters_created = EXCLUDED.matters_created,
      client_errors = EXCLUDED.client_errors,
      top_pages = EXCLUDED.top_pages,
      top_features = EXCLUDED.top_features,
      updated_at = NOW();
      
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS POLICIES
-- =====================================================
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_feature_usage ENABLE ROW LEVEL SECURITY;

-- Analytics events: admins can view, system can insert
CREATE POLICY "Admins can view analytics events"
  ON analytics_events
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "System can insert analytics events"
  ON analytics_events
  FOR INSERT
  WITH CHECK (true);

-- Daily metrics: admins only
CREATE POLICY "Admins can view daily metrics"
  ON analytics_daily_metrics
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Feature usage: admins can view, system can insert
CREATE POLICY "Admins can view feature usage"
  ON analytics_feature_usage
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "System can insert feature usage"
  ON analytics_feature_usage
  FOR INSERT
  WITH CHECK (true);