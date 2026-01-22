-- Demo Data Seeding Infrastructure (Backoffice-triggered)

-- 1) Runs table
create table if not exists public.demo_seed_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  created_by uuid,
  status text not null default 'running', -- running | completed | failed
  seed_version text not null default 'v1',
  created_at timestamptz not null default now(),
  finished_at timestamptz,
  error_message text
);

create index if not exists idx_demo_seed_runs_org_created_at
  on public.demo_seed_runs (organization_id, created_at desc);

-- 2) Entity registry (for safe cleanup)
create table if not exists public.demo_seed_entities (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.demo_seed_runs(id) on delete cascade,
  table_name text not null,
  row_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_demo_seed_entities_run
  on public.demo_seed_entities (run_id);

create index if not exists idx_demo_seed_entities_run_table
  on public.demo_seed_entities (run_id, table_name);

-- 3) Security: deny all client-side access (Edge Functions only)
alter table public.demo_seed_runs enable row level security;
alter table public.demo_seed_entities enable row level security;

drop policy if exists "deny_all" on public.demo_seed_runs;
create policy "deny_all" on public.demo_seed_runs
  for all
  to public
  using (false)
  with check (false);

drop policy if exists "deny_all" on public.demo_seed_entities;
create policy "deny_all" on public.demo_seed_entities
  for all
  to public
  using (false)
  with check (false);
