-- ════════════════════════════════════════════════════════════════════════════
-- TABLA: matter_relationships
-- Propósito: Relaciones entre expedientes (familias, divisionales, etc.)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE matter_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- EXPEDIENTES RELACIONADOS
  source_matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  target_matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  
  -- Tipo de relación
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'family', 'series', 'associated',
    'divisional', 'continuation', 'continuation_in_part', 'parent',
    'basic_mark', 'designation', 'national_phase', 'validation', 'conversion',
    'opposition', 'cancellation', 'appeal', 'litigation',
    'renewal', 'prior_registration',
    'related', 'conflicting'
  )),
  
  -- METADATOS
  is_bidirectional BOOLEAN DEFAULT false,
  inverse_relationship_type TEXT,
  relationship_date DATE,
  effective_from DATE,
  effective_until DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated', 'pending')),
  notes TEXT,
  relationship_data JSONB DEFAULT '{}',
  
  -- AUDITORÍA
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  CONSTRAINT no_self_reference CHECK (source_matter_id != target_matter_id),
  CONSTRAINT unique_relationship UNIQUE (source_matter_id, target_matter_id, relationship_type)
);

-- ÍNDICES
CREATE INDEX idx_mr_source ON matter_relationships(source_matter_id);
CREATE INDEX idx_mr_target ON matter_relationships(target_matter_id);
CREATE INDEX idx_mr_type ON matter_relationships(relationship_type);
CREATE INDEX idx_mr_status ON matter_relationships(status) WHERE status = 'active';
CREATE INDEX idx_mr_source_type ON matter_relationships(source_matter_id, relationship_type);

-- TRIGGER UPDATED_AT
CREATE OR REPLACE FUNCTION update_matter_relationships_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_mr_updated BEFORE UPDATE ON matter_relationships
FOR EACH ROW EXECUTE FUNCTION update_matter_relationships_timestamp();

-- RLS
ALTER TABLE matter_relationships ENABLE ROW LEVEL SECURITY;

-- Políticas usando memberships en lugar de profiles
CREATE POLICY "mr_select_policy" ON matter_relationships
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM matters m 
    WHERE (m.id = source_matter_id OR m.id = target_matter_id)
    AND m.organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "mr_insert_policy" ON matter_relationships
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM matters m 
    WHERE m.id = source_matter_id
    AND m.organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "mr_update_policy" ON matter_relationships
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM matters m 
    WHERE m.id = source_matter_id
    AND m.organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "mr_delete_policy" ON matter_relationships
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM matters m 
    WHERE m.id = source_matter_id
    AND m.organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  )
);

-- FUNCIÓN: Crear relación inversa automáticamente
CREATE OR REPLACE FUNCTION create_inverse_relationship()
RETURNS TRIGGER AS $$
DECLARE
  inverse_type TEXT;
BEGIN
  IF NEW.is_bidirectional = true THEN
    inverse_type := NEW.relationship_type;
  ELSIF NEW.inverse_relationship_type IS NOT NULL THEN
    inverse_type := NEW.inverse_relationship_type;
  ELSE
    inverse_type := CASE NEW.relationship_type
      WHEN 'parent' THEN 'divisional'
      WHEN 'divisional' THEN 'parent'
      WHEN 'continuation' THEN 'parent'
      WHEN 'continuation_in_part' THEN 'parent'
      WHEN 'basic_mark' THEN 'designation'
      WHEN 'designation' THEN 'basic_mark'
      WHEN 'national_phase' THEN 'parent'
      ELSE NULL
    END;
  END IF;
  
  IF inverse_type IS NOT NULL THEN
    INSERT INTO matter_relationships (
      source_matter_id, target_matter_id, relationship_type,
      is_bidirectional, relationship_date, status, notes, created_by
    ) VALUES (
      NEW.target_matter_id, NEW.source_matter_id, inverse_type,
      NEW.is_bidirectional, NEW.relationship_date, NEW.status, 
      'Auto-created inverse of ' || NEW.id, NEW.created_by
    )
    ON CONFLICT (source_matter_id, target_matter_id, relationship_type) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_create_inverse 
AFTER INSERT ON matter_relationships
FOR EACH ROW EXECUTE FUNCTION create_inverse_relationship();

-- Comentarios
COMMENT ON TABLE matter_relationships IS 'Relaciones entre expedientes: familias, divisionales, PCT, Madrid, etc.';
COMMENT ON COLUMN matter_relationships.relationship_type IS 'Tipo: family, divisional, continuation, basic_mark, designation, national_phase, validation, etc.';