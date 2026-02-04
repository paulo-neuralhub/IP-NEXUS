-- ═══════════════════════════════════════════════════════════
-- FASE 1A: DOCUMENTOS ADICIONALES PARA EXPEDIENTES (CORREGIDO)
-- document_type: generated | uploaded | received | sent | internal
-- category: cualquier valor libre
-- ═══════════════════════════════════════════════════════════

-- GREENPOWER 2025/TM/001 (F9) - Añadir documentos del ciclo completo
INSERT INTO matter_documents (id, organization_id, matter_id, name, file_path, file_size, mime_type, category, document_type, uploaded_by, description, created_at) VALUES
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0001-0000-0000-000000000001',
 'Ficha apertura expediente GREENPOWER', 'demo/greenpower/ficha-apertura.pdf', 115000, 'application/pdf', 
 'case_opening', 'internal', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Apertura expediente registro marca. Cliente: GreenPower Energías S.L.', '2025-02-15'),

(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0001-0000-0000-000000000001',
 'Informe búsqueda anterioridades GREENPOWER', 'demo/greenpower/informe-anterioridades.pdf', 420000, 'application/pdf',
 'search_report', 'generated', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Búsqueda OEPM + TMView + WIPO. Conflicto potencial con ECOFLOW detectado.', '2025-02-18'),

(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0001-0000-0000-000000000001',
 'Poder notarial GreenPower Energía S.A.', 'demo/greenpower/poder-notarial.pdf', 195000, 'application/pdf',
 'power_of_attorney', 'received', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Poder firmado por Roberto Casas Martínez, CEO.', '2025-02-20'),

(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0001-0000-0000-000000000001',
 'Acuse recibo solicitud GREENPOWER — OEPM M-2025-001234', 'demo/greenpower/acuse-recibo.pdf', 155000, 'application/pdf',
 'filing_receipt', 'received', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Solicitud presentada 25/02/2025. Clases 7, 9, 42.', '2025-02-25'),

(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0001-0000-0000-000000000001',
 'Publicación marca GREENPOWER en BOPI nº 2025/098', 'demo/greenpower/publicacion-bopi.pdf', 135000, 'application/pdf',
 'publication', 'received', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Publicada. Oposición ECOFLOW recibida y resuelta favorablemente.', '2025-05-20'),

-- SOLARIS TECH 2025/TM/002 (F4) - Añadir poder
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0002-0000-0000-000000000001',
 'Poder notarial GreenPower para SOLARIS TECH', 'demo/solaris/poder-notarial.pdf', 185000, 'application/pdf',
 'power_of_attorney', 'received', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Poder firmado por Roberto Casas para nueva marca del grupo.', '2025-04-15'),

-- PANEL SOLAR EPO 2025/PT/001 (F9) - Añadir técnicos y acuse
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0003-0000-0000-000000000001',
 'Descripción técnica Panel Solar Híbrido', 'demo/panel-solar/descripcion-tecnica.pdf', 2800000, 'application/pdf',
 'technical', 'internal', '0090b656-5c9a-445c-91be-34228afb2b0f',
 '62 páginas + 18 figuras. 14 reivindicaciones.', '2025-01-15'),

(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0003-0000-0000-000000000001',
 'Reivindicaciones patente Panel Solar Híbrido', 'demo/panel-solar/reivindicaciones.pdf', 450000, 'application/pdf',
 'technical', 'internal', '0090b656-5c9a-445c-91be-34228afb2b0f',
 '14 reivindicaciones independientes + dependientes.', '2025-01-15'),

(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0003-0000-0000-000000000001',
 'Acuse recibo solicitud patente EPO — EP-2025-0045678', 'demo/panel-solar/acuse-epo.pdf', 175000, 'application/pdf',
 'filing_receipt', 'received', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Fecha prioridad 01/02/2025.', '2025-02-01'),

-- TECHFLOW 2025/TM/003 (F9) - Añadir ficha, informe, acuse, certificado
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0004-0000-0000-000000000001',
 'Ficha apertura expediente TECHFLOW', 'demo/techflow/ficha-apertura.pdf', 118000, 'application/pdf',
 'case_opening', 'internal', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Apertura expediente. Cliente: TechFlow Solutions S.L.', '2025-03-10'),

(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0004-0000-0000-000000000001',
 'Informe anterioridades TECHFLOW', 'demo/techflow/informe-anterioridades.pdf', 350000, 'application/pdf',
 'search_report', 'generated', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Búsqueda limpia. Sin conflictos detectados.', '2025-03-12'),

(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0004-0000-0000-000000000001',
 'Acuse recibo solicitud TECHFLOW — OEPM M-2025-003456', 'demo/techflow/acuse-recibo.pdf', 158000, 'application/pdf',
 'filing_receipt', 'received', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Clases 9, 42. Fecha presentación 20/03/2025.', '2025-03-20'),

(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0004-0000-0000-000000000001',
 'Certificado registro marca TECHFLOW — M-0003456', 'demo/techflow/certificado.pdf', 248000, 'application/pdf',
 'certificate', 'received', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Certificado oficial OEPM.', '2025-09-10'),

-- FLOWAI 2025/TM/004 (F7) - Añadir publicación
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0005-0000-0000-000000000001',
 'Publicación FLOWAI en Boletín EUIPO', 'demo/flowai/publicacion-euipo.pdf', 150000, 'application/pdf',
 'publication', 'received', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Periodo oposición 3 meses: hasta 28/02/2026.', '2025-11-28'),

-- ALGORITMO ML 2025/PT/002 (F3) - Añadir estado arte
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0007-0000-0000-000000000001',
 'Informe estado del arte — patentes ML similares', 'demo/ml-algoritmo/estado-arte.pdf', 680000, 'application/pdf',
 'search_report', 'generated', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Búsqueda Espacenet + Google Patents. 23 patentes analizadas.', '2025-07-10'),

-- OLIVAR PREMIUM 2025/TM/006 (F9) - Añadir ciclo completo
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0008-0000-0000-000000000001',
 'Ficha apertura expediente OLIVAR PREMIUM', 'demo/olivar/ficha-apertura.pdf', 120000, 'application/pdf',
 'case_opening', 'internal', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Apertura expediente. Cliente: Olivar Premium S.A.', '2025-04-22'),

(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0008-0000-0000-000000000001',
 'Informe anterioridades OLIVAR PREMIUM', 'demo/olivar/informe-anterioridades.pdf', 380000, 'application/pdf',
 'search_report', 'generated', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Búsqueda OEPM + TMView. 3 marcas similares sin riesgo.', '2025-04-25'),

(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0008-0000-0000-000000000001',
 'Poder notarial Olivar Premium S.A.', 'demo/olivar/poder-notarial.pdf', 190000, 'application/pdf',
 'power_of_attorney', 'received', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Firmado por Francisco Morales Ruiz, administrador.', '2025-04-28'),

(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0008-0000-0000-000000000001',
 'Acuse recibo solicitud OLIVAR PREMIUM — OEPM M-2025-004567', 'demo/olivar/acuse-recibo.pdf', 160000, 'application/pdf',
 'filing_receipt', 'received', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Clases 29, 35. Presentada 05/05/2025.', '2025-05-05'),

(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0008-0000-0000-000000000001',
 'Publicación OLIVAR PREMIUM en BOPI nº 2025/156', 'demo/olivar/publicacion-bopi.pdf', 140000, 'application/pdf',
 'publication', 'received', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Publicada. Sin oposiciones recibidas.', '2025-08-15'),

-- OLIVAR GOLD 2025/TM/007 (F5) - Añadir requerimiento
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0009-0000-0000-000000000001',
 'Requerimiento EUIPO — ampliación descripción clase 30', 'demo/olivar-gold/requerimiento-euipo.pdf', 220000, 'application/pdf',
 'office_action', 'received', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Plazo respuesta: 2 meses (hasta 05/03/2026).', '2025-12-05'),

-- BioVoss-7 2025/PT/003 (F4) - Añadir informe patentabilidad
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0010-0000-0000-000000000001',
 'Informe patentabilidad compuesto BioVoss-7', 'demo/biovoss/informe-patentabilidad.pdf', 520000, 'application/pdf',
 'search_report', 'generated', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Análisis novedad + actividad inventiva. Resultado: favorable.', '2025-05-20'),

-- NORDIKHAUS 2025/TM/008 (F5) - Añadir acuse
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0011-0000-0000-000000000001',
 'Acuse recibo solicitud NORDIKHAUS — OEPM M-2025-006789', 'demo/nordikhaus/acuse-oepm.pdf', 160000, 'application/pdf',
 'filing_receipt', 'received', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Clases 20, 35. Presentada 15/06/2025.', '2025-06-15'),

-- NORDIK LIVING 2025/TM/009 (F5) - Añadir poder
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0012-0000-0000-000000000001',
 'Poder notarial NordikHaus — Portugal (trad. jurada DE→PT)', 'demo/nordik-living/poder-traduccion.pdf', 210000, 'application/pdf',
 'power_of_attorney', 'received', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Traducción jurada alemán-portugués con Apostilla.', '2025-06-28'),

-- ECOFLOW 2025/TM/011 (F0) - Añadir resolución
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0014-0000-0000-000000000001',
 'Resolución OEPM — Oposición ECOFLOW SOLAR parcialmente estimada', 'demo/ecoflow/resolucion-oepm.pdf', 290000, 'application/pdf',
 'office_action', 'received', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'ECOFLOW restringida a clase 11.', '2025-11-15'),

-- OPP vs GREENTECH 2025/OPP/001 (F3) - Añadir alerta
(gen_random_uuid(), 'd0000001-0000-0000-0000-000000000001', '10000001-0015-0000-0000-000000000001',
 'Alerta vigilancia — GREENTECH ENERGY (similitud 82%)', 'demo/greentech-opp/alerta-vigilancia.pdf', 250000, 'application/pdf',
 'evidence', 'generated', '0090b656-5c9a-445c-91be-34228afb2b0f',
 'Generada por monitor de vigilancia IP-SPIDER.', '2025-09-15');