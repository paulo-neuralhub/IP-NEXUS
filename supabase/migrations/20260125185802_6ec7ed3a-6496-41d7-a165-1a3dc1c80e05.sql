-- ============================================================
-- STRIPE BACKOFFICE MANAGEMENT SYSTEM - Part 1: Tables
-- ============================================================

-- 1. Configuración global de Stripe
CREATE TABLE IF NOT EXISTS stripe_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publishable_key VARCHAR,
  has_secret_key BOOLEAN DEFAULT false,
  has_webhook_secret BOOLEAN DEFAULT false,
  mode VARCHAR DEFAULT 'test' CHECK (mode IN ('test', 'live')),
  webhook_url VARCHAR,
  success_url VARCHAR,
  cancel_url VARCHAR,
  customer_portal_url VARCHAR,
  tax_rate_id VARCHAR,
  default_currency VARCHAR DEFAULT 'EUR',
  trial_days INTEGER DEFAULT 14,
  is_configured BOOLEAN DEFAULT false,
  last_webhook_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Añadir columnas a productos existentes
ALTER TABLE products ADD COLUMN IF NOT EXISTS stripe_product_id VARCHAR;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stripe_synced_at TIMESTAMPTZ;

-- 3. Añadir columnas a precios existentes
ALTER TABLE product_prices ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR;
ALTER TABLE product_prices ADD COLUMN IF NOT EXISTS stripe_synced_at TIMESTAMPTZ;

-- 4. Suscripciones de tenants
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR,
  stripe_subscription_id VARCHAR UNIQUE,
  product_id UUID REFERENCES products(id),
  price_id UUID REFERENCES product_prices(id),
  status VARCHAR DEFAULT 'active' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete')),
  trial_start DATE,
  trial_end DATE,
  current_period_start DATE,
  current_period_end DATE,
  canceled_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  billing_cycle VARCHAR CHECK (billing_cycle IN ('monthly', 'yearly')),
  next_invoice_date DATE,
  stripe_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id)
);

-- 5. Items de suscripción (add-ons)
CREATE TABLE IF NOT EXISTS subscription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES tenant_subscriptions(id) ON DELETE CASCADE,
  stripe_subscription_item_id VARCHAR,
  product_id UUID REFERENCES products(id),
  price_id UUID REFERENCES product_prices(id),
  quantity INTEGER DEFAULT 1,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Facturas de Stripe
CREATE TABLE IF NOT EXISTS stripe_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES tenant_subscriptions(id) ON DELETE SET NULL,
  stripe_invoice_id VARCHAR UNIQUE,
  stripe_invoice_number VARCHAR,
  stripe_invoice_url VARCHAR,
  stripe_invoice_pdf VARCHAR,
  subtotal INTEGER,
  tax INTEGER,
  total INTEGER,
  amount_paid INTEGER,
  amount_due INTEGER,
  currency VARCHAR DEFAULT 'EUR',
  status VARCHAR CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  period_start DATE,
  period_end DATE,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  lines JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Log de webhooks
CREATE TABLE IF NOT EXISTS stripe_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id VARCHAR UNIQUE,
  event_type VARCHAR NOT NULL,
  payload JSONB,
  status VARCHAR DEFAULT 'received' CHECK (status IN ('received', 'processing', 'processed', 'failed')),
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Crear índices
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_org ON tenant_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_status ON tenant_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_items_subscription ON subscription_items(subscription_id);
CREATE INDEX IF NOT EXISTS idx_stripe_invoices_org ON stripe_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_stripe_invoices_status ON stripe_invoices(status);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_logs_event_type ON stripe_webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_logs_status ON stripe_webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_logs_created ON stripe_webhook_logs(created_at DESC);

-- 9. RLS
ALTER TABLE stripe_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Superadmin access
CREATE POLICY "Superadmins can manage stripe_config" ON stripe_config FOR ALL USING (public.is_superadmin());
CREATE POLICY "Superadmins can manage tenant_subscriptions" ON tenant_subscriptions FOR ALL USING (public.is_superadmin());
CREATE POLICY "Superadmins can manage subscription_items" ON subscription_items FOR ALL USING (public.is_superadmin());
CREATE POLICY "Superadmins can manage stripe_invoices" ON stripe_invoices FOR ALL USING (public.is_superadmin());
CREATE POLICY "Superadmins can manage stripe_webhook_logs" ON stripe_webhook_logs FOR ALL USING (public.is_superadmin());

-- Tenants can view their own
CREATE POLICY "Tenants can view own subscription" ON tenant_subscriptions FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));

CREATE POLICY "Tenants can view own invoices" ON stripe_invoices FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid()));

-- 10. Triggers
CREATE OR REPLACE FUNCTION update_stripe_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS stripe_config_updated_at ON stripe_config;
CREATE TRIGGER stripe_config_updated_at BEFORE UPDATE ON stripe_config FOR EACH ROW EXECUTE FUNCTION update_stripe_updated_at();

DROP TRIGGER IF EXISTS tenant_subscriptions_updated_at ON tenant_subscriptions;
CREATE TRIGGER tenant_subscriptions_updated_at BEFORE UPDATE ON tenant_subscriptions FOR EACH ROW EXECUTE FUNCTION update_stripe_updated_at();

DROP TRIGGER IF EXISTS subscription_items_updated_at ON subscription_items;
CREATE TRIGGER subscription_items_updated_at BEFORE UPDATE ON subscription_items FOR EACH ROW EXECUTE FUNCTION update_stripe_updated_at();

DROP TRIGGER IF EXISTS stripe_invoices_updated_at ON stripe_invoices;
CREATE TRIGGER stripe_invoices_updated_at BEFORE UPDATE ON stripe_invoices FOR EACH ROW EXECUTE FUNCTION update_stripe_updated_at();

-- 11. Insert default config
INSERT INTO stripe_config (
  mode, default_currency, trial_days, webhook_url, success_url, cancel_url
) VALUES (
  'test', 'EUR', 14,
  'https://dcdbpmbzizzzzdfkvohl.supabase.co/functions/v1/stripe-webhook',
  'https://app.ip-nexus.com/subscription/success',
  'https://app.ip-nexus.com/subscription/cancel'
) ON CONFLICT DO NOTHING;