-- Add client_token column to crm_accounts for matter number generation
ALTER TABLE crm_accounts 
ADD COLUMN IF NOT EXISTS client_token TEXT;