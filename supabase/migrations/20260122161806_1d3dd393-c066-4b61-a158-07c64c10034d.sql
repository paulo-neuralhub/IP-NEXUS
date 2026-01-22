-- ============================================================
-- IP-NEXUS AI BRAIN - FINOPS PENDING: LEDGER LOGGING
-- 1) ai_log_transaction_with_billing RPC
-- 2) Trigger: ai_request_logs -> ai_transaction_ledger
-- ============================================================

-- 1) Main RPC: logs a transaction into ai_transaction_ledger and applies client billing rules
CREATE OR REPLACE FUNCTION public.ai_log_transaction_with_billing(
  -- Required
  p_organization_id UUID,
  p_model_id UUID,
  p_module TEXT,
  p_input_tokens INT,
  p_output_tokens INT,
  p_latency_ms INT,
  p_status TEXT DEFAULT 'success',

  -- Optional context
  p_user_id UUID DEFAULT NULL,
  p_client_id UUID DEFAULT NULL,
  p_task_type TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_jurisdiction_code TEXT DEFAULT NULL,

  -- Routing
  p_routing_rule_id UUID DEFAULT NULL,
  p_routing_reason TEXT DEFAULT NULL,

  -- Error
  p_error_code TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_model RECORD;
  v_provider RECORD;
  v_billing_rule RECORD;
  v_cost_input NUMERIC(12,6);
  v_cost_output NUMERIC(12,6);
  v_cost_total NUMERIC(12,6);
  v_billable_amount NUMERIC(12,6) := 0;
  v_markup_percent NUMERIC(6,2);
  v_is_billable BOOLEAN := true;
  v_billing_strategy TEXT := 'markup';
  v_transaction_id TEXT;
  v_inserted_id UUID;
  v_alert_needed BOOLEAN := false;
  v_alert_type TEXT;
BEGIN
  -- Authz: caller must be org member
  IF NOT EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = p_organization_id
      AND m.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  -- Fetch model + provider
  SELECT * INTO v_model FROM public.ai_models WHERE id = p_model_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'model_not_found');
  END IF;

  SELECT * INTO v_provider FROM public.ai_providers WHERE id = v_model.provider_id;

  -- Generate transaction_id
  v_transaction_id := 'tx_' || to_char(now(), 'YYYYMMDD_HH24MISS') || '_' || substr(gen_random_uuid()::text, 1, 8);

  -- Costs: ai_models store per-1M tokens (assumed USD; we store as numeric without currency conversion)
  v_cost_input := COALESCE(v_model.input_cost_per_1m, 0) * (GREATEST(p_input_tokens, 0) / 1000000.0);
  v_cost_output := COALESCE(v_model.output_cost_per_1m, 0) * (GREATEST(p_output_tokens, 0) / 1000000.0);
  v_cost_total := v_cost_input + v_cost_output;

  -- Billing strategy
  IF p_status <> 'success' THEN
    v_is_billable := false;
    v_billable_amount := 0;
    v_billing_strategy := 'error_free';
  ELSIF p_client_id IS NOT NULL THEN
    -- Specific client rule
    SELECT * INTO v_billing_rule
    FROM public.client_ai_billing_rules
    WHERE organization_id = p_organization_id
      AND client_id = p_client_id
      AND is_active = true;

    IF NOT FOUND THEN
      -- Org default
      SELECT * INTO v_billing_rule
      FROM public.client_ai_billing_rules
      WHERE organization_id = p_organization_id
        AND client_id IS NULL
        AND is_active = true;
    END IF;

    IF FOUND THEN
      v_billing_strategy := v_billing_rule.billing_mode;

      CASE v_billing_rule.billing_mode
        WHEN 'markup' THEN
          v_markup_percent := COALESCE(v_billing_rule.markup_percent, 0);
          v_billable_amount := v_cost_total * (1 + v_markup_percent / 100);
        WHEN 'flat_rate' THEN
          v_billable_amount := COALESCE(v_billing_rule.flat_rate_per_query, 0);
        WHEN 'included' THEN
          v_is_billable := false;
          v_billable_amount := 0;
        WHEN 'free' THEN
          v_is_billable := false;
          v_billable_amount := 0;
        WHEN 'cap' THEN
          v_markup_percent := COALESCE(v_billing_rule.markup_percent, 0);
          v_billable_amount := LEAST(
            v_cost_total * (1 + v_markup_percent / 100),
            GREATEST(0, COALESCE(v_billing_rule.monthly_cap, 0) - COALESCE(v_billing_rule.current_month_spend, 0))
          );
      END CASE;

      -- Budget thresholds
      IF v_billing_rule.monthly_budget IS NOT NULL THEN
        IF (v_billing_rule.current_month_spend + v_cost_total) >= v_billing_rule.monthly_budget THEN
          v_alert_needed := true;
          v_alert_type := 'limit_reached';
        ELSIF (v_billing_rule.current_month_spend + v_cost_total) >= (v_billing_rule.monthly_budget * (v_billing_rule.alert_threshold_percent / 100.0)) THEN
          IF v_billing_rule.last_alert_at IS NULL OR v_billing_rule.last_alert_at < NOW() - INTERVAL '1 hour' THEN
            v_alert_needed := true;
            v_alert_type := CASE
              WHEN v_billing_rule.alert_threshold_percent = 50 THEN 'threshold_50'
              WHEN v_billing_rule.alert_threshold_percent = 80 THEN 'threshold_80'
              WHEN v_billing_rule.alert_threshold_percent = 100 THEN 'threshold_100'
              ELSE 'threshold_80'
            END;
          END IF;
        END IF;
      END IF;

      -- Update rule counters
      UPDATE public.client_ai_billing_rules
      SET
        current_month_spend = current_month_spend + v_cost_total,
        current_month_queries = current_month_queries + 1,
        current_month_tokens = current_month_tokens + (GREATEST(p_input_tokens, 0) + GREATEST(p_output_tokens, 0)),
        last_alert_at = CASE WHEN v_alert_needed THEN NOW() ELSE last_alert_at END,
        updated_at = NOW()
      WHERE id = v_billing_rule.id;
    ELSE
      -- No rule: default markup 0
      v_markup_percent := 0;
      v_billable_amount := v_cost_total;
      v_billing_strategy := 'pass_through';
    END IF;
  ELSE
    -- Internal use
    v_is_billable := false;
    v_billable_amount := 0;
    v_billing_strategy := 'internal';
  END IF;

  -- Insert ledger row
  INSERT INTO public.ai_transaction_ledger (
    transaction_id,
    organization_id,
    user_id,
    client_id,
    module,
    task_type,
    session_id,
    jurisdiction_code,
    model_id,
    model_code,
    provider_id,
    routing_rule_id,
    routing_reason,
    input_tokens,
    output_tokens,
    total_tokens,
    latency_ms,
    status,
    error_code,
    error_message,
    cost_input,
    cost_output,
    cost_total,
    is_billable,
    billing_strategy,
    markup_percent,
    billable_amount
  ) VALUES (
    v_transaction_id,
    p_organization_id,
    p_user_id,
    p_client_id,
    p_module,
    p_task_type,
    p_session_id,
    p_jurisdiction_code,
    p_model_id,
    v_model.model_id,
    v_model.provider_id,
    p_routing_rule_id,
    p_routing_reason,
    GREATEST(p_input_tokens, 0),
    GREATEST(p_output_tokens, 0),
    GREATEST(p_input_tokens, 0) + GREATEST(p_output_tokens, 0),
    p_latency_ms,
    p_status,
    p_error_code,
    p_error_message,
    v_cost_input,
    v_cost_output,
    v_cost_total,
    v_is_billable,
    v_billing_strategy,
    v_markup_percent,
    v_billable_amount
  ) RETURNING id INTO v_inserted_id;

  -- Create budget alert (client)
  IF v_alert_needed AND v_billing_rule.id IS NOT NULL THEN
    INSERT INTO public.ai_budget_alerts (
      organization_id,
      client_id,
      alert_type,
      threshold_percent,
      budget_amount,
      current_spend
    ) VALUES (
      p_organization_id,
      p_client_id,
      v_alert_type,
      v_billing_rule.alert_threshold_percent,
      v_billing_rule.monthly_budget,
      v_billing_rule.current_month_spend + v_cost_total
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'id', v_inserted_id,
    'cost', jsonb_build_object(
      'internal', v_cost_total,
      'billable', v_billable_amount,
      'is_billable', v_is_billable,
      'billing_strategy', v_billing_strategy,
      'markup_percent', v_markup_percent
    ),
    'alert', CASE WHEN v_alert_needed THEN v_alert_type ELSE NULL END
  );
END;
$$;

-- 2) Trigger to auto-log ai_request_logs into ai_transaction_ledger
CREATE OR REPLACE FUNCTION public.trg_ai_request_logs_to_ledger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_module TEXT;
  v_task_type TEXT;
  v_client_id UUID;
  v_session_id TEXT;
  v_jurisdiction_code TEXT;
BEGIN
  -- We only log when org_id exists
  IF NEW.organization_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Extract context from request_metadata
  v_module := COALESCE(NEW.request_metadata->>'module', 'ai');
  v_task_type := COALESCE(NEW.request_metadata->>'task_type', NEW.task_code);

  v_session_id := NEW.request_metadata->>'session_id';
  v_jurisdiction_code := NEW.request_metadata->>'jurisdiction_code';

  BEGIN
    v_client_id := NULLIF(NEW.request_metadata->>'client_id', '')::uuid;
  EXCEPTION WHEN others THEN
    v_client_id := NULL;
  END;

  -- Insert directly to avoid auth checks (this is a system trigger)
  INSERT INTO public.ai_transaction_ledger (
    transaction_id,
    organization_id,
    user_id,
    client_id,
    module,
    task_type,
    session_id,
    jurisdiction_code,
    model_id,
    provider_id,
    routing_reason,
    input_tokens,
    output_tokens,
    total_tokens,
    latency_ms,
    status,
    error_message,
    cost_total,
    cost_input,
    cost_output,
    is_billable,
    billing_strategy,
    billable_amount,
    created_at,
    updated_at
  ) VALUES (
    'log_' || to_char(now(), 'YYYYMMDD_HH24MISS') || '_' || substr(gen_random_uuid()::text, 1, 8),
    NEW.organization_id,
    NEW.user_id,
    v_client_id,
    v_module,
    v_task_type,
    v_session_id,
    v_jurisdiction_code,
    NEW.model_id,
    NEW.provider_id,
    CASE WHEN NEW.fallback_used THEN 'fallback_used' ELSE NULL END,
    COALESCE(NEW.input_tokens, 0),
    COALESCE(NEW.output_tokens, 0),
    COALESCE(NEW.total_tokens, 0),
    NEW.latency_ms,
    COALESCE(NEW.status, 'success'),
    NEW.error_message,
    COALESCE(NEW.cost_usd, 0),
    COALESCE(NEW.cost_usd, 0),
    0,
    true,
    'request_logs',
    COALESCE(NEW.cost_usd, 0),
    COALESCE(NEW.created_at, now()),
    now()
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ai_request_logs_to_ledger ON public.ai_request_logs;
CREATE TRIGGER ai_request_logs_to_ledger
AFTER INSERT ON public.ai_request_logs
FOR EACH ROW
EXECUTE FUNCTION public.trg_ai_request_logs_to_ledger();
