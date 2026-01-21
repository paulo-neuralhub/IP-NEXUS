-- P77: Add Help Center multilingual structure + FAQs table (non-breaking with existing help center)

-- -----------------------------------------------------
-- help_categories: add multilingual columns expected by P77
-- -----------------------------------------------------
alter table public.help_categories
  add column if not exists title text,
  add column if not exists title_es text,
  add column if not exists description_es text,
  add column if not exists sort_order int,
  add column if not exists created_at timestamptz;

-- Backfill from existing fields when present
update public.help_categories
set
  title = coalesce(title, name, slug),
  title_es = coalesce(title_es, name, slug),
  description_es = coalesce(description_es, description),
  sort_order = coalesce(sort_order, display_order, 0),
  created_at = coalesce(created_at, now())
where true;

-- -----------------------------------------------------
-- help_articles: add multilingual columns expected by P77
-- -----------------------------------------------------
alter table public.help_articles
  add column if not exists title_es text,
  add column if not exists content_es text,
  add column if not exists excerpt text,
  add column if not exists excerpt_es text,
  add column if not exists sort_order int,
  add column if not exists status text,
  add column if not exists helpful_yes int,
  add column if not exists helpful_no int;

update public.help_articles
set
  title_es = coalesce(title_es, title),
  content_es = coalesce(content_es, content),
  excerpt = coalesce(excerpt, summary),
  excerpt_es = coalesce(excerpt_es, summary),
  sort_order = coalesce(sort_order, display_order, 0),
  status = coalesce(status, case when is_published then 'published' else 'draft' end),
  helpful_yes = coalesce(helpful_yes, helpful_count, 0),
  helpful_no = coalesce(helpful_no, not_helpful_count, 0)
where true;

-- -----------------------------------------------------
-- FAQs table
-- -----------------------------------------------------
create table if not exists public.help_faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  question_es text not null,
  answer text not null,
  answer_es text not null,
  category text not null default 'general',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.help_faqs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='help_faqs' and policyname='Public can read active faqs'
  ) then
    create policy "Public can read active faqs"
      on public.help_faqs
      for select
      using (is_active = true);
  end if;
end $$;

create index if not exists idx_help_faqs_active_sort on public.help_faqs(is_active, sort_order);
create index if not exists idx_help_faqs_category on public.help_faqs(category, sort_order);
