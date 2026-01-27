-- ============================================================
-- SUPER ADMIN SYSTEM
-- ============================================================

-- Tabla de Super Admins
CREATE TABLE IF NOT EXISTS super_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  permissions JSONB DEFAULT '{
    "backoffice": true,
    "demo": true,
    "impersonate_tenant": true,
    "simulate_subscription": true,
    "view_all_data": true,
    "manage_super_admins": true
  }',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  last_login_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_super_admins_email ON super_admins(email);
CREATE INDEX IF NOT EXISTS idx_super_admins_user_id ON super_admins(user_id);

-- RLS
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- Solo super admins pueden ver esta tabla
CREATE POLICY "Super admins can view super_admins" ON super_admins
FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid() AND is_active = TRUE)
);

-- ============================================================
-- Tabla de Sesiones Super Admin
-- ============================================================
CREATE TABLE IF NOT EXISTS super_admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_id UUID REFERENCES super_admins(id) ON DELETE CASCADE,
  current_mode VARCHAR(20) DEFAULT 'super_admin',
  simulated_tenant_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  simulated_subscription VARCHAR(30),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  UNIQUE(super_admin_id)
);

-- RLS
ALTER TABLE super_admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage their sessions" ON super_admin_sessions
FOR ALL USING (
  super_admin_id IN (SELECT id FROM super_admins WHERE user_id = auth.uid())
);

-- ============================================================
-- FUNCIÓN: Verificar si es Super Admin
-- ============================================================
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM super_admins
    WHERE user_id = auth.uid()
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- FUNCIÓN: Obtener permisos del Super Admin
-- ============================================================
CREATE OR REPLACE FUNCTION get_super_admin_permissions()
RETURNS JSONB AS $$
DECLARE
  v_permissions JSONB;
BEGIN
  SELECT permissions INTO v_permissions
  FROM super_admins
  WHERE user_id = auth.uid()
  AND is_active = TRUE;
  
  RETURN COALESCE(v_permissions, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- FUNCIÓN: Cambiar modo de Super Admin
-- ============================================================
CREATE OR REPLACE FUNCTION set_super_admin_mode(
  p_mode VARCHAR(20),
  p_tenant_id UUID DEFAULT NULL,
  p_subscription VARCHAR(30) DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_super_admin_id UUID;
BEGIN
  SELECT id INTO v_super_admin_id
  FROM super_admins
  WHERE user_id = auth.uid() AND is_active = TRUE;
  
  IF v_super_admin_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not a super admin');
  END IF;
  
  INSERT INTO super_admin_sessions (
    super_admin_id, current_mode, simulated_tenant_id, simulated_subscription,
    started_at, expires_at
  ) VALUES (
    v_super_admin_id, p_mode, p_tenant_id, p_subscription,
    NOW(), NOW() + INTERVAL '24 hours'
  )
  ON CONFLICT (super_admin_id) DO UPDATE SET
    current_mode = p_mode,
    simulated_tenant_id = p_tenant_id,
    simulated_subscription = p_subscription,
    started_at = NOW(),
    expires_at = NOW() + INTERVAL '24 hours';
  
  RETURN jsonb_build_object(
    'success', true,
    'mode', p_mode,
    'tenant_id', p_tenant_id,
    'subscription', p_subscription
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- FUNCIÓN: Obtener modo actual del Super Admin
-- ============================================================
CREATE OR REPLACE FUNCTION get_super_admin_mode()
RETURNS JSONB AS $$
DECLARE
  v_session RECORD;
BEGIN
  SELECT 
    sas.current_mode,
    sas.simulated_tenant_id,
    sas.simulated_subscription,
    o.name as tenant_name
  INTO v_session
  FROM super_admin_sessions sas
  JOIN super_admins sa ON sa.id = sas.super_admin_id
  LEFT JOIN organizations o ON o.id = sas.simulated_tenant_id
  WHERE sa.user_id = auth.uid()
  AND sas.expires_at > NOW();
  
  IF v_session IS NULL THEN
    RETURN jsonb_build_object(
      'mode', 'super_admin',
      'is_super_admin', is_super_admin()
    );
  END IF;
  
  RETURN jsonb_build_object(
    'mode', v_session.current_mode,
    'tenant_id', v_session.simulated_tenant_id,
    'tenant_name', v_session.tenant_name,
    'subscription', v_session.simulated_subscription,
    'is_super_admin', TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- FUNCIÓN: Obtener tenant_id efectivo (para simulación)
-- ============================================================
CREATE OR REPLACE FUNCTION get_effective_tenant_id()
RETURNS UUID AS $$
DECLARE
  v_simulated UUID;
  v_user_tenant UUID;
BEGIN
  SELECT sas.simulated_tenant_id INTO v_simulated
  FROM super_admin_sessions sas
  JOIN super_admins sa ON sa.id = sas.super_admin_id
  WHERE sa.user_id = auth.uid()
  AND sas.current_mode = 'simulate'
  AND sas.simulated_tenant_id IS NOT NULL
  AND sas.expires_at > NOW();
  
  IF v_simulated IS NOT NULL THEN
    RETURN v_simulated;
  END IF;
  
  SELECT organization_id INTO v_user_tenant
  FROM memberships
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN v_user_tenant;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- FUNCIÓN: Obtener suscripción efectiva (para simulación)
-- ============================================================
CREATE OR REPLACE FUNCTION get_effective_subscription()
RETURNS VARCHAR AS $$
DECLARE
  v_simulated VARCHAR;
  v_real VARCHAR;
BEGIN
  SELECT sas.simulated_subscription INTO v_simulated
  FROM super_admin_sessions sas
  JOIN super_admins sa ON sa.id = sas.super_admin_id
  WHERE sa.user_id = auth.uid()
  AND sas.current_mode = 'simulate'
  AND sas.simulated_subscription IS NOT NULL
  AND sas.expires_at > NOW();
  
  IF v_simulated IS NOT NULL THEN
    RETURN v_simulated;
  END IF;
  
  SELECT o.plan INTO v_real
  FROM organizations o
  JOIN memberships m ON m.organization_id = o.id
  WHERE m.user_id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(v_real, 'starter');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;