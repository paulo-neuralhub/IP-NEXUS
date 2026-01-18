-- Añadir idioma por defecto a organizaciones
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'en';

-- Añadir idioma preferido a usuarios (override)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferred_language TEXT;

-- Comentarios
COMMENT ON COLUMN organizations.default_language IS 'Idioma por defecto para nuevos usuarios de la org';
COMMENT ON COLUMN users.preferred_language IS 'Idioma preferido del usuario (sobreescribe org)';