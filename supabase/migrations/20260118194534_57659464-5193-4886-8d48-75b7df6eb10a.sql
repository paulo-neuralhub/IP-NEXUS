-- Enable RLS on webhook_events (no user access needed, only service role)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- No policies needed for webhook_events as it's only accessed by edge functions with service role