-- Actualizar document_type para plantillas que lo tienen nulo
-- Basándose en el código y categoría

-- Power of Attorney templates
UPDATE document_templates 
SET document_type = 'letter'
WHERE code LIKE 'POA_%' AND document_type IS NULL;

-- Declarations
UPDATE document_templates 
SET document_type = 'certificate'
WHERE code LIKE 'DECL_%' AND document_type IS NULL;

-- Receipts/Certificates
UPDATE document_templates 
SET document_type = 'certificate'
WHERE code LIKE 'RECEIPT_%' AND document_type IS NULL;

-- Letters
UPDATE document_templates 
SET document_type = 'letter'
WHERE code LIKE 'LETTER_%' AND document_type IS NULL;

-- Reports
UPDATE document_templates 
SET document_type = 'report'
WHERE code LIKE 'REPORT_%' AND document_type IS NULL;

-- Verificar plantillas sin tipo
SELECT id, code, name, document_type, category 
FROM document_templates 
WHERE document_type IS NULL;