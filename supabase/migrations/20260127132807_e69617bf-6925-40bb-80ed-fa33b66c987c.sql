-- Insertar Paulo Chalaca como Super Admin
INSERT INTO super_admins (user_id, email, name, permissions, is_active)
VALUES (
  '0090b656-5c9a-445c-91be-34228afb2b0f',
  'paulo.chalaca.ai@gmail.com',
  'Paulo Chalaca',
  '{
    "backoffice": true,
    "demo": true,
    "impersonate_tenant": true,
    "simulate_subscription": true,
    "view_all_data": true,
    "manage_super_admins": true
  }'::jsonb,
  TRUE
)
ON CONFLICT (user_id) DO UPDATE SET
  is_active = TRUE,
  permissions = EXCLUDED.permissions;