-- =====================================================
-- SUSCRIPCIONES PUSH
-- =====================================================
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Endpoint y claves
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  
  -- Metadata
  user_agent TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, endpoint)
);

-- =====================================================
-- PREFERENCIAS DE NOTIFICACIÓN
-- =====================================================
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Canales
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  
  -- Tipos de notificación
  deadline_reminders BOOLEAN DEFAULT true,
  deadline_reminder_days INT[] DEFAULT '{7, 3, 1}',
  
  renewal_reminders BOOLEAN DEFAULT true,
  renewal_reminder_days INT[] DEFAULT '{90, 60, 30}',
  
  watch_alerts BOOLEAN DEFAULT true,
  invoice_notifications BOOLEAN DEFAULT true,
  team_notifications BOOLEAN DEFAULT true,
  marketing_notifications BOOLEAN DEFAULT false,
  
  -- Horario
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  
  -- Timezone
  timezone TEXT DEFAULT 'Europe/Madrid',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- =====================================================
-- NOTIFICACIONES
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Contenido
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT,
  image_url TEXT,
  
  -- Tipo
  type TEXT NOT NULL CHECK (type IN (
    'deadline_reminder',
    'renewal_reminder', 
    'watch_alert',
    'invoice',
    'team_invite',
    'team_update',
    'system',
    'marketing'
  )),
  
  -- Acción
  action_url TEXT,
  action_data JSONB DEFAULT '{}',
  
  -- Estado
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Envío
  sent_via JSONB DEFAULT '[]',
  
  -- Referencia
  reference_type TEXT,
  reference_id UUID,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(type);

-- =====================================================
-- RLS
-- =====================================================
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own push_subscriptions" ON push_subscriptions 
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users own notification_preferences" ON notification_preferences 
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users own notifications" ON notifications 
  FOR ALL USING (user_id = auth.uid());

-- Crear preferencias por defecto al registrar usuario
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_user_created_notification_prefs
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();