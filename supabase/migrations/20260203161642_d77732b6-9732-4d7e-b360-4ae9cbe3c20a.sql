
-- FASE 10: MATTER_DOCUMENTS (con status válido: 'active')
INSERT INTO matter_documents (
  id, organization_id, matter_id, name, file_path, file_size, mime_type,
  category, description, is_official, document_date, status, created_at
) VALUES
('d0000001-0001-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 '10000001-0001-0000-0000-000000000001', 'Certificado registro GREENPOWER nº 0 4052001.pdf',
 '/documents/greenpower/certificado_oepm.pdf', 245000, 'application/pdf',
 'certificate', 'Certificado oficial de registro emitido por la OEPM.', true, '2025-09-20', 'active', '2025-09-22T09:00:00Z'),
('d0000001-0002-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 '10000001-0004-0000-0000-000000000001', 'Poder de representación TechFlow — Firmado.pdf',
 '/documents/techflow/poder_representacion.pdf', 180000, 'application/pdf',
 'power_of_attorney', 'Poder firmado por Alejandro Ruiz para actuar ante OEPM.', true, '2025-03-23', 'active', '2025-03-23T11:00:00Z'),
('d0000001-0003-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 '10000001-0007-0000-0000-000000000001', 'Descripción técnica Algoritmo ML Predictivo v2.pdf',
 '/documents/techflow/descripcion_patente_ml.pdf', 2400000, 'application/pdf',
 'technical', 'Descripción técnica completa para patente de algoritmo ML.', false, '2025-05-30', 'active', '2025-05-30T14:00:00Z'),
('d0000001-0004-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 '10000001-0014-0000-0000-000000000001', 'Escrito oposición EcoFlow Technology vs ECOFLOW SOLAR.pdf',
 '/documents/greenpower/oposicion_ecoflow.pdf', 890000, 'application/pdf',
 'opposition', 'Escrito de oposición de EcoFlow Technology Ltd.', true, '2025-12-15', 'active', '2025-12-15T08:30:00Z'),
('d0000001-0005-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 '10000001-0010-0000-0000-000000000001', 'Datos experimentales BioVoss-7.pdf',
 '/documents/voss/datos_experimentales_biovoss7.pdf', 1500000, 'application/pdf',
 'evidence', 'Datos experimentales para responder requerimiento OEPM.', false, '2026-01-25', 'active', '2026-01-25T16:00:00Z'),
('d0000001-0006-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 '10000001-0011-0000-0000-000000000001', 'Poder notarial NordikHaus — Traducción jurada.pdf',
 '/documents/nordikhaus/poder_traduccion_jurada.pdf', 350000, 'application/pdf',
 'power_of_attorney', 'Traducción jurada del poder alemán al español.', true, '2025-07-19', 'active', '2025-07-19T10:00:00Z'),
('d0000001-0007-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
 '10000001-0003-0000-0000-000000000001', 'Certificado concesión patente EP-4215678-B1.pdf',
 '/documents/greenpower/patente_ep_certificado.pdf', 520000, 'application/pdf',
 'certificate', 'Certificado de concesión de la patente europea.', true, '2025-11-10', 'active', '2025-11-15T09:00:00Z');
