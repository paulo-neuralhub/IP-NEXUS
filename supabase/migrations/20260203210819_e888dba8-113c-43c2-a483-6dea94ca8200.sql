
-- =============================================
-- INSERTAR DATOS DEMO FALTANTES - Meridian IP
-- =============================================

-- 1. CONTACTOS CRM (8 adicionales)
INSERT INTO crm_contacts (
  organization_id, account_id, full_name, email, phone, 
  is_lead, lead_score, lead_status, whatsapp_enabled, portal_access_enabled, tags, metadata
) VALUES
-- Contactos de TechFlow Solutions
('d0000001-0000-0000-0000-000000000001', 'a0000001-0001-0000-0000-000000000001', 
 'Carlos Ruiz García', 'carlos.ruiz@techflow.es', '+34 612 345 678', 
 false, 0, 'customer', true, true, '{"vip","decisor"}', '{}'),

('d0000001-0000-0000-0000-000000000001', 'a0000001-0001-0000-0000-000000000001', 
 'Ana Torres López', 'ana.torres@techflow.es', '+34 623 456 789', 
 false, 0, 'customer', false, true, '{"legal"}', '{}'),

-- Contactos de GreenPower
('d0000001-0000-0000-0000-000000000001', 'a0000001-0002-0000-0000-000000000001', 
 'Miguel Ángel Fernández', 'miguel@greenpower.es', '+34 634 567 890', 
 false, 0, 'customer', true, false, '{"ceo","decisor"}', '{}'),

-- Contactos de NordikHaus
('d0000001-0000-0000-0000-000000000001', 'a0000001-0003-0000-0000-000000000001', 
 'Klaus Weber', 'klaus.weber@nordikhaus.de', '+49 172 345 6789', 
 false, 0, 'customer', false, true, '{"internacional"}', '{}'),

('d0000001-0000-0000-0000-000000000001', 'a0000001-0003-0000-0000-000000000001', 
 'Sabine Müller', 'sabine.muller@nordikhaus.de', '+49 172 987 6543', 
 false, 0, 'customer', true, true, '{"legal","patentes"}', '{}'),

-- Contactos de Olivar Premium
('d0000001-0000-0000-0000-000000000001', 'a0000001-0004-0000-0000-000000000001', 
 'María José Ortega', 'mjortega@olivarpremium.es', '+34 656 789 012', 
 false, 0, 'customer', true, true, '{"comercial"}', '{}'),

-- Contactos de Sabores del Mediterráneo  
('d0000001-0000-0000-0000-000000000001', 'a0000001-0005-0000-0000-000000000001', 
 'Pedro Sánchez Navarro', 'pedro@saboresmed.es', '+34 667 890 123', 
 false, 0, 'customer', false, false, '{"gerente"}', '{}'),

-- Contacto de Dra. Voss
('d0000001-0000-0000-0000-000000000001', 'a0000001-0006-0000-0000-000000000001', 
 'Dr. Hans Becker', 'hans.becker@vosslab.de', '+49 151 234 5678', 
 false, 0, 'customer', false, true, '{"investigación"}', '{}');

-- 2. LEADS CRM (6) - status válidos: new, contacted, standby, converted
INSERT INTO crm_leads (
  organization_id, contact_name, contact_email, contact_phone, company_name, company_tax_id,
  status, interested_in, estimated_value, source, next_action, next_action_date, notes, tags,
  pipeline_id, stage_id
) VALUES
('d0000001-0000-0000-0000-000000000001', 
 'Carlos Ruiz García', 'carlos.ruiz@techflow.es', '+34 612 345 678', 'TechFlow Solutions S.L.', 'B12345678',
 'converted', '{"trademark","patent"}', 15000, 'referral', NULL, NULL, 
 'Lead convertido a cliente. Contrataron registro de marca y vigilancia.', '{"referido","tecnología"}',
 'acb2f90a-58a5-4327-92e4-e074f94fb1bd', 'f90f4756-c6fe-4bb7-9abb-f33668a0ab36'),

('d0000001-0000-0000-0000-000000000001', 
 'Miguel Ángel Fernández', 'miguel@greenpower.es', '+34 634 567 890', 'GreenPower Energías S.L.', 'B87654321',
 'converted', '{"patent","opposition"}', 25000, 'website', NULL, NULL, 
 'Interesados en patentes de energía renovable. Proyecto de expansión UE.', '{"energía","patentes"}',
 'acb2f90a-58a5-4327-92e4-e074f94fb1bd', 'f90f4756-c6fe-4bb7-9abb-f33668a0ab36'),

('d0000001-0000-0000-0000-000000000001', 
 'Klaus Weber', 'klaus.weber@nordikhaus.de', '+49 172 345 6789', 'NordikHaus GmbH', 'DE123456789',
 'converted', '{"trademark"}', 8000, 'linkedin', NULL, NULL, 
 'Empresa alemana expandiéndose a España y Portugal.', '{"internacional","muebles"}',
 'acb2f90a-58a5-4327-92e4-e074f94fb1bd', 'f90f4756-c6fe-4bb7-9abb-f33668a0ab36'),

('d0000001-0000-0000-0000-000000000001', 
 'Laura Vega Soto', 'laura.vega@biofarma.es', '+34 678 901 234', 'BioFarma Labs S.A.', 'A11223344',
 'contacted', '{"patent","trademark"}', 35000, 'event', 'Enviar propuesta detallada', '2026-02-10', 
 'Conocidos en feria de biotecnología. Muy interesados en proteger pipeline de fármacos.', '{"farmacia","urgente"}',
 'acb2f90a-58a5-4327-92e4-e074f94fb1bd', 'e2233691-908b-4520-afab-04bc7395e4f7'),

('d0000001-0000-0000-0000-000000000001', 
 'Roberto Castro Méndez', 'roberto@smartcity.io', '+34 689 012 345', 'SmartCity Solutions', 'B55667788',
 'new', '{"patent","software"}', 18000, 'website', 'Llamar para cualificar', '2026-02-05', 
 'Formulario web. Interesado en patentes de software y IoT.', '{"tecnología","IoT"}',
 'acb2f90a-58a5-4327-92e4-e074f94fb1bd', 'ce84e6ab-cebd-45c7-a690-8e00ea709efb'),

('d0000001-0000-0000-0000-000000000001', 
 'Isabel Moreno Ruiz', 'isabel@artesanias.es', '+34 690 123 456', 'Artesanías del Sur S.L.', 'B99887766',
 'standby', '{"trademark","design"}', 5000, 'referral', NULL, NULL, 
 'Pequeña empresa artesanal. Esperando a que cierren ronda de financiación.', '{"artesanía","pyme"}',
 'acb2f90a-58a5-4327-92e4-e074f94fb1bd', '951e2766-66df-4f5c-8e94-cde35eed3739');

-- 3. TAREAS CRM (7) - sin deal_id porque la tabla deals está vacía
INSERT INTO crm_tasks (
  organization_id, account_id, title, description, status, due_date, metadata
) VALUES
('d0000001-0000-0000-0000-000000000001', 
 'a0000001-0001-0000-0000-000000000001',
 'Revisar contrato anual TechFlow', 'Preparar renovación de contrato de vigilancia anual', 
 'pending', '2026-02-10', '{}'),

('d0000001-0000-0000-0000-000000000001', 
 'a0000001-0002-0000-0000-000000000001',
 'Llamar a GreenPower - seguimiento oposición', 'Informar sobre estado de la oposición presentada', 
 'pending', '2026-02-05', '{}'),

('d0000001-0000-0000-0000-000000000001', 
 'a0000001-0003-0000-0000-000000000001',
 'Enviar informe vigilancia NordikHaus', 'Reporte mensual de vigilancia de marcas en Portugal', 
 'pending', '2026-02-15', '{}'),

('d0000001-0000-0000-0000-000000000001', 
 'a0000001-0004-0000-0000-000000000001',
 'Preparar documentación marca Olivar Premium Gold', 'Solicitud de registro marca UE', 
 'in_progress', '2026-02-08', '{}'),

('d0000001-0000-0000-0000-000000000001', 
 NULL,
 'Redactar propuesta BioFarma', 'Propuesta completa para protección de pipeline farmacéutico', 
 'in_progress', '2026-02-07', '{}'),

('d0000001-0000-0000-0000-000000000001', 
 'a0000001-0001-0000-0000-000000000001',
 'Registrar marca TECHFLOW ANALYTICS', 'Presentación ante OEPM completada', 
 'completed', '2026-01-20', '{}'),

('d0000001-0000-0000-0000-000000000001', 
 'a0000001-0006-0000-0000-000000000001',
 'Reunión inicial Dra. Voss', 'Primera reunión de cualificación realizada', 
 'completed', '2026-01-15', '{}');
