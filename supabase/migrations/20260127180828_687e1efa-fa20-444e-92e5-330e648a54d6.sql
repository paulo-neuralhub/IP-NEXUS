-- ============================================================
-- AI BRAIN FASE 1: Extensiones y datos iniciales
-- ============================================================

-- 1. Añadir campos faltantes a ai_providers
ALTER TABLE ai_providers 
  ADD COLUMN IF NOT EXISTS supports_chat BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS supports_embeddings BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS supports_vision BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS supports_tools BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS health_latency_ms INTEGER,
  ADD COLUMN IF NOT EXISTS consecutive_failures INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);

-- 2. Añadir campos faltantes a ai_task_assignments
ALTER TABLE ai_task_assignments
  ADD COLUMN IF NOT EXISTS module VARCHAR(50),
  ADD COLUMN IF NOT EXISTS edge_function VARCHAR(100),
  ADD COLUMN IF NOT EXISTS requires_vision BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS requires_tools BOOLEAN DEFAULT FALSE;

-- 3. Crear tabla de historial de precios de modelos
CREATE TABLE IF NOT EXISTS ai_model_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  
  currency VARCHAR(3) DEFAULT 'USD',
  input_price_per_million DECIMAL(10,6) NOT NULL,
  output_price_per_million DECIMAL(10,6) NOT NULL,
  
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  
  source VARCHAR(50) DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_model_prices_model ON ai_model_prices(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_model_prices_effective ON ai_model_prices(effective_from DESC);

-- 4. Función para calcular coste de IA
CREATE OR REPLACE FUNCTION calculate_ai_cost(
  p_model_id UUID,
  p_input_tokens INTEGER,
  p_output_tokens INTEGER
)
RETURNS DECIMAL(10,6) 
LANGUAGE plpgsql 
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_input_cost DECIMAL(10,6);
  v_output_cost DECIMAL(10,6);
BEGIN
  -- Primero intentar obtener de la tabla de precios
  SELECT mp.input_price_per_million, mp.output_price_per_million 
  INTO v_input_cost, v_output_cost
  FROM ai_model_prices mp
  WHERE mp.model_id = p_model_id
    AND mp.effective_from <= CURRENT_DATE
    AND (mp.effective_to IS NULL OR mp.effective_to >= CURRENT_DATE)
  ORDER BY mp.effective_from DESC
  LIMIT 1;
  
  -- Si no hay en la tabla de precios, usar los de ai_models
  IF NOT FOUND THEN
    SELECT m.input_cost_per_1m, m.output_cost_per_1m
    INTO v_input_cost, v_output_cost
    FROM ai_models m
    WHERE m.id = p_model_id;
  END IF;
  
  IF NOT FOUND OR v_input_cost IS NULL THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND(
    (COALESCE(p_input_tokens, 0) * COALESCE(v_input_cost, 0) / 1000000) +
    (COALESCE(p_output_tokens, 0) * COALESCE(v_output_cost, 0) / 1000000),
    6
  );
END;
$$;

-- 5. Insertar proveedores adicionales
INSERT INTO ai_providers (code, name, base_url, supports_chat, supports_embeddings, supports_vision, supports_tools, status, health_status, is_gateway, config) VALUES
('google', 'Google Gemini', 'https://generativelanguage.googleapis.com', true, true, true, true, 'active', 'unknown', false, '{}'),
('openai', 'OpenAI', 'https://api.openai.com/v1', true, true, true, true, 'active', 'unknown', false, '{}'),
('anthropic', 'Anthropic Claude', 'https://api.anthropic.com', true, false, true, true, 'active', 'unknown', false, '{}'),
('deepseek', 'DeepSeek', 'https://api.deepseek.com/v1', true, false, false, true, 'active', 'unknown', false, '{}'),
('mistral', 'Mistral AI', 'https://api.mistral.ai/v1', true, true, false, true, 'active', 'unknown', false, '{}'),
('qwen', 'Qwen (Alibaba)', 'https://dashscope.aliyuncs.com/compatible-mode/v1', true, true, true, true, 'active', 'unknown', false, '{}'),
('perplexity', 'Perplexity', 'https://api.perplexity.ai', true, false, false, false, 'active', 'unknown', false, '{}'),
('grok', 'Grok (xAI)', 'https://api.x.ai/v1', true, false, false, true, 'active', 'unknown', false, '{}'),
('replicate', 'Replicate', 'https://api.replicate.com/v1', true, true, true, false, 'active', 'unknown', false, '{}')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  base_url = EXCLUDED.base_url,
  supports_chat = EXCLUDED.supports_chat,
  supports_embeddings = EXCLUDED.supports_embeddings,
  supports_vision = EXCLUDED.supports_vision,
  supports_tools = EXCLUDED.supports_tools;

-- 6. Insertar modelos de otros proveedores
-- OpenAI models
INSERT INTO ai_models (provider_id, model_id, name, tier, capabilities, context_window, max_output_tokens, input_cost_per_1m, output_cost_per_1m, is_active)
SELECT p.id, m.model_id, m.name, m.tier, m.caps::jsonb, m.ctx, m.max_out, m.in_cost, m.out_cost, true
FROM ai_providers p,
(VALUES 
  ('gpt-4o', 'GPT-4o', 'premium', '{"vision": true, "tools": true, "streaming": true}', 128000, 16384, 2.50, 10.00),
  ('gpt-4o-mini', 'GPT-4o Mini', 'standard', '{"vision": true, "tools": true, "streaming": true}', 128000, 16384, 0.15, 0.60),
  ('gpt-5', 'GPT-5', 'enterprise', '{"vision": true, "tools": true, "streaming": true, "reasoning": true}', 256000, 32768, 5.00, 15.00),
  ('gpt-5-mini', 'GPT-5 Mini', 'premium', '{"vision": true, "tools": true, "streaming": true}', 256000, 16384, 1.00, 4.00)
) AS m(model_id, name, tier, caps, ctx, max_out, in_cost, out_cost)
WHERE p.code = 'openai'
ON CONFLICT (provider_id, model_id) DO NOTHING;

-- Anthropic models
INSERT INTO ai_models (provider_id, model_id, name, tier, capabilities, context_window, max_output_tokens, input_cost_per_1m, output_cost_per_1m, is_active)
SELECT p.id, m.model_id, m.name, m.tier, m.caps::jsonb, m.ctx, m.max_out, m.in_cost, m.out_cost, true
FROM ai_providers p,
(VALUES 
  ('claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet', 'premium', '{"vision": true, "tools": true, "streaming": true}', 200000, 8192, 3.00, 15.00),
  ('claude-3-haiku-20240307', 'Claude 3 Haiku', 'economy', '{"vision": true, "tools": true, "streaming": true}', 200000, 4096, 0.25, 1.25),
  ('claude-3-opus-20240229', 'Claude 3 Opus', 'enterprise', '{"vision": true, "tools": true, "streaming": true}', 200000, 4096, 15.00, 75.00)
) AS m(model_id, name, tier, caps, ctx, max_out, in_cost, out_cost)
WHERE p.code = 'anthropic'
ON CONFLICT (provider_id, model_id) DO NOTHING;

-- DeepSeek models
INSERT INTO ai_models (provider_id, model_id, name, tier, capabilities, context_window, max_output_tokens, input_cost_per_1m, output_cost_per_1m, is_active)
SELECT p.id, m.model_id, m.name, m.tier, m.caps::jsonb, m.ctx, m.max_out, m.in_cost, m.out_cost, true
FROM ai_providers p,
(VALUES 
  ('deepseek-chat', 'DeepSeek Chat', 'economy', '{"tools": true, "streaming": true}', 128000, 8192, 0.14, 0.28),
  ('deepseek-reasoner', 'DeepSeek Reasoner', 'standard', '{"tools": true, "streaming": true, "reasoning": true}', 128000, 8192, 0.55, 2.19)
) AS m(model_id, name, tier, caps, ctx, max_out, in_cost, out_cost)
WHERE p.code = 'deepseek'
ON CONFLICT (provider_id, model_id) DO NOTHING;

-- Mistral models
INSERT INTO ai_models (provider_id, model_id, name, tier, capabilities, context_window, max_output_tokens, input_cost_per_1m, output_cost_per_1m, is_active)
SELECT p.id, m.model_id, m.name, m.tier, m.caps::jsonb, m.ctx, m.max_out, m.in_cost, m.out_cost, true
FROM ai_providers p,
(VALUES 
  ('mistral-large-latest', 'Mistral Large', 'premium', '{"tools": true, "streaming": true}', 128000, 8192, 2.00, 6.00),
  ('mistral-small-latest', 'Mistral Small', 'economy', '{"tools": true, "streaming": true}', 128000, 8192, 0.20, 0.60)
) AS m(model_id, name, tier, caps, ctx, max_out, in_cost, out_cost)
WHERE p.code = 'mistral'
ON CONFLICT (provider_id, model_id) DO NOTHING;

-- 7. Actualizar tareas existentes con módulo y edge_function
UPDATE ai_task_assignments SET 
  module = CASE task_code
    WHEN 'nexus_guide' THEN 'guide'
    WHEN 'nexus_ops' THEN 'genius'
    WHEN 'nexus_legal' THEN 'genius'
    WHEN 'nexus_watch' THEN 'spider'
    WHEN 'translation' THEN 'translator'
    WHEN 'classification' THEN 'documents'
    WHEN 'document_analysis' THEN 'documents'
    WHEN 'opposition_generation' THEN 'genius'
    WHEN 'trademark_comparison' THEN 'genius'
    ELSE 'general'
  END,
  edge_function = CASE task_code
    WHEN 'nexus_guide' THEN 'nexus-guide-chat'
    WHEN 'nexus_ops' THEN 'genius-chat-v2'
    WHEN 'nexus_legal' THEN 'genius-pro-chat'
    WHEN 'nexus_watch' THEN 'run-predictive-analysis'
    WHEN 'translation' THEN 'ai-legal-translate'
    WHEN 'classification' THEN 'classify-communication'
    WHEN 'document_analysis' THEN 'process-document-ner'
    WHEN 'opposition_generation' THEN 'genius-generate-opposition'
    WHEN 'trademark_comparison' THEN 'genius-conceptual-analysis'
    ELSE NULL
  END
WHERE module IS NULL OR edge_function IS NULL;

-- 8. Insertar tareas adicionales que faltan
INSERT INTO ai_task_assignments (task_code, task_name, description, category, module, edge_function, is_active, temperature, max_tokens)
VALUES
  ('genius-chat', 'Chat Legal Especializado', 'Chat principal de GENIUS', 'agent', 'genius', 'genius-chat', true, 0.7, 4096),
  ('genius-chat-v2', 'Chat Legal V2', 'Versión mejorada del chat', 'agent', 'genius', 'genius-chat-v2', true, 0.7, 4096),
  ('generate-document-ai', 'Generación de Documentos', 'Genera documentos legales', 'generation', 'genius', 'generate-document-ai', true, 0.4, 8192),
  ('genius-help', 'Ayuda Contextual', 'Ayuda in-app', 'agent', 'genius', 'genius-help', true, 0.7, 2048),
  ('auto-map-columns', 'Mapeo Automático de Columnas', 'Para importación', 'analysis', 'import', 'auto-map-columns', true, 0.1, 2048),
  ('ai-analyze-mapping', 'Análisis de Mapeo', 'Valida mapeos', 'analysis', 'import', 'ai-analyze-mapping', true, 0.1, 2048),
  ('ai-validate-data', 'Validación de Datos', 'Valida datos importados', 'analysis', 'import', 'ai-validate-data', true, 0.1, 2048),
  ('analyze-migration-file', 'Análisis de Migración', 'Analiza archivos de migración', 'analysis', 'migrator', 'analyze-migration-file', true, 0.2, 4096),
  ('crm-tips', 'Tips Inteligentes CRM', 'Sugerencias para CRM', 'agent', 'crm', 'crm-tips', true, 0.8, 1024),
  ('assistant-portal', 'Asistente Portal Cliente', 'Chat para portal de clientes', 'agent', 'portal', 'assistant-portal', true, 0.7, 4096),
  ('assistant-widget-chat', 'Chat Widget Embebido', 'Widget embebible', 'agent', 'widget', 'assistant-widget-chat', true, 0.7, 4096),
  ('backoffice-ai-agent', 'Agente IA Administrativo', 'Agente para backoffice', 'agent', 'backoffice', 'backoffice-ai-agent', true, 0.7, 4096),
  ('analyze-image', 'Análisis de Imágenes', 'Análisis visual de marcas', 'analysis', 'vision', 'analyze-image', true, 0.3, 4096),
  ('generate-image-embedding', 'Embeddings de Imágenes', 'Genera embeddings visuales', 'general', 'images', 'generate-image-embedding', true, 0.0, 0),
  ('extract-document-data', 'Extracción de Documentos', 'Extrae datos de documentos', 'analysis', 'documents', 'extract-document-data', true, 0.1, 4096)
ON CONFLICT (task_code) DO UPDATE SET
  module = EXCLUDED.module,
  edge_function = EXCLUDED.edge_function;

-- 9. RLS para ai_model_prices
ALTER TABLE ai_model_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AI model prices viewable by authenticated" ON ai_model_prices
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "AI model prices manageable by service role" ON ai_model_prices
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);