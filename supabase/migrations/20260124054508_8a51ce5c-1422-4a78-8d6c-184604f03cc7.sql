-- ============================================================
-- L28-DOCKET: Campos Patentes
-- Tabla: public.matter_patent_details
-- ============================================================

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patent_type_enum') THEN
    CREATE TYPE public.patent_type_enum AS ENUM (
      'invention','utility_model','pct','divisional','continuation','cip'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patent_licensing_status_enum') THEN
    CREATE TYPE public.patent_licensing_status_enum AS ENUM (
      'none','exclusive','non_exclusive','compulsory'
    );
  END IF;
END $$;

-- Table
CREATE TABLE IF NOT EXISTS public.matter_patent_details (
  matter_id uuid PRIMARY KEY
    REFERENCES public.matters(id) ON DELETE CASCADE,

  patent_type public.patent_type_enum,

  title_invention text,
  abstract text,

  ipc_classes varchar[],
  cpc_classes varchar[],

  inventors jsonb[],
  applicants jsonb[],

  claims_count integer,
  independent_claims integer,
  claims_text text,

  description_pages integer,
  figures_count integer,

  pct_filing_date date,
  pct_filing_number varchar,
  pct_publication_date date,
  pct_publication_number varchar,

  national_phase_deadline date,
  national_phase_entered boolean,
  designated_states text[],

  examination_requested boolean,
  examination_request_date date,
  search_report_date date,

  grant_date date,
  grant_fee_paid boolean,

  annuities jsonb[],
  next_annuity_date date,
  next_annuity_year integer,

  patent_term_adjustment integer,

  spc_applied boolean,
  spc_expiry date,

  licensing_status public.patent_licensing_status_enum NOT NULL DEFAULT 'none',

  family_id varchar
);

-- Indexes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' AND tablename='matter_patent_details' AND indexname='idx_mpdt_ipc_classes_gin'
  ) THEN
    CREATE INDEX idx_mpdt_ipc_classes_gin
      ON public.matter_patent_details
      USING gin (ipc_classes);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' AND tablename='matter_patent_details' AND indexname='idx_mpdt_pct_filing_number'
  ) THEN
    CREATE INDEX idx_mpdt_pct_filing_number
      ON public.matter_patent_details (pct_filing_number);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' AND tablename='matter_patent_details' AND indexname='idx_mpdt_family_id'
  ) THEN
    CREATE INDEX idx_mpdt_family_id
      ON public.matter_patent_details (family_id);
  END IF;
END $$;

-- RLS
ALTER TABLE public.matter_patent_details ENABLE ROW LEVEL SECURITY;

-- Policies: authorize via membership on the parent matter's organization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='matter_patent_details' AND policyname='View org patent details'
  ) THEN
    CREATE POLICY "View org patent details"
      ON public.matter_patent_details
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.matters m
          JOIN public.memberships ms
            ON ms.organization_id = m.organization_id
          WHERE m.id = matter_id
            AND ms.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='matter_patent_details' AND policyname='Create org patent details'
  ) THEN
    CREATE POLICY "Create org patent details"
      ON public.matter_patent_details
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.matters m
          JOIN public.memberships ms
            ON ms.organization_id = m.organization_id
          WHERE m.id = matter_id
            AND ms.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='matter_patent_details' AND policyname='Update org patent details'
  ) THEN
    CREATE POLICY "Update org patent details"
      ON public.matter_patent_details
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1
          FROM public.matters m
          JOIN public.memberships ms
            ON ms.organization_id = m.organization_id
          WHERE m.id = matter_id
            AND ms.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.matters m
          JOIN public.memberships ms
            ON ms.organization_id = m.organization_id
          WHERE m.id = matter_id
            AND ms.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='matter_patent_details' AND policyname='Delete org patent details'
  ) THEN
    CREATE POLICY "Delete org patent details"
      ON public.matter_patent_details
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1
          FROM public.matters m
          JOIN public.memberships ms
            ON ms.organization_id = m.organization_id
          WHERE m.id = matter_id
            AND ms.user_id = auth.uid()
        )
      );
  END IF;
END $$;