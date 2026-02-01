
-- =============================================================================
-- POST-AUDIT FIXES: Security improvements (Minimal valid version)
-- 1. Add security_invoker to 5 views with existing base tables
-- 2. Add RLS policies to api_rate_limits and webhook_events
-- 3. Drop orphaned views that reference non-existent tables
-- =============================================================================

-- -----------------------------------------------------------------------------
-- FIX 1A: Drop orphaned views (reference tables that don't exist)
-- -----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_voip_billing_summary;
DROP VIEW IF EXISTS v_voip_global_stats;
DROP VIEW IF EXISTS v_event_stats;
DROP VIEW IF EXISTS v_pending_events;
DROP VIEW IF EXISTS system_test_summary;

-- -----------------------------------------------------------------------------
-- FIX 1B: Views with security_invoker (only valid ones)
-- -----------------------------------------------------------------------------

-- 1. ai_usage_monthly
CREATE OR REPLACE VIEW ai_usage_monthly
WITH (security_invoker = true)
AS
SELECT id,
    organization_id,
    period_start,
    period_end,
    COALESCE(chat_messages, 0) AS total_queries,
    COALESCE(document_analyses, 0) AS total_analyses,
    COALESCE(document_generations, 0) AS total_generations,
    COALESCE(messages_count, 0) AS total_agent_runs,
    COALESCE(tokens_input, 0)::bigint AS total_input_tokens,
    COALESCE(tokens_output, 0)::bigint AS total_output_tokens,
    (COALESCE(tokens_input, 0) + COALESCE(tokens_output, 0))::bigint AS total_tokens,
    (COALESCE(estimated_cost_cents, 0)::numeric / 100.0)::numeric(10,4) AS total_cost_usd,
    updated_at
FROM ai_usage;

-- 2. signature_stats
CREATE OR REPLACE VIEW signature_stats
WITH (security_invoker = true)
AS
SELECT organization_id,
    count(*) FILTER (WHERE status = ANY (ARRAY['sent'::text, 'viewed'::text, 'partially_signed'::text])) AS pending_count,
    count(*) FILTER (WHERE status = 'completed'::text) AS completed_count,
    count(*) FILTER (WHERE status = 'declined'::text) AS declined_count,
    count(*) FILTER (WHERE status = 'expired'::text) AS expired_count,
    count(*) FILTER (WHERE status = 'voided'::text) AS voided_count,
    count(*) AS total_count
FROM signature_requests
GROUP BY organization_id;

-- 3. sidebar_menu_view
CREATE OR REPLACE VIEW sidebar_menu_view
WITH (security_invoker = true)
AS
SELECT s.code AS section_code,
    s.name AS section_name,
    s.name_short AS section_label,
    s.icon AS section_icon,
    s.display_order AS section_order,
    s.is_always_visible AS section_always_visible,
    m.code AS module_code,
    m.name AS module_name,
    m.short_name AS module_short_name,
    m.sidebar_icon AS module_icon,
    m.icon_lucide AS module_icon_lucide,
    m.color AS module_color,
    m.sidebar_order AS module_order,
    m.sidebar_expanded_default AS module_expanded,
    m.menu_items AS module_menu_items,
    m.category AS module_category,
    m.requires_modules AS module_requires,
    m.is_popular AS module_popular,
    m.is_coming_soon AS module_coming_soon
FROM sidebar_sections s
LEFT JOIN platform_modules m ON m.sidebar_section = s.code AND m.is_active = true
WHERE s.is_active = true
ORDER BY s.display_order, m.sidebar_order;

-- 4. crm_client_360_view
CREATE OR REPLACE VIEW crm_client_360_view
WITH (security_invoker = true)
AS
SELECT id AS account_id,
    organization_id,
    name AS account_name,
    status AS account_status,
    tier AS account_tier,
    health_score,
    churn_risk_level,
    last_interaction_at,
    ( SELECT count(*) FROM crm_contacts c WHERE c.account_id = a.id) AS total_contacts,
    ( SELECT count(*) FROM crm_contacts c WHERE c.account_id = a.id AND c.is_lead = true) AS total_leads,
    ( SELECT count(*) FROM crm_deals d LEFT JOIN crm_pipeline_stages s ON s.id = d.stage_id
      WHERE d.account_id = a.id AND (s.id IS NULL OR NOT s.is_won AND NOT s.is_lost)) AS open_deals,
    ( SELECT COALESCE(sum(d.amount), 0::numeric) FROM crm_deals d LEFT JOIN crm_pipeline_stages s ON s.id = d.stage_id
      WHERE d.account_id = a.id AND (s.id IS NULL OR NOT s.is_won AND NOT s.is_lost)) AS open_pipeline_value,
    ( SELECT count(*) FROM crm_deals d JOIN crm_pipeline_stages s ON s.id = d.stage_id
      WHERE d.account_id = a.id AND s.is_won = true) AS won_deals,
    ( SELECT COALESCE(sum(d.amount), 0::numeric) FROM crm_deals d JOIN crm_pipeline_stages s ON s.id = d.stage_id
      WHERE d.account_id = a.id AND s.is_won = true) AS total_revenue,
    ( SELECT count(*) FROM crm_interactions i WHERE i.account_id = a.id AND i.created_at > (now() - '30 days'::interval)) AS interactions_30d,
    ( SELECT count(*) FROM crm_tasks t WHERE t.account_id = a.id AND t.status = 'pending'::text) AS pending_tasks,
    ( SELECT max(crm_interactions.created_at) FROM crm_interactions WHERE crm_interactions.account_id = a.id) AS last_interaction_date,
    created_at,
    updated_at
FROM crm_accounts a;

-- 5. v_active_alerts - RECREATE with correct columns
DROP VIEW IF EXISTS v_active_alerts;
CREATE VIEW v_active_alerts
WITH (security_invoker = true)
AS
SELECT 
    id,
    organization_id,
    watchlist_id,
    watch_result_id,
    matter_id,
    alert_type,
    title,
    message,
    severity,
    status,
    data,
    action_url,
    notified_at,
    notified_via,
    created_at,
    read_at,
    read_by,
    actioned_at,
    actioned_by
FROM spider_alerts
WHERE status IN ('new', 'in_review', 'pending');

-- -----------------------------------------------------------------------------
-- FIX 2: RLS policies for api_rate_limits and webhook_events
-- These tables have RLS enabled but no policies (blocked access)
-- Using deny-all pattern: only service_role can access
-- -----------------------------------------------------------------------------

CREATE POLICY "api_rate_limits_deny_all" ON api_rate_limits
FOR ALL TO public
USING (false)
WITH CHECK (false);

CREATE POLICY "webhook_events_deny_all" ON webhook_events
FOR ALL TO public
USING (false)
WITH CHECK (false);
