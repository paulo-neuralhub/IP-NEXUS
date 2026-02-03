
-- ══════════════════════════════════════════════════════
-- FASE 14: ACTIVITY_LOG (Auditoría)
-- ══════════════════════════════════════════════════════

INSERT INTO activity_log (
  id, organization_id, entity_type, entity_id, action, title, description, metadata, created_at
) VALUES

-- Creación expediente GREENPOWER
('a1000001-0001-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'matter', '10000001-0001-0000-0000-000000000001',
 'create', 'Expediente creado: 2025/TM/001',
 'Creó expediente 2025/TM/001 — GREENPOWER',
 '{"title": "GREENPOWER — Registro marca España", "type": "trademark"}',
 '2025-03-10T09:00:00Z'),

-- Actualización estado GREENPOWER a registered
('a1000001-0002-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'matter', '10000001-0001-0000-0000-000000000001',
 'update', 'Estado actualizado: GREENPOWER',
 'Actualizó estado a "registered" — GREENPOWER',
 '{"field": "status", "old_value": "pending", "new_value": "registered"}',
 '2025-09-22T10:30:00Z'),

-- Creación factura GreenPower
('a1000001-0003-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'invoice', 'a1000001-0001-0000-0000-000000000001',
 'create', 'Factura creada: INV-2025-0001',
 'Creó factura INV-2025-0001 — GreenPower €9.250',
 '{"total": 9250, "client": "GreenPower Energías S.L."}',
 '2025-03-01T09:00:00Z'),

-- Envío email bienvenida TechFlow
('a1000001-0004-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'communication', 'c1000000-0000-0000-0000-000000000001',
 'create', 'Email enviado: Bienvenida TechFlow',
 'Envió email de bienvenida a TechFlow',
 '{"channel": "email", "to": "alejandro.ruiz@techflow.es"}',
 '2025-03-22T09:00:00Z'),

-- Detección alerta vigilancia GREENTECH
('a1000001-0005-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'spider_alert', '5a000001-0001-0000-0000-000000000001',
 'create', 'Alerta vigilancia: GREENTECH ENERGY',
 'Sistema detectó marca similar GREENTECH ENERGY',
 '{"similarity": 82, "risk": "high", "detected_mark": "GREENTECH ENERGY"}',
 '2025-10-25T03:00:00Z'),

-- Creación oposición GREENPOWER vs GREENTECH
('a1000001-0006-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'matter', '10000001-0015-0000-0000-000000000001',
 'create', 'Oposición creada: 2025/OPP/001',
 'Creó oposición 2025/OPP/001 contra GREENTECH ENERGY',
 '{"type": "opposition", "target": "GREENTECH ENERGY", "matter_ref": "2025/OPP/001"}',
 '2025-11-01T09:00:00Z'),

-- Subida documento NordikHaus
('a1000001-0007-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'document', 'd0000001-0006-0000-0000-000000000001',
 'upload', 'Documento subido: Poder NordikHaus',
 'Subió traducción jurada poder NordikHaus',
 '{"filename": "poder_traduccion_jurada.pdf", "size": 350000}',
 '2025-07-19T10:00:00Z'),

-- Login reciente
('a1000001-0008-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 'session', 'a0000000-0000-0000-0000-000000000001',
 'login', 'Inicio de sesión',
 'Usuario inició sesión en el sistema',
 '{"ip": "83.45.12.100", "user_agent": "Chrome/120"}',
 '2026-02-03T08:45:00Z');
