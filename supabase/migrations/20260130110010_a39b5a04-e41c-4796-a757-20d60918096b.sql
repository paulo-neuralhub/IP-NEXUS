-- ============================================================
-- L111: Sistema de Generación de Documentos Profesionales
-- Tablas de configuración, estilos y templates
-- ============================================================

-- 1. Tabla de Estilos de Documento (referencia del sistema)
CREATE TABLE IF NOT EXISTS document_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  preview_image_url TEXT,
  css_variables JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar los 6 estilos predefinidos
INSERT INTO document_styles (code, name, description, css_variables) VALUES
('minimalista', 'Minimalista Clásico', 'Limpio y profesional, ideal para documentos oficiales', 
  '{"primary": "#1a1a1a", "secondary": "#666666", "accent": "#000000", "background": "#ffffff", "headerBg": "#ffffff", "footerBg": "#f5f5f5"}'::jsonb),
('corporativo', 'Corporativo Azul', 'Profesional con acentos azules, ideal para contratos', 
  '{"primary": "#1e3a5f", "secondary": "#3b82f6", "accent": "#2563eb", "background": "#ffffff", "headerBg": "#1e3a5f", "footerBg": "#f0f4f8"}'::jsonb),
('elegante', 'Elegante Dorado', 'Sofisticado con tonos beige y dorado, ideal para despachos boutique', 
  '{"primary": "#2c2c2c", "secondary": "#8b7355", "accent": "#c9a961", "background": "#fffdf9", "headerBg": "#f5f0e8", "footerBg": "#f5f0e8"}'::jsonb),
('dark', 'Dark Professional', 'Moderno con header oscuro, ideal para informes', 
  '{"primary": "#0f172a", "secondary": "#334155", "accent": "#6366f1", "background": "#ffffff", "headerBg": "#0f172a", "footerBg": "#1e293b"}'::jsonb),
('creativo', 'Creativo Colorido', 'Dinámico con formas orgánicas, ideal para agencias', 
  '{"primary": "#7c3aed", "secondary": "#ec4899", "accent": "#06b6d4", "background": "#fefefe", "headerBg": "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)", "footerBg": "#f5f3ff"}'::jsonb),
('dinamico', 'Dinámico Moderno', 'Contemporáneo con franjas diagonales, ideal para tech', 
  '{"primary": "#059669", "secondary": "#10b981", "accent": "#34d399", "background": "#ffffff", "headerBg": "#059669", "footerBg": "#ecfdf5"}'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- 2. Configuración de Documentos por Tenant
CREATE TABLE IF NOT EXISTS tenant_document_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Estilo por defecto
  default_style_code TEXT DEFAULT 'corporativo',
  
  -- Logo
  logo_url TEXT,
  logo_position TEXT DEFAULT 'left' CHECK (logo_position IN ('left', 'center', 'right')),
  logo_max_height INTEGER DEFAULT 50,
  
  -- Colores personalizados (si null, usa los del estilo)
  custom_primary_color TEXT,
  custom_secondary_color TEXT,
  custom_accent_color TEXT,
  custom_background_color TEXT,
  custom_text_color TEXT,
  
  -- Tipografías personalizadas
  custom_title_font TEXT,
  custom_body_font TEXT,
  
  -- Información de la empresa (para header)
  company_name TEXT,
  company_address TEXT,
  company_city TEXT,
  company_postal_code TEXT,
  company_country TEXT,
  company_phone TEXT,
  company_email TEXT,
  company_website TEXT,
  company_cif TEXT,
  
  -- Datos bancarios
  bank_name TEXT,
  bank_iban TEXT,
  bank_swift TEXT,
  bank_account_holder TEXT,
  
  -- Textos personalizados
  custom_header_text TEXT,
  custom_footer_text TEXT,
  confidentiality_notice TEXT DEFAULT 'Este documento es confidencial y está destinado únicamente al destinatario indicado.',
  
  -- Configuración de facturación
  default_tax_rate DECIMAL(5,2) DEFAULT 21.00,
  default_payment_terms TEXT DEFAULT '30 días',
  invoice_prefix TEXT DEFAULT 'FAC',
  invoice_next_number INTEGER DEFAULT 1,
  
  -- Configuración de numeración
  document_prefix TEXT DEFAULT 'DOC',
  document_next_number INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id)
);

-- RLS para tenant_document_settings
ALTER TABLE tenant_document_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org doc settings" ON tenant_document_settings
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage doc settings" ON tenant_document_settings
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- 3. Añadir columnas faltantes a document_templates si no existen
DO $$ 
BEGIN
  -- category
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'document_templates' AND column_name = 'category') THEN
    ALTER TABLE document_templates ADD COLUMN category TEXT DEFAULT 'general';
  END IF;
  
  -- preferred_style_code
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'document_templates' AND column_name = 'preferred_style_code') THEN
    ALTER TABLE document_templates ADD COLUMN preferred_style_code TEXT DEFAULT 'corporativo';
  END IF;
  
  -- content_html
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'document_templates' AND column_name = 'content_html') THEN
    ALTER TABLE document_templates ADD COLUMN content_html TEXT;
  END IF;
  
  -- sections
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'document_templates' AND column_name = 'sections') THEN
    ALTER TABLE document_templates ADD COLUMN sections JSONB DEFAULT '[]';
  END IF;
  
  -- is_system_template
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'document_templates' AND column_name = 'is_system_template') THEN
    ALTER TABLE document_templates ADD COLUMN is_system_template BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 4. Añadir columnas faltantes a generated_documents si no existen
DO $$ 
BEGIN
  -- document_number
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_documents' AND column_name = 'document_number') THEN
    ALTER TABLE generated_documents ADD COLUMN document_number TEXT;
  END IF;
  
  -- title
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_documents' AND column_name = 'title') THEN
    ALTER TABLE generated_documents ADD COLUMN title TEXT;
  END IF;
  
  -- category
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_documents' AND column_name = 'category') THEN
    ALTER TABLE generated_documents ADD COLUMN category TEXT DEFAULT 'general';
  END IF;
  
  -- style_code
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_documents' AND column_name = 'style_code') THEN
    ALTER TABLE generated_documents ADD COLUMN style_code TEXT DEFAULT 'corporativo';
  END IF;
  
  -- content_html
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_documents' AND column_name = 'content_html') THEN
    ALTER TABLE generated_documents ADD COLUMN content_html TEXT;
  END IF;
  
  -- content_json
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_documents' AND column_name = 'content_json') THEN
    ALTER TABLE generated_documents ADD COLUMN content_json JSONB;
  END IF;
  
  -- pdf_url
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_documents' AND column_name = 'pdf_url') THEN
    ALTER TABLE generated_documents ADD COLUMN pdf_url TEXT;
  END IF;
  
  -- sent_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_documents' AND column_name = 'sent_at') THEN
    ALTER TABLE generated_documents ADD COLUMN sent_at TIMESTAMPTZ;
  END IF;
  
  -- sent_to
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_documents' AND column_name = 'sent_to') THEN
    ALTER TABLE generated_documents ADD COLUMN sent_to TEXT;
  END IF;
  
  -- version
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_documents' AND column_name = 'version') THEN
    ALTER TABLE generated_documents ADD COLUMN version INTEGER DEFAULT 1;
  END IF;
  
  -- parent_document_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_documents' AND column_name = 'parent_document_id') THEN
    ALTER TABLE generated_documents ADD COLUMN parent_document_id UUID REFERENCES generated_documents(id);
  END IF;
  
  -- client_id (si falta)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'generated_documents' AND column_name = 'client_id') THEN
    ALTER TABLE generated_documents ADD COLUMN client_id UUID REFERENCES contacts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 5. Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_generated_documents_org ON generated_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_matter ON generated_documents(matter_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_style ON generated_documents(style_code);
CREATE INDEX IF NOT EXISTS idx_tenant_doc_settings_org ON tenant_document_settings(organization_id);

-- 6. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_tenant_document_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tenant_document_settings_updated_at ON tenant_document_settings;
CREATE TRIGGER trigger_tenant_document_settings_updated_at
  BEFORE UPDATE ON tenant_document_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_tenant_document_settings_updated_at();