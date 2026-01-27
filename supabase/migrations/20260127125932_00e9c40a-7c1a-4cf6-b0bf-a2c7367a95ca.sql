-- ============================================================
-- L63-H: Sistema de Limpieza Total de Datos DEMO
-- ============================================================

-- 1. Añadir columna is_demo a organizations si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'organizations' 
    AND column_name = 'is_demo'
  ) THEN
    ALTER TABLE public.organizations ADD COLUMN is_demo BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 2. Crear índice para búsquedas rápidas de orgs demo
CREATE INDEX IF NOT EXISTS idx_organizations_is_demo ON public.organizations(is_demo) WHERE is_demo = TRUE;

-- 3. Crear o actualizar organización DEMO dedicada
INSERT INTO public.organizations (
  id, 
  name, 
  slug, 
  is_demo,
  plan,
  status,
  settings
) VALUES (
  '00000000-0000-0000-0000-00000000de00',
  'DEMO - IP-NEXUS Demostración',
  'demo-master',
  TRUE,
  'enterprise',
  'active',
  '{
    "demo_mode": true,
    "created_for": "demonstrations",
    "can_reset": true,
    "locale": "es",
    "timezone": "Europe/Madrid"
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  is_demo = TRUE,
  name = EXCLUDED.name,
  settings = EXCLUDED.settings,
  updated_at = NOW();

-- ============================================================
-- 4. FUNCIÓN: Limpiar TODOS los datos de un tenant DEMO
-- ============================================================
CREATE OR REPLACE FUNCTION public.clean_demo_tenant_data(p_tenant_id UUID DEFAULT '00000000-0000-0000-0000-00000000de00')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  counts jsonb := '{}'::jsonb;
  deleted_count INTEGER;
  is_demo_tenant BOOLEAN;
BEGIN
  -- Verificar que es un tenant demo
  SELECT is_demo INTO is_demo_tenant 
  FROM organizations 
  WHERE id = p_tenant_id;
  
  IF NOT FOUND OR NOT COALESCE(is_demo_tenant, FALSE) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Tenant no es DEMO o no existe',
      'tenant_id', p_tenant_id
    );
  END IF;

  RAISE NOTICE 'Starting demo data cleanup for tenant: %', p_tenant_id;

  -- ============================================================
  -- NIVEL 1: Demo seed tracking
  -- ============================================================
  DELETE FROM demo_seed_entities WHERE run_id IN (
    SELECT id FROM demo_seed_runs WHERE organization_id = p_tenant_id
  );
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('demo_seed_entities', deleted_count);

  DELETE FROM demo_seed_runs WHERE organization_id = p_tenant_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('demo_seed_runs', deleted_count);

  -- ============================================================
  -- NIVEL 2: Workflows
  -- ============================================================
  DELETE FROM workflow_step_logs 
  WHERE execution_id IN (
    SELECT id FROM workflow_executions WHERE organization_id = p_tenant_id
  );
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('workflow_step_logs', deleted_count);

  DELETE FROM workflow_executions WHERE organization_id = p_tenant_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('workflow_executions', deleted_count);

  DELETE FROM workflow_steps 
  WHERE workflow_id IN (
    SELECT id FROM workflows WHERE organization_id = p_tenant_id
  );
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('workflow_steps', deleted_count);

  DELETE FROM workflows WHERE organization_id = p_tenant_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('workflows', deleted_count);

  -- ============================================================
  -- NIVEL 3: Market
  -- ============================================================
  DELETE FROM market_offers WHERE listing_id IN (
    SELECT id FROM market_listings WHERE organization_id = p_tenant_id
  );
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('market_offers', deleted_count);

  DELETE FROM market_listings WHERE organization_id = p_tenant_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('market_listings', deleted_count);

  DELETE FROM market_assets WHERE organization_id = p_tenant_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('market_assets', deleted_count);

  DELETE FROM market_users WHERE organization_id = p_tenant_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('market_users', deleted_count);

  -- ============================================================
  -- NIVEL 4: RFQ
  -- ============================================================
  DELETE FROM rfq_invitations WHERE request_id IN (
    SELECT id FROM rfq_requests WHERE organization_id = p_tenant_id
  );
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('rfq_invitations', deleted_count);

  DELETE FROM rfq_quotes WHERE request_id IN (
    SELECT id FROM rfq_requests WHERE organization_id = p_tenant_id
  );
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('rfq_quotes', deleted_count);

  DELETE FROM rfq_requests WHERE organization_id = p_tenant_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('rfq_requests', deleted_count);

  -- ============================================================
  -- NIVEL 5: Marketing
  -- ============================================================
  DELETE FROM email_sends WHERE campaign_id IN (
    SELECT id FROM email_campaigns WHERE organization_id = p_tenant_id
  );
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('email_sends', deleted_count);

  DELETE FROM email_campaigns WHERE organization_id = p_tenant_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('email_campaigns', deleted_count);

  DELETE FROM contact_list_members WHERE list_id IN (
    SELECT id FROM contact_lists WHERE organization_id = p_tenant_id
  );
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('contact_list_members', deleted_count);

  DELETE FROM contact_lists WHERE organization_id = p_tenant_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('contact_lists', deleted_count);

  DELETE FROM email_templates WHERE organization_id = p_tenant_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('email_templates', deleted_count);

  -- ============================================================
  -- NIVEL 6: Spider / Vigilancia
  -- ============================================================
  DELETE FROM watchlists WHERE organization_id = p_tenant_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('watchlists', deleted_count);

  -- ============================================================
  -- NIVEL 7: Finanzas
  -- ============================================================
  DELETE FROM invoice_items WHERE invoice_id IN (
    SELECT id FROM invoices WHERE organization_id = p_tenant_id
  );
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('invoice_items', deleted_count);

  DELETE FROM invoices WHERE organization_id = p_tenant_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('invoices', deleted_count);

  -- ============================================================
  -- NIVEL 8: Plazos y alertas
  -- ============================================================
  DELETE FROM deadline_alerts WHERE deadline_id IN (
    SELECT id FROM matter_deadlines WHERE organization_id = p_tenant_id
  );
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('deadline_alerts', deleted_count);

  DELETE FROM matter_deadlines WHERE organization_id = p_tenant_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('matter_deadlines', deleted_count);

  -- ============================================================
  -- NIVEL 9: Actividades y comunicaciones
  -- ============================================================
  DELETE FROM activities WHERE organization_id = p_tenant_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('activities', deleted_count);

  DELETE FROM communications WHERE organization_id = p_tenant_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('communications', deleted_count);

  -- ============================================================
  -- NIVEL 10: CRM
  -- ============================================================
  DELETE FROM deals WHERE organization_id = p_tenant_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('deals', deleted_count);

  DELETE FROM billing_clients WHERE organization_id = p_tenant_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('billing_clients', deleted_count);

  -- ============================================================
  -- NIVEL 11: Filing applications
  -- ============================================================
  DELETE FROM filing_applications WHERE organization_id = p_tenant_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('filing_applications', deleted_count);

  -- ============================================================
  -- NIVEL 12: Expedientes (matters)
  -- ============================================================
  DELETE FROM matters WHERE organization_id = p_tenant_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('matters', deleted_count);

  -- ============================================================
  -- NIVEL 13: Contactos
  -- ============================================================
  DELETE FROM contacts WHERE organization_id = p_tenant_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  counts := counts || jsonb_build_object('contacts', deleted_count);

  -- ============================================================
  -- RESULTADO
  -- ============================================================
  RAISE NOTICE 'Demo data cleanup completed: %', counts;
  
  RETURN jsonb_build_object(
    'success', true,
    'tenant_id', p_tenant_id,
    'deleted', counts,
    'timestamp', NOW()
  );
END;
$$;

-- ============================================================
-- 5. FUNCIÓN: Limpiar TODOS los tenants DEMO
-- ============================================================
CREATE OR REPLACE FUNCTION public.clean_all_demo_tenants()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  demo_org RECORD;
  result jsonb;
  all_results jsonb := '[]'::jsonb;
BEGIN
  FOR demo_org IN 
    SELECT id, name, slug FROM organizations WHERE is_demo = TRUE
  LOOP
    result := clean_demo_tenant_data(demo_org.id);
    all_results := all_results || jsonb_build_array(
      jsonb_build_object(
        'org_id', demo_org.id,
        'org_name', demo_org.name,
        'org_slug', demo_org.slug,
        'result', result
      )
    );
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'cleaned_tenants', jsonb_array_length(all_results),
    'results', all_results,
    'timestamp', NOW()
  );
END;
$$;

-- ============================================================
-- 6. Marcar organizaciones demo existentes
-- ============================================================
UPDATE public.organizations 
SET is_demo = TRUE 
WHERE slug LIKE 'demo-%' 
  AND is_demo IS NOT TRUE;

-- ============================================================
-- 7. Comentarios
-- ============================================================
COMMENT ON FUNCTION public.clean_demo_tenant_data IS 'Limpia todos los datos de un tenant DEMO específico';
COMMENT ON FUNCTION public.clean_all_demo_tenants IS 'Limpia todos los datos de TODOS los tenants marcados como demo';