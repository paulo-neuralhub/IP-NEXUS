-- ============================================================
-- L31-CRM: Support fields for Kanban win/loss on crm_deals
-- ============================================================

ALTER TABLE public.crm_deals
  ADD COLUMN IF NOT EXISTS won boolean,
  ADD COLUMN IF NOT EXISTS lost_reason text;

-- Helpful index for closed deals filtering
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' AND tablename='crm_deals' AND indexname='idx_crm_deals_won'
  ) THEN
    CREATE INDEX idx_crm_deals_won ON public.crm_deals (won);
  END IF;
END $$;