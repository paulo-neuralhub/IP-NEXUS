-- Provisionar TODOS los tenants existentes con las automatizaciones publicadas
INSERT INTO tenant_automations (
  organization_id,
  master_template_id,
  name,
  description,
  category,
  is_active,
  is_locked,
  trigger_type,
  trigger_config,
  conditions,
  actions,
  custom_params
)
SELECT 
  o.id as organization_id,
  mt.id as master_template_id,
  mt.name,
  mt.description,
  mt.category,
  CASE WHEN mt.visibility IN ('mandatory', 'recommended') THEN true ELSE false END as is_active,
  CASE WHEN mt.visibility = 'mandatory' THEN true ELSE false END as is_locked,
  mt.trigger_type,
  mt.trigger_config,
  mt.conditions,
  mt.actions,
  '{}'::jsonb as custom_params
FROM organizations o
CROSS JOIN automation_master_templates mt
WHERE mt.is_published = true
  AND o.status = 'active'
ON CONFLICT DO NOTHING;