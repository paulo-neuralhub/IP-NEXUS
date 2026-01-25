
-- =============================================
-- PERMITIR PLANTILLAS DE SISTEMA SIN ORGANIZATION_ID
-- =============================================

-- email_templates.organization_id debe ser nullable para plantillas de sistema
ALTER TABLE email_templates 
  ALTER COLUMN organization_id DROP NOT NULL;

-- Añadir comentario
COMMENT ON COLUMN email_templates.organization_id IS 'NULL para plantillas de sistema, UUID para plantillas de tenant';
