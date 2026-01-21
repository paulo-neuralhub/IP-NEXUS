-- =====================================================
-- P72: ANALYTICS DATABASE - Sistema de métricas de producto
-- =====================================================
-- NOTA: Este sistema es para analytics de USO de la app,
-- NO es notifications ni alerts. Es tracking de comportamiento.
-- =====================================================

-- =====================================================
-- 1. TABLA: analytics_events (eventos de usuario)
-- =====================================================

-- Verificar si ya existe y solo crear si no existe
DO $$
BEGIN
  -- Añadir columnas faltantes a analytics_events si existe
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'analytics_events') THEN
    -- Verificar si falta session_id
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'analytics_events' AND column_name = 'session_id') THEN
      ALTER TABLE analytics_events ADD COLUMN session_id TEXT NOT NULL DEFAULT gen_random_uuid()::text;
    END IF;
    
    -- Verificar si falta event_date
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'analytics_events' AND column_name = 'event_date') THEN
      ALTER TABLE analytics_events ADD COLUMN event_date DATE GENERATED ALWAYS AS (DATE(created_at)) STORED;
    END IF;
  END IF;
END $$;

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_analytics_events_org_date ON analytics_events(organization_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON analytics_events(event_category, event_date);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page ON analytics_events(page_path, event_date);

-- =====================================================
-- 2. TABLA: analytics_daily_metrics (ya existe, verificar)
-- =====================================================

-- Añadir columnas faltantes si existen
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'analytics_daily_metrics') THEN
    -- Añadir columnas de usuarios si faltan
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'analytics_daily_metrics' AND column_name = 'new_users') THEN
      ALTER TABLE analytics_daily_metrics ADD COLUMN new_users INT DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'analytics_daily_metrics' AND column_name = 'returning_users') THEN
      ALTER TABLE analytics_daily_metrics ADD COLUMN returning_users INT DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'analytics_daily_metrics' AND column_name = 'top_features') THEN
      ALTER TABLE analytics_daily_metrics ADD COLUMN top_features JSONB DEFAULT '[]';
    END IF;
  END IF;
END $$;

-- Crear índices para daily_metrics
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON analytics_daily_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_org ON analytics_daily_metrics(organization_id, metric_date DESC);

-- =====================================================
-- 3. TABLA: analytics_feature_usage (ya existe, verificar constraint)
-- =====================================================

-- Eliminar constraint restrictivo si existe y recrear más flexible
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'analytics_feature_usage') THEN
    -- Eliminar constraint de feature_key si es muy restrictivo
    ALTER TABLE analytics_feature_usage DROP CONSTRAINT IF EXISTS analytics_feature_usage_feature_key_check;
    
    -- No añadimos CHECK constraint para permitir cualquier feature_key
    -- La validación se hará en código
  END IF;
END $$;

-- Crear índices para feature_usage
CREATE INDEX IF NOT EXISTS idx_feature_usage_org ON analytics_feature_usage(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature ON analytics_feature_usage(feature_key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user ON analytics_feature_usage(user_id, created_at DESC);

-- =====================================================
-- 4. FUNCIÓN: Calcular métricas diarias
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_daily_analytics(p_date DATE DEFAULT CURRENT_DATE - 1)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org RECORD;
  v_dau INT;
  v_wau INT;
  v_mau INT;
  v_sessions INT;
  v_avg_duration INT;
  v_ai_queries INT;
  v_top_pages JSONB;
  v_top_features JSONB;
  v_new_users INT;
  v_returning_users INT;
  v_matters_created INT;
  v_documents_generated INT;
  v_searches_performed INT;
BEGIN
  -- Para cada organización activa
  FOR org IN (SELECT id FROM organizations WHERE status = 'active')
  LOOP
    -- DAU (usuarios activos hoy)
    SELECT COUNT(DISTINCT user_id) INTO v_dau
    FROM analytics_events
    WHERE organization_id = org.id
    AND event_date = p_date
    AND user_id IS NOT NULL;
    
    -- WAU (últimos 7 días)
    SELECT COUNT(DISTINCT user_id) INTO v_wau
    FROM analytics_events
    WHERE organization_id = org.id
    AND event_date BETWEEN p_date - 6 AND p_date
    AND user_id IS NOT NULL;
    
    -- MAU (últimos 30 días)
    SELECT COUNT(DISTINCT user_id) INTO v_mau
    FROM analytics_events
    WHERE organization_id = org.id
    AND event_date BETWEEN p_date - 29 AND p_date
    AND user_id IS NOT NULL;
    
    -- Sesiones únicas
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
    
    -- Búsquedas
    SELECT COUNT(*) INTO v_searches_performed
    FROM analytics_events
    WHERE organization_id = org.id
    AND event_date = p_date
    AND event_category = 'search';
    
    -- Top páginas (top 10)
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
    
    -- Top features (top 10)
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
    
    -- Nuevos usuarios (primera vez en la org)
    SELECT COUNT(*) INTO v_new_users
    FROM (
      SELECT DISTINCT user_id
      FROM analytics_events
      WHERE organization_id = org.id
      AND event_date = p_date
      AND user_id IS NOT NULL
      AND user_id NOT IN (
        SELECT DISTINCT user_id
        FROM analytics_events
        WHERE organization_id = org.id
        AND event_date < p_date
        AND user_id IS NOT NULL
      )
    ) t;
    
    -- Usuarios que regresan
    v_returning_users := COALESCE(v_dau, 0) - COALESCE(v_new_users, 0);
    IF v_returning_users < 0 THEN v_returning_users := 0; END IF;
    
    -- Matters creados
    SELECT COUNT(*) INTO v_matters_created
    FROM matters
    WHERE organization_id = org.id
    AND DATE(created_at) = p_date;
    
    -- Documentos generados
    SELECT COUNT(*) INTO v_documents_generated
    FROM ai_generated_documents
    WHERE organization_id = org.id
    AND DATE(created_at) = p_date;
    
    -- Insertar o actualizar métricas
    INSERT INTO analytics_daily_metrics (
      metric_date, 
      organization_id,
      daily_active_users, 
      weekly_active_users, 
      monthly_active_users,
      new_users,
      returning_users,
      total_sessions, 
      ai_queries, 
      searches_performed,
      matters_created,
      documents_generated,
      top_pages,
      top_features
    ) VALUES (
      p_date, 
      org.id,
      COALESCE(v_dau, 0), 
      COALESCE(v_wau, 0), 
      COALESCE(v_mau, 0),
      COALESCE(v_new_users, 0),
      v_returning_users,
      COALESCE(v_sessions, 0), 
      COALESCE(v_ai_queries, 0), 
      COALESCE(v_searches_performed, 0),
      COALESCE(v_matters_created, 0),
      COALESCE(v_documents_generated, 0),
      v_top_pages,
      v_top_features
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
      matters_created = EXCLUDED.matters_created,
      documents_generated = EXCLUDED.documents_generated,
      top_pages = EXCLUDED.top_pages,
      top_features = EXCLUDED.top_features,
      updated_at = NOW();
      
  END LOOP;
END;
$$;

-- =====================================================
-- 5. RLS POLICIES
-- =====================================================

-- Habilitar RLS si no está habilitado
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_feature_usage ENABLE ROW LEVEL SECURITY;

-- Políticas para analytics_events
DROP POLICY IF EXISTS "Admins can view analytics events" ON analytics_events;
CREATE POLICY "Admins can view analytics events"
  ON analytics_events
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'owner')
    )
  );

DROP POLICY IF EXISTS "System can insert analytics events" ON analytics_events;
CREATE POLICY "System can insert analytics events"
  ON analytics_events
  FOR INSERT
  WITH CHECK (true);

-- Políticas para analytics_daily_metrics
DROP POLICY IF EXISTS "Admins can view daily metrics" ON analytics_daily_metrics;
CREATE POLICY "Admins can view daily metrics"
  ON analytics_daily_metrics
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'owner')
    )
  );

-- Políticas para analytics_feature_usage
DROP POLICY IF EXISTS "Admins can view feature usage" ON analytics_feature_usage;
CREATE POLICY "Admins can view feature usage"
  ON analytics_feature_usage
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'owner')
    )
  );

DROP POLICY IF EXISTS "System can insert feature usage" ON analytics_feature_usage;
CREATE POLICY "System can insert feature usage"
  ON analytics_feature_usage
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 6. CRON JOB (programar cálculo nocturno)
-- =====================================================
-- Nota: pg_cron debe estar habilitado en Supabase

-- Eliminar job existente si existe
SELECT cron.unschedule('calculate-analytics-daily') 
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'calculate-analytics-daily'
);

-- Programar nuevo job a las 4:00 AM UTC
SELECT cron.schedule(
  'calculate-analytics-daily',
  '0 4 * * *',
  $$SELECT calculate_daily_analytics()$$
);