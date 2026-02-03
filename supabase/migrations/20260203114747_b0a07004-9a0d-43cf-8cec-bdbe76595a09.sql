-- ============================================================================
-- DB TRIGGERS PARA AUTOMATIZACIONES (Continuación - solo RLS y grants)
-- Nota: La tabla y triggers ya se crearon en migración anterior
-- ============================================================================

-- RLS (la tabla ya debería existir)
DO $$
BEGIN
  -- Verificar si la tabla existe antes de aplicar RLS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'automation_event_queue' AND table_schema = 'public') THEN
    -- Ya tiene RLS habilitado, solo crear políticas si no existen
    
    -- Eliminar políticas existentes para recrear
    DROP POLICY IF EXISTS "Super admins full access on automation_event_queue" ON automation_event_queue;
    DROP POLICY IF EXISTS "Tenants see own events" ON automation_event_queue;
    
    -- Super admins full access (usando tabla super_admins)
    CREATE POLICY "Super admins full access on automation_event_queue" ON automation_event_queue
      FOR ALL USING (
        EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
      );

    -- Tenants pueden ver sus propios eventos
    CREATE POLICY "Tenants see own events" ON automation_event_queue
      FOR SELECT USING (
        organization_id IN (
          SELECT organization_id FROM memberships WHERE user_id = auth.uid()
        )
      );
      
    RAISE NOTICE 'RLS policies created on automation_event_queue';
  END IF;
END;
$$;

-- ÍNDICE PARA BÚSQUEDA RÁPIDA
CREATE INDEX IF NOT EXISTS idx_tenant_automations_trigger_active 
  ON tenant_automations(organization_id, trigger_type) 
  WHERE is_active = true;

-- GRANTS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'automation_event_queue' AND table_schema = 'public') THEN
    GRANT SELECT, INSERT ON automation_event_queue TO authenticated;
  END IF;
END;
$$;