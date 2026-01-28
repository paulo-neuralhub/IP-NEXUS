
-- Add missing columns to crm_leads for lead closure tracking
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS loss_reason TEXT;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS loss_reason_code VARCHAR(50);
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS is_won BOOLEAN DEFAULT false;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;
ALTER TABLE crm_leads ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add Stand By stage to Leads pipeline (between Propuesta and Ganado)
-- First get the pipeline id
DO $$
DECLARE
  leads_pipeline_id UUID;
BEGIN
  SELECT id INTO leads_pipeline_id FROM pipelines WHERE LOWER(name) LIKE '%lead%' LIMIT 1;
  
  -- Check if Stand By stage already exists
  IF NOT EXISTS (
    SELECT 1 FROM pipeline_stages 
    WHERE pipeline_id = leads_pipeline_id AND LOWER(name) = 'stand by'
  ) THEN
    -- Insert Stand By stage at position 3
    INSERT INTO pipeline_stages (pipeline_id, name, color, position, probability, is_won_stage, is_lost_stage)
    VALUES (leads_pipeline_id, 'Stand By', '#6B7280', 3, 30, false, false);
  END IF;
  
  -- Also add Cualificado stage if missing
  IF NOT EXISTS (
    SELECT 1 FROM pipeline_stages 
    WHERE pipeline_id = leads_pipeline_id AND LOWER(name) = 'cualificado'
  ) THEN
    INSERT INTO pipeline_stages (pipeline_id, name, color, position, probability, is_won_stage, is_lost_stage)
    VALUES (leads_pipeline_id, 'Cualificado', '#8B5CF6', 2, 50, false, false);
  END IF;

  -- Fix positions to be sequential
  WITH numbered AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY 
      CASE name
        WHEN 'Nuevo' THEN 1
        WHEN 'Contactado' THEN 2
        WHEN 'Cualificado' THEN 3
        WHEN 'Propuesta' THEN 4
        WHEN 'Stand By' THEN 5
        WHEN 'Ganado' THEN 6
        WHEN 'Perdido' THEN 7
        ELSE 10
      END, position
    ) - 1 as new_position
    FROM pipeline_stages
    WHERE pipeline_id = leads_pipeline_id
  )
  UPDATE pipeline_stages ps
  SET position = n.new_position
  FROM numbered n
  WHERE ps.id = n.id;

END $$;
