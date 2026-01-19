-- ============================================================
-- IP-NEXUS AI BRAIN - COMPLETE DATABASE SCHEMA
-- ============================================================

-- 1. AI PROVIDERS - Proveedores de IA (Anthropic, OpenAI, Google, etc.)
CREATE TABLE public.ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- 'anthropic', 'openai', 'google', 'mistral', 'lovable'
  api_key_encrypted TEXT, -- Encrypted API key (null for Lovable Gateway)
  base_url TEXT, -- Custom base URL if needed
  is_gateway BOOLEAN DEFAULT false, -- true for Lovable AI Gateway
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  health_status TEXT DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'degraded', 'down', 'unknown')),
  last_health_check_at TIMESTAMPTZ,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AI MODELS - Modelos disponibles por proveedor
CREATE TABLE public.ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.ai_providers(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL, -- 'claude-3-opus', 'gpt-4o', 'gemini-2.5-flash'
  name TEXT NOT NULL, -- Display name
  capabilities JSONB DEFAULT '{}', -- {vision: true, tools: true, streaming: true}
  context_window INTEGER,
  max_output_tokens INTEGER,
  input_cost_per_1m DECIMAL(10,6), -- Cost per 1M input tokens
  output_cost_per_1m DECIMAL(10,6), -- Cost per 1M output tokens
  is_active BOOLEAN DEFAULT true,
  tier TEXT DEFAULT 'standard' CHECK (tier IN ('economy', 'standard', 'premium', 'enterprise')),
  speed_rating INTEGER DEFAULT 3 CHECK (speed_rating BETWEEN 1 AND 5),
  quality_rating INTEGER DEFAULT 3 CHECK (quality_rating BETWEEN 1 AND 5),
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  deprecated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider_id, model_id)
);

-- 3. AI TASK ASSIGNMENTS - Asignación de modelos por tarea/agente
CREATE TABLE public.ai_task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_code TEXT UNIQUE NOT NULL, -- 'nexus_guide', 'nexus_legal', 'translation', etc.
  task_name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general', -- 'agent', 'analysis', 'generation', 'classification'
  
  -- Model assignments with fallbacks
  primary_model_id UUID REFERENCES public.ai_models(id),
  fallback_1_model_id UUID REFERENCES public.ai_models(id),
  fallback_2_model_id UUID REFERENCES public.ai_models(id),
  
  -- Prompt configuration
  prompt_id UUID REFERENCES public.ai_prompt_templates(id),
  system_prompt_override TEXT,
  
  -- Execution settings
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 4096,
  timeout_ms INTEGER DEFAULT 30000,
  max_retries INTEGER DEFAULT 3,
  
  -- RAG configuration
  rag_enabled BOOLEAN DEFAULT false,
  rag_collection_ids UUID[] DEFAULT '{}',
  rag_top_k INTEGER DEFAULT 5,
  
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- For routing decisions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AI CIRCUIT BREAKER STATE - Estado del circuit breaker por proveedor
CREATE TABLE public.ai_circuit_breaker_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.ai_providers(id) ON DELETE CASCADE UNIQUE,
  state TEXT DEFAULT 'closed' CHECK (state IN ('closed', 'open', 'half_open')),
  failure_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  last_failure_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  half_open_at TIMESTAMPTZ,
  
  -- Configuration
  failure_threshold INTEGER DEFAULT 5,
  success_threshold INTEGER DEFAULT 3,
  open_duration_ms INTEGER DEFAULT 30000,
  
  -- Metrics
  total_requests INTEGER DEFAULT 0,
  total_failures INTEGER DEFAULT 0,
  avg_latency_ms DECIMAL(10,2),
  p95_latency_ms DECIMAL(10,2),
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AI REQUEST LOGS - Log detallado de cada request
CREATE TABLE public.ai_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  user_id UUID REFERENCES public.users(id),
  
  -- Request info
  task_code TEXT NOT NULL,
  model_id UUID REFERENCES public.ai_models(id),
  provider_id UUID REFERENCES public.ai_providers(id),
  
  -- Token usage
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_tokens INTEGER,
  
  -- Cost calculation
  cost_usd DECIMAL(10,6),
  
  -- Performance
  latency_ms INTEGER,
  time_to_first_token_ms INTEGER,
  
  -- Status
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'timeout', 'rate_limited', 'fallback_used')),
  error_message TEXT,
  fallback_used BOOLEAN DEFAULT false,
  fallback_model_id UUID REFERENCES public.ai_models(id),
  
  -- Context
  conversation_id UUID,
  request_metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AI RAG COLLECTIONS - Colecciones de conocimiento
CREATE TABLE public.ai_rag_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  collection_type TEXT DEFAULT 'general', -- 'legal_spain', 'legal_eu', 'ip_nexus_docs', etc.
  
  -- Embedding configuration
  embedding_model TEXT DEFAULT 'text-embedding-3-small',
  embedding_dimensions INTEGER DEFAULT 1536,
  chunk_size INTEGER DEFAULT 1000,
  chunk_overlap INTEGER DEFAULT 200,
  
  -- Stats
  document_count INTEGER DEFAULT 0,
  chunk_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  
  -- Schedule
  auto_update_enabled BOOLEAN DEFAULT false,
  update_frequency TEXT, -- 'daily', 'weekly', 'monthly'
  last_updated_at TIMESTAMPTZ,
  next_update_at TIMESTAMPTZ,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AI USAGE AGGREGATES - Agregados de uso por periodo
CREATE TABLE public.ai_usage_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  
  -- Period
  period_type TEXT NOT NULL CHECK (period_type IN ('hourly', 'daily', 'monthly')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Metrics
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  
  -- Tokens
  total_input_tokens BIGINT DEFAULT 0,
  total_output_tokens BIGINT DEFAULT 0,
  
  -- Costs
  total_cost_usd DECIMAL(10,4) DEFAULT 0,
  
  -- By task breakdown (JSONB)
  by_task JSONB DEFAULT '{}',
  -- By model breakdown (JSONB)
  by_model JSONB DEFAULT '{}',
  
  -- Performance
  avg_latency_ms DECIMAL(10,2),
  p50_latency_ms DECIMAL(10,2),
  p95_latency_ms DECIMAL(10,2),
  p99_latency_ms DECIMAL(10,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, period_type, period_start)
);

-- 8. AI RATE LIMITS - Límites de rate por organización
CREATE TABLE public.ai_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) UNIQUE,
  
  -- Limits
  requests_per_minute INTEGER DEFAULT 60,
  requests_per_hour INTEGER DEFAULT 1000,
  requests_per_day INTEGER DEFAULT 10000,
  tokens_per_minute INTEGER DEFAULT 100000,
  tokens_per_day INTEGER DEFAULT 1000000,
  
  -- Current usage (reset periodically)
  current_minute_requests INTEGER DEFAULT 0,
  current_hour_requests INTEGER DEFAULT 0,
  current_day_requests INTEGER DEFAULT 0,
  current_minute_tokens INTEGER DEFAULT 0,
  current_day_tokens INTEGER DEFAULT 0,
  
  -- Reset times
  minute_reset_at TIMESTAMPTZ,
  hour_reset_at TIMESTAMPTZ,
  day_reset_at TIMESTAMPTZ,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_ai_models_provider ON public.ai_models(provider_id);
CREATE INDEX idx_ai_models_active ON public.ai_models(is_active) WHERE is_active = true;
CREATE INDEX idx_ai_task_assignments_code ON public.ai_task_assignments(task_code);
CREATE INDEX idx_ai_request_logs_org ON public.ai_request_logs(organization_id);
CREATE INDEX idx_ai_request_logs_created ON public.ai_request_logs(created_at DESC);
CREATE INDEX idx_ai_request_logs_task ON public.ai_request_logs(task_code);
CREATE INDEX idx_ai_usage_aggregates_org_period ON public.ai_usage_aggregates(organization_id, period_type, period_start);

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_circuit_breaker_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_rag_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_rate_limits ENABLE ROW LEVEL SECURITY;

-- AI Providers - Read-only for all authenticated, write for service role
CREATE POLICY "ai_providers_select" ON public.ai_providers FOR SELECT TO authenticated USING (true);

-- AI Models - Read-only for all authenticated
CREATE POLICY "ai_models_select" ON public.ai_models FOR SELECT TO authenticated USING (true);

-- AI Task Assignments - Read-only for all authenticated
CREATE POLICY "ai_task_assignments_select" ON public.ai_task_assignments FOR SELECT TO authenticated USING (true);

-- AI Circuit Breaker States - Read-only for all authenticated
CREATE POLICY "ai_circuit_breaker_select" ON public.ai_circuit_breaker_states FOR SELECT TO authenticated USING (true);

-- AI Request Logs - Users can see their own org's logs
CREATE POLICY "ai_request_logs_select" ON public.ai_request_logs FOR SELECT TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
  )
);

-- AI RAG Collections - Read-only for all authenticated
CREATE POLICY "ai_rag_collections_select" ON public.ai_rag_collections FOR SELECT TO authenticated USING (true);

-- AI Usage Aggregates - Users can see their own org's usage
CREATE POLICY "ai_usage_aggregates_select" ON public.ai_usage_aggregates FOR SELECT TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
  )
);

-- AI Rate Limits - Users can see their own org's limits
CREATE POLICY "ai_rate_limits_select" ON public.ai_rate_limits FOR SELECT TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
  )
);

-- ============================================================
-- SEED DATA - Lovable AI Gateway Provider & Models
-- ============================================================

-- Insert Lovable AI Gateway as default provider
INSERT INTO public.ai_providers (name, code, is_gateway, status, health_status, config)
VALUES (
  'Lovable AI Gateway',
  'lovable',
  true,
  'active',
  'healthy',
  '{"description": "Lovable AI Gateway - Access to Google Gemini and OpenAI models"}'
);

-- Insert available models for Lovable Gateway
WITH lovable_provider AS (
  SELECT id FROM public.ai_providers WHERE code = 'lovable'
)
INSERT INTO public.ai_models (provider_id, model_id, name, capabilities, context_window, max_output_tokens, input_cost_per_1m, output_cost_per_1m, tier, speed_rating, quality_rating)
SELECT 
  lovable_provider.id,
  m.model_id,
  m.name,
  m.capabilities::jsonb,
  m.context_window,
  m.max_output_tokens,
  m.input_cost,
  m.output_cost,
  m.tier,
  m.speed_rating,
  m.quality_rating
FROM lovable_provider, (VALUES
  ('google/gemini-3-flash-preview', 'Gemini 3 Flash Preview', '{"vision": true, "tools": true, "streaming": true}', 1000000, 8192, 0.075, 0.30, 'standard', 5, 4),
  ('google/gemini-3-pro-preview', 'Gemini 3 Pro Preview', '{"vision": true, "tools": true, "streaming": true}', 1000000, 8192, 1.25, 5.00, 'premium', 3, 5),
  ('google/gemini-2.5-pro', 'Gemini 2.5 Pro', '{"vision": true, "tools": true, "streaming": true}', 1000000, 8192, 1.25, 5.00, 'premium', 3, 5),
  ('google/gemini-2.5-flash', 'Gemini 2.5 Flash', '{"vision": true, "tools": true, "streaming": true}', 1000000, 8192, 0.075, 0.30, 'standard', 5, 4),
  ('google/gemini-2.5-flash-lite', 'Gemini 2.5 Flash Lite', '{"vision": true, "tools": true, "streaming": true}', 1000000, 8192, 0.02, 0.08, 'economy', 5, 3),
  ('openai/gpt-5', 'GPT-5', '{"vision": true, "tools": true, "streaming": true}', 128000, 16384, 5.00, 15.00, 'enterprise', 3, 5),
  ('openai/gpt-5-mini', 'GPT-5 Mini', '{"vision": true, "tools": true, "streaming": true}', 128000, 16384, 0.15, 0.60, 'standard', 4, 4),
  ('openai/gpt-5-nano', 'GPT-5 Nano', '{"vision": true, "tools": true, "streaming": true}', 128000, 16384, 0.05, 0.20, 'economy', 5, 3),
  ('openai/gpt-5.2', 'GPT-5.2', '{"vision": true, "tools": true, "streaming": true}', 128000, 16384, 7.50, 22.50, 'enterprise', 3, 5)
) AS m(model_id, name, capabilities, context_window, max_output_tokens, input_cost, output_cost, tier, speed_rating, quality_rating);

-- Insert default task assignments
WITH models AS (
  SELECT id, model_id FROM public.ai_models
)
INSERT INTO public.ai_task_assignments (task_code, task_name, description, category, primary_model_id, fallback_1_model_id, temperature, max_tokens)
SELECT 
  t.task_code,
  t.task_name,
  t.description,
  t.category,
  (SELECT id FROM models WHERE model_id = t.primary_model),
  (SELECT id FROM models WHERE model_id = t.fallback_model),
  t.temperature,
  t.max_tokens
FROM (VALUES
  ('nexus_guide', 'NEXUS Guide', 'Asistente de ayuda contextual', 'agent', 'google/gemini-3-flash-preview', 'openai/gpt-5-mini', 0.7, 2048),
  ('nexus_ops', 'NEXUS Ops', 'Asistente operativo de PI', 'agent', 'google/gemini-2.5-flash', 'openai/gpt-5-mini', 0.7, 4096),
  ('nexus_legal', 'NEXUS Legal', 'Análisis legal avanzado', 'agent', 'google/gemini-2.5-pro', 'openai/gpt-5', 0.3, 8192),
  ('nexus_watch', 'NEXUS Watch', 'Vigilancia y alertas', 'agent', 'google/gemini-2.5-flash', 'openai/gpt-5-mini', 0.5, 4096),
  ('translation', 'AI Translation', 'Traducción de documentos PI', 'generation', 'google/gemini-3-flash-preview', 'openai/gpt-5-mini', 0.3, 8192),
  ('classification', 'Classification', 'Clasificación de documentos', 'classification', 'google/gemini-2.5-flash-lite', 'google/gemini-3-flash-preview', 0.1, 1024),
  ('document_analysis', 'Document Analysis', 'Análisis de documentos', 'analysis', 'google/gemini-2.5-flash', 'openai/gpt-5-mini', 0.3, 4096),
  ('opposition_generation', 'Opposition Generation', 'Generación de oposiciones', 'generation', 'google/gemini-2.5-pro', 'openai/gpt-5', 0.4, 8192),
  ('trademark_comparison', 'Trademark Comparison', 'Comparación de marcas', 'analysis', 'google/gemini-2.5-flash', 'openai/gpt-5-mini', 0.2, 4096),
  ('email_generation', 'Email Generation', 'Generación de emails', 'generation', 'google/gemini-3-flash-preview', 'openai/gpt-5-nano', 0.7, 2048)
) AS t(task_code, task_name, description, category, primary_model, fallback_model, temperature, max_tokens);

-- Initialize circuit breaker for Lovable provider
INSERT INTO public.ai_circuit_breaker_states (provider_id, state)
SELECT id, 'closed' FROM public.ai_providers WHERE code = 'lovable';

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION public.update_ai_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_providers_updated_at
  BEFORE UPDATE ON public.ai_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_ai_updated_at();

CREATE TRIGGER update_ai_models_updated_at
  BEFORE UPDATE ON public.ai_models
  FOR EACH ROW EXECUTE FUNCTION public.update_ai_updated_at();

CREATE TRIGGER update_ai_task_assignments_updated_at
  BEFORE UPDATE ON public.ai_task_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_ai_updated_at();

CREATE TRIGGER update_ai_rag_collections_updated_at
  BEFORE UPDATE ON public.ai_rag_collections
  FOR EACH ROW EXECUTE FUNCTION public.update_ai_updated_at();