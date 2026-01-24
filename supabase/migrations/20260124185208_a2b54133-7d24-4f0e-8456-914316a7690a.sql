-- ============================================
-- ADD MISSING COLUMNS TO LANDING_PAGES
-- ============================================

ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#1E40AF',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published',
ADD COLUMN IF NOT EXISTS total_visits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_leads INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS integrations JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS og_image_url TEXT;

-- Update name from title if null
UPDATE public.landing_pages 
SET name = COALESCE(name, 'IP-' || UPPER(module_code))
WHERE name IS NULL;

-- ============================================
-- LANDING PAGE VISITS (for analytics)
-- ============================================

CREATE TABLE IF NOT EXISTS public.landing_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_id UUID REFERENCES public.landing_pages(id) ON DELETE CASCADE,
  session_id TEXT,
  visitor_id TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  referrer TEXT,
  referrer_domain TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  page_views INTEGER DEFAULT 1,
  time_on_page INTEGER,
  scroll_depth INTEGER,
  opened_chatbot BOOLEAN DEFAULT false,
  chatbot_messages INTEGER DEFAULT 0,
  converted BOOLEAN DEFAULT false,
  conversion_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_landing_visits_landing ON public.landing_visits(landing_id);
CREATE INDEX IF NOT EXISTS idx_landing_visits_created ON public.landing_visits(created_at);

ALTER TABLE public.landing_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can log visits" ON public.landing_visits;
CREATE POLICY "Anyone can log visits" ON public.landing_visits FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can view visits" ON public.landing_visits;
CREATE POLICY "Authenticated can view visits" ON public.landing_visits FOR SELECT 
  USING (auth.role() = 'authenticated');

-- ============================================
-- LINK CHATBOT_CONFIGS TO LANDING_PAGES
-- ============================================

ALTER TABLE public.chatbot_configs 
ADD COLUMN IF NOT EXISTS landing_id UUID REFERENCES public.landing_pages(id) ON DELETE SET NULL;

UPDATE public.chatbot_configs cc
SET landing_id = lp.id
FROM public.landing_pages lp
WHERE cc.landing_slug = lp.slug AND cc.landing_id IS NULL;

-- ============================================
-- ADD FIELDS TO CHATBOT_LEADS
-- ============================================

ALTER TABLE public.chatbot_leads 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS demo_scheduled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS demo_completed BOOLEAN DEFAULT false;