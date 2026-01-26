-- =============================================
-- L60-B: Portal Authentication - Campos adicionales
-- =============================================

-- Añadir campos de reset de password si no existen
ALTER TABLE public.portal_users 
  ADD COLUMN IF NOT EXISTS reset_token TEXT,
  ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Índices para tokens
CREATE INDEX IF NOT EXISTS idx_portal_users_reset_token 
  ON portal_users(reset_token) WHERE reset_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_portal_users_magic_token 
  ON portal_users(magic_link_token) WHERE magic_link_token IS NOT NULL;

-- Índice para búsqueda por email
CREATE INDEX IF NOT EXISTS idx_portal_users_email_lower 
  ON portal_users(LOWER(email));

-- Comentarios
COMMENT ON COLUMN portal_users.reset_token IS 'Token para reset de password';
COMMENT ON COLUMN portal_users.reset_token_expires_at IS 'Expiración del token de reset';
COMMENT ON COLUMN portal_users.email_verified IS 'Si el email ha sido verificado';
COMMENT ON COLUMN portal_users.password_hash IS 'Hash bcrypt de la contraseña';