-- =====================================================
-- P56: SISTEMA DE FIRMA DIGITAL
-- =====================================================

-- 1. Tabla de Solicitudes de Firma
CREATE TABLE signature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Documento (referencia a matter_documents)
  document_id UUID REFERENCES matter_documents(id) ON DELETE SET NULL,
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  document_hash TEXT, -- SHA-256 para verificar integridad
  
  -- Contexto
  matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  
  -- Configuración
  signature_type TEXT DEFAULT 'simple' CHECK (signature_type IN ('simple', 'advanced', 'qualified')),
  provider TEXT DEFAULT 'internal' CHECK (provider IN ('internal', 'docusign', 'adobe_sign')),
  external_envelope_id TEXT, -- Para integraciones futuras
  
  -- Firmantes (JSONB array)
  signers JSONB NOT NULL DEFAULT '[]',
  /*
  Estructura de cada firmante:
  {
    "id": "uuid",
    "email": "firmante@email.com",
    "name": "Nombre Completo",
    "role": "signer|approver|cc",
    "order": 1,
    "sign_token": "token-unico-para-firmar",
    "viewed_at": null,
    "signed_at": null,
    "declined_at": null,
    "decline_reason": null,
    "signature_data": null,
    "ip_address": null,
    "user_agent": null
  }
  */
  
  -- Mensaje personalizado
  email_subject TEXT,
  email_message TEXT,
  
  -- Estado
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft',            -- Borrador, no enviado
    'sent',             -- Enviado a firmantes
    'viewed',           -- Al menos un firmante lo ha visto
    'partially_signed', -- Algunos han firmado
    'completed',        -- Todos han firmado
    'declined',         -- Algún firmante rechazó
    'expired',          -- Expiró sin completarse
    'voided'            -- Anulado por el emisor
  )),
  
  -- Fechas
  sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,
  voided_reason TEXT,
  
  -- Documento firmado final
  signed_document_url TEXT,
  signed_document_hash TEXT,
  certificate_url TEXT, -- Certificado de firma
  
  -- Recordatorios
  reminder_sent_count INTEGER DEFAULT 0,
  last_reminder_at TIMESTAMPTZ,
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_signature_requests_org ON signature_requests(organization_id);
CREATE INDEX idx_signature_requests_status ON signature_requests(status);
CREATE INDEX idx_signature_requests_matter ON signature_requests(matter_id);
CREATE INDEX idx_signature_requests_created_by ON signature_requests(created_by);
CREATE INDEX idx_signature_requests_pending ON signature_requests(status) 
  WHERE status IN ('sent', 'viewed', 'partially_signed');
CREATE INDEX idx_signature_requests_expires ON signature_requests(expires_at);

-- Trigger para updated_at
CREATE TRIGGER signature_requests_updated_at
  BEFORE UPDATE ON signature_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE signature_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view signature requests in their organization"
  ON signature_requests FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create signature requests in their organization"
  ON signature_requests FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update signature requests in their organization"
  ON signature_requests FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete draft signature requests"
  ON signature_requests FOR DELETE
  USING (
    status = 'draft' AND
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- 2. Tabla de Auditoría de Firmas (inmutable)
CREATE TABLE signature_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signature_request_id UUID NOT NULL REFERENCES signature_requests(id) ON DELETE CASCADE,
  
  -- Evento
  action TEXT NOT NULL CHECK (action IN (
    'created',           -- Solicitud creada
    'sent',              -- Enviado a firmantes
    'viewed',            -- Firmante abrió el documento
    'signed',            -- Firmante firmó
    'declined',          -- Firmante rechazó
    'reminder_sent',     -- Recordatorio enviado
    'expired',           -- Expiró
    'voided',            -- Anulado
    'completed',         -- Completado (todos firmaron)
    'document_downloaded' -- Documento descargado
  )),
  
  -- Actor
  actor_type TEXT CHECK (actor_type IN ('system', 'staff', 'signer')),
  actor_email TEXT,
  actor_name TEXT,
  actor_ip TEXT,
  actor_user_agent TEXT,
  
  -- Detalles adicionales
  details JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_signature_audit_request ON signature_audit_log(signature_request_id);
CREATE INDEX idx_signature_audit_action ON signature_audit_log(action);
CREATE INDEX idx_signature_audit_created ON signature_audit_log(created_at);

-- RLS (solo lectura para la organización)
ALTER TABLE signature_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs for their organization's signatures"
  ON signature_audit_log FOR SELECT
  USING (
    signature_request_id IN (
      SELECT id FROM signature_requests 
      WHERE organization_id IN (
        SELECT organization_id FROM memberships WHERE user_id = auth.uid()
      )
    )
  );

-- No permitir INSERT/UPDATE/DELETE directo - solo via edge functions
CREATE POLICY "Service role can insert audit logs"
  ON signature_audit_log FOR INSERT
  WITH CHECK (true);  -- Edge functions usan service role

-- 3. Vista para estadísticas de firmas pendientes
CREATE OR REPLACE VIEW signature_stats AS
SELECT 
  organization_id,
  COUNT(*) FILTER (WHERE status IN ('sent', 'viewed', 'partially_signed')) as pending_count,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
  COUNT(*) FILTER (WHERE status = 'declined') as declined_count,
  COUNT(*) FILTER (WHERE status = 'expired') as expired_count,
  COUNT(*) FILTER (WHERE status = 'voided') as voided_count,
  COUNT(*) as total_count
FROM signature_requests
GROUP BY organization_id;