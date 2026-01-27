-- ============================================================
-- AI BRAIN PHASE 3: BUDGETS + COST GUARD
-- ============================================================

-- 1. Create ai_cost_history table for aggregated cost tracking
CREATE TABLE IF NOT EXISTS ai_cost_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Period
  date DATE NOT NULL,
  hour INTEGER,  -- 0-23, NULL for daily aggregate
  
  -- Metrics
  total_cost DECIMAL(10,6) DEFAULT 0,
  total_executions INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  
  -- By provider (JSONB for flexibility)
  cost_by_provider JSONB DEFAULT '{}',
  
  -- By task
  cost_by_task JSONB DEFAULT '{}',
  
  -- By model
  cost_by_model JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, date, hour)
);

CREATE INDEX IF NOT EXISTS idx_cost_history_tenant_date ON ai_cost_history(tenant_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_cost_history_date ON ai_cost_history(date DESC);

-- Enable RLS
ALTER TABLE ai_cost_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated to read cost history"
  ON ai_cost_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service to manage cost history"
  ON ai_cost_history
  FOR ALL
  TO authenticated
  WITH CHECK (true);

-- 2. Add missing columns to ai_budget_config if needed
ALTER TABLE ai_budget_config 
ADD COLUMN IF NOT EXISTS daily_limit DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS per_request_limit DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS last_alert_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_daily_reset TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS daily_spent DECIMAL(10,6) DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_spent DECIMAL(10,6) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10,6) DEFAULT 0;

-- 3. Function to estimate execution cost
CREATE OR REPLACE FUNCTION estimate_execution_cost(
  p_model_code VARCHAR,
  p_estimated_input_tokens INTEGER,
  p_estimated_output_tokens INTEGER DEFAULT NULL
)
RETURNS DECIMAL(10,6)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_price RECORD;
  v_output_tokens INTEGER;
BEGIN
  -- Get model prices
  SELECT mp.input_price_per_million, mp.output_price_per_million 
  INTO v_price
  FROM ai_model_prices mp
  JOIN ai_models m ON mp.model_id = m.id
  WHERE m.model_id = p_model_code OR m.code = p_model_code
    AND mp.effective_from <= CURRENT_DATE
    AND (mp.effective_to IS NULL OR mp.effective_to >= CURRENT_DATE)
  ORDER BY mp.effective_from DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    -- Fallback: try direct model lookup
    SELECT input_cost_per_1m, output_cost_per_1m
    INTO v_price
    FROM ai_models
    WHERE model_id = p_model_code OR code = p_model_code
    LIMIT 1;
    
    IF NOT FOUND THEN
      RETURN 0;
    END IF;
  END IF;
  
  -- Estimate output tokens if not provided (typically 30-50% of input)
  v_output_tokens := COALESCE(p_estimated_output_tokens, (p_estimated_input_tokens * 0.4)::INTEGER);
  
  RETURN ROUND(
    (COALESCE(p_estimated_input_tokens, 0) * COALESCE(v_price.input_price_per_million, 0) / 1000000) +
    (v_output_tokens * COALESCE(v_price.output_price_per_million, 0) / 1000000),
    6
  );
END;
$$;

-- 4. Function to check budget before execution
CREATE OR REPLACE FUNCTION check_budget_before_execution(
  p_tenant_id UUID,
  p_task_code VARCHAR,
  p_estimated_cost DECIMAL
)
RETURNS TABLE (
  can_execute BOOLEAN,
  action VARCHAR,
  reason VARCHAR,
  daily_remaining DECIMAL,
  monthly_remaining DECIMAL,
  suggested_model VARCHAR
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_budget RECORD;
  v_daily_remaining DECIMAL;
  v_monthly_remaining DECIMAL;
BEGIN
  -- Get budget for tenant (global or by module)
  SELECT * INTO v_budget 
  FROM ai_budget_config 
  WHERE organization_id = p_tenant_id 
    AND is_active = TRUE
  ORDER BY module NULLS LAST  -- Prefer specific module budget
  LIMIT 1;
  
  IF v_budget.id IS NULL THEN
    -- No budget configured, allow execution
    RETURN QUERY SELECT 
      TRUE,
      'allow'::VARCHAR,
      'No budget configured'::VARCHAR,
      999999::DECIMAL,
      999999::DECIMAL,
      NULL::VARCHAR;
    RETURN;
  END IF;
  
  v_daily_remaining := COALESCE(v_budget.daily_limit, 999999) - COALESCE(v_budget.daily_spent, 0);
  v_monthly_remaining := COALESCE(v_budget.budget_amount, 999999) - COALESCE(v_budget.current_period_spend, 0);
  
  -- Check per-request limit
  IF v_budget.per_request_limit IS NOT NULL AND p_estimated_cost > v_budget.per_request_limit THEN
    RETURN QUERY SELECT 
      v_budget.hard_limit_action != 'block',
      COALESCE(v_budget.hard_limit_action, 'degrade')::VARCHAR,
      'Estimated cost exceeds per-request limit'::VARCHAR,
      v_daily_remaining,
      v_monthly_remaining,
      'gemini-2.0-flash'::VARCHAR;
    RETURN;
  END IF;
  
  -- Check daily limit
  IF v_budget.daily_limit IS NOT NULL AND v_daily_remaining < p_estimated_cost THEN
    RETURN QUERY SELECT 
      NOT v_budget.hard_limit,
      CASE WHEN v_budget.hard_limit THEN 'block' ELSE COALESCE(v_budget.hard_limit_action, 'degrade') END::VARCHAR,
      'Daily budget exceeded'::VARCHAR,
      v_daily_remaining,
      v_monthly_remaining,
      'gemini-2.0-flash'::VARCHAR;
    RETURN;
  END IF;
  
  -- Check monthly limit
  IF v_budget.budget_amount IS NOT NULL AND v_monthly_remaining < p_estimated_cost THEN
    RETURN QUERY SELECT 
      NOT v_budget.hard_limit,
      CASE WHEN v_budget.hard_limit THEN 'block' ELSE COALESCE(v_budget.hard_limit_action, 'degrade') END::VARCHAR,
      'Monthly budget exceeded'::VARCHAR,
      v_daily_remaining,
      v_monthly_remaining,
      'gemini-2.0-flash'::VARCHAR;
    RETURN;
  END IF;
  
  -- All checks passed
  RETURN QUERY SELECT 
    TRUE,
    'allow'::VARCHAR,
    'OK'::VARCHAR,
    v_daily_remaining,
    v_monthly_remaining,
    NULL::VARCHAR;
END;
$$;

-- 5. Function to update budget after execution
CREATE OR REPLACE FUNCTION update_budget_after_execution(
  p_tenant_id UUID,
  p_task_code VARCHAR,
  p_actual_cost DECIMAL,
  p_model_code VARCHAR DEFAULT NULL,
  p_provider_code VARCHAR DEFAULT NULL,
  p_tokens INTEGER DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_budget RECORD;
  v_threshold DECIMAL;
BEGIN
  -- Update budget spend
  UPDATE ai_budget_config SET
    daily_spent = COALESCE(daily_spent, 0) + p_actual_cost,
    monthly_spent = COALESCE(monthly_spent, 0) + p_actual_cost,
    total_spent = COALESCE(total_spent, 0) + p_actual_cost,
    current_period_spend = COALESCE(current_period_spend, 0) + p_actual_cost,
    updated_at = NOW()
  WHERE organization_id = p_tenant_id 
    AND is_active = TRUE
  RETURNING * INTO v_budget;
  
  -- Check if alert threshold reached
  IF v_budget.id IS NOT NULL AND v_budget.budget_amount IS NOT NULL THEN
    v_threshold := (COALESCE(v_budget.current_period_spend, 0) / v_budget.budget_amount) * 100;
    
    -- Alert at 80%
    IF v_threshold >= 80 AND v_budget.alert_at_80 
       AND (v_budget.last_alert_sent_at IS NULL OR v_budget.last_alert_sent_at < NOW() - INTERVAL '1 hour') THEN
      INSERT INTO ai_budget_alerts (
        budget_config_id, organization_id, alert_type, 
        threshold_percent, current_spend, budget_amount
      ) VALUES (
        v_budget.id, p_tenant_id, 'threshold_80',
        v_threshold::INTEGER, v_budget.current_period_spend, v_budget.budget_amount
      );
      
      UPDATE ai_budget_config SET last_alert_sent_at = NOW() WHERE id = v_budget.id;
    END IF;
    
    -- Alert at 100%
    IF v_threshold >= 100 AND v_budget.alert_at_100 
       AND (v_budget.last_alert_sent_at IS NULL OR v_budget.last_alert_sent_at < NOW() - INTERVAL '1 hour') THEN
      INSERT INTO ai_budget_alerts (
        budget_config_id, organization_id, alert_type, 
        threshold_percent, current_spend, budget_amount
      ) VALUES (
        v_budget.id, p_tenant_id, 'exceeded',
        v_threshold::INTEGER, v_budget.current_period_spend, v_budget.budget_amount
      );
      
      UPDATE ai_budget_config SET last_alert_sent_at = NOW() WHERE id = v_budget.id;
    END IF;
  END IF;
  
  -- Update cost history
  INSERT INTO ai_cost_history (
    tenant_id, date, hour, total_cost, total_executions, total_tokens,
    cost_by_model, cost_by_task, cost_by_provider
  ) VALUES (
    p_tenant_id, 
    CURRENT_DATE, 
    EXTRACT(HOUR FROM NOW())::INTEGER, 
    p_actual_cost, 
    1,
    COALESCE(p_tokens, 0),
    CASE WHEN p_model_code IS NOT NULL THEN jsonb_build_object(p_model_code, p_actual_cost) ELSE '{}' END,
    CASE WHEN p_task_code IS NOT NULL THEN jsonb_build_object(p_task_code, p_actual_cost) ELSE '{}' END,
    CASE WHEN p_provider_code IS NOT NULL THEN jsonb_build_object(p_provider_code, p_actual_cost) ELSE '{}' END
  )
  ON CONFLICT (tenant_id, date, hour) DO UPDATE SET
    total_cost = ai_cost_history.total_cost + p_actual_cost,
    total_executions = ai_cost_history.total_executions + 1,
    total_tokens = ai_cost_history.total_tokens + COALESCE(p_tokens, 0),
    cost_by_model = ai_cost_history.cost_by_model || 
      CASE WHEN p_model_code IS NOT NULL THEN 
        jsonb_build_object(p_model_code, COALESCE((ai_cost_history.cost_by_model->>p_model_code)::DECIMAL, 0) + p_actual_cost)
      ELSE '{}' END,
    cost_by_task = ai_cost_history.cost_by_task || 
      CASE WHEN p_task_code IS NOT NULL THEN 
        jsonb_build_object(p_task_code, COALESCE((ai_cost_history.cost_by_task->>p_task_code)::DECIMAL, 0) + p_actual_cost)
      ELSE '{}' END,
    cost_by_provider = ai_cost_history.cost_by_provider || 
      CASE WHEN p_provider_code IS NOT NULL THEN 
        jsonb_build_object(p_provider_code, COALESCE((ai_cost_history.cost_by_provider->>p_provider_code)::DECIMAL, 0) + p_actual_cost)
      ELSE '{}' END;
END;
$$;

-- 6. Function to reset daily budgets (for cron)
CREATE OR REPLACE FUNCTION reset_daily_budgets()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE ai_budget_config SET
    daily_spent = 0,
    last_daily_reset = NOW()
  WHERE last_daily_reset IS NULL 
     OR last_daily_reset::DATE < CURRENT_DATE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- 7. Function to reset monthly budgets (for cron on day 1)
CREATE OR REPLACE FUNCTION reset_monthly_budgets()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE ai_budget_config SET
    monthly_spent = 0,
    current_period_spend = 0,
    current_period_start = CURRENT_DATE
  WHERE current_period_start IS NULL
     OR EXTRACT(MONTH FROM current_period_start) != EXTRACT(MONTH FROM NOW())
     OR EXTRACT(YEAR FROM current_period_start) != EXTRACT(YEAR FROM NOW());
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- 8. Function to get cost analytics
CREATE OR REPLACE FUNCTION get_ai_cost_analytics(
  p_tenant_id UUID DEFAULT NULL,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  total_cost DECIMAL,
  total_executions INTEGER,
  total_tokens INTEGER,
  cost_by_provider JSONB,
  cost_by_task JSONB,
  cost_by_model JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.date,
    SUM(h.total_cost)::DECIMAL as total_cost,
    SUM(h.total_executions)::INTEGER as total_executions,
    SUM(h.total_tokens)::INTEGER as total_tokens,
    jsonb_object_agg(COALESCE(key, 'unknown'), COALESCE(value::DECIMAL, 0)) FILTER (WHERE h.cost_by_provider != '{}') as cost_by_provider,
    jsonb_object_agg(COALESCE(key, 'unknown'), COALESCE(value::DECIMAL, 0)) FILTER (WHERE h.cost_by_task != '{}') as cost_by_task,
    jsonb_object_agg(COALESCE(key, 'unknown'), COALESCE(value::DECIMAL, 0)) FILTER (WHERE h.cost_by_model != '{}') as cost_by_model
  FROM ai_cost_history h
  LEFT JOIN LATERAL jsonb_each_text(h.cost_by_provider) ON true
  WHERE h.date >= CURRENT_DATE - p_days
    AND (p_tenant_id IS NULL OR h.tenant_id = p_tenant_id)
  GROUP BY h.date
  ORDER BY h.date DESC;
END;
$$;