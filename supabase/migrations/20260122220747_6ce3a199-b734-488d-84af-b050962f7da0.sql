-- CRM-FIX-2 FINAL: remove legacy FKs + add compatibility triggers (legacy -> V2 when possible)

begin;

-- ============================================================
-- 1) DROP legacy FK constraints (keep columns, but stop enforcing legacy refs)
--    We drop any FK constraints on the legacy columns mentioned in FIX-2.
-- ============================================================

DO $$
DECLARE
  r record;
BEGIN
  -- crm_ai_recommendations.deal_id (legacy -> deals)
  FOR r IN (
    SELECT conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.contype = 'f'
      AND n.nspname = 'public'
      AND t.relname = 'crm_ai_recommendations'
      AND pg_get_constraintdef(c.oid) ILIKE '%(deal_id)%'
  ) LOOP
    EXECUTE format('ALTER TABLE public.crm_ai_recommendations DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;

  -- crm_ai_recommendations.contact_id (legacy -> contacts)
  FOR r IN (
    SELECT conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.contype = 'f'
      AND n.nspname = 'public'
      AND t.relname = 'crm_ai_recommendations'
      AND pg_get_constraintdef(c.oid) ILIKE '%(contact_id)%'
  ) LOOP
    EXECUTE format('ALTER TABLE public.crm_ai_recommendations DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;

  -- crm_ai_learning_logs.interaction_id (legacy -> activities)
  FOR r IN (
    SELECT conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.contype = 'f'
      AND n.nspname = 'public'
      AND t.relname = 'crm_ai_learning_logs'
      AND pg_get_constraintdef(c.oid) ILIKE '%(interaction_id)%'
  ) LOOP
    EXECUTE format('ALTER TABLE public.crm_ai_learning_logs DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;

  -- crm_lead_events.contact_id (legacy -> contacts)
  FOR r IN (
    SELECT conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.contype = 'f'
      AND n.nspname = 'public'
      AND t.relname = 'crm_lead_events'
      AND pg_get_constraintdef(c.oid) ILIKE '%(contact_id)%'
  ) LOOP
    EXECUTE format('ALTER TABLE public.crm_lead_events DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

-- ============================================================
-- 2) Compatibility triggers: if legacy column receives an ID that
--    actually exists in the V2 table, mirror it to crm_*.
--    This prevents “silent” divergence if some old code still writes
--    to legacy fields.
-- ============================================================

-- crm_ai_recommendations: deal_id/contact_id -> crm_deal_id/crm_contact_id when possible
CREATE OR REPLACE FUNCTION public.crm_ai_recommendations_legacy_to_v2()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- If legacy deal_id was provided and crm_deal_id is empty,
  -- only copy if the UUID exists in crm_deals.
  IF NEW.crm_deal_id IS NULL AND NEW.deal_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.crm_deals d WHERE d.id = NEW.deal_id) THEN
      NEW.crm_deal_id := NEW.deal_id;
    END IF;
  END IF;

  -- If legacy contact_id was provided and crm_contact_id is empty,
  -- only copy if the UUID exists in crm_contacts.
  IF NEW.crm_contact_id IS NULL AND NEW.contact_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.crm_contacts c WHERE c.id = NEW.contact_id) THEN
      NEW.crm_contact_id := NEW.contact_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crm_ai_recommendations_legacy_to_v2 ON public.crm_ai_recommendations;
CREATE TRIGGER trg_crm_ai_recommendations_legacy_to_v2
BEFORE INSERT OR UPDATE OF deal_id, contact_id, crm_deal_id, crm_contact_id
ON public.crm_ai_recommendations
FOR EACH ROW
EXECUTE FUNCTION public.crm_ai_recommendations_legacy_to_v2();


-- crm_ai_learning_logs: interaction_id -> crm_interaction_id when possible
CREATE OR REPLACE FUNCTION public.crm_ai_learning_logs_legacy_to_v2()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.crm_interaction_id IS NULL AND NEW.interaction_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.crm_interactions i WHERE i.id = NEW.interaction_id) THEN
      NEW.crm_interaction_id := NEW.interaction_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crm_ai_learning_logs_legacy_to_v2 ON public.crm_ai_learning_logs;
CREATE TRIGGER trg_crm_ai_learning_logs_legacy_to_v2
BEFORE INSERT OR UPDATE OF interaction_id, crm_interaction_id
ON public.crm_ai_learning_logs
FOR EACH ROW
EXECUTE FUNCTION public.crm_ai_learning_logs_legacy_to_v2();


-- crm_lead_events: contact_id -> crm_contact_id when possible
CREATE OR REPLACE FUNCTION public.crm_lead_events_legacy_to_v2()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.crm_contact_id IS NULL AND NEW.contact_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.crm_contacts c WHERE c.id = NEW.contact_id) THEN
      NEW.crm_contact_id := NEW.contact_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crm_lead_events_legacy_to_v2 ON public.crm_lead_events;
CREATE TRIGGER trg_crm_lead_events_legacy_to_v2
BEFORE INSERT OR UPDATE OF contact_id, crm_contact_id
ON public.crm_lead_events
FOR EACH ROW
EXECUTE FUNCTION public.crm_lead_events_legacy_to_v2();

commit;
