-- Corregir campo de fecha en templates de plazos
-- El campo correcto es deadline_date, no due_date

UPDATE automation_master_templates
SET trigger_config = jsonb_set(
  trigger_config,
  '{date_field}',
  '"deadline_date"'
)
WHERE trigger_config->>'table' = 'matter_deadlines'
AND trigger_config->>'date_field' = 'due_date';

-- También corregir en tenant_automations
UPDATE tenant_automations
SET trigger_config = jsonb_set(
  trigger_config,
  '{date_field}',
  '"deadline_date"'
)
WHERE trigger_config->>'table' = 'matter_deadlines'
AND trigger_config->>'date_field' = 'due_date';