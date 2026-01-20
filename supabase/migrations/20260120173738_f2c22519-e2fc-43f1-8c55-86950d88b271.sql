-- =============================================
-- DOCKET GOD MODE - COMPLETE DATABASE SCHEMA
-- =============================================

-- 1. PORTFOLIOS TABLE
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'Briefcase',
  parent_portfolio_id UUID REFERENCES portfolios(id),
  owner_id UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. JURISDICTION RULES TABLE
CREATE TABLE IF NOT EXISTS jurisdiction_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  jurisdiction_code TEXT NOT NULL,
  ip_type TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  rule_name TEXT NOT NULL,
  description TEXT,
  base_days INTEGER,
  business_days_only BOOLEAN DEFAULT false,
  exclude_holidays BOOLEAN DEFAULT true,
  holiday_calendar TEXT,
  trigger_event TEXT,
  priority INTEGER DEFAULT 0,
  conditions JSONB DEFAULT '{}',
  actions JSONB DEFAULT '{}',
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. HOLIDAYS TABLE
CREATE TABLE IF NOT EXISTS holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  region_code TEXT,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'public',
  is_recurring BOOLEAN DEFAULT false,
  recurring_month INTEGER,
  recurring_day INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SMART TASKS TABLE
CREATE TABLE IF NOT EXISTS smart_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  matter_id UUID REFERENCES matters(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES portfolios(id),
  
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  
  trigger_date DATE,
  reminder_date DATE,
  due_date DATE NOT NULL,
  grace_period_days INTEGER DEFAULT 0,
  
  assigned_to UUID REFERENCES users(id),
  assigned_by UUID REFERENCES users(id),
  
  rule_id UUID,
  is_auto_generated BOOLEAN DEFAULT false,
  auto_action JSONB,
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),
  cancelled_at TIMESTAMPTZ,
  cancelled_reason TEXT,
  
  parent_task_id UUID REFERENCES smart_tasks(id),
  blocking_task_ids UUID[] DEFAULT '{}',
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MATTER FAMILY RELATIONS TABLE
CREATE TABLE IF NOT EXISTS matter_family_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  parent_matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  child_matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL,
  priority_date DATE,
  claim_numbers TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_matter_id, child_matter_id, relation_type)
);

-- 6. TASK COMMENTS TABLE
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES smart_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT true,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EMAIL INGESTION QUEUE
CREATE TABLE IF NOT EXISTS email_ingestion_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  source TEXT NOT NULL,
  message_id TEXT,
  from_address TEXT,
  to_addresses TEXT[],
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  attachments JSONB DEFAULT '[]',
  
  status TEXT DEFAULT 'pending',
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  
  extracted_data JSONB,
  matched_matter_id UUID REFERENCES matters(id),
  created_tasks UUID[] DEFAULT '{}',
  
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ADD COLUMNS TO MATTERS TABLE
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS portfolio_id UUID REFERENCES portfolios(id),
ADD COLUMN IF NOT EXISTS family_root_id UUID REFERENCES matters(id),
ADD COLUMN IF NOT EXISTS family_position JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS auto_renewal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS renewal_instructions TEXT,
ADD COLUMN IF NOT EXISTS last_rule_check_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS next_deadline DATE,
ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0;

-- Add FK for rule_id after jurisdiction_rules exists
ALTER TABLE smart_tasks 
ADD CONSTRAINT smart_tasks_rule_id_fkey 
FOREIGN KEY (rule_id) REFERENCES jurisdiction_rules(id) ON DELETE SET NULL;

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_portfolios_org ON portfolios(organization_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_parent ON portfolios(parent_portfolio_id);
CREATE INDEX IF NOT EXISTS idx_jurisdiction_rules_org ON jurisdiction_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_jurisdiction_rules_lookup ON jurisdiction_rules(jurisdiction_code, ip_type, rule_type);
CREATE INDEX IF NOT EXISTS idx_holidays_lookup ON holidays(country_code, date);
CREATE INDEX IF NOT EXISTS idx_smart_tasks_org ON smart_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_smart_tasks_matter ON smart_tasks(matter_id);
CREATE INDEX IF NOT EXISTS idx_smart_tasks_assigned ON smart_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_smart_tasks_due ON smart_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_smart_tasks_status ON smart_tasks(status);
CREATE INDEX IF NOT EXISTS idx_matter_family_parent ON matter_family_relations(parent_matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_family_child ON matter_family_relations(child_matter_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_org ON email_ingestion_queue(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_ingestion_queue(status);
CREATE INDEX IF NOT EXISTS idx_matters_portfolio ON matters(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_matters_family_root ON matters(family_root_id);

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE jurisdiction_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE matter_family_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_ingestion_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portfolios_select" ON portfolios FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "portfolios_all" ON portfolios FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "jurisdiction_rules_select" ON jurisdiction_rules FOR SELECT USING (
  organization_id IS NULL OR 
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "jurisdiction_rules_all" ON jurisdiction_rules FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "holidays_select" ON holidays FOR SELECT USING (true);

CREATE POLICY "smart_tasks_select" ON smart_tasks FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "smart_tasks_all" ON smart_tasks FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "matter_family_select" ON matter_family_relations FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "matter_family_all" ON matter_family_relations FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

CREATE POLICY "task_comments_select" ON task_comments FOR SELECT USING (
  task_id IN (SELECT id FROM smart_tasks WHERE organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()))
);
CREATE POLICY "task_comments_all" ON task_comments FOR ALL USING (
  task_id IN (SELECT id FROM smart_tasks WHERE organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()))
);

CREATE POLICY "email_queue_select" ON email_ingestion_queue FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);
CREATE POLICY "email_queue_all" ON email_ingestion_queue FOR ALL USING (
  organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
);

-- =============================================
-- FUNCTIONS
-- =============================================

CREATE OR REPLACE FUNCTION is_holiday(
  check_date DATE,
  country TEXT,
  region TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM holidays 
    WHERE date = check_date 
    AND country_code = country
    AND (region_code IS NULL OR region_code = region)
  );
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION calculate_deadline(
  start_date DATE,
  days_to_add INTEGER,
  country TEXT DEFAULT 'ES',
  business_days_only BOOLEAN DEFAULT false,
  exclude_holidays BOOLEAN DEFAULT true
) RETURNS DATE AS $$
DECLARE
  result_date DATE := start_date;
  days_added INTEGER := 0;
BEGIN
  IF NOT business_days_only AND NOT exclude_holidays THEN
    RETURN start_date + days_to_add;
  END IF;
  
  WHILE days_added < days_to_add LOOP
    result_date := result_date + 1;
    IF business_days_only AND EXTRACT(DOW FROM result_date) IN (0, 6) THEN
      CONTINUE;
    END IF;
    IF exclude_holidays AND is_holiday(result_date, country) THEN
      CONTINUE;
    END IF;
    days_added := days_added + 1;
  END LOOP;
  
  RETURN result_date;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_matter_family_tree(matter_uuid UUID)
RETURNS TABLE (
  id UUID,
  parent_id UUID,
  relation_type TEXT,
  title TEXT,
  reference_number TEXT,
  ip_type TEXT,
  status TEXT,
  jurisdiction TEXT,
  filing_date DATE,
  depth INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE descendants AS (
    SELECT 
      m.id,
      NULL::UUID as parent_id,
      'root'::TEXT as relation_type,
      m.title,
      m.reference_number,
      m.ip_type,
      m.status,
      m.jurisdiction,
      m.filing_date,
      0 as depth
    FROM matters m
    WHERE m.id = matter_uuid
    
    UNION ALL
    
    SELECT 
      m.id,
      mfr.parent_matter_id as parent_id,
      mfr.relation_type,
      m.title,
      m.reference_number,
      m.ip_type,
      m.status,
      m.jurisdiction,
      m.filing_date,
      d.depth + 1
    FROM matters m
    JOIN matter_family_relations mfr ON m.id = mfr.child_matter_id
    JOIN descendants d ON mfr.parent_matter_id = d.id
    WHERE d.depth < 10
  ),
  ancestors AS (
    SELECT 
      m.id,
      mfr.child_matter_id as parent_id,
      mfr.relation_type || '_parent' as relation_type,
      m.title,
      m.reference_number,
      m.ip_type,
      m.status,
      m.jurisdiction,
      m.filing_date,
      -1 as depth
    FROM matters m
    JOIN matter_family_relations mfr ON m.id = mfr.parent_matter_id
    WHERE mfr.child_matter_id = matter_uuid
    
    UNION ALL
    
    SELECT 
      m.id,
      mfr.child_matter_id as parent_id,
      mfr.relation_type || '_parent' as relation_type,
      m.title,
      m.reference_number,
      m.ip_type,
      m.status,
      m.jurisdiction,
      m.filing_date,
      a.depth - 1
    FROM matters m
    JOIN matter_family_relations mfr ON m.id = mfr.parent_matter_id
    JOIN ancestors a ON mfr.child_matter_id = a.id
    WHERE a.depth > -10
  )
  SELECT * FROM descendants
  UNION
  SELECT * FROM ancestors
  ORDER BY depth;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION apply_docket_rules(matter_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  matter_record RECORD;
  rule_record RECORD;
  tasks_created INTEGER := 0;
  calculated_date DATE;
BEGIN
  SELECT * INTO matter_record FROM matters WHERE id = matter_uuid;
  IF NOT FOUND THEN RETURN 0; END IF;
  
  FOR rule_record IN 
    SELECT * FROM jurisdiction_rules 
    WHERE jurisdiction_code = matter_record.jurisdiction
    AND ip_type = matter_record.ip_type
    AND is_active = true
    ORDER BY priority DESC
  LOOP
    CASE rule_record.trigger_event
      WHEN 'filing_date' THEN
        calculated_date := calculate_deadline(
          matter_record.filing_date, rule_record.base_days,
          SUBSTRING(matter_record.jurisdiction FROM 1 FOR 2),
          rule_record.business_days_only, rule_record.exclude_holidays
        );
      WHEN 'registration_date' THEN
        calculated_date := calculate_deadline(
          matter_record.registration_date, rule_record.base_days,
          SUBSTRING(matter_record.jurisdiction FROM 1 FOR 2),
          rule_record.business_days_only, rule_record.exclude_holidays
        );
      WHEN 'expiry_date' THEN
        calculated_date := calculate_deadline(
          matter_record.expiry_date, rule_record.base_days,
          SUBSTRING(matter_record.jurisdiction FROM 1 FOR 2),
          rule_record.business_days_only, rule_record.exclude_holidays
        );
      ELSE CONTINUE;
    END CASE;
    
    IF calculated_date IS NOT NULL AND calculated_date > CURRENT_DATE THEN
      INSERT INTO smart_tasks (
        organization_id, matter_id, title, description, task_type,
        due_date, reminder_date, rule_id, is_auto_generated, priority
      ) VALUES (
        matter_record.organization_id, matter_uuid, rule_record.rule_name,
        rule_record.description, rule_record.rule_type, calculated_date,
        calculated_date - INTERVAL '7 days', rule_record.id, true,
        CASE WHEN rule_record.rule_type = 'renewal' THEN 'high'
             WHEN rule_record.rule_type = 'opposition' THEN 'critical'
             ELSE 'medium' END
      ) ON CONFLICT DO NOTHING;
      tasks_created := tasks_created + 1;
    END IF;
  END LOOP;
  
  UPDATE matters SET last_rule_check_at = NOW() WHERE id = matter_uuid;
  RETURN tasks_created;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS
-- =============================================

CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jurisdiction_rules_updated_at
  BEFORE UPDATE ON jurisdiction_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_smart_tasks_updated_at
  BEFORE UPDATE ON smart_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at
  BEFORE UPDATE ON task_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();