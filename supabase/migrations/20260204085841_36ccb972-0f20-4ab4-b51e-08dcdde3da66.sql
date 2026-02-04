-- FASE 1E: MATTER_DEADLINES adicionales (valores correctos: low, normal, high, critical)
INSERT INTO matter_deadlines (
  id, organization_id, matter_id,
  deadline_type, title, description,
  trigger_date, deadline_date, status, priority,
  created_at, auto_generated, source
) VALUES

-- Plazos completados (historial) para expedientes F9
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0001-0000-0000-000000000001',
 'opposition', 'Periodo oposición GREENPOWER', 'Periodo 2 meses BOPI. Sin oposiciones recibidas.',
 '2025-05-20', '2025-07-20', 'completed', 'normal',
 '2025-05-20', false, 'manual'),

(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0004-0000-0000-000000000001',
 'opposition', 'Periodo oposición TECHFLOW', 'Sin oposiciones recibidas.',
 '2025-06-25', '2025-08-25', 'completed', 'normal',
 '2025-06-25', false, 'manual'),

(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0008-0000-0000-000000000001',
 'opposition', 'Periodo oposición OLIVAR PREMIUM', 'Sin oposiciones recibidas.',
 '2025-08-15', '2025-10-15', 'completed', 'normal',
 '2025-08-15', false, 'manual'),

-- Plazos futuros activos
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0009-0000-0000-000000000001',
 'response', 'Responder requerimiento EUIPO Olivar Gold', 'Ampliación descripción clase 30.',
 '2025-12-05', '2026-03-05', 'pending', 'high',
 '2025-12-05', false, 'manual'),

(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0005-0000-0000-000000000001',
 'opposition', 'Fin periodo oposición FLOWAI', '3 meses desde publicación.',
 '2025-11-28', '2026-02-28', 'pending', 'high',
 '2025-11-28', false, 'manual'),

(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0007-0000-0000-000000000001',
 'examination', 'Examen formal patente Algoritmo ML', 'Plazo estimado respuesta OEPM.',
 '2025-07-15', '2026-04-01', 'pending', 'normal',
 '2025-07-15', false, 'manual');