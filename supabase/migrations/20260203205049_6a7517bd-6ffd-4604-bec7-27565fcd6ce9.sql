-- MIGRACIÓN FINAL: Datos demo sin documento

-- 1. CRM DEALS (6)
INSERT INTO crm_deals (id, organization_id, name, stage, amount, probability, won, account_id, opportunity_type, expected_close_date, created_at) VALUES
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'Registro Marca TECHFLOW', 'won', 8500.00, 100, true, 'a0000001-0001-0000-0000-000000000001', 'new_business', '2025-11-15', NOW() - INTERVAL '45 days'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'Vigilancia Anual', 'won', 3600.00, 100, true, 'a0000001-0002-0000-0000-000000000001', 'recurring', '2025-10-01', NOW() - INTERVAL '60 days'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'Patente ByteForge', 'won', 12000.00, 100, true, 'a0000001-0003-0000-0000-000000000001', 'new_business', '2025-12-20', NOW() - INTERVAL '30 days'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'Portfolio GreenLeaf', 'negotiation', 15000.00, 60, NULL, 'a0000001-0004-0000-0000-000000000001', 'expansion', '2026-02-28', NOW() - INTERVAL '10 days'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'Oposición Artisan', 'proposal', 6500.00, 40, NULL, 'a0000001-0005-0000-0000-000000000001', 'new_business', '2026-03-15', NOW() - INTERVAL '5 days'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'Auditoría NexGen', 'proposal', 4500.00, 35, NULL, 'a0000001-0006-0000-0000-000000000001', 'new_business', '2026-03-30', NOW() - INTERVAL '3 days');

-- 2. MATTER_DEADLINES (8)
INSERT INTO matter_deadlines (id, organization_id, matter_id, deadline_type, rule_code, title, description, deadline_date, trigger_date, status, priority, created_at) VALUES
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0001-0000-0000-000000000001', 'response', 'OPP_RESP', 'Respuesta oposición', 'Contestación', NOW() - INTERVAL '5 days', NOW() - INTERVAL '35 days', 'overdue', 'critical', NOW() - INTERVAL '30 days'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0002-0000-0000-000000000001', 'renewal', 'TM_RENEW', 'Renovación marca', 'Decenal', NOW() + INTERVAL '3 days', NOW() - INTERVAL '30 days', 'pending', 'high', NOW() - INTERVAL '60 days'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0003-0000-0000-000000000001', 'filing', 'PT_NAT', 'Fase nacional', 'PCT', NOW() + INTERVAL '10 days', NOW() - INTERVAL '170 days', 'pending', 'high', NOW() - INTERVAL '180 days'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0004-0000-0000-000000000001', 'response', 'EXAM_RESP', 'Examen fondo', 'Contestación', NOW() + INTERVAL '25 days', NOW() - INTERVAL '20 days', 'pending', 'normal', NOW() - INTERVAL '45 days'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0005-0000-0000-000000000001', 'annuity', 'PT_ANN', 'Anualidad', 'Año 3', NOW() + INTERVAL '45 days', NOW() - INTERVAL '300 days', 'pending', 'normal', NOW() - INTERVAL '330 days'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0006-0000-0000-000000000001', 'filing', 'TM_FILE', 'Solicitud', 'OEPM', NOW() - INTERVAL '15 days', NOW() - INTERVAL '45 days', 'completed', 'high', NOW() - INTERVAL '25 days'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0007-0000-0000-000000000001', 'response', 'OPP_RESP', 'Oposición', 'Presentada', NOW() - INTERVAL '20 days', NOW() - INTERVAL '50 days', 'completed', 'critical', NOW() - INTERVAL '35 days'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0008-0000-0000-000000000001', 'renewal', 'TM_RENEW', 'Cancelada', 'Cliente', NOW() + INTERVAL '60 days', NOW(), 'cancelled', 'low', NOW() - INTERVAL '10 days');

-- 3. WATCHLISTS (3)
INSERT INTO watchlists (id, organization_id, name, description, type, watch_type, watch_terms, watch_classes, watch_jurisdictions, is_active, run_frequency, created_at) VALUES
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'TECHFLOW Vigilancia', 'Marcas', 'trademark', 'text', ARRAY['techflow'], ARRAY[9, 35], ARRAY['ES', 'EU'], true, 'daily', NOW() - INTERVAL '90 days'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'ByteForge Patentes', 'IA', 'patent', 'text', ARRAY['machine learning'], ARRAY[9, 42], ARRAY['ES', 'EU'], true, 'weekly', NOW() - INTERVAL '60 days'),
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'GreenLeaf Dominios', 'Redes', 'domain', 'text', ARRAY['greenleaf'], ARRAY[29], ARRAY['ES'], true, 'daily', NOW() - INTERVAL '30 days');

-- 4. CONTACTO ADICIONAL
INSERT INTO crm_contacts (id, organization_id, account_id, full_name, email, phone, is_lead, tags, created_at) VALUES
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', 'a0000001-0006-0000-0000-000000000001', 'David Martínez', 'david@greenpower.es', '+34612345678', false, ARRAY['tech'], NOW() - INTERVAL '5 days');