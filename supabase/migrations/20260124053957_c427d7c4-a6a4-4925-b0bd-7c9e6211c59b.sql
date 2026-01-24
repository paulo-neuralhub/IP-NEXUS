-- ============================================================
-- L26-DOCKET: Extend public.matters (columns + FKs, non-breaking)
-- This migration only adds missing columns/types and safe FKs.
-- ============================================================

-- Enum types (future-proof)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ip_type_enum') THEN
    CREATE TYPE public.ip_type_enum AS ENUM (
      'trademark','patent','design','domain','copyright','trade_name'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'matter_status_enum') THEN
    CREATE TYPE public.matter_status_enum AS ENUM (
      'draft','filed','examination','published','opposition','registered','granted',
      'renewed','rejected','withdrawn','expired','abandoned'
    );
  END IF;
END $$;

-- Add requested base columns (non-breaking: keep existing `type` and `status`)
ALTER TABLE public.matters
  ADD COLUMN IF NOT EXISTS client_id uuid,
  ADD COLUMN IF NOT EXISTS ip_type public.ip_type_enum,
  ADD COLUMN IF NOT EXISTS status_code public.matter_status_enum,
  ADD COLUMN IF NOT EXISTS status_date timestamptz,
  ADD COLUMN IF NOT EXISTS filing_number text,
  ADD COLUMN IF NOT EXISTS priority_date date,
  ADD COLUMN IF NOT EXISTS priority_number text,
  ADD COLUMN IF NOT EXISTS priority_country text,
  ADD COLUMN IF NOT EXISTS applicant_id uuid,
  ADD COLUMN IF NOT EXISTS holder_id uuid,
  ADD COLUMN IF NOT EXISTS responsible_user_id uuid,
  ADD COLUMN IF NOT EXISTS secondary_user_id uuid,
  ADD COLUMN IF NOT EXISTS internal_notes text,
  ADD COLUMN IF NOT EXISTS estimated_value numeric,
  ADD COLUMN IF NOT EXISTS cost_center text,
  ADD COLUMN IF NOT EXISTS custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_by uuid;

-- Ensure jurisdictions.code can be referenced (unique)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' AND tablename='jurisdictions' AND indexname='jurisdictions_code_unique'
  ) THEN
    CREATE UNIQUE INDEX jurisdictions_code_unique ON public.jurisdictions (code);
  END IF;
END $$;

-- Foreign keys (best-effort)
DO $$
BEGIN
  -- matters -> contacts ("clients" in spec)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema='public' AND table_name='matters' AND constraint_name='matters_client_id_fkey'
  ) THEN
    ALTER TABLE public.matters
      ADD CONSTRAINT matters_client_id_fkey
      FOREIGN KEY (client_id) REFERENCES public.contacts(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema='public' AND table_name='matters' AND constraint_name='matters_applicant_id_fkey'
  ) THEN
    ALTER TABLE public.matters
      ADD CONSTRAINT matters_applicant_id_fkey
      FOREIGN KEY (applicant_id) REFERENCES public.contacts(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema='public' AND table_name='matters' AND constraint_name='matters_holder_id_fkey'
  ) THEN
    ALTER TABLE public.matters
      ADD CONSTRAINT matters_holder_id_fkey
      FOREIGN KEY (holder_id) REFERENCES public.contacts(id) ON DELETE SET NULL;
  END IF;

  -- matters -> users
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema='public' AND table_name='matters' AND constraint_name='matters_responsible_user_id_fkey'
  ) THEN
    ALTER TABLE public.matters
      ADD CONSTRAINT matters_responsible_user_id_fkey
      FOREIGN KEY (responsible_user_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema='public' AND table_name='matters' AND constraint_name='matters_secondary_user_id_fkey'
  ) THEN
    ALTER TABLE public.matters
      ADD CONSTRAINT matters_secondary_user_id_fkey
      FOREIGN KEY (secondary_user_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema='public' AND table_name='matters' AND constraint_name='matters_updated_by_fkey'
  ) THEN
    ALTER TABLE public.matters
      ADD CONSTRAINT matters_updated_by_fkey
      FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;

  -- jurisdiction_code -> jurisdictions.code (NOT VALID to avoid existing 'WO' mismatch)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema='public' AND table_name='matters' AND constraint_name='matters_jurisdiction_code_fkey'
  ) THEN
    ALTER TABLE public.matters
      ADD CONSTRAINT matters_jurisdiction_code_fkey
      FOREIGN KEY (jurisdiction_code)
      REFERENCES public.jurisdictions(code)
      ON UPDATE CASCADE
      ON DELETE SET NULL
      NOT VALID;
  END IF;
END $$;

-- RLS (idempotent)
ALTER TABLE public.matters ENABLE ROW LEVEL SECURITY;