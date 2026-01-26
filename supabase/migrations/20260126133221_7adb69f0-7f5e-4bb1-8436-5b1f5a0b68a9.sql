-- =============================================
-- L56-SQL-REVISED: Solo datos y funciones
-- Las tablas ya existen con columnas correctas
-- =============================================

-- PASO 1: Columnas faltantes en platform_modules
ALTER TABLE platform_modules
ADD COLUMN IF NOT EXISTS short_name VARCHAR(50),
ADD COLUMN IF NOT EXISTS section VARCHAR(50),
ADD COLUMN IF NOT EXISTS color_primary VARCHAR(20) DEFAULT '#3B82F6',
ADD COLUMN IF NOT EXISTS price_monthly DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS price_yearly DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS requires_modules TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_core BOOLEAN DEFAULT FALSE;

-- PASO 2: Columnas faltantes en subscription_plans
ALTER TABLE subscription_plans
ADD COLUMN IF NOT EXISTS max_modules INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_addons INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS included_addons TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tagline VARCHAR(255),
ADD COLUMN IF NOT EXISTS requires_contact BOOLEAN DEFAULT FALSE;

-- PASO 3: Columna selected_modules en subscriptions
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS selected_modules TEXT[] DEFAULT '{}';

-- PASO 4: Seeds de Planes
INSERT INTO subscription_plans (
  code, name, description, tagline,
  price_monthly, price_yearly,
  max_users, max_matters, max_modules, max_addons, max_storage_gb,
  included_modules, included_addons, features,
  is_popular, is_enterprise, requires_contact,
  badge_text, badge_color, display_order
) VALUES
('free', 'Free', 'Perfecto para probar la plataforma', 'Empieza gratis, sin compromiso',
  0, 0, 1, 10, 1, 0, 1, '{}', '{}',
  '[{"text": "1 usuario", "included": true}, {"text": "10 expedientes", "included": true}]'::jsonb,
  FALSE, FALSE, FALSE, NULL, NULL, 1),
('basico', 'Básico', 'Para autónomos y pequeños despachos', 'Todo lo esencial para empezar',
  49, 470, 3, 100, 1, 2, 5, '{}', '{"addon-jur-spain", "addon-email"}',
  '[{"text": "3 usuarios", "included": true}, {"text": "100 expedientes", "included": true}]'::jsonb,
  FALSE, FALSE, FALSE, NULL, NULL, 2),
('business', 'Business', 'Para despachos en crecimiento', 'Potencia tu negocio con IA',
  149, 1430, 10, 500, 3, 4, 20, '{}', '{"addon-jur-spain", "addon-jur-eu", "addon-email", "addon-google"}',
  '[{"text": "10 usuarios", "included": true}, {"text": "500 expedientes", "included": true}]'::jsonb,
  TRUE, FALSE, FALSE, 'Más popular', '#8B5CF6', 3),
('empresarial', 'Empresarial', 'Para despachos consolidados', 'Máxima potencia y control',
  349, 3350, 25, -1, -1, 8, 100, '{"docket", "crm", "spider", "genius", "analytics", "legal-ops"}',
  '{"addon-jur-spain", "addon-jur-eu", "addon-jur-wipo", "addon-email", "addon-google", "addon-whatsapp"}',
  '[{"text": "25 usuarios", "included": true}, {"text": "Expedientes ilimitados", "included": true}]'::jsonb,
  FALSE, FALSE, FALSE, NULL, NULL, 4)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, tagline = EXCLUDED.tagline,
  price_monthly = EXCLUDED.price_monthly, price_yearly = EXCLUDED.price_yearly,
  max_users = EXCLUDED.max_users, max_matters = EXCLUDED.max_matters,
  max_modules = EXCLUDED.max_modules, max_addons = EXCLUDED.max_addons,
  included_modules = EXCLUDED.included_modules, included_addons = EXCLUDED.included_addons,
  features = EXCLUDED.features, is_popular = EXCLUDED.is_popular, is_enterprise = EXCLUDED.is_enterprise,
  requires_contact = EXCLUDED.requires_contact, badge_text = EXCLUDED.badge_text, display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- PASO 5: Seeds de Módulos
UPDATE platform_modules SET
  short_name = 'Docket', section = 'gestion', color_primary = '#3B82F6',
  price_monthly = 39, price_yearly = 374,
  features = '[{"title": "Expedientes ilimitados"}, {"title": "Plazos automáticos"}]'::jsonb,
  requires_modules = '{}', is_core = TRUE, is_popular = TRUE, display_order = 1
WHERE code = 'docket';

UPDATE platform_modules SET
  short_name = 'CRM', section = 'gestion', color_primary = '#10B981',
  price_monthly = 29, price_yearly = 278,
  features = '[{"title": "Ficha completa cliente"}, {"title": "Pipeline de ventas"}]'::jsonb,
  requires_modules = '{}', is_core = TRUE, is_popular = FALSE, display_order = 2
WHERE code = 'crm';

UPDATE platform_modules SET
  short_name = 'Spider', section = 'inteligencia', color_primary = '#F59E0B',
  price_monthly = 29, price_yearly = 278,
  features = '[{"title": "Monitorización automática"}, {"title": "Alertas IA"}]'::jsonb,
  requires_modules = '{}', is_core = FALSE, is_popular = TRUE, display_order = 3
WHERE code = 'spider';

UPDATE platform_modules SET
  short_name = 'Genius', section = 'inteligencia', color_primary = '#8B5CF6',
  price_monthly = 29, price_yearly = 278,
  features = '[{"title": "Chat IA especializado"}, {"title": "Análisis documentos"}]'::jsonb,
  requires_modules = '{}', is_core = FALSE, is_popular = TRUE, display_order = 4
WHERE code = 'genius';

-- PASO 6: Crear tabla platform_addons
CREATE TABLE IF NOT EXISTS platform_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50),
  icon VARCHAR(10),
  flag_emoji VARCHAR(10),
  price_monthly DECIMAL(10,2) DEFAULT 0,
  price_yearly DECIMAL(10,2) DEFAULT 0,
  applies_to_modules TEXT[] DEFAULT '{}',
  config JSONB DEFAULT '{}',
  is_popular BOOLEAN DEFAULT FALSE,
  is_included_free BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addons_code ON platform_addons(code);
CREATE INDEX IF NOT EXISTS idx_addons_category ON platform_addons(category);

-- PASO 7: Seeds de Add-ons
INSERT INTO platform_addons (code, name, description, category, subcategory, icon, flag_emoji, price_monthly, price_yearly, applies_to_modules, is_popular, is_included_free, display_order) VALUES
('addon-jur-spain', 'España (OEPM)', 'Oficina Española de Patentes y Marcas', 'jurisdictions', 'ip', '🏛️', '🇪🇸', 0, 0, '{docket, spider}', FALSE, TRUE, 1),
('addon-jur-eu', 'Unión Europea (EUIPO)', 'Marcas y diseños comunitarios', 'jurisdictions', 'ip', '🏛️', '🇪🇺', 19, 182, '{docket, spider}', TRUE, FALSE, 2),
('addon-jur-wipo', 'Internacional (WIPO)', 'Sistema de Madrid y PCT', 'jurisdictions', 'ip', '🏛️', '🌐', 29, 278, '{docket, spider}', TRUE, FALSE, 3),
('addon-jur-us', 'Estados Unidos (USPTO)', 'Patentes y marcas USA', 'jurisdictions', 'ip', '🏛️', '🇺🇸', 29, 278, '{docket, spider}', FALSE, FALSE, 4),
('addon-jur-uk', 'Reino Unido (UKIPO)', 'Oficina de PI del Reino Unido', 'jurisdictions', 'ip', '🏛️', '🇬🇧', 19, 182, '{docket, spider}', FALSE, FALSE, 5),
('addon-jur-de', 'Alemania (DPMA)', 'Oficina Alemana de Patentes', 'jurisdictions', 'ip', '🏛️', '🇩🇪', 19, 182, '{docket, spider}', FALSE, FALSE, 6),
('addon-jur-fr', 'Francia (INPI)', 'Instituto Nacional PI Francia', 'jurisdictions', 'ip', '🏛️', '🇫🇷', 19, 182, '{docket, spider}', FALSE, FALSE, 7),
('addon-jur-cn', 'China (CNIPA)', 'Administración Nacional PI China', 'jurisdictions', 'ip', '🏛️', '🇨🇳', 39, 374, '{docket, spider}', FALSE, FALSE, 8),
('addon-jur-latam', 'Latinoamérica', 'MX, BR, AR, CL, CO', 'jurisdictions', 'ip', '🏛️', '🌎', 49, 470, '{docket, spider}', FALSE, FALSE, 9),
('addon-legal-spain', 'Legislación España', 'Ley de Marcas, Patentes, Diseños', 'jurisdictions', 'legal', '⚖️', '🇪🇸', 0, 0, '{genius}', FALSE, TRUE, 10),
('addon-legal-eu', 'Legislación UE', 'Reglamentos EUTM, Diseños, Directivas', 'jurisdictions', 'legal', '⚖️', '🇪🇺', 19, 182, '{genius}', FALSE, FALSE, 11),
('addon-legal-us', 'Legislación USA', 'Lanham Act, Patent Act', 'jurisdictions', 'legal', '⚖️', '🇺🇸', 29, 278, '{genius}', FALSE, FALSE, 12),
('addon-legal-intl', 'Tratados Internacionales', 'París, ADPIC, Madrid, PCT', 'jurisdictions', 'legal', '⚖️', '🌐', 19, 182, '{genius}', FALSE, FALSE, 13),
('addon-spider-eu', 'Europa', 'EUIPO + oficinas nacionales', 'jurisdictions', 'spider', '🔍', '🇪🇺', 0, 0, '{spider}', FALSE, TRUE, 14),
('addon-spider-us', 'Norteamérica', 'USPTO + CIPO', 'jurisdictions', 'spider', '🔍', '🇺🇸', 19, 182, '{spider}', FALSE, FALSE, 15),
('addon-spider-asia', 'Asia-Pacífico', 'CN, JP, KR, AU', 'jurisdictions', 'spider', '🔍', '🌏', 29, 278, '{spider}', FALSE, FALSE, 16),
('addon-spider-latam', 'Latinoamérica', 'BR, MX, AR y más', 'jurisdictions', 'spider', '🔍', '🌎', 19, 182, '{spider}', FALSE, FALSE, 17),
('addon-spider-social', 'Redes Sociales', 'Instagram, TikTok, Amazon', 'jurisdictions', 'spider', '📱', '📱', 29, 278, '{spider}', TRUE, FALSE, 18),
('addon-spider-domains', 'Dominios Web', 'Nuevos registros similares', 'jurisdictions', 'spider', '🌐', '🌐', 19, 182, '{spider}', FALSE, FALSE, 19),
('addon-email', 'Email Integrado', 'Envío y recepción desde plataforma', 'communications', NULL, '📧', NULL, 0, 0, '{communications, crm}', FALSE, TRUE, 20),
('addon-whatsapp', 'WhatsApp Business', 'Mensajería con clientes', 'communications', NULL, '💬', NULL, 29, 278, '{communications}', TRUE, FALSE, 21),
('addon-phone', 'Telefonía VoIP', 'Llamadas con Twilio', 'communications', NULL, '📞', NULL, 39, 374, '{communications}', TRUE, FALSE, 22),
('addon-sms', 'SMS', 'Notificaciones y alertas', 'communications', NULL, '📱', NULL, 19, 182, '{communications}', FALSE, FALSE, 23),
('addon-google', 'Google Workspace', 'Calendar, Drive, Gmail', 'integrations', NULL, '🔵', NULL, 0, 0, '{}', FALSE, TRUE, 24),
('addon-microsoft', 'Microsoft 365', 'Outlook, OneDrive, Teams', 'integrations', NULL, '🟦', NULL, 19, 182, '{}', FALSE, FALSE, 25),
('addon-slack', 'Slack', 'Notificaciones y comandos', 'integrations', NULL, '💜', NULL, 9, 86, '{}', FALSE, FALSE, 26),
('addon-zapier', 'Zapier', 'Automatiza con 5000+ apps', 'integrations', NULL, '⚡', NULL, 19, 182, '{}', FALSE, FALSE, 27),
('addon-api', 'API Completa', 'Acceso REST ilimitado', 'integrations', NULL, '🔌', NULL, 49, 470, '{}', FALSE, FALSE, 28),
('addon-storage-10', '+10 GB', 'Almacenamiento adicional', 'storage', NULL, '💾', NULL, 5, 48, '{}', FALSE, FALSE, 29),
('addon-storage-50', '+50 GB', 'Almacenamiento adicional', 'storage', NULL, '💾', NULL, 19, 182, '{}', FALSE, FALSE, 30),
('addon-storage-100', '+100 GB', 'Almacenamiento adicional', 'storage', NULL, '💾', NULL, 29, 278, '{}', FALSE, FALSE, 31),
('addon-storage-unlimited', 'Ilimitado', 'Sin límites', 'storage', NULL, '♾️', NULL, 99, 950, '{}', FALSE, FALSE, 32),
('addon-support-priority', 'Soporte Prioritario', 'Respuesta en 4h laborables', 'support', NULL, '⚡', NULL, 29, 278, '{}', FALSE, FALSE, 33),
('addon-support-dedicated', 'Soporte Dedicado', 'Account manager + SLA', 'support', NULL, '👤', NULL, 199, 1910, '{}', FALSE, FALSE, 34)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory, price_monthly = EXCLUDED.price_monthly,
  is_popular = EXCLUDED.is_popular, is_included_free = EXCLUDED.is_included_free,
  display_order = EXCLUDED.display_order, updated_at = NOW();

-- PASO 8: Helper function usando organization_id (la columna existente)
CREATE OR REPLACE FUNCTION org_has_module(p_org_id UUID, p_module_code VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE v_plan_code VARCHAR; v_included TEXT[]; v_selected TEXT[];
BEGIN
  SELECT sp.code, sp.included_modules, s.selected_modules INTO v_plan_code, v_included, v_selected
  FROM subscriptions s 
  JOIN subscription_plans sp ON sp.id = s.product_id
  WHERE s.organization_id = p_org_id AND s.status IN ('active', 'trialing');
  IF NOT FOUND THEN RETURN FALSE; END IF;
  IF v_plan_code = 'enterprise' THEN RETURN TRUE; END IF;
  RETURN p_module_code = ANY(v_included) OR p_module_code = ANY(v_selected);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION org_has_addon(p_org_id UUID, p_addon_code VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM tenant_addons WHERE tenant_id = p_org_id AND addon_code = p_addon_code AND status IN ('active', 'trialing'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 9: RLS para platform_addons
ALTER TABLE platform_addons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Platform addons public read" ON platform_addons;
CREATE POLICY "Platform addons public read" ON platform_addons FOR SELECT USING (true);

-- RLS para tenant_addons
ALTER TABLE tenant_addons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant addons org access" ON tenant_addons;
CREATE POLICY "Tenant addons org access" ON tenant_addons FOR SELECT
USING (tenant_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));