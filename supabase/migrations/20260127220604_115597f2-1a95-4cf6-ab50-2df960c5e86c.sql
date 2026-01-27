
-- SEED: Demo events for SOLARIA GREEN (WIPO) - the matter user is viewing
INSERT INTO matter_events (id, organization_id, matter_id, type, title, description, event_date, created_at) VALUES 
(gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '30790186-04be-415f-a7f5-0a2e74b4d550', 'note', 'Instrucciones recibidas', 'Cliente solicita protección internacional de marca SOLARIA GREEN vía Sistema de Madrid.', NOW()::date - 90, NOW() - INTERVAL '90 days'),
(gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '30790186-04be-415f-a7f5-0a2e74b4d550', 'filing', 'Solicitud WIPO presentada', 'Designaciones: EU, US, CN, JP, KR. Nº Int: 1567890. Tasas CHF 3,450.', NOW()::date - 85, NOW() - INTERVAL '85 days'),
(gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '30790186-04be-415f-a7f5-0a2e74b4d550', 'receipt', 'Confirmación OMPI', 'Recibido acuse de recibo. Examen formal en curso.', NOW()::date - 80, NOW() - INTERVAL '80 days'),
(gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '30790186-04be-415f-a7f5-0a2e74b4d550', 'examination', 'Notificación US (USPTO)', 'USPTO emite office action: solicita distinctiveness disclaimer.', NOW()::date - 45, NOW() - INTERVAL '45 days'),
(gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '30790186-04be-415f-a7f5-0a2e74b4d550', 'status_change', 'Protección concedida EU', 'EUIPO confirma protección sin oposiciones.', NOW()::date - 30, NOW() - INTERVAL '30 days'),
(gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '30790186-04be-415f-a7f5-0a2e74b4d550', 'deadline', 'Pendiente respuesta USPTO', 'Plazo para responder office action: 6 meses desde notificación.', NOW()::date + 135, NOW());

-- SEED: Demo events for all other demo matters without events
INSERT INTO matter_events (id, organization_id, matter_id, type, title, description, event_date, created_at)
SELECT 
  gen_random_uuid(),
  m.organization_id,
  m.id,
  'note',
  'Expediente creado',
  'Expediente iniciado para ' || COALESCE(m.mark_name, m.title),
  m.created_at::date,
  m.created_at
FROM matters m
LEFT JOIN matter_events e ON m.id = e.matter_id
WHERE m.organization_id = 'a1000000-0000-0000-0000-000000000001'
  AND e.id IS NULL;
