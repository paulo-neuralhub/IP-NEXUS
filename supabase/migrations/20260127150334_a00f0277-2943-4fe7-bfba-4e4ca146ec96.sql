
-- Limpieza final (tablas verificadas sin client_portal_users)
DO $$
DECLARE
  my_tenant UUID := 'c8a6c1e7-ffba-48f3-9b09-ea8cc122c683';
BEGIN
  -- Email
  DELETE FROM email_campaigns WHERE organization_id = my_tenant;
  DELETE FROM email_templates WHERE organization_id = my_tenant;
  
  -- AI
  DELETE FROM ai_messages WHERE conversation_id IN (SELECT id FROM ai_conversations WHERE organization_id = my_tenant);
  DELETE FROM ai_conversations WHERE organization_id = my_tenant;
  DELETE FROM ai_generated_documents WHERE organization_id = my_tenant;
  
  -- Finance
  DELETE FROM invoice_items WHERE invoice_id IN (SELECT id FROM invoices WHERE organization_id = my_tenant);
  DELETE FROM invoices WHERE organization_id = my_tenant;
  DELETE FROM quote_items WHERE quote_id IN (SELECT id FROM quotes WHERE organization_id = my_tenant);
  DELETE FROM quotes WHERE organization_id = my_tenant;
  
  -- Matter
  DELETE FROM matter_documents WHERE organization_id = my_tenant;
  DELETE FROM matter_deadlines WHERE organization_id = my_tenant;
  DELETE FROM matter_events WHERE organization_id = my_tenant;
  
  -- Notifications
  DELETE FROM notifications WHERE organization_id = my_tenant;
  
  -- Client portals (sin client_portal_users)
  DELETE FROM portal_users WHERE portal_id IN (SELECT id FROM client_portals WHERE organization_id = my_tenant);
  DELETE FROM client_portals WHERE organization_id = my_tenant;
  
  -- Activity log
  DELETE FROM activity_log WHERE organization_id = my_tenant;
  
  RAISE NOTICE 'Limpieza completada';
END $$;
