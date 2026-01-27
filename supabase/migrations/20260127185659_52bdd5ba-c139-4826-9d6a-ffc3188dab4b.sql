-- ============================================================
-- AI BRAIN FASE 4: PROMPTS STUDIO
-- Gestión de prompts versionados con workflow de aprobación
-- ============================================================

-- 1. Tabla principal de Prompts
CREATE TABLE IF NOT EXISTS ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relaciones
  task_id UUID REFERENCES ai_task_assignments(id) ON DELETE CASCADE,
  model_code VARCHAR(100),  -- NULL = prompt genérico para cualquier modelo
  
  -- Identificación
  name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Versionado
  version INTEGER NOT NULL DEFAULT 1,
  is_latest BOOLEAN DEFAULT TRUE,
  parent_version_id UUID REFERENCES ai_prompts(id),
  
  -- Contenido del prompt
  system_prompt TEXT,
  user_prompt_template TEXT NOT NULL,
  
  -- Variables (metadata de placeholders)
  variables JSONB DEFAULT '[]',
  
  -- Configuración de output
  output_format VARCHAR(20) DEFAULT 'text',
  output_schema JSONB,
  
  -- Tools (si el prompt usa function calling)
  tools_enabled BOOLEAN DEFAULT FALSE,
  tools_schema JSONB,
  
  -- Parámetros sugeridos
  suggested_temperature DECIMAL(3,2),
  suggested_max_tokens INTEGER,
  
  -- Estado de workflow
  status VARCHAR(20) DEFAULT 'draft',
  
  -- Métricas (calculadas de ejecuciones)
  execution_count INTEGER DEFAULT 0,
  avg_input_tokens INTEGER,
  avg_output_tokens INTEGER,
  avg_latency_ms INTEGER,
  avg_quality_score DECIMAL(3,2),
  success_rate DECIMAL(5,4),
  avg_cost DECIMAL(10,6),
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID,
  
  -- Review/Aprobación
  submitted_for_review_at TIMESTAMPTZ,
  submitted_by UUID,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  review_notes TEXT,
  
  -- Publicación
  published_at TIMESTAMPTZ,
  published_by UUID,
  
  -- Deprecación
  deprecated_at TIMESTAMPTZ,
  deprecated_by UUID,
  deprecation_reason TEXT
);

-- Índices para ai_prompts
CREATE INDEX IF NOT EXISTS idx_ai_prompts_task ON ai_prompts(task_id);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_status ON ai_prompts(status);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_latest ON ai_prompts(task_id, model_code, is_latest) WHERE is_latest = TRUE;

-- 2. Historial de Cambios de Prompts
CREATE TABLE IF NOT EXISTS ai_prompt_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES ai_prompts(id) ON DELETE CASCADE,
  
  -- Qué cambió
  field_changed VARCHAR(50) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  
  -- Quién y cuándo
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by UUID,
  change_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_ai_prompt_changes ON ai_prompt_changes(prompt_id, changed_at DESC);

-- 3. Comentarios en Prompts
CREATE TABLE IF NOT EXISTS ai_prompt_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES ai_prompts(id) ON DELETE CASCADE,
  
  -- Contenido
  comment TEXT NOT NULL,
  
  -- Tipo
  comment_type VARCHAR(20) DEFAULT 'general',
  
  -- Referencia a línea específica (opcional)
  line_number INTEGER,
  field_reference VARCHAR(50),
  
  -- Estado
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_ai_prompt_comments ON ai_prompt_comments(prompt_id);

-- 4. Función: Crear Nueva Versión de Prompt
CREATE OR REPLACE FUNCTION create_prompt_version(
  p_prompt_id UUID,
  p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_old_prompt RECORD;
  v_new_version INTEGER;
  v_new_id UUID;
BEGIN
  SELECT * INTO v_old_prompt FROM ai_prompts WHERE id = p_prompt_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prompt no encontrado';
  END IF;
  
  SELECT COALESCE(MAX(version), 0) + 1 INTO v_new_version
  FROM ai_prompts
  WHERE task_id = v_old_prompt.task_id 
    AND (model_code = v_old_prompt.model_code OR (model_code IS NULL AND v_old_prompt.model_code IS NULL));
  
  UPDATE ai_prompts SET is_latest = FALSE
  WHERE task_id = v_old_prompt.task_id 
    AND (model_code = v_old_prompt.model_code OR (model_code IS NULL AND v_old_prompt.model_code IS NULL));
  
  INSERT INTO ai_prompts (
    task_id, model_code, name, description,
    version, is_latest, parent_version_id,
    system_prompt, user_prompt_template, variables,
    output_format, output_schema, tools_enabled, tools_schema,
    suggested_temperature, suggested_max_tokens,
    status, created_by
  )
  VALUES (
    v_old_prompt.task_id, v_old_prompt.model_code, v_old_prompt.name, v_old_prompt.description,
    v_new_version, TRUE, p_prompt_id,
    v_old_prompt.system_prompt, v_old_prompt.user_prompt_template, v_old_prompt.variables,
    v_old_prompt.output_format, v_old_prompt.output_schema, v_old_prompt.tools_enabled, v_old_prompt.tools_schema,
    v_old_prompt.suggested_temperature, v_old_prompt.suggested_max_tokens,
    'draft', p_created_by
  )
  RETURNING id INTO v_new_id;
  
  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Función: Obtener Prompt Activo para Ejecución
CREATE OR REPLACE FUNCTION get_active_prompt(
  p_task_code VARCHAR,
  p_model_code VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  prompt_id UUID,
  version INTEGER,
  system_prompt TEXT,
  user_prompt_template TEXT,
  variables JSONB,
  output_format VARCHAR,
  output_schema JSONB,
  tools_schema JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.version, p.system_prompt, p.user_prompt_template,
    p.variables, p.output_format, p.output_schema, p.tools_schema
  FROM ai_prompts p
  JOIN ai_task_assignments t ON p.task_id = t.id
  WHERE t.task_code = p_task_code
    AND p.status = 'production'
    AND (p.model_code = p_model_code OR p.model_code IS NULL)
  ORDER BY 
    CASE WHEN p.model_code = p_model_code THEN 0 ELSE 1 END,
    p.version DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- 6. Función: Cambiar Estado de Prompt
CREATE OR REPLACE FUNCTION change_prompt_status(
  p_prompt_id UUID,
  p_new_status VARCHAR,
  p_user_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  message VARCHAR
) AS $$
DECLARE
  v_old_status VARCHAR;
  v_task_id UUID;
  v_model_code VARCHAR;
BEGIN
  SELECT status, task_id, model_code INTO v_old_status, v_task_id, v_model_code
  FROM ai_prompts WHERE id = p_prompt_id;
  
  -- Validar transiciones permitidas
  IF NOT (
    (v_old_status = 'draft' AND p_new_status IN ('review', 'deprecated')) OR
    (v_old_status = 'review' AND p_new_status IN ('draft', 'approved', 'deprecated')) OR
    (v_old_status = 'approved' AND p_new_status IN ('production', 'review', 'deprecated')) OR
    (v_old_status = 'production' AND p_new_status IN ('deprecated')) OR
    (v_old_status = 'deprecated' AND p_new_status IN ('draft'))
  ) THEN
    RETURN QUERY SELECT false, ('Transición no permitida: ' || v_old_status || ' -> ' || p_new_status)::VARCHAR;
    RETURN;
  END IF;
  
  -- Si se publica a producción, despublicar el anterior
  IF p_new_status = 'production' THEN
    UPDATE ai_prompts SET 
      status = 'deprecated',
      deprecated_at = NOW(),
      deprecated_by = p_user_id,
      deprecation_reason = 'Reemplazado por nueva versión'
    WHERE task_id = v_task_id
      AND (model_code = v_model_code OR (model_code IS NULL AND v_model_code IS NULL))
      AND status = 'production'
      AND id != p_prompt_id;
  END IF;
  
  -- Actualizar estado
  UPDATE ai_prompts SET
    status = p_new_status,
    updated_at = NOW(),
    updated_by = p_user_id,
    submitted_for_review_at = CASE WHEN p_new_status = 'review' THEN NOW() ELSE submitted_for_review_at END,
    submitted_by = CASE WHEN p_new_status = 'review' THEN p_user_id ELSE submitted_by END,
    reviewed_at = CASE WHEN p_new_status IN ('approved', 'draft') AND v_old_status = 'review' THEN NOW() ELSE reviewed_at END,
    reviewed_by = CASE WHEN p_new_status IN ('approved', 'draft') AND v_old_status = 'review' THEN p_user_id ELSE reviewed_by END,
    review_notes = CASE WHEN p_new_status IN ('approved', 'draft') AND v_old_status = 'review' THEN p_notes ELSE review_notes END,
    published_at = CASE WHEN p_new_status = 'production' THEN NOW() ELSE published_at END,
    published_by = CASE WHEN p_new_status = 'production' THEN p_user_id ELSE published_by END,
    deprecated_at = CASE WHEN p_new_status = 'deprecated' THEN NOW() ELSE deprecated_at END,
    deprecated_by = CASE WHEN p_new_status = 'deprecated' THEN p_user_id ELSE deprecated_by END,
    deprecation_reason = CASE WHEN p_new_status = 'deprecated' THEN p_notes ELSE deprecation_reason END
  WHERE id = p_prompt_id;
  
  RETURN QUERY SELECT true, 'Estado actualizado correctamente'::VARCHAR;
END;
$$ LANGUAGE plpgsql;

-- 7. Función: Comparar Dos Versiones
CREATE OR REPLACE FUNCTION compare_prompt_versions(
  p_version_a_id UUID,
  p_version_b_id UUID
)
RETURNS TABLE (
  field_name VARCHAR,
  version_a_value TEXT,
  version_b_value TEXT,
  is_different BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.field_name,
    CASE f.field_name
      WHEN 'system_prompt' THEN a.system_prompt
      WHEN 'user_prompt_template' THEN a.user_prompt_template
      WHEN 'variables' THEN a.variables::TEXT
      WHEN 'output_format' THEN a.output_format
      WHEN 'output_schema' THEN a.output_schema::TEXT
      WHEN 'suggested_temperature' THEN a.suggested_temperature::TEXT
      WHEN 'suggested_max_tokens' THEN a.suggested_max_tokens::TEXT
    END as version_a_value,
    CASE f.field_name
      WHEN 'system_prompt' THEN b.system_prompt
      WHEN 'user_prompt_template' THEN b.user_prompt_template
      WHEN 'variables' THEN b.variables::TEXT
      WHEN 'output_format' THEN b.output_format
      WHEN 'output_schema' THEN b.output_schema::TEXT
      WHEN 'suggested_temperature' THEN b.suggested_temperature::TEXT
      WHEN 'suggested_max_tokens' THEN b.suggested_max_tokens::TEXT
    END as version_b_value,
    CASE f.field_name
      WHEN 'system_prompt' THEN a.system_prompt IS DISTINCT FROM b.system_prompt
      WHEN 'user_prompt_template' THEN a.user_prompt_template IS DISTINCT FROM b.user_prompt_template
      WHEN 'variables' THEN a.variables IS DISTINCT FROM b.variables
      WHEN 'output_format' THEN a.output_format IS DISTINCT FROM b.output_format
      WHEN 'output_schema' THEN a.output_schema IS DISTINCT FROM b.output_schema
      WHEN 'suggested_temperature' THEN a.suggested_temperature IS DISTINCT FROM b.suggested_temperature
      WHEN 'suggested_max_tokens' THEN a.suggested_max_tokens IS DISTINCT FROM b.suggested_max_tokens
    END as is_different
  FROM ai_prompts a, ai_prompts b,
  (VALUES 
    ('system_prompt'::VARCHAR), ('user_prompt_template'::VARCHAR), ('variables'::VARCHAR),
    ('output_format'::VARCHAR), ('output_schema'::VARCHAR), ('suggested_temperature'::VARCHAR), ('suggested_max_tokens'::VARCHAR)
  ) AS f(field_name)
  WHERE a.id = p_version_a_id AND b.id = p_version_b_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Enable RLS
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompt_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompt_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for backoffice users)
CREATE POLICY "Allow all for ai_prompts" ON ai_prompts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for ai_prompt_changes" ON ai_prompt_changes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for ai_prompt_comments" ON ai_prompt_comments FOR ALL USING (true) WITH CHECK (true);