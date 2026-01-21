-- Fix for failed P77 migration: existing help_articles table missing expected columns

-- Ensure columns exist on help_articles
alter table public.help_articles
  add column if not exists category_id uuid;

alter table public.help_articles
  add column if not exists slug text;

alter table public.help_articles
  add column if not exists title text;

alter table public.help_articles
  add column if not exists title_es text;

alter table public.help_articles
  add column if not exists content text;

alter table public.help_articles
  add column if not exists content_es text;

alter table public.help_articles
  add column if not exists excerpt text;

alter table public.help_articles
  add column if not exists excerpt_es text;

alter table public.help_articles
  add column if not exists meta_title text;

alter table public.help_articles
  add column if not exists meta_description text;

alter table public.help_articles
  add column if not exists status text;

alter table public.help_articles
  add column if not exists view_count int;

alter table public.help_articles
  add column if not exists helpful_yes int;

alter table public.help_articles
  add column if not exists helpful_no int;

alter table public.help_articles
  add column if not exists tags text[];

alter table public.help_articles
  add column if not exists sort_order int;

alter table public.help_articles
  add column if not exists is_featured boolean;

alter table public.help_articles
  add column if not exists created_at timestamptz;

alter table public.help_articles
  add column if not exists updated_at timestamptz;

alter table public.help_articles
  add column if not exists published_at timestamptz;

-- Backfill defaults where null
update public.help_articles set
  status = coalesce(status, 'draft'),
  view_count = coalesce(view_count, 0),
  helpful_yes = coalesce(helpful_yes, 0),
  helpful_no = coalesce(helpful_no, 0),
  tags = coalesce(tags, '{}'),
  sort_order = coalesce(sort_order, 0),
  is_featured = coalesce(is_featured, false),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now())
where true;

-- Ensure constraints: unique slug if possible
-- (only create if not already present)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'help_articles_slug_key'
  ) then
    begin
      alter table public.help_articles add constraint help_articles_slug_key unique (slug);
    exception when others then
      -- ignore if duplicates exist; admin can resolve
      null;
    end;
  end if;
end $$;

-- Ensure FK to categories
-- (only if column exists and fk not present)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'help_articles_category_id_fkey'
  ) then
    begin
      alter table public.help_articles
        add constraint help_articles_category_id_fkey
        foreign key (category_id)
        references public.help_categories(id)
        on delete set null;
    exception when others then
      null;
    end;
  end if;
end $$;

-- Add validation trigger for status
create or replace function public.help_articles_validate_status()
returns trigger as $$
begin
  if new.status not in ('draft','published','archived') then
    raise exception 'Invalid status: %', new.status;
  end if;
  return new;
end;
$$ language plpgsql set search_path = public;

drop trigger if exists trg_help_articles_validate_status on public.help_articles;
create trigger trg_help_articles_validate_status
before insert or update on public.help_articles
for each row execute function public.help_articles_validate_status();

-- Updated-at trigger
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

drop trigger if exists trg_help_articles_updated_at on public.help_articles;
create trigger trg_help_articles_updated_at
before update on public.help_articles
for each row execute function public.update_updated_at_column();

-- Ensure RLS and policies
alter table public.help_articles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='help_articles' and policyname='Public can read published articles'
  ) then
    create policy "Public can read published articles"
      on public.help_articles
      for select
      using (status = 'published');
  end if;
end $$;

-- Indexes
create index if not exists idx_help_articles_category on public.help_articles(category_id);
create index if not exists idx_help_articles_slug on public.help_articles(slug);
create index if not exists idx_help_articles_tags on public.help_articles using gin(tags);
create index if not exists idx_help_articles_status_published on public.help_articles(status) where status = 'published';

create index if not exists idx_help_articles_search_es
on public.help_articles using gin(
  to_tsvector('spanish', coalesce(title_es,'') || ' ' || coalesce(content_es,'') || ' ' || coalesce(excerpt_es,''))
);

-- RPC helpers (idempotent)
create or replace function public.increment_help_counter(
  p_article_id uuid,
  p_field text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_field not in ('helpful_yes','helpful_no') then
    raise exception 'Invalid field: %', p_field;
  end if;

  if p_field = 'helpful_yes' then
    update public.help_articles
      set helpful_yes = coalesce(helpful_yes,0) + 1
    where id = p_article_id;
  else
    update public.help_articles
      set helpful_no = coalesce(helpful_no,0) + 1
    where id = p_article_id;
  end if;
end;
$$;

create or replace function public.increment_help_view_count(
  p_article_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.help_articles
    set view_count = coalesce(view_count,0) + 1
  where id = p_article_id;
end;
$$;

grant execute on function public.increment_help_counter(uuid, text) to anon, authenticated;
grant execute on function public.increment_help_view_count(uuid) to anon, authenticated;
