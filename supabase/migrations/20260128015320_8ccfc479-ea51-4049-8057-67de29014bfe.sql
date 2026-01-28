
-- =====================================================
-- CRM SIMPLIFICADO - PARTE 2: FUNCIONES DE CONVERSIÓN
-- =====================================================

-- 1. FUNCIÓN: approve_lead (Lead → Cliente + Contacto + Deal)
-- =====================================================
CREATE OR REPLACE FUNCTION public.approve_lead(
  p_lead_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_deal_title TEXT DEFAULT NULL,
  p_deal_value DECIMAL DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead RECORD;
  v_user_id UUID;
  v_client_id UUID;
  v_client_number TEXT;
  v_contact_id UUID;
  v_deal_id UUID;
  v_deal_number TEXT;
BEGIN
  -- Obtener user_id
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;
  
  -- Obtener datos del lead
  SELECT * INTO v_lead
  FROM public.crm_leads
  WHERE id = p_lead_id;
  
  IF v_lead IS NULL THEN
    RAISE EXCEPTION 'Lead no encontrado: %', p_lead_id;
  END IF;
  
  IF v_lead.status = 'converted' THEN
    RAISE EXCEPTION 'Lead ya fue convertido anteriormente';
  END IF;
  
  -- 1. Crear Cliente
  INSERT INTO public.clients (
    organization_id,
    name,
    legal_name,
    tax_id,
    email,
    phone,
    client_type,
    source_lead_id,
    notes,
    tags,
    assigned_to,
    created_by
  ) VALUES (
    v_lead.organization_id,
    COALESCE(v_lead.company_name, v_lead.contact_name),
    v_lead.company_name,
    v_lead.company_tax_id,
    v_lead.contact_email,
    v_lead.contact_phone,
    'direct',
    p_lead_id,
    v_lead.notes,
    v_lead.tags,
    COALESCE(v_lead.assigned_to, v_user_id),
    v_user_id
  )
  RETURNING id, client_number INTO v_client_id, v_client_number;
  
  -- 2. Crear Contacto principal
  INSERT INTO public.client_contacts (
    organization_id,
    client_id,
    first_name,
    last_name,
    email,
    phone,
    is_primary,
    is_billing_contact,
    created_by
  ) VALUES (
    v_lead.organization_id,
    v_client_id,
    SPLIT_PART(v_lead.contact_name, ' ', 1),
    NULLIF(TRIM(SUBSTRING(v_lead.contact_name FROM POSITION(' ' IN v_lead.contact_name))), ''),
    v_lead.contact_email,
    v_lead.contact_phone,
    true,
    true,
    v_user_id
  )
  RETURNING id INTO v_contact_id;
  
  -- 3. Crear Deal
  INSERT INTO public.crm_deals (
    organization_id,
    client_id,
    lead_id,
    title,
    description,
    stage,
    estimated_value,
    probability,
    assigned_to,
    created_by
  ) VALUES (
    v_lead.organization_id,
    v_client_id,
    p_lead_id,
    COALESCE(p_deal_title, 'Oportunidad de ' || COALESCE(v_lead.company_name, v_lead.contact_name)),
    'Convertido desde Lead. Intereses: ' || COALESCE(ARRAY_TO_STRING(v_lead.interested_in, ', '), 'No especificado'),
    'contacted',
    COALESCE(p_deal_value, v_lead.estimated_value),
    20,
    COALESCE(v_lead.assigned_to, v_user_id),
    v_user_id
  )
  RETURNING id, deal_number INTO v_deal_id, v_deal_number;
  
  -- 4. Actualizar Lead como convertido
  UPDATE public.crm_leads
  SET 
    status = 'converted',
    converted_to_client_id = v_client_id,
    converted_to_deal_id = v_deal_id,
    converted_at = NOW(),
    converted_by = v_user_id
  WHERE id = p_lead_id;
  
  -- 5. Registrar actividad de conversión en el Lead
  INSERT INTO public.crm_activities (
    organization_id,
    lead_id,
    client_id,
    deal_id,
    activity_type,
    subject,
    description,
    created_by
  ) VALUES (
    v_lead.organization_id,
    p_lead_id,
    v_client_id,
    v_deal_id,
    'status_change',
    'Lead convertido a Cliente',
    'Se creó el cliente ' || v_client_number || ' y el deal ' || v_deal_number,
    v_user_id
  );
  
  -- Retornar resultado
  RETURN jsonb_build_object(
    'success', true,
    'client_id', v_client_id,
    'client_number', v_client_number,
    'contact_id', v_contact_id,
    'deal_id', v_deal_id,
    'deal_number', v_deal_number,
    'message', 'Lead convertido exitosamente'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 2. FUNCIÓN: win_deal (Marcar deal como ganado)
-- =====================================================
CREATE OR REPLACE FUNCTION public.win_deal(
  p_deal_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_won_value DECIMAL DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deal RECORD;
  v_user_id UUID;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;
  
  -- Obtener deal
  SELECT * INTO v_deal
  FROM public.crm_deals
  WHERE id = p_deal_id;
  
  IF v_deal IS NULL THEN
    RAISE EXCEPTION 'Deal no encontrado: %', p_deal_id;
  END IF;
  
  IF v_deal.stage IN ('won', 'lost') THEN
    RAISE EXCEPTION 'Deal ya está cerrado (%)' , v_deal.stage;
  END IF;
  
  -- Actualizar deal
  UPDATE public.crm_deals
  SET 
    stage = 'won',
    won_at = NOW(),
    won_value = COALESCE(p_won_value, estimated_value),
    probability = 100,
    updated_at = NOW()
  WHERE id = p_deal_id;
  
  -- Registrar actividad
  INSERT INTO public.crm_activities (
    organization_id,
    deal_id,
    client_id,
    activity_type,
    subject,
    description,
    old_value,
    new_value,
    created_by
  ) VALUES (
    v_deal.organization_id,
    p_deal_id,
    v_deal.client_id,
    'stage_change',
    '🎉 Deal ganado',
    COALESCE(p_notes, 'Valor final: ' || COALESCE(p_won_value, v_deal.estimated_value)::TEXT || ' €'),
    v_deal.stage,
    'won',
    v_user_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'deal_id', p_deal_id,
    'won_value', COALESCE(p_won_value, v_deal.estimated_value),
    'message', 'Deal marcado como ganado'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 3. FUNCIÓN: lose_deal (Marcar deal como perdido)
-- =====================================================
CREATE OR REPLACE FUNCTION public.lose_deal(
  p_deal_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_reason TEXT DEFAULT 'other',
  p_reason_detail TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deal RECORD;
  v_user_id UUID;
  v_full_reason TEXT;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;
  
  -- Obtener deal
  SELECT * INTO v_deal
  FROM public.crm_deals
  WHERE id = p_deal_id;
  
  IF v_deal IS NULL THEN
    RAISE EXCEPTION 'Deal no encontrado: %', p_deal_id;
  END IF;
  
  IF v_deal.stage IN ('won', 'lost') THEN
    RAISE EXCEPTION 'Deal ya está cerrado (%)' , v_deal.stage;
  END IF;
  
  -- Construir razón completa
  v_full_reason := p_reason;
  IF p_reason_detail IS NOT NULL AND p_reason_detail != '' THEN
    v_full_reason := v_full_reason || ': ' || p_reason_detail;
  END IF;
  
  -- Actualizar deal
  UPDATE public.crm_deals
  SET 
    stage = 'lost',
    lost_at = NOW(),
    lost_reason = v_full_reason,
    probability = 0,
    updated_at = NOW()
  WHERE id = p_deal_id;
  
  -- Registrar actividad
  INSERT INTO public.crm_activities (
    organization_id,
    deal_id,
    client_id,
    activity_type,
    subject,
    description,
    old_value,
    new_value,
    created_by
  ) VALUES (
    v_deal.organization_id,
    p_deal_id,
    v_deal.client_id,
    'stage_change',
    '❌ Deal perdido',
    'Motivo: ' || v_full_reason,
    v_deal.stage,
    'lost',
    v_user_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'deal_id', p_deal_id,
    'lost_reason', v_full_reason,
    'message', 'Deal marcado como perdido'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 4. FUNCIÓN: update_lead_status (cambiar estado de lead)
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_lead_status(
  p_lead_id UUID,
  p_new_status TEXT,
  p_user_id UUID DEFAULT NULL,
  p_standby_until DATE DEFAULT NULL,
  p_standby_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead RECORD;
  v_user_id UUID;
  v_old_status TEXT;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  -- Validar status
  IF p_new_status NOT IN ('new', 'contacted', 'standby', 'converted') THEN
    RAISE EXCEPTION 'Status inválido: %. Valores permitidos: new, contacted, standby, converted', p_new_status;
  END IF;
  
  -- Obtener lead
  SELECT * INTO v_lead
  FROM public.crm_leads
  WHERE id = p_lead_id;
  
  IF v_lead IS NULL THEN
    RAISE EXCEPTION 'Lead no encontrado: %', p_lead_id;
  END IF;
  
  v_old_status := v_lead.status;
  
  -- Actualizar lead
  UPDATE public.crm_leads
  SET 
    status = p_new_status,
    standby_until = CASE WHEN p_new_status = 'standby' THEN p_standby_until ELSE NULL END,
    standby_reason = CASE WHEN p_new_status = 'standby' THEN p_standby_reason ELSE NULL END,
    updated_at = NOW()
  WHERE id = p_lead_id;
  
  -- Registrar actividad
  INSERT INTO public.crm_activities (
    organization_id,
    lead_id,
    activity_type,
    subject,
    description,
    old_value,
    new_value,
    created_by
  ) VALUES (
    v_lead.organization_id,
    p_lead_id,
    'status_change',
    'Cambio de estado',
    CASE 
      WHEN p_new_status = 'standby' THEN 'En espera hasta ' || COALESCE(p_standby_until::TEXT, 'sin fecha') || '. Motivo: ' || COALESCE(p_standby_reason, 'No especificado')
      ELSE 'Estado actualizado de ' || v_old_status || ' a ' || p_new_status
    END,
    v_old_status,
    p_new_status,
    v_user_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'lead_id', p_lead_id,
    'old_status', v_old_status,
    'new_status', p_new_status,
    'message', 'Estado actualizado'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 5. FUNCIÓN: update_deal_stage (cambiar etapa de deal)
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_deal_stage(
  p_deal_id UUID,
  p_new_stage TEXT,
  p_user_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deal RECORD;
  v_user_id UUID;
  v_old_stage TEXT;
  v_probability INTEGER;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  -- Validar stage
  IF p_new_stage NOT IN ('contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost') THEN
    RAISE EXCEPTION 'Stage inválido: %. Valores permitidos: contacted, qualified, proposal, negotiation, won, lost', p_new_stage;
  END IF;
  
  -- Obtener deal
  SELECT * INTO v_deal
  FROM public.crm_deals
  WHERE id = p_deal_id;
  
  IF v_deal IS NULL THEN
    RAISE EXCEPTION 'Deal no encontrado: %', p_deal_id;
  END IF;
  
  v_old_stage := v_deal.stage;
  
  -- Calcular probabilidad según etapa
  v_probability := CASE p_new_stage
    WHEN 'contacted' THEN 20
    WHEN 'qualified' THEN 40
    WHEN 'proposal' THEN 60
    WHEN 'negotiation' THEN 80
    WHEN 'won' THEN 100
    WHEN 'lost' THEN 0
  END;
  
  -- Actualizar deal
  UPDATE public.crm_deals
  SET 
    stage = p_new_stage,
    probability = v_probability,
    updated_at = NOW()
  WHERE id = p_deal_id;
  
  -- Registrar actividad
  INSERT INTO public.crm_activities (
    organization_id,
    deal_id,
    client_id,
    activity_type,
    subject,
    description,
    old_value,
    new_value,
    created_by
  ) VALUES (
    v_deal.organization_id,
    p_deal_id,
    v_deal.client_id,
    'stage_change',
    'Avance de etapa: ' || v_old_stage || ' → ' || p_new_stage,
    COALESCE(p_notes, 'Probabilidad: ' || v_probability || '%'),
    v_old_stage,
    p_new_stage,
    v_user_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'deal_id', p_deal_id,
    'old_stage', v_old_stage,
    'new_stage', p_new_stage,
    'probability', v_probability,
    'message', 'Etapa actualizada'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 6. FUNCIÓN: delete_lead (eliminar lead con confirmación)
-- =====================================================
CREATE OR REPLACE FUNCTION public.delete_lead(
  p_lead_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead RECORD;
  v_user_id UUID;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  -- Obtener lead
  SELECT * INTO v_lead
  FROM public.crm_leads
  WHERE id = p_lead_id;
  
  IF v_lead IS NULL THEN
    RAISE EXCEPTION 'Lead no encontrado: %', p_lead_id;
  END IF;
  
  IF v_lead.status = 'converted' THEN
    RAISE EXCEPTION 'No se puede eliminar un lead convertido. Tiene cliente y deal asociados.';
  END IF;
  
  -- Eliminar actividades asociadas primero
  DELETE FROM public.crm_activities WHERE lead_id = p_lead_id;
  
  -- Eliminar lead
  DELETE FROM public.crm_leads WHERE id = p_lead_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted_lead_id', p_lead_id,
    'lead_name', v_lead.contact_name,
    'reason', COALESCE(p_reason, 'No especificado'),
    'message', 'Lead eliminado permanentemente'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- 7. FUNCIÓN: get_crm_dashboard_stats (estadísticas del CRM)
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_crm_dashboard_stats(
  p_organization_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'leads', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM crm_leads WHERE organization_id = p_organization_id AND status != 'converted'),
      'new', (SELECT COUNT(*) FROM crm_leads WHERE organization_id = p_organization_id AND status = 'new'),
      'contacted', (SELECT COUNT(*) FROM crm_leads WHERE organization_id = p_organization_id AND status = 'contacted'),
      'standby', (SELECT COUNT(*) FROM crm_leads WHERE organization_id = p_organization_id AND status = 'standby'),
      'converted_this_month', (SELECT COUNT(*) FROM crm_leads WHERE organization_id = p_organization_id AND status = 'converted' AND converted_at >= DATE_TRUNC('month', CURRENT_DATE))
    ),
    'deals', jsonb_build_object(
      'total_open', (SELECT COUNT(*) FROM crm_deals WHERE organization_id = p_organization_id AND stage NOT IN ('won', 'lost')),
      'total_value', (SELECT COALESCE(SUM(estimated_value), 0) FROM crm_deals WHERE organization_id = p_organization_id AND stage NOT IN ('won', 'lost')),
      'by_stage', (
        SELECT jsonb_object_agg(stage, cnt)
        FROM (
          SELECT stage, COUNT(*) as cnt
          FROM crm_deals
          WHERE organization_id = p_organization_id AND stage NOT IN ('won', 'lost')
          GROUP BY stage
        ) s
      ),
      'won_this_month', (SELECT COUNT(*) FROM crm_deals WHERE organization_id = p_organization_id AND stage = 'won' AND won_at >= DATE_TRUNC('month', CURRENT_DATE)),
      'won_value_this_month', (SELECT COALESCE(SUM(won_value), 0) FROM crm_deals WHERE organization_id = p_organization_id AND stage = 'won' AND won_at >= DATE_TRUNC('month', CURRENT_DATE)),
      'lost_this_month', (SELECT COUNT(*) FROM crm_deals WHERE organization_id = p_organization_id AND stage = 'lost' AND lost_at >= DATE_TRUNC('month', CURRENT_DATE))
    ),
    'clients', jsonb_build_object(
      'total', (SELECT COUNT(*) FROM clients WHERE organization_id = p_organization_id AND status = 'active'),
      'new_this_month', (SELECT COUNT(*) FROM clients WHERE organization_id = p_organization_id AND created_at >= DATE_TRUNC('month', CURRENT_DATE))
    ),
    'activities', jsonb_build_object(
      'today', (SELECT COUNT(*) FROM crm_activities WHERE organization_id = p_organization_id AND created_at >= CURRENT_DATE),
      'this_week', (SELECT COUNT(*) FROM crm_activities WHERE organization_id = p_organization_id AND created_at >= DATE_TRUNC('week', CURRENT_DATE))
    )
  ) INTO v_stats;
  
  RETURN v_stats;
END;
$$;
