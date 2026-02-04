-- FASE 1D: MATTER_FILINGS (presentaciones ante oficinas)
-- Columnas: jurisdiction_code (NOT NULL), application_number, registration_number, filing_date, registration_date, status, notes

INSERT INTO matter_filings (
  id, organization_id, matter_id,
  jurisdiction_code, office_code, application_number, registration_number,
  filing_date, registration_date, grant_date, publication_date, status, notes,
  nice_classes, official_fees_paid, official_fees_currency, created_at
) VALUES

-- GREENPOWER 2025/TM/001 — OEPM Registrada
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0001-0000-0000-000000000001',
 'ES', 'OEPM', 'M-2025-001234', 'M-0001234',
 '2025-02-25', '2025-08-15', NULL, '2025-05-20', 'registered',
 'Clases 7, 9, 42. Registrada 15/08/2025.',
 ARRAY[7, 9, 42], 450.00, 'EUR', '2025-02-25'),

-- TECHFLOW 2025/TM/003 — OEPM Registrada
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0004-0000-0000-000000000001',
 'ES', 'OEPM', 'M-2025-003456', 'M-0003456',
 '2025-03-20', '2025-09-10', NULL, '2025-06-25', 'registered',
 'Clases 9, 42. Registrada 10/09/2025.',
 ARRAY[9, 42], 350.00, 'EUR', '2025-03-20'),

-- OLIVAR PREMIUM 2025/TM/006 — OEPM Registrada
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0008-0000-0000-000000000001',
 'ES', 'OEPM', 'M-2025-004567', 'M-0004567',
 '2025-05-05', '2025-10-30', NULL, '2025-08-15', 'registered',
 'Clases 29, 35. Registrada 30/10/2025.',
 ARRAY[29, 35], 350.00, 'EUR', '2025-05-05'),

-- Panel Solar 2025/PT/001 — EPO Concedida
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0003-0000-0000-000000000001',
 'EP', 'EPO', 'EP-2025-0045678', 'EP-0045678',
 '2025-02-01', NULL, '2025-09-20', '2025-06-15', 'granted',
 'Patente Panel Solar Híbrido. Concedida 20/09/2025. Válida 38 estados.',
 NULL, 3500.00, 'EUR', '2025-02-01'),

-- FLOWAI 2025/TM/004 — EUIPO Publicada
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0005-0000-0000-000000000001',
 'EU', 'EUIPO', 'EUTM-2025-018765', NULL,
 '2025-05-20', NULL, NULL, '2025-11-28', 'published',
 'Clases 9, 35, 42. Publicada 28/11/2025. Oposición hasta 28/02/2026.',
 ARRAY[9, 35, 42], 1050.00, 'EUR', '2025-05-20'),

-- OLIVAR GOLD 2025/TM/007 — EUIPO Examen
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0009-0000-0000-000000000001',
 'EU', 'EUIPO', 'EUTM-2025-025678', NULL,
 '2025-08-10', NULL, NULL, NULL, 'examination',
 'Clases 29, 30, 35. Requerimiento recibido 05/12/2025.',
 ARRAY[29, 30, 35], 1050.00, 'EUR', '2025-08-10'),

-- NORDIKHAUS 2025/TM/008 — OEPM Filed
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0011-0000-0000-000000000001',
 'ES', 'OEPM', 'M-2025-006789', NULL,
 '2025-06-15', NULL, NULL, NULL, 'filed',
 'Clases 20, 35. En examen.',
 ARRAY[20, 35], 350.00, 'EUR', '2025-06-15'),

-- NORDIK LIVING 2025/TM/009 — INPI Portugal Filed
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0012-0000-0000-000000000001',
 'PT', 'INPI', 'PT-2025-012345', NULL,
 '2025-07-01', NULL, NULL, NULL, 'filed',
 'Clases 20, 35. En examen INPI Portugal.',
 ARRAY[20, 35], 280.00, 'EUR', '2025-07-01'),

-- ECOFLOW oposición 2025/TM/011 — Resuelta
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0014-0000-0000-000000000001',
 'ES', 'OEPM', 'OPP-2025-001234', NULL,
 '2025-06-01', NULL, NULL, NULL, 'resolved',
 'Oposición contra ECOFLOW SOLAR. Estimada parcialmente.',
 NULL, 400.00, 'EUR', '2025-06-01'),

-- vs GREENTECH 2025/OPP/001 — Pendiente
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0015-0000-0000-000000000001',
 'ES', 'OEPM', 'OPP-2025-005678', NULL,
 '2025-10-01', NULL, NULL, NULL, 'pending',
 'Oposición contra GREENTECH ENERGY. Pendiente resolución.',
 NULL, 400.00, 'EUR', '2025-10-01');