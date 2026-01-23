-- P-VOIP-01: Base de datos VoIP (Twilio)

-- NOTE: La función public.is_member_of_org(uuid) ya existe y la usan muchas policies.
-- Solo la redefinimos manteniendo el MISMO nombre de parámetro (org_id) para evitar errores.

CREATE OR REPLACE FUNCTION public.is_member_of_org(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1
    from public.memberships m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1
    from public.memberships m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
      and m.role in ('owner','admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================
-- TABLA: crm_voip_calls
-- =========================================================

CREATE TABLE IF NOT EXISTS public.crm_voip_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  contact_id uuid REFERENCES public.crm_contacts(id) ON DELETE SET NULL,
  account_id uuid REFERENCES public.crm_accounts(id) ON DELETE SET NULL,
  matter_id uuid REFERENCES public.matters(id) ON DELETE SET NULL,

  provider text NOT NULL DEFAULT 'twilio' CHECK (provider IN ('twilio', 'vonage', 'plivo')),

  call_sid text UNIQUE,
  parent_call_sid text,
  conference_sid text,

  from_number text NOT NULL,
  to_number text NOT NULL,
  caller_name text,

  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status text NOT NULL DEFAULT 'initiated' CHECK (status IN (
    'initiated', 'ringing', 'in_progress', 'completed', 'busy',
    'no_answer', 'canceled', 'failed', 'voicemail'
  )),

  initiated_at timestamptz NOT NULL DEFAULT now(),
  ringing_at timestamptz,
  answered_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer NOT NULL DEFAULT 0,

  recording_enabled boolean NOT NULL DEFAULT false,
  recording_consent boolean NOT NULL DEFAULT false,
  recording_sid text,
  recording_url text,
  recording_storage_path text,
  recording_duration_seconds integer,

  transcription_status text NOT NULL DEFAULT 'pending' CHECK (transcription_status IN (
    'pending', 'processing', 'completed', 'failed', 'skipped'
  )),
  transcription_text text,
  transcription_segments jsonb NOT NULL DEFAULT '[]'::jsonb,
  transcription_language text NOT NULL DEFAULT 'es',
  transcription_confidence numeric(3,2),

  ai_processed boolean NOT NULL DEFAULT false,
  ai_summary text,
  ai_sentiment text CHECK (ai_sentiment IN ('positive', 'neutral', 'negative', 'mixed')),
  ai_sentiment_score numeric(3,2),
  ai_action_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_topics jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_entities jsonb NOT NULL DEFAULT '{}'::jsonb,

  quality_score integer CHECK (quality_score >= 0 AND quality_score <= 100),
  quality_issues jsonb NOT NULL DEFAULT '[]'::jsonb,

  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,

  notes text,
  follow_up_required boolean NOT NULL DEFAULT false,
  follow_up_date date,

  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_voip_calls_org ON public.crm_voip_calls(organization_id);
CREATE INDEX IF NOT EXISTS idx_voip_calls_contact ON public.crm_voip_calls(contact_id);
CREATE INDEX IF NOT EXISTS idx_voip_calls_account ON public.crm_voip_calls(account_id);
CREATE INDEX IF NOT EXISTS idx_voip_calls_call_sid ON public.crm_voip_calls(call_sid);
CREATE INDEX IF NOT EXISTS idx_voip_calls_status ON public.crm_voip_calls(status);
CREATE INDEX IF NOT EXISTS idx_voip_calls_direction ON public.crm_voip_calls(direction);
CREATE INDEX IF NOT EXISTS idx_voip_calls_initiated_at ON public.crm_voip_calls(initiated_at DESC);
CREATE INDEX IF NOT EXISTS idx_voip_calls_from_number ON public.crm_voip_calls(from_number);
CREATE INDEX IF NOT EXISTS idx_voip_calls_to_number ON public.crm_voip_calls(to_number);
CREATE INDEX IF NOT EXISTS idx_voip_calls_transcription_status ON public.crm_voip_calls(transcription_status);

CREATE INDEX IF NOT EXISTS idx_voip_calls_transcription_fts
  ON public.crm_voip_calls
  USING gin(to_tsvector('spanish', COALESCE(transcription_text, '')));

DROP TRIGGER IF EXISTS trg_voip_calls_set_updated_at ON public.crm_voip_calls;
CREATE TRIGGER trg_voip_calls_set_updated_at
  BEFORE UPDATE ON public.crm_voip_calls
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.calculate_voip_call_duration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND NEW.answered_at IS NOT NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.answered_at))::integer;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_voip_calls_calc_duration ON public.crm_voip_calls;
CREATE TRIGGER trg_voip_calls_calc_duration
  BEFORE UPDATE ON public.crm_voip_calls
  FOR EACH ROW
  WHEN (NEW.ended_at IS DISTINCT FROM OLD.ended_at)
  EXECUTE FUNCTION public.calculate_voip_call_duration();

ALTER TABLE public.crm_voip_calls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view calls of their organization" ON public.crm_voip_calls;
CREATE POLICY "Users can view calls of their organization"
  ON public.crm_voip_calls
  FOR SELECT
  USING (public.is_member_of_org(organization_id));

DROP POLICY IF EXISTS "Users can create calls for their organization" ON public.crm_voip_calls;
CREATE POLICY "Users can create calls for their organization"
  ON public.crm_voip_calls
  FOR INSERT
  WITH CHECK (public.is_member_of_org(organization_id));

DROP POLICY IF EXISTS "Users can update calls of their organization" ON public.crm_voip_calls;
CREATE POLICY "Users can update calls of their organization"
  ON public.crm_voip_calls
  FOR UPDATE
  USING (public.is_member_of_org(organization_id))
  WITH CHECK (public.is_member_of_org(organization_id));

-- =========================================================
-- TABLA: voip_settings
-- =========================================================

CREATE TABLE IF NOT EXISTS public.voip_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid UNIQUE NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  provider text NOT NULL DEFAULT 'twilio',

  account_sid text,
  auth_token text,
  api_key_sid text,
  api_key_secret text,

  primary_number text,
  fallback_number text,

  recording_enabled boolean NOT NULL DEFAULT true,
  recording_consent_required boolean NOT NULL DEFAULT true,
  recording_consent_message text NOT NULL DEFAULT 'Esta llamada será grabada para fines de calidad.',
  recording_storage text NOT NULL DEFAULT 'twilio' CHECK (recording_storage IN ('twilio', 'supabase', 's3')),

  transcription_enabled boolean NOT NULL DEFAULT true,
  transcription_provider text NOT NULL DEFAULT 'openai' CHECK (transcription_provider IN ('openai', 'deepgram', 'assembly')),
  transcription_language text NOT NULL DEFAULT 'es',

  ai_analysis_enabled boolean NOT NULL DEFAULT true,
  ai_provider text NOT NULL DEFAULT 'openai',
  ai_model text NOT NULL DEFAULT 'gpt-4o-mini',

  webhook_url text,
  status_callback_url text,

  max_call_duration_minutes integer NOT NULL DEFAULT 60,
  max_concurrent_calls integer NOT NULL DEFAULT 10,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_voip_settings_set_updated_at ON public.voip_settings;
CREATE TRIGGER trg_voip_settings_set_updated_at
  BEFORE UPDATE ON public.voip_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.voip_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage voip settings" ON public.voip_settings;
CREATE POLICY "Admins can manage voip settings"
  ON public.voip_settings
  FOR ALL
  USING (public.is_org_admin(organization_id))
  WITH CHECK (public.is_org_admin(organization_id));

-- =========================================================
-- TABLA: voip_phone_numbers
-- =========================================================

CREATE TABLE IF NOT EXISTS public.voip_phone_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  phone_number text NOT NULL,
  phone_number_sid text,
  friendly_name text,

  type text NOT NULL DEFAULT 'local' CHECK (type IN ('local', 'toll_free', 'mobile')),
  capabilities jsonb NOT NULL DEFAULT '{"voice": true, "sms": false, "mms": false}'::jsonb,

  assigned_to_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  is_primary boolean NOT NULL DEFAULT false,

  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE(organization_id, phone_number)
);

CREATE INDEX IF NOT EXISTS idx_voip_numbers_org ON public.voip_phone_numbers(organization_id);
CREATE INDEX IF NOT EXISTS idx_voip_numbers_user ON public.voip_phone_numbers(assigned_to_user_id);

DROP TRIGGER IF EXISTS trg_voip_numbers_set_updated_at ON public.voip_phone_numbers;
CREATE TRIGGER trg_voip_numbers_set_updated_at
  BEFORE UPDATE ON public.voip_phone_numbers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.voip_phone_numbers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view phone numbers of their organization" ON public.voip_phone_numbers;
CREATE POLICY "Users can view phone numbers of their organization"
  ON public.voip_phone_numbers
  FOR SELECT
  USING (public.is_member_of_org(organization_id));

-- =========================================================
-- RPC: create_voip_call
-- =========================================================

CREATE OR REPLACE FUNCTION public.create_voip_call(
  p_organization_id uuid,
  p_call_sid text,
  p_from_number text,
  p_to_number text,
  p_direction text,
  p_user_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_call_id uuid;
  v_contact_id uuid;
BEGIN
  IF NOT (auth.role() = 'service_role' OR public.is_member_of_org(p_organization_id)) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT c.id
    INTO v_contact_id
  FROM public.crm_contacts c
  WHERE c.organization_id = p_organization_id
    AND (
      c.phone = p_from_number OR c.phone = p_to_number OR
      c.whatsapp_phone = p_from_number OR c.whatsapp_phone = p_to_number
    )
  LIMIT 1;

  INSERT INTO public.crm_voip_calls (
    organization_id,
    contact_id,
    call_sid,
    from_number,
    to_number,
    direction,
    status,
    user_id,
    initiated_at
  ) VALUES (
    p_organization_id,
    v_contact_id,
    p_call_sid,
    p_from_number,
    p_to_number,
    p_direction,
    'initiated',
    p_user_id,
    now()
  )
  RETURNING id INTO v_call_id;

  RETURN v_call_id;
END;
$$;

-- =========================================================
-- RPC: search_call_transcriptions
-- =========================================================

CREATE OR REPLACE FUNCTION public.search_call_transcriptions(
  p_organization_id uuid,
  p_search_query text,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  call_id uuid,
  contact_name text,
  initiated_at timestamptz,
  duration_seconds integer,
  transcription_snippet text,
  relevance real
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (auth.role() = 'service_role' OR public.is_member_of_org(p_organization_id)) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT
    c.id AS call_id,
    cont.full_name AS contact_name,
    c.initiated_at,
    c.duration_seconds,
    ts_headline(
      'spanish',
      c.transcription_text,
      plainto_tsquery('spanish', p_search_query),
      'StartSel=<mark>, StopSel=</mark>, MaxWords=50, MinWords=20'
    ) AS transcription_snippet,
    ts_rank(to_tsvector('spanish', c.transcription_text), plainto_tsquery('spanish', p_search_query)) AS relevance
  FROM public.crm_voip_calls c
  LEFT JOIN public.crm_contacts cont ON c.contact_id = cont.id
  WHERE c.organization_id = p_organization_id
    AND c.transcription_text IS NOT NULL
    AND to_tsvector('spanish', c.transcription_text) @@ plainto_tsquery('spanish', p_search_query)
  ORDER BY relevance DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- =========================================================
-- Vistas (security_invoker)
-- =========================================================

CREATE OR REPLACE VIEW public.v_voip_calls_with_contact AS
SELECT
  c.*,
  cont.full_name AS contact_name,
  cont.email AS contact_email,
  u.full_name AS user_name
FROM public.crm_voip_calls c
LEFT JOIN public.crm_contacts cont ON c.contact_id = cont.id
LEFT JOIN public.users u ON c.user_id = u.id;

ALTER VIEW public.v_voip_calls_with_contact SET (security_invoker = true);

CREATE OR REPLACE VIEW public.v_voip_user_stats AS
SELECT
  user_id,
  organization_id,
  COUNT(*) AS total_calls,
  COUNT(*) FILTER (WHERE direction = 'outbound') AS outbound_calls,
  COUNT(*) FILTER (WHERE direction = 'inbound') AS inbound_calls,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_calls,
  AVG(duration_seconds) FILTER (WHERE status = 'completed') AS avg_duration,
  SUM(duration_seconds) AS total_duration
FROM public.crm_voip_calls
WHERE initiated_at >= now() - interval '30 days'
GROUP BY user_id, organization_id;

ALTER VIEW public.v_voip_user_stats SET (security_invoker = true);
