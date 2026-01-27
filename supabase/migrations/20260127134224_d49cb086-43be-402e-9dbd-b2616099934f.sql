DO $$
DECLARE
  my_tenant UUID := 'c8a6c1e7-ffba-48f3-9b09-ea8cc122c683';
BEGIN
  RAISE NOTICE 'Limpiando tenant empresaIP: %', my_tenant;
  
  -- Activity logs and activities
  BEGIN DELETE FROM activity_log WHERE organization_id = my_tenant; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM activities WHERE organization_id = my_tenant; EXCEPTION WHEN undefined_table THEN NULL; END;
  
  -- AI conversations
  BEGIN DELETE FROM ai_messages WHERE conversation_id IN (SELECT id FROM ai_conversations WHERE organization_id = my_tenant); EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM ai_conversations WHERE organization_id = my_tenant; EXCEPTION WHEN undefined_table THEN NULL; END;
  
  -- CRM: Deals, Pipelines
  BEGIN DELETE FROM deals WHERE organization_id = my_tenant; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM pipeline_stages WHERE pipeline_id IN (SELECT id FROM pipelines WHERE organization_id = my_tenant); EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM pipelines WHERE organization_id = my_tenant; EXCEPTION WHEN undefined_table THEN NULL; END;
  
  -- Communications
  BEGIN DELETE FROM communications WHERE organization_id = my_tenant; EXCEPTION WHEN undefined_table THEN NULL; END;
  
  -- Spider/Surveillance
  BEGIN DELETE FROM watch_results WHERE watchlist_id IN (SELECT id FROM watchlists WHERE organization_id = my_tenant); EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM watchlists WHERE organization_id = my_tenant; EXCEPTION WHEN undefined_table THEN NULL; END;
  
  -- Matter related (with exception handling for non-existent tables)
  BEGIN DELETE FROM matter_costs WHERE matter_id IN (SELECT id FROM matters WHERE organization_id = my_tenant); EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM matter_fees WHERE matter_id IN (SELECT id FROM matters WHERE organization_id = my_tenant); EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM matter_parties WHERE matter_id IN (SELECT id FROM matters WHERE organization_id = my_tenant); EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM matter_documents WHERE matter_id IN (SELECT id FROM matters WHERE organization_id = my_tenant); EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM matter_deadlines WHERE matter_id IN (SELECT id FROM matters WHERE organization_id = my_tenant); EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM matter_events WHERE matter_id IN (SELECT id FROM matters WHERE organization_id = my_tenant); EXCEPTION WHEN undefined_table THEN NULL; END;
  
  -- Filings
  BEGIN DELETE FROM filing_applications WHERE organization_id = my_tenant; EXCEPTION WHEN undefined_table THEN NULL; END;
  
  -- Finance
  BEGIN DELETE FROM payments WHERE organization_id = my_tenant; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM invoice_line_items WHERE invoice_id IN (SELECT id FROM invoices WHERE organization_id = my_tenant); EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM invoices WHERE organization_id = my_tenant; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM quote_line_items WHERE quote_id IN (SELECT id FROM quotes WHERE organization_id = my_tenant); EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM quotes WHERE organization_id = my_tenant; EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM billing_clients WHERE organization_id = my_tenant; EXCEPTION WHEN undefined_table THEN NULL; END;
  
  -- Client Portal
  BEGIN DELETE FROM client_portal_users WHERE portal_id IN (SELECT id FROM client_portals WHERE organization_id = my_tenant); EXCEPTION WHEN undefined_table THEN NULL; END;
  BEGIN DELETE FROM client_portals WHERE organization_id = my_tenant; EXCEPTION WHEN undefined_table THEN NULL; END;
  
  -- Matters
  BEGIN DELETE FROM matters WHERE organization_id = my_tenant; EXCEPTION WHEN undefined_table THEN NULL; END;
  
  -- Contacts
  BEGIN DELETE FROM contacts WHERE organization_id = my_tenant; EXCEPTION WHEN undefined_table THEN NULL; END;
  
  RAISE NOTICE 'Tenant empresaIP limpio!';
END $$;