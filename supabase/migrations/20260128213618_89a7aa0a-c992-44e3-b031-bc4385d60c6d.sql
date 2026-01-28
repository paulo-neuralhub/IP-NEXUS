-- Add assigned_to column to crm_contacts (for leads)
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_crm_contacts_assigned ON crm_contacts(assigned_to);