
-- =====================================================
-- CRM DATOS DEMO - Versión con columnas correctas
-- =====================================================

CREATE OR REPLACE FUNCTION public.seed_crm_demo_data(p_organization_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client_techverde UUID := gen_random_uuid();
  v_client_biosalud UUID := gen_random_uuid();
  v_client_globallog UUID := gen_random_uuid();
  v_deal_1 UUID := gen_random_uuid();
  v_deal_2 UUID := gen_random_uuid();
  v_deal_3 UUID := gen_random_uuid();
  v_deal_4 UUID := gen_random_uuid();
  v_deal_5 UUID := gen_random_uuid();
  v_lead_1 UUID := gen_random_uuid();
  v_lead_2 UUID := gen_random_uuid();
  v_lead_3 UUID := gen_random_uuid();
  v_lead_4 UUID := gen_random_uuid();
  v_lead_5 UUID := gen_random_uuid();
BEGIN
  -- Limpiar datos demo anteriores
  DELETE FROM public.crm_activities WHERE organization_id = p_organization_id;
  DELETE FROM public.crm_leads WHERE organization_id = p_organization_id;
  DELETE FROM public.crm_deals WHERE organization_id = p_organization_id;
  DELETE FROM public.client_contacts WHERE organization_id = p_organization_id;
  DELETE FROM public.clients WHERE organization_id = p_organization_id;

  -- CLIENTES
  INSERT INTO public.clients (id, organization_id, client_number, name, legal_name, client_type, tax_id, email, phone, city, country, status, tags) VALUES 
  (v_client_techverde, p_organization_id, 'CLI-2024-0012', 'TechVerde Innovations', 'TechVerde Innovations S.L.', 'direct', 'B12345678', 'info@techverde.es', '+34 963 123 456', 'Valencia', 'ES', 'active', ARRAY['tecnología', 'startup', 'premium']),
  (v_client_biosalud, p_organization_id, 'CLI-2024-0008', 'BioSalud Pharmaceutical', 'BioSalud Pharmaceutical S.A.', 'direct', 'A87654321', 'contacto@biosalud.com', '+34 911 234 567', 'Madrid', 'ES', 'active', ARRAY['farmacéutica', 'enterprise', 'patentes']),
  (v_client_globallog, p_organization_id, 'CLI-2023-0005', 'GlobalLog International', 'GlobalLog International Inc.', 'direct', 'US-98765432', 'legal@globallog.com', '+1 312 555 1234', 'Chicago', 'US', 'active', ARRAY['logística', 'internacional', 'renovaciones']);

  -- Contactos
  INSERT INTO public.client_contacts (organization_id, client_id, first_name, last_name, email, phone, job_title, is_primary) VALUES
  (p_organization_id, v_client_techverde, 'Carlos', 'Martínez', 'carlos@techverde.es', '+34 600 111 222', 'CEO', true),
  (p_organization_id, v_client_techverde, 'Laura', 'García', 'laura@techverde.es', '+34 600 111 223', 'IP Manager', false),
  (p_organization_id, v_client_biosalud, 'Dr. Antonio', 'Fernández', 'afernandez@biosalud.com', '+34 600 333 444', 'Director Legal', true),
  (p_organization_id, v_client_biosalud, 'María', 'López', 'mlopez@biosalud.com', '+34 600 333 445', 'Patent Counsel', false),
  (p_organization_id, v_client_globallog, 'John', 'Smith', 'jsmith@globallog.com', '+1 312 555 1235', 'General Counsel', true);

  -- DEALS (usando name y amount que son las columnas reales)
  INSERT INTO public.crm_deals (id, organization_id, client_id, deal_number, name, stage, amount, probability, expected_close_date, next_action, next_action_date, created_at) VALUES
  (v_deal_1, p_organization_id, v_client_techverde, 'DEAL-2026-0001', 'TechVerde Extensión EU', 'contacted', 4500, 60, '2026-03-15', 'Enviar propuesta detallada', '2026-01-30', NOW() - INTERVAL '5 days'),
  (v_deal_2, p_organization_id, v_client_biosalud, 'DEAL-2026-0002', 'BioSalud Nueva Patente', 'qualified', 45000, 75, '2026-04-30', 'Reunión técnica con equipo I+D', '2026-02-05', NOW() - INTERVAL '10 days'),
  (v_deal_3, p_organization_id, v_client_globallog, 'DEAL-2026-0003', 'GlobalLog Renovación', 'proposal', 3500, 90, '2026-02-28', 'Esperar confirmación presupuesto', '2026-02-01', NOW() - INTERVAL '15 days'),
  (v_deal_4, p_organization_id, v_client_biosalud, 'DEAL-2026-0004', 'BioSalud Oposición', 'negotiation', 35000, 85, '2026-02-15', 'Presentar escrito de alegaciones', (CURRENT_DATE - 1)::DATE, NOW() - INTERVAL '20 days'),
  (v_deal_5, p_organization_id, v_client_techverde, 'DEAL-2026-0005', 'TechVerde Vigilancia', 'contacted', 2400, 50, '2026-03-01', 'Llamar para seguimiento', '2026-02-03', NOW() - INTERVAL '3 days');

  -- LEADS
  INSERT INTO public.crm_leads (id, organization_id, contact_name, contact_email, contact_phone, company_name, status, interested_in, estimated_value, source, next_action, next_action_date, standby_until, standby_reason, created_at) VALUES
  (v_lead_1, p_organization_id, 'Ana López', 'ana.lopez@startuptech.io', '+34 622 111 222', 'StartUp Tech', 'new', ARRAY['Marcas'], 5000, 'linkedin', 'Llamar para presentación', '2026-01-30', NULL, NULL, NOW() - INTERVAL '2 days'),
  (v_lead_2, p_organization_id, 'Pedro Ruiz', 'pruiz@consultores-asociados.es', '+34 633 222 333', 'Consultores Asociados', 'standby', ARRAY['Patentes'], 8000, 'referral', 'Recontactar en abril', '2026-04-01', '2026-04-01', 'Cliente ocupado con cierre fiscal Q1', NOW() - INTERVAL '15 days'),
  (v_lead_3, p_organization_id, 'Carmen Vidal', 'cvidal@disenosmed.com', '+34 644 333 444', 'Diseños Mediterráneo', 'new', ARRAY['Marcas', 'Diseños'], 7500, 'web', 'Enviar información de servicios', '2026-01-29', NULL, NULL, NOW()),
  (v_lead_4, p_organization_id, 'Roberto Sánchez', 'rsanchez@foodtechdelivery.com', '+34 655 444 555', 'FoodTech Delivery', 'new', ARRAY['Internacional', 'Marcas'], 15000, 'event', 'Agendar demo de plataforma', '2026-02-05', NULL, NULL, NOW() - INTERVAL '1 day'),
  (v_lead_5, p_organization_id, 'Miguel Torres', 'mtorres@bodegastradicional.es', '+34 666 555 666', 'Bodega Tradicional', 'contacted', ARRAY['Marcas'], 4500, 'cold_call', 'Enviar propuesta URGENTE', CURRENT_DATE, NULL, NULL, NOW() - INTERVAL '4 days');

  -- ACTIVIDADES - Leads
  INSERT INTO public.crm_activities (organization_id, lead_id, activity_type, subject, description, created_at) VALUES
  (p_organization_id, v_lead_1, 'note', 'Lead entrante LinkedIn', 'Contactó vía LinkedIn interesada en proteger marca de app', NOW() - INTERVAL '2 days'),
  (p_organization_id, v_lead_1, 'email', 'Email de bienvenida', 'Enviado email con información general de servicios', NOW() - INTERVAL '1 day'),
  (p_organization_id, v_lead_2, 'call', 'Primera llamada', 'Interesado en patentar metodología de consultoría. Muy ocupados hasta abril.', NOW() - INTERVAL '15 days'),
  (p_organization_id, v_lead_2, 'status_change', 'Cambio a Stand-by', 'Cliente solicita recontacto en abril por cierre fiscal', NOW() - INTERVAL '14 days'),
  (p_organization_id, v_lead_3, 'note', 'Lead entrante web', 'Formulario web: interesados en proteger marca y diseños de mobiliario', NOW()),
  (p_organization_id, v_lead_4, 'meeting', 'Evento TechFood Madrid', 'Conocimos en evento. Startup en expansión internacional, necesitan protección en 5 países', NOW() - INTERVAL '1 day'),
  (p_organization_id, v_lead_4, 'email', 'Follow-up evento', 'Enviado resumen de conversación y próximos pasos', NOW() - INTERVAL '12 hours'),
  (p_organization_id, v_lead_5, 'call', 'Llamada fría', 'Detectamos que no tienen marca registrada. Muy interesados, piden propuesta urgente', NOW() - INTERVAL '4 days'),
  (p_organization_id, v_lead_5, 'email', 'Información enviada', 'Enviado dossier de servicios de marcas', NOW() - INTERVAL '3 days'),
  (p_organization_id, v_lead_5, 'call', 'Llamada seguimiento', 'Han revisado info, quieren propuesta concreta antes del viernes', NOW() - INTERVAL '1 day');

  -- ACTIVIDADES - Deals
  INSERT INTO public.crm_activities (organization_id, deal_id, client_id, activity_type, subject, description, created_at) VALUES
  (p_organization_id, v_deal_1, v_client_techverde, 'meeting', 'Reunión inicial', 'Presentación de opciones de extensión a UE', NOW() - INTERVAL '5 days'),
  (p_organization_id, v_deal_1, v_client_techverde, 'email', 'Análisis preliminar', 'Enviado análisis de viabilidad en países objetivo', NOW() - INTERVAL '3 days'),
  (p_organization_id, v_deal_2, v_client_biosalud, 'meeting', 'Kickoff proyecto', 'Reunión con equipo I+D para entender invención', NOW() - INTERVAL '10 days'),
  (p_organization_id, v_deal_2, v_client_biosalud, 'call', 'Llamada técnica', 'Aclaración de detalles técnicos del compuesto', NOW() - INTERVAL '7 days'),
  (p_organization_id, v_deal_2, v_client_biosalud, 'email', 'Búsqueda estado del arte', 'Enviado informe de búsqueda de anterioridades', NOW() - INTERVAL '4 days'),
  (p_organization_id, v_deal_2, v_client_biosalud, 'stage_change', 'Avance a Cualificado', 'Cliente confirma interés tras revisar búsqueda', NOW() - INTERVAL '3 days'),
  (p_organization_id, v_deal_3, v_client_globallog, 'email', 'Aviso renovación', 'Notificación de próximo vencimiento de marcas', NOW() - INTERVAL '15 days'),
  (p_organization_id, v_deal_3, v_client_globallog, 'call', 'Confirmación alcance', 'Llamada para confirmar países a renovar', NOW() - INTERVAL '10 days'),
  (p_organization_id, v_deal_3, v_client_globallog, 'email', 'Propuesta enviada', 'Presupuesto detallado para 3 renovaciones', NOW() - INTERVAL '5 days'),
  (p_organization_id, v_deal_4, v_client_biosalud, 'note', 'Oposición recibida', 'Competidor presenta oposición contra solicitud de patente', NOW() - INTERVAL '20 days'),
  (p_organization_id, v_deal_4, v_client_biosalud, 'meeting', 'Reunión estrategia', 'Definición de estrategia de defensa', NOW() - INTERVAL '18 days'),
  (p_organization_id, v_deal_4, v_client_biosalud, 'email', 'Borrador alegaciones', 'Enviado primer borrador de escrito de alegaciones', NOW() - INTERVAL '10 days'),
  (p_organization_id, v_deal_4, v_client_biosalud, 'call', 'Revisión con cliente', 'Llamada para revisar cambios solicitados', NOW() - INTERVAL '5 days'),
  (p_organization_id, v_deal_5, v_client_techverde, 'email', 'Oferta vigilancia', 'Propuesta de servicio de vigilancia anual', NOW() - INTERVAL '3 days'),
  (p_organization_id, v_deal_5, v_client_techverde, 'note', 'Feedback cliente', 'Cliente lo está valorando internamente', NOW() - INTERVAL '1 day');

  RETURN jsonb_build_object('success', true, 'leads', 5, 'clients', 3, 'deals', 5, 'activities', 25);
END;
$$;

-- Ejecutar para org demo
DO $$
DECLARE
  v_org_id UUID;
  v_result JSONB;
BEGIN
  SELECT id INTO v_org_id FROM public.organizations 
    WHERE slug LIKE 'demo-%' OR is_demo = true LIMIT 1;
  
  IF v_org_id IS NULL THEN
    SELECT id INTO v_org_id FROM public.organizations LIMIT 1;
  END IF;
  
  IF v_org_id IS NOT NULL THEN
    v_result := public.seed_crm_demo_data(v_org_id);
    RAISE NOTICE 'Demo data seeded: %', v_result;
  END IF;
END $$;
