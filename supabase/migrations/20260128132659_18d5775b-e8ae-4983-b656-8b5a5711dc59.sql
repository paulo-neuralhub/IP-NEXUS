-- Renombrar pipelines existentes a Leads y Negociaciones
UPDATE pipelines 
SET name = 'Leads', is_default = true, position = 0
WHERE id = 'dd0e797d-bf6a-4f16-a2dd-c2b0563040c6';

UPDATE pipelines 
SET name = 'Negociaciones', is_default = false, position = 1
WHERE id = '51058e8c-0526-42b1-9917-6d6e28bc6c1f';

-- Eliminar pipeline de prueba
DELETE FROM pipeline_stages WHERE pipeline_id = '2e9860ec-9fbe-4e52-82b9-e8302e7ed4f2';
DELETE FROM pipelines WHERE id = '2e9860ec-9fbe-4e52-82b9-e8302e7ed4f2';

-- Actualizar etapas del pipeline Leads con los colores correctos
UPDATE pipeline_stages SET name = 'Nuevo', color = '#3B82F6', position = 0 
WHERE pipeline_id = 'dd0e797d-bf6a-4f16-a2dd-c2b0563040c6' AND position = 0;

UPDATE pipeline_stages SET name = 'Contactado', color = '#06B6D4', position = 1 
WHERE pipeline_id = 'dd0e797d-bf6a-4f16-a2dd-c2b0563040c6' AND position = 1;

UPDATE pipeline_stages SET name = 'Propuesta', color = '#F59E0B', position = 2 
WHERE pipeline_id = 'dd0e797d-bf6a-4f16-a2dd-c2b0563040c6' AND position = 2;

UPDATE pipeline_stages SET name = 'Negociación', color = '#F97316', position = 3 
WHERE pipeline_id = 'dd0e797d-bf6a-4f16-a2dd-c2b0563040c6' AND position = 3;

UPDATE pipeline_stages SET name = 'Ganado', color = '#22C55E', position = 4, is_won_stage = true 
WHERE pipeline_id = 'dd0e797d-bf6a-4f16-a2dd-c2b0563040c6' AND position = 4;

UPDATE pipeline_stages SET name = 'Perdido', color = '#EF4444', position = 5, is_lost_stage = true 
WHERE pipeline_id = 'dd0e797d-bf6a-4f16-a2dd-c2b0563040c6' AND position = 5;

-- Actualizar etapas del pipeline Negociaciones
UPDATE pipeline_stages SET name = 'Nueva', color = '#3B82F6', position = 0 
WHERE pipeline_id = '51058e8c-0526-42b1-9917-6d6e28bc6c1f' AND position = 0;

UPDATE pipeline_stages SET name = 'Reunión', color = '#8B5CF6', position = 1 
WHERE pipeline_id = '51058e8c-0526-42b1-9917-6d6e28bc6c1f' AND position = 1;

UPDATE pipeline_stages SET name = 'Ganada', color = '#22C55E', position = 2, is_won_stage = true 
WHERE pipeline_id = '51058e8c-0526-42b1-9917-6d6e28bc6c1f' AND position = 2;

UPDATE pipeline_stages SET name = 'Perdida', color = '#EF4444', position = 3, is_lost_stage = true 
WHERE pipeline_id = '51058e8c-0526-42b1-9917-6d6e28bc6c1f' AND position = 3;

-- Actualizar actividades demo con fechas recientes usando RANDOM
UPDATE activities 
SET created_at = NOW() - (RANDOM() * 72 * INTERVAL '1 hour')
WHERE organization_id = 'a1000000-0000-0000-0000-000000000001';

-- Actualizar tareas demo con fechas cercanas
UPDATE crm_tasks
SET due_date = CURRENT_DATE + (FLOOR(RANDOM() * 7) - 2)::INTEGER
WHERE organization_id = 'a1000000-0000-0000-0000-000000000001' 
AND status IN ('pending', 'in_progress');