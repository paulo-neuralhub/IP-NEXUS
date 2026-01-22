-- Secure credentials storage (encrypted at Edge Function level)

-- Table: secure_credentials
CREATE TABLE IF NOT EXISTS public.secure_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type text NOT NULL DEFAULT 'tenant', -- 'tenant' | 'backoffice'
  organization_id uuid NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider text NOT NULL, -- e.g. 'smtp', 'whatsapp', 'calendar'
  credential_key text NOT NULL, -- e.g. 'password', 'access_token'
  encrypted_value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_type, organization_id, provider, credential_key)
);

ALTER TABLE public.secure_credentials ENABLE ROW LEVEL SECURITY;

-- Deny direct client access (only Edge Functions using service role should touch encrypted_value)
DO $$ BEGIN
  BEGIN
    EXECUTE 'CREATE POLICY secure_credentials_deny_select ON public.secure_credentials FOR SELECT USING (false)';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'CREATE POLICY secure_credentials_deny_insert ON public.secure_credentials FOR INSERT WITH CHECK (false)';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'CREATE POLICY secure_credentials_deny_update ON public.secure_credentials FOR UPDATE USING (false) WITH CHECK (false)';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    EXECUTE 'CREATE POLICY secure_credentials_deny_delete ON public.secure_credentials FOR DELETE USING (false)';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- updated_at trigger function (shared)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_secure_credentials_updated_at ON public.secure_credentials;
CREATE TRIGGER update_secure_credentials_updated_at
BEFORE UPDATE ON public.secure_credentials
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper: get current org id (best-effort) for UI status checks
-- NOTE: Does not expose encrypted value.
CREATE OR REPLACE FUNCTION public.secure_credentials_status(p_organization_id uuid)
RETURNS TABLE(provider text, credential_key text, is_configured boolean, updated_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_backoffice_admin() OR p_organization_id = ANY(public.get_user_organization_ids())) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT sc.provider, sc.credential_key, true as is_configured, sc.updated_at
  FROM public.secure_credentials sc
  WHERE sc.owner_type = 'tenant' AND sc.organization_id = p_organization_id;
END;
$$;

REVOKE ALL ON FUNCTION public.secure_credentials_status(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.secure_credentials_status(uuid) TO authenticated;
