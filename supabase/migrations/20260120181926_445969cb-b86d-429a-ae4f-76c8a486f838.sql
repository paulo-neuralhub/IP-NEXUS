-- =============================================
-- PROMPT 48: RULES ENGINE TABLES (Missing parts)
-- =============================================

-- Check if help_rules exists, if not create it
CREATE TABLE IF NOT EXISTS public.help_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Rule configuration
  rule_type TEXT DEFAULT 'contextual' CHECK (rule_type IN ('contextual', 'proactive', 'onboarding', 'error')),
  priority INT DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  
  -- Conditions (JSON for flexibility)
  conditions JSONB DEFAULT '{}',
  
  -- Target
  target_article_id UUID REFERENCES public.help_articles(id),
  target_url TEXT,
  custom_content TEXT,
  custom_title TEXT,
  
  -- Display settings
  display_type TEXT DEFAULT 'tooltip' CHECK (display_type IN ('tooltip', 'modal', 'banner', 'sidebar', 'floating')),
  display_delay_ms INT DEFAULT 0,
  display_duration_ms INT,
  
  -- Limits
  max_displays_per_user INT DEFAULT 3,
  max_displays_per_session INT DEFAULT 1,
  cooldown_hours INT DEFAULT 24,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Rule triggers table
CREATE TABLE IF NOT EXISTS public.help_rule_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES public.help_rules(id) ON DELETE CASCADE,
  
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('page_visit', 'element_click', 'element_hover', 'form_focus', 'error', 'idle', 'scroll', 'first_visit', 'custom')),
  trigger_target TEXT, -- CSS selector, page path, or error code
  trigger_config JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rule execution log
CREATE TABLE IF NOT EXISTS public.help_rule_execution_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES public.help_rules(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  organization_id UUID REFERENCES public.organizations(id),
  
  trigger_type TEXT,
  trigger_context JSONB DEFAULT '{}',
  
  action_taken TEXT CHECK (action_taken IN ('displayed', 'dismissed', 'clicked', 'completed')),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Search logs if not exists
CREATE TABLE IF NOT EXISTS public.help_search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  organization_id UUID REFERENCES public.organizations(id),
  
  query TEXT NOT NULL,
  results_count INT DEFAULT 0,
  clicked_article_id UUID REFERENCES public.help_articles(id),
  
  context_page TEXT,
  context_module TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_help_rules_active ON public.help_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_help_rules_type ON public.help_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_help_triggers_rule ON public.help_rule_triggers(rule_id);
CREATE INDEX IF NOT EXISTS idx_help_triggers_type ON public.help_rule_triggers(trigger_type);
CREATE INDEX IF NOT EXISTS idx_help_execution_rule ON public.help_rule_execution_log(rule_id);
CREATE INDEX IF NOT EXISTS idx_help_execution_user ON public.help_rule_execution_log(user_id);
CREATE INDEX IF NOT EXISTS idx_help_search_user ON public.help_search_logs(user_id);

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE public.help_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_rule_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_rule_execution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_search_logs ENABLE ROW LEVEL SECURITY;

-- Rules: everyone can read active rules
CREATE POLICY "Anyone can read active help rules"
  ON public.help_rules FOR SELECT
  USING (is_active = true);

-- Triggers: everyone can read
CREATE POLICY "Anyone can read help rule triggers"
  ON public.help_rule_triggers FOR SELECT
  USING (true);

-- Execution log: users can insert and read their own
CREATE POLICY "Users can insert rule execution logs"
  ON public.help_rule_execution_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own execution logs"
  ON public.help_rule_execution_log FOR SELECT
  USING (auth.uid() = user_id);

-- Search logs
CREATE POLICY "Users can insert search logs"
  ON public.help_search_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own search logs"
  ON public.help_search_logs FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================
-- SEED INITIAL CONTEXTUAL RULES
-- =============================================

INSERT INTO public.help_rules (code, name, description, rule_type, conditions, custom_title, custom_content, display_type, priority) VALUES
  ('first-docket-visit', 'First Docket Visit', 'Welcome message for first-time docket visitors', 'onboarding', '{"module": "docket"}', 'Bienvenido al Docket', 'Aquí puedes gestionar todos tus expedientes de Propiedad Intelectual. Usa los filtros para encontrar expedientes específicos o crea uno nuevo.', 'floating', 100),
  ('smart-tasks-help', 'Smart Tasks Help', 'Explain the Date Trident concept', 'contextual', '{"page": "/app/docket/god-mode", "tab": "tasks"}', 'Sistema Date Trident', 'Las Smart Tasks usan tres fechas clave: Activación (cuando empieza), Recordatorio (aviso previo), y Vencimiento (fecha límite).', 'tooltip', 80),
  ('spider-first-use', 'Spider First Use', 'Guide for setting up first watch', 'onboarding', '{"module": "spider"}', 'Configura tu primera vigilancia', 'Spider monitorea marcas similares a las tuyas. Configura alertas para recibir notificaciones cuando se detecten posibles conflictos.', 'modal', 90),
  ('genius-ai-intro', 'Genius AI Introduction', 'Explain AI capabilities', 'contextual', '{"module": "genius"}', 'Tu Asistente Legal IA', 'GENIUS puede analizar documentos, generar borradores y responder preguntas sobre Propiedad Intelectual. Toda la información está protegida.', 'floating', 85),
  ('empty-portfolio', 'Empty Portfolio Help', 'Help when no matters exist', 'proactive', '{"condition": "no_matters"}', '¿Empezamos?', 'Parece que aún no tienes expedientes. Crea tu primer expediente o importa datos desde un archivo Excel.', 'banner', 70)
ON CONFLICT (code) DO NOTHING;

-- Add triggers for the rules
INSERT INTO public.help_rule_triggers (rule_id, trigger_type, trigger_target)
SELECT r.id, 'page_visit', '/app/docket'
FROM public.help_rules r WHERE r.code = 'first-docket-visit'
ON CONFLICT DO NOTHING;

INSERT INTO public.help_rule_triggers (rule_id, trigger_type, trigger_target)
SELECT r.id, 'element_hover', '[data-help="smart-tasks"]'
FROM public.help_rules r WHERE r.code = 'smart-tasks-help'
ON CONFLICT DO NOTHING;

INSERT INTO public.help_rule_triggers (rule_id, trigger_type, trigger_target)
SELECT r.id, 'first_visit', '/app/spider'
FROM public.help_rules r WHERE r.code = 'spider-first-use'
ON CONFLICT DO NOTHING;