-- ============================================================
-- IP-NEXUS CRM: CREATE MISSING TABLES + EXTEND EXISTING
-- Part 1: Schema changes (tables, columns, constraints, indexes)
-- ============================================================

-- 0) Shared trigger helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- 1) EXTEND organizations (add CRM fields)
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS health_score INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS health_components JSONB DEFAULT '{"engagement":50,"financial":50,"operational":50,"strategic":50}'::jsonb,
  ADD COLUMN IF NOT EXISTS churn_risk_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS churn_risk_level TEXT DEFAULT 'low',
  ADD COLUMN IF NOT EXISTS lifetime_value NUMERIC(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS outstanding_balance NUMERIC(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_score INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS account_tier TEXT DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS account_source TEXT,
  ADD COLUMN IF NOT EXISTS sentiment_score NUMERIC(3,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS days_since_contact INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_interaction_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ip_portfolio_summary JSONB DEFAULT '{"total_trademarks":0,"total_patents":0,"total_designs":0,"active_matters":0,"jurisdictions":[],"upcoming_deadlines":0,"portfolio_value_estimate":0}'::jsonb,
  ADD COLUMN IF NOT EXISTS crm_owner_id UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS is_platform_org BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_org_health_score ON public.organizations(health_score);
CREATE INDEX IF NOT EXISTS idx_org_churn_risk ON public.organizations(churn_risk_level);
CREATE INDEX IF NOT EXISTS idx_org_tier ON public.organizations(account_tier);
CREATE INDEX IF NOT EXISTS idx_org_last_interaction ON public.organizations(last_interaction_at);


-- 2) EXTEND contacts (add lead/CRM fields)
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lead_score_components JSONB DEFAULT '{"demographic":0,"behavioral":0,"ip_specific":0}'::jsonb,
  ADD COLUMN IF NOT EXISTS lead_status TEXT DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS lead_classification TEXT DEFAULT 'cold',
  ADD COLUMN IF NOT EXISTS lead_source TEXT,
  ADD COLUMN IF NOT EXISTS is_decision_maker BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_primary_contact BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'es',
  ADD COLUMN IF NOT EXISTS timezone TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_opted_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS portal_access_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS portal_last_login TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_interaction_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_followup_date DATE,
  ADD COLUMN IF NOT EXISTS total_interactions INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS crm_owner_id UUID REFERENCES public.users(id);

CREATE INDEX IF NOT EXISTS idx_contacts_lead_score ON public.contacts(lead_score);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_status ON public.contacts(lead_status);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_class ON public.contacts(lead_classification);
CREATE INDEX IF NOT EXISTS idx_contacts_decision_maker ON public.contacts(is_decision_maker) WHERE is_decision_maker = true;
CREATE INDEX IF NOT EXISTS idx_contacts_next_followup ON public.contacts(next_followup_date) WHERE next_followup_date IS NOT NULL;


-- 3) NEW TABLE: crm_ai_recommendations
CREATE TABLE IF NOT EXISTS public.crm_ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  matter_id UUID REFERENCES public.matters(id) ON DELETE CASCADE,

  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reasoning TEXT,

  priority TEXT DEFAULT 'medium',
  urgency INTEGER DEFAULT 50,

  predicted_impact NUMERIC(5,2),
  confidence NUMERIC(3,2) DEFAULT 0.70,

  suggested_action JSONB,

  status TEXT DEFAULT 'pending',
  action_taken TEXT,
  outcome TEXT,
  outcome_measured BOOLEAN DEFAULT false,
  actual_impact NUMERIC(5,2),

  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  actioned_at TIMESTAMPTZ,
  actioned_by UUID REFERENCES public.users(id)
);

CREATE INDEX IF NOT EXISTS idx_rec_org ON public.crm_ai_recommendations(organization_id);
CREATE INDEX IF NOT EXISTS idx_rec_pending ON public.crm_ai_recommendations(organization_id, status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_rec_priority ON public.crm_ai_recommendations(priority, urgency DESC);

DROP TRIGGER IF EXISTS trg_crm_ai_recommendations_updated_at ON public.crm_ai_recommendations;
CREATE TRIGGER trg_crm_ai_recommendations_updated_at
  BEFORE UPDATE ON public.crm_ai_recommendations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 4) NEW TABLE: crm_ai_learning_logs
CREATE TABLE IF NOT EXISTS public.crm_ai_learning_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  interaction_id UUID REFERENCES public.activities(id) ON DELETE SET NULL,

  context_type TEXT NOT NULL,
  input_context JSONB,
  ai_output TEXT NOT NULL,
  ai_model TEXT,
  prompt_hash TEXT,

  human_action TEXT,
  human_output TEXT,
  feedback_notes TEXT,

  correction_distance NUMERIC(5,4),
  semantic_similarity NUMERIC(5,4),
  time_to_action_seconds INTEGER,

  included_in_few_shot BOOLEAN DEFAULT false,
  few_shot_quality_score NUMERIC(3,2),
  processed_for_training BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

CREATE INDEX IF NOT EXISTS idx_learning_org ON public.crm_ai_learning_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_learning_type ON public.crm_ai_learning_logs(context_type);
CREATE INDEX IF NOT EXISTS idx_learning_few_shot ON public.crm_ai_learning_logs(included_in_few_shot) WHERE included_in_few_shot = true;
CREATE INDEX IF NOT EXISTS idx_learning_unprocessed ON public.crm_ai_learning_logs(processed_for_training) WHERE processed_for_training = false;


-- 5) NEW TABLE: crm_lead_events (NO generated column, use trigger)
CREATE TABLE IF NOT EXISTS public.crm_lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,

  event_type TEXT NOT NULL,
  score_impact INTEGER NOT NULL,
  decay_days INTEGER DEFAULT 90,

  event_data JSONB DEFAULT '{}'::jsonb,
  source TEXT,

  occurred_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.crm_lead_events_set_expires_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.expires_at := COALESCE(NEW.occurred_at, now()) + make_interval(days => COALESCE(NEW.decay_days, 90));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crm_lead_events_set_expires_at ON public.crm_lead_events;
CREATE TRIGGER trg_crm_lead_events_set_expires_at
BEFORE INSERT OR UPDATE OF occurred_at, decay_days
ON public.crm_lead_events
FOR EACH ROW EXECUTE FUNCTION public.crm_lead_events_set_expires_at();

CREATE INDEX IF NOT EXISTS idx_lead_events_contact ON public.crm_lead_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_lead_events_type ON public.crm_lead_events(event_type);
CREATE INDEX IF NOT EXISTS idx_lead_events_occurred_at ON public.crm_lead_events(organization_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_events_expires_at ON public.crm_lead_events(expires_at);


-- 6) NEW TABLE: crm_account_health_history
CREATE TABLE IF NOT EXISTS public.crm_account_health_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  health_score INTEGER NOT NULL,
  health_components JSONB NOT NULL,
  churn_risk_score INTEGER,

  change_factors JSONB DEFAULT '[]'::jsonb,
  triggered_by TEXT,

  recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_history_timeline
  ON public.crm_account_health_history(organization_id, recorded_at DESC);
