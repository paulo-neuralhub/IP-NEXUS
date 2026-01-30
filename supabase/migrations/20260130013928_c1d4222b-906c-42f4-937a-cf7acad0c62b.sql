-- Generate unique client tokens for accounts that don't have one
DO $$
DECLARE
  acc RECORD;
  base_token TEXT;
  new_token TEXT;
  counter INT;
BEGIN
  FOR acc IN 
    SELECT id, name, organization_id 
    FROM crm_accounts 
    WHERE client_token IS NULL AND name IS NOT NULL
  LOOP
    base_token := UPPER(LEFT(REGEXP_REPLACE(acc.name, '[^a-zA-Z]', '', 'g'), 3));
    IF base_token = '' OR LENGTH(base_token) < 2 THEN
      base_token := 'CLI';
    END IF;
    
    new_token := base_token;
    counter := 1;
    
    WHILE EXISTS (
      SELECT 1 FROM crm_accounts 
      WHERE organization_id = acc.organization_id 
      AND client_token = new_token
    ) LOOP
      counter := counter + 1;
      new_token := base_token || counter::TEXT;
    END LOOP;
    
    UPDATE crm_accounts SET client_token = new_token WHERE id = acc.id;
  END LOOP;
END $$;

-- Create unique index on client_token per organization
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_accounts_client_token 
ON crm_accounts(organization_id, client_token) 
WHERE client_token IS NOT NULL;