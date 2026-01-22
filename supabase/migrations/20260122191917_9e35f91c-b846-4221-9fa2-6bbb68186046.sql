-- ============================================================
-- IP-NEXUS CRM - Pipeline Templates + Auto-init per Organization
-- Uses existing tables: public.pipelines, public.pipeline_stages
-- ============================================================

-- 1) Template tables (do NOT replace existing runtime tables)
CREATE TABLE IF NOT EXISTS public.crm_pipeline_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,

  name_es text NOT NULL,
  description_es text,

  category text,
  icon text,
  color text,

  pipeline_type text,
  sort_order integer NOT NULL DEFAULT 0,

  is_system boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,

  -- JSON array of stage objects
  -- Expected keys: code,name_es,name,probability,color,is_won_stage,is_lost_stage,required_fields,auto_actions
  default_stages jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- optional cross-template pointer by code
  auto_trigger_pipeline text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_pipeline_templates ENABLE ROW LEVEL SECURITY;

-- Readable by authenticated users; creation/update restricted to service/backoffice (handled elsewhere)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='crm_pipeline_templates' AND policyname='Read CRM pipeline templates'
  ) THEN
    CREATE POLICY "Read CRM pipeline templates"
    ON public.crm_pipeline_templates
    FOR SELECT
    USING (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.crm_pipeline_template_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES public.crm_pipeline_templates(id) ON DELETE SET NULL,
  action text NOT NULL,
  actor_user_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_pipeline_template_audit ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='crm_pipeline_template_audit' AND policyname='No direct access crm_pipeline_template_audit'
  ) THEN
    CREATE POLICY "No direct access crm_pipeline_template_audit"
    ON public.crm_pipeline_template_audit
    FOR ALL
    USING (false)
    WITH CHECK (false);
  END IF;
END $$;

-- 2) Extend existing runtime tables to keep linkage and stage codes
ALTER TABLE public.pipelines
  ADD COLUMN IF NOT EXISTS template_code text;

ALTER TABLE public.pipeline_stages
  ADD COLUMN IF NOT EXISTS code text;

CREATE INDEX IF NOT EXISTS idx_pipelines_template_code ON public.pipelines(template_code);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_code ON public.pipeline_stages(code);

-- 3) Seed SYSTEM templates (idempotent)
INSERT INTO public.crm_pipeline_templates (
  code, name_es, description_es, category, icon, color, pipeline_type, sort_order, is_system, is_active, default_stages
) VALUES
(
  'sales',
  'Captación de Clientes',
  'Pipeline de ventas para captación y cierre.',
  'crm',
  'trending-up',
  '#EC4899',
  'sales',
  10,
  true,
  true,
  jsonb_build_array(
    jsonb_build_object('code','lead_in','name_es','Lead Entrante','probability',10,'color','#94A3B8'),
    jsonb_build_object('code','contact','name_es','Contacto Inicial','probability',20,'color','#60A5FA'),
    jsonb_build_object('code','needs','name_es','Análisis de Necesidades','probability',35,'color','#3B82F6'),
    jsonb_build_object('code','proposal','name_es','Propuesta Enviada','probability',55,'color','#8B5CF6'),
    jsonb_build_object('code','negotiation','name_es','Negociación','probability',75,'color','#F59E0B'),
    jsonb_build_object('code','won','name_es','Cliente Ganado','probability',100,'color','#22C55E','is_won_stage',true),
    jsonb_build_object('code','lost','name_es','Perdido','probability',0,'color','#EF4444','is_lost_stage',true)
  )
),
(
  'registration',
  'Registro de Marca',
  'Pipeline operativo para el registro de marca.',
  'ip',
  'file-text',
  '#0EA5E9',
  'registration',
  20,
  true,
  true,
  jsonb_build_array(
    jsonb_build_object('code','request','name_es','Solicitud Recibida','probability',10,'color','#94A3B8'),
    jsonb_build_object('code','search','name_es','Búsqueda Anterioridades','probability',25,'color','#60A5FA'),
    jsonb_build_object('code','docs','name_es','Preparación Docs','probability',40,'color','#3B82F6'),
    jsonb_build_object('code','filing','name_es','Presentación Oficina','probability',55,'color','#0EA5E9'),
    jsonb_build_object('code','exam','name_es','En Examen','probability',70,'color','#8B5CF6'),
    jsonb_build_object('code','publication','name_es','Publicación','probability',85,'color','#F59E0B'),
    jsonb_build_object('code','granted','name_es','Concedida','probability',100,'color','#22C55E','is_won_stage',true),
    jsonb_build_object('code','denied','name_es','Denegada','probability',0,'color','#EF4444','is_lost_stage',true)
  )
),
(
  'oppositions',
  'Oposiciones / Litigios',
  'Pipeline para gestión de oposiciones y litigios.',
  'ip',
  'shield',
  '#8B5CF6',
  'oppositions',
  30,
  true,
  true,
  jsonb_build_array(
    jsonb_build_object('code','alert','name_es','Alerta Recibida','probability',10,'color','#94A3B8'),
    jsonb_build_object('code','risk','name_es','Análisis Riesgo','probability',25,'color','#F59E0B'),
    jsonb_build_object('code','client','name_es','Consulta Cliente','probability',40,'color','#60A5FA'),
    jsonb_build_object('code','action','name_es','Acción Iniciada','probability',55,'color','#3B82F6'),
    jsonb_build_object('code','briefs','name_es','Intercambio Escritos','probability',70,'color','#8B5CF6'),
    jsonb_build_object('code','hearing','name_es','Vista/Audiencia','probability',85,'color','#A855F7'),
    jsonb_build_object('code','resolved','name_es','Resolución','probability',100,'color','#22C55E','is_won_stage',true),
    jsonb_build_object('code','archived','name_es','Archivado','probability',0,'color','#64748B','is_lost_stage',true)
  )
),
(
  'renewals',
  'Renovaciones',
  'Pipeline para renovaciones y vencimientos.',
  'ip',
  'calendar',
  '#14B8A6',
  'renewals',
  40,
  true,
  true,
  jsonb_build_array(
    jsonb_build_object('code','upcoming','name_es','Próxima a Vencer','probability',10,'color','#F59E0B'),
    jsonb_build_object('code','notified','name_es','Cliente Notificado','probability',25,'color','#60A5FA'),
    jsonb_build_object('code','confirmed','name_es','Confirmación','probability',45,'color','#3B82F6'),
    jsonb_build_object('code','paid','name_es','Pago Procesado','probability',65,'color','#14B8A6'),
    jsonb_build_object('code','filed','name_es','Renovación Presentada','probability',85,'color','#0EA5E9'),
    jsonb_build_object('code','completed','name_es','Completada','probability',100,'color','#22C55E','is_won_stage',true)
  )
)
ON CONFLICT (code) DO UPDATE SET
  name_es = EXCLUDED.name_es,
  description_es = EXCLUDED.description_es,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  pipeline_type = EXCLUDED.pipeline_type,
  sort_order = EXCLUDED.sort_order,
  is_system = EXCLUDED.is_system,
  is_active = EXCLUDED.is_active,
  default_stages = EXCLUDED.default_stages,
  updated_at = now();

-- 4) RPC: initialize tenant pipelines from templates into runtime tables
CREATE OR REPLACE FUNCTION public.crm_initialize_tenant_pipelines(p_organization_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template record;
  v_pipeline_id uuid;
  v_stage jsonb;
  v_pos integer;
  v_count integer := 0;
BEGIN
  -- Skip platform orgs
  IF EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.id = p_organization_id AND COALESCE(o.is_platform_org,false) = true
  ) THEN
    RETURN 0;
  END IF;

  -- If already has tenant pipelines, do nothing
  IF EXISTS (
    SELECT 1 FROM public.pipelines p
    WHERE p.organization_id = p_organization_id AND p.owner_type = 'tenant'
  ) THEN
    RETURN 0;
  END IF;

  FOR v_template IN
    SELECT *
    FROM public.crm_pipeline_templates
    WHERE is_system = true AND is_active = true
    ORDER BY sort_order
  LOOP
    INSERT INTO public.pipelines (
      organization_id,
      owner_type,
      name,
      description,
      pipeline_type,
      is_default,
      is_active,
      position,
      template_code
    ) VALUES (
      p_organization_id,
      'tenant',
      v_template.name_es,
      v_template.description_es,
      v_template.pipeline_type,
      (v_count = 0),
      true,
      v_template.sort_order,
      v_template.code
    ) RETURNING id INTO v_pipeline_id;

    v_pos := 0;
    FOR v_stage IN SELECT * FROM jsonb_array_elements(v_template.default_stages)
    LOOP
      v_pos := v_pos + 1;
      INSERT INTO public.pipeline_stages (
        pipeline_id,
        name,
        color,
        probability,
        position,
        is_won_stage,
        is_lost_stage,
        required_fields,
        auto_actions,
        code
      ) VALUES (
        v_pipeline_id,
        COALESCE(v_stage->>'name_es', v_stage->>'name'),
        COALESCE(v_stage->>'color', '#94a3b8'),
        COALESCE((v_stage->>'probability')::integer, 0),
        v_pos,
        COALESCE((v_stage->>'is_won_stage')::boolean, false),
        COALESCE((v_stage->>'is_lost_stage')::boolean, false),
        NULL,
        COALESCE(v_stage->'auto_actions', '[]'::jsonb),
        v_stage->>'code'
      );
    END LOOP;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- 5) Trigger: after insert on organizations
CREATE OR REPLACE FUNCTION public.on_organization_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Skip platform orgs
  IF COALESCE(NEW.is_platform_org,false) = true THEN
    RETURN NEW;
  END IF;

  PERFORM public.crm_initialize_tenant_pipelines(NEW.id);
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_schema='public'
      AND event_object_table='organizations'
      AND trigger_name='trg_organization_created'
  ) THEN
    CREATE TRIGGER trg_organization_created
      AFTER INSERT ON public.organizations
      FOR EACH ROW
      EXECUTE FUNCTION public.on_organization_created();
  END IF;
END $$;
