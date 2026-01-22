-- IP-NEXUS AI BRAIN
-- Add ai_route_request RPC using ai_task_assignments as source of truth (no ai_routing_rules)

CREATE OR REPLACE FUNCTION public.ai_route_request(
  p_task_code TEXT,
  p_category TEXT DEFAULT NULL,
  p_requires_vision BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_assignment RECORD;
  v_model RECORD;
  v_provider RECORD;
  v_selected_model_id UUID;
  v_selected_via TEXT;
  v_reason TEXT;
BEGIN
  -- Enforce RLS even under SECURITY DEFINER (defense-in-depth)
  PERFORM set_config('row_security', 'on', true);

  IF p_task_code IS NULL OR btrim(p_task_code) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'missing_task_code',
      'message', 'task_code es obligatorio'
    );
  END IF;

  -- 1) Exact match by task_code
  SELECT *
    INTO v_assignment
  FROM public.ai_task_assignments
  WHERE is_active = true
    AND task_code = p_task_code
  ORDER BY COALESCE(priority, 0) DESC
  LIMIT 1;

  IF FOUND THEN
    v_reason := 'task_code_match';
  ELSE
    -- 2) Optional category fallback
    IF p_category IS NOT NULL AND btrim(p_category) <> '' THEN
      SELECT *
        INTO v_assignment
      FROM public.ai_task_assignments
      WHERE is_active = true
        AND lower(COALESCE(category, '')) = lower(p_category)
      ORDER BY COALESCE(priority, 0) DESC
      LIMIT 1;

      IF FOUND THEN
        v_reason := 'category_fallback';
      END IF;
    END IF;
  END IF;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'no_assignment_found',
      'message', 'No hay asignación activa para el task solicitado'
    );
  END IF;

  -- Helper: try primary then fallbacks, ensuring model is active and provider is not down.
  -- Primary
  v_selected_model_id := v_assignment.primary_model_id;
  v_selected_via := 'primary_model_id';

  IF v_selected_model_id IS NULL THEN
    v_selected_model_id := v_assignment.fallback_1_model_id;
    v_selected_via := 'fallback_1_model_id';
  END IF;

  IF v_selected_model_id IS NULL THEN
    v_selected_model_id := v_assignment.fallback_2_model_id;
    v_selected_via := 'fallback_2_model_id';
  END IF;

  -- If still null, emergency pick: any active model from a non-down provider
  IF v_selected_model_id IS NULL THEN
    SELECT m.*
      INTO v_model
    FROM public.ai_models m
    LEFT JOIN public.ai_providers p ON p.id = m.provider_id
    WHERE COALESCE(m.is_active, true) = true
      AND (p.id IS NULL OR COALESCE(p.health_status, 'unknown') <> 'down')
    ORDER BY COALESCE(m.tier, 'standard') ASC, m.name ASC
    LIMIT 1;

    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'no_available_model',
        'message', 'No hay modelos activos disponibles'
      );
    END IF;

    v_selected_via := 'emergency_model_pick';
    v_reason := v_reason || ':no_configured_models';
  ELSE
    -- Validate chosen model/provider; if invalid, cascade to other fallbacks.
    -- We evaluate in order: chosen (primary if present), then remaining fallbacks.
    FOR v_selected_via, v_selected_model_id IN
      SELECT 'primary_model_id', v_assignment.primary_model_id
      UNION ALL
      SELECT 'fallback_1_model_id', v_assignment.fallback_1_model_id
      UNION ALL
      SELECT 'fallback_2_model_id', v_assignment.fallback_2_model_id
    LOOP
      CONTINUE WHEN v_selected_model_id IS NULL;

      SELECT m.*
        INTO v_model
      FROM public.ai_models m
      LEFT JOIN public.ai_providers p ON p.id = m.provider_id
      WHERE m.id = v_selected_model_id
        AND COALESCE(m.is_active, true) = true
        AND (p.id IS NULL OR COALESCE(p.health_status, 'unknown') <> 'down');

      EXIT WHEN FOUND;
    END LOOP;

    IF NOT FOUND THEN
      -- Final emergency pick
      SELECT m.*
        INTO v_model
      FROM public.ai_models m
      LEFT JOIN public.ai_providers p ON p.id = m.provider_id
      WHERE COALESCE(m.is_active, true) = true
        AND (p.id IS NULL OR COALESCE(p.health_status, 'unknown') <> 'down')
      ORDER BY COALESCE(m.tier, 'standard') ASC, m.name ASC
      LIMIT 1;

      IF NOT FOUND THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'no_available_model',
          'message', 'No hay modelos activos disponibles'
        );
      END IF;

      v_selected_via := 'emergency_model_pick';
      v_reason := v_reason || ':all_configured_models_unavailable';
    END IF;
  END IF;

  -- Load provider details (optional)
  SELECT *
    INTO v_provider
  FROM public.ai_providers
  WHERE id = v_model.provider_id;

  -- Vision capability gate (best-effort). If requires vision and selected model cannot, try other fallbacks, then emergency.
  IF p_requires_vision = true AND (v_model.capabilities IS NULL OR (v_model.capabilities->>'vision')::boolean IS DISTINCT FROM true) THEN
    -- Try any active model that supports vision
    SELECT m.*
      INTO v_model
    FROM public.ai_models m
    LEFT JOIN public.ai_providers p ON p.id = m.provider_id
    WHERE COALESCE(m.is_active, true) = true
      AND (p.id IS NULL OR COALESCE(p.health_status, 'unknown') <> 'down')
      AND (m.capabilities->>'vision')::boolean = true
    ORDER BY m.name ASC
    LIMIT 1;

    IF FOUND THEN
      v_selected_via := 'vision_fallback';
      v_reason := v_reason || ':requires_vision';
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'task', jsonb_build_object(
      'id', v_assignment.id,
      'task_code', v_assignment.task_code,
      'task_name', v_assignment.task_name,
      'category', v_assignment.category,
      'timeout_ms', v_assignment.timeout_ms,
      'max_retries', v_assignment.max_retries,
      'temperature', v_assignment.temperature,
      'max_tokens', v_assignment.max_tokens,
      'rag_enabled', v_assignment.rag_enabled,
      'rag_collection_ids', v_assignment.rag_collection_ids,
      'rag_top_k', v_assignment.rag_top_k
    ),
    'model', jsonb_build_object(
      'id', v_model.id,
      'name', v_model.name,
      'model_id', v_model.model_id,
      'provider', jsonb_build_object(
        'id', v_provider.id,
        'name', v_provider.name,
        'code', v_provider.code,
        'health_status', v_provider.health_status
      )
    ),
    'routing', jsonb_build_object(
      'reason', v_reason,
      'selected_via', v_selected_via
    )
  );
END;
$$;

COMMENT ON FUNCTION public.ai_route_request(TEXT, TEXT, BOOLEAN)
IS 'Smart router using ai_task_assignments as source of truth (primary/fallback models + provider health).';
