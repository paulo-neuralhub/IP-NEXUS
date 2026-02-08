
-- Market platform configuration table for configurable commissions
CREATE TABLE IF NOT EXISTS public.market_platform_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL DEFAULT '{}',
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.market_platform_config ENABLE ROW LEVEL SECURITY;

-- Backoffice staff can read/write
CREATE POLICY "Backoffice staff can manage market config"
  ON public.market_platform_config
  FOR ALL
  USING (public.is_backoffice_staff())
  WITH CHECK (public.is_backoffice_staff());

-- All authenticated users can read (needed for fee calculations)
CREATE POLICY "Authenticated users can read market config"
  ON public.market_platform_config
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Seed default commission rates
INSERT INTO public.market_platform_config (config_key, config_value) VALUES
('commission_rates', '{
  "seller_fee_percent": 10,
  "buyer_fee_percent": 5,
  "official_fees_commission": 0,
  "min_platform_fee": 5.00,
  "currency": "EUR"
}'::jsonb),
('marketplace_settings', '{
  "request_expiry_days": 30,
  "offer_validity_days": 15,
  "max_offers_per_request": 20,
  "auto_expire_requests": true,
  "escrow_release_delay_hours": 24
}'::jsonb)
ON CONFLICT (config_key) DO NOTHING;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_market_platform_config_key ON public.market_platform_config(config_key);
