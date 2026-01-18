-- =====================================================
-- PAGOS
-- =====================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  
  -- Stripe
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  stripe_charge_id TEXT,
  
  -- Detalles
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Descripción
  description TEXT,
  
  -- Factura interna (si aplica)
  internal_invoice_id UUID REFERENCES invoices(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  failure_message TEXT,
  
  -- Fechas
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EMAILS ENVIADOS
-- =====================================================
CREATE TABLE sent_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  
  -- Destinatario
  to_email TEXT NOT NULL,
  to_name TEXT,
  
  -- Contenido
  subject TEXT NOT NULL,
  template_id TEXT,
  template_data JSONB DEFAULT '{}',
  
  -- Proveedor
  provider TEXT DEFAULT 'resend',
  provider_id TEXT,
  
  -- Estado
  status TEXT DEFAULT 'pending',
  
  -- Tracking
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  -- Errores
  error_message TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- WEBHOOKS RECIBIDOS
-- =====================================================
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Origen
  source TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_id TEXT,
  
  -- Payload
  payload JSONB NOT NULL,
  
  -- Procesamiento
  status TEXT DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(source, event_id)
);

-- =====================================================
-- CONEXIONES API EXTERNAS
-- =====================================================
CREATE TABLE api_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Proveedor
  provider TEXT NOT NULL,
  
  -- Credenciales (encriptadas)
  credentials JSONB DEFAULT '{}',
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  
  -- Configuración
  config JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, provider)
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_payments_org ON payments(organization_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe ON payments(stripe_payment_intent_id);

CREATE INDEX idx_sent_emails_org ON sent_emails(organization_id);
CREATE INDEX idx_sent_emails_status ON sent_emails(status);
CREATE INDEX idx_sent_emails_to ON sent_emails(to_email);

CREATE INDEX idx_webhook_events_source ON webhook_events(source, event_type);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);

CREATE INDEX idx_api_connections_org ON api_connections(organization_id);

-- =====================================================
-- RLS
-- =====================================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sent_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org payments select" ON payments FOR SELECT USING (
  organization_id IN (SELECT get_user_org_ids())
);

CREATE POLICY "Org payments insert" ON payments FOR INSERT WITH CHECK (
  organization_id IN (SELECT get_user_org_ids())
);

CREATE POLICY "Org sent_emails" ON sent_emails FOR SELECT USING (
  organization_id IN (SELECT get_user_org_ids())
);

CREATE POLICY "Org api_connections" ON api_connections FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);