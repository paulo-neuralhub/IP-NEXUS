-- =====================================================
-- PROMPT 51: STRIPE BILLING TABLES
-- =====================================================

-- Stripe Products
CREATE TABLE IF NOT EXISTS public.stripe_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_product_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  module_code TEXT,
  features JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_products_active ON stripe_products(active) WHERE active = true;

-- Stripe Prices
CREATE TABLE IF NOT EXISTS public.stripe_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_price_id TEXT NOT NULL UNIQUE,
  stripe_product_id TEXT NOT NULL,
  currency TEXT DEFAULT 'eur',
  unit_amount INTEGER,
  recurring_interval TEXT CHECK (recurring_interval IN ('month', 'year', 'week', 'day')),
  recurring_interval_count INTEGER DEFAULT 1,
  billing_scheme TEXT DEFAULT 'per_unit' CHECK (billing_scheme IN ('per_unit', 'tiered')),
  tiers_mode TEXT CHECK (tiers_mode IN ('graduated', 'volume')),
  tiers JSONB,
  meter_id TEXT,
  transform_quantity JSONB,
  nickname TEXT,
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_prices_product ON stripe_prices(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_stripe_prices_active ON stripe_prices(active) WHERE active = true;

-- Stripe Customers
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  email TEXT,
  name TEXT,
  default_payment_method_id TEXT,
  invoice_settings JSONB DEFAULT '{}',
  tax_exempt TEXT DEFAULT 'none' CHECK (tax_exempt IN ('none', 'exempt', 'reverse')),
  tax_ids JSONB DEFAULT '[]',
  balance INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id)
);

CREATE INDEX IF NOT EXISTS idx_stripe_customers_org ON stripe_customers(organization_id);

-- Billing Events
CREATE TABLE IF NOT EXISTS public.billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  stripe_event_id TEXT UNIQUE,
  event_type TEXT NOT NULL,
  stripe_subscription_id TEXT,
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  amount INTEGER,
  currency TEXT,
  status TEXT DEFAULT 'processed',
  error_message TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_billing_events_org ON billing_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_type ON billing_events(event_type);
CREATE INDEX IF NOT EXISTS idx_billing_events_created ON billing_events(created_at DESC);

-- Usage Records
CREATE TABLE IF NOT EXISTS public.usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  module_code TEXT NOT NULL,
  feature_code TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stripe_meter_event_id TEXT,
  stripe_meter_id TEXT,
  user_id UUID,
  metadata JSONB DEFAULT '{}',
  billing_period_start TIMESTAMPTZ,
  billing_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_records_org_period ON usage_records(organization_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_usage_records_module ON usage_records(module_code, feature_code);

-- AI Tier Quotas (para Genius)
CREATE TABLE IF NOT EXISTS public.ai_tier_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL UNIQUE,
  monthly_requests INTEGER NOT NULL DEFAULT 100,
  monthly_tokens INTEGER NOT NULL DEFAULT 100000,
  max_context_tokens INTEGER NOT NULL DEFAULT 4000,
  allowed_models TEXT[] DEFAULT ARRAY['google/gemini-3-flash-preview'],
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default quotas
INSERT INTO public.ai_tier_quotas (tier, monthly_requests, monthly_tokens, max_context_tokens, allowed_models) VALUES
  ('starter', 100, 100000, 4000, ARRAY['google/gemini-3-flash-preview']),
  ('professional', 1000, 1000000, 16000, ARRAY['google/gemini-3-flash-preview', 'google/gemini-2.5-pro']),
  ('business', 5000, 5000000, 32000, ARRAY['google/gemini-3-flash-preview', 'google/gemini-2.5-pro', 'openai/gpt-5-mini']),
  ('enterprise', 50000, 50000000, 128000, ARRAY['google/gemini-3-flash-preview', 'google/gemini-2.5-pro', 'openai/gpt-5-mini', 'openai/gpt-5'])
ON CONFLICT (tier) DO UPDATE SET
  monthly_requests = EXCLUDED.monthly_requests,
  monthly_tokens = EXCLUDED.monthly_tokens,
  max_context_tokens = EXCLUDED.max_context_tokens,
  allowed_models = EXCLUDED.allowed_models;

-- Spider search cache
CREATE TABLE IF NOT EXISTS public.spider_search_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_code TEXT NOT NULL,
  search_hash TEXT NOT NULL,
  search_params JSONB NOT NULL,
  results JSONB NOT NULL DEFAULT '[]',
  results_count INTEGER DEFAULT 0,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  UNIQUE(connector_code, search_hash)
);

CREATE INDEX IF NOT EXISTS idx_spider_cache_expires ON spider_search_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_spider_cache_lookup ON spider_search_cache(connector_code, search_hash);

-- Spider connector health
CREATE TABLE IF NOT EXISTS public.spider_connector_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'unknown' CHECK (status IN ('healthy', 'degraded', 'unhealthy', 'unknown')),
  latency_ms INTEGER,
  last_check_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_error TEXT,
  error_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.stripe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tier_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spider_search_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spider_connector_health ENABLE ROW LEVEL SECURITY;

-- Public read for products/prices
CREATE POLICY "stripe_products_public_read" ON public.stripe_products FOR SELECT USING (active = true);
CREATE POLICY "stripe_prices_public_read" ON public.stripe_prices FOR SELECT USING (active = true);

-- Org-based policies for customers
CREATE POLICY "stripe_customers_org_access" ON public.stripe_customers FOR ALL 
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));

-- Org-based policies for billing events
CREATE POLICY "billing_events_org_read" ON public.billing_events FOR SELECT 
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));

-- Org-based policies for usage records
CREATE POLICY "usage_records_org_access" ON public.usage_records FOR ALL 
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));

-- Public read for AI quotas
CREATE POLICY "ai_tier_quotas_public_read" ON public.ai_tier_quotas FOR SELECT USING (true);

-- Service role access for cache
CREATE POLICY "spider_cache_service_access" ON public.spider_search_cache FOR ALL USING (true);
CREATE POLICY "spider_health_service_access" ON public.spider_connector_health FOR ALL USING (true);