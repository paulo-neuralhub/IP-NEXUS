-- FASE 1B: TAREAS (matter_tasks) para expedientes en proceso
INSERT INTO matter_tasks (id, organization_id, matter_id, title, description, priority, status, due_date, assigned_to, is_completed, created_at) VALUES
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0009-0000-0000-000000000001',
 'Preparar respuesta requerimiento EUIPO Olivar Gold', 'Redactar ampliación de descripción de productos clase 30.',
 'high', 'pending', '2026-02-20', '0090b656-5c9a-445c-91be-34228afb2b0f', false, '2025-12-06'),

(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0005-0000-0000-000000000001',
 'Vigilar periodo oposición FLOWAI', 'Monitorizar si se presentan oposiciones contra FLOWAI (3 meses).',
 'medium', 'in_progress', '2026-02-28', '0090b656-5c9a-445c-91be-34228afb2b0f', false, '2025-11-29'),

(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0003-0000-0000-000000000001',
 'Pagar anualidad patente EPO Panel Solar', '2ª anualidad. Provisión pendiente de solicitar al cliente.',
 'high', 'pending', '2026-05-30', '0090b656-5c9a-445c-91be-34228afb2b0f', false, '2025-12-01'),

(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0015-0000-0000-000000000001',
 'Recopilar pruebas adicionales vs GREENTECH', 'Documentación de uso efectivo de GREENPOWER para fortalecer oposición.',
 'high', 'in_progress', '2026-02-15', '0090b656-5c9a-445c-91be-34228afb2b0f', false, '2025-10-05'),

(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0013-0000-0000-000000000001',
 'Preparar propuesta Sabores del Mediterráneo', 'Elaborar propuesta de protección integral: marca + acuerdo franquicia.',
 'medium', 'pending', '2026-03-01', '0090b656-5c9a-445c-91be-34228afb2b0f', false, '2025-08-05'),

(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0010-0000-0000-000000000001',
 'Completar documentación técnica BioVoss-7', 'Incorporar resultados ensayos clínicos fase III.',
 'medium', 'pending', '2026-03-15', '0090b656-5c9a-445c-91be-34228afb2b0f', false, '2025-06-01'),

(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0006-0000-0000-000000000001',
 'Búsqueda anterioridades TECHFLOW ANALYTICS', 'Búsqueda en OEPM + TMView para nueva marca.',
 'low', 'pending', '2026-02-10', '0090b656-5c9a-445c-91be-34228afb2b0f', false, '2025-11-16');