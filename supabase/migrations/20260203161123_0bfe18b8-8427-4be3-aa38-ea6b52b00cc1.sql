
-- ══════════════════════════════════════════════════════
-- FASE 6A: BILLING_CLIENTS (requeridos para invoices)
-- ══════════════════════════════════════════════════════

INSERT INTO billing_clients (
  id, organization_id, contact_id, legal_name, tax_id, tax_id_type,
  billing_address, billing_city, billing_postal_code, billing_country,
  billing_email, default_currency, payment_terms, is_active, created_at
) VALUES

-- GreenPower
('b0000001-0006-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'c0000001-0006-0000-0000-000000000001', 'GreenPower Energías S.L.', 'B-99887766', 'CIF',
 'Calle de la Innovación 8, Parque Tecnológico', 'Tres Cantos', '28760', 'España',
 'r.casas@greenpower-energia.es', 'EUR', 30, true, '2025-02-18T10:30:00Z'),

-- TechFlow
('b0000001-0001-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'c0000001-0001-0000-0000-000000000001', 'TechFlow Solutions S.L.', 'B-87654321', 'CIF',
 'Paseo de la Castellana 89, Planta 12', 'Madrid', '28046', 'España',
 'alejandro.ruiz@techflow.es', 'EUR', 30, true, '2025-03-05T10:00:00Z'),

-- Olivar Premium
('b0000001-0002-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'c0000001-0002-0000-0000-000000000001', 'Olivar Premium S.A.', 'A-11223344', 'CIF',
 'Carretera de Jaén, Km 5', 'Jaén', '23001', 'España',
 'f.morales@olivarpremium.com', 'EUR', 30, true, '2025-04-12T11:30:00Z'),

-- Dra. Voss
('b0000001-0003-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'c0000001-0003-0000-0000-000000000001', 'Dra. Elena Voss', '12345678Z', 'NIF',
 'Calle del Prado 15, 2ºB', 'Madrid', '28014', 'España',
 'elena.voss@gmail.com', 'EUR', 15, true, '2025-05-20T09:00:00Z'),

-- NordikHaus
('b0000001-0004-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'c0000001-0004-0000-0000-000000000001', 'NordikHaus GmbH', 'DE123456789', 'VAT',
 'Friedrichstraße 123', 'Berlín', '10117', 'Alemania',
 'k.bergmann@nordikhaus.de', 'EUR', 30, true, '2025-06-10T14:00:00Z'),

-- Sabores del Mediterráneo
('b0000001-0005-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'c0000001-0005-0000-0000-000000000001', 'Sabores del Mediterráneo S.L.', 'B-55667788', 'CIF',
 'Av. del Puerto 45', 'Valencia', '46021', 'España',
 'v.garcia@saboresmed.es', 'EUR', 30, true, '2025-07-22T16:00:00Z');
