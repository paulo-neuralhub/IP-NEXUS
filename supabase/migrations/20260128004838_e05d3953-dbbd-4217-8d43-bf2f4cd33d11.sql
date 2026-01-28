
-- Grant Enterprise demo (a1000000-0000-0000-0000-000000000001) access to ALL modules
INSERT INTO organization_module_licenses (
  organization_id, module_id, license_type, status, tier_code, starts_at
)
SELECT 
  'a1000000-0000-0000-0000-000000000001'::uuid,
  pm.id,
  'included',
  'active',
  'enterprise',
  NOW()
FROM platform_modules pm
WHERE pm.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM organization_module_licenses oml 
    WHERE oml.organization_id = 'a1000000-0000-0000-0000-000000000001'
    AND oml.module_id = pm.id
  );
