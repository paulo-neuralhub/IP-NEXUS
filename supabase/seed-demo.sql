-- IP-NEXUS — Demo seed (ejecutable)
-- Archivo: supabase/seed-demo.sql
--
-- PRERREQUISITO (paso previo): crear usuarios en Supabase Auth con estos UUIDs fijos.
-- Este script NO puede insertar en auth.users.
--
-- Ejecutar en SQL editor o psql.

begin;

-- =====================================================
-- 1) Verificar que es entorno de demo (GUARD ESTRICTO)
-- =====================================================
do $$
declare
  non_demo_orgs int;
begin
  if to_regclass('public.organizations') is null then
    raise exception 'Tabla public.organizations no existe.';
  end if;

  select count(*)::int
  into non_demo_orgs
  from public.organizations
  where coalesce(slug,'') not like 'demo-%'
    and coalesce(is_platform_org,false) = false;

  if non_demo_orgs > 0 then
    raise exception 'ABORT: se detectaron % organizaciones no-demo. No es seguro ejecutar este seed aquí.', non_demo_orgs;
  end if;
end $$;

-- =====================================================
-- 2) TRUNCATE (CASCADE) de tablas demo
-- =====================================================
-- Nota: el orden en TRUNCATE no importa cuando se usa CASCADE.
truncate table
  public.spider_alerts,
  public.watch_results,
  public.watchlists,
  public.workflow_action_logs,
  public.workflow_executions,
  public.workflow_templates,
  public.smart_tasks,
  public.email_sends,
  public.email_campaigns,
  public.contact_list_members,
  public.contact_lists,
  public.email_templates,
  public.quote_items,
  public.quotes,
  public.invoice_items,
  public.payments,
  public.invoices,
  public.matter_costs,
  public.deadline_alerts,
  public.matter_deadlines,
  public.communications,
  public.activities,
  public.filing_applications,
  public.deals,
  public.pipeline_stages,
  public.pipelines,
  public.billing_clients,
  public.matter_documents,
  public.matters,
  public.contacts,
  public.roles,
  public.team_members,
  public.memberships,
  public.users,
  public.organization_settings,
  public.demo_seed_entities,
  public.demo_seed_runs,
  public.organizations
restart identity
cascade;

-- =====================================================
-- 3) INSERT organizaciones demo
-- =====================================================
-- UUIDs fijos para que la demo sea reproducible
insert into public.organizations (id, name, slug, plan, status, settings, created_at)
values
  ('11111111-1111-1111-1111-111111111111', 'García IP Autónomo', 'demo-starter', 'starter', 'active', jsonb_build_object('currency','EUR','timezone','Europe/Madrid'), now()),
  ('22222222-2222-2222-2222-222222222222', 'Nexus Legal Studio', 'demo-professional', 'professional', 'active', jsonb_build_object('currency','EUR','timezone','Europe/Madrid'), now()),
  ('33333333-3333-3333-3333-333333333333', 'BluePeak Group', 'demo-business', 'business', 'active', jsonb_build_object('currency','EUR','timezone','Europe/Madrid'), now()),
  ('44444444-4444-4444-4444-444444444444', 'Enterprise IP Global', 'demo-enterprise', 'enterprise', 'active', jsonb_build_object('currency','EUR','timezone','UTC'), now());

-- =====================================================
-- 4) INSERT usuarios (tabla pública) con IDs fijos
-- =====================================================
-- IMPORTANTE: estos UUID deben existir también en auth.users (paso previo)
insert into public.users (id, email, full_name, created_at)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'owner@demo.ipnexus.local', 'Demo Owner', now()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'admin@demo.ipnexus.local', 'Demo Admin', now()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'manager@demo.ipnexus.local', 'Demo Manager', now()),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'agent@demo.ipnexus.local', 'Demo Agent', now());

-- Membresías (una por org; ampliable)
insert into public.memberships (id, user_id, organization_id, role, permissions, created_at)
values
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'owner', '{}'::jsonb, now()),
  (gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'admin', '{}'::jsonb, now()),
  (gen_random_uuid(), 'cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'manager', '{}'::jsonb, now()),
  (gen_random_uuid(), 'dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', 'member', '{}'::jsonb, now());

-- =====================================================
-- 5) INSERT clientes (contacts + billing_clients)
-- =====================================================
with orgs as (
  select id as organization_id, slug
  from public.organizations
  where slug like 'demo-%'
),
ins_contacts as (
  insert into public.contacts (
    organization_id, owner_type, type, name, email, phone, company_name,
    source, tags, lifecycle_stage, created_by, created_at, updated_at
  )
  select
    o.organization_id,
    'tenant',
    'company',
    v.name,
    v.email,
    '+34 910 000 000',
    v.name,
    'demo-seed',
    array['demo'],
    'customer',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    now(),
    now()
  from orgs o
  cross join (values
    ('Acme Foods S.L.', 'acme@demo.ipnexus.local'),
    ('BluePeak Robotics', 'bluepeak@demo.ipnexus.local'),
    ('Solaria Renewables', 'solaria@demo.ipnexus.local'),
    ('Vela Cosmetics', 'vela@demo.ipnexus.local')
  ) as v(name,email)
  returning id, organization_id, name
)
insert into public.billing_clients (
  organization_id, contact_id, legal_name, tax_id,
  billing_address, billing_city, billing_postal_code, billing_country,
  billing_email, payment_terms
)
select
  c.organization_id,
  c.id,
  c.name,
  'B' || (10000000 + (row_number() over (partition by c.organization_id order by c.name)))::text,
  'C/ Demo 123',
  'Madrid',
  '28001',
  'ES',
  lower(regexp_replace(c.name,'[^a-zA-Z0-9]+','-','g')) || '@billing.demo',
  30
from ins_contacts c;

-- =====================================================
-- 6) INSERT expedientes (matters) con todos los estados
-- =====================================================
with orgs as (
  select id as organization_id, slug
  from public.organizations
  where slug like 'demo-%'
),
clients as (
  select organization_id, id as contact_id, name
  from public.contacts
  where type = 'company'
),
statuses as (
  -- mezcla de estados típicos (ajusta si tu enum/check difiere)
  select unnest(array[
    'filed','pending_examination','published','opposition_period','under_opposition',
    'active','registered','granted','renewed','expired','abandoned','rejected'
  ]) as status
)
insert into public.matters (
  organization_id,
  reference,
  title,
  type,
  status,
  jurisdiction,
  jurisdiction_code,
  filing_date,
  expiry_date,
  next_renewal_date,
  mark_name,
  owner_name,
  tags,
  notes,
  created_by
)
select
  o.organization_id,
  'DEMO-' || lpad((row_number() over (partition by o.organization_id order by c.contact_id, s.status))::text, 4, '0'),
  upper(pick) || ' — ' || c.name,
  case (row_number() over (partition by o.organization_id order by c.contact_id, s.status)) % 3
    when 0 then 'trademark'
    when 1 then 'patent'
    else 'design'
  end,
  s.status,
  case (row_number() over (partition by o.organization_id order by c.contact_id, s.status)) % 3
    when 0 then 'ES'
    when 1 then 'EU'
    else 'WO'
  end,
  case (row_number() over (partition by o.organization_id order by c.contact_id, s.status)) % 3
    when 0 then 'ES'
    when 1 then 'EU'
    else 'WO'
  end,
  (current_date - interval '30 days')::date,
  (current_date + interval '9 years')::date,
  (current_date + interval '8 years 6 months')::date,
  case when (row_number() over (partition by o.organization_id order by c.contact_id, s.status)) % 3 = 0 then 'NEXAL' else null end,
  c.name,
  array['demo'],
  'Expediente de demostración (seed SQL).',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
from orgs o
join clients c on c.organization_id = o.organization_id
join statuses s on true
cross join (values ('demo')) as t(pick);

-- =====================================================
-- 7) INSERT plazos (fechas dinámicas)
-- =====================================================
with m as (
  select id as matter_id, organization_id
  from public.matters
),
types as (
  select unnest(array['renewal','office_action','opposition','payment','filing']) as deadline_type
)
insert into public.matter_deadlines (
  organization_id,
  matter_id,
  deadline_type,
  title,
  description,
  trigger_date,
  deadline_date,
  status,
  priority
)
select
  m.organization_id,
  m.matter_id,
  t.deadline_type,
  'Plazo demo — ' || t.deadline_type,
  'Plazo de demostración con fechas relativas.',
  (current_date - interval '30 days')::date,
  (current_date + interval '7 days')::date,
  'pending',
  'normal'
from m
join types t on true
where (random() < 0.35);

-- =====================================================
-- 8) INSERT facturas y pagos
-- =====================================================
with bc as (
  select id as billing_client_id, organization_id, legal_name
  from public.billing_clients
),
inv as (
  insert into public.invoices (
    organization_id,
    invoice_series,
    invoice_number,
    billing_client_id,
    client_name,
    invoice_date,
    due_date,
    subtotal,
    tax_rate,
    tax_amount,
    total,
    currency,
    status,
    notes,
    created_by
  )
  select
    bc.organization_id,
    'F-2026',
    'F-2026-' || lpad((row_number() over (partition by bc.organization_id order by bc.legal_name))::text, 3, '0'),
    bc.billing_client_id,
    bc.legal_name,
    (current_date - interval '30 days')::date,
    (current_date + interval '7 days')::date,
    1000,
    21,
    210,
    1210,
    'EUR',
    case when random() < 0.7 then 'paid' else 'sent' end,
    '(DEMO) Factura seed SQL.',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  from bc
  returning id, organization_id, total, status
)
insert into public.payments (
  organization_id,
  amount,
  currency,
  status,
  description,
  internal_invoice_id,
  paid_at,
  metadata
)
select
  i.organization_id,
  i.total,
  'EUR',
  'succeeded',
  '(DEMO) Pago asociado a factura.',
  i.id,
  now(),
  jsonb_build_object('demo', true, 'source', 'seed-demo.sql')
from inv i
where i.status = 'paid';

-- =====================================================
-- 9) INSERT comunicaciones
-- =====================================================
insert into public.communications (
  organization_id,
  client_id,
  contact_id,
  matter_id,
  channel,
  direction,
  subject,
  body,
  body_preview,
  received_at,
  is_read
)
select
  c.organization_id,
  c.id,
  c.id,
  m.id,
  'email',
  'outbound',
  '(DEMO) Actualización de expediente',
  '(DEMO) Email de ejemplo generado por seed-demo.sql',
  '(DEMO) Email de ejemplo',
  now() - interval '3 days',
  true
from public.contacts c
join lateral (
  select id
  from public.matters
  where organization_id = c.organization_id
  order by random()
  limit 1
) m on true
where c.type = 'company'
  and random() < 0.6;

-- =====================================================
-- 10) INSERT vigilancias y resultados
-- =====================================================
-- Watchlists
with orgs as (
  select id as organization_id, slug
  from public.organizations
  where slug like 'demo-%'
),
mat as (
  select organization_id, id as matter_id
  from public.matters
)
insert into public.watchlists (
  organization_id,
  owner_type,
  name,
  description,
  type,
  watch_terms,
  watch_classes,
  watch_jurisdictions,
  similarity_threshold,
  notify_email,
  notify_in_app,
  notify_frequency,
  notify_users,
  is_active,
  last_run_at,
  next_run_at,
  run_frequency,
  created_by,
  updated_at,
  matter_id
)
select
  o.organization_id,
  'tenant',
  '(DEMO) Vigilancia Marca propia',
  '(DEMO) Watchlist creada por seed-demo.sql',
  'trademark',
  array['IPNEXUS','NEXUS'],
  array[9,35],
  array['ES','EUIPO'],
  85,
  true,
  true,
  'weekly',
  array['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'],
  true,
  now() - interval '7 days',
  now() + interval '7 days',
  'weekly',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  now(),
  (select m.matter_id from mat m where m.organization_id = o.organization_id order by random() limit 1)
from orgs o;

-- Watch results (20 por organización aprox)
insert into public.watch_results (
  organization_id,
  watchlist_id,
  result_type,
  title,
  description,
  source,
  source_url,
  source_id,
  applicant_name,
  applicant_country,
  filing_date,
  publication_date,
  classes,
  similarity_score,
  similarity_type,
  screenshot_url,
  status,
  priority,
  related_matter_id,
  detected_at,
  raw_data
)
select
  wl.organization_id,
  wl.id,
  'trademark_published',
  '(DEMO) Marca detectada: NEXXUS',
  '(DEMO) Coincidencia simulada.',
  'EUIPO',
  'https://gazette.demo.ipnexus.com/result/demo',
  'DEMO-RESULT-' || lpad((row_number() over (partition by wl.organization_id order by wl.id))::text, 4, '0'),
  'Demo Legal SL',
  'ES',
  (current_date - interval '30 days')::date,
  (current_date - interval '7 days')::date,
  array[9,35],
  (70 + (random() * 25))::int,
  'phonetic',
  'https://picsum.photos/seed/demo/800/450',
  'new',
  'medium',
  (select id from public.matters m where m.organization_id = wl.organization_id order by random() limit 1),
  now() - interval '2 days',
  jsonb_build_object('demo', true)
from public.watchlists wl
cross join generate_series(1, 20);

-- Spider alerts (1 por watch_result)
insert into public.spider_alerts (
  organization_id,
  watchlist_id,
  watch_result_id,
  matter_id,
  alert_type,
  title,
  message,
  severity,
  status,
  action_url,
  notified_at,
  notified_via,
  data
)
select
  wr.organization_id,
  wr.watchlist_id,
  wr.id,
  wr.related_matter_id,
  'high_similarity',
  '(DEMO) Nueva coincidencia detectada',
  '(DEMO) Coincidencia phonetic con score ' || wr.similarity_score::text,
  case when wr.similarity_score >= 90 then 'critical'
       when wr.similarity_score >= 80 then 'high'
       when wr.similarity_score >= 70 then 'medium'
       else 'low' end,
  'unread',
  '/app/spider/results/' || wr.id,
  now() - interval '2 days',
  array['in_app'],
  jsonb_build_object('demo', true)
from public.watch_results wr;

-- =====================================================
-- FINAL: refresh materialized views si existen
-- =====================================================
do $$
declare
  r record;
begin
  for r in select schemaname, matviewname from pg_matviews where schemaname = 'public' loop
    execute format('refresh materialized view concurrently %I.%I', r.schemaname, r.matviewname);
  end loop;
exception
  when feature_not_supported then
    -- Si alguna matview no soporta CONCURRENTLY, intentamos sin concurrently
    for r in select schemaname, matviewname from pg_matviews where schemaname = 'public' loop
      execute format('refresh materialized view %I.%I', r.schemaname, r.matviewname);
    end loop;
end $$;

commit;
