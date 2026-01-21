-- =====================================================
-- P64: SSO/SAML ENTERPRISE
-- Tablas para Single Sign-On con Azure AD, Google, Okta, SAML
-- =====================================================

-- Configuración SSO por organización
CREATE TABLE sso_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  
  -- Tipo de proveedor
  provider_type TEXT NOT NULL CHECK (provider_type IN (
    'azure_ad',
    'google_workspace',
    'okta',
    'saml_generic',
    'oidc_generic'
  )),
  
  -- Configuración SAML
  saml_entity_id TEXT,
  saml_sso_url TEXT,
  saml_slo_url TEXT,
  saml_certificate TEXT,
  saml_metadata_url TEXT,
  
  -- Configuración OIDC/OAuth
  oidc_client_id TEXT,
  oidc_client_secret_encrypted TEXT,
  oidc_issuer_url TEXT,
  oidc_authorization_url TEXT,
  oidc_token_url TEXT,
  oidc_userinfo_url TEXT,
  oidc_scopes TEXT DEFAULT 'openid email profile',
  
  -- Mapeo de atributos
  attribute_mapping JSONB DEFAULT '{
    "email": "email",
    "first_name": "given_name",
    "last_name": "family_name",
    "groups": "groups"
  }',
  
  -- Mapeo de roles (grupo IdP -> rol IP-NEXUS)
  role_mapping JSONB DEFAULT '{}',
  
  -- Opciones
  auto_provision_users BOOLEAN DEFAULT true,
  auto_update_users BOOLEAN DEFAULT true,
  default_role TEXT DEFAULT 'member',
  require_sso BOOLEAN DEFAULT false,
  allowed_domains TEXT[] DEFAULT '{}',
  
  -- Estado
  is_active BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sso_config_org ON sso_configurations(organization_id);
CREATE INDEX idx_sso_config_active ON sso_configurations(is_active) WHERE is_active = true;

-- RLS
ALTER TABLE sso_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage SSO config" ON sso_configurations
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Sesiones SSO para auditoría
CREATE TABLE sso_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sso_configuration_id UUID REFERENCES sso_configurations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Datos de la sesión
  session_index TEXT,
  name_id TEXT,
  
  -- Atributos recibidos del IdP
  attributes_received JSONB,
  
  -- Estado
  logged_in_at TIMESTAMPTZ DEFAULT NOW(),
  logged_out_at TIMESTAMPTZ,
  logout_reason TEXT,
  
  -- Contexto
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX idx_sso_sessions_user ON sso_sessions(user_id);
CREATE INDEX idx_sso_sessions_config ON sso_sessions(sso_configuration_id);
CREATE INDEX idx_sso_sessions_active ON sso_sessions(sso_configuration_id) 
  WHERE logged_out_at IS NULL;

-- RLS
ALTER TABLE sso_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own SSO sessions" ON sso_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins view org SSO sessions" ON sso_sessions
  FOR SELECT USING (
    sso_configuration_id IN (
      SELECT id FROM sso_configurations 
      WHERE organization_id IN (
        SELECT organization_id FROM memberships 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- SCIM Sync Logs (para sincronización automática de usuarios)
CREATE TABLE scim_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Operación
  operation TEXT CHECK (operation IN ('create', 'update', 'delete', 'sync')),
  resource_type TEXT CHECK (resource_type IN ('user', 'group')),
  
  -- Usuario afectado
  user_id UUID REFERENCES users(id),
  external_id TEXT,
  
  -- Resultado
  success BOOLEAN,
  error_message TEXT,
  changes_applied JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scim_logs_org ON scim_sync_logs(organization_id);
CREATE INDEX idx_scim_logs_created ON scim_sync_logs(created_at DESC);

-- RLS
ALTER TABLE scim_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view SCIM logs" ON scim_sync_logs
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_sso_configurations_updated_at
  BEFORE UPDATE ON sso_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for SSO config changes
ALTER PUBLICATION supabase_realtime ADD TABLE sso_configurations;