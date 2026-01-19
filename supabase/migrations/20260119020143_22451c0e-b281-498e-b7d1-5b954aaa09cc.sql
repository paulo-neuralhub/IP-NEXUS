-- ============================================
-- KYC VERIFICATIONS
-- ============================================

CREATE TABLE market_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- email, phone, identity, address, etc.
  status VARCHAR(30) NOT NULL DEFAULT 'not_started',
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  rejection_reason TEXT,
  attempt_count INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, type)
);

CREATE INDEX idx_verifications_user ON market_verifications(user_id);
CREATE INDEX idx_verifications_status ON market_verifications(status);
CREATE INDEX idx_verifications_pending ON market_verifications(status) WHERE status IN ('pending', 'in_review');

-- ============================================
-- VERIFICATION DOCUMENTS
-- ============================================

CREATE TABLE market_verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES market_verifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  extracted_data JSONB,
  ocr_text TEXT,
  rejection_reason TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_documents_verification ON market_verification_documents(verification_id);
CREATE INDEX idx_documents_user ON market_verification_documents(user_id);

-- ============================================
-- COMPLIANCE CHECKS
-- ============================================

CREATE TABLE market_compliance_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_type VARCHAR(30) NOT NULL, -- aml, sanctions, pep, adverse_media
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  risk_score INTEGER DEFAULT 0,
  risk_level VARCHAR(20),
  provider VARCHAR(50) NOT NULL,
  provider_reference VARCHAR(255),
  request_data JSONB,
  results JSONB,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_compliance_user ON market_compliance_checks(user_id);
CREATE INDEX idx_compliance_status ON market_compliance_checks(status);
CREATE INDEX idx_compliance_flagged ON market_compliance_checks(user_id) WHERE status = 'flagged';

-- ============================================
-- RISK ASSESSMENTS
-- ============================================

CREATE TABLE market_risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL DEFAULT 0,
  overall_level VARCHAR(20) NOT NULL DEFAULT 'low',
  factors JSONB NOT NULL DEFAULT '{}',
  flags TEXT[] DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_risk_user ON market_risk_assessments(user_id);
CREATE INDEX idx_risk_high ON market_risk_assessments(user_id) WHERE overall_level IN ('high', 'critical');

-- ============================================
-- CONTENT REPORTS
-- ============================================

CREATE TABLE market_content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id),
  reported_entity_type VARCHAR(30) NOT NULL,
  reported_entity_id UUID NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  action_taken VARCHAR(30),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_reports_status ON market_content_reports(status);
CREATE INDEX idx_reports_entity ON market_content_reports(reported_entity_type, reported_entity_id);
CREATE INDEX idx_reports_pending ON market_content_reports(created_at) WHERE status = 'pending';

-- ============================================
-- MODERATION ACTIONS LOG
-- ============================================

CREATE TABLE market_moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id UUID NOT NULL REFERENCES auth.users(id),
  target_type VARCHAR(30) NOT NULL,
  target_id UUID NOT NULL,
  action VARCHAR(30) NOT NULL,
  reason TEXT NOT NULL,
  report_id UUID REFERENCES market_content_reports(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moderation_target ON market_moderation_actions(target_type, target_id);
CREATE INDEX idx_moderation_moderator ON market_moderation_actions(moderator_id);

-- ============================================
-- KYC AUDIT LOG
-- ============================================

CREATE TABLE market_kyc_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  performed_by UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kyc_audit_user ON market_kyc_audit_log(user_id);
CREATE INDEX idx_kyc_audit_action ON market_kyc_audit_log(action);

-- ============================================
-- FUNCTION: Calculate KYC level
-- ============================================

CREATE OR REPLACE FUNCTION calculate_kyc_level(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_level INTEGER := 0;
  v_verifications RECORD;
BEGIN
  SELECT 
    bool_or(type = 'email' AND status = 'approved') as email,
    bool_or(type = 'phone' AND status = 'approved') as phone,
    bool_or(type = 'identity' AND status = 'approved') as identity,
    bool_or(type = 'address' AND status = 'approved') as address,
    bool_or(type = 'source_of_funds' AND status = 'approved') as source_of_funds,
    bool_or(type = 'business' AND status = 'approved') as business,
    bool_or(type = 'ubo' AND status = 'approved') as ubo,
    bool_or(type = 'agent_license' AND status = 'approved') as agent_license,
    bool_or(type = 'professional_insurance' AND status = 'approved') as insurance
  INTO v_verifications
  FROM market_verifications
  WHERE user_id = p_user_id;

  IF EXISTS (
    SELECT 1 FROM market_user_profiles 
    WHERE user_id = p_user_id 
    AND display_name IS NOT NULL 
    AND avatar_url IS NOT NULL
  ) THEN
    IF v_verifications.email THEN
      v_level := 1;
    END IF;

    IF v_level >= 1 AND v_verifications.identity AND v_verifications.phone THEN
      v_level := 2;
    END IF;

    IF v_level >= 2 AND v_verifications.address AND v_verifications.source_of_funds THEN
      v_level := 3;
    END IF;

    IF v_level >= 3 AND v_verifications.business AND v_verifications.ubo THEN
      v_level := 4;
    END IF;

    IF v_level >= 4 AND v_verifications.agent_license AND v_verifications.insurance THEN
      v_level := 5;
    END IF;
  END IF;

  RETURN v_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- TRIGGER: Update user KYC level
-- ============================================

CREATE OR REPLACE FUNCTION update_user_kyc_level()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE market_user_profiles
  SET 
    kyc_level = calculate_kyc_level(NEW.user_id),
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_kyc_level
AFTER INSERT OR UPDATE ON market_verifications
FOR EACH ROW
EXECUTE FUNCTION update_user_kyc_level();

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE market_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_kyc_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own verifications
CREATE POLICY "Users view own verifications"
ON market_verifications FOR SELECT
USING (user_id = auth.uid());

-- Users can insert their own verifications
CREATE POLICY "Users create own verifications"
ON market_verifications FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their pending verifications
CREATE POLICY "Users update pending verifications"
ON market_verifications FOR UPDATE
USING (user_id = auth.uid() AND status IN ('not_started', 'pending', 'rejected'));

-- Users can manage their own documents
CREATE POLICY "Users manage own documents"
ON market_verification_documents FOR ALL
USING (user_id = auth.uid());

-- Users can view their own compliance checks
CREATE POLICY "Users view own compliance"
ON market_compliance_checks FOR SELECT
USING (user_id = auth.uid());

-- Users can view their own risk assessments
CREATE POLICY "Users view own risk assessments"
ON market_risk_assessments FOR SELECT
USING (user_id = auth.uid());

-- Users can create reports
CREATE POLICY "Users create reports"
ON market_content_reports FOR INSERT
WITH CHECK (reporter_id = auth.uid());

-- Users can view their own reports
CREATE POLICY "Users view own reports"
ON market_content_reports FOR SELECT
USING (reporter_id = auth.uid());

-- Service role full access
CREATE POLICY "Service role manages verifications"
ON market_verifications FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role manages compliance"
ON market_compliance_checks FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role manages risk"
ON market_risk_assessments FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role manages reports"
ON market_content_reports FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role manages moderation"
ON market_moderation_actions FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role manages audit"
ON market_kyc_audit_log FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- STORAGE BUCKET for verification documents
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  false,
  20971520, -- 20MB
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users upload own verification docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users view own verification docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'verification-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Service role manages verification docs"
ON storage.objects FOR ALL
USING (
  bucket_id = 'verification-documents' AND
  auth.jwt() ->> 'role' = 'service_role'
);