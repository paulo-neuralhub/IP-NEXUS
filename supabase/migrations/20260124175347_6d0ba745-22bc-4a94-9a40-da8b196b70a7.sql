-- =============================================
-- RELATIONSHIP TYPES CATALOG TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.relationship_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name_es text NOT NULL,
  name_en text NOT NULL,
  category text NOT NULL CHECK (category IN ('legal', 'commercial', 'ip', 'contact')),
  description text,
  requires_document boolean DEFAULT false,
  icon text,
  sort_order integer DEFAULT 100,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.relationship_types ENABLE ROW LEVEL SECURITY;

-- Public read access (reference table)
CREATE POLICY "relationship_types_read" ON public.relationship_types
  FOR SELECT USING (true);

-- Admin only write
CREATE POLICY "relationship_types_admin_write" ON public.relationship_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.user_id = auth.uid() AND m.role = 'owner'
    )
  );

-- =============================================
-- SEED RELATIONSHIP TYPES
-- =============================================

INSERT INTO public.relationship_types (code, name_es, name_en, category, requires_document, icon, sort_order) VALUES
-- LEGALES
('legal_representative', 'Representante Legal', 'Legal Representative', 'legal', true, 'scale', 1),
('power_of_attorney', 'Apoderado', 'Power of Attorney', 'legal', true, 'file-signature', 2),
('administrator', 'Administrador', 'Administrator', 'legal', true, 'user-cog', 3),
('director', 'Director/Consejero', 'Director/Board Member', 'legal', true, 'briefcase', 4),
('secretary', 'Secretario', 'Secretary', 'legal', false, 'clipboard', 5),

-- COMERCIALES
('partner', 'Socio', 'Partner', 'commercial', false, 'handshake', 10),
('shareholder', 'Accionista', 'Shareholder', 'commercial', true, 'pie-chart', 11),
('parent_company', 'Empresa Matriz', 'Parent Company', 'commercial', false, 'building', 12),
('subsidiary', 'Filial', 'Subsidiary', 'commercial', false, 'git-branch', 13),
('franchisee', 'Franquiciado', 'Franchisee', 'commercial', true, 'store', 14),
('licensee', 'Licenciatario', 'Licensee', 'commercial', true, 'key', 15),
('licensor', 'Licenciante', 'Licensor', 'commercial', true, 'award', 16),

-- PI ESPECÍFICOS
('ip_agent', 'Agente de PI', 'IP Agent', 'ip', true, 'shield', 20),
('ip_correspondent', 'Corresponsal PI', 'IP Correspondent', 'ip', true, 'mail', 21),
('inventor', 'Inventor', 'Inventor', 'ip', false, 'lightbulb', 22),
('designer', 'Diseñador', 'Designer', 'ip', false, 'palette', 23),
('applicant', 'Solicitante', 'Applicant', 'ip', false, 'file-text', 24),
('owner', 'Titular', 'Owner', 'ip', false, 'crown', 25),
('opponent', 'Oponente', 'Opponent', 'ip', false, 'alert-triangle', 26),

-- CONTACTOS
('billing_contact', 'Contacto Facturación', 'Billing Contact', 'contact', false, 'credit-card', 30),
('technical_contact', 'Contacto Técnico', 'Technical Contact', 'contact', false, 'wrench', 31),
('notification_contact', 'Contacto Notificaciones', 'Notification Contact', 'contact', false, 'bell', 32),
('primary_contact', 'Contacto Principal', 'Primary Contact', 'contact', false, 'star', 33),
('authorized_signer', 'Firmante Autorizado', 'Authorized Signer', 'contact', true, 'pen-tool', 34),

-- OTROS
('representative', 'Representante', 'Representative', 'legal', false, 'user-check', 50),
('agent', 'Agente', 'Agent', 'commercial', false, 'user', 51),
('contact', 'Contacto', 'Contact', 'contact', false, 'user', 52),
('referral', 'Referido por', 'Referred by', 'commercial', false, 'share-2', 53),
('other', 'Otro', 'Other', 'commercial', false, 'link', 99)

ON CONFLICT (code) DO NOTHING;

-- =============================================
-- EXTEND CLIENT_RELATIONSHIPS TABLE
-- =============================================

-- Add new columns for external entities
ALTER TABLE public.client_relationships 
  ADD COLUMN IF NOT EXISTS related_entity_type text DEFAULT 'client' CHECK (related_entity_type IN ('client', 'contact', 'agent', 'external')),
  ADD COLUMN IF NOT EXISTS external_name text,
  ADD COLUMN IF NOT EXISTS external_email text,
  ADD COLUMN IF NOT EXISTS external_phone text,
  ADD COLUMN IF NOT EXISTS external_company text,
  ADD COLUMN IF NOT EXISTS role_description text,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Make related_client_id nullable for external entities
ALTER TABLE public.client_relationships 
  ALTER COLUMN related_client_id DROP NOT NULL;

-- Add constraint to ensure either related_client_id or external fields are filled
ALTER TABLE public.client_relationships DROP CONSTRAINT IF EXISTS check_related_entity;
ALTER TABLE public.client_relationships ADD CONSTRAINT check_related_entity 
  CHECK (
    (related_entity_type = 'client' AND related_client_id IS NOT NULL) OR
    (related_entity_type = 'external' AND external_name IS NOT NULL) OR
    (related_entity_type IN ('contact', 'agent') AND related_client_id IS NOT NULL)
  );

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_client_relationships_client_id ON public.client_relationships(client_id);
CREATE INDEX IF NOT EXISTS idx_client_relationships_related_client_id ON public.client_relationships(related_client_id);
CREATE INDEX IF NOT EXISTS idx_client_relationships_type ON public.client_relationships(relationship_type);

-- =============================================
-- TRIGGER: Ensure only one primary per type per client
-- =============================================

CREATE OR REPLACE FUNCTION ensure_single_primary_relationship()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    -- Unset other primaries of same type for this client
    UPDATE public.client_relationships
    SET is_primary = false
    WHERE client_id = NEW.client_id
      AND relationship_type = NEW.relationship_type
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND is_primary = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_ensure_single_primary_relationship ON public.client_relationships;
CREATE TRIGGER trg_ensure_single_primary_relationship
  BEFORE INSERT OR UPDATE ON public.client_relationships
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_primary_relationship();