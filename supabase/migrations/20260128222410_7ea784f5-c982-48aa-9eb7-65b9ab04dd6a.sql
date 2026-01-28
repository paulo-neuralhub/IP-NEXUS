-- Insertar deals demo SIN pipeline_id ni stage_id (usarán fallback por enum 'stage')
INSERT INTO crm_deals (organization_id, name, amount, stage, probability)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Registro Marca TechVerde EU', 15000, 'contacted', 10),
  ('a1000000-0000-0000-0000-000000000001', 'Patente BioSalud Internacional', 45000, 'qualified', 50),
  ('a1000000-0000-0000-0000-000000000001', 'Oposición GlobalLog vs Competidor', 22000, 'proposal', 60),
  ('a1000000-0000-0000-0000-000000000001', 'Renovación Portfolio FarmaPlus', 8500, 'negotiation', 75),
  ('a1000000-0000-0000-0000-000000000001', 'Diseño Industrial MueblesCraft', 12000, 'contacted', 10),
  ('a1000000-0000-0000-0000-000000000001', 'Licencia Software DataTech', 28000, 'proposal', 60)
ON CONFLICT DO NOTHING;