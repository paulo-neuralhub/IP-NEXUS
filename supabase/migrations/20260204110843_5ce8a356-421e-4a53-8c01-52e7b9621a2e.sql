-- DATOS PENDIENTES (Parte 2): deals, activities, time_entries, whatsapp, portals

-- B1: DEALS
INSERT INTO deals (id, organization_id, owner_type, pipeline_id, stage_id, title, value, currency, contact_id, expected_close_date, description, created_at, status, probability)
VALUES
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'tenant', 
 'acb2f90a-58a5-4327-92e4-e074f94fb1bd', '951e2766-66df-4f5c-8e94-cde35eed3739',
 'Protección integral franquicia SABORES', 15000, 'EUR',
 (SELECT id FROM contacts WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' LIMIT 1),
 '2026-04-01', 'Marca + acuerdo franquicia + diseño industrial packaging.', '2025-08-10', 'open', 60),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'tenant',
 'acb2f90a-58a5-4327-92e4-e074f94fb1bd', 'e2233691-908b-4520-afab-04bc7395e4f7',
 'Patente BioVoss-7 — Solicitud EPO', 28000, 'EUR',
 (SELECT id FROM contacts WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' OFFSET 1 LIMIT 1),
 '2026-03-15', 'Patente farmacéutica.', '2025-06-01', 'open', 75),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'tenant',
 'acb2f90a-58a5-4327-92e4-e074f94fb1bd', '8e5b6dce-6217-4315-b0c0-813e7df2ebd0',
 'Expansión NordikHaus — 5 marcas UE', 35000, 'EUR',
 (SELECT id FROM contacts WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' OFFSET 2 LIMIT 1),
 '2026-06-01', 'Cliente interesado en IT, FR, NL, BE, AT.', '2025-11-20', 'open', 40),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'tenant',
 'acb2f90a-58a5-4327-92e4-e074f94fb1bd', 'f90f4756-c6fe-4bb7-9abb-f33668a0ab36',
 'Vigilancia marcas GreenPower', 4800, 'EUR',
 (SELECT id FROM contacts WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' OFFSET 3 LIMIT 1),
 '2025-12-01', 'Servicio vigilancia marcas contratado 1 año.', '2025-09-15', 'won', 100),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'tenant',
 'acb2f90a-58a5-4327-92e4-e074f94fb1bd', 'ce84e6ab-cebd-45c7-a690-8e00ea709efb',
 'Registro marca TECHFLOW USA', 12000, 'EUR',
 (SELECT id FROM contacts WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' OFFSET 4 LIMIT 1),
 '2026-06-30', 'TechFlow considera expansión internacional.', '2026-01-10', 'open', 25);

-- B2: ACTIVITIES
INSERT INTO activities (id, organization_id, owner_type, type, subject, content, created_at, created_by)
VALUES
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'tenant', 'note', 'Subió certificado registro GREENPOWER', 'Documento cargado en expediente.', '2025-08-15 10:30:00', (SELECT id FROM users LIMIT 1)),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'tenant', 'note', 'Actualizó fase OLIVAR PREMIUM a F9', 'Marca registrada oficialmente.', '2025-10-31 14:20:00', (SELECT id FROM users LIMIT 1)),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'tenant', 'email', 'Envió email bienvenida SABORES', 'Email de bienvenida enviado.', '2025-08-02 09:15:00', (SELECT id FROM users LIMIT 1)),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'tenant', 'note', 'Presentó solicitud FLOWAI ante EUIPO', 'Solicitud presentada.', '2025-05-20 11:00:00', (SELECT id FROM users LIMIT 1)),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'tenant', 'note', 'Creó oportunidad NordikHaus', 'Nueva oportunidad comercial.', '2025-11-20 16:45:00', (SELECT id FROM users LIMIT 1)),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'tenant', 'note', 'Completó búsqueda anterioridades', 'Informe completado.', '2025-04-14 13:30:00', (SELECT id FROM users LIMIT 1)),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'tenant', 'note', 'Creó plazo requerimiento EUIPO', 'Plazo crítico registrado.', '2025-12-06 09:00:00', (SELECT id FROM users LIMIT 1)),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'tenant', 'note', 'Cerró oportunidad Vigilancia GreenPower', 'Deal ganado 4.800€.', '2025-12-01 15:00:00', (SELECT id FROM users LIMIT 1)),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'tenant', 'note', 'Resolvió oposición ECOFLOW SOLAR', 'Oposición estimada parcialmente.', '2025-11-15 17:00:00', (SELECT id FROM users LIMIT 1)),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'tenant', 'email', 'Envió informe patentabilidad BioVoss-7', 'Informe enviado.', '2025-05-22 10:00:00', (SELECT id FROM users LIMIT 1));

-- B3: TIME_ENTRIES (adicionales)
INSERT INTO time_entries (id, organization_id, user_id, matter_id, description, duration_minutes, date, is_billable, created_at)
VALUES
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', (SELECT id FROM users LIMIT 1), (SELECT id FROM matters WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' LIMIT 1), 'Redacción informe anterioridades', 210, '2025-02-18', true, '2025-02-18'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', (SELECT id FROM users LIMIT 1), (SELECT id FROM matters WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' OFFSET 1 LIMIT 1), 'Preparación solicitud OEPM', 120, '2025-02-24', true, '2025-02-24'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', (SELECT id FROM users LIMIT 1), (SELECT id FROM matters WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' OFFSET 2 LIMIT 1), 'Búsqueda anterioridades marca', 150, '2025-04-25', true, '2025-04-25'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', (SELECT id FROM users LIMIT 1), (SELECT id FROM matters WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' OFFSET 3 LIMIT 1), 'Redacción escrito oposición', 300, '2025-05-30', true, '2025-05-30'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', (SELECT id FROM users LIMIT 1), (SELECT id FROM matters WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' OFFSET 4 LIMIT 1), 'Revisión reivindicaciones patente', 270, '2025-01-14', true, '2025-01-14'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', (SELECT id FROM users LIMIT 1), (SELECT id FROM matters WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' OFFSET 5 LIMIT 1), 'Análisis patentabilidad', 360, '2025-05-19', true, '2025-05-19');

-- B4: WHATSAPP_MESSAGES (con wa_id requerido)
INSERT INTO whatsapp_messages (id, organization_id, wa_id, client_id, contact_name, contact_phone, direction, message_type, content, status, timestamp, created_at)
VALUES
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'wa_msg_001', (SELECT id FROM contacts WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' LIMIT 1), 'Roberto Casas', '+34612345001', 'inbound', 'text', 'Buenos días, ¿hay novedades sobre GREENPOWER?', 'delivered', '2025-08-10 09:30:00', '2025-08-10 09:30:00'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'wa_msg_002', (SELECT id FROM contacts WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' LIMIT 1), 'Roberto Casas', '+34612345001', 'outbound', 'text', 'La marca GREENPOWER ha sido registrada oficialmente.', 'delivered', '2025-08-10 09:45:00', '2025-08-10 09:45:00'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'wa_msg_003', (SELECT id FROM contacts WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' LIMIT 1), 'Roberto Casas', '+34612345001', 'inbound', 'text', '¡Excelente noticia! Muchas gracias.', 'delivered', '2025-08-10 09:50:00', '2025-08-10 09:50:00'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'wa_msg_004', (SELECT id FROM contacts WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' OFFSET 1 LIMIT 1), 'Francisco Morales', '+34698765002', 'inbound', 'text', 'Hola, ¿cuándo estará OLIVAR PREMIUM?', 'delivered', '2025-09-15 11:00:00', '2025-09-15 11:00:00'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'wa_msg_005', (SELECT id FROM contacts WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' OFFSET 1 LIMIT 1), 'Francisco Morales', '+34698765002', 'outbound', 'text', 'La marca está en periodo de publicación.', 'delivered', '2025-09-15 11:20:00', '2025-09-15 11:20:00'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'wa_msg_006', (SELECT id FROM contacts WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' OFFSET 2 LIMIT 1), 'Klaus Bergmann', '+49170123456', 'inbound', 'text', 'Any update on NORDIKHAUS Spain?', 'delivered', '2025-09-01 10:00:00', '2025-09-01 10:00:00'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'wa_msg_007', (SELECT id FROM contacts WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' OFFSET 2 LIMIT 1), 'Klaus Bergmann', '+49170123456', 'outbound', 'text', 'Under examination at OEPM. 4-6 months.', 'delivered', '2025-09-01 10:30:00', '2025-09-01 10:30:00');

-- B5: CLIENT_PORTALS
INSERT INTO client_portals (id, organization_id, client_id, portal_name, portal_slug, is_active, created_at, created_by)
VALUES
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', (SELECT id FROM contacts WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' LIMIT 1), 'Portal GreenPower Energía', 'greenpower', true, '2025-03-01', (SELECT id FROM users LIMIT 1)),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', (SELECT id FROM contacts WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' OFFSET 1 LIMIT 1), 'Portal Olivar Premium', 'olivar-premium', true, '2025-05-01', (SELECT id FROM users LIMIT 1)),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', (SELECT id FROM contacts WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' OFFSET 2 LIMIT 1), 'Portal NordikHaus', 'nordikhaus', true, '2025-07-01', (SELECT id FROM users LIMIT 1)),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', (SELECT id FROM contacts WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' OFFSET 3 LIMIT 1), 'Portal BioVoss Pharma', 'biovoss', false, '2025-06-01', (SELECT id FROM users LIMIT 1));