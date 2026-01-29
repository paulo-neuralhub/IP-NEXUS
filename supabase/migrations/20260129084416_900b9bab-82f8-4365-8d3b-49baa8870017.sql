-- =====================================================
-- MIGRACIÓN: Unificar contacts legacy con CRM
-- Añadir account_id a matters y deals para usar crm_accounts
-- =====================================================

-- 1. Añadir account_id a matters (referencia a crm_accounts)
ALTER TABLE matters ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES crm_accounts(id);

-- Crear índice para optimizar joins
CREATE INDEX IF NOT EXISTS idx_matters_account_id ON matters(account_id);

-- 2. Añadir account_id a deals si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'deals' 
    AND column_name = 'account_id'
  ) THEN
    ALTER TABLE deals ADD COLUMN account_id UUID REFERENCES crm_accounts(id);
  END IF;
END $$;

-- Crear índice para deals.account_id
CREATE INDEX IF NOT EXISTS idx_deals_account_id ON deals(account_id);

-- 3. Corregir matter_deadlines: añadir default a trigger_date
ALTER TABLE matter_deadlines 
ALTER COLUMN trigger_date SET DEFAULT NOW();

-- 4. Migrar datos existentes de matters (si hay client_id poblado)
-- Intenta vincular por nombre de empresa (company_name en contacts)
UPDATE matters m
SET account_id = (
  SELECT ca.id FROM crm_accounts ca 
  WHERE LOWER(ca.name) = LOWER((SELECT c.company_name FROM contacts c WHERE c.id = m.client_id))
  LIMIT 1
)
WHERE m.client_id IS NOT NULL 
  AND m.account_id IS NULL
  AND EXISTS (SELECT 1 FROM contacts c WHERE c.id = m.client_id AND c.company_name IS NOT NULL);

-- 5. Migrar datos existentes de deals (si hay contact_id poblado)
UPDATE deals d
SET account_id = (
  SELECT ca.id FROM crm_accounts ca 
  WHERE LOWER(ca.name) = LOWER((SELECT c.company_name FROM contacts c WHERE c.id = d.contact_id))
  LIMIT 1
)
WHERE d.contact_id IS NOT NULL 
  AND d.account_id IS NULL
  AND EXISTS (SELECT 1 FROM contacts c WHERE c.id = d.contact_id AND c.company_name IS NOT NULL);

-- 6. Añadir comentarios para documentar la migración
COMMENT ON COLUMN matters.account_id IS 'Referencia al cliente CRM (crm_accounts). Reemplaza client_id legacy.';
COMMENT ON COLUMN deals.account_id IS 'Referencia al cliente CRM (crm_accounts). Reemplaza contact_id/company_id legacy.';