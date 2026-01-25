-- Add office-related columns to matters table
ALTER TABLE matters 
ADD COLUMN IF NOT EXISTS office_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS office_application_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS office_registration_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS office_status VARCHAR(100),
ADD COLUMN IF NOT EXISTS office_status_normalized VARCHAR(50),
ADD COLUMN IF NOT EXISTS office_status_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS office_last_sync_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS office_last_sync_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS office_filing_date DATE,
ADD COLUMN IF NOT EXISTS office_publication_date DATE,
ADD COLUMN IF NOT EXISTS office_registration_date DATE,
ADD COLUMN IF NOT EXISTS office_expiry_date DATE,
ADD COLUMN IF NOT EXISTS office_priority_date DATE,
ADD COLUMN IF NOT EXISTS office_metadata JSONB DEFAULT '{}';

-- Add index for office sync queries
CREATE INDEX IF NOT EXISTS idx_matters_office_code ON matters(office_code) WHERE office_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matters_office_last_sync ON matters(office_last_sync_at);

-- Add comment
COMMENT ON COLUMN matters.office_code IS 'IPO office code (e.g., ES, EUIPO, USPTO)';
COMMENT ON COLUMN matters.office_status IS 'Original status from the office in their language';
COMMENT ON COLUMN matters.office_status_normalized IS 'Normalized status (filed, examination, published, registered, etc.)';