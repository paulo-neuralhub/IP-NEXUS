
-- SEED DEMO: Solo matter_events (sin trigger a matters_v2)
INSERT INTO matter_events (id, organization_id, matter_id, type, title, description, event_date, created_at) VALUES 
(gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '496b0cc8-7132-4606-a233-2ceb84b1ae3d', 'note', 'Instrucciones recibidas', 'TechVerde encarga registro marca España.', '2023-05-25', '2023-05-25'),
(gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '496b0cc8-7132-4606-a233-2ceb84b1ae3d', 'filing', 'Solicitud OEPM', 'Nº M4012345. Tasas €850.', '2023-06-01', '2023-06-01'),
(gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '496b0cc8-7132-4606-a233-2ceb84b1ae3d', 'publication', 'Publicación BOPI', 'Período oposición 2 meses.', '2023-08-15', '2023-08-15'),
(gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '496b0cc8-7132-4606-a233-2ceb84b1ae3d', 'grant', 'Marca concedida', 'Registro 4012345. Vigencia 2033.', '2023-11-20', '2023-11-20'),
(gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', 'aceeac97-2301-4aa6-813f-30eb48ffb7da', 'filing', 'Solicitud EUIPO', 'Fast Track 018901234.', NOW()::date - 75, NOW() - INTERVAL '75 days'),
(gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', 'aceeac97-2301-4aa6-813f-30eb48ffb7da', 'status_change', 'En examen', 'Sin objeciones.', NOW()::date - 60, NOW() - INTERVAL '60 days'),
(gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '7784b894-dfee-4381-a9e8-8d074694cfdd', 'filing', 'Solicitud OEPM', 'BIOSALUD M4098765.', '2024-01-15', '2024-01-15'),
(gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '7784b894-dfee-4381-a9e8-8d074694cfdd', 'opposition', '⚠️ OPOSICIÓN', 'PharmaCorp opone.', NOW()::date - 65, NOW() - INTERVAL '65 days'),
(gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '7784b894-dfee-4381-a9e8-8d074694cfdd', 'deadline', '🚨 PLAZO VENCIDO', 'Respuesta oposición urgente.', NOW()::date - 3, NOW() - INTERVAL '3 days'),
(gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '01cbb070-c1cd-4b78-aa15-44dd908e0382', 'grant', 'Registro 2016', 'GLOBALLOG 012345678.', '2016-02-01', '2016-02-01'),
(gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '01cbb070-c1cd-4b78-aa15-44dd908e0382', 'renewal', '⚠️ RENOVACIÓN URGENTE', 'Vence en 5 días.', NOW()::date, NOW());

-- Update statuses
UPDATE matters SET status = 'granted', registration_number = '4012345' WHERE id = '496b0cc8-7132-4606-a233-2ceb84b1ae3d';
UPDATE matters SET status = 'pending', application_number = '018901234' WHERE id = 'aceeac97-2301-4aa6-813f-30eb48ffb7da';
UPDATE matters SET status = 'opposed', application_number = 'M4098765' WHERE id = '7784b894-dfee-4381-a9e8-8d074694cfdd';
UPDATE matters SET status = 'active', registration_number = '012345678', next_renewal_date = '2026-02-01' WHERE id = '01cbb070-c1cd-4b78-aa15-44dd908e0382';
