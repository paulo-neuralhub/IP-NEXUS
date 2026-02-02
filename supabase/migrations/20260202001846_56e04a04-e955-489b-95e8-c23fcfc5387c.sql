-- =====================================================
-- IP-NEXUS - SISTEMA DE FIRMA ELECTRÓNICA
-- PROMPT 22: Políticas, configuración y solicitudes
-- =====================================================

-- =====================================================
-- POLÍTICAS DE FIRMA POR TIPO DE DOCUMENTO Y JURISDICCIÓN
-- =====================================================
CREATE TABLE IF NOT EXISTS signature_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Criterios de matching
  document_type VARCHAR(50) NOT NULL,
  -- Valores: 'encargo', 'presupuesto', 'nda', 'instrucciones', 'poder', 
  -- 'cesion', 'licencia_exclusiva', 'licencia_no_exclusiva', 'contrato_agente', 'coexistencia'
  
  jurisdiction VARCHAR(10), -- NULL = global, 'ES', 'EU', 'US', 'DE', 'FR', 'CN', 'BR', 'JP', etc.
  office_code VARCHAR(20), -- NULL = cualquiera, 'EPO', 'USPTO', 'EUIPO', 'OEPM', 'WIPO', 'CNIPA', etc.
  
  -- Resultado de la política
  required_level VARCHAR(20) NOT NULL DEFAULT 'standard',
  -- 'standard' = Nivel 1 incluido
  -- 'qualified' = Nivel 2 premium
  -- 'manual' = Fuera del sistema (firma manuscrita requerida)
  
  recommended_level VARCHAR(20), -- Puede ser mayor que required
  
  -- Mensajes para UI (español)
  warning_message TEXT,
  info_message TEXT,
  
  -- Configuración adicional
  requires_idv BOOLEAN DEFAULT false,
  allowed_providers TEXT[] DEFAULT ARRAY['boldsign'],
  
  -- Metadata
  priority INT DEFAULT 100, -- Menor = mayor prioridad
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_sig_policies_lookup 
  ON signature_policies(document_type, jurisdiction, office_code) 
  WHERE is_active = true;

-- =====================================================
-- CONFIGURACIÓN DE FIRMA POR ORGANIZACIÓN
-- =====================================================
CREATE TABLE IF NOT EXISTS organization_signature_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Módulos activos
  standard_enabled BOOLEAN DEFAULT true,
  qualified_enabled BOOLEAN DEFAULT false, -- Premium, requiere activación
  
  -- Proveedores
  standard_provider VARCHAR(50) DEFAULT 'boldsign',
  qualified_provider VARCHAR(50) DEFAULT 'yousign',
  
  -- Precios (para cobrar al tenant si revende)
  qualified_price_per_signature DECIMAL(10,2) DEFAULT 10.00,
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Límites mensuales (NULL = ilimitado)
  monthly_standard_limit INTEGER,
  monthly_qualified_limit INTEGER,
  
  -- Contadores del mes actual
  current_month_standard_count INTEGER DEFAULT 0,
  current_month_qualified_count INTEGER DEFAULT 0,
  current_month_reset_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Personalización marca blanca
  custom_email_sender TEXT,
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  
  -- Configuración general
  default_expiration_days INTEGER DEFAULT 30,
  auto_send_reminders BOOLEAN DEFAULT true,
  reminder_days INTEGER[] DEFAULT ARRAY[7, 3, 1],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SOLICITUDES DE FIRMA
-- =====================================================
CREATE TABLE IF NOT EXISTS signature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
  
  -- Referencia única
  request_number VARCHAR(50) NOT NULL,
  
  -- Documento
  document_type VARCHAR(50) NOT NULL,
  document_title TEXT NOT NULL,
  jurisdiction VARCHAR(10),
  office_code VARCHAR(20),
  
  -- Nivel y proveedor
  signature_level VARCHAR(20) NOT NULL, -- 'standard' o 'qualified'
  provider VARCHAR(50) NOT NULL DEFAULT 'boldsign',
  provider_document_id TEXT, -- ID en el proveedor externo
  
  -- Archivos
  original_document_url TEXT,
  signed_document_url TEXT,
  audit_trail_url TEXT,
  certificate_url TEXT,
  
  -- Firmantes (JSONB)
  signers JSONB NOT NULL DEFAULT '[]',
  /*
  [
    {
      "id": "signer_1",
      "name": "Juan García",
      "email": "juan@example.com",
      "phone": "+34600123456",
      "role": "client", -- client, representative, witness, counterparty
      "order": 1,
      "auth_method": "email_otp", -- email_otp, sms_otp, id_document
      "status": "pending", -- pending, sent, viewed, signed, declined
      "signed_at": null,
      "ip_address": null
    }
  ]
  */
  
  -- Estado
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  -- draft, sending, sent, viewed, partially_signed, completed, declined, expired, cancelled, failed
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Costes
  estimated_cost DECIMAL(10,2) DEFAULT 0,
  actual_cost DECIMAL(10,2),
  billed BOOLEAN DEFAULT false,
  
  -- Evidencias (inmutables)
  evidence_hash TEXT, -- SHA-256 del PDF firmado
  
  -- Decisión de política (auditoría)
  policy_applied JSONB,
  /*
  {
    "policy_id": "uuid",
    "required_level": "standard",
    "user_selected": "standard",
    "warnings_shown": ["..."],
    "decided_at": "2026-02-02T10:00:00Z"
  }
  */
  
  -- Usuario
  created_by UUID REFERENCES users(id),
  
  -- Notas
  internal_notes TEXT,
  decline_reason TEXT,
  
  UNIQUE(organization_id, request_number)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_sig_requests_org ON signature_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_sig_requests_matter ON signature_requests(matter_id);
CREATE INDEX IF NOT EXISTS idx_sig_requests_status ON signature_requests(status);

-- =====================================================
-- HISTORIAL DE EVENTOS DE FIRMA
-- =====================================================
CREATE TABLE IF NOT EXISTS signature_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signature_request_id UUID NOT NULL REFERENCES signature_requests(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  event_type VARCHAR(50) NOT NULL,
  -- created, sent, viewed, signed, declined, expired, reminder_sent, completed, failed
  
  signer_id TEXT, -- ID del firmante (signer_1, etc.)
  
  event_data JSONB DEFAULT '{}',
  provider_raw_event JSONB, -- Evento raw del webhook
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sig_events_request ON signature_events(signature_request_id);
CREATE INDEX IF NOT EXISTS idx_sig_events_org ON signature_events(organization_id);

-- =====================================================
-- FUNCIÓN: Generar número de solicitud
-- =====================================================
CREATE OR REPLACE FUNCTION generate_signature_request_number(p_organization_id UUID)
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year TEXT;
  v_count INTEGER;
BEGIN
  v_year := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COUNT(*) + 1 INTO v_count
  FROM signature_requests
  WHERE organization_id = p_organization_id
    AND request_number LIKE 'SIG-' || v_year || '-%';
  
  RETURN 'SIG-' || v_year || '-' || LPAD(v_count::TEXT, 4, '0');
END;
$$;

-- =====================================================
-- FUNCIÓN: Evaluar política de firma
-- =====================================================
CREATE OR REPLACE FUNCTION evaluate_signature_policy(
  p_document_type VARCHAR(50),
  p_jurisdiction VARCHAR(10) DEFAULT NULL,
  p_office_code VARCHAR(20) DEFAULT NULL
)
RETURNS JSONB 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_policy RECORD;
BEGIN
  -- Buscar política más específica (office > jurisdiction > global)
  SELECT * INTO v_policy
  FROM signature_policies
  WHERE document_type = p_document_type
    AND is_active = true
    AND (office_code = p_office_code OR office_code IS NULL)
    AND (jurisdiction = p_jurisdiction OR jurisdiction IS NULL)
  ORDER BY 
    CASE WHEN office_code IS NOT NULL THEN 0 ELSE 1 END,
    CASE WHEN jurisdiction IS NOT NULL THEN 0 ELSE 1 END,
    priority ASC
  LIMIT 1;
  
  IF v_policy IS NULL THEN
    RETURN jsonb_build_object(
      'policy_id', NULL,
      'required_level', 'standard',
      'recommended_level', 'standard',
      'warning_message', NULL,
      'info_message', 'Firma estándar incluida en su suscripción',
      'requires_idv', false
    );
  END IF;
  
  RETURN jsonb_build_object(
    'policy_id', v_policy.id,
    'required_level', v_policy.required_level,
    'recommended_level', COALESCE(v_policy.recommended_level, v_policy.required_level),
    'warning_message', v_policy.warning_message,
    'info_message', v_policy.info_message,
    'requires_idv', v_policy.requires_idv
  );
END;
$$;

-- =====================================================
-- RLS POLICIES
-- =====================================================
ALTER TABLE signature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_signature_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_policies ENABLE ROW LEVEL SECURITY;

-- signature_requests policies
CREATE POLICY "Users can view their org signature requests" ON signature_requests
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their org signature requests" ON signature_requests
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their org signature requests" ON signature_requests
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- signature_events policies
CREATE POLICY "Users can view their org signature events" ON signature_events
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their org signature events" ON signature_events
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- organization_signature_config policies
CREATE POLICY "Users can view their org signature config" ON organization_signature_config
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage their org signature config" ON organization_signature_config
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Políticas globales de lectura para signature_policies
CREATE POLICY "Anyone can read active signature policies" ON signature_policies
  FOR SELECT USING (is_active = true);

-- =====================================================
-- DATOS INICIALES: Políticas de firma
-- =====================================================
INSERT INTO signature_policies (document_type, jurisdiction, office_code, required_level, recommended_level, warning_message, info_message, priority) VALUES

-- ===== DOCUMENTOS COMERCIALES (todos Nivel 1) =====
('encargo', NULL, NULL, 'standard', 'standard', NULL, 'Firma estándar incluida en su suscripción', 100),
('presupuesto', NULL, NULL, 'standard', 'standard', NULL, 'Firma estándar incluida en su suscripción', 100),
('nda', NULL, NULL, 'standard', 'standard', NULL, 'Firma estándar incluida en su suscripción', 100),
('instrucciones', NULL, NULL, 'standard', 'standard', NULL, 'Firma estándar incluida en su suscripción', 100),
('autorizacion_pago', NULL, NULL, 'standard', 'standard', NULL, 'Firma estándar incluida en su suscripción', 100),

-- ===== PODERES - Oficinas permisivas =====
('poder', NULL, 'EUIPO', 'standard', 'standard', NULL, 'EUIPO acepta firma electrónica estándar', 50),
('poder', NULL, 'USPTO', 'standard', 'standard', NULL, 'USPTO acepta firma electrónica desde marzo 2024', 50),
('poder', NULL, 'UKIPO', 'standard', 'standard', NULL, 'UKIPO acepta firma electrónica', 50),
('poder', NULL, 'OEPM', 'standard', 'standard', NULL, 'OEPM acepta firma electrónica avanzada', 50),
('poder', NULL, 'IMPI', 'standard', 'standard', NULL, 'IMPI (México) acepta firma electrónica', 50),

-- ===== PODERES - Oficinas estrictas =====
('poder', NULL, 'EPO', 'qualified', 'qualified', 
  '⚠️ EPO requiere firma cualificada (QES) o manuscrita para poderes de representación. La firma estándar puede ser rechazada.',
  'Se aplicará firma cualificada con verificación de identidad', 40),

('poder', 'DE', NULL, 'qualified', 'qualified',
  '⚠️ El derecho alemán (BGB) exige forma escrita para ciertos poderes. Se recomienda firma cualificada.',
  'Firma cualificada equivale a firma manuscrita en Alemania', 45),

('poder', NULL, 'WIPO', 'standard', 'qualified',
  '⚠️ WIPO tiene requisitos variables. Se recomienda firma cualificada para mayor seguridad.',
  'Verifique los requisitos específicos de su trámite', 55),

-- ===== PODERES - Jurisdicciones problemáticas =====
('poder', 'CN', NULL, 'manual', 'manual',
  '🔴 ATENCIÓN: China (CNIPA) generalmente NO acepta firma electrónica. Requiere firma manuscrita y/o sello corporativo físico (chop). Puede requerir notarización consular.',
  'Contacte con su corresponsal en China para el proceso adecuado', 30),

('poder', 'BR', NULL, 'manual', 'manual',
  '🔴 ATENCIÓN: Brasil (INPI) requiere certificado ICP-Brasil. El sistema de firma electrónica estándar no es válido para esta jurisdicción.',
  'Requiere certificado digital brasileño específico', 30),

('poder', 'JP', NULL, 'qualified', 'manual',
  '⚠️ Japón tiene requisitos estrictos bajo la Ley de Firma Electrónica. Verifique con su corresponsal si acepta firma electrónica.',
  'Puede requerir PKI con certificados japoneses', 35),

-- ===== CESIONES =====
('cesion', NULL, NULL, 'standard', 'qualified',
  '⚠️ Para cesiones de derechos, especialmente de alto valor, se recomienda firma cualificada para mayor seguridad jurídica.',
  'Puede usar firma estándar, pero considere firma cualificada para documentos importantes', 80),

('cesion', NULL, 'EPO', 'qualified', 'qualified',
  '⚠️ EPO requiere firma cualificada o manuscrita para inscripción de cesiones de patentes.',
  'Se aplicará firma cualificada', 40),

-- ===== LICENCIAS =====
('licencia_exclusiva', NULL, NULL, 'standard', 'qualified',
  '⚠️ Para licencias exclusivas, se recomienda firma cualificada dado su alto valor e implicaciones legales.',
  'Considere firma cualificada para mayor protección', 75),

('licencia_no_exclusiva', NULL, NULL, 'standard', 'standard', NULL, 
  'Firma estándar generalmente suficiente para licencias no exclusivas', 85),

-- ===== CONTRATOS =====
('contrato_agente', NULL, NULL, 'standard', 'standard', NULL, 
  'Firma estándar válida para contratos con agentes', 90),

('contrato_agente', NULL, 'EPO', 'qualified', 'qualified',
  '⚠️ Para contratos con corresponsales relacionados con EPO, se recomienda firma cualificada.',
  'Firma cualificada recomendada para correspondencia EPO', 45),

('coexistencia', NULL, NULL, 'standard', 'qualified',
  'Para acuerdos de coexistencia, considere firma cualificada si puede derivar en litigio futuro.',
  'Firma cualificada proporciona mayor fuerza probatoria en caso de disputa', 80)

ON CONFLICT DO NOTHING;