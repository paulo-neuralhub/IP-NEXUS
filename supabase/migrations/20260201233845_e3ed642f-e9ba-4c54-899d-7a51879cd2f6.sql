-- ============================================================
-- IP-NEXUS - MATTER PHASE DATA
-- PROMPT 21: Datos específicos por fase del workflow
-- ============================================================

-- Tabla para almacenar datos específicos de cada fase
CREATE TABLE IF NOT EXISTS matter_phase_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  phase_code VARCHAR(10) NOT NULL, -- F0, F1, F2, etc.
  
  -- Datos de la fase (estructura flexible por fase)
  data JSONB NOT NULL DEFAULT '{}',
  
  -- Checklist de la fase
  checklist JSONB DEFAULT '{}',
  
  -- Estado de completitud
  is_complete BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- Constraint único por matter y fase
  UNIQUE(matter_id, phase_code)
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_matter_phase_data_matter ON matter_phase_data(matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_phase_data_phase ON matter_phase_data(phase_code);
CREATE INDEX IF NOT EXISTS idx_matter_phase_data_org ON matter_phase_data(organization_id);

-- RLS
ALTER TABLE matter_phase_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view phase data in their organization"
ON matter_phase_data FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM team_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert phase data in their organization"
ON matter_phase_data FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM team_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update phase data in their organization"
ON matter_phase_data FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM team_members WHERE user_id = auth.uid()
  )
);

-- Función para obtener o crear datos de fase
CREATE OR REPLACE FUNCTION get_or_create_phase_data(
  p_matter_id UUID,
  p_phase_code VARCHAR(10)
)
RETURNS matter_phase_data
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phase_data matter_phase_data;
  v_org_id UUID;
BEGIN
  -- Obtener organization_id del matter
  SELECT organization_id INTO v_org_id FROM matters WHERE id = p_matter_id;
  
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Matter not found';
  END IF;
  
  -- Intentar obtener datos existentes
  SELECT * INTO v_phase_data 
  FROM matter_phase_data 
  WHERE matter_id = p_matter_id AND phase_code = p_phase_code;
  
  -- Si no existe, crear
  IF v_phase_data IS NULL THEN
    INSERT INTO matter_phase_data (matter_id, organization_id, phase_code, created_by)
    VALUES (p_matter_id, v_org_id, p_phase_code, auth.uid())
    RETURNING * INTO v_phase_data;
  END IF;
  
  RETURN v_phase_data;
END;
$$;

-- Función para actualizar datos de fase
CREATE OR REPLACE FUNCTION update_phase_data(
  p_matter_id UUID,
  p_phase_code VARCHAR(10),
  p_data JSONB,
  p_checklist JSONB DEFAULT NULL
)
RETURNS matter_phase_data
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phase_data matter_phase_data;
BEGIN
  -- Primero asegurar que existe
  PERFORM get_or_create_phase_data(p_matter_id, p_phase_code);
  
  -- Actualizar
  UPDATE matter_phase_data
  SET 
    data = COALESCE(data, '{}'::jsonb) || p_data,
    checklist = CASE WHEN p_checklist IS NOT NULL THEN p_checklist ELSE checklist END,
    updated_at = NOW()
  WHERE matter_id = p_matter_id AND phase_code = p_phase_code
  RETURNING * INTO v_phase_data;
  
  RETURN v_phase_data;
END;
$$;

-- Función para marcar fase como completa
CREATE OR REPLACE FUNCTION complete_phase(
  p_matter_id UUID,
  p_phase_code VARCHAR(10)
)
RETURNS matter_phase_data
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phase_data matter_phase_data;
BEGIN
  UPDATE matter_phase_data
  SET 
    is_complete = true,
    completed_at = NOW(),
    completed_by = auth.uid(),
    updated_at = NOW()
  WHERE matter_id = p_matter_id AND phase_code = p_phase_code
  RETURNING * INTO v_phase_data;
  
  RETURN v_phase_data;
END;
$$;