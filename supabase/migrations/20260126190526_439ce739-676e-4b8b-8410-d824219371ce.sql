-- =============================================
-- L63-A: DEMO MODE CONFIGURATION
-- =============================================

-- Tabla de configuración del modo demo
CREATE TABLE IF NOT EXISTS demo_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  
  -- Estado
  is_active BOOLEAN DEFAULT FALSE,
  data_loaded BOOLEAN DEFAULT FALSE,
  
  -- Opciones de visualización
  show_guide BOOLEAN DEFAULT TRUE,
  show_highlights BOOLEAN DEFAULT TRUE,
  show_comparisons BOOLEAN DEFAULT TRUE,
  
  -- Personalización para el prospecto
  prospect_company VARCHAR(255),
  prospect_industry VARCHAR(100),
  prospect_contact_name VARCHAR(255),
  prospect_contact_email VARCHAR(255),
  
  -- Tracking
  demos_count INTEGER DEFAULT 0,
  last_demo_at TIMESTAMPTZ,
  avg_demo_duration_seconds INTEGER,
  total_demo_duration_seconds INTEGER DEFAULT 0,
  
  -- Estadísticas de conversión
  demos_converted INTEGER DEFAULT 0,
  demos_pending INTEGER DEFAULT 0,
  demos_lost INTEGER DEFAULT 0,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE demo_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Solo superadmins pueden gestionar
CREATE POLICY "Superadmins can manage demo_config"
ON demo_config FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM superadmins
    WHERE user_id = auth.uid() AND is_active = TRUE
  )
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_demo_config_org ON demo_config(organization_id);
CREATE INDEX IF NOT EXISTS idx_demo_config_active ON demo_config(is_active) WHERE is_active = TRUE;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_demo_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER demo_config_updated_at
  BEFORE UPDATE ON demo_config
  FOR EACH ROW
  EXECUTE FUNCTION update_demo_config_updated_at();

-- Tabla de sesiones de demo para tracking detallado
CREATE TABLE IF NOT EXISTS demo_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Datos del prospecto
  prospect_company VARCHAR(255),
  prospect_contact_name VARCHAR(255),
  prospect_contact_email VARCHAR(255),
  prospect_industry VARCHAR(100),
  
  -- Sesión
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Módulos visitados
  modules_visited TEXT[] DEFAULT '{}',
  features_shown TEXT[] DEFAULT '{}',
  
  -- Resultado
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN (
    'in_progress',
    'completed',
    'converted',
    'pending',
    'lost'
  )),
  
  -- Notas
  notes TEXT,
  follow_up_date DATE,
  
  -- Presenter
  presenter_id UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE demo_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Superadmins can manage demo_sessions"
ON demo_sessions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM superadmins
    WHERE user_id = auth.uid() AND is_active = TRUE
  )
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_demo_sessions_org ON demo_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_status ON demo_sessions(status);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_started ON demo_sessions(started_at DESC);