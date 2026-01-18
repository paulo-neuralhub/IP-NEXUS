-- =====================================================
-- MARKETING MODULE - TABLES
-- =====================================================

-- PLANTILLAS DE EMAIL
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  owner_type TEXT NOT NULL DEFAULT 'tenant' CHECK (owner_type IN ('tenant', 'backoffice')),
  
  -- Info básica
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN (
    'general', 'welcome', 'newsletter', 'promotion', 
    'reminder', 'notification', 'renewal', 'invoice', 'custom'
  )),
  
  -- Contenido
  subject TEXT NOT NULL,
  preview_text TEXT,
  html_content TEXT NOT NULL,
  json_content JSONB,
  plain_text TEXT,
  
  -- Configuración
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  thumbnail_url TEXT,
  
  -- Variables disponibles
  available_variables TEXT[] DEFAULT '{}',
  
  -- Auditoría
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LISTAS DE CONTACTOS / SEGMENTOS
CREATE TABLE contact_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  owner_type TEXT NOT NULL DEFAULT 'tenant' CHECK (owner_type IN ('tenant', 'backoffice')),
  
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'static' CHECK (type IN ('static', 'dynamic')),
  
  -- Para listas dinámicas (segmentos)
  filter_conditions JSONB DEFAULT '[]',
  
  -- Cache de conteo
  contact_count INT DEFAULT 0,
  last_count_at TIMESTAMPTZ,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relación contactos <-> listas (para listas estáticas)
CREATE TABLE contact_list_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES contact_lists(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID REFERENCES users(id),
  UNIQUE(list_id, contact_id)
);

-- CAMPAÑAS DE EMAIL
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  owner_type TEXT NOT NULL DEFAULT 'tenant' CHECK (owner_type IN ('tenant', 'backoffice')),
  
  -- Info básica
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT DEFAULT 'regular' CHECK (campaign_type IN (
    'regular', 'automated', 'ab_test', 'rss', 'transactional'
  )),
  
  -- Contenido
  template_id UUID REFERENCES email_templates(id),
  subject TEXT NOT NULL,
  preview_text TEXT,
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  reply_to TEXT,
  html_content TEXT,
  json_content JSONB,
  
  -- Destinatarios
  list_ids UUID[] DEFAULT '{}',
  segment_conditions JSONB,
  exclude_list_ids UUID[] DEFAULT '{}',
  
  -- Estado y programación
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled', 'failed'
  )),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- A/B Testing
  is_ab_test BOOLEAN DEFAULT false,
  ab_test_config JSONB,
  
  -- Métricas
  total_recipients INT DEFAULT 0,
  total_sent INT DEFAULT 0,
  total_delivered INT DEFAULT 0,
  total_opened INT DEFAULT 0,
  total_clicked INT DEFAULT 0,
  total_bounced INT DEFAULT 0,
  total_unsubscribed INT DEFAULT 0,
  total_complained INT DEFAULT 0,
  
  -- Auditoría
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENVÍOS INDIVIDUALES
CREATE TABLE email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  
  -- Estado
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'sent', 'delivered', 'opened', 'clicked', 
    'bounced', 'unsubscribed', 'complained', 'failed'
  )),
  
  -- Variante A/B
  ab_variant TEXT,
  
  -- Tracking
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  first_opened_at TIMESTAMPTZ,
  last_opened_at TIMESTAMPTZ,
  open_count INT DEFAULT 0,
  first_clicked_at TIMESTAMPTZ,
  click_count INT DEFAULT 0,
  
  -- Errores
  bounce_type TEXT,
  bounce_reason TEXT,
  
  -- Metadata
  email_provider_id TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLICKS EN EMAILS
CREATE TABLE email_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  send_id UUID NOT NULL REFERENCES email_sends(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  
  url TEXT NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Info del dispositivo
  user_agent TEXT,
  ip_address TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT
);

-- AUTOMATIZACIONES
CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  owner_type TEXT NOT NULL DEFAULT 'tenant' CHECK (owner_type IN ('tenant', 'backoffice')),
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- Trigger
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'contact_created', 'contact_updated', 'tag_added', 'tag_removed',
    'list_joined', 'list_left', 'deal_created', 'deal_stage_changed',
    'deal_won', 'deal_lost', 'matter_created', 'matter_expiring',
    'form_submitted', 'email_opened', 'email_clicked', 'date_based',
    'manual', 'api'
  )),
  trigger_config JSONB DEFAULT '{}',
  
  -- Filtros adicionales
  filter_conditions JSONB DEFAULT '[]',
  
  -- Acciones (secuencia)
  actions JSONB NOT NULL DEFAULT '[]',
  
  -- Estado
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  
  -- Métricas
  total_enrolled INT DEFAULT 0,
  total_completed INT DEFAULT 0,
  total_exited INT DEFAULT 0,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENROLLMENTS EN AUTOMATIZACIÓN
CREATE TABLE automation_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'exited', 'failed')),
  current_action_id TEXT,
  
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  exited_at TIMESTAMPTZ,
  exit_reason TEXT,
  
  -- Historial de acciones ejecutadas
  action_history JSONB DEFAULT '[]',
  
  -- Próxima acción programada
  next_action_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}'
);

-- UNSUBSCRIBES
CREATE TABLE email_unsubscribes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  
  reason TEXT,
  feedback TEXT,
  
  -- Origen
  campaign_id UUID REFERENCES email_campaigns(id),
  source TEXT DEFAULT 'link' CHECK (source IN ('link', 'manual', 'complaint', 'bounce', 'api')),
  
  unsubscribed_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, email)
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_email_templates_org ON email_templates(organization_id);
CREATE INDEX idx_email_templates_category ON email_templates(category);

CREATE INDEX idx_contact_lists_org ON contact_lists(organization_id);
CREATE INDEX idx_contact_list_members_list ON contact_list_members(list_id);
CREATE INDEX idx_contact_list_members_contact ON contact_list_members(contact_id);

CREATE INDEX idx_email_campaigns_org ON email_campaigns(organization_id);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_scheduled ON email_campaigns(scheduled_at) WHERE status = 'scheduled';

CREATE INDEX idx_email_sends_campaign ON email_sends(campaign_id);
CREATE INDEX idx_email_sends_contact ON email_sends(contact_id);
CREATE INDEX idx_email_sends_status ON email_sends(status);

CREATE INDEX idx_email_clicks_send ON email_clicks(send_id);
CREATE INDEX idx_email_clicks_campaign ON email_clicks(campaign_id);

CREATE INDEX idx_automations_org ON automations(organization_id);
CREATE INDEX idx_automations_status ON automations(status);
CREATE INDEX idx_automations_trigger ON automations(trigger_type);

CREATE INDEX idx_automation_enrollments_automation ON automation_enrollments(automation_id);
CREATE INDEX idx_automation_enrollments_contact ON automation_enrollments(contact_id);
CREATE INDEX idx_automation_enrollments_next ON automation_enrollments(next_action_at) WHERE status = 'active';

CREATE INDEX idx_email_unsubscribes_org ON email_unsubscribes(organization_id);
CREATE INDEX idx_email_unsubscribes_email ON email_unsubscribes(email);

-- =====================================================
-- RLS
-- =====================================================
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_unsubscribes ENABLE ROW LEVEL SECURITY;

-- Email Templates policies
CREATE POLICY "View org templates" ON email_templates FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Create org templates" ON email_templates FOR INSERT WITH CHECK (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Update org templates" ON email_templates FOR UPDATE USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Delete org templates" ON email_templates FOR DELETE USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- Contact Lists policies
CREATE POLICY "View org lists" ON contact_lists FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Create org lists" ON contact_lists FOR INSERT WITH CHECK (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Update org lists" ON contact_lists FOR UPDATE USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Delete org lists" ON contact_lists FOR DELETE USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- Contact List Members policies
CREATE POLICY "View list members" ON contact_list_members FOR SELECT USING (
  list_id IN (SELECT id FROM contact_lists WHERE organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ))
);
CREATE POLICY "Create list members" ON contact_list_members FOR INSERT WITH CHECK (
  list_id IN (SELECT id FROM contact_lists WHERE organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ))
);
CREATE POLICY "Delete list members" ON contact_list_members FOR DELETE USING (
  list_id IN (SELECT id FROM contact_lists WHERE organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ))
);

-- Email Campaigns policies
CREATE POLICY "View org campaigns" ON email_campaigns FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Create org campaigns" ON email_campaigns FOR INSERT WITH CHECK (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Update org campaigns" ON email_campaigns FOR UPDATE USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Delete org campaigns" ON email_campaigns FOR DELETE USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- Email Sends policies
CREATE POLICY "View campaign sends" ON email_sends FOR SELECT USING (
  campaign_id IN (SELECT id FROM email_campaigns WHERE organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ))
);

-- Email Clicks policies
CREATE POLICY "View campaign clicks" ON email_clicks FOR SELECT USING (
  campaign_id IN (SELECT id FROM email_campaigns WHERE organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ))
);

-- Automations policies
CREATE POLICY "View org automations" ON automations FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Create org automations" ON automations FOR INSERT WITH CHECK (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Update org automations" ON automations FOR UPDATE USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Delete org automations" ON automations FOR DELETE USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- Automation Enrollments policies
CREATE POLICY "View automation enrollments" ON automation_enrollments FOR SELECT USING (
  automation_id IN (SELECT id FROM automations WHERE organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ))
);

-- Unsubscribes policies
CREATE POLICY "View org unsubscribes" ON email_unsubscribes FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Create org unsubscribes" ON email_unsubscribes FOR INSERT WITH CHECK (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Actualizar métricas de campaña cuando cambia un send
CREATE OR REPLACE FUNCTION update_campaign_metrics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE email_campaigns SET
    total_sent = (SELECT COUNT(*) FROM email_sends WHERE campaign_id = NEW.campaign_id AND status != 'pending'),
    total_delivered = (SELECT COUNT(*) FROM email_sends WHERE campaign_id = NEW.campaign_id AND status IN ('delivered', 'opened', 'clicked')),
    total_opened = (SELECT COUNT(*) FROM email_sends WHERE campaign_id = NEW.campaign_id AND open_count > 0),
    total_clicked = (SELECT COUNT(*) FROM email_sends WHERE campaign_id = NEW.campaign_id AND click_count > 0),
    total_bounced = (SELECT COUNT(*) FROM email_sends WHERE campaign_id = NEW.campaign_id AND status = 'bounced'),
    total_unsubscribed = (SELECT COUNT(*) FROM email_sends WHERE campaign_id = NEW.campaign_id AND status = 'unsubscribed'),
    total_complained = (SELECT COUNT(*) FROM email_sends WHERE campaign_id = NEW.campaign_id AND status = 'complained'),
    updated_at = NOW()
  WHERE id = NEW.campaign_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER email_send_metrics
  AFTER INSERT OR UPDATE ON email_sends
  FOR EACH ROW EXECUTE FUNCTION update_campaign_metrics();

-- Actualizar conteo de lista
CREATE OR REPLACE FUNCTION update_list_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE contact_lists SET 
      contact_count = contact_count + 1,
      last_count_at = NOW()
    WHERE id = NEW.list_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE contact_lists SET 
      contact_count = contact_count - 1,
      last_count_at = NOW()
    WHERE id = OLD.list_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER list_member_count
  AFTER INSERT OR DELETE ON contact_list_members
  FOR EACH ROW EXECUTE FUNCTION update_list_count();

-- Updated_at triggers
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_lists_updated_at
  BEFORE UPDATE ON contact_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON email_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automations_updated_at
  BEFORE UPDATE ON automations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();