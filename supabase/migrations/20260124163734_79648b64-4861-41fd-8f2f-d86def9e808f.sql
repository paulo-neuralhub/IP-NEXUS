-- =============================================
-- Ampliación tabla service_catalog para catálogo de servicios PI
-- =============================================

-- Añadir columnas adicionales
ALTER TABLE service_catalog 
ADD COLUMN IF NOT EXISTS reference_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS service_type VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS jurisdiction VARCHAR(10),
ADD COLUMN IF NOT EXISTS official_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS professional_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_days INTEGER,
ADD COLUMN IF NOT EXISTS nice_classes_included INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS extra_class_fee DECIMAL(10,2) DEFAULT 0;

-- Crear índice único para reference_code por organización
CREATE UNIQUE INDEX IF NOT EXISTS idx_service_catalog_reference_org 
ON service_catalog(organization_id, reference_code) 
WHERE reference_code IS NOT NULL;

-- Crear índice para búsquedas por tipo y jurisdicción
CREATE INDEX IF NOT EXISTS idx_service_catalog_type_jurisdiction 
ON service_catalog(organization_id, service_type, jurisdiction);

-- Comentarios
COMMENT ON COLUMN service_catalog.reference_code IS 'Código único de referencia (ej: MAR-REG-ES-001)';
COMMENT ON COLUMN service_catalog.service_type IS 'Tipo: marca, patente, diseño, vigilancia, renovacion, oposicion, informe, general';
COMMENT ON COLUMN service_catalog.jurisdiction IS 'Jurisdicción: ES, EU, INT, US, etc. NULL = todas';
COMMENT ON COLUMN service_catalog.official_fee IS 'Tasa oficial de la oficina';
COMMENT ON COLUMN service_catalog.professional_fee IS 'Honorarios profesionales';
COMMENT ON COLUMN service_catalog.estimated_days IS 'Plazo estimado en días';
COMMENT ON COLUMN service_catalog.nice_classes_included IS 'Número de clases Niza incluidas en precio base';
COMMENT ON COLUMN service_catalog.extra_class_fee IS 'Coste por clase adicional';