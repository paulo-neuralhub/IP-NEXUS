-- ============================================
-- PROMPT 31: SETTINGS COMPLETE
-- ============================================

-- ============================================
-- 1. ORGANIZATION SETTINGS
-- ============================================

CREATE TABLE organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  general JSONB DEFAULT '{}',
  branding JSONB DEFAULT '{}',
  regional JSONB DEFAULT '{}',
  security JSONB DEFAULT '{}',
  email JSONB DEFAULT '{}',
  modules JSONB DEFAULT '{}',
  defaults JSONB DEFAULT '{}',
  integrations JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_org_settings_org ON organization_settings(organization_id);

-- ============================================
-- 2. USER SETTINGS
-- ============================================

CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  profile JSONB DEFAULT '{}',
  display JSONB DEFAULT '{}',
  security JSONB DEFAULT '{}',
  dashboard JSONB DEFAULT '{}',
  shortcuts JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_settings_user ON user_settings(user_id);

-- ============================================
-- 3. OAUTH APPLICATIONS
-- ============================================

CREATE TABLE oauth_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  client_id VARCHAR(100) NOT NULL UNIQUE,
  client_secret_hash VARCHAR(255) NOT NULL,
  redirect_uris JSONB NOT NULL DEFAULT '[]',
  homepage_url VARCHAR(500),
  privacy_policy_url VARCHAR(500),
  terms_of_service_url VARCHAR(500),
  allowed_scopes JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  total_authorizations INTEGER DEFAULT 0,
  active_tokens INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_oauth_apps_org ON oauth_applications(organization_id, is_active);

-- ============================================
-- 4. ACTIVE SESSIONS
-- ============================================

CREATE TABLE active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  session_token_hash VARCHAR(255) NOT NULL,
  refresh_token_hash VARCHAR(255),
  device_info JSONB DEFAULT '{}',
  ip_address VARCHAR(50),
  location JSONB,
  is_active BOOLEAN DEFAULT true,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_active_sessions_user ON active_sessions(user_id, is_active);

-- ============================================
-- 5. SETTINGS AUDIT LOG
-- ============================================

CREATE TABLE settings_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  changes JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settings_audit ON settings_audit_log(organization_id, created_at DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_audit_log ENABLE ROW LEVEL SECURITY;

-- Organization Settings
CREATE POLICY "org_settings_select" ON organization_settings FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));

CREATE POLICY "org_settings_all" ON organization_settings FOR ALL
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- User Settings
CREATE POLICY "user_settings_all" ON user_settings FOR ALL USING (user_id = auth.uid());

-- OAuth Applications
CREATE POLICY "oauth_apps_select" ON oauth_applications FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));

CREATE POLICY "oauth_apps_all" ON oauth_applications FOR ALL
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Active Sessions
CREATE POLICY "sessions_all" ON active_sessions FOR ALL USING (user_id = auth.uid());

-- Settings Audit
CREATE POLICY "audit_select" ON settings_audit_log FOR SELECT
  USING (user_id = auth.uid() OR organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER org_settings_updated_at BEFORE UPDATE ON organization_settings
  FOR EACH ROW EXECUTE FUNCTION update_settings_timestamp();

CREATE TRIGGER user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_settings_timestamp();

CREATE TRIGGER oauth_apps_updated_at BEFORE UPDATE ON oauth_applications
  FOR EACH ROW EXECUTE FUNCTION update_settings_timestamp();

-- Auto-create organization_settings
CREATE OR REPLACE FUNCTION auto_create_org_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO organization_settings (organization_id) VALUES (NEW.id)
  ON CONFLICT (organization_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_org_settings AFTER INSERT ON organizations
  FOR EACH ROW EXECUTE FUNCTION auto_create_org_settings();

-- Auto-create user_settings
CREATE OR REPLACE FUNCTION auto_create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_user_settings AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION auto_create_user_settings();

-- ============================================
-- Insert settings for existing orgs/users
-- ============================================

INSERT INTO organization_settings (organization_id)
SELECT id FROM organizations
ON CONFLICT (organization_id) DO NOTHING;

INSERT INTO user_settings (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;