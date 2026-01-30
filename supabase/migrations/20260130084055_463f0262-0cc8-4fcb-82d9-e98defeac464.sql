-- Fix matter number generation: remove obsolete unique constraint/index that blocks monthly/yearly sequences
DO $$
BEGIN
  -- Some older deployments created a unique constraint/index without the `month` column.
  -- That breaks INSERT ... ON CONFLICT(organization_id, matter_type, jurisdiction_code, year, month)
  -- because conflicts can happen on the old 4-column constraint and won't be handled.

  -- Drop as CONSTRAINT (if it exists)
  IF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'matter_sequences'
      AND c.conname = 'idx_matter_sequences_unique_key'
  ) THEN
    EXECUTE 'ALTER TABLE public.matter_sequences DROP CONSTRAINT idx_matter_sequences_unique_key';
  END IF;

  -- Drop as INDEX (if it exists)
  IF EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'matter_sequences'
      AND indexname = 'idx_matter_sequences_unique_key'
  ) THEN
    EXECUTE 'DROP INDEX public.idx_matter_sequences_unique_key';
  END IF;

  -- Ensure the correct unique constraint exists (with month)
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'matter_sequences'
      AND c.contype = 'u'
      AND pg_get_constraintdef(c.oid) = 'UNIQUE (organization_id, matter_type, jurisdiction_code, year, month)'
  ) THEN
    EXECUTE 'ALTER TABLE public.matter_sequences ADD CONSTRAINT matter_sequences_org_type_jur_year_month_key UNIQUE (organization_id, matter_type, jurisdiction_code, year, month)';
  END IF;
END $$;