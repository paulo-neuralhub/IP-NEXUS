
-- Insert membership for real user to Meridian IP Demo
INSERT INTO memberships (
  id,
  user_id,
  organization_id,
  role,
  created_at
) VALUES (
  gen_random_uuid(),
  '0090b656-5c9a-445c-91be-34228afb2b0f',
  'd0000001-0000-0000-0000-000000000001',
  'owner',
  NOW()
);
