-- Add coherent demo data: filings and timeline for WIPO trademark matters
-- Fixed: including organization_id and title in matter_timeline

-- 1. SOLARIA GREEN (WIPO) - DEMO-2026/TR/022-D77E - Add filing
INSERT INTO matter_filings (
  matter_id, organization_id, office_code, jurisdiction_code,
  application_number, filing_date, status, status_date,
  nice_classes, designated_states, official_fees_paid, official_fees_currency, notes
) VALUES (
  '30790186-04be-415f-a7f5-0a2e74b4d550',
  'a1000000-0000-0000-0000-000000000001',
  'WIPO', 'WO',
  '1567890',
  NOW() - INTERVAL '3 months',
  'pending',
  NOW() - INTERVAL '3 months',
  ARRAY[9, 35, 42],
  ARRAY['EU', 'US', 'CN', 'JP', 'KR'],
  3450.00, 'CHF',
  'Solicitud internacional Madrid Protocol'
) ON CONFLICT DO NOTHING;

-- Timeline events for SOLARIA GREEN
INSERT INTO matter_timeline (matter_id, organization_id, event_type, title, description, metadata, event_date, created_at)
VALUES 
(
  '30790186-04be-415f-a7f5-0a2e74b4d550',
  'a1000000-0000-0000-0000-000000000001',
  'filing',
  'Solicitud WIPO presentada',
  'Designaciones: EU, US, CN, JP, KR. Nº Int: 1567890. Tasas CHF 3,450.',
  '{"office": "WIPO", "application_number": "1567890", "designated_states": ["EU", "US", "CN", "JP", "KR"], "fees": 3450, "currency": "CHF"}'::jsonb,
  NOW() - INTERVAL '3 months',
  NOW() - INTERVAL '3 months'
),
(
  '30790186-04be-415f-a7f5-0a2e74b4d550',
  'a1000000-0000-0000-0000-000000000001',
  'status_change',
  'Notificación de irregularidad formal',
  'WIPO ha notificado irregularidad en la documentación',
  '{"previous_status": "filed", "new_status": "examination", "office": "WIPO"}'::jsonb,
  NOW() - INTERVAL '2 months',
  NOW() - INTERVAL '2 months'
),
(
  '30790186-04be-415f-a7f5-0a2e74b4d550',
  'a1000000-0000-0000-0000-000000000001',
  'action',
  'Respuesta a irregularidad enviada',
  'Documentación corregida presentada ante WIPO',
  '{"action_type": "response", "user": "Demo User"}'::jsonb,
  NOW() - INTERVAL '6 weeks',
  NOW() - INTERVAL '6 weeks'
),
(
  '30790186-04be-415f-a7f5-0a2e74b4d550',
  'a1000000-0000-0000-0000-000000000001',
  'status_change',
  'Examen superado',
  'Publicación pendiente en el Boletín WIPO',
  '{"previous_status": "examination", "new_status": "pending_publication"}'::jsonb,
  NOW() - INTERVAL '1 month',
  NOW() - INTERVAL '1 month'
);

-- 2. GLOBALLOG (WIPO) - DEMO-2026/TR/011-D77E - Add filing
INSERT INTO matter_filings (
  matter_id, organization_id, office_code, jurisdiction_code,
  application_number, filing_date, status, status_date,
  nice_classes, designated_states, official_fees_paid, official_fees_currency
) VALUES (
  'f6cab966-3d58-4368-8167-562beb9ee1f5',
  'a1000000-0000-0000-0000-000000000001',
  'WIPO', 'WO',
  '1523456',
  NOW() - INTERVAL '6 months',
  'registered',
  NOW() - INTERVAL '2 months',
  ARRAY[35, 39, 42],
  ARRAY['EU', 'US', 'MX', 'BR'],
  2890.00, 'CHF'
) ON CONFLICT DO NOTHING;

INSERT INTO matter_timeline (matter_id, organization_id, event_type, title, description, metadata, event_date, created_at)
VALUES 
(
  'f6cab966-3d58-4368-8167-562beb9ee1f5',
  'a1000000-0000-0000-0000-000000000001',
  'filing',
  'Solicitud WIPO presentada',
  'Designaciones: EU, US, MX, BR. Nº Int: 1523456. Tasas CHF 2,890.',
  '{"office": "WIPO", "application_number": "1523456"}'::jsonb,
  NOW() - INTERVAL '6 months',
  NOW() - INTERVAL '6 months'
),
(
  'f6cab966-3d58-4368-8167-562beb9ee1f5',
  'a1000000-0000-0000-0000-000000000001',
  'status_change',
  'Publicación internacional',
  'Publicado en Gaceta WIPO nº WO/2025/45',
  '{"gazette_number": "WO/2025/45"}'::jsonb,
  NOW() - INTERVAL '4 months',
  NOW() - INTERVAL '4 months'
),
(
  'f6cab966-3d58-4368-8167-562beb9ee1f5',
  'a1000000-0000-0000-0000-000000000001',
  'status_change',
  'Registro concedido',
  'Registro concedido en todas las designaciones (EU, US, MX, BR)',
  '{"new_status": "registered"}'::jsonb,
  NOW() - INTERVAL '2 months',
  NOW() - INTERVAL '2 months'
);

-- 3. BIOSALUD PHARMA (EU) - Add timeline
INSERT INTO matter_timeline (matter_id, organization_id, event_type, title, description, metadata, event_date, created_at)
VALUES 
(
  '4c147e28-9359-438f-b463-e966d51ce3c6',
  'a1000000-0000-0000-0000-000000000001',
  'filing',
  'Solicitud EUIPO presentada',
  'Solicitud nº 018765432 presentada ante EUIPO',
  '{"office": "EUIPO", "application_number": "018765432"}'::jsonb,
  NOW() - INTERVAL '8 months',
  NOW() - INTERVAL '8 months'
),
(
  '4c147e28-9359-438f-b463-e966d51ce3c6',
  'a1000000-0000-0000-0000-000000000001',
  'status_change',
  'Publicación en Boletín EUIPO',
  'Publicado en EUTM Bulletin nº 2025/089',
  '{"gazette_number": "EUTM/2025/089"}'::jsonb,
  NOW() - INTERVAL '5 months',
  NOW() - INTERVAL '5 months'
),
(
  '4c147e28-9359-438f-b463-e966d51ce3c6',
  'a1000000-0000-0000-0000-000000000001',
  'opposition',
  'Oposición recibida',
  'PHARMA GLOBAL Ltd ha presentado oposición basada en Art. 8(1)(b) EUTMR',
  '{"opponent": "PHARMA GLOBAL Ltd", "grounds": "Art. 8(1)(b) EUTMR"}'::jsonb,
  NOW() - INTERVAL '3 months',
  NOW() - INTERVAL '3 months'
),
(
  '4c147e28-9359-438f-b463-e966d51ce3c6',
  'a1000000-0000-0000-0000-000000000001',
  'action',
  'Contestación a oposición presentada',
  'Escrito de contestación presentado dentro de plazo',
  '{"deadline_met": true}'::jsonb,
  NOW() - INTERVAL '2 months',
  NOW() - INTERVAL '2 months'
);

-- 4. MEDITERRÁNEA (ES) - Add timeline
INSERT INTO matter_timeline (matter_id, organization_id, event_type, title, description, metadata, event_date, created_at)
VALUES 
(
  'cfd049b3-ac1f-4a56-b191-0edd8b805b46',
  'a1000000-0000-0000-0000-000000000001',
  'filing',
  'Solicitud OEPM presentada',
  'Solicitud nº M4012345 presentada ante OEPM',
  '{"office": "OEPM", "application_number": "M4012345"}'::jsonb,
  NOW() - INTERVAL '14 months',
  NOW() - INTERVAL '14 months'
),
(
  'cfd049b3-ac1f-4a56-b191-0edd8b805b46',
  'a1000000-0000-0000-0000-000000000001',
  'status_change',
  'Publicación en BOPI',
  'Publicado en BOPI nº 2025/15',
  '{"bopi_number": "2025/15"}'::jsonb,
  NOW() - INTERVAL '10 months',
  NOW() - INTERVAL '10 months'
),
(
  'cfd049b3-ac1f-4a56-b191-0edd8b805b46',
  'a1000000-0000-0000-0000-000000000001',
  'status_change',
  'Marca registrada',
  'Concesión definitiva - Registro nº M4012345',
  '{"registration_number": "M4012345"}'::jsonb,
  NOW() - INTERVAL '6 months',
  NOW() - INTERVAL '6 months'
);