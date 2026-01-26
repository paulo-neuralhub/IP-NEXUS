-- =============================================
-- L56-SQL-REVISED: Completar estructura Planes/Módulos/Add-ons
-- =============================================

-- =============================================
-- 1. Añadir columnas faltantes a subscription_plans
-- =============================================

ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS max_modules INTEGER DEFAULT 1;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS max_addons INTEGER DEFAULT 0;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS included_addons TEXT[] DEFAULT '{}';
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS requires_contact BOOLEAN DEFAULT FALSE;

-- =============================================
-- 2. Añadir columnas faltantes a platform_modules
-- =============================================

ALTER TABLE platform_modules ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE platform_modules ADD COLUMN IF NOT EXISTS section VARCHAR(50);
ALTER TABLE platform_modules ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]';
ALTER TABLE platform_modules ADD COLUMN IF NOT EXISTS price_monthly DECIMAL(10,2);
ALTER TABLE platform_modules ADD COLUMN IF NOT EXISTS price_yearly DECIMAL(10,2);
ALTER TABLE platform_modules ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- =============================================
-- 3. Crear tabla platform_addons
-- =============================================

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

-- =============================================
-- 4. Crear tabla tenant_addons
-- =============================================

CREATE TABLE IF NOT EXISTS tenant_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  addon_code VARCHAR(50) NOT NULL,
  
  status VARCHAR(20) DEFAULT 'active',
  access_type VARCHAR(20) DEFAULT 'paid',
  
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  trial_ends_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  stripe_subscription_item_id VARCHAR(255),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, addon_code)
);

CREATE INDEX IF NOT EXISTS idx_tenant_addons_tenant ON tenant_addons(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_addons_status ON tenant_addons(status);

-- =============================================
-- 5. Añadir columnas a tenant_subscriptions si faltan
-- =============================================

ALTER TABLE tenant_subscriptions ADD COLUMN IF NOT EXISTS selected_modules TEXT[] DEFAULT '{}';

-- =============================================
-- 6. Seeds de Add-ons
-- =============================================

INSERT INTO platform_addons (
  code, name, description, category, subcategory,
  icon, flag_emoji, price_monthly, price_yearly,
  applies_to_modules, is_popular, is_included_free, display_order
) VALUES
-- JURISDICCIONES PI
('addon-jur-spain', 'España (OEPM)', 'Oficina Española de Patentes y Marcas', 'jurisdictions', 'ip', '🏛️', '🇪🇸', 0, 0, '{docket, spider}', FALSE, TRUE, 1),
('addon-jur-eu', 'Unión Europea (EUIPO)', 'Marcas y diseños comunitarios', 'jurisdictions', 'ip', '🏛️', '🇪🇺', 19, 182, '{docket, spider}', TRUE, FALSE, 2),
('addon-jur-wipo', 'Internacional (WIPO)', 'Sistema de Madrid y PCT', 'jurisdictions', 'ip', '🏛️', '🌐', 29, 278, '{docket, spider}', TRUE, FALSE, 3),
('addon-jur-us', 'Estados Unidos (USPTO)', 'Patentes y marcas USA', 'jurisdictions', 'ip', '🏛️', '🇺🇸', 29, 278, '{docket, spider}', FALSE, FALSE, 4),
('addon-jur-uk', 'Reino Unido (UKIPO)', 'Oficina de PI del Reino Unido', 'jurisdictions', 'ip', '🏛️', '🇬🇧', 19, 182, '{docket, spider}', FALSE, FALSE, 5),
('addon-jur-de', 'Alemania (DPMA)', 'Oficina Alemana de Patentes', 'jurisdictions', 'ip', '🏛️', '🇩🇪', 19, 182, '{docket, spider}', FALSE, FALSE, 6),
('addon-jur-fr', 'Francia (INPI)', 'Instituto Nacional PI Francia', 'jurisdictions', 'ip', '🏛️', '🇫🇷', 19, 182, '{docket, spider}', FALSE, FALSE, 7),
('addon-jur-cn', 'China (CNIPA)', 'Administración Nacional PI China', 'jurisdictions', 'ip', '🏛️', '🇨🇳', 39, 374, '{docket, spider}', FALSE, FALSE, 8),
('addon-jur-latam', 'Latinoamérica', 'MX, BR, AR, CL, CO', 'jurisdictions', 'ip', '🏛️', '🌎', 49, 470, '{docket, spider}', FALSE, FALSE, 9),

-- JURISDICCIONES LEGAL (GENIUS)
('addon-legal-spain', 'Legislación España', 'Ley de Marcas, Patentes, Diseños', 'jurisdictions', 'legal', '⚖️', '🇪🇸', 0, 0, '{genius}', FALSE, TRUE, 10),
('addon-legal-eu', 'Legislación UE', 'Reglamentos EUTM, Diseños, Directivas', 'jurisdictions', 'legal', '⚖️', '🇪🇺', 19, 182, '{genius}', FALSE, FALSE, 11),
('addon-legal-us', 'Legislación USA', 'Lanham Act, Patent Act', 'jurisdictions', 'legal', '⚖️', '🇺🇸', 29, 278, '{genius}', FALSE, FALSE, 12),
('addon-legal-intl', 'Tratados Internacionales', 'París, ADPIC, Madrid, PCT', 'jurisdictions', 'legal', '⚖️', '🌐', 19, 182, '{genius}', FALSE, FALSE, 13),

-- SPIDER TERRITORIOS
('addon-spider-eu', 'Europa', 'EUIPO + oficinas nacionales', 'jurisdictions', 'spider', '🔍', '🇪🇺', 0, 0, '{spider}', FALSE, TRUE, 14),
('addon-spider-us', 'Norteamérica', 'USPTO + CIPO', 'jurisdictions', 'spider', '🔍', '🇺🇸', 19, 182, '{spider}', FALSE, FALSE, 15),
('addon-spider-asia', 'Asia-Pacífico', 'CN, JP, KR, AU', 'jurisdictions', 'spider', '🔍', '🌏', 29, 278, '{spider}', FALSE, FALSE, 16),
('addon-spider-latam', 'Latinoamérica', 'BR, MX, AR y más', 'jurisdictions', 'spider', '🔍', '🌎', 19, 182, '{spider}', FALSE, FALSE, 17),
('addon-spider-social', 'Redes Sociales', 'Instagram, TikTok, Amazon', 'jurisdictions', 'spider', '📱', '📱', 29, 278, '{spider}', TRUE, FALSE, 18),
('addon-spider-domains', 'Dominios Web', 'Nuevos registros similares', 'jurisdictions', 'spider', '🌐', '🌐', 19, 182, '{spider}', FALSE, FALSE, 19),

-- COMUNICACIONES
('addon-email', 'Email Integrado', 'Envío y recepción desde plataforma', 'communications', NULL, '📧', NULL, 0, 0, '{communications, crm}', FALSE, TRUE, 20),
('addon-whatsapp', 'WhatsApp Business', 'Mensajería con clientes', 'communications', NULL, '💬', NULL, 29, 278, '{communications}', TRUE, FALSE, 21),
('addon-phone', 'Telefonía VoIP', 'Llamadas con Twilio', 'communications', NULL, '📞', NULL, 39, 374, '{communications}', TRUE, FALSE, 22),
('addon-sms', 'SMS', 'Notificaciones y alertas', 'communications', NULL, '📱', NULL, 19, 182, '{communications}', FALSE, FALSE, 23),

-- INTEGRACIONES
('addon-google', 'Google Workspace', 'Calendar, Drive, Gmail', 'integrations', NULL, '🔵', NULL, 0, 0, '{}', FALSE, TRUE, 24),
('addon-microsoft', 'Microsoft 365', 'Outlook, OneDrive, Teams', 'integrations', NULL, '🟦', NULL, 19, 182, '{}', FALSE, FALSE, 25),
('addon-slack', 'Slack', 'Notificaciones y comandos', 'integrations', NULL, '💜', NULL, 9, 86, '{}', FALSE, FALSE, 26),
('addon-zapier', 'Zapier', 'Automatiza con 5000+ apps', 'integrations', NULL, '⚡', NULL, 19, 182, '{}', FALSE, FALSE, 27),
('addon-api', 'API Completa', 'Acceso REST ilimitado', 'integrations', NULL, '🔌', NULL, 49, 470, '{}', FALSE, FALSE, 28),

-- ALMACENAMIENTO
('addon-storage-10', '+10 GB', 'Almacenamiento adicional', 'storage', NULL, '💾', NULL, 5, 48, '{}', FALSE, FALSE, 29),
('addon-storage-50', '+50 GB', 'Almacenamiento adicional', 'storage', NULL, '💾', NULL, 19, 182, '{}', FALSE, FALSE, 30),
('addon-storage-100', '+100 GB', 'Almacenamiento adicional', 'storage', NULL, '💾', NULL, 29, 278, '{}', FALSE, FALSE, 31),
('addon-storage-unlimited', 'Ilimitado', 'Sin límites', 'storage', NULL, '♾️', NULL, 99, 950, '{}', FALSE, FALSE, 32),

-- SOPORTE
('addon-support-priority', 'Soporte Prioritario', 'Respuesta en 4h laborables', 'support', NULL, '⚡', NULL, 29, 278, '{}', FALSE, FALSE, 33),
('addon-support-dedicated', 'Soporte Dedicado', 'Account manager + SLA', 'support', NULL, '👤', NULL, 199, 1910, '{}', FALSE, FALSE, 34)

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  price_monthly = EXCLUDED.price_monthly,
  is_popular = EXCLUDED.is_popular,
  updated_at = NOW();

-- =============================================
-- 7. Actualizar datos de planes existentes
-- =============================================

UPDATE subscription_plans SET
  max_modules = 1,
  max_addons = 0,
  included_addons = '{}',
  is_visible = TRUE,
  requires_contact = FALSE
WHERE code = 'free';

UPDATE subscription_plans SET
  max_modules = 1,
  max_addons = 2,
  included_addons = '{"addon-jur-spain", "addon-email"}',
  is_visible = TRUE,
  requires_contact = FALSE
WHERE code = 'basico';

UPDATE subscription_plans SET
  max_modules = 3,
  max_addons = 4,
  included_addons = '{"addon-jur-spain", "addon-jur-eu", "addon-email", "addon-google"}',
  is_visible = TRUE,
  requires_contact = FALSE
WHERE code = 'business';

UPDATE subscription_plans SET
  max_modules = -1,
  max_addons = 8,
  included_addons = '{"addon-jur-spain", "addon-jur-eu", "addon-jur-wipo", "addon-email", "addon-google", "addon-whatsapp"}',
  is_visible = TRUE,
  requires_contact = FALSE
WHERE code = 'empresarial';

UPDATE subscription_plans SET
  max_modules = -1,
  max_addons = -1,
  included_addons = '{}',
  is_visible = TRUE,
  requires_contact = TRUE
WHERE code = 'enterprise';

-- =============================================
-- 8. Actualizar datos de módulos existentes
-- =============================================

UPDATE platform_modules SET
  is_visible = TRUE,
  section = 'gestion',
  features = '[{"title": "Expedientes ilimitados", "icon": "Folder"}, {"title": "Plazos automáticos", "icon": "Calendar"}, {"title": "Documentos y archivos", "icon": "FileText"}]'::jsonb,
  display_order = 1
WHERE code = 'docket';

UPDATE platform_modules SET
  is_visible = TRUE,
  section = 'gestion',
  features = '[{"title": "Ficha completa cliente", "icon": "User"}, {"title": "Pipeline de ventas", "icon": "TrendingUp"}, {"title": "Actividades", "icon": "Activity"}]'::jsonb,
  display_order = 2
WHERE code = 'crm';

UPDATE platform_modules SET
  is_visible = TRUE,
  section = 'inteligencia',
  features = '[{"title": "Monitorización automática", "icon": "Radar"}, {"title": "Análisis IA", "icon": "Brain"}, {"title": "Alertas", "icon": "Bell"}]'::jsonb,
  display_order = 3
WHERE code = 'spider';

UPDATE platform_modules SET
  is_visible = TRUE,
  section = 'inteligencia',
  features = '[{"title": "Chat IA especializado", "icon": "MessageSquare"}, {"title": "Análisis documentos", "icon": "FileSearch"}, {"title": "Multi-idioma", "icon": "Languages"}]'::jsonb,
  display_order = 4
WHERE code = 'genius';

UPDATE platform_modules SET
  is_visible = TRUE,
  section = 'inteligencia',
  features = '[{"title": "Dashboards", "icon": "LayoutDashboard"}, {"title": "KPIs", "icon": "Activity"}, {"title": "Informes", "icon": "FileText"}]'::jsonb,
  display_order = 5
WHERE code = 'analytics';

UPDATE platform_modules SET
  is_visible = TRUE,
  section = 'operaciones',
  features = '[{"title": "Workflows", "icon": "GitBranch"}, {"title": "Plantillas", "icon": "FileText"}, {"title": "Automatización", "icon": "Wand2"}]'::jsonb,
  display_order = 6
WHERE code = 'legal-ops';

UPDATE platform_modules SET
  is_visible = TRUE,
  section = 'operaciones',
  features = '[{"title": "Facturación", "icon": "Receipt"}, {"title": "Presupuestos", "icon": "Calculator"}, {"title": "Cobros", "icon": "CreditCard"}]'::jsonb,
  display_order = 8
WHERE code = 'finance';

UPDATE platform_modules SET
  is_visible = TRUE,
  section = 'extensiones',
  features = '[{"title": "Bandeja unificada", "icon": "Inbox"}, {"title": "Email", "icon": "Mail"}, {"title": "Historial", "icon": "History"}]'::jsonb,
  display_order = 9
WHERE code = 'communications';

UPDATE platform_modules SET
  is_visible = TRUE,
  section = 'extensiones',
  features = '[{"title": "Acceso 24/7", "icon": "Clock"}, {"title": "Expedientes", "icon": "Eye"}, {"title": "Documentos", "icon": "Download"}]'::jsonb,
  display_order = 10
WHERE code = 'portal-cliente';

-- =============================================
-- 9. Funciones Helper
-- =============================================

CREATE OR REPLACE FUNCTION tenant_has_module(p_tenant_id UUID, p_module_code VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_code VARCHAR;
  v_included_modules TEXT[];
  v_selected_modules TEXT[];
BEGIN
  SELECT 
    ts.plan_code,
    sp.included_modules,
    COALESCE(ts.selected_modules, '{}')
  INTO v_plan_code, v_included_modules, v_selected_modules
  FROM tenant_subscriptions ts
  JOIN subscription_plans sp ON sp.code = ts.plan_code
  WHERE ts.tenant_id = p_tenant_id
    AND ts.status IN ('active', 'trialing');
    
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  IF v_plan_code = 'enterprise' THEN
    RETURN TRUE;
  END IF;
  
  RETURN p_module_code = ANY(v_included_modules) 
      OR p_module_code = ANY(v_selected_modules);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION tenant_has_addon(p_tenant_id UUID, p_addon_code VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tenant_addons
    WHERE tenant_id = p_tenant_id
      AND addon_code = p_addon_code
      AND status IN ('active', 'trialing')
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_tenant_modules_summary(p_tenant_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_plan RECORD;
  v_active_addons INTEGER;
BEGIN
  SELECT 
    sp.*,
    COALESCE(ts.selected_modules, '{}') as selected_modules,
    ts.status as sub_status
  INTO v_plan
  FROM tenant_subscriptions ts
  JOIN subscription_plans sp ON sp.code = ts.plan_code
  WHERE ts.tenant_id = p_tenant_id;
  
  IF NOT FOUND THEN
    RETURN '{}'::jsonb;
  END IF;
  
  SELECT COUNT(*) INTO v_active_addons
  FROM tenant_addons
  WHERE tenant_id = p_tenant_id
    AND status IN ('active', 'trialing')
    AND access_type = 'paid';
  
  v_result := jsonb_build_object(
    'plan_code', v_plan.code,
    'plan_name', v_plan.name,
    'max_modules', v_plan.max_modules,
    'max_addons', v_plan.max_addons,
    'included_modules', v_plan.included_modules,
    'selected_modules', v_plan.selected_modules,
    'active_addons_count', v_active_addons,
    'can_add_modules', v_plan.max_modules = -1 OR COALESCE(array_length(v_plan.selected_modules, 1), 0) < v_plan.max_modules,
    'can_add_addons', v_plan.max_addons = -1 OR v_active_addons < v_plan.max_addons
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 10. RLS para platform_addons y tenant_addons
-- =============================================

ALTER TABLE platform_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_addons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Addons are public" ON platform_addons;
CREATE POLICY "Addons are public" ON platform_addons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Tenant addons for members" ON tenant_addons;
CREATE POLICY "Tenant addons for members" ON tenant_addons FOR SELECT
USING (tenant_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Tenant addons insert for admins" ON tenant_addons;
CREATE POLICY "Tenant addons insert for admins" ON tenant_addons FOR INSERT
WITH CHECK (tenant_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

DROP POLICY IF EXISTS "Tenant addons update for admins" ON tenant_addons;
CREATE POLICY "Tenant addons update for admins" ON tenant_addons FOR UPDATE
USING (tenant_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));