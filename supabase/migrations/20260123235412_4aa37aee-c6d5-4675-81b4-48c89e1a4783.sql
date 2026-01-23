-- ============================================================
-- P-BACKOFFICE-01 (compat layer) / P-SYSTEM-04 enhancements
-- - pgvector embeddings for ai_knowledge_base
-- - match_knowledge RPC
-- - system_events_log compatibility VIEW over system_events
-- ============================================================

-- 1) Enable pgvector (idempotent)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2) Add embedding column to existing KB
ALTER TABLE public.ai_knowledge_base
  ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 3) Vector index (optional; safe to create)
-- Note: ivfflat requires ANALYZE and works best with enough rows.
CREATE INDEX IF NOT EXISTS idx_ai_kb_embedding
  ON public.ai_knowledge_base
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 4) Semantic match function (restricted to backoffice staff)
CREATE OR REPLACE FUNCTION public.match_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  category text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_backoffice_staff() THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  RETURN QUERY
  SELECT
    kb.id,
    kb.title,
    kb.content,
    kb.category,
    (1 - (kb.embedding <=> query_embedding))::float AS similarity
  FROM public.ai_knowledge_base kb
  WHERE kb.is_active = true
    AND kb.embedding IS NOT NULL
    AND (1 - (kb.embedding <=> query_embedding)) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT LEAST(GREATEST(match_count, 1), 20);
END;
$$;

-- 5) Compatibility VIEW: system_events_log
-- (Your spec uses occurred_at/category; our table is public.system_events)
CREATE OR REPLACE VIEW public.system_events_log AS
SELECT
  se.id,
  se.created_at AS occurred_at,
  COALESCE(NULLIF(se.event_category, ''), split_part(se.event_type, '.', 1)) AS category,
  se.event_type,
  se.severity,
  se.organization_id,
  se.user_id,
  se.title,
  se.description,
  se.event_data,
  jsonb_build_object(
    'source', se.source,
    'ip_address', se.ip_address,
    'user_agent', se.user_agent,
    'request_id', se.request_id
  ) AS metadata,
  se.related_entity_type,
  se.related_entity_id,
  NULL::uuid AS parent_event_id,
  se.tags,
  false AS processed,
  NULL::timestamptz AS processed_at,
  se.requires_action,
  se.action_status AS action_taken,
  se.resolved_at AS action_taken_at,
  se.resolved_by AS action_taken_by,
  se.search_vector
FROM public.system_events se;

-- Force security invoker for view safety
ALTER VIEW public.system_events_log SET (security_invoker = true);
