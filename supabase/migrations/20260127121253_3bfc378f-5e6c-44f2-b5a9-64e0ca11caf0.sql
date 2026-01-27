-- Añadir columnas de automatización a ipo_offices
ALTER TABLE ipo_offices 
ADD COLUMN IF NOT EXISTS automation_level CHAR(1) DEFAULT 'E' CHECK (automation_level IN ('A', 'B', 'C', 'D', 'E')),
ADD COLUMN IF NOT EXISTS automation_percentage INTEGER DEFAULT 0 CHECK (automation_percentage >= 0 AND automation_percentage <= 100),
ADD COLUMN IF NOT EXISTS capabilities JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS has_api BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS api_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS api_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS api_documentation_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS api_sandbox_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS api_authentication_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS e_filing_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS e_filing_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS online_payment BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_connected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS connection_status VARCHAR(20) DEFAULT 'disconnected',
ADD COLUMN IF NOT EXISTS connection_config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_sync_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS last_sync_status VARCHAR(20),
ADD COLUMN IF NOT EXISTS sync_frequency VARCHAR(20) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS support_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS support_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS working_hours JSONB,
ADD COLUMN IF NOT EXISTS supported_mark_types JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS uses_nice_classification BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS nice_version VARCHAR(10),
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS country_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS flag_emoji VARCHAR(10);

-- Crear índices para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_ipo_offices_automation ON ipo_offices(automation_level);
CREATE INDEX IF NOT EXISTS idx_ipo_offices_connected ON ipo_offices(is_connected);
CREATE INDEX IF NOT EXISTS idx_ipo_offices_connection_status ON ipo_offices(connection_status);

-- Comentarios
COMMENT ON COLUMN ipo_offices.automation_level IS 'Nivel de automatización: A (100%), B (75%), C (50%), D (25%), E (0%)';
COMMENT ON COLUMN ipo_offices.automation_percentage IS 'Porcentaje exacto de automatización 0-100';
COMMENT ON COLUMN ipo_offices.capabilities IS 'Capacidades detalladas: {filing, search, payment, document_upload, status_tracking, renewal, opposition}';