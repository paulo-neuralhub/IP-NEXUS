-- PROMPT 27-FIX: Añadir columnas faltantes a crm_accounts para ficha enterprise

-- Datos de empresa
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS trade_name TEXT;
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS tax_id_type TEXT DEFAULT 'CIF';
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS tax_country TEXT DEFAULT 'ES';

-- Dirección
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS address_line1 TEXT;
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS address_line2 TEXT;
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS state_province TEXT;
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'ES';

-- Contacto
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS fax TEXT;
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS website TEXT;

-- Datos de agente
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS agent_license_number TEXT;
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS agent_jurisdictions TEXT[];

-- Sector
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS industry TEXT;

-- Notas internas (si no existe)
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS notes TEXT;