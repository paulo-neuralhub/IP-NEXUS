-- =============================================
-- MIGRACIÓN: Alinear subscription_plans con estructura propuesta
-- =============================================

-- Añadir columnas faltantes
ALTER TABLE subscription_plans 
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS max_matters INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS max_clients INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS max_contacts INTEGER DEFAULT 20,
  ADD COLUMN IF NOT EXISTS max_documents_month INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS included_modules TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS modules_to_choose INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_addon_modules INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS addon_discount_percent INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS included_voice_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS included_sms INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS included_whatsapp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS included_emails INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS included_ai_queries INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS icon TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT,
  ADD COLUMN IF NOT EXISTS badge TEXT,
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Renombrar sort_order a display_order si existe (migrar datos)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'subscription_plans' AND column_name = 'sort_order') THEN
    UPDATE subscription_plans SET display_order = sort_order WHERE display_order IS NULL OR display_order = 0;
  END IF;
END $$;

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_subscription_plans_code ON subscription_plans(code);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active) WHERE is_active = true;

-- Comentarios
COMMENT ON TABLE subscription_plans IS 'Planes de suscripción disponibles para la plataforma IP-NEXUS';
COMMENT ON COLUMN subscription_plans.tagline IS 'Eslogan corto del plan';
COMMENT ON COLUMN subscription_plans.included_modules IS 'Módulos incluidos en el plan base';
COMMENT ON COLUMN subscription_plans.modules_to_choose IS 'Número de módulos a elegir del catálogo';
COMMENT ON COLUMN subscription_plans.included_voice_minutes IS 'Minutos de voz incluidos mensualmente';
COMMENT ON COLUMN subscription_plans.included_ai_queries IS 'Consultas IA incluidas mensualmente';