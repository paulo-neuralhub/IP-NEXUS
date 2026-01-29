-- ============================================================
-- L88: TABLA WORKFLOW_PHASES - Sistema de Fases de Expedientes
-- ============================================================

-- Tabla de definición de fases (plantilla)
CREATE TABLE IF NOT EXISTS workflow_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL, -- F0, F1, F2...
  name VARCHAR(100) NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  color VARCHAR(20),
  icon VARCHAR(50),
  default_tasks JSONB DEFAULT '[]', -- Tareas predefinidas para esta fase
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

-- Enable RLS
ALTER TABLE workflow_phases ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view workflow phases of their organization" ON workflow_phases
  FOR SELECT USING (
    organization_id IS NULL OR 
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage workflow phases" ON workflow_phases
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Datos iniciales de las 10 fases (plantilla global, organization_id = NULL)
INSERT INTO workflow_phases (organization_id, code, name, description, position, color, icon) VALUES
(NULL, 'F0', 'Apertura', 'Crear expediente, asignar responsable, verificar conflictos', 0, '#6B7280', 'folder-open'),
(NULL, 'F1', 'Encargo', 'Conflictos, carta encargo, presupuesto, poderes', 1, '#3B82F6', 'file-signature'),
(NULL, 'F2', 'Estrategia', 'Definir alcance, plan de acción, análisis de riesgos', 2, '#8B5CF6', 'target'),
(NULL, 'F3', 'Inputs', 'Recolección de documentos, evidencias, materiales', 3, '#06B6D4', 'upload'),
(NULL, 'F4', 'Preparación', 'Redacción técnica/legal, revisión interna', 4, '#F59E0B', 'edit'),
(NULL, 'F5', 'Aprobación', 'Revisión QA, aprobación cliente, firma', 5, '#F97316', 'check-circle'),
(NULL, 'F6', 'Ejecución', 'Filing, presentación ante oficina', 6, '#6366F1', 'send'),
(NULL, 'F7', 'Tramitación', 'Requerimientos, oposiciones, plazos oficiales', 7, '#EC4899', 'clock'),
(NULL, 'F8', 'Resolución', 'Concesión, denegación, acuerdo, sentencia', 8, '#10B981', 'gavel'),
(NULL, 'F9', 'Post-servicio', 'Renovaciones, vigilancia, archivo, cierre', 9, '#475569', 'archive')
ON CONFLICT (organization_id, code) DO NOTHING;

-- Añadir columnas a matters para tracking de workflow
ALTER TABLE matters ADD COLUMN IF NOT EXISTS current_phase VARCHAR(10) DEFAULT 'F0';
ALTER TABLE matters ADD COLUMN IF NOT EXISTS phase_started_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE matters ADD COLUMN IF NOT EXISTS phase_history JSONB DEFAULT '[]';

-- Índice para búsqueda de expedientes por fase
CREATE INDEX IF NOT EXISTS idx_matters_current_phase ON matters(current_phase);
CREATE INDEX IF NOT EXISTS idx_matters_phase_started_at ON matters(phase_started_at);

-- Función para avanzar fase con historial
CREATE OR REPLACE FUNCTION advance_matter_phase(
  p_matter_id UUID,
  p_new_phase VARCHAR(10),
  p_notes TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_phase VARCHAR(10);
  v_phase_history JSONB;
  v_new_entry JSONB;
  v_result JSONB;
BEGIN
  -- Obtener fase actual
  SELECT current_phase, phase_history INTO v_current_phase, v_phase_history
  FROM matters WHERE id = p_matter_id;
  
  IF v_current_phase IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Matter not found');
  END IF;
  
  -- Construir nueva entrada de historial
  v_new_entry := jsonb_build_object(
    'from', v_current_phase,
    'to', p_new_phase,
    'changed_at', NOW(),
    'changed_by', COALESCE(p_user_id, auth.uid()),
    'notes', p_notes
  );
  
  -- Actualizar matter
  UPDATE matters SET
    current_phase = p_new_phase,
    phase_started_at = NOW(),
    phase_history = COALESCE(v_phase_history, '[]'::jsonb) || v_new_entry,
    updated_at = NOW()
  WHERE id = p_matter_id;
  
  -- Registrar en timeline
  INSERT INTO matter_timeline (
    matter_id, event_type, title, description, metadata, created_by
  ) VALUES (
    p_matter_id,
    'phase_change',
    'Fase avanzada a ' || p_new_phase,
    p_notes,
    jsonb_build_object('from', v_current_phase, 'to', p_new_phase),
    COALESCE(p_user_id, auth.uid())
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'from', v_current_phase,
    'to', p_new_phase
  );
END;
$$;