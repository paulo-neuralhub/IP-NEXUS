-- IP-NEXUS AI BRAIN - Phase 1 compat RPCs (no duplicate tables)

-- 1) ai_get_models: returns catalog in a prompt-like JSON format (pricing per 1K derived from per 1M)
CREATE OR REPLACE FUNCTION public.ai_get_models(
  p_include_inactive BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('row_security', 'on', true);

  RETURN (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', m.id,
          'name', m.name,
          'model_id', m.model_id,
          'provider', jsonb_build_object(
            'id', p.id,
            'name', p.name,
            'code', p.code,
            'health_status', p.health_status
          ),
          'capabilities', COALESCE(m.capabilities, '{}'::jsonb),
          'max_context_tokens', m.context_window,
          'max_output_tokens', m.max_output_tokens,
          'supports_vision', COALESCE((m.capabilities->>'vision')::boolean, false),
          'supports_functions', COALESCE((m.capabilities->>'tools')::boolean, false),
          'supports_streaming', true,
          'pricing', jsonb_build_object(
            'cost_per_1k_input', COALESCE(m.input_cost_per_1m, 0) / 1000.0,
            'cost_per_1k_output', COALESCE(m.output_cost_per_1m, 0) / 1000.0
          ),
          'routing', jsonb_build_object(
            'tier', m.tier,
            'speed_rating', m.speed_rating,
            'quality_rating', m.quality_rating
          ),
          'is_active', COALESCE(m.is_active, true)
        )
        ORDER BY COALESCE(m.tier, 'standard') ASC, m.name ASC
      ),
      '[]'::jsonb
    )
    FROM public.ai_models m
    LEFT JOIN public.ai_providers p ON p.id = m.provider_id
    WHERE (COALESCE(m.is_active, true) = true OR p_include_inactive = true)
  );
END;
$$;

COMMENT ON FUNCTION public.ai_get_models(BOOLEAN)
IS 'Returns AI model catalog in JSON (prompt-compat). Uses ai_models/ai_providers; pricing per 1K derived from per 1M.';


-- 2) ai_get_routing_rules: prompt-compat name, but sourced from ai_task_assignments
--    (no ai_routing_rules table). Returns task-based routing configuration.
CREATE OR REPLACE FUNCTION public.ai_get_routing_rules(
  p_include_inactive BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('row_security', 'on', true);

  RETURN (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', a.id,
          'name', a.task_name,
          'description', a.description,
          'priority', COALESCE(a.priority, 0),
          'conditions', jsonb_build_object(
            'task_code', a.task_code,
            'category', a.category
          ),
          'target_model', CASE
            WHEN a.primary_model_id IS NULL THEN NULL
            ELSE (
              SELECT jsonb_build_object(
                'id', m.id,
                'name', m.name,
                'model_id', m.model_id,
                'provider', (
                  SELECT jsonb_build_object('id', p.id, 'name', p.name, 'code', p.code)
                  FROM public.ai_providers p
                  WHERE p.id = m.provider_id
                )
              )
              FROM public.ai_models m
              WHERE m.id = a.primary_model_id
            )
          END,
          'fallback_1_model', CASE
            WHEN a.fallback_1_model_id IS NULL THEN NULL
            ELSE (
              SELECT jsonb_build_object(
                'id', m.id,
                'name', m.name,
                'model_id', m.model_id,
                'provider', (
                  SELECT jsonb_build_object('id', p.id, 'name', p.name, 'code', p.code)
                  FROM public.ai_providers p
                  WHERE p.id = m.provider_id
                )
              )
              FROM public.ai_models m
              WHERE m.id = a.fallback_1_model_id
            )
          END,
          'fallback_2_model', CASE
            WHEN a.fallback_2_model_id IS NULL THEN NULL
            ELSE (
              SELECT jsonb_build_object(
                'id', m.id,
                'name', m.name,
                'model_id', m.model_id,
                'provider', (
                  SELECT jsonb_build_object('id', p.id, 'name', p.name, 'code', p.code)
                  FROM public.ai_providers p
                  WHERE p.id = m.provider_id
                )
              )
              FROM public.ai_models m
              WHERE m.id = a.fallback_2_model_id
            )
          END,
          'overrides', jsonb_build_object(
            'temperature', a.temperature,
            'max_tokens', a.max_tokens,
            'timeout_ms', a.timeout_ms,
            'max_retries', a.max_retries,
            'rag_enabled', a.rag_enabled,
            'rag_collection_ids', a.rag_collection_ids,
            'rag_top_k', a.rag_top_k
          ),
          'is_active', COALESCE(a.is_active, true),
          'created_at', a.created_at
        )
        ORDER BY COALESCE(a.priority, 0) DESC, a.task_name ASC
      ),
      '[]'::jsonb
    )
    FROM public.ai_task_assignments a
    WHERE (COALESCE(a.is_active, true) = true OR p_include_inactive = true)
  );
END;
$$;

COMMENT ON FUNCTION public.ai_get_routing_rules(BOOLEAN)
IS 'Prompt-compat function name. Returns routing config sourced from ai_task_assignments (no ai_routing_rules table).';


-- 3) ai_log_transaction: prompt-compat entry point that uses ai_route_request + ai_log_transaction_with_billing
--    It does NOT duplicate billing logic; it delegates to ai_log_transaction_with_billing.
CREATE OR REPLACE FUNCTION public.ai_log_transaction(
  p_organization_id UUID,
  p_task_code TEXT,
  p_module TEXT,
  p_input_tokens INT,
  p_output_tokens INT,
  p_latency_ms INT,
  p_status TEXT DEFAULT 'success',
  p_user_id UUID DEFAULT NULL,
  p_client_id UUID DEFAULT NULL,
  p_task_type TEXT DEFAULT 'query',
  p_session_id TEXT DEFAULT NULL,
  p_jurisdiction_code TEXT DEFAULT NULL,
  p_routing_rule_id UUID DEFAULT NULL,
  p_routing_reason TEXT DEFAULT NULL,
  p_error_code TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_route JSONB;
  v_model_id UUID;
  v_reason TEXT;
BEGIN
  PERFORM set_config('row_security', 'on', true);

  IF p_organization_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'missing_organization_id');
  END IF;

  IF p_task_code IS NULL OR btrim(p_task_code) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'missing_task_code');
  END IF;

  -- Route to a model using existing router
  v_route := public.ai_route_request(p_task_code, NULL, false);

  IF COALESCE((v_route->>'success')::boolean, false) = false THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'routing_failed',
      'routing', v_route
    );
  END IF;

  v_model_id := (v_route->'model'->>'id')::uuid;
  v_reason := COALESCE(p_routing_reason, v_route->'routing'->>'reason');

  RETURN public.ai_log_transaction_with_billing(
    p_organization_id,
    v_model_id,
    p_module,
    COALESCE(p_input_tokens, 0),
    COALESCE(p_output_tokens, 0),
    p_latency_ms,
    p_status,
    p_user_id,
    p_client_id,
    p_task_type,
    p_session_id,
    p_jurisdiction_code,
    p_routing_rule_id,
    v_reason,
    p_error_code,
    p_error_message
  );
END;
$$;

COMMENT ON FUNCTION public.ai_log_transaction(UUID, TEXT, TEXT, INT, INT, INT, TEXT, UUID, UUID, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, TEXT)
IS 'Prompt-compat logger: routes via ai_route_request and delegates to ai_log_transaction_with_billing (no duplicated billing).';
