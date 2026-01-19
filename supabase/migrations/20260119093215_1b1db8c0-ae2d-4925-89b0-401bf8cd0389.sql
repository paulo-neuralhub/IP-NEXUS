-- ============================================
-- AUTO-MEND: JOBS TABLE
-- ============================================
CREATE TABLE ipo_automend_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES ipo_offices(id) ON DELETE CASCADE,
  connection_method_id UUID REFERENCES ipo_connection_methods(id),
  
  trigger_type VARCHAR(30) NOT NULL,
  triggered_by UUID REFERENCES auth.users(id),
  
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  
  diagnosis_results JSONB DEFAULT '{}',
  actions_taken JSONB DEFAULT '[]',
  final_status VARCHAR(50),
  error_summary TEXT,
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_automend_office ON ipo_automend_jobs(office_id, created_at DESC);
CREATE INDEX idx_automend_status ON ipo_automend_jobs(status);

-- ============================================
-- SCRAPER VERSIONS (Para auto-regeneración)
-- ============================================
CREATE TABLE ipo_scraper_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scraper_config_id UUID NOT NULL REFERENCES ipo_scraper_configs(id) ON DELETE CASCADE,
  
  version VARCHAR(20) NOT NULL,
  script_content TEXT NOT NULL,
  selectors JSONB NOT NULL,
  
  generated_by VARCHAR(30) NOT NULL,
  generation_prompt TEXT,
  
  test_status VARCHAR(30) DEFAULT 'untested',
  test_results JSONB,
  
  is_active BOOLEAN DEFAULT false,
  activated_at TIMESTAMPTZ,
  deactivated_at TIMESTAMPTZ,
  deactivation_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scraper_versions_config ON ipo_scraper_versions(scraper_config_id);
CREATE INDEX idx_scraper_versions_active ON ipo_scraper_versions(scraper_config_id) WHERE is_active = true;

-- ============================================
-- ERROR PATTERNS TABLE
-- ============================================
CREATE TABLE ipo_error_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  error_code VARCHAR(100),
  error_message_pattern TEXT,
  http_status_codes INTEGER[],
  
  probable_cause VARCHAR(200),
  category VARCHAR(50),
  
  recommended_action VARCHAR(50),
  auto_fixable BOOLEAN DEFAULT false,
  
  office_specific BOOLEAN DEFAULT false,
  office_id UUID REFERENCES ipo_offices(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert common error patterns
INSERT INTO ipo_error_patterns (error_code, error_message_pattern, http_status_codes, probable_cause, category, recommended_action, auto_fixable) VALUES
('AUTH_EXPIRED', 'token.*expir|unauthorized|invalid.*credential', ARRAY[401, 403], 'Credenciales expiradas o inválidas', 'auth', 'rotate_credentials', true),
('RATE_LIMIT', 'rate.*limit|too.*many.*request|429', ARRAY[429], 'Límite de peticiones excedido', 'rate_limit', 'reduce_rate', true),
('SELECTOR_BROKEN', 'element.*not.*found|selector.*invalid|null.*reference', NULL, 'Selectores DOM obsoletos', 'selector', 'regenerate_scraper', true),
('MAINTENANCE', 'maintenance|unavailable|503|scheduled.*downtime', ARRAY[503], 'Oficina en mantenimiento', 'maintenance', 'wait_maintenance', false),
('CAPTCHA', 'captcha|challenge|bot.*detect', ARRAY[403], 'Detección de bot/CAPTCHA', 'selector', 'check_proxy', false),
('TIMEOUT', 'timeout|timed.*out|ETIMEDOUT', NULL, 'Timeout de conexión', 'network', 'retry', true),
('SSL_ERROR', 'ssl|certificate|CERT', NULL, 'Error de certificado SSL', 'network', 'human_review', false),
('DATA_FORMAT', 'parse.*error|invalid.*json|unexpected.*token', NULL, 'Formato de datos cambió', 'data_format', 'regenerate_scraper', true);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE ipo_automend_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipo_scraper_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipo_error_patterns ENABLE ROW LEVEL SECURITY;

-- Automend jobs - admin only
CREATE POLICY "ipo_automend_jobs_select_all" ON ipo_automend_jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "ipo_automend_jobs_insert_all" ON ipo_automend_jobs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "ipo_automend_jobs_update_all" ON ipo_automend_jobs FOR UPDATE TO authenticated USING (true);

-- Scraper versions - admin only
CREATE POLICY "ipo_scraper_versions_select_all" ON ipo_scraper_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "ipo_scraper_versions_insert_all" ON ipo_scraper_versions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "ipo_scraper_versions_update_all" ON ipo_scraper_versions FOR UPDATE TO authenticated USING (true);

-- Error patterns - read-only for all, write for admin
CREATE POLICY "ipo_error_patterns_select_all" ON ipo_error_patterns FOR SELECT TO authenticated USING (true);
CREATE POLICY "ipo_error_patterns_insert_all" ON ipo_error_patterns FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "ipo_error_patterns_update_all" ON ipo_error_patterns FOR UPDATE TO authenticated USING (true);