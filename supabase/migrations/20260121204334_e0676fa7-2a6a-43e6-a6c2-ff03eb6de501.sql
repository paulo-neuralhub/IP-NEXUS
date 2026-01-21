-- JKLAW-01 (slice) Knowledge Bases: Jurisdictions + Legal Areas + Disclaimers
-- Fix applied: jurisdiction code supports longer values like 'GLOBAL'

-- 0) Helper: superadmin check (uses existing public.superadmins table)
create or replace function public.is_superadmin()
returns boolean
language sql
stable
as $$
  select exists(
    select 1
    from public.superadmins s
    where s.user_id = auth.uid()
      and coalesce(s.is_active, false) = true
  );
$$;

-- 1) Jurisdicciones
create table if not exists public.ai_kb_jurisdictions (
  id uuid primary key default gen_random_uuid(),

  code varchar(10) not null unique,
  name text not null,
  name_local text,
  language_code varchar(5) default 'es',
  flag_emoji varchar(10),

  confidence_tier varchar(20) not null default 'tier_3'
    check (confidence_tier in ('tier_1','tier_2','tier_3')),

  score_overall smallint default 0 check (score_overall between 0 and 100),
  score_knowledge_depth smallint default 0 check (score_knowledge_depth between 0 and 100),
  score_data_availability smallint default 0 check (score_data_availability between 0 and 100),
  score_update_recency smallint default 0 check (score_update_recency between 0 and 100),
  score_source_quality smallint default 0 check (score_source_quality between 0 and 100),

  data_sources text[] default '{}'::text[],
  official_registry_url text,

  known_limitations text[] default '{}'::text[],
  coverage_gaps text[] default '{}'::text[],

  legal_disclaimer text not null default 'Esta información es orientativa y no constituye asesoramiento legal. Consulte siempre con un profesional cualificado.',

  requires_plan varchar(20) default 'basic'
    check (requires_plan in ('basic','professional','enterprise')),

  is_active boolean default true,
  is_beta boolean default false,

  total_queries integer default 0,
  accuracy_feedback_positive integer default 0,
  accuracy_feedback_negative integer default 0,

  last_content_update timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_kb_jurisdictions_code on public.ai_kb_jurisdictions(code);
create index if not exists idx_kb_jurisdictions_tier on public.ai_kb_jurisdictions(confidence_tier);
create index if not exists idx_kb_jurisdictions_plan on public.ai_kb_jurisdictions(requires_plan);
create index if not exists idx_kb_jurisdictions_active on public.ai_kb_jurisdictions(is_active) where is_active = true;

drop trigger if exists trg_kb_jurisdictions_updated_at on public.ai_kb_jurisdictions;
create trigger trg_kb_jurisdictions_updated_at
before update on public.ai_kb_jurisdictions
for each row execute function public.update_updated_at_column();

-- 2) Áreas legales
create table if not exists public.ai_kb_legal_areas (
  id uuid primary key default gen_random_uuid(),
  jurisdiction_id uuid not null references public.ai_kb_jurisdictions(id) on delete cascade,

  area_code varchar(50) not null,
  area_name text not null,
  area_icon varchar(20),

  area_score smallint default 0 check (area_score between 0 and 100),
  documents_indexed integer default 0,

  area_limitations text[] default '{}'::text[],

  is_active boolean default true,
  requires_plan varchar(20) default 'basic'
    check (requires_plan in ('basic','professional','enterprise')),

  last_updated timestamptz default now(),

  unique (jurisdiction_id, area_code)
);

create index if not exists idx_kb_legal_areas_jurisdiction on public.ai_kb_legal_areas(jurisdiction_id);
create index if not exists idx_kb_legal_areas_code on public.ai_kb_legal_areas(area_code);

-- 3) Disclaimers por tier
create table if not exists public.ai_kb_disclaimers (
  id uuid primary key default gen_random_uuid(),

  tier varchar(20) not null unique,

  badge_text text not null,
  badge_color varchar(20) not null,
  short_message text not null,
  long_message text not null,

  show_verification_prompt boolean default false,
  verification_message text,

  created_at timestamptz default now()
);

-- 4) Seed data
insert into public.ai_kb_disclaimers (
  tier, badge_text, badge_color, short_message, long_message, show_verification_prompt, verification_message
) values
(
  'tier_1',
  '🟢 Modo Experto',
  'green',
  'Conocimiento completo verificado',
  'Esta jurisdicción cuenta con legislación completa, jurisprudencia y doctrina indexada. Las respuestas tienen alta fiabilidad pero siempre deben verificarse con un profesional para casos específicos.',
  false,
  null
),
(
  'tier_2',
  '🟡 Modo Básico',
  'yellow',
  'Conocimiento parcial - Verificar puntos críticos',
  'Esta jurisdicción cuenta solo con legislación principal. NO incluye jurisprudencia detallada ni doctrina. Verifique siempre los puntos críticos con un experto local antes de actuar.',
  true,
  '⚠️ Te recomendamos verificar esta información con un abogado especializado en esta jurisdicción.'
),
(
  'tier_3',
  '🟠 Modo General',
  'orange',
  'Solo principios generales - Consultar experto',
  'Para esta jurisdicción solo disponemos de principios generales de propiedad intelectual. NO tenemos legislación específica indexada. Es IMPRESCINDIBLE consultar con un experto local antes de tomar cualquier decisión.',
  true,
  '⚠️ IMPORTANTE: Esta respuesta se basa únicamente en principios generales. Debes consultar con un abogado especializado en esta jurisdicción antes de actuar.'
)
on conflict (tier) do update set
  badge_text = excluded.badge_text,
  badge_color = excluded.badge_color,
  short_message = excluded.short_message,
  long_message = excluded.long_message,
  show_verification_prompt = excluded.show_verification_prompt,
  verification_message = excluded.verification_message;

-- Jurisdicciones iniciales
insert into public.ai_kb_jurisdictions (
  code, name, name_local, language_code, flag_emoji,
  confidence_tier,
  score_overall, score_knowledge_depth, score_data_availability, score_update_recency, score_source_quality,
  data_sources, official_registry_url,
  known_limitations, coverage_gaps,
  requires_plan, is_active
) values (
  'ES', 'España', 'España', 'es', '🇪🇸',
  'tier_1',
  92, 95, 90, 88, 95,
  array['BOE','OEPM','Jurisprudencia TS','Jurisprudencia AN','EUR-Lex'],
  'https://www.oepm.es',
  array['No incluye ordenanzas municipales','Jurisprudencia de TSJ autonómicos limitada','Resoluciones OEPM desde 2015'],
  array['Indicaciones geográficas detalladas','Denominaciones de origen'],
  'basic', true
) on conflict (code) do update set
  name = excluded.name,
  confidence_tier = excluded.confidence_tier,
  score_overall = excluded.score_overall,
  score_knowledge_depth = excluded.score_knowledge_depth,
  score_data_availability = excluded.score_data_availability,
  score_update_recency = excluded.score_update_recency,
  score_source_quality = excluded.score_source_quality,
  data_sources = excluded.data_sources,
  known_limitations = excluded.known_limitations,
  coverage_gaps = excluded.coverage_gaps,
  updated_at = now();

insert into public.ai_kb_jurisdictions (
  code, name, name_local, language_code, flag_emoji,
  confidence_tier,
  score_overall, score_knowledge_depth, score_data_availability, score_update_recency, score_source_quality,
  data_sources, official_registry_url,
  known_limitations, coverage_gaps,
  requires_plan, is_active
) values (
  'EU', 'Unión Europea', 'European Union', 'es', '🇪🇺',
  'tier_1',
  90, 92, 88, 90, 92,
  array['EUR-Lex','EUIPO','Jurisprudencia TJUE','Reglamentos UE','Directivas'],
  'https://euipo.europa.eu',
  array['Transposiciones nacionales solo parciales','Jurisprudencia Tribunales Generales limitada'],
  array['Regulación nacional de estados miembros'],
  'basic', true
) on conflict (code) do update set
  name = excluded.name,
  confidence_tier = excluded.confidence_tier,
  score_overall = excluded.score_overall,
  updated_at = now();

insert into public.ai_kb_jurisdictions (
  code, name, name_local, language_code, flag_emoji,
  confidence_tier,
  score_overall, score_knowledge_depth, score_data_availability, score_update_recency, score_source_quality,
  data_sources, official_registry_url,
  known_limitations, coverage_gaps,
  requires_plan, is_active
) values (
  'US', 'Estados Unidos', 'United States', 'en', '🇺🇸',
  'tier_2',
  72, 75, 70, 68, 78,
  array['USPTO','MPEP','TTAB','Federal Register','Lanham Act'],
  'https://www.uspto.gov',
  array['Solo derecho federal','Leyes estatales NO incluidas','Case law desde 2015 únicamente','TTAB decisions parciales'],
  array['State trademark laws','Common law trademarks','Trade dress state level'],
  'professional', true
) on conflict (code) do update set
  name = excluded.name,
  confidence_tier = excluded.confidence_tier,
  score_overall = excluded.score_overall,
  known_limitations = excluded.known_limitations,
  updated_at = now();

insert into public.ai_kb_jurisdictions (
  code, name, name_local, language_code, flag_emoji,
  confidence_tier,
  score_overall, score_knowledge_depth, score_data_availability, score_update_recency, score_source_quality,
  data_sources, official_registry_url,
  known_limitations, coverage_gaps,
  requires_plan, is_active
) values (
  'WO', 'WIPO / PCT', 'World Intellectual Property Organization', 'en', '🌐',
  'tier_2',
  75, 78, 72, 75, 80,
  array['WIPO Treaties','PCT Guidelines','Madrid Protocol','Hague System'],
  'https://www.wipo.int',
  array['Solo procedimientos internacionales','Fases nacionales NO incluidas','Interpretaciones nacionales varían'],
  array['National phase procedures','Country-specific interpretations'],
  'professional', true
) on conflict (code) do update set
  name = excluded.name,
  confidence_tier = excluded.confidence_tier,
  score_overall = excluded.score_overall,
  updated_at = now();

insert into public.ai_kb_jurisdictions (
  code, name, name_local, language_code, flag_emoji,
  confidence_tier,
  score_overall, score_knowledge_depth, score_data_availability, score_update_recency, score_source_quality,
  data_sources, official_registry_url,
  known_limitations, coverage_gaps,
  requires_plan, is_active, is_beta
) values (
  'DE', 'Alemania', 'Deutschland', 'de', '🇩🇪',
  'tier_3',
  45, 50, 40, 42, 55,
  array['DPMA','Markengesetz'],
  'https://www.dpma.de',
  array['Conocimiento muy básico','Sin jurisprudencia','Solo leyes principales','Traducciones parciales'],
  array['Court decisions','Opposition procedures details','Regional regulations'],
  'enterprise', true, true
) on conflict (code) do update set
  name = excluded.name,
  confidence_tier = excluded.confidence_tier,
  score_overall = excluded.score_overall,
  is_beta = true,
  updated_at = now();

insert into public.ai_kb_jurisdictions (
  code, name, name_local, language_code, flag_emoji,
  confidence_tier,
  score_overall, score_knowledge_depth, score_data_availability, score_update_recency, score_source_quality,
  data_sources, official_registry_url,
  known_limitations, coverage_gaps,
  legal_disclaimer,
  requires_plan, is_active
) values (
  'GLOBAL', 'Principios Globales', 'Global Principles', 'en', '🌍',
  'tier_3',
  35, 40, 30, 35, 40,
  array['Tratados Internacionales OMPI','Convenio de París','Acuerdo ADPIC/TRIPS'],
  'https://www.wipo.int',
  array['SOLO principios generales de PI','Sin legislación específica de ningún país','Sin jurisprudencia','Sin procedimientos detallados'],
  array['All country-specific procedures','Local deadlines','National fees'],
  'ADVERTENCIA: Esta información se basa ÚNICAMENTE en principios generales de propiedad intelectual internacional. NO constituye asesoramiento legal y NO reemplaza la consulta con un abogado especializado en la jurisdicción específica de su interés.',
  'basic', true
) on conflict (code) do update set
  name = excluded.name,
  confidence_tier = excluded.confidence_tier,
  score_overall = excluded.score_overall,
  legal_disclaimer = excluded.legal_disclaimer,
  updated_at = now();

-- Áreas legales (ES)
insert into public.ai_kb_legal_areas (jurisdiction_id, area_code, area_name, area_icon, area_score, documents_indexed, requires_plan)
select
  j.id,
  area.code,
  area.name,
  area.icon,
  area.score,
  area.docs,
  area.plan
from public.ai_kb_jurisdictions j
cross join (values
  ('trademarks', 'Marcas', '®️', 98, 1200, 'basic'),
  ('patents', 'Patentes', '📜', 92, 800, 'basic'),
  ('designs', 'Diseños Industriales', '🎨', 85, 300, 'professional'),
  ('copyright', 'Derechos de Autor', '©️', 78, 200, 'professional'),
  ('trade_secrets', 'Secretos Empresariales', '🔐', 70, 100, 'enterprise')
) as area(code, name, icon, score, docs, plan)
where j.code = 'ES'
on conflict (jurisdiction_id, area_code) do update set
  area_name = excluded.area_name,
  area_score = excluded.area_score,
  documents_indexed = excluded.documents_indexed;

-- Áreas legales (EU)
insert into public.ai_kb_legal_areas (jurisdiction_id, area_code, area_name, area_icon, area_score, documents_indexed, requires_plan)
select
  j.id,
  area.code,
  area.name,
  area.icon,
  area.score,
  area.docs,
  area.plan
from public.ai_kb_jurisdictions j
cross join (values
  ('trademarks', 'Marcas UE', '®️', 94, 1500, 'basic'),
  ('patents', 'Patentes Europeas', '📜', 88, 600, 'professional'),
  ('designs', 'Diseños Comunitarios', '🎨', 90, 400, 'basic')
) as area(code, name, icon, score, docs, plan)
where j.code = 'EU'
on conflict (jurisdiction_id, area_code) do update set
  area_name = excluded.area_name,
  area_score = excluded.area_score;

-- Áreas legales (US)
insert into public.ai_kb_legal_areas (jurisdiction_id, area_code, area_name, area_icon, area_score, documents_indexed, requires_plan)
select
  j.id,
  area.code,
  area.name,
  area.icon,
  area.score,
  area.docs,
  area.plan
from public.ai_kb_jurisdictions j
cross join (values
  ('trademarks', 'Trademarks', '®️', 75, 600, 'professional'),
  ('patents', 'Patents', '📜', 70, 400, 'professional')
) as area(code, name, icon, score, docs, plan)
where j.code = 'US'
on conflict (jurisdiction_id, area_code) do update set
  area_name = excluded.area_name,
  area_score = excluded.area_score;

-- 5) Row Level Security
alter table public.ai_kb_jurisdictions enable row level security;
alter table public.ai_kb_legal_areas enable row level security;
alter table public.ai_kb_disclaimers enable row level security;

-- Read policies
drop policy if exists kb_jurisdictions_read on public.ai_kb_jurisdictions;
create policy kb_jurisdictions_read
on public.ai_kb_jurisdictions
for select
to authenticated
using (is_active = true);

drop policy if exists kb_legal_areas_read on public.ai_kb_legal_areas;
create policy kb_legal_areas_read
on public.ai_kb_legal_areas
for select
to authenticated
using (is_active = true);

drop policy if exists kb_disclaimers_read on public.ai_kb_disclaimers;
create policy kb_disclaimers_read
on public.ai_kb_disclaimers
for select
to authenticated
using (true);

-- Admin policies (superadmins)
drop policy if exists kb_jurisdictions_admin on public.ai_kb_jurisdictions;
create policy kb_jurisdictions_admin
on public.ai_kb_jurisdictions
for all
to authenticated
using (public.is_superadmin())
with check (public.is_superadmin());

drop policy if exists kb_legal_areas_admin on public.ai_kb_legal_areas;
create policy kb_legal_areas_admin
on public.ai_kb_legal_areas
for all
to authenticated
using (public.is_superadmin())
with check (public.is_superadmin());

drop policy if exists kb_disclaimers_admin on public.ai_kb_disclaimers;
create policy kb_disclaimers_admin
on public.ai_kb_disclaimers
for all
to authenticated
using (public.is_superadmin())
with check (public.is_superadmin());
