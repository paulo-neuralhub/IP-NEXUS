-- ============================================================
-- ALARM DASHBOARD & NOTIFICATIONS SYSTEM
-- Tables for multi-channel notifications
-- ============================================================

-- User notification settings per tenant
CREATE TABLE IF NOT EXISTS user_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Channels
  email_enabled BOOLEAN DEFAULT true,
  email_address VARCHAR(255),
  in_app_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT false,
  push_token TEXT,
  
  -- Digest frequency
  digest_frequency VARCHAR(20) DEFAULT 'daily' CHECK (digest_frequency IN ('instant', 'daily', 'weekly', 'none')),
  digest_time TIME DEFAULT '08:00:00',
  digest_day INTEGER DEFAULT 1, -- For weekly (1=Monday)
  
  -- Filters
  min_priority VARCHAR(20) DEFAULT 'low' CHECK (min_priority IN ('low', 'medium', 'high', 'critical')),
  muted_matter_ids UUID[] DEFAULT '{}',
  
  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, organization_id)
);

-- Notifications sent/pending
CREATE TABLE IF NOT EXISTS deadline_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Reference
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('deadline', 'matter', 'invoice', 'task', 'system')),
  entity_id UUID,
  deadline_id UUID REFERENCES matter_deadlines(id) ON DELETE CASCADE,
  
  -- Content
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  action_url VARCHAR(512),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'read', 'dismissed')),
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'in_app', 'push')),
  
  -- Timestamps
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  
  -- Error handling
  retry_count INTEGER DEFAULT 0,
  last_error TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Email queue
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES deadline_notifications(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  to_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  html_body TEXT,
  text_body TEXT,
  template VARCHAR(100),
  template_data JSONB DEFAULT '{}',
  
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_notification_settings_user ON user_notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notification_settings_org ON user_notification_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_deadline_notifications_user ON deadline_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_deadline_notifications_org ON deadline_notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_deadline_notifications_deadline ON deadline_notifications(deadline_id);
CREATE INDEX IF NOT EXISTS idx_deadline_notifications_status ON deadline_notifications(status);
CREATE INDEX IF NOT EXISTS idx_deadline_notifications_unread ON deadline_notifications(user_id, status) WHERE status IN ('pending', 'sent');
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_pending ON email_queue(status, created_at) WHERE status = 'pending';

-- RLS Policies
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadline_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- User notification settings policies
CREATE POLICY "Users can view their own notification settings"
  ON user_notification_settings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own notification settings"
  ON user_notification_settings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own notification settings"
  ON user_notification_settings FOR UPDATE
  USING (user_id = auth.uid());

-- Deadline notifications policies
CREATE POLICY "Users can view their own notifications"
  ON deadline_notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON deadline_notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Email queue policies (service role only - managed by edge functions)
CREATE POLICY "Service role can manage email queue"
  ON email_queue FOR ALL
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_user_notification_settings_updated_at
  BEFORE UPDATE ON user_notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();