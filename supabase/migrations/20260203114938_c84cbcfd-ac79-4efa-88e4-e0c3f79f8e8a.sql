-- Crear tabla automation_event_queue si no existe
CREATE TABLE IF NOT EXISTS automation_event_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  trigger_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  event_type VARCHAR(20) NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  old_data JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aeq_status_created ON automation_event_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_aeq_org ON automation_event_queue(organization_id);

-- Función para registrar eventos en la cola
CREATE OR REPLACE FUNCTION queue_automation_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_trigger_type TEXT;
BEGIN
  v_org_id := COALESCE(NEW.organization_id, OLD.organization_id);
  
  v_trigger_type := CASE 
    WHEN TG_OP = 'INSERT' THEN 'db_event'
    WHEN TG_OP = 'UPDATE' THEN 'field_change'
    ELSE 'db_event'
  END;

  IF v_org_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  INSERT INTO automation_event_queue (
    organization_id, trigger_type, entity_type, entity_id,
    event_type, event_data, old_data
  ) VALUES (
    v_org_id, v_trigger_type, TG_TABLE_NAME, COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END,
    CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END
  );

  RETURN COALESCE(NEW, OLD);
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to queue automation event: %', SQLERRM;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Aplicar triggers
-- MATTERS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matters' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS trg_automation_matters_insert ON matters;
    DROP TRIGGER IF EXISTS trg_automation_matters_update ON matters;
    
    CREATE TRIGGER trg_automation_matters_insert
      AFTER INSERT ON matters FOR EACH ROW
      EXECUTE FUNCTION queue_automation_event();

    CREATE TRIGGER trg_automation_matters_update
      AFTER UPDATE ON matters FOR EACH ROW
      WHEN (OLD.* IS DISTINCT FROM NEW.*)
      EXECUTE FUNCTION queue_automation_event();
  END IF;
END;
$$;

-- CONTACTS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contacts' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS trg_automation_contacts_insert ON contacts;
    
    CREATE TRIGGER trg_automation_contacts_insert
      AFTER INSERT ON contacts FOR EACH ROW
      EXECUTE FUNCTION queue_automation_event();
  END IF;
END;
$$;

-- TASKS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks' AND table_schema = 'public') THEN
    DROP TRIGGER IF EXISTS trg_automation_tasks_insert ON tasks;
    
    CREATE TRIGGER trg_automation_tasks_insert
      AFTER INSERT ON tasks FOR EACH ROW
      EXECUTE FUNCTION queue_automation_event();
  END IF;
END;
$$;

-- RLS
ALTER TABLE automation_event_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins full access on automation_event_queue" ON automation_event_queue;
DROP POLICY IF EXISTS "Tenants see own events" ON automation_event_queue;

CREATE POLICY "Super admins full access on automation_event_queue" ON automation_event_queue
  FOR ALL USING (
    EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Tenants see own events" ON automation_event_queue
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

GRANT SELECT, INSERT ON automation_event_queue TO authenticated;