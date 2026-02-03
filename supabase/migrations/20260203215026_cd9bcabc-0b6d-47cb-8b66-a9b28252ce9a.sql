-- =============================================================
-- STABILITY-02C: Watch Results con IDs de watchlists existentes
-- =============================================================

INSERT INTO watch_results (
  id, watchlist_id, organization_id,
  result_type, title, description,
  applicant_name, applicant_country,
  similarity_score, similarity_type,
  status, priority,
  action_notes,
  detected_at
) VALUES
-- Alertas para "TECHFLOW Vigilancia" (ec246800...)
('c0000001-0001-0000-0000-000000000001',
 'ec246800-48e5-4c1d-b677-9c8ba0bb2a5c',
 'd0000001-0000-0000-0000-000000000001',
 'trademark_published', 'TECHFLOW AI SOLUTIONS', 'Solicitud marca muy similar detectada EUIPO',
 'TechFlow AI Solutions Inc.', 'EU',
 91, 'visual',
 'new', 'critical',
 'URGENTE: similitud muy alta (91%). Posible conflicto directo.',
 '2025-12-20'),

('c0000001-0002-0000-0000-000000000001',
 'ec246800-48e5-4c1d-b677-9c8ba0bb2a5c',
 'd0000001-0000-0000-0000-000000000001',
 'trademark_filing', 'TECHFLO SYSTEMS', 'Solicitud marca similar detectada OEPM',
 'TechFlo Systems S.L.', 'ES',
 72, 'phonetic',
 'reviewing', 'medium',
 'Marca similar en sector tecnológico. Monitorizando.',
 '2026-01-10'),

-- Alertas para "ByteForge Patentes" (9be66c55...)
('c0000001-0003-0000-0000-000000000001',
 '9be66c55-ba4c-417c-86bb-410e5875ba11',
 'd0000001-0000-0000-0000-000000000001',
 'patent_filing', 'ML Prediction Algorithm', 'Patente similar detectada USPTO',
 'ByteForge Labs Inc.', 'US',
 78, 'conceptual',
 'new', 'high',
 'Revisar: patente similar en machine learning.',
 '2026-01-05'),

-- Alertas para "GreenLeaf Dominios" (36641dd9...)
('c0000001-0004-0000-0000-000000000001',
 '36641dd9-d588-4ae1-9cda-3843c01e5fbe',
 'd0000001-0000-0000-0000-000000000001',
 'domain_registered', 'greenleaf-solutions.com', 'Dominio similar registrado',
 'GreenLeaf Solutions LLC', 'US',
 85, 'phonetic',
 'dismissed', 'low',
 'Empresa diferente sector. Sin riesgo.',
 '2025-11-20'),

('c0000001-0005-0000-0000-000000000001',
 '36641dd9-d588-4ae1-9cda-3843c01e5fbe',
 'd0000001-0000-0000-0000-000000000001',
 'web_mention', 'greenleaf.io', 'Mención en web de marca similar',
 'Unknown', 'Unknown',
 65, 'conceptual',
 'new', 'medium',
 'Revisar posible uso no autorizado.',
 '2026-01-15')

ON CONFLICT (id) DO UPDATE SET 
  status = EXCLUDED.status, action_notes = EXCLUDED.action_notes;