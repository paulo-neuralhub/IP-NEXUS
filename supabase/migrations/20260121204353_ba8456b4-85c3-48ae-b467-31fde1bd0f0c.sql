-- Security hardening: set immutable search_path for helper function
create or replace function public.is_superadmin()
returns boolean
language sql
stable
set search_path = public
as $$
  select exists(
    select 1
    from public.superadmins s
    where s.user_id = auth.uid()
      and coalesce(s.is_active, false) = true
  );
$$;
