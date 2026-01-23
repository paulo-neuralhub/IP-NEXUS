-- P-SYSTEM-03 (DB) final: create alert tables + policies using is_org_admin(uuid)

create table if not exists public.alert_types (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  default_priority text default 'medium',
  auto_email boolean default false,
  email_template text,
  suggested_action text,
  is_active boolean default true,
  created_at timestamptz default now()
);

insert into public.alert_types (code, name, description, default_priority, auto_email, suggested_action)
values
  ('payment_failed', 'Pago fallido', 'Un cobro ha fallado', 'high', true, 'Contactar al cliente para actualizar método de pago'),
  ('payment_dispute', 'Disputa de pago', 'Cliente ha disputado un cargo', 'critical', true, 'Responder a la disputa en Stripe Dashboard inmediatamente'),
  ('subscription_expiring', 'Suscripción por vencer', 'Suscripción vence pronto', 'medium', false, 'Verificar que el cliente renueve'),
  ('minutes_low', 'Minutos bajos', 'Cliente con menos del 20% de minutos', 'low', false, 'Informar al cliente de opciones de upgrade'),
  ('minutes_exhausted', 'Minutos agotados', 'Cliente sin minutos disponibles', 'medium', true, 'Ofrecer upgrade de plan'),
  ('call_quality_issue', 'Problema de calidad', 'Múltiples llamadas fallidas', 'high', false, 'Revisar logs de Twilio'),
  ('new_signup', 'Nuevo cliente', 'Nueva organización registrada', 'low', false, 'Enviar email de bienvenida y programar onboarding'),
  ('churn_risk', 'Riesgo de baja', 'Cliente sin actividad prolongada', 'medium', false, 'Contactar para engagement'),
  ('subscription_cancelled', 'Baja de cliente', 'Cliente ha cancelado', 'high', false, 'Intentar retención o encuesta de salida'),
  ('system_error', 'Error del sistema', 'Error crítico detectado', 'critical', true, 'Investigar logs y resolver'),
  ('security_alert', 'Alerta de seguridad', 'Actividad sospechosa detectada', 'critical', true, 'Revisar inmediatamente'),
  ('ticket_urgent', 'Ticket urgente', 'Ticket de soporte prioritario', 'high', false, 'Responder en menos de 2 horas'),
  ('ticket_overdue', 'Ticket vencido', 'SLA excedido', 'high', true, 'Escalar y resolver inmediatamente')
on conflict (code) do nothing;

create table if not exists public.system_alerts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.system_events(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,

  alert_type text not null,
  priority text default 'medium',

  title text not null,
  message text,
  suggested_action text,

  alert_data jsonb default '{}'::jsonb,

  status text default 'active',

  assigned_to uuid references public.users(id) on delete set null,
  assigned_at timestamptz,

  acknowledged_by uuid references public.users(id) on delete set null,
  acknowledged_at timestamptz,
  resolved_by uuid references public.users(id) on delete set null,
  resolved_at timestamptz,
  resolution_notes text,

  email_sent boolean default false,
  email_sent_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  expires_at timestamptz
);

create index if not exists system_alerts_status_idx on public.system_alerts(status);
create index if not exists system_alerts_priority_idx on public.system_alerts(priority);
create index if not exists system_alerts_type_idx on public.system_alerts(alert_type);
create index if not exists system_alerts_org_idx on public.system_alerts(organization_id);
create index if not exists system_alerts_assigned_idx on public.system_alerts(assigned_to);
create index if not exists system_alerts_created_idx on public.system_alerts(created_at desc);
create index if not exists system_alerts_active_idx on public.system_alerts(status, priority)
  where status in ('active','acknowledged','in_progress');

drop trigger if exists set_system_alerts_updated_at on public.system_alerts;
create trigger set_system_alerts_updated_at
before update on public.system_alerts
for each row execute function public.set_updated_at();

create or replace function public.validate_alert_expires_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.expires_at is not null and new.expires_at <= now() then
    raise exception 'expires_at must be in the future';
  end if;
  return new;
end;
$$;

drop trigger if exists validate_alert_expires_at on public.system_alerts;
create trigger validate_alert_expires_at
before insert or update on public.system_alerts
for each row execute function public.validate_alert_expires_at();

create or replace function public.create_alert(
  p_alert_type text,
  p_title text,
  p_message text default null,
  p_organization_id uuid default null,
  p_event_id uuid default null,
  p_alert_data jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_alert_id uuid;
  v_type_info record;
  v_priority text;
  v_suggested_action text;
begin
  select * into v_type_info
  from public.alert_types
  where code = p_alert_type and is_active = true;

  v_priority := coalesce(v_type_info.default_priority, 'medium');
  v_suggested_action := v_type_info.suggested_action;

  insert into public.system_alerts (
    event_id, organization_id, alert_type, priority,
    title, message, suggested_action, alert_data
  ) values (
    p_event_id, p_organization_id, p_alert_type, v_priority,
    p_title, p_message, v_suggested_action, p_alert_data
  ) returning id into v_alert_id;

  return v_alert_id;
end;
$$;

create or replace view public.v_active_alerts as
select
  a.*, 
  o.name as organization_name,
  at.name as alert_type_name,
  at.suggested_action as alert_type_suggested_action,
  u.email as assigned_to_email
from public.system_alerts a
left join public.organizations o on a.organization_id = o.id
left join public.alert_types at on a.alert_type = at.code
left join public.users u on a.assigned_to = u.id
where a.status in ('active','acknowledged','in_progress')
order by
  case a.priority
    when 'critical' then 1
    when 'high' then 2
    when 'medium' then 3
    else 4
  end,
  a.created_at desc;

create or replace function public.auto_create_alert_from_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type record;
  v_alert_code text;
begin
  select * into v_type
  from public.event_type_catalog
  where code = new.event_type and is_active = true;

  if v_type.auto_alert is distinct from true then
    return new;
  end if;

  v_alert_code := case
    when new.event_type like 'payment.%failed%' then 'payment_failed'
    when new.event_type like 'subscription.suspended%' then 'payment_failed'
    when new.event_type like 'subscription.cancelled%' then 'subscription_cancelled'
    when new.event_type like 'voip.minutes.warning%' then 'minutes_low'
    when new.event_type like 'voip.minutes.exhausted%' then 'minutes_exhausted'
    when new.event_type like 'system.%' then 'system_error'
    else 'system_error'
  end;

  perform public.create_alert(
    v_alert_code,
    new.title,
    new.description,
    new.organization_id,
    new.id,
    new.event_data
  );

  return new;
end;
$$;

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name='system_events'
  ) then
    execute 'drop trigger if exists trigger_auto_alert on public.system_events';
    execute '
      create trigger trigger_auto_alert
      after insert on public.system_events
      for each row
      when (new.requires_action = true)
      execute function public.auto_create_alert_from_event();
    ';
  end if;
end $$;

alter table public.system_alerts enable row level security;
alter table public.alert_types enable row level security;

-- alert_types

drop policy if exists alert_types_select_all on public.alert_types;
create policy alert_types_select_all
  on public.alert_types
  for select
  to authenticated
  using (true);

drop policy if exists alert_types_manage_superadmin on public.alert_types;
create policy alert_types_manage_superadmin
  on public.alert_types
  for all
  to authenticated
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- system_alerts

drop policy if exists alerts_select_own_org on public.system_alerts;
create policy alerts_select_own_org
  on public.system_alerts
  for select
  to authenticated
  using (
    organization_id in (select m.organization_id from public.memberships m where m.user_id = auth.uid())
    or (organization_id is null and public.is_superadmin())
  );

drop policy if exists alerts_manage_admins on public.system_alerts;
create policy alerts_manage_admins
  on public.system_alerts
  for all
  to authenticated
  using (
    public.is_superadmin()
    or (organization_id is not null and public.is_org_admin(organization_id))
  )
  with check (
    public.is_superadmin()
    or (organization_id is not null and public.is_org_admin(organization_id))
  );
