-- =============================================
-- L59-F: Email Signatures Table
-- Tabla para almacenar firmas de email por usuario
-- =============================================

CREATE TABLE IF NOT EXISTS public.email_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  content_html TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_email_signatures_org ON public.email_signatures(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_signatures_user ON public.email_signatures(user_id);

-- Enable RLS
ALTER TABLE public.email_signatures ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their org signatures"
  ON public.email_signatures FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own signatures"
  ON public.email_signatures FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all org signatures"
  ON public.email_signatures FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_email_signature_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_signatures_timestamp
  BEFORE UPDATE ON public.email_signatures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_signature_timestamp();

-- Function to ensure only one default signature per user
CREATE OR REPLACE FUNCTION public.ensure_single_default_signature()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE public.email_signatures
    SET is_default = FALSE
    WHERE user_id = NEW.user_id 
      AND organization_id = NEW.organization_id
      AND id != NEW.id
      AND is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_default_signature
  BEFORE INSERT OR UPDATE OF is_default ON public.email_signatures
  FOR EACH ROW
  WHEN (NEW.is_default = TRUE)
  EXECUTE FUNCTION public.ensure_single_default_signature();