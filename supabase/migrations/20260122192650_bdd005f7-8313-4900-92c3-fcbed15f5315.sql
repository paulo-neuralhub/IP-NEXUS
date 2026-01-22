-- ============================================================
-- FIXED MIGRATION: delimiter-safe DO blocks + CRM tables + RLS + RPCs
-- Previous attempt failed with: ERROR 42601 near BEGIN (nested $$)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Tables
CREATE TABLE IF NOT EXISTS public.crm_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  legal_name text,
  status text NOT NULL DEFAULT 'active',
  tier text NOT NULL DEFAULT 'standard',
  health_score integer,
  churn_risk_level text,
  account_manager_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  last_interaction_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_accounts_org ON public.crm_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_accounts_manager ON public.crm_accounts(account_manager_id);
CREATE INDEX IF NOT EXISTS idx_crm_accounts_tags ON public.crm_accounts USING gin(tags);

CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.crm_accounts(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text,
  phone text,
  photo_url text,
  is_lead boolean NOT NULL DEFAULT true,
  lead_score integer NOT NULL DEFAULT 0,
  lead_status text NOT NULL DEFAULT 'new',
  whatsapp_enabled boolean NOT NULL DEFAULT false,
  portal_access_enabled boolean NOT NULL DEFAULT false,
  tags text[] NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_org ON public.crm_contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_account ON public.crm_contacts(account_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_lead_score ON public.crm_contacts(lead_score);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_tags ON public.crm_contacts USING gin(tags);

CREATE TABLE IF NOT EXISTS public.crm_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.crm_accounts(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  stage text NOT NULL DEFAULT 'open',
  opportunity_type text,
  amount numeric,
  weighted_amount numeric,
  expected_close_date date,
  actual_close_date date,
  stage_entered_at timestamptz NOT NULL DEFAULT now(),
  stage_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  close_reason text,
  lost_to_competitor text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_deals_org ON public.crm_deals(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_account ON public.crm_deals(account_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_contact ON public.crm_deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_owner ON public.crm_deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON public.crm_deals(stage);
CREATE INDEX IF NOT EXISTS idx_crm_deals_expected_close ON public.crm_deals(expected_close_date);

CREATE TABLE IF NOT EXISTS public.crm_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.crm_accounts(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES public.users(id) ON DELETE SET NULL,
  channel text NOT NULL DEFAULT 'note',
  direction text,
  status text,
  subject text,
  content text,
  ai_suggested_response text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_interactions_org ON public.crm_interactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_account ON public.crm_interactions(account_id);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_contact ON public.crm_interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_assigned_to ON public.crm_interactions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_created_at ON public.crm_interactions(created_at);

CREATE TABLE IF NOT EXISTS public.crm_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.crm_accounts(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES public.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  due_date date,
  completed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_tasks_org ON public.crm_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_assigned_to ON public.crm_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_status ON public.crm_tasks(status);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_due_date ON public.crm_tasks(due_date);

-- 2) updated_at function (create if missing)
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname='public' AND p.proname='update_updated_at_column'
  ) THEN
    EXECUTE $fn$
      CREATE OR REPLACE FUNCTION public.update_updated_at_column()
      RETURNS trigger
      LANGUAGE plpgsql
      SET search_path = public
      AS $func$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $func$;
    $fn$;
  END IF;
END
$do$;

-- 3) updated_at triggers
DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_crm_accounts_updated_at') THEN
    CREATE TRIGGER trg_crm_accounts_updated_at
      BEFORE UPDATE ON public.crm_accounts
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_crm_contacts_updated_at') THEN
    CREATE TRIGGER trg_crm_contacts_updated_at
      BEFORE UPDATE ON public.crm_contacts
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_crm_deals_updated_at') THEN
    CREATE TRIGGER trg_crm_deals_updated_at
      BEFORE UPDATE ON public.crm_deals
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_crm_tasks_updated_at') THEN
    CREATE TRIGGER trg_crm_tasks_updated_at
      BEFORE UPDATE ON public.crm_tasks
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$do$;

-- 4) RLS
ALTER TABLE public.crm_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;

DO $do$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['crm_accounts','crm_contacts','crm_deals','crm_interactions','crm_tasks']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname='public' AND tablename=tbl AND policyname='tenant_select'
    ) THEN
      EXECUTE format(
        'CREATE POLICY tenant_select ON public.%I FOR SELECT USING (organization_id = ANY(public.get_user_organization_ids()) OR public.is_backoffice_admin());',
        tbl
      );
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname='public' AND tablename=tbl AND policyname='tenant_insert'
    ) THEN
      EXECUTE format(
        'CREATE POLICY tenant_insert ON public.%I FOR INSERT WITH CHECK (organization_id = ANY(public.get_user_organization_ids()) OR public.is_backoffice_admin());',
        tbl
      );
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname='public' AND tablename=tbl AND policyname='tenant_update'
    ) THEN
      EXECUTE format(
        'CREATE POLICY tenant_update ON public.%I FOR UPDATE USING (organization_id = ANY(public.get_user_organization_ids()) OR public.is_backoffice_admin()) WITH CHECK (organization_id = ANY(public.get_user_organization_ids()) OR public.is_backoffice_admin());',
        tbl
      );
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname='public' AND tablename=tbl AND policyname='tenant_delete'
    ) THEN
      EXECUTE format(
        'CREATE POLICY tenant_delete ON public.%I FOR DELETE USING (organization_id = ANY(public.get_user_organization_ids()) OR public.is_backoffice_admin());',
        tbl
      );
    END IF;
  END LOOP;
END
$do$;

-- 5) RPCs

CREATE OR REPLACE FUNCTION public.crm_log_lead_event(
  p_contact_id uuid,
  p_event_type text,
  p_event_data jsonb DEFAULT '{}'::jsonb,
  p_event_source text DEFAULT 'manual'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  v_org_id uuid;
  v_score_impact int;
  v_event_id uuid;
BEGIN
  SELECT organization_id INTO v_org_id
  FROM public.crm_contacts
  WHERE id = p_contact_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Contact not found';
  END IF;

  v_score_impact := COALESCE((p_event_data->>'score_impact')::int, 0);

  INSERT INTO public.crm_lead_events (
    organization_id,
    contact_id,
    event_type,
    score_impact,
    event_data,
    source,
    occurred_at,
    decay_days
  ) VALUES (
    v_org_id,
    p_contact_id,
    p_event_type,
    v_score_impact,
    p_event_data,
    p_event_source,
    now(),
    COALESCE((p_event_data->>'decay_days')::int, NULL)
  ) RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$func$;

CREATE OR REPLACE FUNCTION public.crm_get_client_360(p_account_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  v_org_id uuid;
  v_account jsonb;
  v_contacts jsonb;
  v_deals jsonb;
  v_interactions jsonb;
BEGIN
  SELECT organization_id INTO v_org_id
  FROM public.crm_accounts
  WHERE id = p_account_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Account not found';
  END IF;

  IF NOT (v_org_id = ANY(public.get_user_organization_ids()) OR public.is_backoffice_admin()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT to_jsonb(a.*) INTO v_account
  FROM public.crm_accounts a
  WHERE a.id = p_account_id;

  SELECT COALESCE(jsonb_agg(to_jsonb(c.*) ORDER BY c.created_at DESC), '[]'::jsonb) INTO v_contacts
  FROM public.crm_contacts c
  WHERE c.account_id = p_account_id;

  SELECT COALESCE(jsonb_agg(to_jsonb(d.*) ORDER BY d.created_at DESC), '[]'::jsonb) INTO v_deals
  FROM public.crm_deals d
  WHERE d.account_id = p_account_id;

  SELECT COALESCE(jsonb_agg(to_jsonb(i.*) ORDER BY i.created_at DESC), '[]'::jsonb) INTO v_interactions
  FROM public.crm_interactions i
  WHERE i.account_id = p_account_id
  LIMIT 100;

  RETURN jsonb_build_object(
    'account', v_account,
    'contacts', v_contacts,
    'deals', v_deals,
    'interactions', v_interactions
  );
END;
$func$;

CREATE OR REPLACE FUNCTION public.crm_get_pipeline_summary(p_organization_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
BEGIN
  IF NOT (p_organization_id = ANY(public.get_user_organization_ids()) OR public.is_backoffice_admin()) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN (
    WITH stage_rollup AS (
      SELECT
        d.stage,
        count(*)::int as stage_count,
        COALESCE(sum(d.amount),0) as stage_amount,
        COALESCE(sum(d.weighted_amount),0) as stage_weighted_amount
      FROM public.crm_deals d
      WHERE d.organization_id = p_organization_id
      GROUP BY d.stage
    ), totals AS (
      SELECT
        COALESCE(sum(stage_count),0)::int as total_count,
        COALESCE(sum(stage_amount),0) as total_amount,
        COALESCE(sum(stage_weighted_amount),0) as total_weighted_amount
      FROM stage_rollup
    )
    SELECT jsonb_build_object(
      'total', totals.total_count,
      'total_amount', totals.total_amount,
      'total_weighted_amount', totals.total_weighted_amount,
      'by_stage', COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'stage', stage,
            'count', stage_count,
            'amount', stage_amount,
            'weighted_amount', stage_weighted_amount
          ) ORDER BY stage
        ) FROM stage_rollup),
        '[]'::jsonb
      )
    )
    FROM totals
  );
END;
$func$;
