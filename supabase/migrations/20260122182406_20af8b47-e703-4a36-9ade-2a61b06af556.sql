-- ============================================================
-- IP-NEXUS CRM: MULTI-TENANT + BACKOFFICE (Part 2)
-- RLS policies, helper functions, platform org/roles, view, RPCs
-- ============================================================

-- 1) Create platform organization (IP-NEXUS itself)
INSERT INTO public.organizations (id, name, slug, plan, status, is_platform_org)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'IP-NEXUS Platform',
  'ip-nexus-platform',
  'enterprise',
  'active',
  true
)
ON CONFLICT (id) DO UPDATE SET
  is_platform_org = true,
  name = 'IP-NEXUS Platform';


-- 2) Add platform roles
INSERT INTO public.roles (id, name, code, description, is_system, is_editable, hierarchy_level, organization_id)
VALUES
  ('00000000-0000-0000-0001-000000000001', 'Platform Admin', 'platform_admin', 'Full platform access', true, false, 1000, NULL),
  ('00000000-0000-0000-0001-000000000002', 'Platform Support', 'platform_support', 'Support access to tenants', true, false, 900, NULL),
  ('00000000-0000-0000-0001-000000000003', 'Platform Sales', 'platform_sales', 'Sales pipeline access', true, false, 800, NULL),
  ('00000000-0000-0000-0001-000000000004', 'Platform Finance', 'platform_finance', 'Billing and revenue access', true, false, 700, NULL)
ON CONFLICT (id) DO NOTHING;


-- 3) Helper function: get user's organization IDs
CREATE OR REPLACE FUNCTION public.get_user_organization_ids()
RETURNS UUID[]
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(organization_id), ARRAY[]::uuid[])
  FROM public.memberships
  WHERE user_id = auth.uid();
$$;


-- 4) Helper function: check if user is backoffice admin
CREATE OR REPLACE FUNCTION public.is_backoffice_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.memberships m
    JOIN public.roles r ON r.id = m.role_id
    WHERE m.user_id = auth.uid()
      AND r.code IN ('platform_admin', 'platform_support', 'platform_sales', 'platform_finance')
  );
$$;


-- 5) Helper function: get user's platform role
CREATE OR REPLACE FUNCTION public.get_user_platform_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT r.code
  FROM public.memberships m
  JOIN public.roles r ON r.id = m.role_id
  WHERE m.user_id = auth.uid()
    AND r.code LIKE 'platform_%'
  ORDER BY r.hierarchy_level DESC
  LIMIT 1;
$$;


-- 6) Enable RLS + policies for CRM tables
ALTER TABLE public.crm_ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_ai_learning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_lead_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_account_health_history ENABLE ROW LEVEL SECURITY;

-- crm_ai_recommendations
DROP POLICY IF EXISTS "tenant_isolation_crm_recommendations" ON public.crm_ai_recommendations;
CREATE POLICY "tenant_isolation_crm_recommendations"
  ON public.crm_ai_recommendations FOR ALL
  USING (organization_id = ANY(public.get_user_organization_ids()) OR public.is_backoffice_admin())
  WITH CHECK (organization_id = ANY(public.get_user_organization_ids()) OR public.is_backoffice_admin());

-- crm_ai_learning_logs
DROP POLICY IF EXISTS "tenant_isolation_crm_learning" ON public.crm_ai_learning_logs;
CREATE POLICY "tenant_isolation_crm_learning"
  ON public.crm_ai_learning_logs FOR ALL
  USING (organization_id = ANY(public.get_user_organization_ids()) OR public.is_backoffice_admin())
  WITH CHECK (organization_id = ANY(public.get_user_organization_ids()) OR public.is_backoffice_admin());

-- crm_lead_events
DROP POLICY IF EXISTS "tenant_isolation_crm_lead_events" ON public.crm_lead_events;
CREATE POLICY "tenant_isolation_crm_lead_events"
  ON public.crm_lead_events FOR ALL
  USING (organization_id = ANY(public.get_user_organization_ids()) OR public.is_backoffice_admin())
  WITH CHECK (organization_id = ANY(public.get_user_organization_ids()) OR public.is_backoffice_admin());

-- crm_account_health_history
DROP POLICY IF EXISTS "tenant_isolation_crm_health_history" ON public.crm_account_health_history;
CREATE POLICY "tenant_isolation_crm_health_history"
  ON public.crm_account_health_history FOR ALL
  USING (organization_id = ANY(public.get_user_organization_ids()) OR public.is_backoffice_admin())
  WITH CHECK (organization_id = ANY(public.get_user_organization_ids()) OR public.is_backoffice_admin());


-- 7) Backoffice View: All tenants as CRM clients (security_invoker for RLS)
CREATE OR REPLACE VIEW public.backoffice_tenant_crm
WITH (security_invoker = true)
AS
SELECT 
  o.id,
  o.name,
  o.slug,
  o.plan,
  o.status,
  o.created_at as customer_since,
  s.status as subscription_status,
  s.current_period_end as renewal_date,
  s.billing_cycle,
  o.health_score,
  o.churn_risk_level,
  o.churn_risk_score,
  o.lifetime_value,
  o.account_tier,
  o.industry,
  o.sentiment_score,
  o.days_since_contact,
  o.last_interaction_at,
  (SELECT COUNT(*) FROM public.matters m WHERE m.organization_id = o.id) as total_matters,
  (SELECT COUNT(*) FROM public.contacts c WHERE c.organization_id = o.id) as total_contacts,
  (SELECT COUNT(*) FROM public.memberships mb WHERE mb.organization_id = o.id) as total_users,
  (SELECT COUNT(*) FROM public.deals d WHERE d.organization_id = o.id) as total_deals,
  (SELECT MAX(created_at) FROM public.matters m WHERE m.organization_id = o.id) as last_matter_created,
  (SELECT COUNT(*) FROM public.matters m WHERE m.organization_id = o.id AND m.created_at > now() - INTERVAL '30 days') as matters_last_30d,
  (SELECT COUNT(*) FROM public.ai_conversations ac WHERE ac.organization_id = o.id AND ac.created_at > now() - INTERVAL '30 days') as ai_conversations_30d
FROM public.organizations o
LEFT JOIN public.subscriptions s ON s.organization_id = o.id
WHERE COALESCE(o.is_platform_org, false) = false;

COMMENT ON VIEW public.backoffice_tenant_crm IS 'Backoffice view: all tenants as CRM clients';


-- 8) Backoffice RPC: Platform metrics
CREATE OR REPLACE FUNCTION public.backoffice_get_platform_metrics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_backoffice_admin() THEN
    RAISE EXCEPTION 'Access denied: backoffice admin required';
  END IF;

  RETURN jsonb_build_object(
    'total_tenants', (SELECT COUNT(*) FROM public.organizations WHERE COALESCE(is_platform_org, false) = false),
    'active_tenants', (
      SELECT COUNT(*) FROM public.organizations o
      WHERE COALESCE(is_platform_org, false) = false
        AND EXISTS (SELECT 1 FROM public.matters m WHERE m.organization_id = o.id AND m.created_at > now() - INTERVAL '30 days')
    ),
    'new_tenants_this_month', (
      SELECT COUNT(*) FROM public.organizations
      WHERE COALESCE(is_platform_org, false) = false
        AND created_at >= date_trunc('month', now())
    ),
    'active_subscriptions', (SELECT COUNT(*) FROM public.subscriptions WHERE status = 'active'),
    'tenants_at_risk', (
      SELECT COUNT(*) FROM public.organizations
      WHERE COALESCE(is_platform_org, false) = false
        AND COALESCE(churn_risk_level, 'low') IN ('high', 'critical')
    ),
    'avg_tenant_health', (
      SELECT COALESCE(AVG(health_score), 50)
      FROM public.organizations
      WHERE COALESCE(is_platform_org, false) = false
    ),
    'total_matters_platform', (SELECT COUNT(*) FROM public.matters),
    'total_contacts_platform', (SELECT COUNT(*) FROM public.contacts),
    'total_deals_platform', (SELECT COUNT(*) FROM public.deals),
    'total_ai_conversations_30d', (
      SELECT COUNT(*) FROM public.ai_conversations WHERE created_at > now() - INTERVAL '30 days'
    ),
    'pending_recommendations', (
      SELECT COUNT(*) FROM public.crm_ai_recommendations WHERE status = 'pending'
    )
  );
END;
$$;


-- 9) Backoffice RPC: Tenant list with filters
CREATE OR REPLACE FUNCTION public.backoffice_get_tenant_list(
  p_filter_risk TEXT DEFAULT NULL,
  p_filter_plan TEXT DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'customer_since',
  p_sort_order TEXT DEFAULT 'desc',
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
  v_total INT;
BEGIN
  IF NOT public.is_backoffice_admin() THEN
    RAISE EXCEPTION 'Access denied: backoffice admin required';
  END IF;

  SELECT COUNT(*) INTO v_total
  FROM public.backoffice_tenant_crm
  WHERE (p_filter_risk IS NULL OR churn_risk_level = p_filter_risk)
    AND (p_filter_plan IS NULL OR plan = p_filter_plan);

  SELECT jsonb_build_object(
    'tenants', COALESCE(jsonb_agg(row_to_json(t.*) ORDER BY
      CASE WHEN p_sort_by = 'customer_since' AND p_sort_order = 'desc' THEN t.customer_since END DESC NULLS LAST,
      CASE WHEN p_sort_by = 'customer_since' AND p_sort_order = 'asc' THEN t.customer_since END ASC NULLS LAST,
      CASE WHEN p_sort_by = 'health_score' AND p_sort_order = 'desc' THEN t.health_score END DESC NULLS LAST,
      CASE WHEN p_sort_by = 'health_score' AND p_sort_order = 'asc' THEN t.health_score END ASC NULLS LAST,
      t.customer_since DESC NULLS LAST
    ), '[]'::jsonb),
    'total', v_total,
    'limit', p_limit,
    'offset', p_offset
  ) INTO v_result
  FROM (
    SELECT *
    FROM public.backoffice_tenant_crm
    WHERE (p_filter_risk IS NULL OR churn_risk_level = p_filter_risk)
      AND (p_filter_plan IS NULL OR plan = p_filter_plan)
    LIMIT p_limit
    OFFSET p_offset
  ) t;

  RETURN v_result;
END;
$$;


-- 10) Backoffice RPC: Tenant detail
CREATE OR REPLACE FUNCTION public.backoffice_get_tenant_detail(p_tenant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_backoffice_admin() THEN
    RAISE EXCEPTION 'Access denied: backoffice admin required';
  END IF;

  RETURN jsonb_build_object(
    'organization', (
      SELECT jsonb_build_object(
        'id', o.id, 'name', o.name, 'slug', o.slug, 'plan', o.plan, 'status', o.status,
        'created_at', o.created_at, 'health_score', o.health_score,
        'health_components', o.health_components, 'churn_risk_level', o.churn_risk_level,
        'churn_risk_score', o.churn_risk_score, 'lifetime_value', o.lifetime_value,
        'account_tier', o.account_tier, 'industry', o.industry, 'last_interaction_at', o.last_interaction_at
      )
      FROM public.organizations o WHERE o.id = p_tenant_id
    ),
    'subscription', (
      SELECT jsonb_build_object(
        'id', s.id, 'status', s.status, 'billing_cycle', s.billing_cycle,
        'current_period_start', s.current_period_start, 'current_period_end', s.current_period_end,
        'stripe_subscription_id', s.stripe_subscription_id, 'cancel_at_period_end', s.cancel_at_period_end
      )
      FROM public.subscriptions s WHERE s.organization_id = p_tenant_id
    ),
    'users', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', u.id, 'email', u.email, 'full_name', u.full_name,
        'role', r.name, 'role_code', r.code, 'created_at', m.created_at
      ) ORDER BY r.hierarchy_level DESC), '[]'::jsonb)
      FROM public.memberships m
      JOIN public.users u ON u.id = m.user_id
      LEFT JOIN public.roles r ON r.id = m.role_id
      WHERE m.organization_id = p_tenant_id
    ),
    'usage', jsonb_build_object(
      'matters', (SELECT COUNT(*) FROM public.matters WHERE organization_id = p_tenant_id),
      'contacts', (SELECT COUNT(*) FROM public.contacts WHERE organization_id = p_tenant_id),
      'deals', (SELECT COUNT(*) FROM public.deals WHERE organization_id = p_tenant_id),
      'activities', (SELECT COUNT(*) FROM public.activities WHERE organization_id = p_tenant_id),
      'ai_conversations', (SELECT COUNT(*) FROM public.ai_conversations WHERE organization_id = p_tenant_id)
    ),
    'recent_matters', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', m.id, 'reference', m.reference, 'title', m.title,
        'matter_type', m.matter_type, 'status', m.status, 'created_at', m.created_at
      ) ORDER BY m.created_at DESC), '[]'::jsonb)
      FROM (SELECT * FROM public.matters WHERE organization_id = p_tenant_id ORDER BY created_at DESC LIMIT 10) m
    ),
    'health_history', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'recorded_at', h.recorded_at, 'health_score', h.health_score,
        'health_components', h.health_components, 'churn_risk_score', h.churn_risk_score
      ) ORDER BY h.recorded_at DESC), '[]'::jsonb)
      FROM public.crm_account_health_history h WHERE h.organization_id = p_tenant_id LIMIT 30
    ),
    'recommendations', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', r.id, 'type', r.type, 'title', r.title,
        'priority', r.priority, 'status', r.status, 'created_at', r.created_at
      ) ORDER BY r.created_at DESC), '[]'::jsonb)
      FROM public.crm_ai_recommendations r WHERE r.organization_id = p_tenant_id LIMIT 20
    )
  );
END;
$$;
