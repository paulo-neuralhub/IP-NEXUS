-- ============================================
-- PROMPT 49: SPIDER PRO ENGINE
-- Sistema de Módulos y Licencias + Conectores Spider
-- ============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;

-- ============================================
-- PARTE 0: SISTEMA DE MÓDULOS Y LICENCIAS
-- ============================================

-- Catálogo de módulos disponibles
CREATE TABLE IF NOT EXISTS platform_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  tagline VARCHAR(300),
  category VARCHAR(50) NOT NULL,
  is_standalone_available BOOLEAN DEFAULT false,
  is_addon_available BOOLEAN DEFAULT true,
  required_modules TEXT[] DEFAULT '{}',
  recommended_modules TEXT[] DEFAULT '{}',
  pricing_model VARCHAR(30) DEFAULT 'subscription',
  base_price_monthly DECIMAL(10,2),
  base_price_yearly DECIMAL(10,2),
  tiers JSONB DEFAULT '[]',
  icon VARCHAR(50),
  color VARCHAR(20),
  landing_url VARCHAR(200),
  docs_url VARCHAR(200),
  is_active BOOLEAN DEFAULT true,
  is_beta BOOLEAN DEFAULT false,
  launch_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Licencias de módulos por organización
CREATE TABLE IF NOT EXISTS organization_module_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES platform_modules(id),
  license_type VARCHAR(30) NOT NULL,
  tier_code VARCHAR(50) NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  billing_cycle VARCHAR(20),
  price_override DECIMAL(10,2),
  stripe_subscription_item_id VARCHAR(100),
  limits_override JSONB,
  status VARCHAR(20) DEFAULT 'active',
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  UNIQUE(organization_id, module_id)
);

-- Uso de módulos
CREATE TABLE IF NOT EXISTS module_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  module_code VARCHAR(50) NOT NULL,
  metric_code VARCHAR(100) NOT NULL,
  metric_value INTEGER NOT NULL DEFAULT 1,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  details JSONB,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_org_module_licenses_org ON organization_module_licenses(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_module_licenses_status ON organization_module_licenses(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_module_usage_period ON module_usage_log(organization_id, module_code, period_start);

-- ============================================
-- DATOS INICIALES: MÓDULOS DE LA PLATAFORMA
-- ============================================

INSERT INTO platform_modules (
  code, name, description, tagline, category,
  is_standalone_available, is_addon_available,
  required_modules, recommended_modules,
  pricing_model, base_price_monthly, base_price_yearly,
  tiers, icon, color
) VALUES
('core', 'IP-NEXUS Core', 'Funcionalidades básicas de la plataforma', 'La base de tu gestión de PI', 'core', false, false, '{}', '{}', 'subscription', 0, 0, '[]', 'Home', '#6366F1'),
('docket', 'IP-NEXUS Docket', 'Gestión completa de expedientes de propiedad intelectual', 'Gestión Inteligente de Expedientes', 'addon', true, true, '{"core"}', '{"spider"}', 'subscription', 99, 990, '[{"code": "basic", "name": "Starter", "price": 0, "features": ["100_matters", "basic_deadlines"]}, {"code": "pro", "name": "Professional", "price": 99, "features": ["unlimited_matters", "auto_deadlines", "email_parsing"]}, {"code": "enterprise", "name": "Enterprise", "price": 299, "features": ["all_pro", "api", "custom_rules"]}]', 'Briefcase', '#3B82F6'),
('spider', 'IP-SPIDER Pro', 'Vigilancia inteligente de propiedad intelectual', 'Vigilancia Inteligente 24/7', 'addon', true, true, '{"core"}', '{"docket"}', 'subscription', 149, 1490, '[{"code": "basic", "name": "Basic", "price": 0, "features": ["5_watchlists", "eu_gazettes", "weekly_scan"]}, {"code": "pro", "name": "Pro", "price": 149, "features": ["25_watchlists", "global_gazettes", "domains", "daily_scan"]}, {"code": "enterprise", "name": "Enterprise", "price": 499, "features": ["unlimited_watchlists", "web_social_marketplace", "6h_scan", "api"]}]', 'Radar', '#8B5CF6'),
('crm', 'IP-NEXUS CRM', 'Gestión de relaciones con clientes especializada en PI', 'CRM diseñado para PI', 'addon', true, true, '{"core"}', '{"docket", "marketing"}', 'subscription', 79, 790, '[{"code": "basic", "name": "Starter", "price": 0, "features": ["100_contacts", "basic_pipeline"]}, {"code": "pro", "name": "Professional", "price": 79, "features": ["unlimited_contacts", "automation"]}, {"code": "enterprise", "name": "Enterprise", "price": 199, "features": ["all_pro", "api", "zapier"]}]', 'Users', '#EC4899'),
('marketing', 'IP-NEXUS Marketing', 'Automatización de marketing para despachos de PI', 'Marketing Automation para PI', 'addon', true, true, '{"core", "crm"}', '{}', 'subscription', 99, 990, '[{"code": "basic", "name": "Starter", "price": 0, "features": ["1000_emails_month"]}, {"code": "pro", "name": "Professional", "price": 99, "features": ["10000_emails_month", "automation"]}, {"code": "enterprise", "name": "Enterprise", "price": 249, "features": ["unlimited_emails", "api"]}]', 'Megaphone', '#F59E0B'),
('market', 'IP-NEXUS Market', 'Marketplace de compra-venta de activos de PI', 'Compra y Vende Activos de PI', 'addon', true, true, '{"core"}', '{"docket"}', 'hybrid', 49, 490, '[{"code": "basic", "name": "Browser", "price": 0, "features": ["browse_listings"]}, {"code": "seller", "name": "Seller", "price": 49, "features": ["list_assets", "analytics"]}, {"code": "broker", "name": "Broker", "price": 199, "features": ["unlimited_listings", "api"]}]', 'Store', '#22C55E'),
('genius', 'IP-NEXUS Genius', 'Asistente de IA especializado en propiedad intelectual', 'IA Legal Especializada en PI', 'addon', false, true, '{"core"}', '{}', 'usage', 29, 290, '[{"code": "basic", "name": "Starter", "price": 0, "features": ["100_queries_month"]}, {"code": "pro", "name": "Professional", "price": 29, "features": ["500_queries_month"]}, {"code": "enterprise", "name": "Enterprise", "price": 99, "features": ["unlimited_queries", "api"]}]', 'Sparkles', '#A855F7'),
('finance', 'IP-NEXUS Finance', 'Facturación, control de costes y rentabilidad', 'Finanzas de tu Práctica de PI', 'addon', false, true, '{"core", "docket"}', '{}', 'subscription', 49, 490, '[{"code": "basic", "name": "Starter", "price": 0, "features": ["basic_invoicing"]}, {"code": "pro", "name": "Professional", "price": 49, "features": ["advanced_invoicing", "profitability"]}]', 'Wallet', '#0EA5E9')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  tiers = EXCLUDED.tiers,
  updated_at = NOW();

-- ============================================
-- PARTE 1: SPIDER CONECTORES
-- ============================================

-- Conectores disponibles
CREATE TABLE IF NOT EXISTS spider_connectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  connector_type VARCHAR(50) NOT NULL,
  source_category VARCHAR(50),
  jurisdictions TEXT[] DEFAULT '{}',
  base_url VARCHAR(500),
  auth_type VARCHAR(30) DEFAULT 'none',
  default_config JSONB DEFAULT '{}',
  rate_limit_requests INTEGER DEFAULT 100,
  rate_limit_period_seconds INTEGER DEFAULT 3600,
  max_concurrent_requests INTEGER DEFAULT 5,
  required_tier VARCHAR(50) DEFAULT 'basic',
  is_active BOOLEAN DEFAULT true,
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_message TEXT,
  health_status VARCHAR(20) DEFAULT 'unknown',
  last_health_check TIMESTAMPTZ,
  health_check_config JSONB,
  documentation_url VARCHAR(500),
  logo_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credenciales de conectores por organización
CREATE TABLE IF NOT EXISTS spider_connector_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  connector_id UUID NOT NULL REFERENCES spider_connectors(id) ON DELETE CASCADE,
  credentials JSONB NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  is_valid BOOLEAN DEFAULT true,
  last_validated_at TIMESTAMPTZ,
  validation_error TEXT,
  last_used_at TIMESTAMPTZ,
  total_requests INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, connector_id)
);

-- Jobs de vigilancia programados
CREATE TABLE IF NOT EXISTS spider_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  watchlist_id UUID NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
  job_type VARCHAR(30) DEFAULT 'scheduled',
  status VARCHAR(20) DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ NOT NULL,
  queued_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  timeout_at TIMESTAMPTZ,
  progress_percent INTEGER DEFAULT 0,
  progress_message TEXT,
  connectors_to_run TEXT[] DEFAULT '{}',
  connectors_completed TEXT[] DEFAULT '{}',
  connectors_failed TEXT[] DEFAULT '{}',
  results_found INTEGER DEFAULT 0,
  results_new INTEGER DEFAULT 0,
  results_updated INTEGER DEFAULT 0,
  alerts_created INTEGER DEFAULT 0,
  error_code VARCHAR(50),
  error_message TEXT,
  error_details JSONB,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  retry_after TIMESTAMPTZ,
  execution_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ejecuciones de conectores individuales
CREATE TABLE IF NOT EXISTS spider_connector_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES spider_jobs(id) ON DELETE CASCADE,
  connector_id UUID NOT NULL REFERENCES spider_connectors(id),
  status VARCHAR(20) DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  search_params JSONB NOT NULL,
  records_fetched INTEGER DEFAULT 0,
  records_matched INTEGER DEFAULT 0,
  records_new INTEGER DEFAULT 0,
  checkpoint JSONB,
  rate_limit_remaining INTEGER,
  rate_limit_reset_at TIMESTAMPTZ,
  error_code VARCHAR(50),
  error_message TEXT,
  raw_response_sample JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cache de resultados de fuentes
CREATE TABLE IF NOT EXISTS spider_source_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_code VARCHAR(50) NOT NULL,
  source_id VARCHAR(300) NOT NULL,
  source_type VARCHAR(50),
  cached_data JSONB NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_stale BOOLEAN DEFAULT false,
  content_hash VARCHAR(64),
  UNIQUE(connector_code, source_id)
);

-- Índices para Spider
CREATE INDEX IF NOT EXISTS idx_spider_jobs_status ON spider_jobs(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_spider_jobs_org_watchlist ON spider_jobs(organization_id, watchlist_id);
CREATE INDEX IF NOT EXISTS idx_spider_connector_runs_job ON spider_connector_runs(job_id);
CREATE INDEX IF NOT EXISTS idx_spider_cache_expires ON spider_source_cache(expires_at) WHERE NOT is_stale;
CREATE INDEX IF NOT EXISTS idx_spider_cache_lookup ON spider_source_cache(connector_code, source_id);

-- ============================================
-- DATOS INICIALES: CONECTORES
-- ============================================

INSERT INTO spider_connectors (code, name, description, connector_type, source_category, jurisdictions, base_url, auth_type, default_config, rate_limit_requests, rate_limit_period_seconds, required_tier, is_active) VALUES
-- Basic tier
('euipo_esearch', 'EUIPO eSearch Plus', 'Base de datos oficial de marcas y diseños de la UE', 'official_gazette', 'mixed', ARRAY['EU'], 'https://euipo.europa.eu/eSearch/', 'none', '{"search_type": "similar"}', 100, 3600, 'basic', true),
('oepm_localizador', 'OEPM Localizador', 'Base de datos de la OEPM', 'official_gazette', 'mixed', ARRAY['ES'], 'https://consultas2.oepm.es/', 'none', '{}', 50, 3600, 'basic', true),
('wipo_global_brand', 'WIPO Global Brand Database', 'Base de datos mundial de marcas de la OMPI', 'official_gazette', 'trademark', ARRAY['WO', 'WIPO'], 'https://www3.wipo.int/branddb/', 'none', '{}', 100, 3600, 'basic', true),
-- Pro tier
('uspto_tess', 'USPTO TESS', 'Trademark Electronic Search System de EEUU', 'official_gazette', 'trademark', ARRAY['US'], 'https://tmsearch.uspto.gov/', 'none', '{}', 50, 3600, 'pro', true),
('ukipo_search', 'UK IPO Trade Marks', 'Base de datos de marcas del Reino Unido', 'official_gazette', 'trademark', ARRAY['GB'], 'https://trademarks.ipo.gov.uk/', 'none', '{}', 50, 3600, 'pro', true),
('tmview_api', 'TMView API', 'API oficial de TMView multi-oficina', 'official_gazette', 'trademark', ARRAY['EU', 'ES', 'DE', 'FR', 'IT', 'PT'], 'https://www.tmdn.org/tmview/api/', 'api_key', '{}', 500, 3600, 'pro', true),
('espacenet_ops', 'Espacenet OPS API', 'Open Patent Services de la EPO', 'official_gazette', 'patent', ARRAY['EP', 'WO'], 'https://ops.epo.org/', 'oauth2', '{}', 200, 3600, 'pro', true),
('whois_xml_api', 'WhoisXML API', 'Consulta WHOIS y monitoreo de dominios', 'domain', NULL, ARRAY[]::TEXT[], 'https://www.whoisxmlapi.com/', 'api_key', '{}', 500, 86400, 'pro', true),
('domain_tools', 'DomainTools', 'Monitoreo avanzado de dominios', 'domain', NULL, ARRAY[]::TEXT[], 'https://api.domaintools.com/', 'api_key', '{}', 200, 86400, 'pro', true),
-- Enterprise tier
('google_custom_search', 'Google Custom Search', 'Búsqueda web personalizada', 'web', NULL, ARRAY[]::TEXT[], 'https://www.googleapis.com/customsearch/v1', 'api_key', '{}', 100, 86400, 'enterprise', true),
('bing_web_search', 'Bing Web Search', 'API de búsqueda web de Microsoft', 'web', NULL, ARRAY[]::TEXT[], 'https://api.bing.microsoft.com/v7.0/search', 'api_key', '{}', 1000, 2592000, 'enterprise', true),
('social_searcher', 'Social Searcher API', 'Búsqueda en redes sociales', 'social', NULL, ARRAY[]::TEXT[], 'https://api.social-searcher.com/', 'api_key', '{}', 100, 86400, 'enterprise', true),
('amazon_brand_registry', 'Amazon Brand Registry API', 'Protección de marca de Amazon', 'marketplace', NULL, ARRAY['US', 'UK', 'DE', 'FR', 'IT', 'ES'], 'https://sellingpartnerapi.amazon.com/', 'oauth2', '{}', 100, 3600, 'enterprise', true),
('ebay_vero', 'eBay VeRO API', 'Protección de PI de eBay', 'marketplace', NULL, ARRAY[]::TEXT[], 'https://api.ebay.com/', 'oauth2', '{}', 100, 3600, 'enterprise', true),
('alibaba_ipr', 'Alibaba IPR Platform', 'Protección de PI de Alibaba', 'marketplace', NULL, ARRAY['CN'], 'https://ipp.alibabagroup.com/', 'oauth2', '{}', 50, 3600, 'enterprise', true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  required_tier = EXCLUDED.required_tier,
  updated_at = NOW();

-- ============================================
-- FUNCIONES DE VERIFICACIÓN DE LICENCIA
-- ============================================

CREATE OR REPLACE FUNCTION check_module_access(
  p_organization_id UUID,
  p_module_code VARCHAR(50),
  p_required_tier VARCHAR(50) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_license RECORD;
  v_tier_index INTEGER;
  v_required_index INTEGER;
  v_tiers JSONB;
BEGIN
  SELECT oml.*, pm.tiers
  INTO v_license
  FROM organization_module_licenses oml
  JOIN platform_modules pm ON pm.id = oml.module_id
  WHERE oml.organization_id = p_organization_id
    AND pm.code = p_module_code
    AND oml.status = 'active'
    AND (oml.expires_at IS NULL OR oml.expires_at > NOW())
    AND (oml.trial_ends_at IS NULL OR oml.trial_ends_at > NOW());
  
  IF v_license IS NULL THEN
    RETURN FALSE;
  END IF;
  
  IF p_required_tier IS NULL THEN
    RETURN TRUE;
  END IF;
  
  v_tiers := v_license.tiers;
  
  SELECT ordinality - 1 INTO v_tier_index
  FROM jsonb_array_elements(v_tiers) WITH ORDINALITY
  WHERE value->>'code' = v_license.tier_code;
  
  SELECT ordinality - 1 INTO v_required_index
  FROM jsonb_array_elements(v_tiers) WITH ORDINALITY
  WHERE value->>'code' = p_required_tier;
  
  RETURN COALESCE(v_tier_index, 0) >= COALESCE(v_required_index, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_module_limit(
  p_organization_id UUID,
  p_module_code VARCHAR(50),
  p_limit_key VARCHAR(100)
)
RETURNS INTEGER AS $$
DECLARE
  v_license RECORD;
  v_tier JSONB;
  v_limit INTEGER;
BEGIN
  SELECT oml.*, pm.tiers
  INTO v_license
  FROM organization_module_licenses oml
  JOIN platform_modules pm ON pm.id = oml.module_id
  WHERE oml.organization_id = p_organization_id
    AND pm.code = p_module_code
    AND oml.status = 'active';
  
  IF v_license IS NULL THEN
    RETURN 0;
  END IF;
  
  IF v_license.limits_override ? p_limit_key THEN
    RETURN (v_license.limits_override->>p_limit_key)::INTEGER;
  END IF;
  
  SELECT value INTO v_tier
  FROM jsonb_array_elements(v_license.tiers)
  WHERE value->>'code' = v_license.tier_code;
  
  SELECT NULLIF(regexp_replace(f.value::text, '[^0-9]', '', 'g'), '')::INTEGER
  INTO v_limit
  FROM jsonb_array_elements_text(v_tier->'features') f
  WHERE f.value LIKE '%' || p_limit_key || '%';
  
  IF v_tier->'features' @> '["unlimited"]'::jsonb OR 
     v_tier->'features' @> to_jsonb('unlimited_' || p_limit_key) THEN
    RETURN -1;
  END IF;
  
  RETURN COALESCE(v_limit, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCIÓN DE SIMILITUD DE MARCAS
-- ============================================

CREATE OR REPLACE FUNCTION calculate_trademark_similarity(
  term_a TEXT,
  term_b TEXT,
  OUT overall_score INTEGER,
  OUT phonetic_score INTEGER,
  OUT visual_score INTEGER,
  OUT conceptual_score INTEGER,
  OUT exact_match BOOLEAN,
  OUT contains_match BOOLEAN,
  OUT analysis JSONB
)
RETURNS RECORD AS $$
DECLARE
  a TEXT;
  b TEXT;
  levenshtein_sim FLOAT;
  trigram_sim FLOAT;
  soundex_match BOOLEAN;
  metaphone_match BOOLEAN;
  common_prefix INTEGER;
BEGIN
  a := LOWER(TRIM(term_a));
  b := LOWER(TRIM(term_b));
  
  exact_match := (a = b);
  contains_match := (a LIKE '%' || b || '%') OR (b LIKE '%' || a || '%');
  
  levenshtein_sim := 100 * (1 - LEAST(levenshtein(a, b)::FLOAT / GREATEST(LENGTH(a), LENGTH(b), 1), 1));
  trigram_sim := 100 * similarity(a, b);
  soundex_match := (soundex(a) = soundex(b));
  metaphone_match := (metaphone(a, 10) = metaphone(b, 10));
  
  common_prefix := 0;
  FOR i IN 1..LEAST(LENGTH(a), LENGTH(b)) LOOP
    EXIT WHEN SUBSTRING(a, i, 1) != SUBSTRING(b, i, 1);
    common_prefix := common_prefix + 1;
  END LOOP;
  
  phonetic_score := LEAST(100, ROUND(
    levenshtein_sim * 0.4 +
    (CASE WHEN soundex_match THEN 100 ELSE trigram_sim END) * 0.3 +
    (CASE WHEN metaphone_match THEN 100 ELSE trigram_sim END) * 0.3 +
    (common_prefix::FLOAT / GREATEST(LENGTH(a), 1) * 20)
  ))::INTEGER;
  
  visual_score := ROUND(trigram_sim)::INTEGER;
  
  conceptual_score := LEAST(100, ROUND(
    (CASE WHEN exact_match THEN 100 WHEN contains_match THEN 80 ELSE trigram_sim * 0.7 END)
  ))::INTEGER;
  
  overall_score := LEAST(100, ROUND(
    phonetic_score * 0.5 +
    visual_score * 0.2 +
    conceptual_score * 0.3
  ))::INTEGER;
  
  IF exact_match THEN
    overall_score := 100;
    phonetic_score := 100;
    visual_score := 100;
    conceptual_score := 100;
  END IF;
  
  analysis := jsonb_build_object(
    'levenshtein_similarity', ROUND(levenshtein_sim),
    'trigram_similarity', ROUND(trigram_sim),
    'soundex_match', soundex_match,
    'soundex_a', soundex(a),
    'soundex_b', soundex(b),
    'metaphone_match', metaphone_match,
    'metaphone_a', metaphone(a, 10),
    'metaphone_b', metaphone(b, 10),
    'common_prefix_length', common_prefix,
    'length_diff', ABS(LENGTH(a) - LENGTH(b))
  );
  
  RETURN;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE platform_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_module_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE spider_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE spider_connector_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE spider_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE spider_connector_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE spider_source_cache ENABLE ROW LEVEL SECURITY;

-- Platform modules - todos pueden leer
CREATE POLICY "Anyone can view active modules" ON platform_modules
  FOR SELECT USING (is_active = true);

-- Spider connectors - todos pueden leer activos
CREATE POLICY "Anyone can view active connectors" ON spider_connectors
  FOR SELECT USING (is_active = true);

-- Organization module licenses
CREATE POLICY "Users can view their org licenses" ON organization_module_licenses
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- Module usage log
CREATE POLICY "Users can view their org usage" ON module_usage_log
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- Spider connector credentials
CREATE POLICY "Users can manage their org credentials" ON spider_connector_credentials
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- Spider jobs
CREATE POLICY "Users can view their org jobs" ON spider_jobs
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- Spider connector runs
CREATE POLICY "Users can view their org connector runs" ON spider_connector_runs
  FOR SELECT USING (
    job_id IN (
      SELECT id FROM spider_jobs WHERE organization_id IN (
        SELECT organization_id FROM memberships WHERE user_id = auth.uid()
      )
    )
  );

-- Spider source cache - público para lectura
CREATE POLICY "Anyone can read cache" ON spider_source_cache
  FOR SELECT USING (true);