-- =====================================================
-- Quote to Matter Conversion System
-- =====================================================

-- 1. Add columns to quotes table
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS generated_matter_id UUID REFERENCES matters(id);

-- 2. Add columns to matters table
ALTER TABLE matters ADD COLUMN IF NOT EXISTS source_quote_id UUID REFERENCES quotes(id);
ALTER TABLE matters ADD COLUMN IF NOT EXISTS source_type VARCHAR DEFAULT 'manual';

-- 3. Add columns to quote_items table
ALTER TABLE quote_items ADD COLUMN IF NOT EXISTS generates_matter BOOLEAN DEFAULT false;
ALTER TABLE quote_items ADD COLUMN IF NOT EXISTS matter_type VARCHAR;
ALTER TABLE quote_items ADD COLUMN IF NOT EXISTS matter_subtype VARCHAR;
ALTER TABLE quote_items ADD COLUMN IF NOT EXISTS matter_jurisdiction VARCHAR;
ALTER TABLE quote_items ADD COLUMN IF NOT EXISTS generated_matter_id UUID REFERENCES matters(id);

-- 4. Add columns to service_catalog table
ALTER TABLE service_catalog ADD COLUMN IF NOT EXISTS generates_matter BOOLEAN DEFAULT false;
ALTER TABLE service_catalog ADD COLUMN IF NOT EXISTS default_matter_type VARCHAR;
ALTER TABLE service_catalog ADD COLUMN IF NOT EXISTS default_matter_subtype VARCHAR;
ALTER TABLE service_catalog ADD COLUMN IF NOT EXISTS default_jurisdiction VARCHAR;

-- 5. Update service_catalog with default configurations
UPDATE service_catalog SET 
  generates_matter = true,
  default_matter_type = 'trademark',
  default_matter_subtype = 'registration',
  default_jurisdiction = 'ES'
WHERE reference_code LIKE 'MAR-REG-ES%' OR name ILIKE '%registro%marca%españa%';

UPDATE service_catalog SET 
  generates_matter = true,
  default_matter_type = 'trademark',
  default_matter_subtype = 'registration',
  default_jurisdiction = 'EU'
WHERE reference_code LIKE 'MAR-REG-EU%' OR name ILIKE '%registro%marca%eu%';

UPDATE service_catalog SET 
  generates_matter = true,
  default_matter_type = 'trademark',
  default_matter_subtype = 'renewal',
  default_jurisdiction = 'ES'
WHERE reference_code LIKE 'MAR-REN%';

UPDATE service_catalog SET 
  generates_matter = true,
  default_matter_type = 'patent',
  default_matter_subtype = 'filing',
  default_jurisdiction = 'ES'
WHERE reference_code LIKE 'PAT-SOL%' OR reference_code LIKE 'PAT-REG%';

-- Services that don't generate matters
UPDATE service_catalog SET generates_matter = false
WHERE reference_code LIKE 'VIG-%' 
   OR reference_code LIKE 'INF-%'
   OR reference_code LIKE 'CON-%';

-- 6. Create index for performance
CREATE INDEX IF NOT EXISTS idx_matters_source_quote ON matters(source_quote_id) WHERE source_quote_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quote_items_generated_matter ON quote_items(generated_matter_id) WHERE generated_matter_id IS NOT NULL;

-- 7. Add comment for documentation
COMMENT ON COLUMN quotes.generated_matter_id IS 'Reference to the primary matter generated from this quote';
COMMENT ON COLUMN matters.source_quote_id IS 'Reference to the quote that originated this matter';
COMMENT ON COLUMN matters.source_type IS 'Origin of the matter: manual, quote, import, api';