-- Create a preview function that doesn't increment the sequence
CREATE OR REPLACE FUNCTION public.preview_matter_number(
  p_organization_id uuid, 
  p_matter_type text, 
  p_jurisdiction_code text, 
  p_client_id uuid DEFAULT NULL::uuid
)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_config RECORD;
  v_sequence INT;
  v_client_token TEXT := '';
  v_date_part TEXT;
  v_seq_part TEXT;
  v_result TEXT;
  v_year INT := EXTRACT(YEAR FROM CURRENT_DATE)::INT;
  v_month INT := EXTRACT(MONTH FROM CURRENT_DATE)::INT;
  v_check_month INT := NULL;
BEGIN
  -- Get config
  SELECT * INTO v_config 
  FROM public.matter_numbering_config 
  WHERE organization_id = p_organization_id;
  
  -- Use defaults if no config
  IF v_config IS NULL THEN
    v_config := ROW(
      gen_random_uuid(),
      p_organization_id,
      '{TYPE}-{JUR}-{DATE}-{CLIENT}-{SEQ}-{CHECK}',
      'YYYYMMDD',
      4,
      'yearly',
      TRUE,
      TRUE,
      now(),
      now()
    )::matter_numbering_config;
  END IF;
  
  -- Determine month for sequence
  IF v_config.seq_reset_period = 'monthly' THEN
    v_check_month := v_month;
  END IF;
  
  -- Get NEXT sequence value WITHOUT incrementing (preview only)
  SELECT COALESCE(last_sequence, 0) + 1 INTO v_sequence
  FROM public.matter_sequences
  WHERE organization_id = p_organization_id
    AND matter_type = p_matter_type
    AND jurisdiction_code = p_jurisdiction_code
    AND year = v_year
    AND (month IS NOT DISTINCT FROM v_check_month);
  
  -- If no sequence exists, next will be 1
  IF v_sequence IS NULL THEN
    v_sequence := 1;
  END IF;
  
  -- Get client token
  IF v_config.include_client_token AND p_client_id IS NOT NULL THEN
    SELECT client_token INTO v_client_token 
    FROM public.contacts 
    WHERE id = p_client_id;
    
    -- Use placeholder if no token yet
    IF v_client_token IS NULL THEN
      SELECT UPPER(LEFT(REGEXP_REPLACE(name, '[^A-Za-z0-9]', '', 'g'), 3)) INTO v_client_token 
      FROM public.contacts WHERE id = p_client_id;
      IF v_client_token IS NULL OR v_client_token = '' THEN
        v_client_token := 'CLI';
      END IF;
    END IF;
  END IF;
  
  -- Format date
  CASE v_config.date_format
    WHEN 'YYYYMMDD' THEN v_date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
    WHEN 'YYMMDD' THEN v_date_part := TO_CHAR(CURRENT_DATE, 'YYMMDD');
    WHEN 'YYYY' THEN v_date_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    WHEN 'YY' THEN v_date_part := TO_CHAR(CURRENT_DATE, 'YY');
    ELSE v_date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  END CASE;
  
  -- Format sequence
  v_seq_part := LPAD(v_sequence::TEXT, v_config.seq_length, '0');
  
  -- Build number
  v_result := v_config.pattern;
  v_result := REPLACE(v_result, '{TYPE}', UPPER(p_matter_type));
  v_result := REPLACE(v_result, '{JUR}', UPPER(p_jurisdiction_code));
  v_result := REPLACE(v_result, '{DATE}', v_date_part);
  v_result := REPLACE(v_result, '{SEQ}', v_seq_part);
  
  IF v_config.include_client_token AND v_client_token != '' THEN
    v_result := REPLACE(v_result, '{CLIENT}', v_client_token);
  ELSE
    v_result := REPLACE(v_result, '-{CLIENT}', '');
    v_result := REPLACE(v_result, '{CLIENT}-', '');
    v_result := REPLACE(v_result, '{CLIENT}', '');
  END IF;
  
  -- Add check digit
  IF v_config.include_check_digit THEN
    v_result := REPLACE(v_result, '{CHECK}', public.calculate_check_digit(v_result));
  ELSE
    v_result := REPLACE(v_result, '-{CHECK}', '');
    v_result := REPLACE(v_result, '{CHECK}', '');
  END IF;
  
  RETURN v_result;
END;
$function$;