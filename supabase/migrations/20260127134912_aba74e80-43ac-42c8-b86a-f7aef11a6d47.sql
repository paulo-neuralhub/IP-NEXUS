-- Limpieza completa del tenant empresaIP (c8a6c1e7-ffba-48f3-9b09-ea8cc122c683)
DO $$
DECLARE
  my_tenant UUID := 'c8a6c1e7-ffba-48f3-9b09-ea8cc122c683';
BEGIN
  RAISE NOTICE 'Limpiando CRM V2 para tenant: %', my_tenant;
  
  -- CRM V2 Tables (orden correcto por dependencias)
  DELETE FROM crm_interactions WHERE organization_id = my_tenant;
  DELETE FROM crm_tasks WHERE organization_id = my_tenant;
  DELETE FROM crm_ai_learning_logs WHERE organization_id = my_tenant;
  DELETE FROM crm_deals WHERE organization_id = my_tenant;
  DELETE FROM crm_contacts WHERE organization_id = my_tenant;
  DELETE FROM crm_accounts WHERE organization_id = my_tenant;
  
  -- Watchlists
  DELETE FROM watch_results WHERE watchlist_id IN (SELECT id FROM watchlists WHERE organization_id = my_tenant);
  DELETE FROM watchlists WHERE organization_id = my_tenant;
  
  RAISE NOTICE 'Limpieza completada para tenant empresaIP';
END $$;