-- ============================================================
-- TELEPHONY MULTI-PROVIDER MODULE - BASE STRUCTURE
-- ============================================================

-- Proveedores de telefonía soportados
CREATE TABLE public.telephony_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  website_url VARCHAR(500),
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  
  -- Configuración requerida
  required_credentials JSONB DEFAULT '[]',
  
  -- Capacidades
  supports_voice BOOLEAN DEFAULT true,
  supports_sms BOOLEAN DEFAULT true,
  supports_whatsapp BOOLEAN DEFAULT false,
  supports_recording BOOLEAN DEFAULT true,
  
  -- Precios base del proveedor (referencia)
  base_rates JSONB DEFAULT '{}',
  
  -- Documentación
  setup_instructions TEXT,
  api_docs_url VARCHAR(500),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Configuración global de telefonía (backoffice)
CREATE TABLE public.telephony_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Proveedor activo
  active_provider_id UUID REFERENCES public.telephony_providers(id),
  
  -- Credenciales encriptadas
  credentials_encrypted JSONB,
  
  -- Números de teléfono disponibles
  phone_numbers JSONB DEFAULT '[]',
  
  -- Configuración de precios (markup sobre coste)
  markup_percentage DECIMAL(5,2) DEFAULT 30.00,
  
  -- Alertas
  alert_low_balance_threshold DECIMAL(10,2) DEFAULT 10.00,
  alert_email VARCHAR(255),
  
  -- Modo
  test_mode BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Packs de minutos disponibles para compra
CREATE TABLE public.telephony_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Contenido del pack
  minutes_included INTEGER NOT NULL,
  sms_included INTEGER DEFAULT 0,
  
  -- Precio
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Validez
  validity_days INTEGER DEFAULT 365,
  
  -- Restricciones
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  min_plan VARCHAR(50),
  
  -- Orden de visualización
  display_order INTEGER DEFAULT 0,
  
  -- Metadata
  badge_text VARCHAR(50),
  savings_percentage INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Saldo de telefonía por tenant
CREATE TABLE public.tenant_telephony_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Saldo actual
  minutes_balance INTEGER DEFAULT 0,
  sms_balance INTEGER DEFAULT 0,
  
  -- Crédito monetario (alternativa a packs)
  credit_balance DECIMAL(10,2) DEFAULT 0.00,
  
  -- Alertas
  low_balance_alert_sent BOOLEAN DEFAULT false,
  low_balance_threshold INTEGER DEFAULT 30,
  
  -- Configuración tenant
  is_enabled BOOLEAN DEFAULT false,
  outbound_caller_id VARCHAR(20),
  
  -- Estadísticas
  total_minutes_used INTEGER DEFAULT 0,
  total_sms_sent INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Compras de packs por tenant
CREATE TABLE public.tenant_telephony_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  pack_id UUID REFERENCES public.telephony_packs(id),
  
  -- Detalles de compra
  minutes_purchased INTEGER NOT NULL,
  sms_purchased INTEGER DEFAULT 0,
  price_paid DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Validez
  purchased_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  
  -- Estado
  status VARCHAR(20) DEFAULT 'active',
  minutes_remaining INTEGER,
  sms_remaining INTEGER DEFAULT 0,
  
  -- Pago
  payment_method VARCHAR(50),
  stripe_payment_id VARCHAR(255),
  invoice_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Registro de uso de telefonía
CREATE TABLE public.telephony_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id),
  
  -- Tipo de uso
  usage_type VARCHAR(30) NOT NULL,
  
  -- Detalles llamada/SMS
  from_number VARCHAR(20),
  to_number VARCHAR(20),
  country_code VARCHAR(5),
  
  -- Duración (solo llamadas)
  duration_seconds INTEGER,
  duration_minutes DECIMAL(10,2),
  
  -- Costes
  provider_cost DECIMAL(10,4),
  charged_cost DECIMAL(10,4),
  minutes_deducted INTEGER,
  
  -- Vinculación
  matter_id UUID REFERENCES public.matters(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  
  -- Grabación
  recording_url VARCHAR(500),
  recording_duration INTEGER,
  
  -- Estado
  status VARCHAR(30),
  error_message TEXT,
  
  -- IDs externos
  provider_call_sid VARCHAR(100),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Métricas diarias de telefonía (para analytics)
CREATE TABLE public.telephony_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Llamadas
  calls_outbound INTEGER DEFAULT 0,
  calls_inbound INTEGER DEFAULT 0,
  calls_total_minutes DECIMAL(10,2) DEFAULT 0,
  calls_avg_duration DECIMAL(10,2) DEFAULT 0,
  
  -- SMS
  sms_outbound INTEGER DEFAULT 0,
  sms_inbound INTEGER DEFAULT 0,
  
  -- Costes
  provider_cost DECIMAL(10,2) DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  margin DECIMAL(10,2) DEFAULT 0,
  
  -- Por destino
  usage_by_country JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(date, tenant_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_telephony_providers_code ON public.telephony_providers(code);
CREATE INDEX idx_telephony_providers_active ON public.telephony_providers(is_active);

CREATE INDEX idx_telephony_packs_active ON public.telephony_packs(is_active, display_order);
CREATE INDEX idx_telephony_packs_code ON public.telephony_packs(code);

CREATE INDEX idx_tenant_telephony_balance_tenant ON public.tenant_telephony_balance(tenant_id);

CREATE INDEX idx_tenant_telephony_purchases_tenant ON public.tenant_telephony_purchases(tenant_id);
CREATE INDEX idx_tenant_telephony_purchases_status ON public.tenant_telephony_purchases(status);
CREATE INDEX idx_tenant_telephony_purchases_expires ON public.tenant_telephony_purchases(expires_at);

CREATE INDEX idx_telephony_usage_logs_tenant ON public.telephony_usage_logs(tenant_id);
CREATE INDEX idx_telephony_usage_logs_created ON public.telephony_usage_logs(created_at);
CREATE INDEX idx_telephony_usage_logs_type ON public.telephony_usage_logs(usage_type);
CREATE INDEX idx_telephony_usage_logs_matter ON public.telephony_usage_logs(matter_id);

CREATE INDEX idx_telephony_daily_metrics_date ON public.telephony_daily_metrics(date);
CREATE INDEX idx_telephony_daily_metrics_tenant ON public.telephony_daily_metrics(tenant_id);

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE public.telephony_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telephony_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telephony_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_telephony_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_telephony_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telephony_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telephony_daily_metrics ENABLE ROW LEVEL SECURITY;

-- Providers: lectura pública para mostrar opciones
CREATE POLICY "Anyone can view active providers"
  ON public.telephony_providers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role full access to providers"
  ON public.telephony_providers FOR ALL
  TO service_role
  USING (true);

-- Config: solo service_role (backoffice)
CREATE POLICY "Service role manages telephony config"
  ON public.telephony_config FOR ALL
  TO service_role
  USING (true);

-- Packs: lectura pública para mostrar opciones
CREATE POLICY "Anyone can view active packs"
  ON public.telephony_packs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role full access to packs"
  ON public.telephony_packs FOR ALL
  TO service_role
  USING (true);

-- Balance: tenant ve su propio saldo
CREATE POLICY "Tenants view own balance"
  ON public.tenant_telephony_balance FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role manages all balances"
  ON public.tenant_telephony_balance FOR ALL
  TO service_role
  USING (true);

-- Purchases: tenant ve sus propias compras
CREATE POLICY "Tenants view own purchases"
  ON public.tenant_telephony_purchases FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role manages all purchases"
  ON public.tenant_telephony_purchases FOR ALL
  TO service_role
  USING (true);

-- Usage logs: tenant ve su propio uso
CREATE POLICY "Tenants view own usage logs"
  ON public.telephony_usage_logs FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role manages all usage logs"
  ON public.telephony_usage_logs FOR ALL
  TO service_role
  USING (true);

-- Daily metrics: tenant ve sus propias métricas
CREATE POLICY "Tenants view own daily metrics"
  ON public.telephony_daily_metrics FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role manages all metrics"
  ON public.telephony_daily_metrics FOR ALL
  TO service_role
  USING (true);

-- ============================================================
-- TRIGGERS FOR updated_at
-- ============================================================

CREATE TRIGGER set_telephony_providers_updated_at
  BEFORE UPDATE ON public.telephony_providers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_telephony_config_updated_at
  BEFORE UPDATE ON public.telephony_config
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_telephony_packs_updated_at
  BEFORE UPDATE ON public.telephony_packs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_tenant_telephony_balance_updated_at
  BEFORE UPDATE ON public.tenant_telephony_balance
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- SEED PROVIDERS
-- ============================================================

INSERT INTO public.telephony_providers (code, name, description, logo_url, website_url, required_credentials, supports_voice, supports_sms, supports_whatsapp, supports_recording, base_rates, setup_instructions, api_docs_url, is_default) VALUES
('twilio', 'Twilio', 
 'Plataforma líder de comunicaciones en la nube. Ofrece voz, SMS y WhatsApp con excelente fiabilidad y cobertura global.',
 '/images/providers/twilio.svg',
 'https://www.twilio.com',
 '["account_sid", "auth_token", "phone_number"]',
 true, true, true, true,
 '{
   "voice_outbound_es": 0.013,
   "voice_outbound_eu": 0.017,
   "voice_outbound_us": 0.014,
   "voice_outbound_latam": 0.025,
   "voice_inbound": 0.0085,
   "sms_outbound_es": 0.045,
   "sms_outbound_eu": 0.055,
   "sms_outbound_us": 0.0075,
   "recording_per_minute": 0.0025
 }',
 '1. Crear cuenta en twilio.com
2. Obtener Account SID y Auth Token desde Console
3. Comprar un número de teléfono
4. Configurar webhooks para llamadas entrantes',
 'https://www.twilio.com/docs',
 true
),
('vonage', 'Vonage (Nexmo)',
 'Proveedor de comunicaciones con buena cobertura europea y precios competitivos.',
 '/images/providers/vonage.svg',
 'https://www.vonage.com',
 '["api_key", "api_secret", "application_id", "private_key"]',
 true, true, true, true,
 '{
   "voice_outbound_es": 0.012,
   "voice_outbound_eu": 0.015,
   "voice_outbound_us": 0.013,
   "voice_inbound": 0.0075,
   "sms_outbound_es": 0.042,
   "sms_outbound_eu": 0.050
 }',
 '1. Crear cuenta en vonage.com
2. Crear una Application en el dashboard
3. Obtener API Key y Secret
4. Descargar private key',
 'https://developer.vonage.com',
 false
),
('plivo', 'Plivo',
 'Alternativa económica con buena calidad. Ideal para alto volumen de llamadas.',
 '/images/providers/plivo.svg',
 'https://www.plivo.com',
 '["auth_id", "auth_token", "phone_number"]',
 true, true, false, true,
 '{
   "voice_outbound_es": 0.011,
   "voice_outbound_eu": 0.014,
   "voice_outbound_us": 0.012,
   "voice_inbound": 0.0065,
   "sms_outbound_es": 0.040,
   "sms_outbound_eu": 0.048
 }',
 '1. Crear cuenta en plivo.com
2. Obtener Auth ID y Auth Token
3. Comprar número de teléfono
4. Configurar endpoints',
 'https://www.plivo.com/docs',
 false
),
('sinch', 'Sinch',
 'Especializado en comunicaciones empresariales con excelente calidad de voz.',
 '/images/providers/sinch.svg',
 'https://www.sinch.com',
 '["app_key", "app_secret", "phone_number"]',
 true, true, true, true,
 '{
   "voice_outbound_es": 0.014,
   "voice_outbound_eu": 0.018,
   "voice_outbound_us": 0.015,
   "voice_inbound": 0.009,
   "sms_outbound_es": 0.048,
   "sms_outbound_eu": 0.058
 }',
 '1. Crear cuenta en sinch.com
2. Crear una App en el dashboard
3. Obtener App Key y Secret
4. Configurar números y webhooks',
 'https://developers.sinch.com',
 false
);

-- ============================================================
-- SEED PACKS
-- ============================================================

INSERT INTO public.telephony_packs (code, name, description, minutes_included, sms_included, price, validity_days, is_active, is_featured, display_order, badge_text, savings_percentage) VALUES
('PACK_STARTER', 'Pack Inicial', 
 'Ideal para empezar. 60 minutos de llamadas nacionales.',
 60, 20, 15.00, 365, true, false, 1, NULL, NULL),
('PACK_BASIC', 'Pack Básico',
 '150 minutos para uso regular. Incluye SMS.',
 150, 50, 29.00, 365, true, false, 2, NULL, 10),
('PACK_STANDARD', 'Pack Estándar',
 '300 minutos para despachos activos.',
 300, 100, 49.00, 365, true, true, 3, 'Más popular', 18),
('PACK_PROFESSIONAL', 'Pack Profesional',
 '600 minutos para alto volumen de comunicaciones.',
 600, 200, 89.00, 365, true, false, 4, 'Mejor valor', 25),
('PACK_ENTERPRISE', 'Pack Enterprise',
 '1500 minutos para grandes despachos.',
 1500, 500, 199.00, 365, true, false, 5, NULL, 30),
('PACK_UNLIMITED', 'Pack Ilimitado',
 'Minutos ilimitados nacionales. Fair use policy aplica.',
 9999, 1000, 299.00, 30, true, false, 6, 'Sin límites', NULL);

-- ============================================================
-- FUNCTION: Deduct minutes from balance
-- ============================================================

CREATE OR REPLACE FUNCTION public.deduct_telephony_minutes(
  p_tenant_id UUID,
  p_minutes INTEGER,
  p_usage_type VARCHAR DEFAULT 'voice_outbound'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_remaining INTEGER;
BEGIN
  -- Get current balance
  SELECT minutes_balance INTO v_current_balance
  FROM tenant_telephony_balance
  WHERE tenant_id = p_tenant_id
  FOR UPDATE;
  
  IF v_current_balance IS NULL THEN
    RETURN FALSE;
  END IF;
  
  IF v_current_balance < p_minutes THEN
    RETURN FALSE;
  END IF;
  
  v_remaining := v_current_balance - p_minutes;
  
  -- Update balance
  UPDATE tenant_telephony_balance
  SET 
    minutes_balance = v_remaining,
    total_minutes_used = total_minutes_used + p_minutes,
    low_balance_alert_sent = CASE 
      WHEN v_remaining <= low_balance_threshold THEN false 
      ELSE low_balance_alert_sent 
    END,
    updated_at = now()
  WHERE tenant_id = p_tenant_id;
  
  RETURN TRUE;
END;
$$;

-- ============================================================
-- FUNCTION: Add minutes to balance (after purchase)
-- ============================================================

CREATE OR REPLACE FUNCTION public.add_telephony_minutes(
  p_tenant_id UUID,
  p_minutes INTEGER,
  p_sms INTEGER DEFAULT 0
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Upsert balance
  INSERT INTO tenant_telephony_balance (tenant_id, minutes_balance, sms_balance, is_enabled)
  VALUES (p_tenant_id, p_minutes, p_sms, true)
  ON CONFLICT (tenant_id) DO UPDATE SET
    minutes_balance = tenant_telephony_balance.minutes_balance + p_minutes,
    sms_balance = tenant_telephony_balance.sms_balance + p_sms,
    low_balance_alert_sent = false,
    updated_at = now();
  
  RETURN TRUE;
END;
$$;