-- PROMPT 28: Añadir columnas faltantes para ficha cliente completa
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS billing_email TEXT;
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS payment_terms INTEGER DEFAULT 30;
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(12,2);
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';

-- Comentarios para documentación
COMMENT ON COLUMN crm_accounts.billing_email IS 'Email específico para facturación';
COMMENT ON COLUMN crm_accounts.payment_terms IS 'Plazo de pago en días (30, 60, 90)';
COMMENT ON COLUMN crm_accounts.credit_limit IS 'Límite de crédito del cliente';
COMMENT ON COLUMN crm_accounts.currency IS 'Moneda por defecto del cliente';