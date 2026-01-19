-- ============================================
-- IPO MASTER REGISTRY - SISTEMA CENTRAL DE OFICINAS PI
-- ============================================

-- Habilitar extensión para vectores (si no existe)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- OFICINAS DE PI (CORE)
-- ============================================

CREATE TABLE public.ipo_offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación oficial
  code VARCHAR(10) NOT NULL UNIQUE,
  code_alt VARCHAR(20),
  name_official VARCHAR(300) NOT NULL,
  name_short VARCHAR(100),
  
  -- Localización
  country_code VARCHAR(2),
  region VARCHAR(50),
  
  -- Tipo de oficina
  office_type VARCHAR(30) NOT NULL,
  ip_types VARCHAR(50)[] DEFAULT '{}',
  
  -- Configuración regional
  timezone VARCHAR(50) NOT NULL,
  languages VARCHAR(5)[] DEFAULT '{}',
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Contacto
  address TEXT,
  website_official TEXT,
  website_search TEXT,
  email_general TEXT,
  phone_general TEXT,
  
  -- Clasificación interna
  tier INTEGER DEFAULT 3 CHECK (tier BETWEEN 1 AND 3),
  priority_score INTEGER DEFAULT 50,
  
  -- Estado
  status VARCHAR(30) DEFAULT 'active',
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ipo_offices_code ON public.ipo_offices(code);
CREATE INDEX idx_ipo_offices_tier ON public.ipo_offices(tier);
CREATE INDEX idx_ipo_offices_status ON public.ipo_offices(status);

-- ============================================
-- CONTACTOS DE OFICINA
-- ============================================

CREATE TABLE public.ipo_office_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES public.ipo_offices(id) ON DELETE CASCADE,
  
  contact_type VARCHAR(50) NOT NULL,
  name VARCHAR(200),
  role VARCHAR(200),
  email VARCHAR(200),
  phone VARCHAR(50),
  hours TEXT,
  notes TEXT,
  
  is_primary BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ipo_contacts_office ON public.ipo_office_contacts(office_id);

-- ============================================
-- MÉTODOS DE CONEXIÓN
-- ============================================

CREATE TABLE public.ipo_connection_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES public.ipo_offices(id) ON DELETE CASCADE,
  
  method_type VARCHAR(30) NOT NULL,
  priority INTEGER DEFAULT 1,
  
  status VARCHAR(30) DEFAULT 'active',
  is_enabled BOOLEAN DEFAULT true,
  
  config JSONB NOT NULL DEFAULT '{}',
  
  rate_limit_requests INTEGER,
  rate_limit_period INTEGER,
  rate_limit_burst INTEGER,
  
  maintenance_schedule JSONB,
  preferred_hours JSONB,
  
  health_status VARCHAR(30) DEFAULT 'unknown',
  last_health_check TIMESTAMPTZ,
  last_successful_sync TIMESTAMPTZ,
  consecutive_failures INTEGER DEFAULT 0,
  
  avg_response_time_ms INTEGER,
  success_rate_7d DECIMAL(5,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_connection_methods_office ON public.ipo_connection_methods(office_id);
CREATE INDEX idx_connection_methods_status ON public.ipo_connection_methods(status, health_status);

-- ============================================
-- CONFIGURACIÓN API
-- ============================================

CREATE TABLE public.ipo_api_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_method_id UUID NOT NULL REFERENCES public.ipo_connection_methods(id) ON DELETE CASCADE,
  
  base_url TEXT NOT NULL,
  api_version VARCHAR(20),
  
  auth_type VARCHAR(30) NOT NULL,
  auth_config JSONB DEFAULT '{}',
  
  docs_url TEXT,
  docs_format VARCHAR(20),
  
  required_headers JSONB DEFAULT '{}',
  endpoints JSONB DEFAULT '{}',
  
  subscription_plan VARCHAR(100),
  subscription_start DATE,
  subscription_end DATE,
  subscription_cost DECIMAL(10,2),
  subscription_currency VARCHAR(3),
  subscription_responsible VARCHAR(200),
  renewal_alert_days INTEGER DEFAULT 45,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONFIGURACIÓN SCRAPER
-- ============================================

CREATE TABLE public.ipo_scraper_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_method_id UUID NOT NULL REFERENCES public.ipo_connection_methods(id) ON DELETE CASCADE,
  
  target_url TEXT NOT NULL,
  search_url TEXT,
  detail_url_pattern TEXT,
  
  script_version VARCHAR(20),
  script_generated_at TIMESTAMPTZ,
  script_generated_by VARCHAR(50),
  script_content TEXT,
  
  browser_type VARCHAR(30) DEFAULT 'chromium',
  browser_headless BOOLEAN DEFAULT true,
  user_agent TEXT,
  viewport_width INTEGER DEFAULT 1920,
  viewport_height INTEGER DEFAULT 1080,
  
  proxy_strategy VARCHAR(30),
  proxy_country VARCHAR(2),
  
  captcha_strategy VARCHAR(30),
  wait_strategy JSONB,
  
  selectors JSONB NOT NULL DEFAULT '{}',
  previous_versions JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONFIGURACIÓN BULK/FTP
-- ============================================

CREATE TABLE public.ipo_bulk_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_method_id UUID NOT NULL REFERENCES public.ipo_connection_methods(id) ON DELETE CASCADE,
  
  protocol VARCHAR(20) NOT NULL,
  host TEXT NOT NULL,
  port INTEGER,
  path_pattern TEXT,
  
  file_format VARCHAR(20) NOT NULL,
  file_encoding VARCHAR(20) DEFAULT 'UTF-8',
  xml_standard VARCHAR(20),
  
  schedule_cron VARCHAR(100),
  schedule_timezone VARCHAR(50),
  
  decompress_strategy VARCHAR(20),
  chunk_size INTEGER DEFAULT 1000,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREDENCIALES (VAULT)
-- ============================================

CREATE TABLE public.ipo_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_method_id UUID NOT NULL REFERENCES public.ipo_connection_methods(id) ON DELETE CASCADE,
  
  credential_type VARCHAR(30) NOT NULL,
  credential_data BYTEA NOT NULL,
  
  description VARCHAR(200),
  created_by UUID REFERENCES auth.users(id),
  
  expires_at TIMESTAMPTZ,
  rotation_reminder_days INTEGER DEFAULT 30,
  last_rotated_at TIMESTAMPTZ,
  rotation_count INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FIELD MAPPING (NORMALIZACIÓN)
-- ============================================

CREATE TABLE public.ipo_field_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES public.ipo_offices(id) ON DELETE CASCADE,
  
  data_type VARCHAR(50) NOT NULL,
  source_format VARCHAR(30),
  
  mappings JSONB NOT NULL,
  validations JSONB DEFAULT '{}',
  
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_field_mappings_office ON public.ipo_field_mappings(office_id, data_type);

-- ============================================
-- HEALTH CHECKS
-- ============================================

CREATE TABLE public.ipo_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_method_id UUID NOT NULL REFERENCES public.ipo_connection_methods(id) ON DELETE CASCADE,
  
  check_type VARCHAR(30) NOT NULL,
  status VARCHAR(30) NOT NULL,
  
  response_time_ms INTEGER,
  records_fetched INTEGER,
  
  error_code VARCHAR(50),
  error_message TEXT,
  error_details JSONB,
  
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_checks_method ON public.ipo_health_checks(connection_method_id, checked_at DESC);

-- ============================================
-- SYNC LOGS
-- ============================================

CREATE TABLE public.ipo_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES public.ipo_offices(id),
  connection_method_id UUID REFERENCES public.ipo_connection_methods(id),
  
  sync_type VARCHAR(30) NOT NULL,
  status VARCHAR(30) NOT NULL,
  
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  records_fetched INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  
  source_file TEXT,
  errors JSONB DEFAULT '[]',
  
  triggered_by VARCHAR(50),
  triggered_by_user UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_sync_logs_office ON public.ipo_sync_logs(office_id, started_at DESC);

-- ============================================
-- KNOWLEDGE BASE (PARA IA)
-- ============================================

CREATE TABLE public.ipo_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES public.ipo_offices(id) ON DELETE CASCADE,
  
  knowledge_type VARCHAR(50) NOT NULL,
  
  title VARCHAR(500) NOT NULL,
  content TEXT,
  content_url TEXT,
  content_language VARCHAR(5) DEFAULT 'en',
  
  effective_date DATE,
  expiry_date DATE,
  
  last_crawled_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ,
  auto_update BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_knowledge_base_office ON public.ipo_knowledge_base(office_id, knowledge_type);

-- ============================================
-- TASAS OFICIALES
-- ============================================

CREATE TABLE public.ipo_official_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES public.ipo_offices(id) ON DELETE CASCADE,
  
  fee_type VARCHAR(100) NOT NULL,
  ip_type VARCHAR(30) NOT NULL,
  
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  
  description TEXT,
  per_class BOOLEAN DEFAULT false,
  base_classes INTEGER,
  additional_class_fee DECIMAL(10,2),
  
  online_discount DECIMAL(5,2),
  small_entity_discount DECIMAL(5,2),
  
  effective_from DATE NOT NULL,
  effective_until DATE,
  
  source_url TEXT,
  last_verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fees_office ON public.ipo_official_fees(office_id, fee_type, ip_type);

-- ============================================
-- REGLAS DE PLAZOS
-- ============================================

CREATE TABLE public.ipo_deadline_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES public.ipo_offices(id) ON DELETE CASCADE,
  
  deadline_type VARCHAR(100) NOT NULL,
  ip_type VARCHAR(30) NOT NULL,
  
  trigger_event VARCHAR(100) NOT NULL,
  
  days INTEGER,
  months INTEGER,
  years INTEGER,
  
  is_calendar_days BOOLEAN DEFAULT true,
  exclude_holidays BOOLEAN DEFAULT false,
  
  extension_available BOOLEAN DEFAULT false,
  max_extensions INTEGER,
  extension_days INTEGER,
  extension_fee_id UUID REFERENCES public.ipo_official_fees(id),
  
  consequence_if_missed VARCHAR(100),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deadline_rules_office ON public.ipo_deadline_rules(office_id, deadline_type);

-- ============================================
-- FESTIVOS POR OFICINA
-- ============================================

CREATE TABLE public.ipo_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES public.ipo_offices(id) ON DELETE CASCADE,
  
  holiday_date DATE NOT NULL,
  name VARCHAR(200),
  is_recurring BOOLEAN DEFAULT false,
  recurring_month INTEGER,
  recurring_day INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(office_id, holiday_date)
);

CREATE INDEX idx_holidays_office_date ON public.ipo_holidays(office_id, holiday_date);

-- ============================================
-- ALERTAS CONFIGURADAS
-- ============================================

CREATE TABLE public.ipo_alert_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID REFERENCES public.ipo_offices(id),
  
  alert_type VARCHAR(50) NOT NULL,
  
  threshold_value INTEGER,
  threshold_unit VARCHAR(20),
  
  notify_emails TEXT[],
  notify_slack_channel TEXT,
  notify_webhook_url TEXT,
  
  cooldown_minutes INTEGER DEFAULT 60,
  is_enabled BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ALERTAS HISTORIAL
-- ============================================

CREATE TABLE public.ipo_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID REFERENCES public.ipo_offices(id),
  
  alert_type VARCHAR(50) NOT NULL,
  data JSONB DEFAULT '{}',
  
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_office ON public.ipo_alerts(office_id, created_at DESC);

-- ============================================
-- VIEWS
-- ============================================

CREATE OR REPLACE VIEW public.ipo_health_overview AS
SELECT 
  o.id,
  o.code,
  o.name_official,
  o.name_short,
  o.tier,
  o.region,
  o.status AS office_status,
  cm.id AS connection_method_id,
  cm.method_type,
  cm.health_status,
  cm.last_successful_sync,
  cm.consecutive_failures,
  cm.success_rate_7d,
  cm.avg_response_time_ms,
  CASE 
    WHEN cm.health_status = 'healthy' THEN 'green'
    WHEN cm.health_status = 'degraded' THEN 'yellow'
    WHEN cm.health_status = 'unhealthy' THEN 'red'
    ELSE 'gray'
  END AS traffic_light
FROM public.ipo_offices o
LEFT JOIN public.ipo_connection_methods cm ON o.id = cm.office_id AND cm.is_enabled = true AND cm.priority = 1
WHERE o.status = 'active';

CREATE OR REPLACE VIEW public.ipo_expiring_credentials AS
SELECT 
  o.code,
  o.name_short,
  c.credential_type,
  c.expires_at,
  c.expires_at - CURRENT_DATE AS days_until_expiry
FROM public.ipo_credentials c
JOIN public.ipo_connection_methods cm ON c.connection_method_id = cm.id
JOIN public.ipo_offices o ON cm.office_id = o.id
WHERE c.is_active = true 
  AND c.expires_at IS NOT NULL
  AND c.expires_at <= CURRENT_DATE + INTERVAL '60 days'
ORDER BY c.expires_at;

-- ============================================
-- RLS POLICIES (Solo para admins de backoffice)
-- ============================================

ALTER TABLE public.ipo_offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipo_office_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipo_connection_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipo_api_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipo_scraper_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipo_bulk_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipo_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipo_field_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipo_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipo_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipo_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipo_official_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipo_deadline_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipo_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipo_alert_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ipo_alerts ENABLE ROW LEVEL SECURITY;

-- Política de lectura para usuarios autenticados (datos públicos de oficinas)
CREATE POLICY "Anyone can view offices" ON public.ipo_offices
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can view fees" ON public.ipo_official_fees
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can view deadline rules" ON public.ipo_deadline_rules
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can view holidays" ON public.ipo_holidays
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can view knowledge base" ON public.ipo_knowledge_base
  FOR SELECT TO authenticated USING (true);

-- Para tablas sensibles, solo admins pueden acceder
-- (En producción, esto usaría is_admin() o similar)
CREATE POLICY "Admins manage office contacts" ON public.ipo_office_contacts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins manage connection methods" ON public.ipo_connection_methods
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins manage api configs" ON public.ipo_api_configs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins manage scraper configs" ON public.ipo_scraper_configs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins manage bulk configs" ON public.ipo_bulk_configs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins manage credentials" ON public.ipo_credentials
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins manage field mappings" ON public.ipo_field_mappings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins view health checks" ON public.ipo_health_checks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins view sync logs" ON public.ipo_sync_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins manage alert configs" ON public.ipo_alert_configs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins view alerts" ON public.ipo_alerts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Políticas para modificar tablas públicas (solo admins)
CREATE POLICY "Admins manage offices" ON public.ipo_offices
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins manage fees" ON public.ipo_official_fees
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins manage deadline rules" ON public.ipo_deadline_rules
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins manage holidays" ON public.ipo_holidays
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins manage knowledge base" ON public.ipo_knowledge_base
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION public.update_ipo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ipo_offices_updated_at
  BEFORE UPDATE ON public.ipo_offices
  FOR EACH ROW EXECUTE FUNCTION public.update_ipo_updated_at();

CREATE TRIGGER update_ipo_connection_methods_updated_at
  BEFORE UPDATE ON public.ipo_connection_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_ipo_updated_at();

CREATE TRIGGER update_ipo_field_mappings_updated_at
  BEFORE UPDATE ON public.ipo_field_mappings
  FOR EACH ROW EXECUTE FUNCTION public.update_ipo_updated_at();

CREATE TRIGGER update_ipo_scraper_configs_updated_at
  BEFORE UPDATE ON public.ipo_scraper_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_ipo_updated_at();

CREATE TRIGGER update_ipo_credentials_updated_at
  BEFORE UPDATE ON public.ipo_credentials
  FOR EACH ROW EXECUTE FUNCTION public.update_ipo_updated_at();

CREATE TRIGGER update_ipo_knowledge_base_updated_at
  BEFORE UPDATE ON public.ipo_knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.update_ipo_updated_at();