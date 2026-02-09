
-- ============================================================
-- AUDIT FUNCTION: Read-only table stats for DB audit page
-- Returns table name, estimated row count, size, column count, RLS status
-- SECURITY DEFINER so it can access pg_catalog
-- ============================================================

CREATE OR REPLACE FUNCTION public.audit_get_table_stats()
RETURNS TABLE (
  table_name text,
  row_count bigint,
  table_size text,
  column_count integer,
  rls_enabled boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::text as table_name,
    COALESCE(c.reltuples::bigint, 0) as row_count,
    pg_size_pretty(pg_total_relation_size(quote_ident(t.tablename))) as table_size,
    (SELECT count(*)::integer FROM information_schema.columns col 
     WHERE col.table_name = t.tablename AND col.table_schema = 'public') as column_count,
    t.rowsecurity as rls_enabled
  FROM pg_tables t
  LEFT JOIN pg_class c ON c.relname = t.tablename AND c.relnamespace = 'public'::regnamespace
  WHERE t.schemaname = 'public'
  ORDER BY t.tablename;
END;
$$;

-- Only super admins should call this (enforced at app level)
REVOKE ALL ON FUNCTION public.audit_get_table_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.audit_get_table_stats() TO authenticated;
