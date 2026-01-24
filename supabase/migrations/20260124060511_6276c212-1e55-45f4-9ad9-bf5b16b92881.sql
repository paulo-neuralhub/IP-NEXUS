-- L32 CRM: relate tasks to deals
ALTER TABLE public.crm_tasks
ADD COLUMN IF NOT EXISTS deal_id uuid;

-- Optional FK (kept NOT VALID to avoid failure if crm_deals table differs across envs)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='deals'
  ) THEN
    -- if you use public.deals as the canonical table
    ALTER TABLE public.crm_tasks
      ADD CONSTRAINT crm_tasks_deal_id_fkey
      FOREIGN KEY (deal_id) REFERENCES public.deals(id)
      ON DELETE SET NULL
      NOT VALID;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='crm_deals'
  ) THEN
    ALTER TABLE public.crm_tasks
      ADD CONSTRAINT crm_tasks_deal_id_fkey
      FOREIGN KEY (deal_id) REFERENCES public.crm_deals(id)
      ON DELETE SET NULL
      NOT VALID;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_crm_tasks_deal_id ON public.crm_tasks (deal_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_org_deal_status ON public.crm_tasks (organization_id, deal_id, status);
