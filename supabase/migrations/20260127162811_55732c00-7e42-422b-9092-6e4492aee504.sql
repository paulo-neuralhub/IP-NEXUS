-- =============================================
-- FASE 1-A COMPLEMENTO: Completar Sistema de Numeración
-- =============================================

-- 1. Añadir tipos de expediente faltantes
INSERT INTO matter_types (code, name_en, name_es, icon, color, sort_order, is_active) VALUES
('PCT', 'PCT Application', 'Solicitud PCT', 'Globe', '#3B82F6', 12, true),
('MD', 'Madrid Protocol', 'Protocolo Madrid', 'Globe', '#6366F1', 13, true),
('RN', 'Renewal', 'Renovación', 'RefreshCw', '#10B981', 14, true),
('SR', 'Search', 'Búsqueda', 'Search', '#0EA5E9', 15, true),
('GN', 'General', 'General', 'Folder', '#6B7280', 16, true)
ON CONFLICT (code) DO NOTHING;

-- 2. Añadir columna client_token_generated_at si no existe
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS client_token_generated_at TIMESTAMPTZ;

-- 3. Crear índice único para token por organización (si no existe)
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_org_token 
ON contacts(organization_id, client_token) WHERE client_token IS NOT NULL;

-- 4. Actualizar función generate_client_token con mejor manejo
CREATE OR REPLACE FUNCTION public.generate_client_token(p_organization_id UUID)
RETURNS VARCHAR(3)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_charset VARCHAR := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_token VARCHAR(3);
  v_attempts INTEGER := 0;
BEGIN
  LOOP
    v_token := '';
    FOR i IN 1..3 LOOP
      v_token := v_token || substr(v_charset, floor(random() * 32 + 1)::int, 1);
    END LOOP;
    
    IF NOT EXISTS (
      SELECT 1 FROM contacts 
      WHERE organization_id = p_organization_id 
      AND client_token = v_token
    ) THEN
      RETURN v_token;
    END IF;
    
    v_attempts := v_attempts + 1;
    IF v_attempts >= 100 THEN
      RAISE EXCEPTION 'No se pudo generar token único después de 100 intentos';
    END IF;
  END LOOP;
END;
$$;

-- 5. Trigger para asignar token automáticamente
CREATE OR REPLACE FUNCTION public.assign_client_token()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.client_token IS NULL AND NEW.organization_id IS NOT NULL THEN
    NEW.client_token := public.generate_client_token(NEW.organization_id);
    NEW.client_token_generated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_client_token ON contacts;
CREATE TRIGGER trg_assign_client_token
  BEFORE INSERT ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_client_token();

-- 6. Generar tokens para contactos existentes sin token
UPDATE contacts SET 
  client_token = public.generate_client_token(organization_id),
  client_token_generated_at = NOW()
WHERE client_token IS NULL AND organization_id IS NOT NULL;

-- 7. Función: Validar Número de Expediente
CREATE OR REPLACE FUNCTION public.validate_matter_number(p_matter_number VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parts TEXT[];
  v_check_received VARCHAR(2);
  v_base VARCHAR;
  v_check_calculated VARCHAR(2);
BEGIN
  v_parts := string_to_array(p_matter_number, '-');
  
  IF array_length(v_parts, 1) < 6 THEN
    RETURN FALSE;
  END IF;
  
  v_check_received := v_parts[array_length(v_parts, 1)];
  v_base := array_to_string(v_parts[1:array_length(v_parts, 1)-1], '-');
  v_check_calculated := public.calculate_check_digit(v_base);
  
  RETURN v_check_received = v_check_calculated;
END;
$$;

-- 8. Función: Preview del número (sin consumir secuencia)
CREATE OR REPLACE FUNCTION public.preview_matter_number(
  p_organization_id UUID,
  p_type_code VARCHAR,
  p_jurisdiction_code VARCHAR,
  p_client_id UUID DEFAULT NULL
)
RETURNS VARCHAR
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client_token VARCHAR(3) := 'XXX';
  v_sequence_key VARCHAR;
  v_next_seq INTEGER;
  v_date_part VARCHAR;
  v_base VARCHAR;
  v_check VARCHAR(2);
BEGIN
  IF p_client_id IS NOT NULL THEN
    SELECT COALESCE(client_token, 'XXX') INTO v_client_token 
    FROM contacts 
    WHERE id = p_client_id;
  END IF;
  
  v_sequence_key := p_type_code || ':' || p_jurisdiction_code || ':' || EXTRACT(YEAR FROM NOW())::TEXT;
  
  SELECT COALESCE(last_value, 0) + 1 INTO v_next_seq
  FROM matter_sequences 
  WHERE organization_id = p_organization_id AND sequence_key = v_sequence_key;
  
  IF v_next_seq IS NULL THEN
    v_next_seq := 1;
  END IF;
  
  v_date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  v_base := p_type_code || '-' || p_jurisdiction_code || '-' || v_date_part || '-' || 
            v_client_token || '-' || LPAD(v_next_seq::TEXT, 4, '0');
  v_check := public.calculate_check_digit(v_base);
  
  RETURN v_base || '-' || v_check;
END;
$$;

-- 9. Actualizar función principal generate_matter_number
CREATE OR REPLACE FUNCTION public.generate_matter_number(
  p_organization_id UUID,
  p_type_code VARCHAR,
  p_jurisdiction_code VARCHAR,
  p_client_id UUID DEFAULT NULL
)
RETURNS VARCHAR
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client_token VARCHAR(3) := 'XXX';
  v_sequence_key VARCHAR;
  v_seq_value INTEGER;
  v_date_part VARCHAR;
  v_base VARCHAR;
  v_check VARCHAR(2);
BEGIN
  IF p_client_id IS NOT NULL THEN
    SELECT client_token INTO v_client_token 
    FROM contacts 
    WHERE id = p_client_id;
    
    IF v_client_token IS NULL THEN
      v_client_token := public.generate_client_token(p_organization_id);
      UPDATE contacts SET 
        client_token = v_client_token,
        client_token_generated_at = NOW()
      WHERE id = p_client_id;
    END IF;
  END IF;
  
  v_sequence_key := p_type_code || ':' || p_jurisdiction_code || ':' || EXTRACT(YEAR FROM NOW())::TEXT;
  
  INSERT INTO matter_sequences (organization_id, sequence_key, last_value, updated_at)
  VALUES (p_organization_id, v_sequence_key, 1, NOW())
  ON CONFLICT (organization_id, sequence_key) DO UPDATE
  SET last_value = matter_sequences.last_value + 1, 
      updated_at = NOW()
  RETURNING last_value INTO v_seq_value;
  
  v_date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  v_base := p_type_code || '-' || p_jurisdiction_code || '-' || v_date_part || '-' || 
            v_client_token || '-' || LPAD(v_seq_value::TEXT, 4, '0');
  v_check := public.calculate_check_digit(v_base);
  
  RETURN v_base || '-' || v_check;
END;
$$;