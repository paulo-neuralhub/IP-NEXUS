-- AI module configuration (Assistant vs Genius) - retry without nested $$

-- 0) Ensure updated_at trigger function exists (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $fn$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql SET search_path = public;

-- 1) Table
CREATE TABLE IF NOT EXISTS public.ai_module_config (
  module_code TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  description TEXT,
  included_in_plans TEXT[] NOT NULL DEFAULT '{}'::text[],
  monthly_limit INT NULL,
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Trigger + indexes
DROP TRIGGER IF EXISTS trg_ai_module_config_updated_at ON public.ai_module_config;
CREATE TRIGGER trg_ai_module_config_updated_at
BEFORE UPDATE ON public.ai_module_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS ai_module_config_plans_gin_idx
  ON public.ai_module_config USING GIN (included_in_plans);

-- 3) RLS
ALTER TABLE public.ai_module_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "AI module config is readable for authenticated" ON public.ai_module_config;
CREATE POLICY "AI module config is readable for authenticated"
ON public.ai_module_config
FOR SELECT
TO authenticated
USING (true);

-- 4) Seed/Upsert
INSERT INTO public.ai_module_config (module_code, display_name, description, included_in_plans, monthly_limit, features)
VALUES
(
  'assistant',
  'Asistente IP-NEXUS',
  'Ayuda contextual y consultas generales de PI. Sin análisis ni generación de documentos.',
  ARRAY['starter','professional','business','enterprise'],
  50,
  jsonb_build_object(
    'general_ip_qna', true,
    'contextual_help', true,
    'faq_guides', true,
    'doc_analysis', false,
    'document_generation', false,
    'predictions', false,
    'jurisdiction_full_access', false
  )
),
(
  'genius',
  'IP-GENIUS',
  'Módulo premium de IA para análisis, generación de documentos y capacidades avanzadas.',
  ARRAY['business','enterprise'],
  NULL,
  jsonb_build_object(
    'registrability_scoring', true,
    'document_generation', true,
    'examiner_predictions', true,
    'brand_valuation', true,
    'unlimited_queries', true,
    'jurisdiction_full_access', true
  )
)
ON CONFLICT (module_code)
DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  included_in_plans = EXCLUDED.included_in_plans,
  monthly_limit = EXCLUDED.monthly_limit,
  features = EXCLUDED.features,
  updated_at = now();
