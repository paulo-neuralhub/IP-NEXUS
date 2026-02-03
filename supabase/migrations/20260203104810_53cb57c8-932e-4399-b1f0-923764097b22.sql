
-- =====================================================================
-- MIGRACIÓN: Nuevo Motor de Automatizaciones IP-NEXUS
-- Renombramos tablas antiguas y creamos el nuevo schema
-- =====================================================================

-- 1. Renombrar tablas antiguas a _legacy (mantener datos por si acaso)
ALTER TABLE IF EXISTS master_automation_templates RENAME TO master_automation_templates_legacy;
ALTER TABLE IF EXISTS tenant_automation_configs RENAME TO tenant_automation_configs_legacy;
ALTER TABLE IF EXISTS automation_execution_logs RENAME TO automation_execution_logs_legacy;

-- =====================================================================
-- 2. AUTOMATION MASTER TEMPLATES
-- Definiciones maestras de automatizaciones creadas en backoffice.
-- Solo admins globales pueden CRUD aquí.
-- =====================================================================

CREATE TABLE automation_master_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación
  code VARCHAR(100) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  description_en TEXT,
  
  -- Categorización
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'deadlines', 'communication', 'case_management', 
    'billing', 'ip_surveillance', 'internal', 'reporting'
  )),
  icon VARCHAR(10) DEFAULT '⚡',
  color VARCHAR(7) DEFAULT '#6366F1',
  
  -- Tipo de visibilidad para tenants
  visibility VARCHAR(20) NOT NULL DEFAULT 'optional' CHECK (visibility IN (
    'system', 'mandatory', 'recommended', 'optional'
  )),
  
  -- Control de plan
  min_plan_tier VARCHAR(20) DEFAULT 'free' CHECK (min_plan_tier IN (
    'free', 'starter', 'professional', 'enterprise'
  )),
  
  -- Trigger (QUÉ lo dispara)
  trigger_type VARCHAR(30) NOT NULL CHECK (trigger_type IN (
    'db_event', 'field_change', 'cron', 'date_relative', 'webhook', 'manual'
  )),
  trigger_config JSONB NOT NULL DEFAULT '{}',
  
  -- Condiciones (CUÁNDO ejecutar)
  conditions JSONB NOT NULL DEFAULT '[]',
  
  -- Acciones (QUÉ hacer) — secuencia ordenada
  actions JSONB NOT NULL DEFAULT '[]',
  
  -- Parámetros configurables por tenant
  configurable_params JSONB NOT NULL DEFAULT '[]',
  
  -- Control de versión y publicación
  version INTEGER NOT NULL DEFAULT 1,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  related_entity VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  
  -- Auditoría
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_amt_category ON automation_master_templates(category);
CREATE INDEX idx_amt_visibility ON automation_master_templates(visibility);
CREATE INDEX idx_amt_published ON automation_master_templates(is_published, is_active);
CREATE INDEX idx_amt_trigger ON automation_master_templates(trigger_type);
CREATE INDEX idx_amt_plan ON automation_master_templates(min_plan_tier);
CREATE INDEX idx_amt_code ON automation_master_templates(code);

-- RLS: Solo super admins (usando is_backoffice_staff existente)
ALTER TABLE automation_master_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Backoffice staff full access on automation_master_templates"
  ON automation_master_templates
  FOR ALL
  USING (public.is_backoffice_staff());

-- =====================================================================
-- 3. TENANT AUTOMATIONS
-- Instancia de automatización por cada tenant.
-- =====================================================================

CREATE TABLE tenant_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Relación con template maestro (NULL si es custom)
  master_template_id UUID REFERENCES automation_master_templates(id) ON DELETE SET NULL,
  master_template_version INTEGER,
  
  -- Identificación
  name TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'deadlines', 'communication', 'case_management', 
    'billing', 'ip_surveillance', 'internal', 'reporting', 'custom'
  )),
  icon VARCHAR(10) DEFAULT '⚡',
  
  -- Estado
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  
  -- Configuración del trigger
  trigger_type VARCHAR(30) NOT NULL,
  trigger_config JSONB NOT NULL DEFAULT '{}',
  
  -- Condiciones
  conditions JSONB NOT NULL DEFAULT '[]',
  
  -- Acciones
  actions JSONB NOT NULL DEFAULT '[]',
  
  -- Parámetros personalizados del tenant
  custom_params JSONB NOT NULL DEFAULT '{}',
  
  -- Estadísticas
  last_run_at TIMESTAMPTZ,
  run_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  
  -- Auditoría
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(organization_id, master_template_id)
);

-- Índices
CREATE INDEX idx_ta_org ON tenant_automations(organization_id);
CREATE INDEX idx_ta_master ON tenant_automations(master_template_id);
CREATE INDEX idx_ta_active ON tenant_automations(organization_id, is_active);
CREATE INDEX idx_ta_category ON tenant_automations(organization_id, category);
CREATE INDEX idx_ta_trigger ON tenant_automations(trigger_type);

-- RLS
ALTER TABLE tenant_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants manage own automations"
  ON tenant_automations
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Backoffice staff full access on tenant_automations"
  ON tenant_automations
  FOR ALL
  USING (public.is_backoffice_staff());

-- =====================================================================
-- 4. AUTOMATION EXECUTIONS
-- Historial de cada ejecución de automatización.
-- =====================================================================

CREATE TABLE automation_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tenant_automation_id UUID NOT NULL REFERENCES tenant_automations(id) ON DELETE CASCADE,
  
  -- Contexto de ejecución
  trigger_type VARCHAR(30) NOT NULL,
  trigger_data JSONB DEFAULT '{}',
  entity_type VARCHAR(50),
  entity_id UUID,
  
  -- Resultado
  status VARCHAR(20) NOT NULL DEFAULT 'running' CHECK (status IN (
    'running', 'success', 'partial', 'error', 'skipped', 'cancelled'
  )),
  
  -- Detalle de acciones ejecutadas
  actions_log JSONB NOT NULL DEFAULT '[]',
  
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  
  -- Métricas
  duration_ms INTEGER,
  
  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Idempotency
  idempotency_key VARCHAR(255),
  UNIQUE(idempotency_key)
);

-- Índices
CREATE INDEX idx_ae_org ON automation_executions(organization_id);
CREATE INDEX idx_ae_automation ON automation_executions(tenant_automation_id);
CREATE INDEX idx_ae_status ON automation_executions(organization_id, status);
CREATE INDEX idx_ae_entity ON automation_executions(entity_type, entity_id);
CREATE INDEX idx_ae_started ON automation_executions(organization_id, started_at DESC);
CREATE INDEX idx_ae_idempotency ON automation_executions(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- RLS
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants see own executions"
  ON automation_executions
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Backoffice staff full access on automation_executions"
  ON automation_executions
  FOR ALL
  USING (public.is_backoffice_staff());

-- =====================================================================
-- 5. AUTOMATION VARIABLES
-- Variables globales y por tenant para usar en templates.
-- =====================================================================

CREATE TABLE automation_variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  key VARCHAR(100) NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  
  is_system BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(organization_id, key)
);

-- RLS
ALTER TABLE automation_variables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read own or global variables"
  ON automation_variables
  FOR SELECT
  USING (
    organization_id IS NULL
    OR organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Tenants manage own variables"
  ON automation_variables
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid()
    )
    AND is_system = false
  );

CREATE POLICY "Backoffice staff full access on automation_variables"
  ON automation_variables
  FOR ALL
  USING (public.is_backoffice_staff());

-- =====================================================================
-- 6. FUNCIONES
-- =====================================================================

-- Provisionar automatizaciones cuando se crea un tenant nuevo
CREATE OR REPLACE FUNCTION provision_tenant_automations(p_org_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR v_template IN
    SELECT * FROM automation_master_templates
    WHERE is_published = true
    AND is_active = true
    AND visibility != 'system'
  LOOP
    INSERT INTO tenant_automations (
      organization_id,
      master_template_id,
      master_template_version,
      name,
      description,
      category,
      icon,
      is_active,
      is_custom,
      is_locked,
      trigger_type,
      trigger_config,
      conditions,
      actions,
      custom_params
    ) VALUES (
      p_org_id,
      v_template.id,
      v_template.version,
      v_template.name,
      v_template.description,
      v_template.category,
      v_template.icon,
      CASE WHEN v_template.visibility IN ('mandatory', 'recommended') THEN true ELSE false END,
      false,
      CASE WHEN v_template.visibility = 'mandatory' THEN true ELSE false END,
      v_template.trigger_type,
      v_template.trigger_config,
      v_template.conditions,
      v_template.actions,
      '{}'::jsonb
    )
    ON CONFLICT (organization_id, master_template_id) DO NOTHING;
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$;

-- Propagar actualización de template maestro a tenants
CREATE OR REPLACE FUNCTION propagate_master_template_update(p_template_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template RECORD;
  v_count INTEGER;
BEGIN
  SELECT * INTO v_template
  FROM automation_master_templates
  WHERE id = p_template_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template % not found', p_template_id;
  END IF;
  
  UPDATE tenant_automations
  SET
    name = v_template.name,
    description = v_template.description,
    icon = v_template.icon,
    trigger_type = v_template.trigger_type,
    trigger_config = v_template.trigger_config,
    conditions = v_template.conditions,
    actions = v_template.actions,
    master_template_version = v_template.version,
    is_locked = CASE WHEN v_template.visibility = 'mandatory' THEN true ELSE is_locked END,
    updated_at = NOW()
  WHERE master_template_id = p_template_id
  AND is_custom = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Obtener valor efectivo de un parámetro configurable
CREATE OR REPLACE FUNCTION get_automation_param_value(
  p_tenant_automation_id UUID,
  p_param_key TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_custom_value JSONB;
  v_default_value JSONB;
  v_params JSONB;
BEGIN
  SELECT custom_params->p_param_key INTO v_custom_value
  FROM tenant_automations
  WHERE id = p_tenant_automation_id;
  
  IF v_custom_value IS NOT NULL THEN
    RETURN v_custom_value;
  END IF;
  
  SELECT amt.configurable_params INTO v_params
  FROM tenant_automations ta
  JOIN automation_master_templates amt ON amt.id = ta.master_template_id
  WHERE ta.id = p_tenant_automation_id;
  
  IF v_params IS NOT NULL THEN
    SELECT elem->'default_value'
    INTO v_default_value
    FROM jsonb_array_elements(v_params) AS elem
    WHERE elem->>'key' = p_param_key;
  END IF;
  
  RETURN COALESCE(v_default_value, 'null'::jsonb);
END;
$$;

-- =====================================================================
-- 7. TRIGGERS para updated_at
-- =====================================================================

CREATE TRIGGER set_updated_at_automation_master_templates
  BEFORE UPDATE ON automation_master_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_tenant_automations
  BEFORE UPDATE ON tenant_automations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_automation_variables
  BEFORE UPDATE ON automation_variables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
