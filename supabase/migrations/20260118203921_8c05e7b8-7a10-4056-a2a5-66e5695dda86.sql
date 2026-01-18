-- =====================================================
-- API KEYS
-- =====================================================
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identificación
  name TEXT NOT NULL,
  description TEXT,
  
  -- Key (solo se muestra una vez al crear)
  key_prefix TEXT NOT NULL,  -- Primeros 8 caracteres para identificar
  key_hash TEXT NOT NULL,    -- Hash SHA-256 del key completo
  
  -- Permisos
  scopes JSONB DEFAULT '["read"]',
  
  -- Restricciones
  allowed_ips JSONB DEFAULT '[]',  -- IPs permitidas (vacío = todas)
  allowed_origins JSONB DEFAULT '[]',  -- Orígenes CORS permitidos
  
  -- Rate limiting
  rate_limit_per_minute INT DEFAULT 60,
  rate_limit_per_day INT DEFAULT 10000,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  
  -- Expiración
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- =====================================================
-- API LOGS
-- =====================================================
CREATE TABLE api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  
  -- Request
  method TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  query_params JSONB,
  request_body JSONB,
  
  -- Response
  status_code INT NOT NULL,
  response_time_ms INT,
  response_size_bytes INT,
  
  -- Client
  ip_address TEXT,
  user_agent TEXT,
  
  -- Error
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- WEBHOOKS
-- =====================================================
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Configuración
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  
  -- Eventos
  events JSONB NOT NULL DEFAULT '[]',
  
  -- Autenticación
  secret TEXT NOT NULL,  -- Para firmar payloads
  headers JSONB DEFAULT '{}',  -- Headers adicionales
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  -- Reintentos
  max_retries INT DEFAULT 3,
  retry_delay_seconds INT DEFAULT 60,
  
  -- Estadísticas
  total_deliveries INT DEFAULT 0,
  successful_deliveries INT DEFAULT 0,
  failed_deliveries INT DEFAULT 0,
  last_delivery_at TIMESTAMPTZ,
  last_error TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- WEBHOOK DELIVERIES
-- =====================================================
CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  
  -- Evento
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  
  -- Estado
  status TEXT DEFAULT 'pending',
  
  -- Respuesta
  response_status INT,
  response_body TEXT,
  response_time_ms INT,
  
  -- Reintentos
  attempt_count INT DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  
  -- Error
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

-- =====================================================
-- RATE LIMIT TRACKING
-- =====================================================
CREATE TABLE api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  
  -- Contador
  window_start TIMESTAMPTZ NOT NULL,
  window_type TEXT NOT NULL,
  request_count INT DEFAULT 0,
  
  UNIQUE(api_key_id, window_start, window_type)
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;

CREATE INDEX idx_api_logs_org ON api_logs(organization_id);
CREATE INDEX idx_api_logs_key ON api_logs(api_key_id);
CREATE INDEX idx_api_logs_created ON api_logs(created_at DESC);
CREATE INDEX idx_api_logs_endpoint ON api_logs(endpoint);

CREATE INDEX idx_webhooks_org ON webhooks(organization_id);
CREATE INDEX idx_webhooks_active ON webhooks(is_active) WHERE is_active = true;

CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_retry ON webhook_deliveries(next_retry_at) 
  WHERE status = 'retrying';

CREATE INDEX idx_api_rate_limits_key ON api_rate_limits(api_key_id, window_start);

-- =====================================================
-- RLS
-- =====================================================
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org api_keys" ON api_keys FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Org api_logs" ON api_logs FOR SELECT USING (
  organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Org webhooks" ON webhooks FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Org webhook_deliveries" ON webhook_deliveries FOR SELECT USING (
  webhook_id IN (
    SELECT id FROM webhooks WHERE organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
);

-- =====================================================
-- FUNCIONES
-- =====================================================

-- Verificar API key y rate limit
CREATE OR REPLACE FUNCTION verify_api_key(p_key TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  organization_id UUID,
  scopes JSONB,
  rate_limit_exceeded BOOLEAN,
  api_key_id UUID
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key_prefix TEXT;
  v_key_hash TEXT;
  v_api_key RECORD;
  v_minute_count INT;
  v_day_count INT;
BEGIN
  -- Extraer prefix y calcular hash
  v_key_prefix := LEFT(p_key, 8);
  v_key_hash := encode(sha256(p_key::bytea), 'hex');
  
  -- Buscar API key
  SELECT * INTO v_api_key
  FROM api_keys ak
  WHERE ak.key_prefix = v_key_prefix
    AND ak.key_hash = v_key_hash
    AND ak.is_active = true
    AND (ak.expires_at IS NULL OR ak.expires_at > NOW());
  
  IF v_api_key IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::JSONB, false, NULL::UUID;
    RETURN;
  END IF;
  
  -- Verificar rate limit por minuto
  SELECT COALESCE(SUM(request_count), 0) INTO v_minute_count
  FROM api_rate_limits
  WHERE api_rate_limits.api_key_id = v_api_key.id
    AND window_type = 'minute'
    AND window_start > NOW() - INTERVAL '1 minute';
  
  -- Verificar rate limit por día
  SELECT COALESCE(SUM(request_count), 0) INTO v_day_count
  FROM api_rate_limits
  WHERE api_rate_limits.api_key_id = v_api_key.id
    AND window_type = 'day'
    AND window_start > NOW() - INTERVAL '1 day';
  
  -- Actualizar last_used_at
  UPDATE api_keys SET last_used_at = NOW() WHERE id = v_api_key.id;
  
  RETURN QUERY SELECT 
    true,
    v_api_key.organization_id,
    v_api_key.scopes,
    (v_minute_count >= v_api_key.rate_limit_per_minute OR v_day_count >= v_api_key.rate_limit_per_day),
    v_api_key.id;
END;
$$;

-- Incrementar rate limit
CREATE OR REPLACE FUNCTION increment_rate_limit(p_api_key_id UUID)
RETURNS VOID 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Incrementar contador por minuto
  INSERT INTO api_rate_limits (api_key_id, window_start, window_type, request_count)
  VALUES (p_api_key_id, date_trunc('minute', NOW()), 'minute', 1)
  ON CONFLICT (api_key_id, window_start, window_type)
  DO UPDATE SET request_count = api_rate_limits.request_count + 1;
  
  -- Incrementar contador por día
  INSERT INTO api_rate_limits (api_key_id, window_start, window_type, request_count)
  VALUES (p_api_key_id, date_trunc('day', NOW()), 'day', 1)
  ON CONFLICT (api_key_id, window_start, window_type)
  DO UPDATE SET request_count = api_rate_limits.request_count + 1;
END;
$$;

-- Limpiar rate limits antiguos (ejecutar con cron)
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS VOID 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM api_rate_limits WHERE window_start < NOW() - INTERVAL '2 days';
END;
$$;