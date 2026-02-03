-- STABILITY-02C: Corrección crítica datos demo Meridian IP

-- 1. Crear organization_subscriptions para Enterprise
INSERT INTO organization_subscriptions (
  id, organization_id, plan_id, status, billing_cycle,
  current_period_start, current_period_end, credit_balance
) VALUES (
  gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001',
  '53e6c8bd-5625-4c2d-9c6c-79b43cf62b3c', 'active', 'yearly',
  '2025-01-01', '2026-12-31', 1000.00
) ON CONFLICT (organization_id) DO UPDATE SET
  plan_id = EXCLUDED.plan_id, status = 'active', current_period_end = '2026-12-31';

-- 2. Vincular matters.account_id a crm_accounts
UPDATE matters SET account_id = 'a0000001-0001-0000-0000-000000000001'::uuid
WHERE organization_id = 'd0000001-0000-0000-0000-000000000001'
AND client_id = 'c0000001-0001-0000-0000-000000000001' AND account_id IS NULL;

UPDATE matters SET account_id = 'a0000001-0002-0000-0000-000000000001'::uuid
WHERE organization_id = 'd0000001-0000-0000-0000-000000000001'
AND client_id = 'c0000001-0002-0000-0000-000000000001' AND account_id IS NULL;

UPDATE matters SET account_id = 'a0000001-0003-0000-0000-000000000001'::uuid
WHERE organization_id = 'd0000001-0000-0000-0000-000000000001'
AND client_id = 'c0000001-0003-0000-0000-000000000001' AND account_id IS NULL;

UPDATE matters SET account_id = 'a0000001-0004-0000-0000-000000000001'::uuid
WHERE organization_id = 'd0000001-0000-0000-0000-000000000001'
AND client_id = 'c0000001-0004-0000-0000-000000000001' AND account_id IS NULL;

UPDATE matters SET account_id = 'a0000001-0005-0000-0000-000000000001'::uuid
WHERE organization_id = 'd0000001-0000-0000-0000-000000000001'
AND client_id = 'c0000001-0005-0000-0000-000000000001' AND account_id IS NULL;

UPDATE matters SET account_id = 'a0000001-0006-0000-0000-000000000001'::uuid
WHERE organization_id = 'd0000001-0000-0000-0000-000000000001'
AND client_id = 'c0000001-0006-0000-0000-000000000001' AND account_id IS NULL;

-- 3. Vincular invoices a matters
UPDATE invoices SET matter_id = '10000001-0001-0000-0000-000000000001'::uuid
WHERE id = 'a1000001-0001-0000-0000-000000000001'::uuid;
UPDATE invoices SET matter_id = '10000001-0002-0000-0000-000000000001'::uuid
WHERE id = 'a1000001-0002-0000-0000-000000000001'::uuid;
UPDATE invoices SET matter_id = '10000001-0004-0000-0000-000000000001'::uuid
WHERE id = 'a1000001-0003-0000-0000-000000000001'::uuid;
UPDATE invoices SET matter_id = '10000001-0005-0000-0000-000000000001'::uuid
WHERE id = 'a1000001-0004-0000-0000-000000000001'::uuid;
UPDATE invoices SET matter_id = '10000001-0008-0000-0000-000000000001'::uuid
WHERE id = 'a1000001-0005-0000-0000-000000000001'::uuid;
UPDATE invoices SET matter_id = '10000001-0011-0000-0000-000000000001'::uuid
WHERE id = 'a1000001-0006-0000-0000-000000000001'::uuid;
UPDATE invoices SET matter_id = '10000001-0010-0000-0000-000000000001'::uuid
WHERE id = 'a1000001-0007-0000-0000-000000000001'::uuid;

-- 4. Avanzar matters a fases realistas
UPDATE matters SET current_phase = 'F8', workflow_progress = 90
WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' AND status = 'registered';
UPDATE matters SET current_phase = 'F6', workflow_progress = 60
WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' AND status = 'pending';
UPDATE matters SET current_phase = 'F8', workflow_progress = 90
WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' AND status = 'granted';
UPDATE matters SET current_phase = 'F5', workflow_progress = 50
WHERE organization_id = 'd0000001-0000-0000-0000-000000000001' AND status = 'filed';

-- 5. Actualizar deadlines y tasks con fechas
UPDATE matter_deadlines SET 
  deadline_date = CASE 
    WHEN status = 'overdue' THEN (CURRENT_DATE - 10)::date
    WHEN status = 'pending' THEN (CURRENT_DATE + 30)::date
    WHEN status = 'completed' THEN (CURRENT_DATE - 5)::date
    ELSE deadline_date END
WHERE organization_id = 'd0000001-0000-0000-0000-000000000001';

UPDATE crm_tasks SET due_date = CASE 
    WHEN status = 'pending' THEN (CURRENT_DATE + 7)::date
    WHEN status = 'in_progress' THEN (CURRENT_DATE + 3)::date
    WHEN status = 'completed' THEN (CURRENT_DATE - 2)::date
    ELSE CURRENT_DATE END
WHERE organization_id = 'd0000001-0000-0000-0000-000000000001';

-- 6. Insertar quotes
INSERT INTO quotes (id, organization_id, quote_number, billing_client_id, client_name,
  quote_date, valid_until, subtotal, tax_rate, tax_amount, total, currency, status)
VALUES
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'QT-2025-0001', 
 'b0000001-0006-0000-0000-000000000001', 'GreenPower Energías S.L.',
 '2025-01-15', '2025-02-15', 7643, 21, 1605, 9248, 'EUR', 'accepted'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'QT-2025-0002',
 'b0000001-0001-0000-0000-000000000001', 'TechFlow Solutions S.L.',
 '2025-02-10', '2025-03-10', 5289, 21, 1110, 6399, 'EUR', 'accepted'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'QT-2025-0003',
 'b0000001-0002-0000-0000-000000000001', 'Olivar Premium S.A.',
 '2025-03-01', '2025-03-31', 6776, 21, 1422, 8198, 'EUR', 'accepted'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'QT-2025-0004',
 'b0000001-0004-0000-0000-000000000001', 'NordikHaus GmbH',
 '2025-04-05', '2025-05-05', 5371, 21, 1127, 6498, 'EUR', 'sent')
ON CONFLICT (quote_number, organization_id) DO NOTHING;

-- 7. Insertar time_entries
INSERT INTO time_entries (id, organization_id, matter_id, user_id, description, 
  duration_minutes, billing_rate, billing_amount, date, is_billable, billing_status)
VALUES
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0001-0000-0000-000000000001',
 '0090b656-5c9a-445c-91be-34228afb2b0f', 'Búsqueda anterioridades', 150, 150, 375, '2025-01-20', true, 'billed'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0004-0000-0000-000000000001',
 '0090b656-5c9a-445c-91be-34228afb2b0f', 'Análisis TECHFLOW', 120, 150, 300, '2025-02-15', true, 'approved'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0003-0000-0000-000000000001',
 '0090b656-5c9a-445c-91be-34228afb2b0f', 'Redacción patente', 300, 200, 1000, '2025-02-28', true, 'billed'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0008-0000-0000-000000000001',
 '0090b656-5c9a-445c-91be-34228afb2b0f', 'Gestión oposición', 180, 175, 525, '2025-03-10', true, 'approved');