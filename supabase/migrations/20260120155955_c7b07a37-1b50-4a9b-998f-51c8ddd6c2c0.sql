-- ============================================
-- LEGAL OPS CORE - DATABASE SCHEMA
-- ============================================

-- Enable pgvector if not already enabled
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================
-- TIPOS ENUMERADOS - LEGAL OPS
-- ============================================

-- Tipos de documento legal (para consentimientos)
DO $$ BEGIN
  CREATE TYPE legal_doc_type AS ENUM (
    'tos',
    'dpa',
    'ai_disclosure',
    'whatsapp_addendum',
    'biometric_addendum',
    'privacy_policy'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Estado de consentimiento
DO $$ BEGIN
  CREATE TYPE consent_status AS ENUM (
    'pending',
    'accepted',
    'rejected',
    'revoked',
    'expired'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Canales de comunicación
DO $$ BEGIN
  CREATE TYPE comm_channel AS ENUM (
    'email',
    'whatsapp',
    'portal',
    'phone',
    'sms',
    'in_person',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Dirección de comunicación
DO $$ BEGIN
  CREATE TYPE comm_direction AS ENUM (
    'inbound',
    'outbound',
    'internal'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Categorías de comunicación
DO $$ BEGIN
  CREATE TYPE comm_category AS ENUM (
    'legal',
    'administrative',
    'commercial',
    'urgent',
    'general'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tier de WhatsApp
DO $$ BEGIN
  CREATE TYPE whatsapp_tier AS ENUM (
    'tier1_api',
    'tier2_sync',
    'tier3_basic'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tipo de documento del cliente
DO $$ BEGIN
  CREATE TYPE client_doc_type AS ENUM (
    'poder_general',
    'poder_especial',
    'escritura_constitucion',
    'certificado_registro',
    'contrato',
    'factura',
    'notificacion_oficial',
    'correspondencia',
    'sentencia_resolucion',
    'informe_pericial',
    'otro'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Estado de vigencia de documento
DO $$ BEGIN
  CREATE TYPE doc_validity_status AS ENUM (
    'valid',
    'expiring_soon',
    'expired',
    'pending_verification',
    'revoked'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tipo de entidad extraída (NER)
DO $$ BEGIN
  CREATE TYPE ner_entity_type AS ENUM (
    'date_grant',
    'date_expiry',
    'date_signature',
    'party_grantor',
    'party_grantee',
    'party_notary',
    'id_document',
    'reference_protocol',
    'reference_registry',
    'reference_case',
    'power_type',
    'amount',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tipo de interacción IA  
DO $$ BEGIN
  CREATE TYPE legalops_ai_interaction_type AS ENUM (
    'classification',
    'ner_extraction',
    'transcription',
    'assistant_query',
    'document_summary',
    'rag_search'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Nivel de confianza IA
DO $$ BEGIN
  CREATE TYPE ai_confidence_level AS ENUM (
    'high',
    'medium',
    'low',
    'manual'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- DOCUMENTOS LEGALES (Versiones)
-- ============================================

CREATE TABLE IF NOT EXISTS legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_type legal_doc_type NOT NULL,
  version VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  content_hash VARCHAR(64) NOT NULL,
  language VARCHAR(5) DEFAULT 'es',
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_until TIMESTAMPTZ,
  is_current BOOLEAN DEFAULT true,
  changelog TEXT,
  requires_re_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(doc_type, version, language)
);

CREATE INDEX IF NOT EXISTS idx_legal_docs_current ON legal_documents(doc_type, language) 
  WHERE is_current = true;

-- ============================================
-- CONSENTIMIENTOS DE TENANTS
-- ============================================

CREATE TABLE IF NOT EXISTS tenant_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  accepted_by UUID NOT NULL REFERENCES auth.users(id),
  legal_document_id UUID NOT NULL REFERENCES legal_documents(id),
  doc_type legal_doc_type NOT NULL,
  doc_version VARCHAR(20) NOT NULL,
  doc_hash VARCHAR(64) NOT NULL,
  status consent_status DEFAULT 'pending',
  accepted_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  revoked_by UUID REFERENCES auth.users(id),
  signed_pdf_url TEXT,
  signature_method VARCHAR(50),
  signature_provider VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, doc_type, doc_version)
);

CREATE INDEX IF NOT EXISTS idx_tenant_consents_org ON tenant_consents(organization_id);
CREATE INDEX IF NOT EXISTS idx_tenant_consents_status ON tenant_consents(organization_id, status) 
  WHERE status = 'accepted';

-- ============================================
-- CONFIGURACIÓN DE IA POR TENANT
-- ============================================

CREATE TABLE IF NOT EXISTS tenant_ai_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ai_classification_enabled BOOLEAN DEFAULT false,
  ai_classification_accepted_at TIMESTAMPTZ,
  ai_extraction_enabled BOOLEAN DEFAULT false,
  ai_extraction_accepted_at TIMESTAMPTZ,
  ai_assistant_enabled BOOLEAN DEFAULT false,
  ai_assistant_accepted_at TIMESTAMPTZ,
  audio_transcription_enabled BOOLEAN DEFAULT false,
  audio_transcription_accepted_at TIMESTAMPTZ,
  biometric_diarization_enabled BOOLEAN DEFAULT false,
  biometric_diarization_accepted_at TIMESTAMPTZ,
  biometric_addendum_signed BOOLEAN DEFAULT false,
  whatsapp_tier whatsapp_tier DEFAULT 'tier3_basic',
  whatsapp_accepted_at TIMESTAMPTZ,
  whatsapp_addendum_signed BOOLEAN DEFAULT false,
  client_portal_enabled BOOLEAN DEFAULT false,
  client_assistant_enabled BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id)
);

-- ============================================
-- AUDIT LOG DE CONSENTIMIENTOS (Inmutable)
-- ============================================

CREATE TABLE IF NOT EXISTS consent_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  event_type VARCHAR(50) NOT NULL,
  consent_type VARCHAR(50) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  document_version VARCHAR(20),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consent_audit_org ON consent_audit_log(organization_id, created_at DESC);

-- ============================================
-- CANALES DE COMUNICACIÓN CONFIGURADOS
-- ============================================

CREATE TABLE IF NOT EXISTS communication_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  channel comm_channel NOT NULL,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  sync_status VARCHAR(50) DEFAULT 'pending',
  credentials_encrypted TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, channel)
);

-- ============================================
-- COMUNICACIONES UNIFICADAS
-- ============================================

CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
  channel comm_channel NOT NULL,
  direction comm_direction NOT NULL,
  channel_config_id UUID REFERENCES communication_channels(id),
  subject VARCHAR(500),
  body TEXT,
  body_html TEXT,
  body_preview VARCHAR(300),
  attachments JSONB DEFAULT '[]',
  ai_category comm_category,
  ai_subcategory VARCHAR(100),
  ai_priority INTEGER,
  ai_confidence DECIMAL(5,4),
  ai_classified_at TIMESTAMPTZ,
  ai_model VARCHAR(100),
  manual_category comm_category,
  manual_priority INTEGER,
  classified_by UUID REFERENCES auth.users(id),
  classified_at TIMESTAMPTZ,
  external_id VARCHAR(255),
  external_metadata JSONB DEFAULT '{}',
  email_from VARCHAR(255),
  email_to TEXT[],
  email_cc TEXT[],
  email_bcc TEXT[],
  email_message_id VARCHAR(255),
  email_thread_id VARCHAR(255),
  email_in_reply_to VARCHAR(255),
  whatsapp_from VARCHAR(50),
  whatsapp_to VARCHAR(50),
  whatsapp_type VARCHAR(30),
  whatsapp_media_url TEXT,
  phone_from VARCHAR(50),
  phone_to VARCHAR(50),
  phone_duration_seconds INTEGER,
  phone_recording_url TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  read_by UUID REFERENCES auth.users(id),
  is_replied BOOLEAN DEFAULT false,
  replied_at TIMESTAMPTZ,
  reply_comm_id UUID REFERENCES communications(id),
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  is_starred BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comm_org_client ON communications(organization_id, client_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_comm_org_channel ON communications(organization_id, channel, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_comm_org_unread ON communications(organization_id, is_read, received_at DESC) 
  WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_comm_org_matter ON communications(organization_id, matter_id, received_at DESC);

-- ============================================
-- SESIONES DE WHATSAPP
-- ============================================

CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  status VARCHAR(30) DEFAULT 'disconnected',
  phone_number VARCHAR(50),
  device_name VARCHAR(100),
  session_data_encrypted TEXT,
  last_seen_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  messages_synced INTEGER DEFAULT 0,
  error_message TEXT,
  error_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- ============================================
-- TRANSCRIPCIONES DE AUDIO
-- ============================================

CREATE TABLE IF NOT EXISTS audio_transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  communication_id UUID REFERENCES communications(id) ON DELETE CASCADE,
  source_type VARCHAR(30) NOT NULL,
  audio_url TEXT NOT NULL,
  audio_duration_seconds INTEGER,
  audio_format VARCHAR(20),
  transcription_text TEXT,
  transcription_status VARCHAR(30) DEFAULT 'pending',
  segments JSONB DEFAULT '[]',
  diarization_enabled BOOLEAN DEFAULT false,
  speakers_identified JSONB DEFAULT '[]',
  ai_model VARCHAR(100),
  ai_confidence DECIMAL(5,4),
  language_detected VARCHAR(10),
  transcribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audio_trans_org ON audio_transcriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_audio_trans_comm ON audio_transcriptions(communication_id);

-- ============================================
-- DOCUMENTOS DE CLIENTES
-- ============================================

CREATE TABLE IF NOT EXISTS client_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  file_hash VARCHAR(64),
  doc_type client_doc_type DEFAULT 'otro',
  doc_type_confidence DECIMAL(5,4),
  doc_type_verified BOOLEAN DEFAULT false,
  title VARCHAR(255),
  description TEXT,
  validity_status doc_validity_status DEFAULT 'pending_verification',
  valid_from DATE,
  valid_until DATE,
  validity_verified BOOLEAN DEFAULT false,
  validity_verified_by UUID REFERENCES auth.users(id),
  validity_verified_at TIMESTAMPTZ,
  ocr_text TEXT,
  ocr_completed_at TIMESTAMPTZ,
  ocr_confidence DECIMAL(5,4),
  ner_status VARCHAR(30) DEFAULT 'pending',
  ner_completed_at TIMESTAMPTZ,
  ner_model VARCHAR(100),
  embedding_status VARCHAR(30) DEFAULT 'pending',
  tags TEXT[],
  notes TEXT,
  visible_in_portal BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  parent_document_id UUID REFERENCES client_documents(id),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_client_docs_org_client ON client_documents(organization_id, client_id);
CREATE INDEX IF NOT EXISTS idx_client_docs_validity ON client_documents(organization_id, validity_status, valid_until)
  WHERE deleted_at IS NULL;

-- ============================================
-- ENTIDADES EXTRAÍDAS (NER)
-- ============================================

CREATE TABLE IF NOT EXISTS document_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES client_documents(id) ON DELETE CASCADE,
  entity_type ner_entity_type NOT NULL,
  entity_value TEXT NOT NULL,
  entity_normalized TEXT,
  page_number INTEGER,
  bounding_box JSONB,
  text_offset_start INTEGER,
  text_offset_end INTEGER,
  surrounding_text VARCHAR(500),
  confidence DECIMAL(5,4),
  confidence_level ai_confidence_level,
  is_verified BOOLEAN DEFAULT false,
  verified_value TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  linked_contact_id UUID REFERENCES contacts(id),
  linked_matter_id UUID REFERENCES matters(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_entities_doc ON document_entities(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_entities_type ON document_entities(organization_id, entity_type);

-- ============================================
-- ALERTAS DE VIGENCIA
-- ============================================

CREATE TABLE IF NOT EXISTS document_validity_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES client_documents(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  days_until_expiry INTEGER,
  expiry_date DATE NOT NULL,
  status VARCHAR(30) DEFAULT 'active',
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  notifications_sent JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ============================================
-- EMBEDDINGS DE DOCUMENTOS
-- ============================================

CREATE TABLE IF NOT EXISTS document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source_type VARCHAR(30) NOT NULL,
  source_id UUID NOT NULL,
  chunk_index INTEGER DEFAULT 0,
  chunk_text TEXT NOT NULL,
  chunk_tokens INTEGER,
  embedding vector(1536),
  client_id UUID,
  matter_id UUID,
  doc_type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_embeddings_filter ON document_embeddings(organization_id, client_id, matter_id);

-- ============================================
-- INTERACCIONES CON IA (Legal Ops específico)
-- ============================================

CREATE TABLE IF NOT EXISTS legalops_ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  client_id UUID REFERENCES contacts(id),
  matter_id UUID REFERENCES matters(id),
  interaction_type legalops_ai_interaction_type NOT NULL,
  input_text TEXT,
  input_tokens INTEGER,
  input_metadata JSONB DEFAULT '{}',
  output_text TEXT,
  output_tokens INTEGER,
  output_metadata JSONB DEFAULT '{}',
  sources JSONB DEFAULT '[]',
  confidence DECIMAL(5,4),
  confidence_level ai_confidence_level,
  model_provider VARCHAR(50),
  model_name VARCHAR(100),
  model_version VARCHAR(50),
  latency_ms INTEGER,
  cost_usd DECIMAL(10,6),
  user_feedback VARCHAR(20),
  user_correction TEXT,
  feedback_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legalops_ai_org ON legalops_ai_interactions(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_legalops_ai_type ON legalops_ai_interactions(organization_id, interaction_type);

-- ============================================
-- FEEDBACK DE IA
-- ============================================

CREATE TABLE IF NOT EXISTS legalops_ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  interaction_id UUID NOT NULL REFERENCES legalops_ai_interactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  feedback_type VARCHAR(30) NOT NULL,
  original_output TEXT,
  corrected_output TEXT,
  feedback_comment TEXT,
  approved_for_training BOOLEAN DEFAULT false,
  training_exported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- POLÍTICAS DE RETENCIÓN
-- ============================================

CREATE TABLE IF NOT EXISTS data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  data_type VARCHAR(100) NOT NULL,
  retention_days INTEGER NOT NULL,
  archive_after_days INTEGER,
  delete_after_days INTEGER,
  exceptions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_execution_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FUNCIONES HELPER
-- ============================================

-- Función para calcular días hasta caducidad
CREATE OR REPLACE FUNCTION days_until_expiry(expiry_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN expiry_date - CURRENT_DATE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para determinar estado de vigencia
CREATE OR REPLACE FUNCTION calculate_validity_status(valid_until DATE)
RETURNS doc_validity_status AS $$
DECLARE
  days_remaining INTEGER;
BEGIN
  IF valid_until IS NULL THEN
    RETURN 'pending_verification';
  END IF;
  
  days_remaining := valid_until - CURRENT_DATE;
  
  IF days_remaining < 0 THEN
    RETURN 'expired';
  ELSIF days_remaining <= 90 THEN
    RETURN 'expiring_soon';
  ELSE
    RETURN 'valid';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para communications
DROP TRIGGER IF EXISTS trigger_communications_updated_at ON communications;
CREATE TRIGGER trigger_communications_updated_at
  BEFORE UPDATE ON communications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para client_documents
DROP TRIGGER IF EXISTS trigger_client_documents_updated_at ON client_documents;
CREATE TRIGGER trigger_client_documents_updated_at
  BEFORE UPDATE ON client_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para log de consentimientos
CREATE OR REPLACE FUNCTION log_consent_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO consent_audit_log (
    organization_id,
    user_id,
    event_type,
    consent_type,
    old_value,
    new_value,
    document_version
  ) VALUES (
    COALESCE(NEW.organization_id, OLD.organization_id),
    COALESCE(NEW.accepted_by, OLD.accepted_by),
    CASE 
      WHEN TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN 'consent_accepted'
      WHEN TG_OP = 'UPDATE' AND NEW.status = 'revoked' THEN 'consent_revoked'
      ELSE 'consent_' || TG_OP
    END,
    COALESCE(NEW.doc_type::text, OLD.doc_type::text),
    CASE WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN row_to_json(OLD) END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) END,
    COALESCE(NEW.doc_version, OLD.doc_version)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_consent_changes ON tenant_consents;
CREATE TRIGGER trigger_log_consent_changes
  AFTER INSERT OR UPDATE ON tenant_consents
  FOR EACH ROW EXECUTE FUNCTION log_consent_change();

-- Trigger para crear alerta de vigencia
CREATE OR REPLACE FUNCTION check_document_validity()
RETURNS TRIGGER AS $$
DECLARE
  days_remaining INTEGER;
BEGIN
  IF NEW.valid_until IS NOT NULL AND NEW.validity_verified THEN
    days_remaining := NEW.valid_until - CURRENT_DATE;
    
    IF days_remaining <= 90 AND days_remaining > 0 THEN
      INSERT INTO document_validity_alerts (
        organization_id, document_id, alert_type, days_until_expiry, expiry_date
      ) VALUES (
        NEW.organization_id,
        NEW.id,
        CASE 
          WHEN days_remaining <= 7 THEN 'expiring_7_days'
          WHEN days_remaining <= 30 THEN 'expiring_30_days'
          ELSE 'expiring_90_days'
        END,
        days_remaining,
        NEW.valid_until
      ) ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_validity ON client_documents;
CREATE TRIGGER trigger_check_validity
  AFTER INSERT OR UPDATE OF valid_until, validity_verified ON client_documents
  FOR EACH ROW EXECUTE FUNCTION check_document_validity();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_ai_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_validity_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE legalops_ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE legalops_ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;

-- Políticas para legal_documents (público - todos pueden leer)
CREATE POLICY "legal_docs_read" ON legal_documents
  FOR SELECT USING (true);

CREATE POLICY "legal_docs_admin" ON legal_documents
  FOR ALL TO service_role USING (true);

-- Políticas multi-tenant estándar usando memberships
CREATE POLICY "tenant_consents_access" ON tenant_consents
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "tenant_ai_config_access" ON tenant_ai_config
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "consent_audit_access" ON consent_audit_log
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "comm_channels_access" ON communication_channels
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "communications_access" ON communications
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "whatsapp_sessions_access" ON whatsapp_sessions
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "audio_trans_access" ON audio_transcriptions
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "client_docs_access" ON client_documents
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "doc_entities_access" ON document_entities
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "doc_alerts_access" ON document_validity_alerts
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "doc_embeddings_access" ON document_embeddings
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "legalops_ai_access" ON legalops_ai_interactions
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "legalops_feedback_access" ON legalops_ai_feedback
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "retention_policies_access" ON data_retention_policies
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );