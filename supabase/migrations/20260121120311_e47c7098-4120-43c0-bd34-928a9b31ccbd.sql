-- =============================================
-- OAUTH STATES TABLE
-- Stores temporary OAuth state tokens for verification
-- =============================================

CREATE TABLE IF NOT EXISTS public.oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  redirect_uri TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for lookup by state
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON public.oauth_states(state);

-- Index for cleanup of expired states
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON public.oauth_states(expires_at);

-- Enable RLS
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

-- Only the owning user can see their own states
CREATE POLICY "Users can view their own oauth states"
  ON public.oauth_states
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow service role to manage all states
CREATE POLICY "Service role can manage oauth states"
  ON public.oauth_states
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- ADD UNIQUE CONSTRAINT FOR CALENDAR CONNECTIONS
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'calendar_connections_user_provider_unique'
  ) THEN
    ALTER TABLE public.calendar_connections
    ADD CONSTRAINT calendar_connections_user_provider_unique 
    UNIQUE (user_id, provider);
  END IF;
END $$;

-- =============================================
-- ADD CALENDAR OAUTH SETTINGS TO SYSTEM_SETTINGS
-- =============================================
INSERT INTO public.system_settings (key, value, category, value_type, description, is_public)
VALUES 
  ('google_calendar_client_id', '""'::jsonb, 'integrations', 'string', 'Google OAuth Client ID para Calendar', false),
  ('google_calendar_client_secret', '""'::jsonb, 'integrations', 'encrypted', 'Google OAuth Client Secret para Calendar', false),
  ('microsoft_calendar_client_id', '""'::jsonb, 'integrations', 'string', 'Microsoft OAuth Client ID para Calendar', false),
  ('microsoft_calendar_client_secret', '""'::jsonb, 'integrations', 'encrypted', 'Microsoft OAuth Client Secret para Calendar', false)
ON CONFLICT (key) DO NOTHING;