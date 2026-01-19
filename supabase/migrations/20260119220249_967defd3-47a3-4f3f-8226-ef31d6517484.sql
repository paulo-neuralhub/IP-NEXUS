-- ============================================
-- AUDIT & COMPLIANCE SYSTEM
-- ============================================

-- ============================================
-- CHANGE HISTORY (Campo a campo)
-- ============================================

CREATE TABLE IF NOT EXISTS change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_log_id UUID REFERENCES audit_logs(id) ON DELETE CASCADE,
  
  -- Recurso
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID NOT NULL,
  
  -- Campo modificado
  field_name VARCHAR(100) NOT NULL,
  field_path VARCHAR(300),  -- Para campos JSONB anidados
  
  -- Valores
  old_value TEXT,
  new_value TEXT,
  
  -- Tipo de dato
  data_type VARCHAR(50),
  -- 'string', 'number', 'boolean', 'date', 'json', 'array'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_change_history_resource ON change_history(resource_type, resource_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_change_history_audit ON change_history(audit_log_id);

-- ============================================
-- LOGS DE ACCESO (Login/Logout)
-- ============================================

CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email VARCHAR(255) NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  
  -- Tipo de evento
  event_type VARCHAR(50) NOT NULL,
  -- 'login_success', 'login_failed', 'logout', 'session_expired',
  -- 'password_reset', '2fa_enabled', '2fa_disabled', 'api_key_used'
  
  -- Método de autenticación
  auth_method VARCHAR(30),
  -- 'password', 'sso', 'api_key', 'oauth', '2fa'
  
  -- Dispositivo
  ip_address VARCHAR(50),
  user_agent TEXT,
  device_info JSONB,
  
  -- Geolocalización
  geo_location JSONB,
  
  -- Resultado
  status VARCHAR(20) NOT NULL DEFAULT 'success',  -- 'success', 'failure'
  failure_reason VARCHAR(200),
  
  -- Sesión
  session_id VARCHAR(100),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_logs_user ON access_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_org ON access_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_ip ON access_logs(ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_failed ON access_logs(status, created_at DESC) WHERE status = 'failure';
CREATE INDEX IF NOT EXISTS idx_access_logs_event ON access_logs(event_type, created_at DESC);

-- ============================================
-- POLÍTICAS DE RETENCIÓN
-- ============================================

CREATE TABLE IF NOT EXISTS retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identificación
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Tipo de dato
  data_type VARCHAR(100) NOT NULL,
  -- 'audit_logs', 'assets', 'documents', 'comments', 'notifications', etc.
  
  -- Reglas de retención
  retention_days INTEGER NOT NULL,
  
  -- Condiciones
  conditions JSONB DEFAULT '{}',
  
  -- Acción al expirar
  action VARCHAR(30) DEFAULT 'archive',
  -- 'archive', 'delete', 'anonymize'
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  -- Legal hold (suspender eliminación)
  legal_hold BOOLEAN DEFAULT false,
  legal_hold_reason TEXT,
  legal_hold_until TIMESTAMPTZ,
  
  -- Última ejecución
  last_run_at TIMESTAMPTZ,
  last_run_count INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_retention_policies ON retention_policies(organization_id, data_type);
CREATE INDEX IF NOT EXISTS idx_retention_policies_active ON retention_policies(is_active, legal_hold);

-- ============================================
-- EJECUCIÓN DE RETENCIÓN (Log)
-- ============================================

CREATE TABLE IF NOT EXISTS retention_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES retention_policies(id) ON DELETE CASCADE,
  
  -- Ejecución
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Resultados
  records_processed INTEGER DEFAULT 0,
  records_archived INTEGER DEFAULT 0,
  records_deleted INTEGER DEFAULT 0,
  records_anonymized INTEGER DEFAULT 0,
  records_skipped INTEGER DEFAULT 0,
  
  -- Estado
  status VARCHAR(30) DEFAULT 'running',
  -- 'running', 'completed', 'failed', 'cancelled'
  
  error_message TEXT,
  
  -- Detalles
  details JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_retention_executions ON retention_executions(policy_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_retention_executions_status ON retention_executions(status);

-- ============================================
-- SOLICITUDES GDPR
-- ============================================

CREATE TABLE IF NOT EXISTS gdpr_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Solicitante
  requester_user_id UUID REFERENCES auth.users(id),
  requester_email VARCHAR(255) NOT NULL,
  requester_name VARCHAR(200),
  
  -- Tipo de solicitud
  request_type VARCHAR(50) NOT NULL,
  -- 'access', 'rectification', 'erasure', 'portability', 'restriction', 'objection'
  
  -- Descripción
  description TEXT,
  
  -- Estado
  status VARCHAR(30) DEFAULT 'pending',
  -- 'pending', 'in_progress', 'completed', 'rejected', 'cancelled'
  
  -- Asignación
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Plazos (GDPR: 30 días)
  due_date TIMESTAMPTZ NOT NULL,
  extended_until TIMESTAMPTZ,
  extension_reason TEXT,
  
  -- Verificación de identidad
  identity_verified BOOLEAN DEFAULT false,
  identity_verified_at TIMESTAMPTZ,
  identity_verified_by UUID REFERENCES auth.users(id),
  
  -- Resultado
  resolution_notes TEXT,
  completed_at TIMESTAMPTZ,
  
  -- Archivos generados
  export_file_url VARCHAR(500),
  export_file_expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gdpr_requests ON gdpr_requests(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_due ON gdpr_requests(due_date) WHERE status IN ('pending', 'in_progress');
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_requester ON gdpr_requests(requester_email);

-- ============================================
-- CONSENTIMIENTOS
-- ============================================

CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Tipo de consentimiento
  consent_type VARCHAR(100) NOT NULL,
  -- 'terms_of_service', 'privacy_policy', 'marketing_email',
  -- 'analytics', 'third_party_sharing', 'data_processing'
  
  -- Versión del documento
  document_version VARCHAR(20),
  document_url VARCHAR(500),
  
  -- Estado
  granted BOOLEAN NOT NULL,
  
  -- Contexto
  ip_address VARCHAR(50),
  user_agent TEXT,
  
  -- Timestamps
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  
  UNIQUE(user_id, consent_type, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_consents_user ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_consents_org ON user_consents(organization_id, consent_type);

-- ============================================
-- EXPORTACIONES DE DATOS
-- ============================================

CREATE TABLE IF NOT EXISTS data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Tipo de exportación
  export_type VARCHAR(50) NOT NULL,
  -- 'full_backup', 'gdpr_request', 'report', 'partial', 'user_data'
  
  -- Configuración
  config JSONB NOT NULL DEFAULT '{}',
  
  -- Estado
  status VARCHAR(30) DEFAULT 'pending',
  -- 'pending', 'processing', 'completed', 'failed', 'expired'
  
  -- Progreso
  progress INTEGER DEFAULT 0,  -- 0-100
  current_step VARCHAR(100),
  
  -- Resultado
  file_url VARCHAR(500),
  file_size_bytes BIGINT,
  file_expires_at TIMESTAMPTZ,
  
  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Error
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exports_org ON data_exports(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exports_status ON data_exports(status);

-- ============================================
-- ALERTAS DE SEGURIDAD
-- ============================================

CREATE TABLE IF NOT EXISTS security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Tipo de alerta
  alert_type VARCHAR(100) NOT NULL,
  -- 'multiple_failed_logins', 'unusual_location', 'mass_delete',
  -- 'permission_escalation', 'data_exfiltration', 'api_abuse'
  
  -- Severidad
  severity VARCHAR(20) NOT NULL,
  -- 'low', 'medium', 'high', 'critical'
  
  -- Descripción
  title VARCHAR(300) NOT NULL,
  description TEXT,
  
  -- Usuario afectado
  user_id UUID REFERENCES auth.users(id),
  
  -- Evidencia
  evidence JSONB,
  
  -- Estado
  status VARCHAR(30) DEFAULT 'open',
  -- 'open', 'investigating', 'resolved', 'false_positive', 'escalated'
  
  -- Resolución
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  -- Acciones tomadas
  actions_taken JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_alerts ON security_alerts(organization_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity, status) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_security_alerts_user ON security_alerts(user_id);

-- ============================================
-- COMPLIANCE CHECKS
-- ============================================

CREATE TABLE IF NOT EXISTS compliance_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Framework
  framework VARCHAR(50) NOT NULL,
  -- 'gdpr', 'soc2', 'iso27001', 'hipaa', 'internal'
  
  -- Check
  check_code VARCHAR(100) NOT NULL,
  check_name VARCHAR(300) NOT NULL,
  check_description TEXT,
  
  -- Categoría
  category VARCHAR(100),
  
  -- Estado
  status VARCHAR(30) NOT NULL DEFAULT 'pending_review',
  -- 'compliant', 'non_compliant', 'partial', 'not_applicable', 'pending_review'
  
  -- Evidencia
  evidence_notes TEXT,
  evidence_documents UUID[],
  
  -- Responsable
  owner_id UUID REFERENCES auth.users(id),
  
  -- Fechas
  last_checked_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  
  -- Remediación
  remediation_plan TEXT,
  remediation_due_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, framework, check_code)
);

CREATE INDEX IF NOT EXISTS idx_compliance_checks ON compliance_checks(organization_id, framework, status);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_review ON compliance_checks(next_review_at) WHERE status != 'not_applicable';

-- ============================================
-- ENABLE RLS
-- ============================================

ALTER TABLE change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- change_history: Link through audit_logs
CREATE POLICY "Users can view change history for their org"
ON change_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM audit_logs al
    WHERE al.id = change_history.audit_log_id
    AND al.organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  )
);

-- access_logs: Org members can view
CREATE POLICY "Members can view access logs"
ON access_logs FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can insert access logs"
ON access_logs FOR INSERT
WITH CHECK (true);

-- retention_policies: Admins only
CREATE POLICY "Admins can manage retention policies"
ON retention_policies FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- retention_executions: Admins can view
CREATE POLICY "Admins can view retention executions"
ON retention_executions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM retention_policies rp
    WHERE rp.id = retention_executions.policy_id
    AND rp.organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
);

-- gdpr_requests: Org admins or requester
CREATE POLICY "Users can view GDPR requests"
ON gdpr_requests FOR SELECT
USING (
  requester_user_id = auth.uid() OR
  organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Users can create GDPR requests"
ON gdpr_requests FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can update GDPR requests"
ON gdpr_requests FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- user_consents: Users manage their own
CREATE POLICY "Users can manage their consents"
ON user_consents FOR ALL
USING (user_id = auth.uid());

-- data_exports: Users can view their own, admins can view all
CREATE POLICY "Users can view their exports"
ON data_exports FOR SELECT
USING (
  user_id = auth.uid() OR
  organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Users can create exports"
ON data_exports FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  )
);

-- security_alerts: Admins only
CREATE POLICY "Admins can manage security alerts"
ON security_alerts FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- compliance_checks: Admins only
CREATE POLICY "Admins can manage compliance checks"
ON compliance_checks FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- ============================================
-- UPDATE TRIGGERS
-- ============================================

CREATE TRIGGER update_retention_policies_updated_at
  BEFORE UPDATE ON retention_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gdpr_requests_updated_at
  BEFORE UPDATE ON gdpr_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_checks_updated_at
  BEFORE UPDATE ON compliance_checks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();