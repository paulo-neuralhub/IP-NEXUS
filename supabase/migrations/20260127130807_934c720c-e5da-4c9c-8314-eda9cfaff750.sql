
-- ============================================================
-- FIX: Función de limpieza con verificaciones condicionales
-- Evita errores cuando las tablas no existen
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
  table_exists BOOLEAN;
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
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='demo_seed_entities') INTO table_exists;
  IF table_exists THEN
    DELETE FROM demo_seed_entities WHERE run_id IN (
      SELECT id FROM demo_seed_runs WHERE organization_id = p_tenant_id
    );
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('demo_seed_entities', deleted_count);
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='demo_seed_runs') INTO table_exists;
  IF table_exists THEN
    DELETE FROM demo_seed_runs WHERE organization_id = p_tenant_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('demo_seed_runs', deleted_count);
  END IF;

  -- ============================================================
  -- NIVEL 2: Workflows (verificar existencia)
  -- ============================================================
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='workflow_step_logs') INTO table_exists;
  IF table_exists THEN
    DELETE FROM workflow_step_logs 
    WHERE execution_id IN (
      SELECT id FROM workflow_executions WHERE organization_id = p_tenant_id
    );
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('workflow_step_logs', deleted_count);
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='workflow_executions') INTO table_exists;
  IF table_exists THEN
    DELETE FROM workflow_executions WHERE organization_id = p_tenant_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('workflow_executions', deleted_count);
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='workflow_steps') INTO table_exists;
  IF table_exists THEN
    DELETE FROM workflow_steps 
    WHERE workflow_id IN (
      SELECT id FROM workflows WHERE organization_id = p_tenant_id
    );
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('workflow_steps', deleted_count);
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='workflows') INTO table_exists;
  IF table_exists THEN
    DELETE FROM workflows WHERE organization_id = p_tenant_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('workflows', deleted_count);
  END IF;

  -- ============================================================
  -- NIVEL 3: Market
  -- ============================================================
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='market_offers') INTO table_exists;
  IF table_exists THEN
    DELETE FROM market_offers WHERE listing_id IN (
      SELECT id FROM market_listings WHERE organization_id = p_tenant_id
    );
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('market_offers', deleted_count);
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='market_listings') INTO table_exists;
  IF table_exists THEN
    DELETE FROM market_listings WHERE organization_id = p_tenant_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('market_listings', deleted_count);
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='market_assets') INTO table_exists;
  IF table_exists THEN
    DELETE FROM market_assets WHERE organization_id = p_tenant_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('market_assets', deleted_count);
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='market_users') INTO table_exists;
  IF table_exists THEN
    DELETE FROM market_users WHERE organization_id = p_tenant_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('market_users', deleted_count);
  END IF;

  -- ============================================================
  -- NIVEL 4: RFQ
  -- ============================================================
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='rfq_invitations') INTO table_exists;
  IF table_exists THEN
    DELETE FROM rfq_invitations WHERE request_id IN (
      SELECT id FROM rfq_requests WHERE organization_id = p_tenant_id
    );
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('rfq_invitations', deleted_count);
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='rfq_quotes') INTO table_exists;
  IF table_exists THEN
    DELETE FROM rfq_quotes WHERE request_id IN (
      SELECT id FROM rfq_requests WHERE organization_id = p_tenant_id
    );
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('rfq_quotes', deleted_count);
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='rfq_requests') INTO table_exists;
  IF table_exists THEN
    DELETE FROM rfq_requests WHERE organization_id = p_tenant_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('rfq_requests', deleted_count);
  END IF;

  -- ============================================================
  -- NIVEL 5: Marketing
  -- ============================================================
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='email_sends') INTO table_exists;
  IF table_exists THEN
    DELETE FROM email_sends WHERE campaign_id IN (
      SELECT id FROM email_campaigns WHERE organization_id = p_tenant_id
    );
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('email_sends', deleted_count);
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='email_campaigns') INTO table_exists;
  IF table_exists THEN
    DELETE FROM email_campaigns WHERE organization_id = p_tenant_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('email_campaigns', deleted_count);
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='contact_list_members') INTO table_exists;
  IF table_exists THEN
    DELETE FROM contact_list_members WHERE list_id IN (
      SELECT id FROM contact_lists WHERE organization_id = p_tenant_id
    );
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('contact_list_members', deleted_count);
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='contact_lists') INTO table_exists;
  IF table_exists THEN
    DELETE FROM contact_lists WHERE organization_id = p_tenant_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('contact_lists', deleted_count);
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='email_templates') INTO table_exists;
  IF table_exists THEN
    DELETE FROM email_templates WHERE organization_id = p_tenant_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('email_templates', deleted_count);
  END IF;

  -- ============================================================
  -- NIVEL 6: Spider / Vigilancia
  -- ============================================================
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='watchlists') INTO table_exists;
  IF table_exists THEN
    DELETE FROM watchlists WHERE organization_id = p_tenant_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('watchlists', deleted_count);
  END IF;

  -- ============================================================
  -- NIVEL 7: Finanzas
  -- ============================================================
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='invoice_items') INTO table_exists;
  IF table_exists THEN
    DELETE FROM invoice_items WHERE invoice_id IN (
      SELECT id FROM invoices WHERE organization_id = p_tenant_id
    );
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('invoice_items', deleted_count);
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='invoices') INTO table_exists;
  IF table_exists THEN
    DELETE FROM invoices WHERE organization_id = p_tenant_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('invoices', deleted_count);
  END IF;

  -- ============================================================
  -- NIVEL 8: Plazos y alertas
  -- ============================================================
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='deadline_alerts') INTO table_exists;
  IF table_exists THEN
    DELETE FROM deadline_alerts WHERE deadline_id IN (
      SELECT id FROM matter_deadlines WHERE organization_id = p_tenant_id
    );
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('deadline_alerts', deleted_count);
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='matter_deadlines') INTO table_exists;
  IF table_exists THEN
    DELETE FROM matter_deadlines WHERE organization_id = p_tenant_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('matter_deadlines', deleted_count);
  END IF;

  -- ============================================================
  -- NIVEL 9: Actividades y comunicaciones
  -- ============================================================
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='activities') INTO table_exists;
  IF table_exists THEN
    DELETE FROM activities WHERE organization_id = p_tenant_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('activities', deleted_count);
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='communications') INTO table_exists;
  IF table_exists THEN
    DELETE FROM communications WHERE organization_id = p_tenant_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('communications', deleted_count);
  END IF;

  -- ============================================================
  -- NIVEL 10: CRM
  -- ============================================================
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='deals') INTO table_exists;
  IF table_exists THEN
    DELETE FROM deals WHERE organization_id = p_tenant_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('deals', deleted_count);
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='billing_clients') INTO table_exists;
  IF table_exists THEN
    DELETE FROM billing_clients WHERE organization_id = p_tenant_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('billing_clients', deleted_count);
  END IF;

  -- ============================================================
  -- NIVEL 11: Filing applications
  -- ============================================================
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='filing_applications') INTO table_exists;
  IF table_exists THEN
    DELETE FROM filing_applications WHERE organization_id = p_tenant_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('filing_applications', deleted_count);
  END IF;

  -- ============================================================
  -- NIVEL 12: Matter documents (antes de matters)
  -- ============================================================
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='matter_documents') INTO table_exists;
  IF table_exists THEN
    DELETE FROM matter_documents WHERE matter_id IN (
      SELECT id FROM matters WHERE organization_id = p_tenant_id
    );
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('matter_documents', deleted_count);
  END IF;

  -- ============================================================
  -- NIVEL 13: Expedientes (matters)
  -- ============================================================
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='matters') INTO table_exists;
  IF table_exists THEN
    DELETE FROM matters WHERE organization_id = p_tenant_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('matters', deleted_count);
  END IF;

  -- ============================================================
  -- NIVEL 14: Contactos
  -- ============================================================
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='contacts') INTO table_exists;
  IF table_exists THEN
    DELETE FROM contacts WHERE organization_id = p_tenant_id;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    counts := counts || jsonb_build_object('contacts', deleted_count);
  END IF;

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
-- FUNCIÓN: Limpiar TODOS los tenants DEMO (sin cambios)
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

-- Comentarios actualizados
COMMENT ON FUNCTION public.clean_demo_tenant_data IS 'Limpia todos los datos de un tenant DEMO con verificación de tablas existentes';
COMMENT ON FUNCTION public.clean_all_demo_tenants IS 'Limpia todos los datos de TODOS los tenants marcados como demo';
