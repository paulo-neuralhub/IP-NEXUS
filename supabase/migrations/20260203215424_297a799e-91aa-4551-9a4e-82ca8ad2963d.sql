-- =============================================================
-- STABILITY-02C FINAL: Activities, Expenses, Market
-- =============================================================

-- =====================
-- PASO 17: CRM Activities (vinculadas a deals)
-- =====================
INSERT INTO crm_activities (
  id, organization_id, deal_id,
  activity_type, subject, description,
  metadata,
  created_by, scheduled_at, created_at
) VALUES
('a1000001-0001-0000-0000-000000000001',
 'd0000001-0000-0000-0000-000000000001',
 'd1000001-0000-0000-0000-000000000001',
 'meeting', 'Reunión inicial GreenPower', 'Primera reunión con Roberto Casas en evento AEMPI Madrid.',
 '{"contact_name": "Roberto Casas Martínez"}'::jsonb,
 '0090b656-5c9a-445c-91be-34228afb2b0f', '2025-02-12', '2025-02-12'),

('a1000001-0002-0000-0000-000000000001',
 'd0000001-0000-0000-0000-000000000001',
 'd1000001-0000-0000-0000-000000000002',
 'call', 'Llamada cualificación TechFlow', 'Llamada con Alejandro Ruiz para entender necesidades IP de la startup.',
 '{"contact_name": "Alejandro Ruiz Martín"}'::jsonb,
 '0090b656-5c9a-445c-91be-34228afb2b0f', '2025-03-07', '2025-03-07'),

('a1000001-0003-0000-0000-000000000001',
 'd0000001-0000-0000-0000-000000000001',
 'd1000001-0000-0000-0000-000000000003',
 'meeting', 'Reunión Expoliva Olivar Premium', 'Contacto en feria Expoliva. Francisco interesado en proteger marca UE.',
 '{"contact_name": "Francisco Morales Ruiz"}'::jsonb,
 '0090b656-5c9a-445c-91be-34228afb2b0f', '2025-04-17', '2025-04-17'),

('a1000001-0004-0000-0000-000000000001',
 'd0000001-0000-0000-0000-000000000001',
 'd1000001-0000-0000-0000-000000000001',
 'email', 'Envío certificado GREENPOWER a Roberto', 'Email con certificado oficial de registro de marca.',
 '{"contact_name": "Roberto Casas Martínez"}'::jsonb,
 '0090b656-5c9a-445c-91be-34228afb2b0f', '2025-08-16', '2025-08-16'),

('a1000001-0005-0000-0000-000000000001',
 'd0000001-0000-0000-0000-000000000001',
 'd1000001-0000-0000-0000-000000000006',
 'call', 'Consulta requerimiento BioVoss-7', 'Llamada para discutir datos experimentales necesarios.',
 '{"contact_name": "Patricia Molina"}'::jsonb,
 '0090b656-5c9a-445c-91be-34228afb2b0f', '2025-12-10', '2025-12-10'),

('a1000001-0006-0000-0000-000000000001',
 'd0000001-0000-0000-0000-000000000001',
 'd1000001-0000-0000-0000-000000000005',
 'email', 'Respuesta estado NORDIKHAUS a Klaus', 'Email informando estado examen formal OEPM.',
 '{"contact_name": "Klaus Bergmann"}'::jsonb,
 '0090b656-5c9a-445c-91be-34228afb2b0f', '2026-01-11', '2026-01-11'),

('a1000001-0007-0000-0000-000000000001',
 'd0000001-0000-0000-0000-000000000001',
 'd1000001-0000-0000-0000-000000000001',
 'note', 'Alerta vigilancia GREENTECH', 'Detectada marca GREENTECH ENERGY con 82% similitud. Decidido presentar oposición.',
 '{}'::jsonb,
 '0090b656-5c9a-445c-91be-34228afb2b0f', '2025-09-16', '2025-09-16'),

('a1000001-0008-0000-0000-000000000001',
 'd0000001-0000-0000-0000-000000000001',
 'd1000001-0000-0000-0000-000000000004',
 'meeting', 'Negociación Sabores Mediterráneo', 'Reunión para presentar propuesta protección marca franquicia.',
 '{"contact_name": "Valentina García Serrano"}'::jsonb,
 '0090b656-5c9a-445c-91be-34228afb2b0f', '2025-07-20', '2025-07-20')

ON CONFLICT (id) DO UPDATE SET activity_type = EXCLUDED.activity_type;

-- =====================
-- PASO 18: Expenses (5) - UUIDs corregidos
-- =====================
INSERT INTO expenses (
  id, organization_id, matter_id, user_id,
  description, category, amount, currency,
  vat_rate, vat_amount, total_amount,
  status, billing_status, is_billable,
  date, created_at
) VALUES
('e0000001-0001-0000-0000-000000000002',
 'd0000001-0000-0000-0000-000000000001',
 '10000001-0001-0000-0000-000000000001',
 '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Tasa registro marca OEPM GREENPOWER', 'official_fees', 850.00, 'EUR',
 0, 0, 850.00,
 'approved', 'billed', true,
 '2025-02-20', '2025-02-20'),

('e0000001-0002-0000-0000-000000000002',
 'd0000001-0000-0000-0000-000000000001',
 '10000001-0005-0000-0000-000000000001',
 '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Tasa solicitud EUIPO FLOWAI (3 clases)', 'official_fees', 1050.00, 'EUR',
 0, 0, 1050.00,
 'approved', 'billed', true,
 '2025-05-20', '2025-05-20'),

('e0000001-0003-0000-0000-000000000002',
 'd0000001-0000-0000-0000-000000000001',
 '10000001-0003-0000-0000-000000000001',
 '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Tasa concesión patente EPO Panel Solar', 'official_fees', 3200.00, 'EUR',
 0, 0, 3200.00,
 'approved', 'billed', true,
 '2025-09-20', '2025-09-20'),

('e0000001-0004-0000-0000-000000000002',
 'd0000001-0000-0000-0000-000000000001',
 '10000001-0011-0000-0000-000000000001',
 '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Traducción jurada poder NordikHaus', 'translation', 450.00, 'EUR',
 21, 94.50, 544.50,
 'approved', 'billed', true,
 '2025-06-08', '2025-06-08'),

('e0000001-0005-0000-0000-000000000002',
 'd0000001-0000-0000-0000-000000000001',
 NULL,
 '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Suscripción base datos marcas WIPO Global Brand', 'subscription', 1200.00, 'EUR',
 21, 252.00, 1452.00,
 'approved', 'unbilled', false,
 '2025-01-15', '2025-01-15')

ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount;