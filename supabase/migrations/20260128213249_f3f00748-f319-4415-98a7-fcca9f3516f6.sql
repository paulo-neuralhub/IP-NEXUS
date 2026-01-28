-- Add assigned_to column to crm_deals (references users table)
ALTER TABLE crm_deals ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);

-- Add assigned_to column to crm_accounts (references users table)
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);

-- Create indexes for faster lookups by assigned user
CREATE INDEX IF NOT EXISTS idx_crm_leads_assigned ON crm_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_deals_assigned ON crm_deals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_accounts_assigned ON crm_accounts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_assigned ON crm_tasks(assigned_to);