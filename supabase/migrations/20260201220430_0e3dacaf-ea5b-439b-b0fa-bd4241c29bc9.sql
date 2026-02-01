
-- Fix change_matter_phase function to include organization_id in history insert
CREATE OR REPLACE FUNCTION public.change_matter_phase(
  p_matter_id uuid, 
  p_new_phase text, 
  p_reason text DEFAULT NULL, 
  p_notes text DEFAULT NULL, 
  p_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_phase TEXT;
  v_organization_id UUID;
  v_phase_entered TIMESTAMPTZ;
  v_time_in_phase INTERVAL;
  v_allowed_next TEXT[];
  v_allowed_prev TEXT[];
  v_result JSONB;
  v_actual_user_id UUID;
BEGIN
  -- Get actual user_id (from parameter or auth.uid())
  v_actual_user_id := COALESCE(p_user_id, auth.uid());
  
  -- Get current phase and organization_id
  SELECT current_phase, organization_id, phase_entered_at 
  INTO v_current_phase, v_organization_id, v_phase_entered
  FROM matters WHERE id = p_matter_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Matter not found');
  END IF;
  
  -- If same phase, do nothing
  IF v_current_phase = p_new_phase THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already in this phase');
  END IF;
  
  -- Check allowed forward transitions
  SELECT allowed_next_phases INTO v_allowed_next
  FROM workflow_phases WHERE code = v_current_phase;
  
  -- Check allowed backward transitions
  SELECT allowed_prev_phases INTO v_allowed_prev
  FROM workflow_phases WHERE code = v_current_phase;
  
  -- Validate transition (allow if it's in either allowed_next or allowed_prev)
  IF v_current_phase IS NOT NULL 
     AND NOT (p_new_phase = ANY(COALESCE(v_allowed_next, ARRAY[]::TEXT[]))) 
     AND NOT (p_new_phase = ANY(COALESCE(v_allowed_prev, ARRAY[]::TEXT[]))) THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Transición no permitida de ' || v_current_phase || ' a ' || p_new_phase,
      'allowed_next', v_allowed_next,
      'allowed_prev', v_allowed_prev
    );
  END IF;
  
  -- Calculate time in previous phase
  v_time_in_phase := COALESCE(now() - v_phase_entered, INTERVAL '0');
  
  -- Insert into history (with organization_id!)
  INSERT INTO matter_phase_history (
    organization_id, matter_id, from_phase, to_phase, changed_by, reason, notes, time_in_previous_phase
  ) VALUES (
    v_organization_id, p_matter_id, v_current_phase, p_new_phase, v_actual_user_id, p_reason, p_notes, v_time_in_phase
  );
  
  -- Update matter
  UPDATE matters SET
    previous_phase = current_phase,
    current_phase = p_new_phase,
    phase_entered_at = now(),
    workflow_progress = COALESCE((SELECT sequence * 10 FROM workflow_phases WHERE code = p_new_phase), 0),
    updated_at = now()
  WHERE id = p_matter_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'from_phase', v_current_phase,
    'to_phase', p_new_phase,
    'time_in_previous_phase', extract(epoch from v_time_in_phase)::integer
  );
END;
$$;
