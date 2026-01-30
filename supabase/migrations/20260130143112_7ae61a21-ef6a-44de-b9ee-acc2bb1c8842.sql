-- Añadir columna style si no existe
ALTER TABLE document_templates 
ADD COLUMN IF NOT EXISTS style VARCHAR(50) DEFAULT 'classic';

-- Limpiar plantillas sin contenido HTML real
DELETE FROM document_templates 
WHERE content_html IS NULL 
   OR content_html = '' 
   OR is_system_template = true;

-- Crear índice para búsqueda por estilo y tipo
CREATE INDEX IF NOT EXISTS idx_document_templates_style_type 
ON document_templates(style, document_type);

-- Añadir comentario descriptivo
COMMENT ON COLUMN document_templates.style IS 'Visual style: classic, modern, minimal, corporate, elegant';