
-- STABILITY-02E FINAL: Fases + Docs + Deadlines + Comms + Facturas
-- Usando campos correctos de communications (email_from, email_to)

-- 1: FASES
UPDATE matters SET current_phase = 'F9' WHERE reference = '2025/TM/001' AND organization_id = (SELECT id FROM organizations WHERE name ILIKE '%meridian%');
UPDATE matters SET current_phase = 'F9' WHERE reference = '2025/TM/003' AND organization_id = (SELECT id FROM organizations WHERE name ILIKE '%meridian%');
UPDATE matters SET current_phase = 'F9' WHERE reference = '2025/PT/001' AND organization_id = (SELECT id FROM organizations WHERE name ILIKE '%meridian%');
UPDATE matters SET current_phase = 'F9' WHERE reference = '2025/TM/006' AND organization_id = (SELECT id FROM organizations WHERE name ILIKE '%meridian%');
UPDATE matters SET current_phase = 'F4' WHERE reference = '2025/TM/002' AND organization_id = (SELECT id FROM organizations WHERE name ILIKE '%meridian%');
UPDATE matters SET current_phase = 'F7' WHERE reference = '2025/TM/004' AND organization_id = (SELECT id FROM organizations WHERE name ILIKE '%meridian%');
UPDATE matters SET current_phase = 'F1' WHERE reference = '2025/TM/005' AND organization_id = (SELECT id FROM organizations WHERE name ILIKE '%meridian%');
UPDATE matters SET current_phase = 'F3' WHERE reference = '2025/PT/002' AND organization_id = (SELECT id FROM organizations WHERE name ILIKE '%meridian%');
UPDATE matters SET current_phase = 'F5' WHERE reference = '2025/TM/007' AND organization_id = (SELECT id FROM organizations WHERE name ILIKE '%meridian%');
UPDATE matters SET current_phase = 'F4' WHERE reference = '2025/PT/003' AND organization_id = (SELECT id FROM organizations WHERE name ILIKE '%meridian%');
UPDATE matters SET current_phase = 'F1' WHERE reference = '2025/TM/010' AND organization_id = (SELECT id FROM organizations WHERE name ILIKE '%meridian%');
UPDATE matters SET current_phase = 'F3' WHERE reference = '2025/OPP/001' AND organization_id = (SELECT id FROM organizations WHERE name ILIKE '%meridian%');

-- 2: DOCUMENTOS (expedientes con 0 docs)
INSERT INTO matter_documents (id, organization_id, matter_id, name, document_type, file_path, file_size, uploaded_by, description, created_at) VALUES
('dc000400-0000-0000-0000-000000000001', (SELECT id FROM organizations WHERE name ILIKE '%meridian%'), (SELECT id FROM matters WHERE reference = '2025/TM/002'), 'Informe anterioridades SOLARIS', 'uploaded', 'docs/solaris.pdf', 450000, (SELECT id FROM auth.users LIMIT 1), 'Búsqueda OEPM.', '2025-04-12'),
('dc000400-0000-0000-0000-000000000002', (SELECT id FROM organizations WHERE name ILIKE '%meridian%'), (SELECT id FROM matters WHERE reference = '2025/TM/004'), 'Acuse FLOWAI EUIPO', 'uploaded', 'docs/flowai.pdf', 200000, (SELECT id FROM auth.users LIMIT 1), 'EUTM-2025-018765.', '2025-05-20'),
('dc000400-0000-0000-0000-000000000003', (SELECT id FROM organizations WHERE name ILIKE '%meridian%'), (SELECT id FROM matters WHERE reference = '2025/TM/005'), 'Ficha TECHFLOW ANALYTICS', 'uploaded', 'docs/analytics.pdf', 120000, (SELECT id FROM auth.users LIMIT 1), 'Apertura.', '2025-11-15'),
('dc000400-0000-0000-0000-000000000004', (SELECT id FROM organizations WHERE name ILIKE '%meridian%'), (SELECT id FROM matters WHERE reference = '2025/TM/006'), 'Certificado OLIVAR PREMIUM', 'uploaded', 'docs/olivar-cert.pdf', 240000, (SELECT id FROM auth.users LIMIT 1), 'Certificado.', '2025-10-30'),
('dc000400-0000-0000-0000-000000000005', (SELECT id FROM organizations WHERE name ILIKE '%meridian%'), (SELECT id FROM matters WHERE reference = '2025/TM/007'), 'Acuse OLIVAR GOLD EUIPO', 'uploaded', 'docs/olivar-gold.pdf', 190000, (SELECT id FROM auth.users LIMIT 1), 'EUIPO.', '2025-08-10'),
('dc000400-0000-0000-0000-000000000006', (SELECT id FROM organizations WHERE name ILIKE '%meridian%'), (SELECT id FROM matters WHERE reference = '2025/TM/009'), 'Acuse NORDIK LIVING INPI', 'uploaded', 'docs/nordik.pdf', 155000, (SELECT id FROM auth.users LIMIT 1), 'PT-2025.', '2025-07-01'),
('dc000400-0000-0000-0000-000000000007', (SELECT id FROM organizations WHERE name ILIKE '%meridian%'), (SELECT id FROM matters WHERE reference = '2025/TM/010'), 'Ficha SABORES', 'uploaded', 'docs/sabores.pdf', 115000, (SELECT id FROM auth.users LIMIT 1), 'Franquicia.', '2025-08-01'),
('dc000400-0000-0000-0000-000000000008', (SELECT id FROM organizations WHERE name ILIKE '%meridian%'), (SELECT id FROM matters WHERE reference = '2025/OPP/001'), 'Escrito oposición GREENTECH', 'uploaded', 'docs/oposicion.pdf', 380000, (SELECT id FROM auth.users LIMIT 1), 'Oposición.', '2025-10-01')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3: DEADLINES (expedientes con 0 deadlines)
INSERT INTO matter_deadlines (id, organization_id, matter_id, deadline_type, title, description, trigger_date, deadline_date, status, priority, assigned_to, created_at) VALUES
('de000400-0000-0000-0000-000000000001', (SELECT id FROM organizations WHERE name ILIKE '%meridian%'), (SELECT id FROM matters WHERE reference = '2025/TM/007'), 'examination', 'Examen OLIVAR GOLD', 'EUIPO.', '2025-08-15', '2026-03-05', 'pending', 'normal', (SELECT id FROM auth.users LIMIT 1), '2025-08-15'),
('de000400-0000-0000-0000-000000000002', (SELECT id FROM organizations WHERE name ILIKE '%meridian%'), (SELECT id FROM matters WHERE reference = '2025/TM/009'), 'examination', 'Examen NORDIK LIVING', 'INPI.', '2025-07-15', '2026-04-01', 'pending', 'normal', (SELECT id FROM auth.users LIMIT 1), '2025-07-15'),
('de000400-0000-0000-0000-000000000003', (SELECT id FROM organizations WHERE name ILIKE '%meridian%'), (SELECT id FROM matters WHERE reference = '2025/TM/010'), 'filing', 'Informe SABORES', 'Entregar.', '2025-08-01', '2025-08-30', 'completed', 'normal', (SELECT id FROM auth.users LIMIT 1), '2025-08-01')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- 4: COMMUNICATIONS (campos correctos: email_from, email_to)
INSERT INTO communications (id, organization_id, matter_id, direction, channel, subject, body, email_from, email_to, created_at) VALUES
('c0000400-0000-0000-0000-000000000001', (SELECT id FROM organizations WHERE name ILIKE '%meridian%'), (SELECT id FROM matters WHERE reference = '2025/TM/002'), 'outbound', 'email', 'Confirmación SOLARIS TECH', 'Confirmamos preparación.', 'sofia@meridian-ip.com', ARRAY['roberto@greenpower.es'], '2025-04-10'),
('c0000400-0000-0000-0000-000000000002', (SELECT id FROM organizations WHERE name ILIKE '%meridian%'), (SELECT id FROM matters WHERE reference = '2025/TM/004'), 'outbound', 'email', 'FLOWAI publicada', 'Publicada en EUIPO.', 'sofia@meridian-ip.com', ARRAY['alejandro@techflow.es'], '2025-11-29'),
('c0000400-0000-0000-0000-000000000003', (SELECT id FROM organizations WHERE name ILIKE '%meridian%'), (SELECT id FROM matters WHERE reference = '2025/TM/005'), 'outbound', 'email', 'Apertura TECHFLOW ANALYTICS', 'Expediente abierto.', 'sofia@meridian-ip.com', ARRAY['alejandro@techflow.es'], '2025-11-15'),
('c0000400-0000-0000-0000-000000000004', (SELECT id FROM organizations WHERE name ILIKE '%meridian%'), (SELECT id FROM matters WHERE reference = '2025/TM/007'), 'outbound', 'email', 'OLIVAR GOLD en EUIPO', 'Confirmamos presentación.', 'miguel@meridian-ip.com', ARRAY['fmorales@olivar.com'], '2025-08-12'),
('c0000400-0000-0000-0000-000000000005', (SELECT id FROM organizations WHERE name ILIKE '%meridian%'), (SELECT id FROM matters WHERE reference = '2025/TM/009'), 'outbound', 'email', 'NORDIK LIVING en INPI', 'Presentada Portugal.', 'miguel@meridian-ip.com', ARRAY['k.bergmann@nordikhaus.de'], '2025-07-02'),
('c0000400-0000-0000-0000-000000000006', (SELECT id FROM organizations WHERE name ILIKE '%meridian%'), (SELECT id FROM matters WHERE reference = '2025/TM/010'), 'outbound', 'email', 'Bienvenida SABORES', 'Expediente abierto.', 'carlos@meridian-ip.com', ARRAY['vgarcia@sabores.es'], '2025-08-02'),
('c0000400-0000-0000-0000-000000000007', (SELECT id FROM organizations WHERE name ILIKE '%meridian%'), (SELECT id FROM matters WHERE reference = '2025/OPP/001'), 'outbound', 'email', 'Oposición vs GREENTECH', 'Oposición presentada.', 'sofia@meridian-ip.com', ARRAY['roberto@greenpower.es'], '2025-10-02'),
('c0000400-0000-0000-0000-000000000008', (SELECT id FROM organizations WHERE name ILIKE '%meridian%'), (SELECT id FROM matters WHERE reference = '2025/PT/001'), 'outbound', 'email', 'Patente Panel Solar concedida', 'Concedida por EPO.', 'carlos@meridian-ip.com', ARRAY['roberto@greenpower.es'], '2025-09-22'),
('c0000400-0000-0000-0000-000000000009', (SELECT id FROM organizations WHERE name ILIKE '%meridian%'), (SELECT id FROM matters WHERE reference = '2025/TM/006'), 'outbound', 'email', 'OLIVAR PREMIUM registrada', 'Registrada OEPM.', 'miguel@meridian-ip.com', ARRAY['fmorales@olivar.com'], '2025-11-01'),
('c0000400-0000-0000-0000-00000000000a', (SELECT id FROM organizations WHERE name ILIKE '%meridian%'), (SELECT id FROM matters WHERE reference = '2025/PT/002'), 'outbound', 'email', 'Patente ML en proceso', 'En proceso OEPM.', 'sofia@meridian-ip.com', ARRAY['alejandro@techflow.es'], '2025-07-02')
ON CONFLICT (id) DO UPDATE SET subject = EXCLUDED.subject;

-- 5: VINCULAR FACTURAS
UPDATE invoices SET matter_id = (SELECT id FROM matters WHERE reference = '2025/TM/001') WHERE invoice_number = 'INV-2025-0001';
UPDATE invoices SET matter_id = (SELECT id FROM matters WHERE reference = '2025/TM/001') WHERE invoice_number = 'INV-2025-0002';
UPDATE invoices SET matter_id = (SELECT id FROM matters WHERE reference = '2025/TM/003') WHERE invoice_number = 'INV-2025-0003';
UPDATE invoices SET matter_id = (SELECT id FROM matters WHERE reference = '2025/TM/003') WHERE invoice_number = 'INV-2025-0004';
UPDATE invoices SET matter_id = (SELECT id FROM matters WHERE reference = '2025/TM/006') WHERE invoice_number = 'INV-2025-0005';
UPDATE invoices SET matter_id = (SELECT id FROM matters WHERE reference = '2025/TM/008') WHERE invoice_number = 'INV-2025-0006';
UPDATE invoices SET matter_id = (SELECT id FROM matters WHERE reference = '2025/PT/003') WHERE invoice_number = 'INV-2025-0007';
