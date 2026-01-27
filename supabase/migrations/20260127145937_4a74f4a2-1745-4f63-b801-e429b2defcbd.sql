
-- LIMPIEZA COMPLETA: Eliminar TODOS los datos demo
-- Paso 1: Limpiar tablas que referencian usuarios

-- Spider alerts (limpiar para empresaIP y cualquier org demo)
DELETE FROM spider_alerts WHERE organization_id = 'c8a6c1e7-ffba-48f3-9b09-ea8cc122c683';
DELETE FROM spider_alerts WHERE organization_id IN (SELECT id FROM organizations WHERE slug LIKE 'demo-%');

-- Watchlists relacionados
DELETE FROM watch_results WHERE watchlist_id IN (
  SELECT id FROM watchlists WHERE organization_id = 'c8a6c1e7-ffba-48f3-9b09-ea8cc122c683'
);
DELETE FROM watchlists WHERE organization_id = 'c8a6c1e7-ffba-48f3-9b09-ea8cc122c683';

-- Activity log
DELETE FROM activity_log WHERE organization_id = 'c8a6c1e7-ffba-48f3-9b09-ea8cc122c683';

-- Limpiar referencias de read_by/actioned_by a usuarios demo
UPDATE spider_alerts SET read_by = NULL WHERE read_by IN (SELECT id FROM users WHERE email LIKE '%@demo.ipnexus.com');
UPDATE spider_alerts SET actioned_by = NULL WHERE actioned_by IN (SELECT id FROM users WHERE email LIKE '%@demo.ipnexus.com');

-- Paso 2: Ahora podemos eliminar usuarios demo de public.users
DELETE FROM users WHERE email LIKE '%@demo.ipnexus.com';
