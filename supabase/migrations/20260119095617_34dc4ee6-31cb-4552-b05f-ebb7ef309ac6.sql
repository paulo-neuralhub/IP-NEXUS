-- ============================================
-- IP-FILING: Sistema de Presentación Electrónica
-- ============================================

-- Solicitudes de Filing
CREATE TABLE filing_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  filing_type VARCHAR(50) NOT NULL,
  ip_type VARCHAR(30) NOT NULL,
  
  office_id UUID NOT NULL REFERENCES ipo_offices(id),
  office_code VARCHAR(10) NOT NULL,
  
  matter_id UUID REFERENCES matters(id),
  
  applicant_id UUID REFERENCES contacts(id),
  applicant_data JSONB NOT NULL DEFAULT '{}',
  
  representative_id UUID REFERENCES contacts(id),
  representative_data JSONB,
  power_of_attorney_id UUID REFERENCES matter_documents(id),
  
  application_data JSONB NOT NULL DEFAULT '{}',
  documents JSONB DEFAULT '[]',
  priority_claims JSONB DEFAULT '[]',
  
  fees_calculated JSONB,
  fees_paid BOOLEAN DEFAULT false,
  payment_reference VARCHAR(100),
  payment_date TIMESTAMPTZ,
  
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  validation_status VARCHAR(30) DEFAULT 'pending',
  validation_errors JSONB DEFAULT '[]',
  validation_warnings JSONB DEFAULT '[]',
  validated_at TIMESTAMPTZ,
  
  submission_method VARCHAR(30),
  submission_attempts INTEGER DEFAULT 0,
  last_submission_at TIMESTAMPTZ,
  submission_response JSONB,
  
  official_filing_number VARCHAR(100),
  official_filing_date DATE,
  official_receipt_url TEXT,
  
  tracking_number VARCHAR(100),
  
  deadline_submission DATE,
  deadline_payment DATE,
  
  created_by UUID REFERENCES auth.users(id),
  submitted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ
);

CREATE INDEX idx_filing_org ON filing_applications(organization_id, status);
CREATE INDEX idx_filing_office ON filing_applications(office_id, status);
CREATE INDEX idx_filing_matter ON filing_applications(matter_id);
CREATE INDEX idx_filing_status ON filing_applications(status, created_at DESC);

-- Datos específicos de marca
CREATE TABLE filing_trademark_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_id UUID NOT NULL REFERENCES filing_applications(id) ON DELETE CASCADE,
  
  mark_type VARCHAR(30) NOT NULL,
  mark_text VARCHAR(500),
  mark_description TEXT,
  
  mark_image_file_id UUID,
  mark_image_format VARCHAR(20),
  mark_image_colors VARCHAR(200),
  mark_sound_file_id UUID,
  mark_video_file_id UUID,
  
  is_color_claimed BOOLEAN DEFAULT false,
  colors_claimed TEXT[],
  color_description TEXT,
  
  nice_classes INTEGER[] NOT NULL DEFAULT '{}',
  goods_services JSONB NOT NULL DEFAULT '{}',
  vienna_codes VARCHAR(20)[],
  
  filing_language VARCHAR(10),
  second_language VARCHAR(10),
  
  is_collective_mark BOOLEAN DEFAULT false,
  is_certification_mark BOOLEAN DEFAULT false,
  collective_mark_regulations_id UUID,
  
  disclaimer TEXT,
  translation TEXT,
  transliteration TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_filing_tm_data ON filing_trademark_data(filing_id);

-- Historial de estados
CREATE TABLE filing_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_id UUID NOT NULL REFERENCES filing_applications(id) ON DELETE CASCADE,
  
  status_from VARCHAR(30),
  status_to VARCHAR(30) NOT NULL,
  
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  
  notes TEXT,
  system_message TEXT,
  metadata JSONB
);

CREATE INDEX idx_filing_history ON filing_status_history(filing_id, changed_at DESC);

-- Logs de comunicación con oficinas
CREATE TABLE filing_communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_id UUID NOT NULL REFERENCES filing_applications(id) ON DELETE CASCADE,
  
  direction VARCHAR(10) NOT NULL,
  comm_type VARCHAR(30) NOT NULL,
  
  endpoint TEXT,
  method VARCHAR(10),
  request_headers JSONB,
  request_body TEXT,
  response_status INTEGER,
  response_headers JSONB,
  response_body TEXT,
  
  success BOOLEAN,
  error_code VARCHAR(50),
  error_message TEXT,
  
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  response_time_ms INTEGER,
  
  ip_address VARCHAR(50),
  user_agent TEXT
);

CREATE INDEX idx_filing_comm_logs ON filing_communication_logs(filing_id, sent_at DESC);

-- Plantillas de filing
CREATE TABLE filing_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  name VARCHAR(200) NOT NULL,
  description TEXT,
  
  filing_type VARCHAR(50) NOT NULL,
  ip_type VARCHAR(30) NOT NULL,
  office_id UUID REFERENCES ipo_offices(id),
  
  template_data JSONB NOT NULL DEFAULT '{}',
  
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_filing_templates ON filing_templates(organization_id, filing_type, ip_type);

-- Borradores auto-guardados
CREATE TABLE filing_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  filing_type VARCHAR(50) NOT NULL,
  ip_type VARCHAR(30) NOT NULL,
  office_id UUID REFERENCES ipo_offices(id),
  
  current_step INTEGER DEFAULT 1,
  wizard_data JSONB NOT NULL DEFAULT '{}',
  
  converted_to_filing_id UUID REFERENCES filing_applications(id),
  
  auto_saved_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX idx_filing_drafts_user ON filing_drafts(user_id, auto_saved_at DESC);

-- Cola de envío
CREATE TABLE filing_submission_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filing_id UUID NOT NULL REFERENCES filing_applications(id) ON DELETE CASCADE,
  
  priority INTEGER DEFAULT 5,
  status VARCHAR(30) DEFAULT 'pending',
  
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_attempt_at TIMESTAMPTZ,
  next_attempt_at TIMESTAMPTZ,
  
  last_error TEXT,
  
  worker_id VARCHAR(100),
  locked_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_filing_queue_pending ON filing_submission_queue(status, priority, next_attempt_at)
  WHERE status IN ('pending', 'failed');

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE filing_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE filing_trademark_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE filing_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE filing_communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE filing_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE filing_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE filing_submission_queue ENABLE ROW LEVEL SECURITY;

-- Filing applications
CREATE POLICY "Users can view filing applications of their org"
  ON filing_applications FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));

CREATE POLICY "Users can create filing applications in their org"
  ON filing_applications FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));

CREATE POLICY "Users can update filing applications of their org"
  ON filing_applications FOR UPDATE
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete filing applications of their org"
  ON filing_applications FOR DELETE
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));

-- Trademark data
CREATE POLICY "Users can manage trademark data via filing"
  ON filing_trademark_data FOR ALL
  USING (filing_id IN (SELECT id FROM filing_applications WHERE organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())));

-- Status history
CREATE POLICY "Users can view status history via filing"
  ON filing_status_history FOR SELECT
  USING (filing_id IN (SELECT id FROM filing_applications WHERE organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())));

CREATE POLICY "Users can insert status history via filing"
  ON filing_status_history FOR INSERT
  WITH CHECK (filing_id IN (SELECT id FROM filing_applications WHERE organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())));

-- Communication logs
CREATE POLICY "Users can view comm logs via filing"
  ON filing_communication_logs FOR SELECT
  USING (filing_id IN (SELECT id FROM filing_applications WHERE organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())));

CREATE POLICY "Users can insert comm logs via filing"
  ON filing_communication_logs FOR INSERT
  WITH CHECK (filing_id IN (SELECT id FROM filing_applications WHERE organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())));

-- Templates
CREATE POLICY "Users can view templates of their org"
  ON filing_templates FOR SELECT
  USING (organization_id IS NULL OR organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage templates of their org"
  ON filing_templates FOR ALL
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));

-- Drafts
CREATE POLICY "Users can manage their own drafts"
  ON filing_drafts FOR ALL
  USING (user_id = auth.uid());

-- Queue
CREATE POLICY "Users can view queue items via filing"
  ON filing_submission_queue FOR SELECT
  USING (filing_id IN (SELECT id FROM filing_applications WHERE organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())));

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE TRIGGER update_filing_applications_updated_at
  BEFORE UPDATE ON filing_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-log status changes
CREATE OR REPLACE FUNCTION log_filing_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO filing_status_history (filing_id, status_from, status_to, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER filing_status_change_trigger
  AFTER UPDATE ON filing_applications
  FOR EACH ROW
  EXECUTE FUNCTION log_filing_status_change();