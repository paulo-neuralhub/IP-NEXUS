-- =====================================================
-- TABLAS COMPLEMENTARIAS PARA OFICINAS
-- =====================================================

-- 1) office_plan_inclusions: Qué oficinas incluye cada plan
CREATE TABLE IF NOT EXISTS public.office_plan_inclusions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan TEXT NOT NULL, -- starter, professional, business, enterprise
  office_id UUID NOT NULL REFERENCES public.ipo_offices(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(plan, office_id)
);

-- 2) office_addon_pricing: Precios de add-ons por oficina
CREATE TABLE IF NOT EXISTS public.office_addon_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES public.ipo_offices(id) ON DELETE CASCADE UNIQUE,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  currency TEXT NOT NULL DEFAULT 'EUR',
  stripe_price_id TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_office_plan_inclusions_plan ON public.office_plan_inclusions(plan);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE public.office_plan_inclusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_addon_pricing ENABLE ROW LEVEL SECURITY;

-- office_plan_inclusions (read-only para todos)
CREATE POLICY "Anyone can view plan inclusions"
  ON public.office_plan_inclusions FOR SELECT
  USING (true);

-- office_addon_pricing (read-only para autenticados)
CREATE POLICY "Authenticated users can view addon pricing"
  ON public.office_addon_pricing FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- TRIGGER
-- =====================================================

CREATE TRIGGER update_office_addon_pricing_updated_at
  BEFORE UPDATE ON public.office_addon_pricing
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- SEED DATA: Office plan inclusions
-- =====================================================

-- Starter: Solo OEPM (ES)
INSERT INTO public.office_plan_inclusions (plan, office_id)
SELECT 'starter', id FROM public.ipo_offices WHERE code = 'ES'
ON CONFLICT (plan, office_id) DO NOTHING;

-- Professional: OEPM + EUIPO
INSERT INTO public.office_plan_inclusions (plan, office_id)
SELECT 'professional', id FROM public.ipo_offices WHERE code IN ('ES', 'EUIPO')
ON CONFLICT (plan, office_id) DO NOTHING;

-- Business: OEPM + EUIPO + WIPO
INSERT INTO public.office_plan_inclusions (plan, office_id)
SELECT 'business', id FROM public.ipo_offices WHERE code IN ('ES', 'EUIPO', 'WIPO')
ON CONFLICT (plan, office_id) DO NOTHING;

-- Enterprise: Todas las oficinas
INSERT INTO public.office_plan_inclusions (plan, office_id)
SELECT 'enterprise', id FROM public.ipo_offices
ON CONFLICT (plan, office_id) DO NOTHING;

-- =====================================================
-- SEED DATA: Add-on pricing
-- =====================================================

INSERT INTO public.office_addon_pricing (office_id, price_monthly, price_yearly, currency)
SELECT id, 
  CASE code
    WHEN 'USPTO' THEN 39
    WHEN 'WIPO' THEN 29
    WHEN 'EPO' THEN 29
    WHEN 'UKIPO' THEN 19
    WHEN 'CNIPA' THEN 49
    WHEN 'JPO' THEN 39
    WHEN 'KIPO' THEN 29
    WHEN 'INPI_BR' THEN 29
    WHEN 'CIPO' THEN 19
    WHEN 'IP_AU' THEN 19
    ELSE 19
  END,
  CASE code
    WHEN 'USPTO' THEN 390
    WHEN 'WIPO' THEN 290
    WHEN 'EPO' THEN 290
    WHEN 'UKIPO' THEN 190
    WHEN 'CNIPA' THEN 490
    WHEN 'JPO' THEN 390
    WHEN 'KIPO' THEN 290
    WHEN 'INPI_BR' THEN 290
    WHEN 'CIPO' THEN 190
    WHEN 'IP_AU' THEN 190
    ELSE 190
  END,
  'EUR'
FROM public.ipo_offices
ON CONFLICT (office_id) DO NOTHING;