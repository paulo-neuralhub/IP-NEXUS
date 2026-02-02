
-- =====================================================
-- PROMPT 26: SISTEMA DE CLIENTES, TITULARES Y PARTES
-- =====================================================

-- =====================================================
-- 1. MODIFICAR crm_accounts - Añadir campos para agentes
-- =====================================================

-- Tipo de cliente (agente, directo, despacho, corporación)
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS 
  account_type TEXT DEFAULT 'direct' 
  CHECK (account_type IN ('direct', 'agent', 'law_firm', 'corporation'));

-- Número de licencia/colegiado para agentes
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS 
  agent_license_number TEXT;

-- Jurisdicciones donde opera el agente
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS 
  agent_jurisdictions TEXT[];

-- Referencia padre (para subsidiarias)
ALTER TABLE crm_accounts ADD COLUMN IF NOT EXISTS 
  parent_account_id UUID REFERENCES crm_accounts(id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_crm_accounts_type ON crm_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_crm_accounts_parent ON crm_accounts(parent_account_id);

-- =====================================================
-- 2. TABLA HOLDERS - Titulares de derechos de PI
-- =====================================================
CREATE TABLE IF NOT EXISTS holders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identificación
  code TEXT, -- Código interno: HOL-0001
  
  -- Tipo de titular
  holder_type TEXT NOT NULL DEFAULT 'company' 
    CHECK (holder_type IN ('individual', 'company', 'government', 'organization', 'trust')),
  
  -- Datos de empresa/organización
  legal_name TEXT NOT NULL,
  trade_name TEXT,
  
  -- Datos para persona física
  first_name TEXT,
  last_name TEXT,
  
  -- Identificación fiscal
  tax_id TEXT,
  tax_id_type TEXT, -- NIF, CIF, VAT, EIN, PASSPORT
  tax_country TEXT,
  
  -- Dirección principal
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  country TEXT,
  
  -- Dirección para notificaciones (si diferente)
  notification_address JSONB,
  
  -- Contacto
  email TEXT,
  phone TEXT,
  fax TEXT,
  website TEXT,
  
  -- Contacto principal
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  primary_contact_position TEXT,
  
  -- Datos corporativos
  incorporation_country TEXT,
  incorporation_date DATE,
  incorporation_number TEXT,
  
  -- Sector/Industria
  industry TEXT,
  industry_codes TEXT[],
  
  -- Idioma preferido
  preferred_language TEXT DEFAULT 'es',
  
  -- Notas
  notes TEXT,
  internal_notes TEXT,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- Constraints
  UNIQUE(organization_id, code)
);

-- Índices para holders
CREATE INDEX idx_holders_org ON holders(organization_id);
CREATE INDEX idx_holders_legal_name ON holders(legal_name);
CREATE INDEX idx_holders_tax_id ON holders(tax_id);
CREATE INDEX idx_holders_country ON holders(country);
CREATE INDEX idx_holders_active ON holders(is_active) WHERE is_active = true;

-- Búsqueda full-text
CREATE INDEX idx_holders_search ON holders USING gin(
  to_tsvector('spanish', coalesce(legal_name, '') || ' ' || coalesce(trade_name, '') || ' ' || coalesce(tax_id, ''))
);

-- RLS para holders
ALTER TABLE holders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view holders in their organization"
  ON holders FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert holders in their organization"
  ON holders FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update holders in their organization"
  ON holders FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete holders in their organization"
  ON holders FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

-- =====================================================
-- 3. TABLA CLIENT_HOLDERS - Relación N:N Cliente-Titular
-- =====================================================
CREATE TABLE IF NOT EXISTS client_holders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Relación
  account_id UUID NOT NULL REFERENCES crm_accounts(id) ON DELETE CASCADE,
  holder_id UUID NOT NULL REFERENCES holders(id) ON DELETE CASCADE,
  
  -- Tipo de relación
  relationship_type TEXT NOT NULL DEFAULT 'representation'
    CHECK (relationship_type IN (
      'representation',
      'subsidiary',
      'affiliate',
      'licensor',
      'licensee'
    )),
  
  -- Alcance de la representación
  representation_scope TEXT DEFAULT 'all'
    CHECK (representation_scope IN ('all', 'trademarks', 'patents', 'designs', 'specific')),
  
  -- Jurisdicciones de la representación
  jurisdictions TEXT[],
  
  -- Período de validez
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_to DATE,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  -- Referencia del cliente para este titular
  client_reference TEXT,
  
  -- Notas
  notes TEXT,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- Constraints
  UNIQUE(organization_id, account_id, holder_id, relationship_type)
);

-- Índices para client_holders
CREATE INDEX idx_client_holders_account ON client_holders(account_id);
CREATE INDEX idx_client_holders_holder ON client_holders(holder_id);
CREATE INDEX idx_client_holders_active ON client_holders(is_active) WHERE is_active = true;

-- RLS para client_holders
ALTER TABLE client_holders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view client_holders in their organization"
  ON client_holders FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert client_holders in their organization"
  ON client_holders FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update client_holders in their organization"
  ON client_holders FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete client_holders in their organization"
  ON client_holders FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

-- =====================================================
-- 4. MODIFICAR matter_parties - Añadir campos faltantes
-- =====================================================

-- Añadir referencia a holder
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS 
  holder_id UUID REFERENCES holders(id) ON DELETE SET NULL;

-- Añadir share_percentage si no existe con otro nombre
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS 
  share_percentage DECIMAL(5,2) DEFAULT 100.00;

-- Añadir is_current para histórico
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS 
  is_current BOOLEAN DEFAULT true;

-- Añadir registration_reference
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS 
  registration_reference TEXT;

-- Añadir registration_date
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS 
  registration_date DATE;

-- Añadir supporting_document_id
ALTER TABLE matter_parties ADD COLUMN IF NOT EXISTS 
  supporting_document_id UUID REFERENCES matter_documents(id);

-- Índice para holder_id
CREATE INDEX IF NOT EXISTS idx_matter_parties_holder ON matter_parties(holder_id);
CREATE INDEX IF NOT EXISTS idx_matter_parties_current ON matter_parties(is_current) WHERE is_current = true;

-- =====================================================
-- 5. MODIFICAR matters - Añadir primary_holder_id
-- =====================================================
ALTER TABLE matters ADD COLUMN IF NOT EXISTS 
  primary_holder_id UUID REFERENCES holders(id);

CREATE INDEX IF NOT EXISTS idx_matters_primary_holder ON matters(primary_holder_id);

-- =====================================================
-- 6. FUNCIÓN: Generar código de holder
-- =====================================================
CREATE OR REPLACE FUNCTION generate_holder_code(p_organization_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_next_num INTEGER;
  v_code TEXT;
BEGIN
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(code FROM 5) AS INTEGER)
  ), 0) + 1 INTO v_next_num
  FROM holders
  WHERE organization_id = p_organization_id
    AND code LIKE 'HOL-%';

  v_code := 'HOL-' || LPAD(v_next_num::TEXT, 5, '0');
  RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 7. FUNCIÓN: Obtener titulares actuales de un expediente
-- =====================================================
CREATE OR REPLACE FUNCTION get_matter_current_holders(p_matter_id UUID)
RETURNS TABLE (
  holder_id UUID,
  holder_name TEXT,
  party_role TEXT,
  share_percentage DECIMAL,
  is_primary BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mp.holder_id,
    COALESCE(h.legal_name, mp.external_name) AS holder_name,
    mp.party_role,
    COALESCE(mp.share_percentage, mp.percentage) AS share_percentage,
    mp.is_primary
  FROM matter_parties mp
  LEFT JOIN holders h ON mp.holder_id = h.id
  WHERE mp.matter_id = p_matter_id
    AND mp.is_current = true
    AND mp.party_role IN ('holder', 'co_holder', 'applicant', 'co_applicant')
  ORDER BY mp.is_primary DESC, mp.share_percentage DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 8. FUNCIÓN: Transferir titularidad
-- =====================================================
CREATE OR REPLACE FUNCTION transfer_matter_ownership(
  p_matter_id UUID,
  p_from_holder_id UUID,
  p_to_holder_id UUID,
  p_transfer_date DATE,
  p_registration_reference TEXT DEFAULT NULL,
  p_supporting_document_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_old_share DECIMAL;
  v_org_id UUID;
BEGIN
  -- Obtener organization_id y porcentaje del titular anterior
  SELECT mp.share_percentage, mp.organization_id INTO v_old_share, v_org_id
  FROM matter_parties mp
  WHERE mp.matter_id = p_matter_id
    AND mp.holder_id = p_from_holder_id
    AND mp.party_role IN ('holder', 'co_holder')
    AND mp.is_current = true;

  IF v_old_share IS NULL THEN
    RAISE EXCEPTION 'Holder % is not a current owner of matter %', p_from_holder_id, p_matter_id;
  END IF;

  -- Marcar al titular anterior como no actual
  UPDATE matter_parties
  SET 
    is_current = false,
    effective_to = p_transfer_date,
    updated_at = NOW()
  WHERE matter_id = p_matter_id
    AND holder_id = p_from_holder_id
    AND party_role IN ('holder', 'co_holder')
    AND is_current = true;

  -- Añadir registro del cedente (assignor)
  INSERT INTO matter_parties (
    organization_id, matter_id, holder_id, party_role, share_percentage,
    effective_from, effective_to, is_current,
    supporting_document_id, registration_reference, notes
  )
  VALUES (
    v_org_id, p_matter_id, p_from_holder_id, 'assignor', v_old_share,
    p_transfer_date, p_transfer_date, false,
    p_supporting_document_id, p_registration_reference, p_notes
  );

  -- Añadir registro del cesionario (assignee)
  INSERT INTO matter_parties (
    organization_id, matter_id, holder_id, party_role, share_percentage,
    effective_from, effective_to, is_current,
    supporting_document_id, registration_reference, notes
  )
  VALUES (
    v_org_id, p_matter_id, p_to_holder_id, 'assignee', v_old_share,
    p_transfer_date, p_transfer_date, false,
    p_supporting_document_id, p_registration_reference, p_notes
  );

  -- Crear nuevo registro de titularidad
  INSERT INTO matter_parties (
    organization_id, matter_id, holder_id, party_role, share_percentage,
    is_primary, effective_from, is_current,
    supporting_document_id, registration_reference, registration_date, notes
  )
  VALUES (
    v_org_id, p_matter_id, p_to_holder_id, 'holder', v_old_share,
    true, p_transfer_date, true,
    p_supporting_document_id, p_registration_reference, p_transfer_date, p_notes
  );

  -- Actualizar primary_holder_id en matters
  UPDATE matters SET primary_holder_id = p_to_holder_id, updated_at = NOW()
  WHERE id = p_matter_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 9. TRIGGER: Sincronizar primary_holder_id en matters
-- =====================================================
CREATE OR REPLACE FUNCTION sync_matter_primary_holder()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.party_role = 'holder' AND NEW.is_primary = true AND NEW.is_current = true THEN
    UPDATE matters 
    SET primary_holder_id = NEW.holder_id,
        updated_at = NOW()
    WHERE id = NEW.matter_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_sync_primary_holder ON matter_parties;
CREATE TRIGGER trg_sync_primary_holder
AFTER INSERT OR UPDATE ON matter_parties
FOR EACH ROW EXECUTE FUNCTION sync_matter_primary_holder();

-- =====================================================
-- 10. VISTA: Expedientes con titulares actuales (security_invoker)
-- =====================================================
CREATE OR REPLACE VIEW v_matters_with_holders 
WITH (security_invoker = true) AS
SELECT 
  m.id AS matter_id,
  m.reference,
  m.title,
  m.type AS matter_type,
  m.status,
  a.id AS account_id,
  a.name AS account_name,
  a.account_type,
  h.id AS holder_id,
  h.legal_name AS holder_name,
  h.country AS holder_country,
  mp.party_role,
  COALESCE(mp.share_percentage, mp.percentage) AS share_percentage,
  mp.is_primary,
  mp.effective_from,
  mp.effective_to
FROM matters m
LEFT JOIN crm_accounts a ON m.client_id = a.id
LEFT JOIN matter_parties mp ON m.id = mp.matter_id AND mp.is_current = true
LEFT JOIN holders h ON mp.holder_id = h.id
WHERE m.is_archived IS NOT TRUE;

-- =====================================================
-- 11. VISTA: Histórico de titularidad por expediente
-- =====================================================
CREATE OR REPLACE VIEW v_matter_ownership_history 
WITH (security_invoker = true) AS
SELECT 
  m.id AS matter_id,
  m.reference,
  m.title,
  mp.party_role,
  COALESCE(h.legal_name, mp.external_name) AS party_name,
  COALESCE(mp.share_percentage, mp.percentage) AS share_percentage,
  mp.effective_from,
  mp.effective_to,
  mp.is_current,
  mp.registration_reference,
  mp.registration_date,
  mp.notes
FROM matters m
JOIN matter_parties mp ON m.id = mp.matter_id
LEFT JOIN holders h ON mp.holder_id = h.id
WHERE mp.party_role IN ('holder', 'co_holder', 'previous_holder', 'assignor', 'assignee')
ORDER BY m.id, mp.effective_from DESC;

-- =====================================================
-- 12. VISTA: Titulares de un cliente (agente)
-- =====================================================
CREATE OR REPLACE VIEW v_client_holders_summary 
WITH (security_invoker = true) AS
SELECT 
  a.id AS account_id,
  a.name AS account_name,
  a.account_type,
  h.id AS holder_id,
  h.legal_name AS holder_name,
  h.country AS holder_country,
  ch.relationship_type,
  ch.is_active,
  COUNT(DISTINCT m.id) AS total_matters,
  COUNT(DISTINCT CASE WHEN m.status = 'active' THEN m.id END) AS active_matters
FROM crm_accounts a
JOIN client_holders ch ON a.id = ch.account_id AND ch.is_active = true
JOIN holders h ON ch.holder_id = h.id
LEFT JOIN matter_parties mp ON h.id = mp.holder_id AND mp.is_current = true
LEFT JOIN matters m ON mp.matter_id = m.id
GROUP BY a.id, a.name, a.account_type, h.id, h.legal_name, h.country, ch.relationship_type, ch.is_active;
