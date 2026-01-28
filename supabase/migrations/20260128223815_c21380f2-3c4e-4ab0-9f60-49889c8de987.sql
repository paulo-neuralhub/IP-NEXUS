-- Create "Negociaciones" pipeline in crm_pipelines for demo organization
INSERT INTO crm_pipelines (id, code, name, organization_id)
VALUES ('51058e8c-0526-42b1-9917-6d6e28bc6c1f', 'negociaciones', 'Negociaciones', 'a1000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Create stages for this pipeline in crm_pipeline_stages
INSERT INTO crm_pipeline_stages (id, pipeline_id, name, code, sort_order, probability, is_won, is_lost, color)
VALUES
  ('dc91f190-60f6-478b-ae45-d0745b312808', '51058e8c-0526-42b1-9917-6d6e28bc6c1f', 'Nueva', 'nueva', 0, 10, false, false, '#94A3B8'),
  ('688ca1b7-84cb-4d08-95a7-ac15c27e260c', '51058e8c-0526-42b1-9917-6d6e28bc6c1f', 'Reunión', 'reunion', 1, 30, false, false, '#3B82F6'),
  ('35fc0ddf-3e23-40a5-ba94-c8d5fd15f1a5', '51058e8c-0526-42b1-9917-6d6e28bc6c1f', 'Propuesta Enviada', 'propuesta', 2, 50, false, false, '#F59E0B'),
  ('eae00ce0-a3b1-4d22-8647-352723826a2d', '51058e8c-0526-42b1-9917-6d6e28bc6c1f', 'En Revisión', 'revision', 3, 70, false, false, '#8B5CF6'),
  ('8af0fd20-6b80-43e0-a2cd-567b2f7bbce0', '51058e8c-0526-42b1-9917-6d6e28bc6c1f', 'Ganada', 'ganada', 4, 100, true, false, '#22C55E'),
  ('a63d5e71-ee72-489e-9572-2cb9b5f3a2e5', '51058e8c-0526-42b1-9917-6d6e28bc6c1f', 'Perdida', 'perdida', 5, 0, false, true, '#EF4444')
ON CONFLICT (id) DO NOTHING;

-- Insert demo deals
INSERT INTO crm_deals (
  name,
  pipeline_id,
  stage_id,
  account_id,
  amount,
  organization_id,
  stage,
  probability,
  created_at
) VALUES
  ('Negociación — Registro de Marca (TechVerde)', '51058e8c-0526-42b1-9917-6d6e28bc6c1f', 'dc91f190-60f6-478b-ae45-d0745b312808', '1e005082-b4b0-4997-9578-c323bc139d88', 15000, 'a1000000-0000-0000-0000-000000000001', 'contacted', 10, NOW()),
  ('Negociación — Reunión Comercial (BioSalud)', '51058e8c-0526-42b1-9917-6d6e28bc6c1f', '688ca1b7-84cb-4d08-95a7-ac15c27e260c', '9641fb22-5c11-4e1b-a5ed-53edd7f46445', 22000, 'a1000000-0000-0000-0000-000000000001', 'qualified', 50, NOW()),
  ('Negociación — Propuesta Enviada (Acme Foods)', '51058e8c-0526-42b1-9917-6d6e28bc6c1f', '35fc0ddf-3e23-40a5-ba94-c8d5fd15f1a5', '5fd687e3-80ee-4e31-b9fd-9b04f6103799', 28000, 'a1000000-0000-0000-0000-000000000001', 'proposal', 60, NOW()),
  ('Negociación — En Revisión Legal (BluePeak)', '51058e8c-0526-42b1-9917-6d6e28bc6c1f', 'eae00ce0-a3b1-4d22-8647-352723826a2d', '08514b96-ad35-4105-9dc8-9a8e0b946de5', 35000, 'a1000000-0000-0000-0000-000000000001', 'negotiation', 75, NOW()),
  ('Negociación — Contrato Firmado (Iberia HealthTech)', '51058e8c-0526-42b1-9917-6d6e28bc6c1f', '8af0fd20-6b80-43e0-a2cd-567b2f7bbce0', 'b542d734-97d0-4d3c-be68-40221ad27a81', 45000, 'a1000000-0000-0000-0000-000000000001', 'won', 100, NOW()),
  ('Negociación — Perdida por Precio (Solaria)', '51058e8c-0526-42b1-9917-6d6e28bc6c1f', 'a63d5e71-ee72-489e-9572-2cb9b5f3a2e5', '89c2b518-821f-4a71-9492-6dcfe84dae64', 18000, 'a1000000-0000-0000-0000-000000000001', 'lost', 0, NOW())
ON CONFLICT DO NOTHING;