begin;

-- ============================================================
-- FIX-2 HARDENING: ensure V2 FK constraints exist + triggers exist
-- (idempotent, safe to run multiple times)
-- ============================================================

-- 1) Ensure V2 FK constraints on crm_ai_recommendations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE contype='f'
      AND conrelid = 'public.crm_ai_recommendations'::regclass
      AND conname = 'crm_ai_recommendations_crm_deal_id_fkey'
  ) THEN
    ALTER TABLE public.crm_ai_recommendations
      ADD CONSTRAINT crm_ai_recommendations_crm_deal_id_fkey
      FOREIGN KEY (crm_deal_id)
      REFERENCES public.crm_deals(id)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE contype='f'
      AND conrelid = 'public.crm_ai_recommendations'::regclass
      AND conname = 'crm_ai_recommendations_crm_contact_id_fkey'
  ) THEN
    ALTER TABLE public.crm_ai_recommendations
      ADD CONSTRAINT crm_ai_recommendations_crm_contact_id_fkey
      FOREIGN KEY (crm_contact_id)
      REFERENCES public.crm_contacts(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 2) Ensure V2 FK constraints on crm_ai_learning_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE contype='f'
      AND conrelid = 'public.crm_ai_learning_logs'::regclass
      AND conname = 'crm_ai_learning_logs_crm_interaction_id_fkey'
  ) THEN
    ALTER TABLE public.crm_ai_learning_logs
      ADD CONSTRAINT crm_ai_learning_logs_crm_interaction_id_fkey
      FOREIGN KEY (crm_interaction_id)
      REFERENCES public.crm_interactions(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- 3) Ensure V2 FK constraints on crm_lead_events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE contype='f'
      AND conrelid = 'public.crm_lead_events'::regclass
      AND conname = 'crm_lead_events_crm_contact_id_fkey'
  ) THEN
    ALTER TABLE public.crm_lead_events
      ADD CONSTRAINT crm_lead_events_crm_contact_id_fkey
      FOREIGN KEY (crm_contact_id)
      REFERENCES public.crm_contacts(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- 4) Recreate triggers (some environments may not have created them)

CREATE OR REPLACE FUNCTION public.crm_ai_recommendations_legacy_to_v2()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.crm_deal_id IS NULL AND NEW.deal_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.crm_deals d WHERE d.id = NEW.deal_id) THEN
      NEW.crm_deal_id := NEW.deal_id;
    END IF;
  END IF;

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
