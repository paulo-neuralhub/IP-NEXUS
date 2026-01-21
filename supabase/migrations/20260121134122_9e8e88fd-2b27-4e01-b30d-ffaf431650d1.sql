-- =============================================
-- P63: WHITE-LABELING - Organization Branding (Fixed)
-- =============================================

-- Verificar si la tabla existe (puede haber quedado parcialmente creada)
DROP TABLE IF EXISTS organization_branding CASCADE;

-- Crear tabla de branding
CREATE TABLE organization_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  
  -- Logo
  logo_url TEXT,
  logo_dark_url TEXT,
  favicon_url TEXT,
  
  -- Colores principales
  primary_color TEXT DEFAULT '#6366f1',
  secondary_color TEXT DEFAULT '#f1f5f9',
  accent_color TEXT DEFAULT '#8b5cf6',
  
  -- Colores adicionales (JSONB)
  colors JSONB DEFAULT '{
    "primary": "#6366f1",
    "primary_foreground": "#ffffff",
    "secondary": "#f1f5f9",
    "secondary_foreground": "#0f172a",
    "accent": "#8b5cf6",
    "accent_foreground": "#ffffff",
    "destructive": "#ef4444",
    "muted": "#f1f5f9",
    "muted_foreground": "#64748b",
    "border": "#e2e8f0",
    "ring": "#6366f1"
  }'::jsonb,
  
  -- Tipografía
  font_family TEXT DEFAULT 'Inter',
  heading_font_family TEXT,
  
  -- Meta tags
  app_name TEXT,
  meta_title TEXT,
  meta_description TEXT,
  
  -- Powered by
  show_powered_by BOOLEAN DEFAULT true,
  
  -- Dominio personalizado
  custom_domain TEXT,
  custom_domain_verified BOOLEAN DEFAULT false,
  custom_domain_ssl_status TEXT CHECK (custom_domain_ssl_status IN ('pending', 'active', 'failed')),
  domain_verification_token TEXT,
  
  -- Email personalizado (SMTP)
  custom_email_domain TEXT,
  custom_email_from_name TEXT,
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 587,
  smtp_user TEXT,
  smtp_password_encrypted TEXT,
  smtp_verified BOOLEAN DEFAULT false,
  smtp_last_test_at TIMESTAMPTZ,
  
  -- Portal de cliente
  portal_logo_url TEXT,
  portal_primary_color TEXT,
  portal_background_url TEXT,
  portal_welcome_message TEXT,
  
  -- Plan
  plan_allows_white_label BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_org_branding_org ON organization_branding(organization_id);
CREATE INDEX idx_org_branding_domain ON organization_branding(custom_domain) 
  WHERE custom_domain IS NOT NULL;

-- RLS
ALTER TABLE organization_branding ENABLE ROW LEVEL SECURITY;

-- Política de lectura: cualquier miembro de la org puede ver
CREATE POLICY "branding_view_policy" ON organization_branding
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- Política de gestión: solo owners y admins
CREATE POLICY "branding_manage_policy" ON organization_branding
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_organization_branding_updated_at
  BEFORE UPDATE ON organization_branding
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket para branding assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding',
  'branding',
  true,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp', 'image/x-icon']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies para branding
CREATE POLICY "branding_storage_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'branding' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM organizations WHERE id IN (
        SELECT organization_id FROM memberships 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

CREATE POLICY "branding_storage_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'branding');

CREATE POLICY "branding_storage_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'branding' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM organizations WHERE id IN (
        SELECT organization_id FROM memberships 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- Habilitar realtime para cambios de branding
ALTER PUBLICATION supabase_realtime ADD TABLE organization_branding;