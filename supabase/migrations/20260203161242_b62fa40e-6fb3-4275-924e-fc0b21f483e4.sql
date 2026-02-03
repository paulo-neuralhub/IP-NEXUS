
-- ══════════════════════════════════════════════════════
-- FASE 8: MATTER_TASKS (Tareas del equipo)
-- ══════════════════════════════════════════════════════

INSERT INTO matter_tasks (
  id, organization_id, matter_id, title, description, status, priority, due_date, is_completed, completed_at, created_at
) VALUES

-- Tarea urgente: alegaciones oposición ECOFLOW SOLAR
('e2000001-0001-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 '10000001-0014-0000-0000-000000000001',
 'Preparar alegaciones oposición ECOFLOW SOLAR',
 'Redactar escrito completo de alegaciones contra oposición de EcoFlow Technology Ltd. Incluir análisis de confusión, diferenciación de productos y pruebas de uso.',
 'in_progress', 'urgent', '2026-02-10T23:59:00Z', false, NULL, '2025-12-16T09:00:00Z'),

-- Tarea: pruebas GREENPOWER para oposición
('e2000001-0002-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 '10000001-0015-0000-0000-000000000001',
 'Recopilar pruebas uso GREENPOWER para oposición',
 'Solicitar a Roberto Casas facturas, publicidad y material que demuestre uso efectivo de la marca GREENPOWER. Necesario para reforzar oposición contra GREENTECH.',
 'in_progress', 'high', '2026-02-15T23:59:00Z', false, NULL, '2026-01-10T09:00:00Z'),

-- Tarea: documentación BioVoss-7
('e2000001-0003-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 '10000001-0010-0000-0000-000000000001',
 'Enviar documentación BioVoss-7 a OEPM',
 'Preparar y presentar la documentación experimental complementaria para la patente BioVoss-7 según requerimiento de la OEPM.',
 'pending', 'high', '2026-03-10T23:59:00Z', false, NULL, '2026-01-25T16:00:00Z'),

-- Tarea completada: verificar OLIVAR PREMIUM GOLD
('e2000001-0004-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 '10000001-0009-0000-0000-000000000001',
 'Verificar estado OLIVAR PREMIUM GOLD en EUIPO',
 'Comprobar si la marca ha pasado el examen de forma y si ha sido publicada para oposiciones.',
 'completed', 'medium', '2025-12-01T23:59:00Z', true, '2025-11-28T10:00:00Z', '2025-11-15T09:00:00Z'),

-- Tarea completada: propuesta Sabores del Mediterráneo
('e2000001-0005-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 '10000001-0013-0000-0000-000000000001',
 'Preparar propuesta Sabores del Mediterráneo — Franquicia',
 'Elaborar propuesta de protección integral: marca + acuerdo tipo franquicia + manual de uso de marca.',
 'completed', 'high', '2025-11-30T23:59:00Z', true, '2025-11-25T14:00:00Z', '2025-10-15T09:00:00Z'),

-- Tarea: examen formal NORDIKHAUS
('e2000001-0006-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 '10000001-0011-0000-0000-000000000001',
 'Examen formal NORDIKHAUS OEPM',
 'Verificar resultado del examen formal. Si hay defectos, plazo de 1 mes para subsanar.',
 'pending', 'medium', '2026-03-01T23:59:00Z', false, NULL, '2025-12-01T10:00:00Z');
