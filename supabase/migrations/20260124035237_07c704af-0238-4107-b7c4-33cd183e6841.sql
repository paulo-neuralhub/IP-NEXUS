-- Fix CRM pipeline template types to satisfy pipelines_pipeline_type_check
-- Allowed: sales, registration, opposition, renewal, support, custom

BEGIN;

UPDATE public.crm_pipeline_templates
SET pipeline_type = 'opposition',
    updated_at = now()
WHERE pipeline_type = 'oppositions'
   OR code = 'oppositions';

UPDATE public.crm_pipeline_templates
SET pipeline_type = 'renewal',
    updated_at = now()
WHERE pipeline_type = 'renewals'
   OR code = 'renewals';

COMMIT;
