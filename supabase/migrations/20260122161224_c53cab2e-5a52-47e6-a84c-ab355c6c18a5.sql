-- ============================================================
-- IP-NEXUS AI BRAIN - PHASE 3 FINOPS (LEDGER + BUDGETS + BILLING)
-- ============================================================

-- 0) Helper: updated_at trigger function already exists: public.update_updated_at_column()

-- 1) Validation triggers instead of CHECK constraints
CREATE OR REPLACE FUNCTION public.validate_ai_finops_enums()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- client_ai_billing_rules.billing_mode
  IF TG_TABLE_NAME = 'client_ai_billing_rules' THEN
    IF NEW.billing_mode NOT IN ('markup','flat_rate','included','free','cap') THEN
      RAISE EXCEPTION 'Invalid billing_mode: %', NEW.billing_mode;
    END IF;
    IF NEW.limit_action NOT IN ('alert','block','downgrade_model','notify_client') THEN
      RAISE EXCEPTION 'Invalid limit_action: %', NEW.limit_action;
    END IF;
  END IF;

  -- ai_budget_config
  IF TG_TABLE_NAME = 'ai_budget_config' THEN
    IF NEW.scope_type NOT IN ('global','organization','module','model') THEN
      RAISE EXCEPTION 'Invalid scope_type: %', NEW.scope_type;
    END IF;
    IF NEW.period_type NOT IN ('daily','weekly','monthly') THEN
      RAISE EXCEPTION 'Invalid period_type: %', NEW.period_type;
    END IF;
    IF NEW.hard_limit_action NOT IN ('block','downgrade','alert_only') THEN
      RAISE EXCEPTION 'Invalid hard_limit_action: %', NEW.hard_limit_action;
    END IF;
  END IF;

  -- ai_budget_alerts
  IF TG_TABLE_NAME = 'ai_budget_alerts' THEN
    IF NEW.alert_type NOT IN (
      'threshold_50','threshold_80','threshold_100',
      'limit_reached','hard_limit_triggered','model_downgraded'
    ) THEN
      RAISE EXCEPTION 'Invalid alert_type: %', NEW.alert_type;
    END IF;
  END IF;

  -- ai_transaction_ledger
  IF TG_TABLE_NAME = 'ai_transaction_ledger' THEN
    IF NEW.status NOT IN ('success','error','timeout','rate_limited','cancelled') THEN
      RAISE EXCEPTION 'Invalid status: %', NEW.status;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 2) Core table: AI transaction ledger (source of truth for FinOps)
CREATE TABLE IF NOT EXISTS public.ai_transaction_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT NOT NULL UNIQUE,

  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- Client/contact is optional; when present it is a contact within the org
  client_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  matter_id UUID NULL,

  module TEXT NOT NULL,
  task_type TEXT,
  session_id TEXT,
  jurisdiction_code TEXT,

  -- Model info
  model_id UUID REFERENCES public.ai_models(id) ON DELETE SET NULL,
  model_code TEXT,
  provider_id UUID REFERENCES public.ai_providers(id) ON DELETE SET NULL,

  -- Routing info
  routing_rule_id UUID NULL,
  routing_reason TEXT,

  -- Usage
  input_tokens INT NOT NULL DEFAULT 0,
  output_tokens INT NOT NULL DEFAULT 0,
  total_tokens INT NOT NULL DEFAULT 0,
  latency_ms INT,

  -- Status/error
  status TEXT NOT NULL DEFAULT 'success',
  error_code TEXT,
  error_message TEXT,

  -- Internal cost + chargeback
  cost_input NUMERIC(12,6) NOT NULL DEFAULT 0,
  cost_output NUMERIC(12,6) NOT NULL DEFAULT 0,
  cost_total NUMERIC(12,6) NOT NULL DEFAULT 0,

  is_billable BOOLEAN NOT NULL DEFAULT true,
  billing_strategy TEXT NOT NULL DEFAULT 'markup',
  markup_percent NUMERIC(6,2),
  billable_amount NUMERIC(12,6) NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_ledger_org_created_at
  ON public.ai_transaction_ledger(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_ledger_org_client
  ON public.ai_transaction_ledger(organization_id, client_id)
  WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_ledger_org_model
  ON public.ai_transaction_ledger(organization_id, model_id)
  WHERE model_id IS NOT NULL;

CREATE TRIGGER ai_transaction_ledger_validate_enums
  BEFORE INSERT OR UPDATE ON public.ai_transaction_ledger
  FOR EACH ROW EXECUTE FUNCTION public.validate_ai_finops_enums();

CREATE TRIGGER ai_transaction_ledger_updated_at
  BEFORE UPDATE ON public.ai_transaction_ledger
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) client_ai_billing_rules
CREATE TABLE IF NOT EXISTS public.client_ai_billing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- contact id in this org; NULL means org default rule
  client_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,

  billing_mode TEXT NOT NULL DEFAULT 'markup',

  markup_percent NUMERIC(6,2) DEFAULT 20.00,
  flat_rate_per_query NUMERIC(12,2),
  monthly_cap NUMERIC(12,2),

  monthly_budget NUMERIC(12,2),
  daily_budget NUMERIC(12,2),
  query_limit_daily INT,
  query_limit_monthly INT,

  limit_action TEXT NOT NULL DEFAULT 'alert',
  downgrade_to_model_id UUID REFERENCES public.ai_models(id) ON DELETE SET NULL,

  current_month DATE NOT NULL DEFAULT date_trunc('month', CURRENT_DATE)::DATE,
  current_month_spend NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_month_queries INT NOT NULL DEFAULT 0,
  current_month_tokens BIGINT NOT NULL DEFAULT 0,

  alert_threshold_percent INT NOT NULL DEFAULT 80,
  alert_email TEXT,
  last_alert_at TIMESTAMPTZ,

  show_on_invoice BOOLEAN NOT NULL DEFAULT true,
  invoice_line_description TEXT NOT NULL DEFAULT 'Servicios de IA y Procesamiento',

  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(organization_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_client_billing_org
  ON public.client_ai_billing_rules(organization_id)
  WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_client_billing_client
  ON public.client_ai_billing_rules(client_id)
  WHERE client_id IS NOT NULL;

CREATE TRIGGER client_ai_billing_rules_validate_enums
  BEFORE INSERT OR UPDATE ON public.client_ai_billing_rules
  FOR EACH ROW EXECUTE FUNCTION public.validate_ai_finops_enums();

CREATE TRIGGER client_ai_billing_rules_updated_at
  BEFORE UPDATE ON public.client_ai_billing_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) ai_budget_config
CREATE TABLE IF NOT EXISTS public.ai_budget_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  scope_type TEXT NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  module TEXT,
  model_id UUID REFERENCES public.ai_models(id) ON DELETE SET NULL,

  period_type TEXT NOT NULL DEFAULT 'monthly',
  budget_amount NUMERIC(12,2) NOT NULL,

  alert_at_50 BOOLEAN NOT NULL DEFAULT false,
  alert_at_80 BOOLEAN NOT NULL DEFAULT true,
  alert_at_100 BOOLEAN NOT NULL DEFAULT true,
  alert_email TEXT,
  alert_webhook_url TEXT,

  hard_limit BOOLEAN NOT NULL DEFAULT false,
  hard_limit_action TEXT NOT NULL DEFAULT 'block',
  fallback_model_id UUID REFERENCES public.ai_models(id) ON DELETE SET NULL,

  current_period_start DATE,
  current_period_spend NUMERIC(12,2) NOT NULL DEFAULT 0,

  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_budget_config_scope
  ON public.ai_budget_config(scope_type, organization_id)
  WHERE is_active = true;

CREATE TRIGGER ai_budget_config_validate_enums
  BEFORE INSERT OR UPDATE ON public.ai_budget_config
  FOR EACH ROW EXECUTE FUNCTION public.validate_ai_finops_enums();

CREATE TRIGGER ai_budget_config_updated_at
  BEFORE UPDATE ON public.ai_budget_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) ai_budget_alerts
CREATE TABLE IF NOT EXISTS public.ai_budget_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  budget_config_id UUID REFERENCES public.ai_budget_config(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,

  alert_type TEXT NOT NULL,
  threshold_percent INT,
  budget_amount NUMERIC(12,2),
  current_spend NUMERIC(12,2),

  action_taken TEXT,
  action_details JSONB,

  acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_budget_alerts_org
  ON public.ai_budget_alerts(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_unack
  ON public.ai_budget_alerts(acknowledged)
  WHERE acknowledged = false;

CREATE TRIGGER ai_budget_alerts_validate_enums
  BEFORE INSERT OR UPDATE ON public.ai_budget_alerts
  FOR EACH ROW EXECUTE FUNCTION public.validate_ai_finops_enums();

-- 6) RLS
ALTER TABLE public.ai_transaction_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_ai_billing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_budget_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_budget_alerts ENABLE ROW LEVEL SECURITY;

-- Helper predicate: user must be a member of the org
-- SELECT
CREATE POLICY "ai_ledger_select_org_members"
ON public.ai_transaction_ledger
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = ai_transaction_ledger.organization_id
      AND m.user_id = auth.uid()
  )
);

CREATE POLICY "client_ai_billing_rules_select_org_members"
ON public.client_ai_billing_rules
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = client_ai_billing_rules.organization_id
      AND m.user_id = auth.uid()
  )
);

CREATE POLICY "ai_budget_config_select_org_members"
ON public.ai_budget_config
FOR SELECT
USING (
  organization_id IS NULL OR EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = ai_budget_config.organization_id
      AND m.user_id = auth.uid()
  )
);

CREATE POLICY "ai_budget_alerts_select_org_members"
ON public.ai_budget_alerts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = ai_budget_alerts.organization_id
      AND m.user_id = auth.uid()
  )
);

-- INSERT/UPDATE/DELETE restricted to org members (admin logic can be tightened later)
CREATE POLICY "ai_ledger_write_org_members"
ON public.ai_transaction_ledger
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = ai_transaction_ledger.organization_id
      AND m.user_id = auth.uid()
  )
);

CREATE POLICY "client_ai_billing_rules_write_org_members"
ON public.client_ai_billing_rules
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = client_ai_billing_rules.organization_id
      AND m.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = client_ai_billing_rules.organization_id
      AND m.user_id = auth.uid()
  )
);

CREATE POLICY "ai_budget_config_write_org_members"
ON public.ai_budget_config
FOR ALL
USING (
  organization_id IS NULL OR EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = ai_budget_config.organization_id
      AND m.user_id = auth.uid()
  )
)
WITH CHECK (
  organization_id IS NULL OR EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = ai_budget_config.organization_id
      AND m.user_id = auth.uid()
  )
);

CREATE POLICY "ai_budget_alerts_write_org_members"
ON public.ai_budget_alerts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = ai_budget_alerts.organization_id
      AND m.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = ai_budget_alerts.organization_id
      AND m.user_id = auth.uid()
  )
);

-- 7) RPCs
CREATE OR REPLACE FUNCTION public.ai_get_finops_dashboard(
  p_organization_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start DATE;
  v_end DATE;
  v_result JSONB;
BEGIN
  -- Authz: must be org member
  IF NOT EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = p_organization_id
      AND m.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  v_start := COALESCE(p_start_date, date_trunc('month', CURRENT_DATE)::DATE);
  v_end := COALESCE(p_end_date, CURRENT_DATE);

  SELECT jsonb_build_object(
    'period', jsonb_build_object(
      'start', v_start,
      'end', v_end,
      'days', (v_end - v_start + 1)
    ),
    'totals', (
      SELECT jsonb_build_object(
        'total_transactions', COALESCE(COUNT(*), 0),
        'successful_transactions', COALESCE(COUNT(*) FILTER (WHERE status = 'success'), 0),
        'failed_transactions', COALESCE(COUNT(*) FILTER (WHERE status <> 'success'), 0),
        'total_tokens', COALESCE(SUM(total_tokens), 0),
        'total_input_tokens', COALESCE(SUM(input_tokens), 0),
        'total_output_tokens', COALESCE(SUM(output_tokens), 0),
        'total_cost_internal', COALESCE(SUM(cost_total), 0),
        'total_cost_billable', COALESCE(SUM(billable_amount), 0),
        'profit', COALESCE(SUM(billable_amount) - SUM(cost_total), 0),
        'profit_margin', CASE
          WHEN SUM(cost_total) > 0 THEN ROUND(((SUM(billable_amount) - SUM(cost_total)) / SUM(cost_total) * 100)::NUMERIC, 2)
          ELSE 0
        END,
        'avg_latency_ms', COALESCE(ROUND(AVG(latency_ms))::INT, 0),
        'error_rate', CASE
          WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE status <> 'success')::NUMERIC / COUNT(*) * 100), 2)
          ELSE 0
        END
      )
      FROM public.ai_transaction_ledger
      WHERE organization_id = p_organization_id
        AND created_at >= v_start
        AND created_at < (v_end + INTERVAL '1 day')
    ),
    'by_model', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'model_id', model_id,
          'model_code', model_code,
          'model_name', (SELECT name FROM public.ai_models WHERE id = t.model_id),
          'provider_id', provider_id,
          'transactions', cnt,
          'tokens', tokens,
          'cost_internal', cost_int,
          'cost_billable', cost_bill,
          'avg_latency_ms', avg_lat,
          'error_rate', err_rate
        ) ORDER BY cost_int DESC
      ), '[]'::jsonb)
      FROM (
        SELECT
          model_id,
          model_code,
          provider_id,
          COUNT(*) AS cnt,
          SUM(total_tokens) AS tokens,
          SUM(cost_total) AS cost_int,
          SUM(billable_amount) AS cost_bill,
          ROUND(AVG(latency_ms))::INT AS avg_lat,
          ROUND((COUNT(*) FILTER (WHERE status <> 'success')::NUMERIC / NULLIF(COUNT(*), 0) * 100), 2) AS err_rate
        FROM public.ai_transaction_ledger
        WHERE organization_id = p_organization_id
          AND created_at >= v_start
          AND created_at < (v_end + INTERVAL '1 day')
        GROUP BY model_id, model_code, provider_id
      ) t
    ),
    'by_module', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'module', module,
          'transactions', cnt,
          'tokens', tokens,
          'cost_internal', cost_int,
          'cost_billable', cost_bill
        ) ORDER BY cost_int DESC
      ), '[]'::jsonb)
      FROM (
        SELECT
          module,
          COUNT(*) AS cnt,
          SUM(total_tokens) AS tokens,
          SUM(cost_total) AS cost_int,
          SUM(billable_amount) AS cost_bill
        FROM public.ai_transaction_ledger
        WHERE organization_id = p_organization_id
          AND created_at >= v_start
          AND created_at < (v_end + INTERVAL '1 day')
        GROUP BY module
      ) t
    ),
    'top_clients', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'client_id', client_id,
          'transactions', cnt,
          'tokens', tokens,
          'cost_internal', cost_int,
          'cost_billable', cost_bill,
          'profit', profit
        ) ORDER BY cost_int DESC
      ), '[]'::jsonb)
      FROM (
        SELECT
          client_id,
          COUNT(*) AS cnt,
          SUM(total_tokens) AS tokens,
          SUM(cost_total) AS cost_int,
          SUM(billable_amount) AS cost_bill,
          SUM(billable_amount) - SUM(cost_total) AS profit
        FROM public.ai_transaction_ledger
        WHERE organization_id = p_organization_id
          AND created_at >= v_start
          AND created_at < (v_end + INTERVAL '1 day')
          AND client_id IS NOT NULL
        GROUP BY client_id
        ORDER BY cost_int DESC
        LIMIT 10
      ) t
    ),
    'daily_trend', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'date', day,
          'transactions', cnt,
          'tokens', tokens,
          'cost_internal', cost_int,
          'cost_billable', cost_bill
        ) ORDER BY day
      ), '[]'::jsonb)
      FROM (
        SELECT
          created_at::DATE AS day,
          COUNT(*) AS cnt,
          SUM(total_tokens) AS tokens,
          SUM(cost_total) AS cost_int,
          SUM(billable_amount) AS cost_bill
        FROM public.ai_transaction_ledger
        WHERE organization_id = p_organization_id
          AND created_at >= v_start
          AND created_at < (v_end + INTERVAL '1 day')
        GROUP BY created_at::DATE
      ) t
    ),
    'hourly_trend_24h', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'hour', hr,
          'transactions', cnt,
          'cost', cost
        ) ORDER BY hr
      ), '[]'::jsonb)
      FROM (
        SELECT
          date_trunc('hour', created_at) AS hr,
          COUNT(*) AS cnt,
          SUM(cost_total) AS cost
        FROM public.ai_transaction_ledger
        WHERE organization_id = p_organization_id
          AND created_at >= NOW() - INTERVAL '24 hours'
        GROUP BY date_trunc('hour', created_at)
      ) t
    ),
    'pending_alerts', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', id,
          'alert_type', alert_type,
          'threshold_percent', threshold_percent,
          'budget_amount', budget_amount,
          'current_spend', current_spend,
          'created_at', created_at
        ) ORDER BY created_at DESC
      ), '[]'::jsonb)
      FROM public.ai_budget_alerts
      WHERE organization_id = p_organization_id
        AND acknowledged = false
      LIMIT 10
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.ai_get_client_billing_summary(
  p_organization_id UUID,
  p_month DATE DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_month DATE;
BEGIN
  -- Authz: must be org member
  IF NOT EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = p_organization_id
      AND m.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  v_month := COALESCE(p_month, date_trunc('month', CURRENT_DATE)::DATE);

  RETURN (
    SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'client_id', t.client_id,
        'billing_mode', COALESCE(r.billing_mode, 'markup'),
        'markup_percent', COALESCE(r.markup_percent, 20),
        'transactions', t.cnt,
        'tokens', t.tokens,
        'cost_internal', t.cost_int,
        'cost_billable', t.cost_bill,
        'profit', (t.cost_bill - t.cost_int),
        'show_on_invoice', COALESCE(r.show_on_invoice, true),
        'invoice_line_description', COALESCE(r.invoice_line_description, 'Servicios de IA'),
        'budget', r.monthly_budget,
        'budget_used_percent', CASE
          WHEN r.monthly_budget > 0 THEN ROUND((t.cost_int / r.monthly_budget * 100)::NUMERIC, 1)
          ELSE NULL
        END
      ) ORDER BY t.cost_int DESC
    ), '[]'::jsonb)
    FROM (
      SELECT
        client_id,
        COUNT(*) AS cnt,
        SUM(total_tokens) AS tokens,
        SUM(cost_total) AS cost_int,
        SUM(billable_amount) AS cost_bill
      FROM public.ai_transaction_ledger
      WHERE organization_id = p_organization_id
        AND client_id IS NOT NULL
        AND created_at >= v_month
        AND created_at < (v_month + INTERVAL '1 month')
      GROUP BY client_id
    ) t
    LEFT JOIN public.client_ai_billing_rules r
      ON r.organization_id = p_organization_id
      AND r.client_id = t.client_id
      AND r.is_active = true
  );
END;
$$;

-- Note: ai_log_transaction_with_billing will be added in the next step when we wire the edge functions
-- because it depends on choosing the source of truth for model pricing (ai_models.*_cost_per_1m)
