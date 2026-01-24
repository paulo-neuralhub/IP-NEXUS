-- Función SQL solicitada: has_accepted_document(user_id, doc_code)
-- SECURITY INVOKER (por defecto) para respetar RLS de legal_acceptances

CREATE OR REPLACE FUNCTION public.has_accepted_document(p_user_id uuid, p_doc_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.legal_acceptances la
    JOIN public.legal_documents ld
      ON ld.id = la.document_id
    WHERE la.user_id = p_user_id
      AND ld.code = p_doc_code
      AND COALESCE(ld.is_active, true) = true
      AND la.version_accepted = ld.version
  );
$$;