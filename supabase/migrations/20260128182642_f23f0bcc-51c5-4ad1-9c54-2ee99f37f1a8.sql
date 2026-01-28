-- =============================================================================
-- FIX 1: Eliminar función win_deal duplicada (la que tiene p_user_id)
-- =============================================================================
DROP FUNCTION IF EXISTS public.win_deal(uuid, uuid, numeric, text);

-- =============================================================================
-- FIX 2: Añadir etapas faltantes al pipeline Negociaciones
-- =============================================================================

-- Actualizar posiciones de Ganada y Perdida
UPDATE pipeline_stages 
SET position = 4
WHERE pipeline_id = '51058e8c-0526-42b1-9917-6d6e28bc6c1f' 
AND name = 'Ganada';

UPDATE pipeline_stages 
SET position = 5
WHERE pipeline_id = '51058e8c-0526-42b1-9917-6d6e28bc6c1f' 
AND name = 'Perdida';

-- Insertar "Propuesta Enviada" en posición 2
INSERT INTO pipeline_stages (
  id, pipeline_id, name, color, position, probability, is_won_stage, is_lost_stage
) VALUES (
  gen_random_uuid(),
  '51058e8c-0526-42b1-9917-6d6e28bc6c1f',
  'Propuesta Enviada',
  '#F59E0B',
  2,
  60,
  false,
  false
);

-- Insertar "En Revisión" en posición 3
INSERT INTO pipeline_stages (
  id, pipeline_id, name, color, position, probability, is_won_stage, is_lost_stage
) VALUES (
  gen_random_uuid(),
  '51058e8c-0526-42b1-9917-6d6e28bc6c1f',
  'En Revisión',
  '#F97316',
  3,
  75,
  false,
  false
);