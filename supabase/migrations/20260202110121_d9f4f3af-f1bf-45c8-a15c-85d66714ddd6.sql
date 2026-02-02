-- =====================================================
-- SIGNATURE ENVELOPES - Add provider integration fields
-- =====================================================

-- Add provider integration fields
ALTER TABLE signature_requests ADD COLUMN IF NOT EXISTS 
  provider_envelope_id TEXT;

ALTER TABLE signature_requests ADD COLUMN IF NOT EXISTS 
  provider_response JSONB DEFAULT '{}';

ALTER TABLE signature_requests ADD COLUMN IF NOT EXISTS 
  webhook_events JSONB DEFAULT '[]';

ALTER TABLE signature_requests ADD COLUMN IF NOT EXISTS 
  signed_document_url TEXT;

ALTER TABLE signature_requests ADD COLUMN IF NOT EXISTS 
  signed_document_path TEXT;

-- Index for provider lookup
CREATE INDEX IF NOT EXISTS idx_signature_requests_provider_id 
  ON signature_requests(provider_envelope_id) WHERE provider_envelope_id IS NOT NULL;