-- ============================================================
-- IP-NEXUS - LEGAL DEADLINES SYSTEM
-- Create legal_deadlines and legal_deadlines_history tables
-- ============================================================

-- 1. Add display_order to existing ip_offices table if not exists
ALTER TABLE public.ip_offices ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 2. Legal Deadlines (Source of truth)
CREATE TABLE IF NOT EXISTS public.legal_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identification
  code VARCHAR(100) UNIQUE NOT NULL,
  office_id UUID REFERENCES public.ip_offices(id) ON DELETE SET NULL,
  
  -- Categorization
  right_type VARCHAR(50) NOT NULL,
  deadline_category VARCHAR(50) NOT NULL,
  
  -- Names and description
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  description TEXT,
  
  -- Deadline configuration
  trigger_event VARCHAR(100) NOT NULL,
  days_offset INTEGER,
  months_offset INTEGER,
  years_offset INTEGER,
  is_before_event BOOLEAN DEFAULT false,
  business_days_only BOOLEAN DEFAULT false,
  
  -- Grace period
  grace_period_days INTEGER,
  grace_period_months INTEGER,
  grace_has_surcharge BOOLEAN DEFAULT false,
  
  -- Action window (for renewals)
  window_start_months INTEGER,
  window_end_months INTEGER,
  
  -- Extensions
  is_extendable BOOLEAN DEFAULT false,
  max_extension_days INTEGER,
  max_extension_months INTEGER,
  
  -- Legal references
  legal_basis VARCHAR(255),
  legal_basis_url VARCHAR(500),
  
  -- IMPORTANT: Verification dates
  last_verified_at DATE NOT NULL DEFAULT CURRENT_DATE,
  verified_source VARCHAR(500),
  next_review_at DATE,
  
  -- Notes
  notes TEXT,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Legal Deadlines History (Audit trail)
CREATE TABLE IF NOT EXISTS public.legal_deadlines_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_deadline_id UUID REFERENCES public.legal_deadlines(id) ON DELETE CASCADE,
  
  field_changed VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  reason TEXT,
  
  changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_legal_deadlines_office ON public.legal_deadlines(office_id);
CREATE INDEX IF NOT EXISTS idx_legal_deadlines_right_type ON public.legal_deadlines(right_type);
CREATE INDEX IF NOT EXISTS idx_legal_deadlines_category ON public.legal_deadlines(deadline_category);
CREATE INDEX IF NOT EXISTS idx_legal_deadlines_code ON public.legal_deadlines(code);
CREATE INDEX IF NOT EXISTS idx_legal_deadlines_verified ON public.legal_deadlines(last_verified_at);
CREATE INDEX IF NOT EXISTS idx_legal_deadlines_trigger ON public.legal_deadlines(trigger_event);
CREATE INDEX IF NOT EXISTS idx_legal_deadlines_history_deadline ON public.legal_deadlines_history(legal_deadline_id);

-- 5. RLS Policies
ALTER TABLE public.legal_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_deadlines_history ENABLE ROW LEVEL SECURITY;

-- Legal Deadlines: Read-only for all authenticated users (system data)
DROP POLICY IF EXISTS "Anyone can view legal deadlines" ON public.legal_deadlines;
CREATE POLICY "Anyone can view legal deadlines"
ON public.legal_deadlines FOR SELECT
TO authenticated
USING (true);

-- Legal Deadlines History: Read-only for all authenticated users
DROP POLICY IF EXISTS "Anyone can view legal deadlines history" ON public.legal_deadlines_history;
CREATE POLICY "Anyone can view legal deadlines history"
ON public.legal_deadlines_history FOR SELECT
TO authenticated
USING (true);

-- 6. Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_legal_deadlines_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_legal_deadlines_timestamp ON public.legal_deadlines;
CREATE TRIGGER update_legal_deadlines_timestamp
BEFORE UPDATE ON public.legal_deadlines
FOR EACH ROW
EXECUTE FUNCTION public.update_legal_deadlines_updated_at();

-- 7. Update display_order for existing IP Offices
UPDATE public.ip_offices SET display_order = 1 WHERE code = 'EUIPO';
UPDATE public.ip_offices SET display_order = 2 WHERE code = 'OEPM';
UPDATE public.ip_offices SET display_order = 3 WHERE code = 'UKIPO';
UPDATE public.ip_offices SET display_order = 4 WHERE code = 'DPMA';
UPDATE public.ip_offices SET display_order = 5 WHERE code = 'INPI_FR';
UPDATE public.ip_offices SET display_order = 6 WHERE code = 'UIBM';
UPDATE public.ip_offices SET display_order = 7 WHERE code = 'BNPI';
UPDATE public.ip_offices SET display_order = 8 WHERE code = 'EPO';
UPDATE public.ip_offices SET display_order = 10 WHERE code = 'USPTO';
UPDATE public.ip_offices SET display_order = 11 WHERE code = 'CIPO';
UPDATE public.ip_offices SET display_order = 12 WHERE code = 'IMPI';
UPDATE public.ip_offices SET display_order = 13 WHERE code = 'INPI_BR';
UPDATE public.ip_offices SET display_order = 14 WHERE code = 'INAPI';
UPDATE public.ip_offices SET display_order = 15 WHERE code = 'INDECOPI';
UPDATE public.ip_offices SET display_order = 20 WHERE code = 'CNIPA';
UPDATE public.ip_offices SET display_order = 21 WHERE code = 'JPO';
UPDATE public.ip_offices SET display_order = 22 WHERE code = 'KIPO';
UPDATE public.ip_offices SET display_order = 23 WHERE code = 'IP_INDIA';
UPDATE public.ip_offices SET display_order = 24 WHERE code = 'IPOS';
UPDATE public.ip_offices SET display_order = 30 WHERE code = 'IP_AU';
UPDATE public.ip_offices SET display_order = 31 WHERE code = 'IPONZ';
UPDATE public.ip_offices SET display_order = 40 WHERE code = 'WIPO';
UPDATE public.ip_offices SET display_order = 41 WHERE code = 'ARIPO';
UPDATE public.ip_offices SET display_order = 42 WHERE code = 'OAPI';
UPDATE public.ip_offices SET display_order = 43 WHERE code = 'GCC';