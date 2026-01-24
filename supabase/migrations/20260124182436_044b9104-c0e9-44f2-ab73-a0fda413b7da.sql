-- ============================================
-- Matter Parties - Partes de expediente
-- ============================================

-- Table for party roles catalog
CREATE TABLE IF NOT EXISTS public.party_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name_es text NOT NULL,
  name_en text NOT NULL,
  category text NOT NULL CHECK (category IN ('ownership', 'creation', 'representation', 'other')),
  applies_to text[] DEFAULT ARRAY['trademark', 'patent', 'design', 'domain', 'copyright', 'other'],
  icon text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Insert party roles
INSERT INTO public.party_roles (code, name_es, name_en, category, applies_to, icon, sort_order) VALUES
-- Ownership
('owner', 'Titular', 'Owner', 'ownership', ARRAY['trademark', 'patent', 'design', 'domain', 'copyright', 'other'], 'crown', 1),
('applicant', 'Solicitante', 'Applicant', 'ownership', ARRAY['trademark', 'patent', 'design'], 'file-text', 2),
('co_owner', 'Co-titular', 'Co-owner', 'ownership', ARRAY['trademark', 'patent', 'design', 'copyright'], 'users', 3),
('licensee', 'Licenciatario', 'Licensee', 'ownership', ARRAY['trademark', 'patent', 'design', 'copyright'], 'key', 4),

-- Creation (patents/designs)
('inventor', 'Inventor', 'Inventor', 'creation', ARRAY['patent'], 'lightbulb', 10),
('designer', 'Diseñador', 'Designer', 'creation', ARRAY['design'], 'palette', 11),
('author', 'Autor', 'Author', 'creation', ARRAY['copyright'], 'pen-tool', 12),

-- Representation
('representative', 'Representante', 'Representative', 'representation', ARRAY['trademark', 'patent', 'design', 'domain', 'copyright', 'other'], 'user-check', 20),
('ip_agent', 'Agente PI', 'IP Agent', 'representation', ARRAY['trademark', 'patent', 'design'], 'briefcase', 21),
('correspondent', 'Corresponsal', 'Correspondent', 'representation', ARRAY['trademark', 'patent', 'design'], 'globe', 22),
('legal_representative', 'Representante Legal', 'Legal Representative', 'representation', ARRAY['trademark', 'patent', 'design', 'domain', 'copyright', 'other'], 'scale', 23),

-- Other
('opponent', 'Oponente', 'Opponent', 'other', ARRAY['trademark', 'patent', 'design'], 'alert-triangle', 30),
('interested_party', 'Parte Interesada', 'Interested Party', 'other', ARRAY['trademark', 'patent', 'design', 'domain', 'copyright', 'other'], 'eye', 31)
ON CONFLICT (code) DO NOTHING;

-- Main matter_parties table
CREATE TABLE IF NOT EXISTS public.matter_parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  matter_id uuid NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
  party_role text NOT NULL,
  
  -- Source tracking
  source_type text NOT NULL DEFAULT 'manual' CHECK (source_type IN ('client', 'relationship', 'contact', 'manual')),
  source_relationship_id uuid REFERENCES public.client_relationships(id) ON DELETE SET NULL,
  
  -- Entity references (one of these should be set based on source_type)
  client_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  
  -- External party data (for manual entries)
  external_name text,
  external_address text,
  external_country text,
  external_email text,
  external_phone text,
  
  -- Additional fields
  percentage numeric(5,2) CHECK (percentage >= 0 AND percentage <= 100),
  is_primary boolean DEFAULT false,
  jurisdiction text,
  notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES public.users(id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_matter_parties_matter ON public.matter_parties(matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_parties_org ON public.matter_parties(organization_id);
CREATE INDEX IF NOT EXISTS idx_matter_parties_source_rel ON public.matter_parties(source_relationship_id);

-- RLS
ALTER TABLE public.party_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matter_parties ENABLE ROW LEVEL SECURITY;

-- Party roles are readable by all authenticated users
CREATE POLICY "party_roles_read" ON public.party_roles
  FOR SELECT TO authenticated USING (true);

-- Matter parties policies
CREATE POLICY "matter_parties_select" ON public.matter_parties
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "matter_parties_insert" ON public.matter_parties
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "matter_parties_update" ON public.matter_parties
  FOR UPDATE TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "matter_parties_delete" ON public.matter_parties
  FOR DELETE TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_matter_parties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_matter_parties_updated_at ON public.matter_parties;
CREATE TRIGGER trigger_update_matter_parties_updated_at
  BEFORE UPDATE ON public.matter_parties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_matter_parties_updated_at();

-- Trigger to ensure only one primary per role per matter
CREATE OR REPLACE FUNCTION public.ensure_single_primary_party()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE public.matter_parties
    SET is_primary = false
    WHERE matter_id = NEW.matter_id
      AND party_role = NEW.party_role
      AND id != NEW.id
      AND is_primary = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ensure_single_primary_party ON public.matter_parties;
CREATE TRIGGER trigger_ensure_single_primary_party
  BEFORE INSERT OR UPDATE ON public.matter_parties
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_primary_party();

-- Mapping from relationship_type to party_role
CREATE TABLE IF NOT EXISTS public.relationship_to_party_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_type text NOT NULL,
  party_role text NOT NULL,
  auto_import boolean DEFAULT true
);

INSERT INTO public.relationship_to_party_mapping (relationship_type, party_role, auto_import) VALUES
('legal_representative', 'legal_representative', true),
('power_of_attorney', 'representative', true),
('ip_agent', 'ip_agent', true),
('ip_correspondent', 'correspondent', true),
('inventor', 'inventor', true),
('designer', 'designer', true),
('applicant', 'applicant', true),
('owner', 'owner', true),
('licensee', 'licensee', false)
ON CONFLICT DO NOTHING;