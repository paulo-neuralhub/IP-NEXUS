-- Ajustar tablas existentes para el sistema de documentos legales solicitado

-- 0) Helper trigger para updated_at (idempotente)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 1) Extender public.legal_documents (ya existe)
ALTER TABLE public.legal_documents
  ADD COLUMN IF NOT EXISTS organization_id UUID NULL,
  ADD COLUMN IF NOT EXISTS code VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS effective_date DATE NULL,
  ADD COLUMN IF NOT EXISTS requires_signature BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS signature_type TEXT NULL,
  ADD COLUMN IF NOT EXISTS show_on_ai_first_use BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Constraint signature_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'legal_documents_signature_type_chk'
      AND conrelid = 'public.legal_documents'::regclass
  ) THEN
    ALTER TABLE public.legal_documents
      ADD CONSTRAINT legal_documents_signature_type_chk
      CHECK (signature_type IS NULL OR signature_type IN ('checkbox','typed_name'));
  END IF;
END $$;

-- Backfill de campos para filas existentes
UPDATE public.legal_documents
SET
  code = COALESCE(code, doc_type::text),
  effective_date = COALESCE(effective_date, effective_from::date),
  updated_at = COALESCE(updated_at, created_at, now())
WHERE code IS NULL OR effective_date IS NULL OR updated_at IS NULL;

-- Índices (idempotentes)
CREATE INDEX IF NOT EXISTS legal_documents_code_idx
  ON public.legal_documents (code);

CREATE INDEX IF NOT EXISTS legal_documents_org_idx
  ON public.legal_documents (organization_id);

CREATE INDEX IF NOT EXISTS legal_documents_active_idx
  ON public.legal_documents (is_active);

-- Único por org+code+version (org NULL tratado como sistema)
CREATE UNIQUE INDEX IF NOT EXISTS legal_documents_org_code_version_uniq
  ON public.legal_documents (
    COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'::uuid),
    code,
    version
  );

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_legal_documents_updated_at ON public.legal_documents;
CREATE TRIGGER trg_legal_documents_updated_at
BEFORE UPDATE ON public.legal_documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Crear public.legal_acceptances (si no existe)
CREATE TABLE IF NOT EXISTS public.legal_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NULL,
  user_id UUID NOT NULL,
  document_id UUID NOT NULL REFERENCES public.legal_documents(id) ON DELETE CASCADE,

  version_accepted VARCHAR(20) NOT NULL,
  content_hash VARCHAR(64) NOT NULL,

  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET NULL,
  user_agent TEXT NULL,

  acceptance_method TEXT NOT NULL,
  signature_data JSONB NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT legal_acceptances_method_chk
    CHECK (acceptance_method IN ('checkbox','typed_name','electronic')),

  CONSTRAINT legal_acceptances_hash_len_chk
    CHECK (char_length(content_hash) = 64),

  CONSTRAINT legal_acceptances_user_document_uniq
    UNIQUE (user_id, document_id)
);

CREATE INDEX IF NOT EXISTS legal_acceptances_user_id_idx
  ON public.legal_acceptances (user_id);

CREATE INDEX IF NOT EXISTS legal_acceptances_document_id_idx
  ON public.legal_acceptances (document_id);

CREATE INDEX IF NOT EXISTS legal_acceptances_accepted_at_idx
  ON public.legal_acceptances (accepted_at);

DROP TRIGGER IF EXISTS trg_legal_acceptances_updated_at ON public.legal_acceptances;
CREATE TRIGGER trg_legal_acceptances_updated_at
BEFORE UPDATE ON public.legal_acceptances
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) RLS
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_acceptances ENABLE ROW LEVEL SECURITY;

-- Documentos: lectura para usuarios autenticados de su(s) org(s) + sistema (organization_id NULL)
-- Asume existencia de public.memberships(user_id, organization_id)
DROP POLICY IF EXISTS "Legal documents are readable for member orgs and system" ON public.legal_documents;
CREATE POLICY "Legal documents are readable for member orgs and system"
ON public.legal_documents
FOR SELECT
TO authenticated
USING (
  organization_id IS NULL
  OR EXISTS (
    SELECT 1
    FROM public.memberships m
    WHERE m.user_id = auth.uid()
      AND m.organization_id = legal_documents.organization_id
  )
);

-- Aceptaciones: cada usuario ve/crea/edita/borra solo las suyas
DROP POLICY IF EXISTS "Users can view their own legal acceptances" ON public.legal_acceptances;
CREATE POLICY "Users can view their own legal acceptances"
ON public.legal_acceptances
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own legal acceptances" ON public.legal_acceptances;
CREATE POLICY "Users can create their own legal acceptances"
ON public.legal_acceptances
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own legal acceptances" ON public.legal_acceptances;
CREATE POLICY "Users can update their own legal acceptances"
ON public.legal_acceptances
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own legal acceptances" ON public.legal_acceptances;
CREATE POLICY "Users can delete their own legal acceptances"
ON public.legal_acceptances
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
