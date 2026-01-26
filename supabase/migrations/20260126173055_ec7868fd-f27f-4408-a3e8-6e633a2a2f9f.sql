-- =============================================
-- L60-A: Portal Cliente - Estructura Base
-- Solo se crean las tablas que NO existen aún
-- =============================================

-- 1. Tabla de mensajes del portal (cliente <-> despacho)
CREATE TABLE IF NOT EXISTS public.portal_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES client_portals(id) ON DELETE CASCADE,
  portal_user_id UUID REFERENCES portal_users(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
  
  -- Conversación (thread)
  thread_id UUID,
  parent_id UUID REFERENCES portal_messages(id) ON DELETE CASCADE,
  
  -- Dirección
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  -- inbound = cliente escribió, outbound = despacho respondió
  
  -- Contenido
  subject VARCHAR(255),
  body TEXT NOT NULL,
  
  -- Adjuntos
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Estado
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'delivered', 'read', 'replied')),
  read_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  replied_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Configuración del portal por tenant
CREATE TABLE IF NOT EXISTS public.portal_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  
  -- Activación global
  is_enabled BOOLEAN DEFAULT TRUE,
  
  -- Personalización por defecto
  default_portal_name VARCHAR(100),
  welcome_message TEXT,
  default_logo_url TEXT,
  default_primary_color VARCHAR(7) DEFAULT '#3B82F6',
  
  -- Dominio personalizado (opcional)
  custom_domain VARCHAR(255),
  
  -- Funcionalidades activadas por defecto
  features JSONB DEFAULT '{
    "show_matters": true,
    "show_documents": true,
    "show_deadlines": true,
    "show_invoices": true,
    "show_catalog": true,
    "allow_messages": true,
    "allow_document_upload": false,
    "allow_payments": false
  }'::jsonb,
  
  -- Notificaciones
  notify_on_new_message BOOLEAN DEFAULT TRUE,
  notify_on_document_shared BOOLEAN DEFAULT TRUE,
  notify_email TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices para portal_messages
CREATE INDEX IF NOT EXISTS idx_portal_messages_portal ON portal_messages(portal_id);
CREATE INDEX IF NOT EXISTS idx_portal_messages_user ON portal_messages(portal_user_id);
CREATE INDEX IF NOT EXISTS idx_portal_messages_thread ON portal_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_portal_messages_matter ON portal_messages(matter_id);
CREATE INDEX IF NOT EXISTS idx_portal_messages_status ON portal_messages(status);
CREATE INDEX IF NOT EXISTS idx_portal_messages_created ON portal_messages(created_at DESC);

-- 4. RLS para portal_messages
ALTER TABLE portal_messages ENABLE ROW LEVEL SECURITY;

-- Política: Los miembros de la org pueden ver mensajes de sus portales
CREATE POLICY "Org members can view portal messages"
  ON portal_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_portals cp
      JOIN memberships m ON m.organization_id = cp.organization_id
      WHERE cp.id = portal_messages.portal_id
      AND m.user_id = auth.uid()
    )
  );

-- Política: Los miembros pueden crear mensajes (outbound)
CREATE POLICY "Org members can create portal messages"
  ON portal_messages FOR INSERT
  WITH CHECK (
    direction = 'outbound' AND
    EXISTS (
      SELECT 1 FROM client_portals cp
      JOIN memberships m ON m.organization_id = cp.organization_id
      WHERE cp.id = portal_messages.portal_id
      AND m.user_id = auth.uid()
    )
  );

-- Política: Los miembros pueden actualizar mensajes
CREATE POLICY "Org members can update portal messages"
  ON portal_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM client_portals cp
      JOIN memberships m ON m.organization_id = cp.organization_id
      WHERE cp.id = portal_messages.portal_id
      AND m.user_id = auth.uid()
    )
  );

-- 5. RLS para portal_settings
ALTER TABLE portal_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view portal settings"
  ON portal_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.organization_id = portal_settings.organization_id
      AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can manage portal settings"
  ON portal_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.organization_id = portal_settings.organization_id
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
    )
  );

-- 6. Función: Verificar acceso del usuario del portal a un expediente
CREATE OR REPLACE FUNCTION public.portal_user_can_access_matter(
  p_portal_user_id UUID,
  p_matter_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_portal_id UUID;
  v_client_id UUID;
BEGIN
  -- Obtener portal_id y client_id del usuario
  SELECT pu.portal_id INTO v_portal_id
  FROM portal_users pu
  WHERE pu.id = p_portal_user_id AND pu.status = 'active';
  
  IF v_portal_id IS NULL THEN RETURN FALSE; END IF;
  
  -- Obtener client_id del portal
  SELECT cp.client_id INTO v_client_id
  FROM client_portals cp
  WHERE cp.id = v_portal_id AND cp.is_active = TRUE;
  
  IF v_client_id IS NULL THEN RETURN FALSE; END IF;
  
  -- Verificar que el expediente pertenece al cliente
  RETURN EXISTS (
    SELECT 1 FROM matters 
    WHERE id = p_matter_id AND client_id = v_client_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Función: Obtener expedientes visibles para usuario del portal
CREATE OR REPLACE FUNCTION public.get_portal_user_matters(p_portal_user_id UUID)
RETURNS TABLE (
  id UUID,
  reference VARCHAR,
  title VARCHAR,
  status VARCHAR,
  ip_type VARCHAR,
  jurisdiction VARCHAR,
  created_at TIMESTAMPTZ,
  deadline_count BIGINT
) AS $$
DECLARE
  v_client_id UUID;
BEGIN
  -- Obtener client_id del portal del usuario
  SELECT cp.client_id INTO v_client_id
  FROM portal_users pu
  JOIN client_portals cp ON cp.id = pu.portal_id
  WHERE pu.id = p_portal_user_id 
  AND pu.status = 'active'
  AND cp.is_active = TRUE;
  
  IF v_client_id IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    m.id, 
    m.reference::VARCHAR, 
    m.title::VARCHAR, 
    m.status::VARCHAR, 
    m.ip_type::VARCHAR,
    m.jurisdiction::VARCHAR,
    m.created_at,
    COALESCE(COUNT(e.id) FILTER (WHERE e.event_date > NOW()), 0)::BIGINT as deadline_count
  FROM matters m
  LEFT JOIN matter_events e ON e.matter_id = m.id AND e.event_type = 'deadline'
  WHERE m.client_id = v_client_id
  GROUP BY m.id
  ORDER BY m.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. Función: Obtener mensajes del portal para un usuario
CREATE OR REPLACE FUNCTION public.get_portal_user_messages(p_portal_user_id UUID)
RETURNS TABLE (
  id UUID,
  thread_id UUID,
  subject VARCHAR,
  body TEXT,
  direction VARCHAR,
  status VARCHAR,
  matter_id UUID,
  matter_reference VARCHAR,
  sender_name VARCHAR,
  created_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
) AS $$
DECLARE
  v_portal_id UUID;
BEGIN
  SELECT portal_id INTO v_portal_id
  FROM portal_users
  WHERE id = p_portal_user_id AND status = 'active';
  
  IF v_portal_id IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    pm.id,
    pm.thread_id,
    pm.subject::VARCHAR,
    pm.body,
    pm.direction::VARCHAR,
    pm.status::VARCHAR,
    pm.matter_id,
    m.reference::VARCHAR as matter_reference,
    CASE 
      WHEN pm.direction = 'inbound' THEN pu.name::VARCHAR
      ELSE u.full_name::VARCHAR
    END as sender_name,
    pm.created_at,
    pm.read_at
  FROM portal_messages pm
  LEFT JOIN matters m ON m.id = pm.matter_id
  LEFT JOIN portal_users pu ON pu.id = pm.portal_user_id
  LEFT JOIN auth.users u ON u.id = pm.replied_by
  WHERE pm.portal_id = v_portal_id
  ORDER BY pm.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_portal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_portal_messages_updated_at
  BEFORE UPDATE ON portal_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_portal_updated_at();

CREATE TRIGGER update_portal_settings_updated_at
  BEFORE UPDATE ON portal_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_portal_updated_at();

-- 10. Comentarios para documentación
COMMENT ON TABLE portal_messages IS 'Mensajes entre clientes (portal) y el despacho';
COMMENT ON TABLE portal_settings IS 'Configuración del portal de cliente por organización';
COMMENT ON FUNCTION portal_user_can_access_matter IS 'Verifica si un usuario de portal tiene acceso a un expediente';
COMMENT ON FUNCTION get_portal_user_matters IS 'Obtiene los expedientes visibles para un usuario de portal';