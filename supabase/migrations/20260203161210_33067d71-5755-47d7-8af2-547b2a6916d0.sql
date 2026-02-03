
-- ══════════════════════════════════════════════════════
-- FASE 6B: INVOICES (con billing_client_id correctos)
-- ══════════════════════════════════════════════════════

INSERT INTO invoices (
  id, organization_id, billing_client_id, client_name, client_tax_id, client_address,
  invoice_number, invoice_date, due_date, subtotal, tax_rate, tax_amount, discount_amount, total, currency,
  status, paid_amount, paid_date, payment_method, notes, created_at
) VALUES

-- Factura 1: GreenPower — Anticipo 50%
('a1000001-0001-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'b0000001-0006-0000-0000-000000000001', 'GreenPower Energías S.L.', 'B-99887766',
 'Calle de la Innovación 8, Parque Tecnológico, 28760 Tres Cantos, España',
 'INV-2025-0001', '2025-03-01', '2025-03-31',
 7644.63, 21.00, 1605.37, 0, 9250.00, 'EUR',
 'paid', 9250.00, '2025-03-18', 'bank_transfer',
 'Anticipo 50% — Portfolio GreenPower (marcas + patente + vigilancia).', '2025-03-01T09:00:00Z'),

-- Factura 2: GreenPower — Resto 50%
('a1000001-0002-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'b0000001-0006-0000-0000-000000000001', 'GreenPower Energías S.L.', 'B-99887766',
 'Calle de la Innovación 8, Parque Tecnológico, 28760 Tres Cantos, España',
 'INV-2025-0002', '2025-10-01', '2025-10-31',
 7644.63, 21.00, 1605.37, 0, 9250.00, 'EUR',
 'paid', 9250.00, '2025-10-22', 'bank_transfer',
 'Resto 50% — Registro completado marca GREENPOWER.', '2025-10-01T09:00:00Z'),

-- Factura 3: TechFlow — Anticipo
('a1000001-0003-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'b0000001-0001-0000-0000-000000000001', 'TechFlow Solutions S.L.', 'B-87654321',
 'Paseo de la Castellana 89, Planta 12, 28046 Madrid, España',
 'INV-2025-0003', '2025-03-25', '2025-04-25',
 5289.26, 21.00, 1110.74, 0, 6400.00, 'EUR',
 'paid', 6400.00, '2025-04-10', 'bank_transfer',
 'Anticipo 50% — Paquete TechFlow (3 marcas + 1 patente).', '2025-03-25T09:00:00Z'),

-- Factura 4: TechFlow — Resto
('a1000001-0004-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'b0000001-0001-0000-0000-000000000001', 'TechFlow Solutions S.L.', 'B-87654321',
 'Paseo de la Castellana 89, Planta 12, 28046 Madrid, España',
 'INV-2025-0004', '2025-11-01', '2025-12-01',
 5289.26, 21.00, 1110.74, 0, 6400.00, 'EUR',
 'paid', 6400.00, '2025-11-20', 'bank_transfer',
 'Resto 50% — Marca TECHFLOW registrada exitosamente.', '2025-11-01T09:00:00Z'),

-- Factura 5: Olivar Premium — Completa
('a1000001-0005-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'b0000001-0002-0000-0000-000000000001', 'Olivar Premium S.A.', 'A-11223344',
 'Carretera de Jaén, Km 5, 23001 Jaén, España',
 'INV-2025-0005', '2025-05-05', '2025-06-05',
 6776.86, 21.00, 1423.14, 0, 8200.00, 'EUR',
 'paid', 8200.00, '2025-05-28', 'bank_transfer',
 'Servicios registro marcas OLIVAR PREMIUM (ES) y OLIVAR PREMIUM GOLD (EU) + vigilancia anual.', '2025-05-05T09:00:00Z'),

-- Factura 6: NordikHaus — Pendiente de pago
('a1000001-0006-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'b0000001-0004-0000-0000-000000000001', 'NordikHaus GmbH', 'DE123456789',
 'Friedrichstraße 123, 10117 Berlín, Alemania',
 'INV-2025-0006', '2025-12-15', '2026-01-15',
 5371.90, 21.00, 1128.10, 0, 6500.00, 'EUR',
 'sent', 0, NULL, NULL,
 'Servicios registro marcas NORDIKHAUS (ES) y NORDIK LIVING (PT).', '2025-12-15T09:00:00Z'),

-- Factura 7: Dra. Voss — Patente (pagada)
('a1000001-0007-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'b0000001-0003-0000-0000-000000000001', 'Dra. Elena Voss', '12345678Z',
 'Calle del Prado 15, 2ºB, 28014 Madrid, España',
 'INV-2025-0007', '2025-07-01', '2025-07-31',
 3305.79, 21.00, 694.21, 0, 4000.00, 'EUR',
 'paid', 4000.00, '2025-07-25', 'bank_transfer',
 'Honorarios presentación patente compuesto BioVoss-7 ante OEPM.', '2025-07-01T09:00:00Z');
