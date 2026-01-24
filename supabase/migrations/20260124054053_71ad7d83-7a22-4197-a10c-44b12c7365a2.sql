-- ============================================================
-- L26-DOCKET: matters indexes + RLS policies (memberships-based)
-- ============================================================

-- UNIQUE (partial) for real references (exclude demo duplicates)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' AND tablename='matters' AND indexname='matters_org_reference_unique_real'
  ) THEN
    CREATE UNIQUE INDEX matters_org_reference_unique_real
      ON public.matters (organization_id, reference)
      WHERE reference IS NOT NULL AND reference NOT LIKE 'DEMO-%';
  END IF;
END $$;

-- Indexes requested
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='matters' AND indexname='idx_matters_client'
  ) THEN
    CREATE INDEX idx_matters_client ON public.matters (client_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='matters' AND indexname='idx_matters_ip_type'
  ) THEN
    CREATE INDEX idx_matters_ip_type ON public.matters (ip_type);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='matters' AND indexname='idx_matters_status_code'
  ) THEN
    CREATE INDEX idx_matters_status_code ON public.matters (status_code);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='matters' AND indexname='idx_matters_jurisdiction_code'
  ) THEN
    CREATE INDEX idx_matters_jurisdiction_code ON public.matters (jurisdiction_code);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='matters' AND indexname='idx_matters_filing_date'
  ) THEN
    CREATE INDEX idx_matters_filing_date ON public.matters (filing_date);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='matters' AND indexname='idx_matters_is_archived'
  ) THEN
    CREATE INDEX idx_matters_is_archived ON public.matters (is_archived);
  END IF;
END $$;

-- RLS policies aligned with existing pattern (organization_id in memberships for auth.uid())
ALTER TABLE public.matters ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='matters' AND policyname='View org matters'
  ) THEN
    CREATE POLICY "View org matters"
    ON public.matters
    FOR SELECT
    USING (
      organization_id IN (
        SELECT memberships.organization_id
        FROM memberships
        WHERE memberships.user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='matters' AND policyname='Create org matters'
  ) THEN
    CREATE POLICY "Create org matters"
    ON public.matters
    FOR INSERT
    WITH CHECK (
      organization_id IN (
        SELECT memberships.organization_id
        FROM memberships
        WHERE memberships.user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='matters' AND policyname='Update org matters'
  ) THEN
    CREATE POLICY "Update org matters"
    ON public.matters
    FOR UPDATE
    USING (
      organization_id IN (
        SELECT memberships.organization_id
        FROM memberships
        WHERE memberships.user_id = auth.uid()
      )
    )
    WITH CHECK (
      organization_id IN (
        SELECT memberships.organization_id
        FROM memberships
        WHERE memberships.user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='matters' AND policyname='Delete org matters'
  ) THEN
    CREATE POLICY "Delete org matters"
    ON public.matters
    FOR DELETE
    USING (
      organization_id IN (
        SELECT memberships.organization_id
        FROM memberships
        WHERE memberships.user_id = auth.uid()
      )
    );
  END IF;
END $$;