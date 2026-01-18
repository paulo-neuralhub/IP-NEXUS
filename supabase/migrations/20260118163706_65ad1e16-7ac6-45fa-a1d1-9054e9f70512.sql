-- =====================================================
-- CRM MODULE: CONTACTS
-- =====================================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  owner_type TEXT NOT NULL DEFAULT 'tenant' CHECK (owner_type IN ('tenant', 'backoffice')),
  
  type TEXT NOT NULL DEFAULT 'person' CHECK (type IN ('person', 'company')),
  
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  
  company_name TEXT,
  job_title TEXT,
  department TEXT,
  tax_id TEXT,
  website TEXT,
  industry TEXT,
  employee_count TEXT,
  annual_revenue DECIMAL(15,2),
  
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  
  source TEXT,
  source_detail TEXT,
  assigned_to UUID REFERENCES users(id),
  lifecycle_stage TEXT DEFAULT 'lead' CHECK (lifecycle_stage IN ('subscriber', 'lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist', 'other')),
  
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  avatar_url TEXT,
  notes TEXT,
  
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- =====================================================
-- CRM MODULE: PIPELINES
-- =====================================================
CREATE TABLE IF NOT EXISTS pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  owner_type TEXT NOT NULL DEFAULT 'tenant' CHECK (owner_type IN ('tenant', 'backoffice')),
  
  name TEXT NOT NULL,
  description TEXT,
  pipeline_type TEXT DEFAULT 'sales' CHECK (pipeline_type IN ('sales', 'registration', 'opposition', 'renewal', 'support', 'custom')),
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  position INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CRM MODULE: PIPELINE STAGES
-- =====================================================
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  position INT NOT NULL,
  
  is_won_stage BOOLEAN DEFAULT false,
  is_lost_stage BOOLEAN DEFAULT false,
  probability INT DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  
  required_fields TEXT[] DEFAULT '{}',
  auto_actions JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CRM MODULE: DEALS
-- =====================================================
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  owner_type TEXT NOT NULL DEFAULT 'tenant' CHECK (owner_type IN ('tenant', 'backoffice')),
  
  pipeline_id UUID NOT NULL REFERENCES pipelines(id),
  stage_id UUID NOT NULL REFERENCES pipeline_stages(id),
  
  title TEXT NOT NULL,
  description TEXT,
  value DECIMAL(15,2),
  currency TEXT DEFAULT 'EUR',
  
  contact_id UUID REFERENCES contacts(id),
  company_id UUID REFERENCES contacts(id),
  matter_id UUID REFERENCES matters(id),
  assigned_to UUID REFERENCES users(id),
  
  expected_close_date DATE,
  actual_close_date DATE,
  
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
  lost_reason TEXT,
  won_reason TEXT,
  
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  closed_at TIMESTAMPTZ
);

-- =====================================================
-- CRM MODULE: ACTIVITIES
-- =====================================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  owner_type TEXT NOT NULL DEFAULT 'tenant' CHECK (owner_type IN ('tenant', 'backoffice')),
  
  type TEXT NOT NULL CHECK (type IN (
    'email', 'call', 'whatsapp', 'meeting', 'note', 
    'task', 'stage_change', 'document', 'deal_created',
    'deal_won', 'deal_lost', 'contact_created', 'other'
  )),
  
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  matter_id UUID REFERENCES matters(id) ON DELETE CASCADE,
  
  subject TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  email_from TEXT,
  email_to TEXT[],
  email_cc TEXT[],
  email_message_id TEXT,
  
  call_duration INT,
  call_outcome TEXT,
  call_recording_url TEXT,
  
  meeting_start TIMESTAMPTZ,
  meeting_end TIMESTAMPTZ,
  meeting_location TEXT,
  meeting_attendees TEXT[],
  
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT false,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_contacts_org ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_assigned ON contacts(assigned_to);

CREATE INDEX IF NOT EXISTS idx_pipelines_org ON pipelines(organization_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_pipeline ON pipeline_stages(pipeline_id);

CREATE INDEX IF NOT EXISTS idx_deals_org ON deals(organization_id);
CREATE INDEX IF NOT EXISTS idx_deals_pipeline ON deals(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);

CREATE INDEX IF NOT EXISTS idx_activities_org ON activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_deal ON activities(deal_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);

-- =====================================================
-- RLS
-- =====================================================
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policies para contacts
CREATE POLICY "View org contacts" ON contacts FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Create org contacts" ON contacts FOR INSERT WITH CHECK (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Update org contacts" ON contacts FOR UPDATE USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Delete org contacts" ON contacts FOR DELETE USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager'))
);

-- Policies para pipelines
CREATE POLICY "View org pipelines" ON pipelines FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Create org pipelines" ON pipelines FOR INSERT WITH CHECK (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);
CREATE POLICY "Update org pipelines" ON pipelines FOR UPDATE USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);
CREATE POLICY "Delete org pipelines" ON pipelines FOR DELETE USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
);

-- Policies para pipeline_stages
CREATE POLICY "View pipeline stages" ON pipeline_stages FOR SELECT USING (
  pipeline_id IN (
    SELECT id FROM pipelines WHERE organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "Create pipeline stages" ON pipeline_stages FOR INSERT WITH CHECK (
  pipeline_id IN (
    SELECT id FROM pipelines WHERE organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
);
CREATE POLICY "Update pipeline stages" ON pipeline_stages FOR UPDATE USING (
  pipeline_id IN (
    SELECT id FROM pipelines WHERE organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
);
CREATE POLICY "Delete pipeline stages" ON pipeline_stages FOR DELETE USING (
  pipeline_id IN (
    SELECT id FROM pipelines WHERE organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
);

-- Policies para deals
CREATE POLICY "View org deals" ON deals FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Create org deals" ON deals FOR INSERT WITH CHECK (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Update org deals" ON deals FOR UPDATE USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Delete org deals" ON deals FOR DELETE USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager'))
);

-- Policies para activities
CREATE POLICY "View org activities" ON activities FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Create org activities" ON activities FOR INSERT WITH CHECK (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Update org activities" ON activities FOR UPDATE USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "Delete org activities" ON activities FOR DELETE USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

-- =====================================================
-- TRIGGERS
-- =====================================================
-- Reuse existing update_updated_at_column function (or update_matter_timestamp)
CREATE TRIGGER contacts_updated BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER deals_updated BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER pipelines_updated BEFORE UPDATE ON pipelines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log deal stage changes
CREATE OR REPLACE FUNCTION log_deal_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stage_id IS DISTINCT FROM NEW.stage_id THEN
    INSERT INTO activities (
      organization_id, owner_type, type, deal_id, contact_id,
      subject, metadata, created_by
    ) VALUES (
      NEW.organization_id,
      NEW.owner_type,
      'stage_change',
      NEW.id,
      NEW.contact_id,
      'Cambio de etapa',
      jsonb_build_object(
        'from_stage_id', OLD.stage_id,
        'to_stage_id', NEW.stage_id
      ),
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER deal_stage_changed
  AFTER UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION log_deal_stage_change();