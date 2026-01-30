-- ============================================================
-- L109B - CORRECCIONES SISTEMA (Post-Test Report) - PARTE 1
-- Crear tablas base primero (sin dependencias circulares)
-- ============================================================

-- ===========================================
-- PASO 1: TABLAS BASE DE WORKFLOW
-- ===========================================

-- workflow_definitions (base table - no FK to other new tables)
CREATE TABLE IF NOT EXISTS workflow_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  version INTEGER DEFAULT 1,
  is_system BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE workflow_definitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workflow_definitions_read" ON workflow_definitions;
CREATE POLICY "workflow_definitions_read" ON workflow_definitions
  FOR SELECT USING (
    is_system = true OR 
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "workflow_definitions_write" ON workflow_definitions;
CREATE POLICY "workflow_definitions_write" ON workflow_definitions
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_workflow_definitions_org ON workflow_definitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflow_definitions_code ON workflow_definitions(code);
CREATE INDEX IF NOT EXISTS idx_workflow_definitions_system ON workflow_definitions(is_system) WHERE is_system = true;

-- workflow_steps
CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_definition_id UUID REFERENCES workflow_definitions(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'circle',
  is_initial BOOLEAN DEFAULT FALSE,
  is_final BOOLEAN DEFAULT FALSE,
  auto_actions JSONB DEFAULT '[]',
  required_fields JSONB DEFAULT '[]',
  sla_hours INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_definition_id, code)
);

ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workflow_steps_read" ON workflow_steps;
CREATE POLICY "workflow_steps_read" ON workflow_steps
  FOR SELECT USING (
    workflow_definition_id IN (
      SELECT id FROM workflow_definitions 
      WHERE is_system = true OR organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
    )
  );

CREATE INDEX IF NOT EXISTS idx_workflow_steps_definition ON workflow_steps(workflow_definition_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_order ON workflow_steps(workflow_definition_id, order_index);

-- workflow_transitions
CREATE TABLE IF NOT EXISTS workflow_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_definition_id UUID REFERENCES workflow_definitions(id) ON DELETE CASCADE NOT NULL,
  from_step_id UUID REFERENCES workflow_steps(id) ON DELETE CASCADE NOT NULL,
  to_step_id UUID REFERENCES workflow_steps(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  description TEXT,
  requires_approval BOOLEAN DEFAULT FALSE,
  approval_roles TEXT[] DEFAULT '{}',
  conditions JSONB DEFAULT '{}',
  auto_trigger BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_definition_id, from_step_id, to_step_id)
);

ALTER TABLE workflow_transitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workflow_transitions_read" ON workflow_transitions;
CREATE POLICY "workflow_transitions_read" ON workflow_transitions
  FOR SELECT USING (
    workflow_definition_id IN (
      SELECT id FROM workflow_definitions 
      WHERE is_system = true OR organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
    )
  );

CREATE INDEX IF NOT EXISTS idx_workflow_transitions_definition ON workflow_transitions(workflow_definition_id);
CREATE INDEX IF NOT EXISTS idx_workflow_transitions_from ON workflow_transitions(from_step_id);
CREATE INDEX IF NOT EXISTS idx_workflow_transitions_to ON workflow_transitions(to_step_id);

-- ===========================================
-- PASO 2: TABLAS DEPENDIENTES DE WORKFLOW
-- ===========================================

-- workflow_runs (depends on workflow_definitions)
CREATE TABLE IF NOT EXISTS workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  workflow_definition_id UUID REFERENCES workflow_definitions(id) ON DELETE SET NULL,
  matter_id UUID REFERENCES matters(id) ON DELETE CASCADE,
  current_step_id UUID REFERENCES workflow_steps(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'paused', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workflow_runs_org_isolation" ON workflow_runs;
CREATE POLICY "workflow_runs_org_isolation" ON workflow_runs
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_workflow_runs_org ON workflow_runs(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_matter ON workflow_runs(matter_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_status ON workflow_runs(status);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_definition ON workflow_runs(workflow_definition_id);

-- ===========================================
-- PASO 3: TABLAS DE COMUNICACIONES
-- ===========================================

-- email_messages
CREATE TABLE IF NOT EXISTS email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
  account_id UUID REFERENCES crm_accounts(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  communication_id UUID REFERENCES communications(id) ON DELETE SET NULL,
  
  message_id TEXT,
  thread_id TEXT,
  in_reply_to TEXT,
  
  direction TEXT CHECK (direction IN ('inbound', 'outbound')) NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_emails TEXT[] NOT NULL DEFAULT '{}',
  cc_emails TEXT[] DEFAULT '{}',
  bcc_emails TEXT[] DEFAULT '{}',
  reply_to TEXT,
  
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  
  has_attachments BOOLEAN DEFAULT FALSE,
  attachments JSONB DEFAULT '[]',
  
  status TEXT DEFAULT 'sent' CHECK (status IN ('draft', 'queued', 'sending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed', 'spam')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  auto_routed BOOLEAN DEFAULT FALSE,
  routing_confidence DECIMAL(3,2),
  routing_reason TEXT,
  reference_stamp TEXT,
  
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_messages_org_isolation" ON email_messages;
CREATE POLICY "email_messages_org_isolation" ON email_messages
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_email_messages_org ON email_messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_matter ON email_messages(matter_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_thread ON email_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_status ON email_messages(status);
CREATE INDEX IF NOT EXISTS idx_email_messages_created ON email_messages(created_at DESC);

-- call_logs
CREATE TABLE IF NOT EXISTS call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
  account_id UUID REFERENCES crm_accounts(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  communication_id UUID REFERENCES communications(id) ON DELETE SET NULL,
  
  direction TEXT CHECK (direction IN ('inbound', 'outbound')) NOT NULL,
  phone_number TEXT,
  contact_name TEXT,
  
  started_at TIMESTAMPTZ NOT NULL,
  answered_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  ring_duration_seconds INTEGER,
  
  outcome TEXT CHECK (outcome IN ('answered', 'no_answer', 'busy', 'voicemail', 'failed', 'cancelled')) DEFAULT 'answered',
  disposition TEXT,
  
  notes TEXT,
  summary TEXT,
  
  recording_url TEXT,
  recording_duration_seconds INTEGER,
  transcription TEXT,
  
  ai_summary TEXT,
  ai_sentiment TEXT,
  ai_action_items JSONB DEFAULT '[]',
  ai_topics JSONB DEFAULT '[]',
  
  voip_call_id TEXT,
  voip_provider TEXT,
  
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "call_logs_org_isolation" ON call_logs;
CREATE POLICY "call_logs_org_isolation" ON call_logs
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_call_logs_org ON call_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_matter ON call_logs(matter_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_contact ON call_logs(contact_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_started ON call_logs(started_at DESC);

-- email_configs
CREATE TABLE IF NOT EXISTS email_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  
  provider TEXT CHECK (provider IN ('smtp', 'gmail', 'outlook', 'sendgrid', 'resend', 'mailgun')) NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 587,
  smtp_user TEXT,
  smtp_password_encrypted TEXT,
  smtp_secure BOOLEAN DEFAULT TRUE,
  
  oauth_client_id TEXT,
  oauth_client_secret_encrypted TEXT,
  oauth_access_token_encrypted TEXT,
  oauth_refresh_token_encrypted TEXT,
  oauth_expires_at TIMESTAMPTZ,
  
  api_key_encrypted TEXT,
  api_endpoint TEXT,
  
  default_from_name TEXT,
  default_from_email TEXT,
  default_reply_to TEXT,
  
  email_signature_html TEXT,
  email_signature_text TEXT,
  
  track_opens BOOLEAN DEFAULT TRUE,
  track_clicks BOOLEAN DEFAULT TRUE,
  auto_bcc TEXT,
  
  last_test_at TIMESTAMPTZ,
  last_test_success BOOLEAN,
  last_test_error TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, provider)
);

ALTER TABLE email_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_configs_org_isolation" ON email_configs;
CREATE POLICY "email_configs_org_isolation" ON email_configs
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_email_configs_org ON email_configs(organization_id);

-- ===========================================
-- PASO 4: TABLAS DEL PORTAL
-- ===========================================

-- portal_access_tokens
CREATE TABLE IF NOT EXISTS portal_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE CASCADE NOT NULL,
  
  token_hash TEXT NOT NULL,
  token_preview TEXT,
  
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES users(id) ON DELETE SET NULL,
  revocation_reason TEXT,
  
  last_used_at TIMESTAMPTZ,
  use_count INTEGER DEFAULT 0,
  last_ip_address TEXT,
  last_user_agent TEXT,
  
  allowed_matter_ids UUID[] DEFAULT '{}',
  permissions JSONB DEFAULT '{"view_matters": true, "view_documents": true, "download_documents": true, "upload_documents": false, "view_timeline": true, "view_invoices": false, "send_messages": true}',
  
  name TEXT,
  description TEXT,
  
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE portal_access_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "portal_access_tokens_org_isolation" ON portal_access_tokens;
CREATE POLICY "portal_access_tokens_org_isolation" ON portal_access_tokens
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_portal_tokens_org ON portal_access_tokens(organization_id);
CREATE INDEX IF NOT EXISTS idx_portal_tokens_contact ON portal_access_tokens(contact_id);
CREATE INDEX IF NOT EXISTS idx_portal_tokens_hash ON portal_access_tokens(token_hash);

-- portal_file_access_log
CREATE TABLE IF NOT EXISTS portal_file_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  portal_token_id UUID REFERENCES portal_access_tokens(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  
  document_id UUID,
  matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
  file_name TEXT,
  file_path TEXT,
  file_size_bytes BIGINT,
  
  action TEXT CHECK (action IN ('view', 'download', 'upload', 'preview')) NOT NULL,
  
  ip_address TEXT,
  user_agent TEXT,
  geo_location JSONB,
  
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE portal_file_access_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "portal_file_access_log_org_isolation" ON portal_file_access_log;
CREATE POLICY "portal_file_access_log_org_isolation" ON portal_file_access_log
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_portal_file_log_org ON portal_file_access_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_portal_file_log_contact ON portal_file_access_log(contact_id);
CREATE INDEX IF NOT EXISTS idx_portal_file_log_accessed ON portal_file_access_log(accessed_at DESC);

-- portal_configurations
CREATE TABLE IF NOT EXISTS portal_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  is_enabled BOOLEAN DEFAULT FALSE,
  
  portal_name TEXT,
  portal_subdomain TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#64748b',
  
  welcome_message TEXT,
  footer_text TEXT,
  custom_css TEXT,
  
  allow_document_upload BOOLEAN DEFAULT FALSE,
  allow_messaging BOOLEAN DEFAULT TRUE,
  show_timeline BOOLEAN DEFAULT TRUE,
  show_invoices BOOLEAN DEFAULT FALSE,
  show_deadlines BOOLEAN DEFAULT TRUE,
  
  max_upload_size_mb INTEGER DEFAULT 25,
  allowed_file_types TEXT[] DEFAULT ARRAY['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
  
  token_expiry_days INTEGER DEFAULT 30,
  require_email_verification BOOLEAN DEFAULT TRUE,
  
  notify_on_access BOOLEAN DEFAULT TRUE,
  notify_on_upload BOOLEAN DEFAULT TRUE,
  notify_on_message BOOLEAN DEFAULT TRUE,
  notification_emails TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE portal_configurations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "portal_configurations_org_isolation" ON portal_configurations;
CREATE POLICY "portal_configurations_org_isolation" ON portal_configurations
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- ===========================================
-- PASO 5: TABLAS DE CONFIGURACIÓN
-- ===========================================

-- matter_type_configs
CREATE TABLE IF NOT EXISTS matter_type_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name_es TEXT NOT NULL,
  name_en TEXT,
  category TEXT CHECK (category IN ('trademark', 'patent', 'design', 'domain', 'copyright', 'litigation', 'other')) NOT NULL,
  icon TEXT,
  color TEXT,
  default_workflow_id UUID REFERENCES workflow_definitions(id) ON DELETE SET NULL,
  is_system BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique constraint that handles NULL organization_id for system types
CREATE UNIQUE INDEX IF NOT EXISTS idx_matter_type_configs_unique 
ON matter_type_configs (COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'), code);

ALTER TABLE matter_type_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "matter_type_configs_read" ON matter_type_configs;
CREATE POLICY "matter_type_configs_read" ON matter_type_configs
  FOR SELECT USING (
    is_system = true OR 
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "matter_type_configs_write" ON matter_type_configs;
CREATE POLICY "matter_type_configs_write" ON matter_type_configs
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM memberships WHERE user_id = auth.uid())
  );

-- nice_classes
CREATE TABLE IF NOT EXISTS nice_classes (
  id SERIAL PRIMARY KEY,
  class_number INTEGER UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('products', 'services')),
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_es TEXT,
  description_en TEXT,
  keywords_es TEXT[],
  keywords_en TEXT[],
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- invoice_sequences
CREATE TABLE IF NOT EXISTS invoice_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  prefix TEXT DEFAULT 'FAC',
  suffix TEXT,
  year INTEGER NOT NULL,
  last_number INTEGER DEFAULT 0,
  format TEXT DEFAULT '{prefix}-{year}-{number:05d}',
  reset_yearly BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, prefix, year)
);

ALTER TABLE invoice_sequences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invoice_sequences_org_isolation" ON invoice_sequences;
CREATE POLICY "invoice_sequences_org_isolation" ON invoice_sequences
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- ===========================================
-- PASO 6: INSERTAR DATOS DE CONFIGURACIÓN
-- ===========================================

-- Insert standard PI workflow definition
INSERT INTO workflow_definitions (id, organization_id, code, name, description, is_system, is_active)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  NULL,
  'PI_STANDARD',
  'Workflow Estándar PI',
  'Flujo de trabajo de 10 fases para expedientes de Propiedad Intelectual',
  true,
  true
)
ON CONFLICT (id) DO NOTHING;

-- Insert workflow steps (F0-F9)
INSERT INTO workflow_steps (id, workflow_definition_id, code, name, description, order_index, color, icon, is_initial, is_final) VALUES
('b0000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000001', 'F0', 'Apertura', 'Recepción del encargo y apertura del expediente', 0, '#6366f1', 'folder-plus', true, false),
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'F1', 'Encargo', 'Confirmación del encargo y presupuesto aceptado', 1, '#8b5cf6', 'file-signature', false, false),
('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'F2', 'Estrategia', 'Definición de estrategia y búsqueda de anterioridades', 2, '#a855f7', 'target', false, false),
('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'F3', 'Inputs', 'Recopilación de documentación e información necesaria', 3, '#d946ef', 'inbox', false, false),
('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'F4', 'Preparación', 'Preparación y redacción de la solicitud', 4, '#ec4899', 'edit-3', false, false),
('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'F5', 'Aprobación', 'Revisión y aprobación del cliente', 5, '#f43f5e', 'check-circle', false, false),
('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'F6', 'Ejecución', 'Presentación ante la oficina correspondiente', 6, '#f97316', 'send', false, false),
('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'F7', 'Tramitación', 'Seguimiento del procedimiento oficial', 7, '#eab308', 'clock', false, false),
('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'F8', 'Resolución', 'Resolución del expediente (concesión/denegación)', 8, '#84cc16', 'award', false, false),
('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'F9', 'Post-servicio', 'Mantenimiento, vigilancia y renovaciones', 9, '#22c55e', 'refresh-cw', false, true)
ON CONFLICT (workflow_definition_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon;

-- Insert workflow transitions
INSERT INTO workflow_transitions (workflow_definition_id, from_step_id, to_step_id, name, requires_approval) VALUES
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000000', 'b0000000-0000-0000-0000-000000000001', 'Confirmar encargo', false),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'Iniciar estrategia', false),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'Solicitar inputs', false),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004', 'Comenzar preparación', false),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000005', 'Enviar a aprobación', true),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000006', 'Aprobar y ejecutar', true),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000004', 'Solicitar cambios', false),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000007', 'En tramitación', false),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000008', 'Resolver expediente', false),
('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000009', 'Pasar a post-servicio', false)
ON CONFLICT (workflow_definition_id, from_step_id, to_step_id) DO NOTHING;

-- Insert system matter types
INSERT INTO matter_type_configs (organization_id, code, name_es, name_en, category, icon, color, is_system, sort_order) VALUES
(NULL, 'TM_NAT', 'Marca Nacional', 'National Trademark', 'trademark', 'trademark', '#3b82f6', true, 1),
(NULL, 'TM_EU', 'Marca Unión Europea', 'EU Trademark', 'trademark', 'globe', '#1d4ed8', true, 2),
(NULL, 'TM_INT', 'Marca Internacional (Madrid)', 'International Trademark (Madrid)', 'trademark', 'world', '#7c3aed', true, 3),
(NULL, 'PT_NAT', 'Patente Nacional', 'National Patent', 'patent', 'file-text', '#059669', true, 10),
(NULL, 'PT_EU', 'Patente Europea (EPO)', 'European Patent (EPO)', 'patent', 'globe', '#047857', true, 11),
(NULL, 'PT_PCT', 'Patente Internacional (PCT)', 'International Patent (PCT)', 'patent', 'world', '#0d9488', true, 12),
(NULL, 'UM', 'Modelo de Utilidad', 'Utility Model', 'patent', 'tool', '#0891b2', true, 13),
(NULL, 'DS_NAT', 'Diseño Industrial Nacional', 'National Industrial Design', 'design', 'palette', '#c026d3', true, 20),
(NULL, 'DS_EU', 'Diseño Comunitario (RCD)', 'Community Design (RCD)', 'design', 'globe', '#a21caf', true, 21),
(NULL, 'DS_INT', 'Diseño Internacional (La Haya)', 'International Design (Hague)', 'design', 'world', '#86198f', true, 22),
(NULL, 'DOM', 'Nombre de Dominio', 'Domain Name', 'domain', 'globe', '#64748b', true, 30),
(NULL, 'NC', 'Nombre Comercial', 'Trade Name', 'trademark', 'building', '#475569', true, 31),
(NULL, 'OPO', 'Oposición', 'Opposition', 'litigation', 'shield', '#dc2626', true, 40),
(NULL, 'NUL', 'Nulidad', 'Nullity', 'litigation', 'x-circle', '#b91c1c', true, 41),
(NULL, 'VIG', 'Vigilancia de Marcas', 'Trademark Watch', 'other', 'eye', '#f59e0b', true, 50),
(NULL, 'REN', 'Renovación', 'Renewal', 'other', 'refresh-cw', '#22c55e', true, 51),
(NULL, 'LIC', 'Licencia/Cesión', 'License/Assignment', 'other', 'file-signature', '#6366f1', true, 52),
(NULL, 'CON', 'Consulta/Informe', 'Consultation/Report', 'other', 'file-search', '#8b5cf6', true, 53)
ON CONFLICT DO NOTHING;

-- Insert all 45 Nice classes
INSERT INTO nice_classes (class_number, type, title_es, title_en, description_es, icon, color) VALUES
(1, 'products', 'Productos químicos', 'Chemicals', 'Productos químicos para la industria, la ciencia y la fotografía', 'flask', '#6366f1'),
(2, 'products', 'Pinturas y barnices', 'Paints', 'Pinturas, barnices, lacas; productos antioxidantes', 'paint-bucket', '#8b5cf6'),
(3, 'products', 'Cosméticos y productos de limpieza', 'Cosmetics and cleaning', 'Cosméticos y preparaciones de tocador no medicinales', 'sparkles', '#ec4899'),
(4, 'products', 'Aceites y combustibles industriales', 'Industrial oils and fuels', 'Aceites y grasas para uso industrial; lubricantes', 'droplet', '#f59e0b'),
(5, 'products', 'Productos farmacéuticos', 'Pharmaceuticals', 'Productos farmacéuticos, preparaciones medicinales y veterinarias', 'pill', '#10b981'),
(6, 'products', 'Metales comunes', 'Common metals', 'Metales comunes y sus aleaciones, minerales metalíferos', 'box', '#6b7280'),
(7, 'products', 'Máquinas y máquinas herramientas', 'Machines and machine tools', 'Máquinas, máquinas herramientas, herramientas motorizadas', 'cog', '#3b82f6'),
(8, 'products', 'Herramientas e instrumentos manuales', 'Hand tools', 'Herramientas e instrumentos de mano accionados manualmente', 'wrench', '#64748b'),
(9, 'products', 'Aparatos e instrumentos científicos', 'Scientific apparatus', 'Aparatos e instrumentos científicos, de investigación, de navegación', 'cpu', '#0ea5e9'),
(10, 'products', 'Aparatos e instrumentos médicos', 'Medical apparatus', 'Aparatos e instrumentos quirúrgicos, médicos y veterinarios', 'stethoscope', '#14b8a6'),
(11, 'products', 'Aparatos de alumbrado y calefacción', 'Lighting and heating', 'Aparatos e instalaciones de alumbrado, calefacción, producción de vapor', 'lightbulb', '#eab308'),
(12, 'products', 'Vehículos', 'Vehicles', 'Vehículos; aparatos de locomoción terrestre, aérea o acuática', 'car', '#ef4444'),
(13, 'products', 'Armas de fuego', 'Firearms', 'Armas de fuego; municiones y proyectiles; explosivos', 'target', '#991b1b'),
(14, 'products', 'Metales preciosos y joyería', 'Precious metals and jewelry', 'Metales preciosos y sus aleaciones; artículos de joyería', 'gem', '#a855f7'),
(15, 'products', 'Instrumentos musicales', 'Musical instruments', 'Instrumentos musicales; atriles para partituras', 'music', '#f97316'),
(16, 'products', 'Papel y artículos de papelería', 'Paper and stationery', 'Papel y cartón; productos de imprenta', 'file-text', '#84cc16'),
(17, 'products', 'Caucho y materias plásticas', 'Rubber and plastics', 'Caucho, gutapercha, goma, amianto, mica', 'layers', '#78716c'),
(18, 'products', 'Cuero y artículos de cuero', 'Leather goods', 'Cuero y cuero de imitación; pieles de animales', 'briefcase', '#92400e'),
(19, 'products', 'Materiales de construcción', 'Building materials', 'Materiales de construcción no metálicos', 'building', '#57534e'),
(20, 'products', 'Muebles y artículos del hogar', 'Furniture', 'Muebles, espejos, marcos', 'armchair', '#a16207'),
(21, 'products', 'Utensilios y recipientes para uso doméstico', 'Household utensils', 'Utensilios y recipientes para uso doméstico y culinario', 'utensils', '#0891b2'),
(22, 'products', 'Cuerdas y productos de cordelería', 'Ropes', 'Cuerdas y cordeles; redes; tiendas de campaña', 'anchor', '#65a30d'),
(23, 'products', 'Hilos para uso textil', 'Yarns', 'Hilos para uso textil', 'scissors', '#d946ef'),
(24, 'products', 'Tejidos y productos textiles', 'Textiles', 'Tejidos y sus sustitutos; ropa de hogar', 'shirt', '#c026d3'),
(25, 'products', 'Prendas de vestir y calzado', 'Clothing', 'Prendas de vestir, calzado, artículos de sombrerería', 'shopping-bag', '#2563eb'),
(26, 'products', 'Encajes y bordados', 'Lace and embroidery', 'Encajes, trencillas y bordados; cintas y cordones', 'scissors', '#db2777'),
(27, 'products', 'Alfombras y revestimientos de suelos', 'Carpets', 'Alfombras, felpudos, esteras; tapices murales no textiles', 'square', '#9333ea'),
(28, 'products', 'Juegos y juguetes', 'Games and toys', 'Juegos y juguetes; artículos de gimnasia y deporte', 'gamepad-2', '#16a34a'),
(29, 'products', 'Carne, pescado y productos lácteos', 'Meat, fish and dairy', 'Carne, pescado, carne de ave y carne de caza', 'beef', '#dc2626'),
(30, 'products', 'Café, té y productos de pastelería', 'Coffee, tea and pastry', 'Café, té, cacao y sucedáneos del café', 'coffee', '#ca8a04'),
(31, 'products', 'Frutas y verduras frescas', 'Fresh fruits and vegetables', 'Productos agrícolas, acuícolas, hortícolas y forestales en bruto', 'apple', '#22c55e'),
(32, 'products', 'Cerveza y bebidas no alcohólicas', 'Beer and non-alcoholic drinks', 'Cerveza y productos de cervecería; bebidas sin alcohol', 'beer', '#06b6d4'),
(33, 'products', 'Bebidas alcohólicas', 'Alcoholic beverages', 'Bebidas alcohólicas, excepto cervezas; preparaciones alcohólicas', 'wine', '#7c3aed'),
(34, 'products', 'Tabaco y artículos para fumadores', 'Tobacco', 'Tabaco y sucedáneos del tabaco; cigarrillos', 'cigarette', '#78716c'),
(35, 'services', 'Publicidad y gestión de negocios', 'Advertising and business', 'Publicidad; gestión, organización y administración de negocios', 'megaphone', '#f43f5e'),
(36, 'services', 'Seguros y servicios financieros', 'Insurance and finance', 'Servicios de seguros; operaciones financieras y monetarias', 'landmark', '#0d9488'),
(37, 'services', 'Servicios de construcción', 'Construction services', 'Servicios de construcción; servicios de instalación y reparación', 'hammer', '#ea580c'),
(38, 'services', 'Telecomunicaciones', 'Telecommunications', 'Telecomunicaciones', 'radio', '#8b5cf6'),
(39, 'services', 'Transporte y almacenaje', 'Transport and storage', 'Transporte; embalaje y almacenamiento de mercancías', 'truck', '#0284c7'),
(40, 'services', 'Tratamiento de materiales', 'Material treatment', 'Tratamiento de materiales; reciclaje de residuos', 'recycle', '#059669'),
(41, 'services', 'Educación y entretenimiento', 'Education and entertainment', 'Educación; formación; servicios de entretenimiento', 'graduation-cap', '#7c3aed'),
(42, 'services', 'Servicios científicos y tecnológicos', 'Scientific and technological services', 'Servicios científicos y tecnológicos; diseño y desarrollo de software', 'flask-conical', '#2563eb'),
(43, 'services', 'Servicios de restauración', 'Food and drink services', 'Servicios de restauración; alojamiento temporal', 'utensils-crossed', '#e11d48'),
(44, 'services', 'Servicios médicos', 'Medical services', 'Servicios médicos; servicios veterinarios', 'heart-pulse', '#10b981'),
(45, 'services', 'Servicios jurídicos', 'Legal services', 'Servicios jurídicos; servicios de seguridad', 'scale', '#1e40af')
ON CONFLICT (class_number) DO UPDATE SET
  title_es = EXCLUDED.title_es,
  title_en = EXCLUDED.title_en,
  description_es = EXCLUDED.description_es,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- Initialize invoice sequences for existing organizations
INSERT INTO invoice_sequences (organization_id, prefix, year, last_number)
SELECT id, 'FAC', EXTRACT(YEAR FROM NOW())::INTEGER, 0
FROM organizations
ON CONFLICT (organization_id, prefix, year) DO NOTHING;

-- Initialize portal configurations for existing organizations
INSERT INTO portal_configurations (organization_id, is_enabled, portal_name)
SELECT id, false, name || ' - Portal Cliente'
FROM organizations
ON CONFLICT (organization_id) DO NOTHING;

-- ===========================================
-- PASO 7: FUNCIÓN PARA NÚMERO DE FACTURA
-- ===========================================

CREATE OR REPLACE FUNCTION get_next_invoice_number(p_org_id UUID, p_prefix TEXT DEFAULT 'FAC')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year INTEGER;
  v_next_number INTEGER;
  v_invoice_number TEXT;
BEGIN
  v_year := EXTRACT(YEAR FROM NOW())::INTEGER;
  
  INSERT INTO invoice_sequences (organization_id, prefix, year, last_number)
  VALUES (p_org_id, p_prefix, v_year, 0)
  ON CONFLICT (organization_id, prefix, year) DO NOTHING;
  
  UPDATE invoice_sequences
  SET last_number = last_number + 1, updated_at = NOW()
  WHERE organization_id = p_org_id AND prefix = p_prefix AND year = v_year
  RETURNING last_number INTO v_next_number;
  
  v_invoice_number := p_prefix || '-' || v_year || '-' || LPAD(v_next_number::TEXT, 5, '0');
  
  RETURN v_invoice_number;
END;
$$;

GRANT EXECUTE ON FUNCTION get_next_invoice_number(UUID, TEXT) TO authenticated;