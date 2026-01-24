-- Demo tenants seed (v6b): fix nice_classes/watch_classes as integer[]

DO $$
DECLARE
  v_owner uuid;

  org_starter uuid := gen_random_uuid();
  org_pro uuid := gen_random_uuid();
  org_business uuid := gen_random_uuid();
  org_enterprise uuid := gen_random_uuid();
  org_standalone uuid := gen_random_uuid();

  bc_biz uuid := gen_random_uuid();
  inv_biz_1 uuid := gen_random_uuid();
  inv_biz_2 uuid := gen_random_uuid();

  portal_client uuid := gen_random_uuid();

  plan_free uuid;
  plan_professional uuid;
  plan_business uuid;
  plan_enterprise uuid;
BEGIN
  SELECT id INTO v_owner FROM public.users ORDER BY created_at ASC LIMIT 1;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'No existing public.users found. Create one real user first, then re-run demo seed.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.organizations WHERE slug IN ('demo-starter','demo-professional','demo-business','demo-enterprise','demo-standalone')) THEN
    RAISE EXCEPTION 'Demo organizations already exist (one of the demo-* slugs is present).';
  END IF;

  SELECT id INTO plan_free FROM public.subscription_plans WHERE code = 'free' LIMIT 1;
  SELECT id INTO plan_professional FROM public.subscription_plans WHERE code = 'professional' LIMIT 1;
  SELECT id INTO plan_business FROM public.subscription_plans WHERE code = 'business' LIMIT 1;
  SELECT id INTO plan_enterprise FROM public.subscription_plans WHERE code = 'enterprise' LIMIT 1;

  IF plan_free IS NULL OR plan_professional IS NULL OR plan_business IS NULL OR plan_enterprise IS NULL THEN
    RAISE EXCEPTION 'Missing subscription_plans codes. Ensure free/professional/business/enterprise exist.';
  END IF;

  INSERT INTO public.organizations (id, name, slug, plan, addons, status, settings, default_language, crm_owner_id, created_at, updated_at)
  VALUES
    (
      org_starter,
      'García IP Autónomo',
      'demo-starter',
      'starter',
      ARRAY['core','docket'],
      'active',
      jsonb_build_object(
        'branding', jsonb_build_object(
          'logo_url', 'https://dummyimage.com/256x256/0ea5e9/ffffff.png&text=G',
          'primary_hsl', '200 95% 45%',
          'accent_hsl', '220 90% 56%'
        ),
        'timezone', 'Europe/Madrid',
        'currency', 'EUR'
      ),
      'es',
      v_owner,
      now(),
      now()
    ),
    (
      org_pro,
      'Martínez & Asociados',
      'demo-professional',
      'professional',
      ARRAY['core','docket','renewals','crm','comms','portal'],
      'active',
      jsonb_build_object(
        'branding', jsonb_build_object(
          'logo_url', 'https://dummyimage.com/256x256/334155/ffffff.png&text=M',
          'primary_hsl', '222 47% 11%',
          'accent_hsl', '199 89% 48%'
        ),
        'timezone', 'Europe/Madrid',
        'currency', 'EUR'
      ),
      'es',
      v_owner,
      now(),
      now()
    ),
    (
      org_business,
      'Innovamark Legal',
      'demo-business',
      'business',
      ARRAY['core','docket','spider','genius','finance'],
      'active',
      jsonb_build_object(
        'branding', jsonb_build_object(
          'logo_url', 'https://dummyimage.com/256x256/f59e0b/111827.png&text=I',
          'primary_hsl', '43 96% 56%',
          'accent_hsl', '168 76% 42%'
        ),
        'timezone', 'Europe/Madrid',
        'currency', 'EUR'
      ),
      'es',
      v_owner,
      now(),
      now()
    ),
    (
      org_enterprise,
      'Global IP Partners',
      'demo-enterprise',
      'enterprise',
      ARRAY['core','docket','spider','genius','finance','crm','marketing','market','datahub','api','analytics','legalops','migrator','portal','comms'],
      'active',
      jsonb_build_object(
        'branding', jsonb_build_object(
          'logo_url', 'https://dummyimage.com/256x256/111827/ffffff.png&text=GIP',
          'primary_hsl', '222 47% 11%',
          'accent_hsl', '262 83% 58%'
        ),
        'timezone', 'America/New_York',
        'currency', 'USD'
      ),
      'en',
      v_owner,
      now(),
      now()
    ),
    (
      org_standalone,
      'IP Watch Services',
      'demo-standalone',
      'starter',
      ARRAY['spider'],
      'active',
      jsonb_build_object(
        'branding', jsonb_build_object(
          'logo_url', 'https://dummyimage.com/256x256/8b5cf6/ffffff.png&text=W',
          'primary_hsl', '262 83% 58%',
          'accent_hsl', '199 89% 48%'
        ),
        'timezone', 'Europe/London',
        'currency', 'GBP'
      ),
      'en',
      v_owner,
      now(),
      now()
    );

  UPDATE public.subscriptions
  SET plan_id = plan_free,
      status = 'active',
      billing_cycle = 'monthly',
      current_period_start = now() - interval '10 days',
      current_period_end = now() + interval '20 days',
      metadata = COALESCE(metadata,'{}'::jsonb) || jsonb_build_object('demo_plan_alias','starter'),
      updated_at = now()
  WHERE organization_id = org_starter;

  UPDATE public.subscriptions
  SET plan_id = plan_professional,
      status = 'active',
      billing_cycle = 'monthly',
      current_period_start = now() - interval '12 days',
      current_period_end = now() + interval '18 days',
      updated_at = now()
  WHERE organization_id = org_pro;

  UPDATE public.subscriptions
  SET plan_id = plan_business,
      status = 'active',
      billing_cycle = 'monthly',
      current_period_start = now() - interval '5 days',
      current_period_end = now() + interval '25 days',
      updated_at = now()
  WHERE organization_id = org_business;

  UPDATE public.subscriptions
  SET plan_id = plan_enterprise,
      status = 'active',
      billing_cycle = 'yearly',
      current_period_start = now() - interval '40 days',
      current_period_end = now() + interval '325 days',
      updated_at = now()
  WHERE organization_id = org_enterprise;

  UPDATE public.subscriptions
  SET plan_id = plan_free,
      status = 'active',
      billing_cycle = 'monthly',
      current_period_start = now() - interval '2 days',
      current_period_end = now() + interval '28 days',
      metadata = COALESCE(metadata,'{}'::jsonb) || jsonb_build_object('demo_plan_alias','starter','standalone','spider'),
      updated_at = now()
  WHERE organization_id = org_standalone;

  INSERT INTO public.memberships (id, user_id, organization_id, role, permissions, created_at)
  VALUES
    (gen_random_uuid(), v_owner, org_starter, 'owner', '{}'::jsonb, now()),
    (gen_random_uuid(), v_owner, org_pro, 'owner', '{}'::jsonb, now()),
    (gen_random_uuid(), v_owner, org_business, 'owner', '{}'::jsonb, now()),
    (gen_random_uuid(), v_owner, org_enterprise, 'owner', '{}'::jsonb, now()),
    (gen_random_uuid(), v_owner, org_standalone, 'owner', '{}'::jsonb, now());

  -- Contacts
  INSERT INTO public.contacts (id, organization_id, owner_type, type, name, email, phone, company_name, lifecycle_stage, timezone, preferred_language, created_at, updated_at, created_by, assigned_to)
  SELECT gen_random_uuid(), org_starter, 'tenant', 'company',
    'Cliente Demo ' || gs::text,
    'cliente' || gs::text || '@demo.local',
    '+34 600 000 ' || lpad(gs::text, 3, '0'),
    'Cliente Demo ' || gs::text,
    'customer', 'Europe/Madrid', 'es', now(), now(), v_owner, v_owner
  FROM generate_series(1, 5) gs;

  INSERT INTO public.contacts (id, organization_id, owner_type, type, name, email, phone, company_name, lifecycle_stage, timezone, preferred_language, portal_access_enabled, created_at, updated_at, created_by, assigned_to)
  VALUES (portal_client, org_pro, 'tenant', 'company',
    'Cliente Portal (Demo)', 'portal@demo.local', '+34 699 111 222',
    'Cliente Portal (Demo)', 'customer', 'Europe/Madrid', 'es', true, now(), now(), v_owner, v_owner);

  INSERT INTO public.contacts (id, organization_id, owner_type, type, name, email, phone, company_name, lifecycle_stage, timezone, preferred_language, created_at, updated_at, created_by, assigned_to)
  SELECT gen_random_uuid(), org_pro, 'tenant', 'company',
    'Cliente Pro ' || gs::text,
    'cliente_pro' || gs::text || '@demo.local',
    '+34 610 100 ' || lpad(gs::text, 3, '0'),
    'Cliente Pro ' || gs::text,
    'customer', 'Europe/Madrid', 'es', now(), now(), v_owner, v_owner
  FROM generate_series(2, 20) gs;

  INSERT INTO public.contacts (id, organization_id, owner_type, type, name, email, phone, company_name, lifecycle_stage, timezone, preferred_language, created_at, updated_at, created_by, assigned_to)
  SELECT gen_random_uuid(), org_business, 'tenant', 'company',
    'Cliente Biz ' || gs::text,
    'cliente_biz' || gs::text || '@demo.local',
    '+34 620 200 ' || lpad(gs::text, 3, '0'),
    'Cliente Biz ' || gs::text,
    'customer', 'Europe/Madrid', 'es', now(), now(), v_owner, v_owner
  FROM generate_series(1, 50) gs;

  INSERT INTO public.contacts (id, organization_id, owner_type, type, name, email, phone, company_name, lifecycle_stage, timezone, preferred_language, created_at, updated_at, created_by, assigned_to)
  SELECT gen_random_uuid(), org_enterprise, 'tenant', 'company',
    'Cliente Ent ' || gs::text,
    'cliente_ent' || gs::text || '@demo.local',
    '+1 212 555 ' || lpad(gs::text, 3, '0'),
    'Cliente Ent ' || gs::text,
    'customer', 'America/New_York', 'en', now(), now(), v_owner, v_owner
  FROM generate_series(1, 100) gs;

  INSERT INTO public.contacts (id, organization_id, owner_type, type, name, email, phone, company_name, lifecycle_stage, timezone, preferred_language, created_at, updated_at, created_by, assigned_to)
  SELECT gen_random_uuid(), org_standalone, 'tenant', 'company',
    'Cliente Watch ' || gs::text,
    'cliente_watch' || gs::text || '@demo.local',
    '+44 7700 900' || lpad(gs::text, 2, '0'),
    'Cliente Watch ' || gs::text,
    'customer', 'Europe/London', 'en', now(), now(), v_owner, v_owner
  FROM generate_series(1, 10) gs;

  -- Matters (nice_classes int[])
  INSERT INTO public.matters (
    id, organization_id, reference, title, type, status, jurisdiction_code,
    mark_name, mark_type, nice_classes, filing_date, next_renewal_date,
    currency, created_at, updated_at, created_by, assigned_to
  )
  SELECT gen_random_uuid(), org_starter,
    'ST-' || lpad(gs::text, 4, '0'),
    'Marca Demo Starter ' || gs::text,
    'trademark', 'active', 'ES',
    'STARTER-' || gs::text, 'word', ARRAY[35,41],
    (current_date - (gs || ' days')::interval)::date,
    (current_date + interval '1 year')::date,
    'EUR', now(), now(), v_owner, v_owner
  FROM generate_series(1, 15) gs;

  INSERT INTO public.matters (
    id, organization_id, reference, title, type, status, jurisdiction_code,
    mark_name, mark_type, nice_classes, filing_date, next_renewal_date,
    currency, created_at, updated_at, created_by, assigned_to
  )
  SELECT gen_random_uuid(), org_pro,
    'PR-' || lpad(gs::text, 4, '0'),
    'Expediente Pro ' || gs::text,
    CASE WHEN gs % 5 = 0 THEN 'patent' ELSE 'trademark' END,
    'active',
    CASE WHEN gs % 2 = 0 THEN 'EUIPO' ELSE 'ES' END,
    'PRO-' || gs::text, 'word', ARRAY[9,35],
    (current_date - (gs || ' days')::interval)::date,
    (current_date + interval '2 years')::date,
    'EUR', now(), now(), v_owner, v_owner
  FROM generate_series(1, 50) gs;

  INSERT INTO public.matters (
    id, organization_id, reference, title, type, status, jurisdiction_code,
    mark_name, mark_type, nice_classes, filing_date, next_renewal_date,
    currency, created_at, updated_at, created_by, assigned_to, risk_score
  )
  SELECT gen_random_uuid(), org_business,
    'BZ-' || lpad(gs::text, 5, '0'),
    'Portfolio Innovamark ' || gs::text,
    CASE WHEN gs % 7 = 0 THEN 'patent' ELSE 'trademark' END,
    'active',
    (ARRAY['ES','EUIPO','EP','US','CN','JP','KR','MX','BR'])[1 + (gs % 9)],
    'INNOV-' || gs::text, 'word', ARRAY[35,42],
    (current_date - (gs || ' days')::interval)::date,
    (current_date + interval '3 years')::date,
    'EUR', now(), now(), v_owner, v_owner,
    (20 + (gs % 80))
  FROM generate_series(1, 200) gs;

  INSERT INTO public.matters (
    id, organization_id, reference, title, type, status, jurisdiction_code,
    mark_name, mark_type, nice_classes, filing_date, next_renewal_date,
    currency, created_at, updated_at, created_by, assigned_to, risk_score
  )
  SELECT gen_random_uuid(), org_enterprise,
    'EN-' || lpad(gs::text, 5, '0'),
    'Global Portfolio ' || gs::text,
    CASE WHEN gs % 6 = 0 THEN 'patent' ELSE 'trademark' END,
    'active',
    (ARRAY['ES','EUIPO','EP','US','CN','JP','KR','MX','BR','IN','AU','CA','GB','FR','DE','WIPO'])[1 + (gs % 16)],
    'GIP-' || gs::text, 'word', ARRAY[9,35,41],
    (current_date - (gs || ' days')::interval)::date,
    (current_date + interval '4 years')::date,
    'USD', now(), now(), v_owner, v_owner,
    (10 + (gs % 90))
  FROM generate_series(1, 520) gs;

  -- Client portal
  INSERT INTO public.client_portals (
    id, organization_id, client_id, portal_name, portal_slug, branding_config, settings,
    is_active, activated_at, total_logins, created_by, created_at, updated_at
  )
  VALUES (
    gen_random_uuid(), org_pro, portal_client,
    'Portal Cliente - Martínez & Asociados',
    'demo-professional-portal',
    jsonb_build_object(
      'logo_url', 'https://dummyimage.com/256x256/334155/ffffff.png&text=M',
      'primary_hsl', '222 47% 11%',
      'accent_hsl', '199 89% 48%'
    ),
    jsonb_build_object('welcome_message','Bienvenido al portal demo','timezone','Europe/Madrid'),
    true,
    now() - interval '30 days',
    42,
    v_owner,
    now(),
    now()
  );

  -- Watchlists (watch_classes int[])
  INSERT INTO public.watchlists (
    id, organization_id, owner_type, name, description, type, watch_terms,
    watch_classes, watch_jurisdictions, similarity_threshold,
    notify_email, notify_in_app, notify_frequency, is_active,
    created_by, created_at, updated_at
  )
  VALUES
    (
      gen_random_uuid(), org_business, 'tenant', 'Vigilancia Innovamark - Wordmarks',
      'Vigilancia de marcas similares para portfolio principal',
      'trademark',
      ARRAY['innovamark','innova','inova'],
      ARRAY[35,42],
      ARRAY['ES','EUIPO','US'],
      78,
      true, true, 'daily', true,
      v_owner, now() - interval '20 days', now()
    ),
    (
      gen_random_uuid(), org_business, 'tenant', 'Vigilancia Innovamark - Patentes',
      'Alertas sobre solicitudes similares por keywords técnicas',
      'patent',
      ARRAY['machine learning','ai','nexus'],
      NULL,
      ARRAY['EP','US','CN','JP'],
      72,
      true, true, 'weekly', true,
      v_owner, now() - interval '10 days', now()
    ),
    (
      gen_random_uuid(), org_standalone, 'tenant', 'IP Watch - Marcas UK/EU',
      'Servicio standalone de vigilancia para clientes',
      'trademark',
      ARRAY['watch services','ip watch','brand monitor'],
      ARRAY[35],
      ARRAY['GB','EUIPO'],
      80,
      true, true, 'daily', true,
      v_owner, now() - interval '15 days', now()
    );

  -- Finance
  INSERT INTO public.billing_clients (
    id, organization_id, contact_id, legal_name, tax_id, billing_address,
    billing_city, billing_country, billing_email, default_currency, payment_terms,
    is_active, created_at, updated_at
  )
  VALUES (
    bc_biz, org_business, NULL,
    'Innovamark Legal S.L.', 'B12345678', 'Calle Demo 123',
    'Madrid', 'ES', 'billing@innovamark.demo',
    'EUR', 30, true, now(), now()
  );

  INSERT INTO public.invoices (
    id, organization_id, invoice_number, invoice_series, billing_client_id,
    client_name, client_tax_id, client_address,
    invoice_date, due_date, subtotal, tax_rate, tax_amount, total, currency, status,
    created_by, created_at, updated_at
  )
  VALUES
    (
      inv_biz_1, org_business, '2026-0001', 'A', bc_biz,
      'Innovamark Legal S.L.', 'B12345678', 'Calle Demo 123, Madrid',
      current_date - 20, current_date - 5,
      1200, 0.21, 252, 1452, 'EUR', 'paid',
      v_owner, now() - interval '20 days', now() - interval '5 days'
    ),
    (
      inv_biz_2, org_business, '2026-0002', 'A', bc_biz,
      'Innovamark Legal S.L.', 'B12345678', 'Calle Demo 123, Madrid',
      current_date - 7, current_date + 23,
      2400, 0.21, 504, 2904, 'EUR', 'sent',
      v_owner, now() - interval '7 days', now()
    );

  INSERT INTO public.invoice_items (
    id, invoice_id, line_number, description, quantity, unit_price, subtotal, tax_rate, tax_amount, created_at
  )
  VALUES
    (gen_random_uuid(), inv_biz_1, 1, 'Búsqueda anterioridades + informe', 1, 600, 600, 0.21, 126, now()),
    (gen_random_uuid(), inv_biz_1, 2, 'Redacción oposición', 1, 600, 600, 0.21, 126, now()),
    (gen_random_uuid(), inv_biz_2, 1, 'Renovaciones (lote)', 4, 300, 1200, 0.21, 252, now()),
    (gen_random_uuid(), inv_biz_2, 2, 'Gestión internacional (EU/US)', 1, 1200, 1200, 0.21, 252, now());

  -- Enterprise: multi-oficina + workflows
  INSERT INTO public.organization_offices (id, organization_id, office_id, is_favorite, credentials_configured, created_at)
  SELECT gen_random_uuid(), org_enterprise, o.id,
    (row_number() OVER () = 1),
    false,
    now()
  FROM public.ipo_offices o
  ORDER BY o.created_at NULLS LAST
  LIMIT 3;

  INSERT INTO public.workflow_templates (
    id, organization_id, code, name, description, category, trigger_type,
    trigger_config, conditions, actions, is_active, is_system, created_by, created_at, updated_at
  )
  VALUES
    (
      gen_random_uuid(), org_enterprise,
      'ent_renewal_nudge',
      'Renovación: aviso + checklist',
      'Genera tarea y notificación cuando se acerque una renovación.',
      'docket',
      'schedule',
      jsonb_build_object('cron','0 9 * * 1'),
      jsonb_build_array(jsonb_build_object('field','next_renewal_date','op','lte','value_days',60)),
      jsonb_build_array(
        jsonb_build_object('type','create_task','payload',jsonb_build_object('title','Revisar renovaciones próximas','priority','high')),
        jsonb_build_object('type','notify','payload',jsonb_build_object('channel','in_app','message','Renovaciones a 60 días: revisar.'))
      ),
      true, false, v_owner, now(), now()
    ),
    (
      gen_random_uuid(), org_enterprise,
      'ent_spider_triage',
      'Spider: triaje automático',
      'Etiqueta resultados y asigna responsable según jurisdicción.',
      'spider',
      'event',
      jsonb_build_object('event','watch_result.created'),
      '[]'::jsonb,
      jsonb_build_array(
        jsonb_build_object('type','tag','payload',jsonb_build_object('tag','spider_new')),
        jsonb_build_object('type','assign','payload',jsonb_build_object('role','manager'))
      ),
      true, false, v_owner, now(), now()
    );

  INSERT INTO public.demo_seed_runs (id, organization_id, created_by, status, seed_version, created_at)
  VALUES (gen_random_uuid(), org_enterprise, v_owner, 'completed', 'v6b', now());

END $$;
