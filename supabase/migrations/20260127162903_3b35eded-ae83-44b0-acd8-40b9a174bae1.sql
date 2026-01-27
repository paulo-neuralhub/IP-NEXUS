-- Adaptar funciones al esquema existente de matter_sequences

-- 1. Actualizar preview_matter_number para usar la estructura existente
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
  v_next_seq INTEGER;
  v_date_part VARCHAR;
  v_base VARCHAR;
  v_check VARCHAR(2);
  v_year INTEGER := EXTRACT(YEAR FROM NOW())::INTEGER;
BEGIN
  IF p_client_id IS NOT NULL THEN
    SELECT COALESCE(client_token, 'XXX') INTO v_client_token 
    FROM contacts 
    WHERE id = p_client_id;
  END IF;
  
  -- Obtener próximo valor SIN incrementar (usa last_sequence)
  SELECT COALESCE(last_sequence, 0) + 1 INTO v_next_seq
  FROM matter_sequences 
  WHERE organization_id = p_organization_id 
    AND matter_type = p_type_code 
    AND jurisdiction_code = p_jurisdiction_code
    AND year = v_year;
  
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

-- 2. Actualizar generate_matter_number para usar la estructura existente
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
  v_seq_value INTEGER;
  v_date_part VARCHAR;
  v_base VARCHAR;
  v_check VARCHAR(2);
  v_year INTEGER := EXTRACT(YEAR FROM NOW())::INTEGER;
  v_month INTEGER := EXTRACT(MONTH FROM NOW())::INTEGER;
BEGIN
  -- Obtener token del cliente
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
  
  -- Incrementar secuencia atómicamente con UPSERT
  INSERT INTO matter_sequences (
    organization_id, matter_type, jurisdiction_code, year, month, last_sequence, updated_at
  )
  VALUES (p_organization_id, p_type_code, p_jurisdiction_code, v_year, v_month, 1, NOW())
  ON CONFLICT (organization_id, matter_type, jurisdiction_code, year) DO UPDATE
  SET last_sequence = matter_sequences.last_sequence + 1, 
      updated_at = NOW()
  RETURNING last_sequence INTO v_seq_value;
  
  -- Construir número
  v_date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  v_base := p_type_code || '-' || p_jurisdiction_code || '-' || v_date_part || '-' || 
            v_client_token || '-' || LPAD(v_seq_value::TEXT, 4, '0');
  v_check := public.calculate_check_digit(v_base);
  
  RETURN v_base || '-' || v_check;
END;
$$;

-- 3. Añadir índice único si no existe para el UPSERT
CREATE UNIQUE INDEX IF NOT EXISTS idx_matter_sequences_unique_key 
ON matter_sequences(organization_id, matter_type, jurisdiction_code, year);