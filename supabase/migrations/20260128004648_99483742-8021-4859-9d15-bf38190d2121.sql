
-- Enable VoIP globally for demo purposes
INSERT INTO telephony_config (
  id,
  voip_enabled,
  test_mode,
  created_at
) VALUES (
  gen_random_uuid(),
  TRUE,
  TRUE,
  NOW()
);
