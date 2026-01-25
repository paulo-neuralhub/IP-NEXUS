-- =====================================================
-- IP OFFICES CONNECTION SYSTEM
-- Extend existing tables and create complementary ones
-- =====================================================

-- Add new columns to existing ipo_offices table
ALTER TABLE public.ipo_offices 
  ADD COLUMN IF NOT EXISTS data_source_type VARCHAR(20) DEFAULT 'api',
  ADD COLUMN IF NOT EXISTS api_base_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS api_version VARCHAR(20),
  ADD COLUMN IF NOT EXISTS auth_type VARCHAR(20),
  ADD COLUMN IF NOT EXISTS api_credentials JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS data_source_config JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS supports_search BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS supports_status BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS supports_documents BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS supports_events BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS supports_fees BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS rate_limit_per_minute INTEGER DEFAULT 60,
  ADD COLUMN IF NOT EXISTS rate_limit_per_day INTEGER DEFAULT 5000,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS operational_status VARCHAR(20) DEFAULT 'operational',
  ADD COLUMN IF NOT EXISTS last_health_check TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS avg_response_time_ms INTEGER,
  ADD COLUMN IF NOT EXISTS product_id UUID,
  ADD COLUMN IF NOT EXISTS fees_url VARCHAR(500);

-- Add office_id to existing official_fees if needed
ALTER TABLE public.official_fees
  ADD COLUMN IF NOT EXISTS office_id UUID;

-- Mapeo de estados por oficina (new table)
CREATE TABLE IF NOT EXISTS public.office_status_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_code VARCHAR(20) NOT NULL,
  office_status VARCHAR(100) NOT NULL,
  normalized_status VARCHAR(50) NOT NULL,
  status_category VARCHAR(20),
  description_es VARCHAR(500),
  description_en VARCHAR(500),
  creates_deadline BOOLEAN DEFAULT false,
  deadline_type_code VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(office_code, office_status)
);

-- Historial cambios de tasas (new table)
CREATE TABLE IF NOT EXISTS public.official_fees_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_id UUID NOT NULL REFERENCES public.official_fees(id) ON DELETE CASCADE,
  previous_amount DECIMAL(12,2),
  new_amount DECIMAL(12,2),
  changed_at TIMESTAMPTZ DEFAULT now(),
  changed_by UUID,
  change_reason TEXT
);

-- Log de requests a oficinas (new table)
CREATE TABLE IF NOT EXISTS public.office_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  office_code VARCHAR(20) NOT NULL,
  matter_id UUID REFERENCES public.matters(id) ON DELETE SET NULL,
  endpoint VARCHAR(500),
  method VARCHAR(10),
  request_params JSONB,
  status_code INTEGER,
  response_size_bytes INTEGER,
  response_summary JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  billable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Documentos descargados de oficinas (new table)
CREATE TABLE IF NOT EXISTS public.office_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  matter_id UUID NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
  office_code VARCHAR(20) NOT NULL,
  office_doc_id VARCHAR(100),
  office_doc_type VARCHAR(100),
  office_doc_date DATE,
  title VARCHAR(500),
  description TEXT,
  file_path VARCHAR(500),
  file_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  download_status VARCHAR(20) DEFAULT 'pending',
  downloaded_at TIMESTAMPTZ,
  error_message TEXT,
  office_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create unique constraint on office_documents
CREATE UNIQUE INDEX IF NOT EXISTS idx_office_docs_unique 
  ON public.office_documents(tenant_id, office_code, office_doc_id) 
  WHERE office_doc_id IS NOT NULL;

-- Caché de consultas (new table)
CREATE TABLE IF NOT EXISTS public.office_query_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_code VARCHAR(20) NOT NULL,
  query_type VARCHAR(20),
  query_key VARCHAR(500) NOT NULL,
  query_params JSONB,
  response_data JSONB,
  cached_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  UNIQUE(office_code, query_type, query_key)
);

-- Config sync por tenant (new table)
CREATE TABLE IF NOT EXISTS public.tenant_sync_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  sync_status BOOLEAN DEFAULT true,
  sync_documents BOOLEAN DEFAULT true,
  auto_create_deadlines BOOLEAN DEFAULT true,
  notify_on_status_change BOOLEAN DEFAULT true,
  notify_on_new_document BOOLEAN DEFAULT true,
  notification_email VARCHAR(255),
  sync_matter_types TEXT[] DEFAULT '{}',
  sync_matter_statuses TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Historial sync (new table)
CREATE TABLE IF NOT EXISTS public.sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  sync_type VARCHAR(20),
  triggered_by VARCHAR(100),
  status VARCHAR(20),
  matters_checked INTEGER DEFAULT 0,
  matters_updated INTEGER DEFAULT 0,
  documents_downloaded INTEGER DEFAULT 0,
  deadlines_created INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  details JSONB DEFAULT '{}',
  errors JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Importaciones de archivo (new table)
CREATE TABLE IF NOT EXISTS public.office_file_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  office_code VARCHAR(20) NOT NULL,
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  file_type VARCHAR(10),
  file_size INTEGER,
  import_status VARCHAR(20) DEFAULT 'pending',
  processing_method VARCHAR(20),
  records_found INTEGER DEFAULT 0,
  records_imported INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  requires_review BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ
);

-- Cola revisión manual (new table)
CREATE TABLE IF NOT EXISTS public.office_import_review_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID NOT NULL REFERENCES public.office_file_imports(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  matter_id UUID REFERENCES public.matters(id) ON DELETE SET NULL,
  extracted_data JSONB DEFAULT '{}',
  confidence_score DECIMAL(5,2),
  current_data JSONB DEFAULT '{}',
  fields_to_review TEXT[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending',
  final_data JSONB,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Plantillas importación (new table)
CREATE TABLE IF NOT EXISTS public.office_import_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_code VARCHAR(20) NOT NULL,
  file_type VARCHAR(10),
  template_name VARCHAR(200),
  description TEXT,
  column_mappings JSONB DEFAULT '{}',
  validations JSONB DEFAULT '{}',
  template_file_url VARCHAR(500),
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_office_status_mappings_code ON public.office_status_mappings(office_code);
CREATE INDEX IF NOT EXISTS idx_office_request_logs_tenant ON public.office_request_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_office_request_logs_office ON public.office_request_logs(office_code);
CREATE INDEX IF NOT EXISTS idx_office_documents_tenant ON public.office_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_office_documents_matter ON public.office_documents(matter_id);
CREATE INDEX IF NOT EXISTS idx_office_query_cache_expires ON public.office_query_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_sync_history_tenant ON public.sync_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_office_file_imports_tenant ON public.office_file_imports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_office_import_review_status ON public.office_import_review_queue(status);

-- Enable RLS
ALTER TABLE public.office_status_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.official_fees_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_query_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_sync_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_file_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_import_review_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_import_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view status mappings" ON public.office_status_mappings FOR SELECT USING (true);
CREATE POLICY "Anyone can view templates" ON public.office_import_templates FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can read cache" ON public.office_query_cache FOR SELECT USING (true);

CREATE POLICY "Tenant request logs" ON public.office_request_logs FOR SELECT 
  USING (tenant_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()));

CREATE POLICY "Tenant office documents" ON public.office_documents FOR ALL 
  USING (tenant_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()));

CREATE POLICY "Tenant sync config" ON public.tenant_sync_config FOR ALL 
  USING (tenant_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()));

CREATE POLICY "Tenant sync history" ON public.sync_history FOR SELECT 
  USING (tenant_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()));

CREATE POLICY "Tenant file imports" ON public.office_file_imports FOR ALL 
  USING (tenant_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()));

CREATE POLICY "Tenant review queue" ON public.office_import_review_queue FOR ALL 
  USING (tenant_id IN (SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()));

CREATE POLICY "Admin fees history" ON public.official_fees_history FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.memberships m WHERE m.user_id = auth.uid() AND m.role IN ('owner', 'admin')));

-- Seed status mappings for EUIPO
INSERT INTO public.office_status_mappings (office_code, office_status, normalized_status, status_category, creates_deadline, deadline_type_code) VALUES
('EM', 'Application received', 'filed', 'pending', false, NULL),
('EM', 'Under examination', 'examination', 'pending', false, NULL),
('EM', 'Application published', 'published', 'active', true, 'TM_OPPOSITION_DEADLINE'),
('EM', 'Opposition pending', 'opposition', 'active', true, 'TM_OPPOSITION_RESPONSE'),
('EM', 'Registered', 'registered', 'granted', true, 'TM_RENEWAL'),
('EM', 'Refused', 'refused', 'refused', false, NULL),
('EM', 'Withdrawn', 'withdrawn', 'refused', false, NULL),
('EM', 'Expired', 'expired', 'expired', false, NULL),
('EM', 'Invalidity pending', 'invalidity', 'active', true, 'GEN_OFFICE_ACTION')
ON CONFLICT (office_code, office_status) DO NOTHING;

-- Seed status mappings for OEPM (ES)
INSERT INTO public.office_status_mappings (office_code, office_status, normalized_status, status_category, creates_deadline, deadline_type_code) VALUES
('ES', 'Solicitud presentada', 'filed', 'pending', false, NULL),
('ES', 'En examen', 'examination', 'pending', false, NULL),
('ES', 'Suspendida', 'suspended', 'pending', true, 'GEN_OFFICE_ACTION'),
('ES', 'Publicada', 'published', 'active', true, 'TM_OPPOSITION_DEADLINE'),
('ES', 'Concedida', 'registered', 'granted', true, 'TM_RENEWAL'),
('ES', 'Denegada', 'refused', 'refused', false, NULL),
('ES', 'Caducada', 'expired', 'expired', false, NULL),
('ES', 'Renunciada', 'withdrawn', 'refused', false, NULL)
ON CONFLICT (office_code, office_status) DO NOTHING;

-- Seed status mappings for USPTO
INSERT INTO public.office_status_mappings (office_code, office_status, normalized_status, status_category, creates_deadline, deadline_type_code) VALUES
('US', 'NEW APPLICATION', 'filed', 'pending', false, NULL),
('US', 'NON-FINAL ACTION', 'examination', 'pending', true, 'TM_FILING_RESPONSE'),
('US', 'FINAL ACTION', 'examination', 'pending', true, 'TM_FILING_RESPONSE'),
('US', 'PUBLISHED FOR OPPOSITION', 'published', 'active', true, 'TM_OPPOSITION_DEADLINE'),
('US', 'REGISTERED', 'registered', 'granted', true, 'TM_DECLARATION_OF_USE'),
('US', 'CANCELLED', 'cancelled', 'expired', false, NULL),
('US', 'ABANDONED', 'withdrawn', 'refused', false, NULL)
ON CONFLICT (office_code, office_status) DO NOTHING;

-- Update existing ipo_offices with API config
UPDATE public.ipo_offices SET
  data_source_type = 'api',
  api_base_url = 'https://euipo.europa.eu/eSearchCLW/api',
  auth_type = 'none',
  supports_search = true,
  supports_status = true,
  supports_documents = true,
  is_active = true,
  fees_url = 'https://euipo.europa.eu/ohimportal/es/fees-payable-direct'
WHERE code = 'EM';

UPDATE public.ipo_offices SET
  data_source_type = 'scraping',
  api_base_url = 'https://consultas2.oepm.es/LocalizadorWeb',
  auth_type = 'scraping',
  supports_search = true,
  supports_status = true,
  is_active = true,
  fees_url = 'https://www.oepm.es/es/propiedad_industrial/tasas/'
WHERE code = 'ES';

UPDATE public.ipo_offices SET
  data_source_type = 'api',
  api_base_url = 'https://developer.uspto.gov/api',
  auth_type = 'api_key',
  supports_search = true,
  supports_status = true,
  supports_documents = true,
  supports_fees = true,
  is_active = true,
  fees_url = 'https://www.uspto.gov/trademark/fees-payment-information'
WHERE code = 'US';