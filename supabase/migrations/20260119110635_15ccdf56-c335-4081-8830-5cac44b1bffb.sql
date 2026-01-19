-- ============================================
-- IP-COLLAB: PORTAL DE COLABORACIÓN PARA CLIENTES
-- ============================================

-- 1. PORTALES DE CLIENTE
CREATE TABLE client_portals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  portal_name VARCHAR(200),
  portal_slug VARCHAR(100) UNIQUE,
  branding_config JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  activated_at TIMESTAMPTZ,
  deactivated_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  total_logins INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portals_org ON client_portals(organization_id, is_active);
CREATE INDEX idx_portals_client ON client_portals(client_id);
CREATE UNIQUE INDEX idx_portals_slug ON client_portals(portal_slug) WHERE portal_slug IS NOT NULL;

-- 2. USUARIOS DEL PORTAL
CREATE TABLE portal_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES client_portals(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(50),
  job_title VARCHAR(100),
  password_hash VARCHAR(255),
  magic_link_token VARCHAR(255),
  magic_link_expires_at TIMESTAMPTZ,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret VARCHAR(100),
  role VARCHAR(30) DEFAULT 'viewer',
  permissions JSONB DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{}',
  status VARCHAR(30) DEFAULT 'invited',
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(portal_id, email)
);

CREATE INDEX idx_portal_users_portal ON portal_users(portal_id, status);
CREATE INDEX idx_portal_users_email ON portal_users(email);

-- 3. CONTENIDO COMPARTIDO
CREATE TABLE portal_shared_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES client_portals(id) ON DELETE CASCADE,
  content_type VARCHAR(30) NOT NULL,
  content_id UUID NOT NULL,
  permissions JSONB DEFAULT '{}',
  filters JSONB DEFAULT '{}',
  shared_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  shared_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_shared_content_portal ON portal_shared_content(portal_id, content_type);
CREATE INDEX idx_shared_content_ref ON portal_shared_content(content_type, content_id);

-- 4. SOLICITUDES DE APROBACIÓN
CREATE TABLE portal_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES client_portals(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  approval_type VARCHAR(50) NOT NULL,
  reference_type VARCHAR(30),
  reference_id UUID,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  details JSONB DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  response_options JSONB DEFAULT '["approve", "reject"]',
  status VARCHAR(30) DEFAULT 'pending',
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES portal_users(id),
  response VARCHAR(30),
  response_comment TEXT,
  due_date DATE,
  expires_at TIMESTAMPTZ,
  priority VARCHAR(20) DEFAULT 'normal',
  reminder_sent_at TIMESTAMPTZ,
  reminder_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_approvals_portal ON portal_approvals(portal_id, status);
CREATE INDEX idx_approvals_pending ON portal_approvals(status, due_date) WHERE status = 'pending';

-- 5. SOLICITUDES DE FIRMA
CREATE TABLE portal_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES client_portals(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  document_type VARCHAR(50) NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  document_file_id UUID,
  document_url TEXT,
  document_hash VARCHAR(64),
  signers JSONB NOT NULL DEFAULT '[]',
  signature_config JSONB DEFAULT '{}',
  status VARCHAR(30) DEFAULT 'pending',
  signed_document_file_id UUID,
  signed_document_url TEXT,
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_signatures_portal ON portal_signatures(portal_id, status);
CREATE INDEX idx_signatures_pending ON portal_signatures(status) WHERE status IN ('pending', 'partially_signed');

-- 6. COMENTARIOS Y MENSAJES
CREATE TABLE portal_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES client_portals(id) ON DELETE CASCADE,
  context_type VARCHAR(30) NOT NULL,
  context_id UUID,
  parent_id UUID REFERENCES portal_comments(id),
  thread_id UUID,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  mentions UUID[] DEFAULT '{}',
  author_type VARCHAR(20) NOT NULL,
  author_internal_id UUID REFERENCES auth.users(id),
  author_external_id UUID REFERENCES portal_users(id),
  author_name VARCHAR(200) NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_portal ON portal_comments(portal_id, context_type, context_id);
CREATE INDEX idx_comments_thread ON portal_comments(thread_id, created_at);

-- 7. NOTIFICACIONES DEL PORTAL
CREATE TABLE portal_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES client_portals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(300) NOT NULL,
  message TEXT,
  reference_type VARCHAR(30),
  reference_id UUID,
  link VARCHAR(500),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portal_notif_user ON portal_notifications(user_id, is_read, created_at DESC);

-- 8. LOG DE ACTIVIDAD DEL PORTAL
CREATE TABLE portal_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES client_portals(id) ON DELETE CASCADE,
  actor_type VARCHAR(20) NOT NULL,
  actor_internal_id UUID REFERENCES auth.users(id),
  actor_external_id UUID REFERENCES portal_users(id),
  actor_name VARCHAR(200),
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(30),
  resource_id UUID,
  resource_name VARCHAR(300),
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portal_activity_portal ON portal_activity_log(portal_id, created_at DESC);
CREATE INDEX idx_portal_activity_actor ON portal_activity_log(actor_external_id, created_at DESC);

-- 9. SESIONES DEL PORTAL
CREATE TABLE portal_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  refresh_token VARCHAR(255),
  ip_address VARCHAR(50),
  user_agent TEXT,
  device_info JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portal_sessions_user ON portal_sessions(user_id, is_active);
CREATE INDEX idx_portal_sessions_token ON portal_sessions(session_token) WHERE is_active = true;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE client_portals ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_shared_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for client_portals
CREATE POLICY "Users can view portals in their org"
  ON client_portals FOR SELECT
  USING (is_member_of_org(organization_id));

CREATE POLICY "Users can create portals in their org"
  ON client_portals FOR INSERT
  WITH CHECK (is_member_of_org(organization_id));

CREATE POLICY "Users can update portals in their org"
  ON client_portals FOR UPDATE
  USING (is_member_of_org(organization_id));

CREATE POLICY "Users can delete portals in their org"
  ON client_portals FOR DELETE
  USING (is_member_of_org(organization_id) AND get_user_role_in_org(organization_id) IN ('owner', 'admin'));

-- Policies for portal_users
CREATE POLICY "Users can view portal users for their org portals"
  ON portal_users FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM client_portals cp 
    WHERE cp.id = portal_id AND is_member_of_org(cp.organization_id)
  ));

CREATE POLICY "Users can manage portal users"
  ON portal_users FOR ALL
  USING (EXISTS (
    SELECT 1 FROM client_portals cp 
    WHERE cp.id = portal_id AND is_member_of_org(cp.organization_id)
  ));

-- Policies for portal_shared_content
CREATE POLICY "Users can manage shared content"
  ON portal_shared_content FOR ALL
  USING (EXISTS (
    SELECT 1 FROM client_portals cp 
    WHERE cp.id = portal_id AND is_member_of_org(cp.organization_id)
  ));

-- Policies for portal_approvals
CREATE POLICY "Users can view approvals in their org"
  ON portal_approvals FOR SELECT
  USING (is_member_of_org(organization_id));

CREATE POLICY "Users can manage approvals in their org"
  ON portal_approvals FOR ALL
  USING (is_member_of_org(organization_id));

-- Policies for portal_signatures
CREATE POLICY "Users can view signatures in their org"
  ON portal_signatures FOR SELECT
  USING (is_member_of_org(organization_id));

CREATE POLICY "Users can manage signatures in their org"
  ON portal_signatures FOR ALL
  USING (is_member_of_org(organization_id));

-- Policies for portal_comments
CREATE POLICY "Users can manage comments"
  ON portal_comments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM client_portals cp 
    WHERE cp.id = portal_id AND is_member_of_org(cp.organization_id)
  ));

-- Policies for portal_notifications
CREATE POLICY "Users can view notifications"
  ON portal_notifications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM client_portals cp 
    WHERE cp.id = portal_id AND is_member_of_org(cp.organization_id)
  ));

CREATE POLICY "Users can manage notifications"
  ON portal_notifications FOR ALL
  USING (EXISTS (
    SELECT 1 FROM client_portals cp 
    WHERE cp.id = portal_id AND is_member_of_org(cp.organization_id)
  ));

-- Policies for portal_activity_log
CREATE POLICY "Users can view activity logs"
  ON portal_activity_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM client_portals cp 
    WHERE cp.id = portal_id AND is_member_of_org(cp.organization_id)
  ));

CREATE POLICY "Users can insert activity logs"
  ON portal_activity_log FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM client_portals cp 
    WHERE cp.id = portal_id AND is_member_of_org(cp.organization_id)
  ));

-- Policies for portal_sessions (service role only for security)
CREATE POLICY "Service role can manage sessions"
  ON portal_sessions FOR ALL
  USING (true);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_portal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_portals_updated_at
  BEFORE UPDATE ON client_portals
  FOR EACH ROW EXECUTE FUNCTION update_portal_updated_at();

CREATE TRIGGER update_portal_users_updated_at
  BEFORE UPDATE ON portal_users
  FOR EACH ROW EXECUTE FUNCTION update_portal_updated_at();

CREATE TRIGGER update_portal_approvals_updated_at
  BEFORE UPDATE ON portal_approvals
  FOR EACH ROW EXECUTE FUNCTION update_portal_updated_at();

CREATE TRIGGER update_portal_signatures_updated_at
  BEFORE UPDATE ON portal_signatures
  FOR EACH ROW EXECUTE FUNCTION update_portal_updated_at();

CREATE TRIGGER update_portal_comments_updated_at
  BEFORE UPDATE ON portal_comments
  FOR EACH ROW EXECUTE FUNCTION update_portal_updated_at();