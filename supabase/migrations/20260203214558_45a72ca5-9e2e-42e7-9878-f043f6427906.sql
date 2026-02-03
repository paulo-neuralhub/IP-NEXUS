-- =============================================================
-- STABILITY-02C PASO 9: Matter Deadlines (valores correctos)
-- =============================================================

INSERT INTO matter_deadlines (
  id, organization_id, matter_id,
  deadline_type, title, description, deadline_date, 
  status, priority,
  assigned_to, created_at
) VALUES
-- ECOFLOW SOLAR — Critical
('dd000001-0000-0000-0000-000000000001',
 'd0000001-0000-0000-0000-000000000001',
 '10000001-0014-0000-0000-000000000001',
 'response', 'Responder oposición ECOFLOW SOLAR', 'Alegaciones ante oposición de EcoFlow Technology',
 CURRENT_DATE + 5, 'pending', 'critical',
 '0090b656-5c9a-445c-91be-34228afb2b0f', CURRENT_TIMESTAMP),

-- FLOWAI — High
('dd000001-0000-0000-0000-000000000002',
 'd0000001-0000-0000-0000-000000000001',
 '10000001-0005-0000-0000-000000000001',
 'opposition', 'Fin periodo oposición FLOWAI', 'Vencimiento periodo oposición EUIPO',
 CURRENT_DATE + 25, 'pending', 'high',
 '0090b656-5c9a-445c-91be-34228afb2b0f', CURRENT_TIMESTAMP),

-- Panel Solar — Normal
('dd000001-0000-0000-0000-000000000003',
 'd0000001-0000-0000-0000-000000000001',
 '10000001-0003-0000-0000-000000000001',
 'renewal', '2ª anualidad EPO Panel Solar', 'Pago anualidad patente europea',
 CURRENT_DATE + 120, 'pending', 'normal',
 '0090b656-5c9a-445c-91be-34228afb2b0f', CURRENT_TIMESTAMP),

-- BioVoss-7 — High
('dd000001-0000-0000-0000-000000000004',
 'd0000001-0000-0000-0000-000000000001',
 '10000001-0010-0000-0000-000000000001',
 'response', 'Respuesta requerimiento OEPM BioVoss-7', 'Documentación adicional patente farmacéutica',
 CURRENT_DATE + 45, 'pending', 'high',
 '0090b656-5c9a-445c-91be-34228afb2b0f', CURRENT_TIMESTAMP),

-- vs GREENTECH — Critical
('dd000001-0000-0000-0000-000000000005',
 'd0000001-0000-0000-0000-000000000001',
 '10000001-0015-0000-0000-000000000001',
 'evidence', 'Pruebas adicionales vs GREENTECH', 'Aportar pruebas uso efectivo GREENPOWER',
 CURRENT_DATE + 17, 'pending', 'critical',
 '0090b656-5c9a-445c-91be-34228afb2b0f', CURRENT_TIMESTAMP),

-- NORDIKHAUS — Normal
('dd000001-0000-0000-0000-000000000006',
 'd0000001-0000-0000-0000-000000000001',
 '10000001-0011-0000-0000-000000000001',
 'examination', 'Examen formal NORDIKHAUS OEPM', 'Posibles requerimientos examen formal',
 CURRENT_DATE + 26, 'pending', 'normal',
 '0090b656-5c9a-445c-91be-34228afb2b0f', CURRENT_TIMESTAMP),

-- TECHFLOW — Completado
('dd000001-0000-0000-0000-000000000007',
 'd0000001-0000-0000-0000-000000000001',
 '10000001-0004-0000-0000-000000000001',
 'certificate', 'Recepción certificado TECHFLOW', 'Certificado registro OEPM',
 '2025-10-01', 'completed', 'normal',
 '0090b656-5c9a-445c-91be-34228afb2b0f', '2025-09-10'),

-- GREENPOWER — Renovación 2035 (Low)
('dd000001-0000-0000-0000-000000000008',
 'd0000001-0000-0000-0000-000000000001',
 '10000001-0001-0000-0000-000000000001',
 'renewal', 'Renovación marca GREENPOWER', 'Renovación decenal GREENPOWER OEPM',
 '2035-03-15', 'pending', 'low',
 '0090b656-5c9a-445c-91be-34228afb2b0f', '2025-08-15')
ON CONFLICT (id) DO UPDATE SET 
  deadline_type = EXCLUDED.deadline_type,
  deadline_date = EXCLUDED.deadline_date,
  priority = EXCLUDED.priority;