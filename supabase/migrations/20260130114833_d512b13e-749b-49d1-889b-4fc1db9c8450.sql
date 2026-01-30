-- ============================================
-- L112: INTEGRACIÓN COMPLETA DE WHATSAPP
-- ============================================

-- ============================================
-- 1. CONFIGURACIÓN DE WHATSAPP POR TENANT
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_tenant_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  
  integration_type TEXT DEFAULT 'none',
  
  meta_phone_number_id TEXT,
  meta_business_account_id TEXT,
  meta_access_token TEXT,
  meta_webhook_verify_token TEXT,
  meta_app_id TEXT,
  meta_status TEXT DEFAULT 'not_configured',
  
  implementation_requested BOOLEAN DEFAULT false,
  implementation_request_date TIMESTAMPTZ,
  implementation_status TEXT DEFAULT 'none',
  implementation_notes TEXT,
  
  auto_reply_enabled BOOLEAN DEFAULT false,
  auto_reply_message TEXT DEFAULT 'Gracias por contactarnos. En breve le atenderemos.',
  business_hours_only BOOLEAN DEFAULT false,
  business_hours_start TIME DEFAULT '09:00',
  business_hours_end TIME DEFAULT '18:00',
  
  notify_new_messages BOOLEAN DEFAULT true,
  notify_email TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE whatsapp_tenant_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wa_config_select" ON whatsapp_tenant_config
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "wa_config_manage" ON whatsapp_tenant_config
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- ============================================
-- 2. SESIONES QR POR USUARIO
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_qr_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  status TEXT DEFAULT 'disconnected',
  phone_number TEXT,
  device_name TEXT,
  session_data JSONB,
  
  last_seen TIMESTAMPTZ,
  connected_at TIMESTAMPTZ,
  disconnected_at TIMESTAMPTZ,
  
  is_active BOOLEAN DEFAULT true,
  receive_notifications BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, user_id)
);

ALTER TABLE whatsapp_qr_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wa_qr_select" ON whatsapp_qr_sessions
  FOR SELECT USING (
    user_id = auth.uid() OR 
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "wa_qr_manage_own" ON whatsapp_qr_sessions
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- 3. MENSAJES DE WHATSAPP
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  wa_id TEXT NOT NULL,
  contact_name TEXT,
  contact_phone TEXT NOT NULL,
  client_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  
  message_id TEXT UNIQUE,
  direction TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  
  content TEXT,
  media_url TEXT,
  media_mime_type TEXT,
  media_filename TEXT,
  media_caption TEXT,
  
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  location_name TEXT,
  
  status TEXT DEFAULT 'received',
  error_message TEXT,
  
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  read_by UUID REFERENCES auth.users(id),
  sent_by UUID REFERENCES auth.users(id),
  
  source TEXT NOT NULL DEFAULT 'meta_api',
  session_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_msg_org ON whatsapp_messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_wa_msg_client ON whatsapp_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_wa_msg_phone ON whatsapp_messages(contact_phone);
CREATE INDEX IF NOT EXISTS idx_wa_msg_ts ON whatsapp_messages(organization_id, timestamp DESC);

ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wa_msg_select" ON whatsapp_messages
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "wa_msg_insert" ON whatsapp_messages
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "wa_msg_update" ON whatsapp_messages
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

-- ============================================
-- 4. CONVERSACIONES
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  contact_phone TEXT NOT NULL,
  contact_name TEXT,
  wa_id TEXT,
  client_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  
  status TEXT DEFAULT 'open',
  assigned_to UUID REFERENCES auth.users(id),
  
  last_message_id UUID,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  
  unread_count INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  
  tags TEXT[],
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, contact_phone)
);

ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wa_conv_select" ON whatsapp_conversations
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "wa_conv_manage" ON whatsapp_conversations
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

-- ============================================
-- 5. SOLICITUDES DE IMPLEMENTACIÓN
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_implementation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  requested_by UUID REFERENCES auth.users(id),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  
  plan_type TEXT DEFAULT 'standard',
  estimated_monthly_messages INTEGER,
  current_whatsapp_number TEXT,
  additional_notes TEXT,
  
  status TEXT DEFAULT 'pending',
  assigned_admin UUID REFERENCES auth.users(id),
  admin_notes TEXT,
  
  contacted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  quoted_price DECIMAL(10,2),
  setup_fee DECIMAL(10,2),
  monthly_fee DECIMAL(10,2),
  invoice_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE whatsapp_implementation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wa_impl_select" ON whatsapp_implementation_requests
  FOR SELECT USING (
    requested_by = auth.uid() OR 
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "wa_impl_insert" ON whatsapp_implementation_requests
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

-- ============================================
-- 6. TRIGGER: VINCULAR MENSAJES A CLIENTES
-- ============================================
CREATE OR REPLACE FUNCTION public.link_whatsapp_to_client()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client_id UUID;
BEGIN
  SELECT id INTO v_client_id
  FROM contacts
  WHERE organization_id = NEW.organization_id
    AND (
      phone = NEW.contact_phone OR
      phone = '+' || NEW.contact_phone OR
      whatsapp_phone = NEW.contact_phone OR
      REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') = 
        REPLACE(REPLACE(REPLACE(NEW.contact_phone, ' ', ''), '-', ''), '+', '')
    )
  LIMIT 1;
  
  IF v_client_id IS NOT NULL THEN
    NEW.client_id := v_client_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_link_wa_client ON whatsapp_messages;
CREATE TRIGGER trigger_link_wa_client
  BEFORE INSERT ON whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.link_whatsapp_to_client();

-- ============================================
-- 7. TRIGGER: ACTUALIZAR CONVERSACIÓN
-- ============================================
CREATE OR REPLACE FUNCTION public.update_whatsapp_conversation()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO whatsapp_conversations (
    organization_id, contact_phone, contact_name, wa_id, client_id,
    last_message_id, last_message_at, last_message_preview,
    unread_count, total_messages
  ) VALUES (
    NEW.organization_id, NEW.contact_phone, NEW.contact_name, NEW.wa_id, NEW.client_id,
    NEW.id, NEW.timestamp, LEFT(NEW.content, 100),
    CASE WHEN NEW.direction = 'incoming' THEN 1 ELSE 0 END, 1
  )
  ON CONFLICT (organization_id, contact_phone) DO UPDATE SET
    contact_name = COALESCE(EXCLUDED.contact_name, whatsapp_conversations.contact_name),
    client_id = COALESCE(EXCLUDED.client_id, whatsapp_conversations.client_id),
    last_message_id = EXCLUDED.last_message_id,
    last_message_at = EXCLUDED.last_message_at,
    last_message_preview = EXCLUDED.last_message_preview,
    unread_count = CASE 
      WHEN NEW.direction = 'incoming' THEN whatsapp_conversations.unread_count + 1 
      ELSE whatsapp_conversations.unread_count 
    END,
    total_messages = whatsapp_conversations.total_messages + 1,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_wa_conv ON whatsapp_messages;
CREATE TRIGGER trigger_update_wa_conv
  AFTER INSERT ON whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_whatsapp_conversation();

-- ============================================
-- 8. FUNCIÓN: MARCAR CONVERSACIÓN COMO LEÍDA
-- ============================================
CREATE OR REPLACE FUNCTION public.mark_whatsapp_conversation_read(p_conversation_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE whatsapp_messages
  SET read_at = NOW(), read_by = auth.uid()
  WHERE id IN (
    SELECT wm.id FROM whatsapp_messages wm
    JOIN whatsapp_conversations wc ON wc.contact_phone = wm.contact_phone 
      AND wc.organization_id = wm.organization_id
    WHERE wc.id = p_conversation_id
      AND wm.read_at IS NULL
      AND wm.direction = 'incoming'
  );
  
  UPDATE whatsapp_conversations
  SET unread_count = 0, updated_at = NOW()
  WHERE id = p_conversation_id;
END;
$$;