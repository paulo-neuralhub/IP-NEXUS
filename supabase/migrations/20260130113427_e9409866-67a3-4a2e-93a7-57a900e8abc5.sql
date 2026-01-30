-- Añadir campos para formatos de numeración
ALTER TABLE tenant_document_settings ADD COLUMN IF NOT EXISTS
  document_number_format TEXT DEFAULT 'PREFIX-YYYY-SEQ';

ALTER TABLE tenant_document_settings ADD COLUMN IF NOT EXISTS
  document_number_prefix TEXT DEFAULT 'DOC';

ALTER TABLE tenant_document_settings ADD COLUMN IF NOT EXISTS
  document_sequence_by_type BOOLEAN DEFAULT false;

-- Tabla de secuencias por tipo de documento
CREATE TABLE IF NOT EXISTS document_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  document_type TEXT, -- NULL para secuencia global, o 'contrato', 'carta', etc.
  year INTEGER NOT NULL,
  last_number INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, document_type, year)
);

-- Enable RLS
ALTER TABLE document_sequences ENABLE ROW LEVEL SECURITY;

-- RLS policies for document_sequences
CREATE POLICY "Users can view their organization's sequences"
  ON document_sequences FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their organization's sequences"
  ON document_sequences FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM memberships WHERE user_id = auth.uid()
  ));

-- Función para obtener siguiente número
CREATE OR REPLACE FUNCTION get_next_document_number(
  p_organization_id UUID,
  p_document_type TEXT DEFAULT NULL,
  p_format TEXT DEFAULT 'PREFIX-YYYY-SEQ'
) RETURNS TEXT AS $$
DECLARE
  v_year INTEGER := EXTRACT(YEAR FROM NOW());
  v_sequence INTEGER;
  v_prefix TEXT;
  v_result TEXT;
BEGIN
  -- Obtener o crear secuencia
  INSERT INTO document_sequences (organization_id, document_type, year, last_number)
  VALUES (p_organization_id, p_document_type, v_year, 0)
  ON CONFLICT (organization_id, document_type, year) DO NOTHING;
  
  -- Incrementar y obtener número
  UPDATE document_sequences
  SET last_number = last_number + 1, updated_at = NOW()
  WHERE organization_id = p_organization_id
    AND (document_type IS NOT DISTINCT FROM p_document_type)
    AND year = v_year
  RETURNING last_number INTO v_sequence;
  
  -- Obtener prefijo de configuración
  SELECT COALESCE(document_number_prefix, 'DOC')
  INTO v_prefix
  FROM tenant_document_settings
  WHERE organization_id = p_organization_id;
  
  -- Si no se encontró prefix, usar default
  IF v_prefix IS NULL THEN
    v_prefix := 'DOC';
  END IF;
  
  -- Formatear según el formato elegido
  CASE p_format
    WHEN 'PREFIX-YYYY-SEQ' THEN
      v_result := v_prefix || '-' || v_year || '-' || LPAD(v_sequence::TEXT, 4, '0');
    WHEN 'PREFIX-YYMM-SEQ' THEN
      v_result := v_prefix || '-' || TO_CHAR(NOW(), 'YYMM') || '-' || LPAD(v_sequence::TEXT, 4, '0');
    WHEN 'TYPE-YYYY-SEQ' THEN
      v_result := UPPER(COALESCE(p_document_type, 'DOC')) || '-' || v_year || '-' || LPAD(v_sequence::TEXT, 4, '0');
    WHEN 'YYYY/SEQ' THEN
      v_result := v_year || '/' || LPAD(v_sequence::TEXT, 5, '0');
    ELSE
      v_result := v_prefix || '-' || v_year || '-' || LPAD(v_sequence::TEXT, 4, '0');
  END CASE;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;