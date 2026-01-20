-- Schedule deadline-alerts to run daily at 8:00 AM UTC
SELECT cron.schedule(
  'deadline-alerts-daily',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url:='https://dcdbpmbzizzzzdfkvohl.supabase.co/functions/v1/deadline-alerts',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZGJwbWJ6aXp6enpkZmt2b2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MjgzNTcsImV4cCI6MjA4NDMwNDM1N30.m-eYHXgQAPEejDLHKgJQaBiwEB19HJT3zjQSsPqLf5g"}'::jsonb,
    body:='{}'::jsonb
  ) AS request_id;
  $$
);

-- Schedule deadline-digest to run daily at 7:00 AM UTC
SELECT cron.schedule(
  'deadline-digest-daily',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url:='https://dcdbpmbzizzzzdfkvohl.supabase.co/functions/v1/deadline-digest',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZGJwbWJ6aXp6enpkZmt2b2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MjgzNTcsImV4cCI6MjA4NDMwNDM1N30.m-eYHXgQAPEejDLHKgJQaBiwEB19HJT3zjQSsPqLf5g"}'::jsonb,
    body:='{"digestType": "daily"}'::jsonb
  ) AS request_id;
  $$
);

-- Schedule weekly digest on Mondays at 7:00 AM UTC
SELECT cron.schedule(
  'deadline-digest-weekly',
  '0 7 * * 1',
  $$
  SELECT net.http_post(
    url:='https://dcdbpmbzizzzzdfkvohl.supabase.co/functions/v1/deadline-digest',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZGJwbWJ6aXp6enpkZmt2b2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MjgzNTcsImV4cCI6MjA4NDMwNDM1N30.m-eYHXgQAPEejDLHKgJQaBiwEB19HJT3zjQSsPqLf5g"}'::jsonb,
    body:='{"digestType": "weekly"}'::jsonb
  ) AS request_id;
  $$
);