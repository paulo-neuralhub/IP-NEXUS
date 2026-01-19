-- ============================================
-- IP-ANALYTICS: Sistema Completo de Reportes
-- ============================================

-- ============================================
-- 1. DEFINICIONES DE REPORTES (primero)
-- ============================================

CREATE TABLE IF NOT EXISTS report_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  
  report_type VARCHAR(30) NOT NULL DEFAULT 'standard',
  
  config JSONB NOT NULL DEFAULT '{}',
  
  default_view VARCHAR(30) DEFAULT 'table',
  available_formats TEXT[] DEFAULT ARRAY['pdf', 'xlsx', 'csv'],
  
  visibility VARCHAR(30) DEFAULT 'private',
  
  is_scheduled BOOLEAN DEFAULT false,
  schedule_config JSONB,
  
  run_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  
  icon VARCHAR(50),
  color VARCHAR(20),
  tags TEXT[] DEFAULT '{}',
  
  is_active BOOLEAN DEFAULT true,
  is_favorite BOOLEAN DEFAULT false,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_def_org ON report_definitions(organization_id, category);
CREATE INDEX IF NOT EXISTS idx_report_def_slug ON report_definitions(slug);

-- RLS para report_definitions
ALTER TABLE report_definitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view system reports" ON report_definitions;
CREATE POLICY "Users can view system reports" ON report_definitions
  FOR SELECT USING (organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can manage org reports" ON report_definitions;
CREATE POLICY "Users can manage org reports" ON report_definitions
  FOR ALL USING (organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

-- ============================================
-- 2. EJECUCIONES DE REPORTES
-- ============================================

CREATE TABLE IF NOT EXISTS report_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES report_definitions(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  parameters JSONB DEFAULT '{}',
  
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  
  result_summary JSONB,
  output_files JSONB DEFAULT '[]',
  
  error_message TEXT,
  
  triggered_by VARCHAR(30),
  executed_by UUID REFERENCES auth.users(id),
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exec_report ON report_executions(report_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exec_org ON report_executions(organization_id, created_at DESC);

-- RLS
ALTER TABLE report_executions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view org executions" ON report_executions;
CREATE POLICY "Users can view org executions" ON report_executions
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can create executions" ON report_executions;
CREATE POLICY "Users can create executions" ON report_executions
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update own executions" ON report_executions;
CREATE POLICY "Users can update own executions" ON report_executions
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

-- ============================================
-- 3. MÉTRICAS CACHE
-- ============================================

DROP TABLE IF EXISTS metrics_cache CASCADE;

CREATE TABLE metrics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  metric_key VARCHAR(100) NOT NULL,
  dimensions JSONB DEFAULT '{}',
  
  value_numeric DECIMAL(15,2),
  value_json JSONB,
  
  period_type VARCHAR(20),
  period_start DATE,
  period_end DATE,
  
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_stale BOOLEAN DEFAULT false
);

CREATE INDEX idx_metrics_lookup ON metrics_cache(organization_id, metric_key, computed_at DESC);

ALTER TABLE metrics_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org metrics cache" ON metrics_cache
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage org metrics cache" ON metrics_cache
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

-- ============================================
-- 4. EXPORTACIONES PROGRAMADAS
-- ============================================

DROP TABLE IF EXISTS scheduled_exports CASCADE;

CREATE TABLE scheduled_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  report_id UUID NOT NULL REFERENCES report_definitions(id) ON DELETE CASCADE,
  
  schedule_type VARCHAR(30) NOT NULL,
  schedule_config JSONB NOT NULL,
  export_format VARCHAR(20) NOT NULL DEFAULT 'pdf',
  recipients JSONB NOT NULL DEFAULT '[]',
  fixed_parameters JSONB DEFAULT '{}',
  
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sched_exp_org ON scheduled_exports(organization_id);

ALTER TABLE scheduled_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage scheduled exports" ON scheduled_exports
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

-- ============================================
-- 5. FUNCIONES RPC
-- ============================================

CREATE OR REPLACE FUNCTION get_assets_grouped(
  p_organization_id UUID,
  p_group_by TEXT
)
RETURNS TABLE (label TEXT, value BIGINT) AS $$
BEGIN
  IF p_group_by = 'ip_type' THEN
    RETURN QUERY
    SELECT m.ip_type::TEXT, COUNT(*)::BIGINT
    FROM matters m WHERE m.organization_id = p_organization_id
    GROUP BY m.ip_type ORDER BY 2 DESC;
  ELSIF p_group_by = 'status' THEN
    RETURN QUERY
    SELECT m.status::TEXT, COUNT(*)::BIGINT
    FROM matters m WHERE m.organization_id = p_organization_id
    GROUP BY m.status ORDER BY 2 DESC;
  ELSIF p_group_by = 'office_code' THEN
    RETURN QUERY
    SELECT COALESCE(m.office_code, 'Sin oficina')::TEXT, COUNT(*)::BIGINT
    FROM matters m WHERE m.organization_id = p_organization_id
    GROUP BY m.office_code ORDER BY 2 DESC LIMIT 10;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_analytics_stats(
  p_organization_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_matters', (SELECT COUNT(*) FROM matters WHERE organization_id = p_organization_id),
    'total_trademarks', (SELECT COUNT(*) FROM matters WHERE organization_id = p_organization_id AND ip_type = 'trademark'),
    'total_patents', (SELECT COUNT(*) FROM matters WHERE organization_id = p_organization_id AND ip_type = 'patent'),
    'total_designs', (SELECT COUNT(*) FROM matters WHERE organization_id = p_organization_id AND ip_type = 'design'),
    'registered', (SELECT COUNT(*) FROM matters WHERE organization_id = p_organization_id AND status = 'registered'),
    'pending', (SELECT COUNT(*) FROM matters WHERE organization_id = p_organization_id AND status = 'pending'),
    'expiring_30d', (SELECT COUNT(*) FROM matters WHERE organization_id = p_organization_id AND expiry_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'),
    'expiring_90d', (SELECT COUNT(*) FROM matters WHERE organization_id = p_organization_id AND expiry_date BETWEEN NOW() AND NOW() + INTERVAL '90 days'),
    'total_filings', (SELECT COUNT(*) FROM filing_applications WHERE organization_id = p_organization_id),
    'reports_generated', (SELECT COUNT(*) FROM report_executions WHERE organization_id = p_organization_id AND status = 'completed' AND created_at > NOW() - (p_days || ' days')::INTERVAL)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_report_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_report_definitions_updated ON report_definitions;
CREATE TRIGGER tr_report_definitions_updated
  BEFORE UPDATE ON report_definitions
  FOR EACH ROW EXECUTE FUNCTION update_report_updated_at();