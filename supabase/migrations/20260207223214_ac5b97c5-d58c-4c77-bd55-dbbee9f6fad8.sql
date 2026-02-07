
-- ===================================================================
-- SEED: Demo service transactions + milestones
-- ===================================================================

-- TX-1: In progress (buyer = current user, seller = María López)
INSERT INTO market_service_transactions (
  id, transaction_number, request_id, offer_id,
  buyer_user_id, buyer_organization_id,
  seller_user_id, seller_organization_id,
  currency, professional_fees, official_fees,
  platform_fee_seller, platform_fee_buyer,
  total_amount, escrow_held, escrow_released,
  status, buyer_confirmed, seller_confirmed,
  buyer_reviewed, seller_reviewed,
  created_at, updated_at
) VALUES (
  'b1b1b1b1-b1b1-4b1b-b1b1-b1b1b1b1b1b1',
  'TX-2026-000001',
  '037370d4-f40d-4821-ba1d-e3600f593413',
  '3d0f43a4-a135-4d0c-aac3-1acfda69e946',
  '0090b656-5c9a-445c-91be-34228afb2b0f',
  'c8a6c1e7-ffba-48f3-9b09-ea8cc122c683',
  NULL, NULL,
  'EUR', 850.00, 1050.00,
  85.00, 42.50,
  1942.50, 1942.50, 127.50,
  'in_progress', false, false,
  false, false,
  NOW() - INTERVAL '15 days', NOW()
);

UPDATE rfq_quotes SET status = 'awarded', awarded_at = NOW() - INTERVAL '15 days' WHERE id = '3d0f43a4-a135-4d0c-aac3-1acfda69e946';
UPDATE rfq_quotes SET status = 'rejected', rejected_at = NOW() - INTERVAL '15 days' WHERE request_id = '037370d4-f40d-4821-ba1d-e3600f593413' AND id != '3d0f43a4-a135-4d0c-aac3-1acfda69e946';
UPDATE rfq_requests SET status = 'awarded', awarded_quote_id = '3d0f43a4-a135-4d0c-aac3-1acfda69e946', awarded_at = NOW() - INTERVAL '15 days' WHERE id = '037370d4-f40d-4821-ba1d-e3600f593413';

INSERT INTO market_milestones (id, transaction_id, name, description, sequence_order, amount, percentage, status, delivered_at, delivered_note, approved_at, payment_released, payment_released_at, created_at) VALUES
('c1c1c1c1-0001-4c1c-c1c1-c1c1c1c1c1c1', 'b1b1b1b1-b1b1-4b1b-b1b1-b1b1b1b1b1b1', 'Búsqueda anterioridades', 'Búsqueda exhaustiva en base EUIPO + OEPM', 1, 127.50, 15, 'approved', NOW()-INTERVAL '10 days', 'Informe adjunto. Sin marcas conflictivas.', NOW()-INTERVAL '8 days', true, NOW()-INTERVAL '8 days', NOW()-INTERVAL '15 days'),
('c1c1c1c1-0002-4c1c-c1c1-c1c1c1c1c1c1', 'b1b1b1b1-b1b1-4b1b-b1b1-b1b1b1b1b1b1', 'Presentación solicitud', 'Preparación y presentación electrónica ante EUIPO', 2, 297.50, 35, 'in_progress', NULL, NULL, NULL, false, NULL, NOW()-INTERVAL '15 days'),
('c1c1c1c1-0003-4c1c-c1c1-c1c1c1c1c1c1', 'b1b1b1b1-b1b1-4b1b-b1b1-b1b1b1b1b1b1', 'Seguimiento y respuesta', 'Seguimiento del expediente y respuesta a objeciones', 3, 212.50, 25, 'pending', NULL, NULL, NULL, false, NULL, NOW()-INTERVAL '15 days'),
('c1c1c1c1-0004-4c1c-c1c1-c1c1c1c1c1c1', 'b1b1b1b1-b1b1-4b1b-b1b1-b1b1b1b1b1b1', 'Registro final', 'Obtención del certificado de registro', 4, 212.50, 25, 'pending', NULL, NULL, NULL, false, NULL, NOW()-INTERVAL '15 days');

-- TX-2: Pending payment (buyer = current user, seller = Tanaka)
INSERT INTO market_service_transactions (
  id, transaction_number, request_id, offer_id,
  buyer_user_id, buyer_organization_id,
  seller_user_id, seller_organization_id,
  currency, professional_fees, official_fees,
  platform_fee_seller, platform_fee_buyer,
  total_amount, escrow_held, escrow_released,
  status, buyer_confirmed, seller_confirmed,
  buyer_reviewed, seller_reviewed,
  created_at, updated_at
) VALUES (
  'b2b2b2b2-b2b2-4b2b-b2b2-b2b2b2b2b2b2',
  'TX-2026-000002',
  '535ecd14-23bc-4c1e-b568-0c65ee7d3b18',
  '621c5da2-0f1f-4111-b908-cc3889f02a7d',
  '0090b656-5c9a-445c-91be-34228afb2b0f',
  'c8a6c1e7-ffba-48f3-9b09-ea8cc122c683',
  NULL, NULL,
  'EUR', 700.00, 450.00,
  70.00, 35.00,
  1185.00, 0, 0,
  'pending_payment', false, false,
  false, false,
  NOW() - INTERVAL '2 days', NOW()
);

UPDATE rfq_quotes SET status = 'awarded', awarded_at = NOW()-INTERVAL '2 days' WHERE id = '621c5da2-0f1f-4111-b908-cc3889f02a7d';
UPDATE rfq_quotes SET status = 'rejected', rejected_at = NOW()-INTERVAL '2 days' WHERE request_id = '535ecd14-23bc-4c1e-b568-0c65ee7d3b18' AND id != '621c5da2-0f1f-4111-b908-cc3889f02a7d';
UPDATE rfq_requests SET status = 'awarded', awarded_quote_id = '621c5da2-0f1f-4111-b908-cc3889f02a7d', awarded_at = NOW()-INTERVAL '2 days' WHERE id = '535ecd14-23bc-4c1e-b568-0c65ee7d3b18';

INSERT INTO market_milestones (id, transaction_id, name, description, sequence_order, amount, percentage, status, created_at) VALUES
('c2c2c2c2-0001-4c2c-c2c2-c2c2c2c2c2c2', 'b2b2b2b2-b2b2-4b2b-b2b2-b2b2b2b2b2b2', 'Verificación CNIPA', 'Verificación de disponibilidad', 1, 70.00, 10, 'pending', NOW()-INTERVAL '2 days'),
('c2c2c2c2-0002-4c2c-c2c2-c2c2c2c2c2c2', 'b2b2b2b2-b2b2-4b2b-b2b2-b2b2b2b2b2b2', 'Presentación prioritaria', 'Presentación urgente ante CNIPA', 2, 350.00, 50, 'pending', NOW()-INTERVAL '2 days'),
('c2c2c2c2-0003-4c2c-c2c2-c2c2c2c2c2c2', 'b2b2b2b2-b2b2-4b2b-b2b2-b2b2b2b2b2b2', 'Seguimiento', 'Seguimiento del expediente', 3, 175.00, 25, 'pending', NOW()-INTERVAL '2 days'),
('c2c2c2c2-0004-4c2c-c2c2-c2c2c2c2c2c2', 'b2b2b2b2-b2b2-4b2b-b2b2-b2b2b2b2b2b2', 'Registro', 'Obtención certificado', 4, 105.00, 15, 'pending', NOW()-INTERVAL '2 days');

-- TX-3: Completed (buyer = current user, seller = James Taylor)
INSERT INTO market_service_transactions (
  id, transaction_number, request_id, offer_id,
  buyer_user_id, buyer_organization_id,
  seller_user_id, seller_organization_id,
  currency, professional_fees, official_fees,
  platform_fee_seller, platform_fee_buyer,
  total_amount, escrow_held, escrow_released,
  status, buyer_confirmed, seller_confirmed,
  buyer_reviewed, seller_reviewed,
  completed_at, created_at, updated_at
) VALUES (
  'b3b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3',
  'TX-2026-000003',
  '52c7a8fd-2fd3-4a09-800f-8ce9e92bcd28',
  '3c33ae17-1b2f-42e0-9b17-dbd9f1a44d40',
  '0090b656-5c9a-445c-91be-34228afb2b0f',
  'c8a6c1e7-ffba-48f3-9b09-ea8cc122c683',
  NULL, NULL,
  'EUR', 500.00, 150.00,
  50.00, 25.00,
  675.00, 675.00, 500.00,
  'completed', true, true,
  false, false,
  NOW()-INTERVAL '5 days',
  NOW()-INTERVAL '30 days', NOW()-INTERVAL '5 days'
);

UPDATE rfq_quotes SET status = 'awarded' WHERE id = '3c33ae17-1b2f-42e0-9b17-dbd9f1a44d40';
UPDATE rfq_requests SET status = 'awarded', awarded_quote_id = '3c33ae17-1b2f-42e0-9b17-dbd9f1a44d40' WHERE id = '52c7a8fd-2fd3-4a09-800f-8ce9e92bcd28';

INSERT INTO market_milestones (id, transaction_id, name, description, sequence_order, amount, percentage, status, delivered_at, approved_at, payment_released, payment_released_at, created_at) VALUES
('c3c3c3c3-0001-4c3c-c3c3-c3c3c3c3c3c3', 'b3b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3', 'Búsqueda', 'Búsqueda de anterioridades', 1, 100.00, 20, 'approved', NOW()-INTERVAL '25 days', NOW()-INTERVAL '23 days', true, NOW()-INTERVAL '23 days', NOW()-INTERVAL '30 days'),
('c3c3c3c3-0002-4c3c-c3c3-c3c3c3c3c3c3', 'b3b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3', 'Presentación', 'Presentación ante OEPM', 2, 200.00, 40, 'approved', NOW()-INTERVAL '18 days', NOW()-INTERVAL '16 days', true, NOW()-INTERVAL '16 days', NOW()-INTERVAL '30 days'),
('c3c3c3c3-0003-4c3c-c3c3-c3c3c3c3c3c3', 'b3b3b3b3-b3b3-4b3b-b3b3-b3b3b3b3b3b3', 'Registro', 'Certificado de registro', 3, 200.00, 40, 'approved', NOW()-INTERVAL '8 days', NOW()-INTERVAL '5 days', true, NOW()-INTERVAL '5 days', NOW()-INTERVAL '30 days');
