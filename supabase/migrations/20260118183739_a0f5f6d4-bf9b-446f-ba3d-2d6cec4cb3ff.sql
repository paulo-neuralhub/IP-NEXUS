-- =====================================================
-- PROMPT 8A: BACKOFFICE - Base de Datos
-- =====================================================

-- =====================================================
-- PLANES DE SUSCRIPCIÓN
-- =====================================================
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Precios
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  
  -- Límites
  limits JSONB NOT NULL DEFAULT '{}',
  
  -- Features incluidas
  features JSONB NOT NULL DEFAULT '[]',
  
  -- Display
  is_popular BOOLEAN DEFAULT false,
  is_enterprise BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SUSCRIPCIONES (NUEVA - reemplaza la antigua)
-- =====================================================
-- Primero eliminamos la tabla antigua si existe
DROP TABLE IF EXISTS subscriptions CASCADE;

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  
  -- Estado
  status TEXT NOT NULL DEFAULT 'active',
  
  -- Periodo
  billing_cycle TEXT DEFAULT 'monthly',
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
  
  -- Trial
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  
  -- Pago (Stripe)
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  
  -- Cancelación
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id)
);

-- =====================================================
-- HISTORIAL DE SUSCRIPCIONES
-- =====================================================
CREATE TABLE subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Cambio
  event_type TEXT NOT NULL,
  
  -- Detalles
  previous_plan_id UUID REFERENCES subscription_plans(id),
  new_plan_id UUID REFERENCES subscription_plans(id),
  amount DECIMAL(10,2),
  currency TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FEATURE FLAGS
-- =====================================================
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Estado global
  is_enabled BOOLEAN DEFAULT false,
  
  -- Rollout
  rollout_percentage INT DEFAULT 0,
  
  -- Targeting
  enabled_for_plans TEXT[] DEFAULT '{}',
  enabled_for_orgs UUID[] DEFAULT '{}',
  enabled_for_users UUID[] DEFAULT '{}',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CONFIGURACIÓN GLOBAL
-- =====================================================
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Clave-valor
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  
  -- Categoría
  category TEXT NOT NULL DEFAULT 'general',
  
  -- Descripción
  description TEXT,
  
  -- Tipo para UI
  value_type TEXT DEFAULT 'string',
  
  -- Validación
  is_required BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- =====================================================
-- LOGS DE AUDITORÍA
-- =====================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Actor
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  
  -- Acción
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  
  -- Detalles
  description TEXT,
  changes JSONB,
  metadata JSONB DEFAULT '{}',
  
  -- Contexto
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INVITACIONES PENDIENTES
-- =====================================================
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Invitado
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  
  -- Token
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  
  -- Estado
  status TEXT DEFAULT 'pending',
  
  -- Fechas
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  
  -- Auditoría
  invited_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, email)
);

-- =====================================================
-- MÉTRICAS DE USO
-- =====================================================
CREATE TABLE usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Periodo
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Contadores
  metrics JSONB NOT NULL DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, period_start)
);

-- =====================================================
-- NOTIFICACIONES DEL SISTEMA
-- =====================================================
CREATE TABLE system_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contenido
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  
  -- Targeting
  target_audience TEXT DEFAULT 'all',
  target_plans TEXT[] DEFAULT '{}',
  target_orgs UUID[] DEFAULT '{}',
  
  -- Fechas
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  
  -- Display
  is_dismissible BOOLEAN DEFAULT true,
  show_on_dashboard BOOLEAN DEFAULT true,
  show_as_banner BOOLEAN DEFAULT false,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FEEDBACK DE USUARIOS
-- =====================================================
CREATE TABLE user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  
  -- Contenido
  type TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Contexto
  page_url TEXT,
  screenshot_url TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Estado
  status TEXT DEFAULT 'new',
  priority TEXT DEFAULT 'normal',
  
  -- Respuesta
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SUPERADMINS
-- =====================================================
CREATE TABLE superadmins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Permisos
  permissions JSONB DEFAULT '["all"]',
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  UNIQUE(user_id)
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

CREATE INDEX idx_subscription_history_sub ON subscription_history(subscription_id);
CREATE INDEX idx_subscription_history_org ON subscription_history(organization_id);
CREATE INDEX idx_subscription_history_date ON subscription_history(created_at DESC);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at DESC);

CREATE INDEX idx_invitations_org ON invitations(organization_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_status ON invitations(status);

CREATE INDEX idx_usage_metrics_org ON usage_metrics(organization_id);
CREATE INDEX idx_usage_metrics_period ON usage_metrics(period_start);

CREATE INDEX idx_user_feedback_status ON user_feedback(status);
CREATE INDEX idx_user_feedback_type ON user_feedback(type);

-- =====================================================
-- RLS
-- =====================================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Subscriptions: org members can view
CREATE POLICY "Org view subscription" ON subscriptions FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

-- Subscription history: org admins can view
CREATE POLICY "Org admins view history" ON subscription_history FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- Audit logs: org admins can view their org's logs
CREATE POLICY "Org admins view audit" ON audit_logs FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- Invitations: org admins manage
CREATE POLICY "Org admins manage invitations" ON invitations FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- Usage metrics: org members view
CREATE POLICY "Org view metrics" ON usage_metrics FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

-- Feedback: users manage own
CREATE POLICY "Users manage own feedback" ON user_feedback FOR ALL USING (
  user_id = auth.uid()
);

-- Public tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public plans" ON subscription_plans FOR SELECT USING (is_active = true);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public flags" ON feature_flags FOR SELECT USING (true);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public settings" ON system_settings FOR SELECT USING (is_public = true);

ALTER TABLE system_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active announcements" ON system_announcements FOR SELECT USING (
  is_active = true AND starts_at <= NOW() AND (ends_at IS NULL OR ends_at > NOW())
);

ALTER TABLE superadmins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Superadmins view self" ON superadmins FOR SELECT USING (
  user_id = auth.uid()
);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Log de auditoría automático para cambios críticos
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    organization_id,
    action,
    resource_type,
    resource_id,
    changes
  ) VALUES (
    auth.uid(),
    COALESCE(NEW.organization_id, OLD.organization_id),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE 
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object(
        'old', to_jsonb(OLD),
        'new', to_jsonb(NEW)
      )
      WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
      ELSE to_jsonb(NEW)
    END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Aplicar a tablas críticas
CREATE TRIGGER audit_subscriptions
  AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_memberships
  AFTER INSERT OR UPDATE OR DELETE ON memberships
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Crear suscripción al crear organización
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  SELECT id INTO free_plan_id FROM subscription_plans WHERE code = 'free' LIMIT 1;
  
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO subscriptions (
      organization_id,
      plan_id,
      status,
      current_period_start,
      current_period_end
    ) VALUES (
      NEW.id,
      free_plan_id,
      'active',
      NOW(),
      NOW() + INTERVAL '100 years'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER org_default_subscription
  AFTER INSERT ON organizations
  FOR EACH ROW EXECUTE FUNCTION create_default_subscription();

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Planes de suscripción
INSERT INTO subscription_plans (code, name, description, price_monthly, price_yearly, limits, features, is_popular, sort_order) VALUES

('free', 'Free', 'Para probar la plataforma', 0, 0, 
'{
  "max_users": 1,
  "max_matters": 25,
  "max_storage_gb": 1,
  "max_contacts": 100,
  "max_ai_messages_day": 10,
  "max_ai_docs_month": 5,
  "max_email_campaigns_month": 0,
  "max_watchlists": 2
}',
'["docket", "crm_basic"]',
false, 1),

('professional', 'Professional', 'Para profesionales independientes', 49, 490, 
'{
  "max_users": 3,
  "max_matters": 250,
  "max_storage_gb": 10,
  "max_contacts": 1000,
  "max_ai_messages_day": 100,
  "max_ai_docs_month": 50,
  "max_email_campaigns_month": 10,
  "max_watchlists": 25
}',
'["docket", "crm", "spider", "genius", "finance", "marketing_basic"]',
true, 2),

('business', 'Business', 'Para equipos y despachos', 149, 1490, 
'{
  "max_users": 15,
  "max_matters": 1000,
  "max_storage_gb": 50,
  "max_contacts": 10000,
  "max_ai_messages_day": 500,
  "max_ai_docs_month": 200,
  "max_email_campaigns_month": 50,
  "max_watchlists": 100
}',
'["docket", "crm", "spider", "genius", "finance", "marketing", "api_access", "audit_logs"]',
false, 3),

('enterprise', 'Enterprise', 'Solución completa para grandes organizaciones', 0, 0, 
'{
  "max_users": -1,
  "max_matters": -1,
  "max_storage_gb": -1,
  "max_contacts": -1,
  "max_ai_messages_day": -1,
  "max_ai_docs_month": -1,
  "max_email_campaigns_month": -1,
  "max_watchlists": -1
}',
'["docket", "crm", "spider", "genius", "finance", "marketing", "api_access", "audit_logs", "custom_branding", "priority_support", "dedicated_account_manager", "sso", "custom_integrations"]',
false, 4)

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  limits = EXCLUDED.limits,
  features = EXCLUDED.features;

-- Feature flags iniciales
INSERT INTO feature_flags (code, name, description, is_enabled, enabled_for_plans) VALUES
('new_dashboard', 'Nuevo Dashboard', 'Nuevo diseño del dashboard principal', false, '{}'),
('ai_vision', 'IA con visión', 'Análisis de imágenes con IA', false, '{"business", "enterprise"}'),
('blockchain_timestamp', 'Blockchain Timestamp', 'Timestamping en blockchain', false, '{"enterprise"}'),
('api_v2', 'API v2', 'Nueva versión de la API', true, '{"business", "enterprise"}'),
('dark_mode', 'Modo oscuro', 'Tema oscuro de la interfaz', true, '{}')
ON CONFLICT (code) DO NOTHING;

-- Configuración del sistema
INSERT INTO system_settings (key, value, category, description, value_type, is_public) VALUES
('app_name', '"IP-NEXUS"', 'general', 'Nombre de la aplicación', 'string', true),
('app_logo_url', '"/logo.svg"', 'general', 'URL del logo', 'string', true),
('support_email', '"support@ip-nexus.com"', 'general', 'Email de soporte', 'string', true),
('default_language', '"es"', 'general', 'Idioma por defecto', 'string', true),
('trial_days', '14', 'billing', 'Días de prueba gratuita', 'number', false),
('stripe_webhook_secret', '""', 'integrations', 'Stripe webhook secret', 'secret', false),
('sendgrid_api_key', '""', 'integrations', 'SendGrid API key', 'secret', false),
('max_file_upload_mb', '50', 'limits', 'Tamaño máximo de archivo (MB)', 'number', true),
('session_timeout_hours', '24', 'security', 'Timeout de sesión (horas)', 'number', false)
ON CONFLICT (key) DO NOTHING;