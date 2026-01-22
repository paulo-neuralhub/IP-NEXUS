-- Fix CRM lead events: generated column expires_at not allowed (immutability error)
-- Use a trigger to compute expires_at instead.

-- Create table without generated column (idempotent)
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

-- Ensure expires_at exists if table existed from a partial attempt
ALTER TABLE public.crm_lead_events
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Function to compute expires_at
CREATE OR REPLACE FUNCTION public.crm_lead_events_set_expires_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_decay_days INT;
BEGIN
  v_decay_days := COALESCE(NEW.decay_days, 90);
  NEW.expires_at := COALESCE(NEW.occurred_at, now()) + make_interval(days => v_decay_days);
  RETURN NEW;
END;
$$;

-- Trigger
DROP TRIGGER IF EXISTS trg_crm_lead_events_set_expires_at ON public.crm_lead_events;
CREATE TRIGGER trg_crm_lead_events_set_expires_at
BEFORE INSERT OR UPDATE OF occurred_at, decay_days
ON public.crm_lead_events
FOR EACH ROW
EXECUTE FUNCTION public.crm_lead_events_set_expires_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lead_events_contact ON public.crm_lead_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_lead_events_type ON public.crm_lead_events(event_type);
CREATE INDEX IF NOT EXISTS idx_lead_events_occurred_at ON public.crm_lead_events(organization_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_events_expires_at ON public.crm_lead_events(expires_at);

-- RLS
ALTER TABLE public.crm_lead_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crm_lead_events_all" ON public.crm_lead_events;
CREATE POLICY "crm_lead_events_all"
  ON public.crm_lead_events
  FOR ALL
  USING (organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()))
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()));
