-- ============================================
-- Activity Log System - Complete Audit Trail
-- ============================================

-- Main activity log table
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Primary entity
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  
  -- Cross-references for multi-entity history
  matter_id uuid REFERENCES public.matters(id) ON DELETE SET NULL,
  client_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  invoice_id uuid,
  quote_id uuid,
  deal_id uuid REFERENCES public.deals(id) ON DELETE SET NULL,
  
  -- Action details
  action text NOT NULL,
  action_category text CHECK (action_category IN ('billing', 'communication', 'document', 'status', 'task', 'party', 'deadline', 'system', 'note', 'other')),
  
  -- Content
  title text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}',
  
  -- External references
  reference_type text,
  reference_id uuid,
  reference_number text,
  
  -- Amounts (for billing activities)
  amount numeric(15,2),
  currency text DEFAULT 'EUR',
  
  -- Change tracking (for status changes, updates)
  old_value text,
  new_value text,
  changed_fields jsonb,
  
  -- User and timestamps
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  
  -- For grouping related activities
  batch_id uuid,
  
  -- Visibility
  is_internal boolean DEFAULT false,
  is_system boolean DEFAULT false
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_org ON public.activity_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_matter ON public.activity_log(matter_id, created_at DESC) WHERE matter_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activity_log_client ON public.activity_log(client_id, created_at DESC) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON public.activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON public.activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_category ON public.activity_log(action_category);

-- RLS
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_log_select" ON public.activity_log
  FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "activity_log_insert" ON public.activity_log
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  );

-- Action types catalog for reference
CREATE TABLE IF NOT EXISTS public.activity_action_types (
  code text PRIMARY KEY,
  name_es text NOT NULL,
  name_en text NOT NULL,
  category text NOT NULL,
  icon text,
  color text,
  sort_order integer DEFAULT 0
);

INSERT INTO public.activity_action_types (code, name_es, name_en, category, icon, color, sort_order) VALUES
-- Matter actions
('matter_created', 'Expediente creado', 'Matter created', 'status', 'file-plus', 'primary', 1),
('matter_updated', 'Expediente actualizado', 'Matter updated', 'status', 'edit', 'muted', 2),
('status_changed', 'Estado cambiado', 'Status changed', 'status', 'refresh-cw', 'primary', 3),
('deadline_added', 'Plazo añadido', 'Deadline added', 'deadline', 'calendar-plus', 'warning', 10),
('deadline_completed', 'Plazo completado', 'Deadline completed', 'deadline', 'calendar-check', 'success', 11),
('deadline_updated', 'Plazo modificado', 'Deadline updated', 'deadline', 'calendar', 'muted', 12),
('document_uploaded', 'Documento subido', 'Document uploaded', 'document', 'file-up', 'primary', 20),
('document_deleted', 'Documento eliminado', 'Document deleted', 'document', 'file-x', 'destructive', 21),
('party_added', 'Parte añadida', 'Party added', 'party', 'user-plus', 'primary', 30),
('party_removed', 'Parte eliminada', 'Party removed', 'party', 'user-minus', 'destructive', 31),
('class_added', 'Clase añadida', 'Class added', 'status', 'list-plus', 'primary', 40),
('note_added', 'Nota añadida', 'Note added', 'note', 'sticky-note', 'muted', 50),

-- Billing actions
('invoice_created', 'Factura emitida', 'Invoice created', 'billing', 'receipt', 'primary', 100),
('invoice_line_added', 'Línea de factura añadida', 'Invoice line added', 'billing', 'list-plus', 'muted', 101),
('invoice_sent', 'Factura enviada', 'Invoice sent', 'billing', 'send', 'primary', 102),
('invoice_paid', 'Factura pagada', 'Invoice paid', 'billing', 'check-circle', 'success', 103),
('invoice_partial', 'Pago parcial', 'Partial payment', 'billing', 'circle-dot', 'warning', 104),
('invoice_cancelled', 'Factura anulada', 'Invoice cancelled', 'billing', 'x-circle', 'destructive', 105),
('quote_created', 'Presupuesto creado', 'Quote created', 'billing', 'file-text', 'primary', 110),
('quote_sent', 'Presupuesto enviado', 'Quote sent', 'billing', 'send', 'primary', 111),
('quote_accepted', 'Presupuesto aceptado', 'Quote accepted', 'billing', 'check-circle', 'success', 112),
('quote_rejected', 'Presupuesto rechazado', 'Quote rejected', 'billing', 'x-circle', 'destructive', 113),
('quote_converted', 'Presupuesto convertido', 'Quote converted', 'billing', 'arrow-right-circle', 'success', 114),
('cost_recorded', 'Coste registrado', 'Cost recorded', 'billing', 'wallet', 'muted', 120),

-- Communication actions
('email_sent', 'Email enviado', 'Email sent', 'communication', 'mail', 'primary', 200),
('email_received', 'Email recibido', 'Email received', 'communication', 'inbox', 'primary', 201),
('call_logged', 'Llamada registrada', 'Call logged', 'communication', 'phone', 'muted', 210),
('meeting_logged', 'Reunión registrada', 'Meeting logged', 'communication', 'users', 'muted', 220),
('whatsapp_sent', 'WhatsApp enviado', 'WhatsApp sent', 'communication', 'message-circle', 'success', 230),
('whatsapp_received', 'WhatsApp recibido', 'WhatsApp received', 'communication', 'message-circle', 'success', 231),

-- Task actions
('task_created', 'Tarea creada', 'Task created', 'task', 'list-todo', 'primary', 300),
('task_completed', 'Tarea completada', 'Task completed', 'task', 'check-square', 'success', 301),
('task_assigned', 'Tarea asignada', 'Task assigned', 'task', 'user-check', 'muted', 302),

-- System actions
('reminder_sent', 'Recordatorio enviado', 'Reminder sent', 'system', 'bell', 'warning', 400),
('deadline_warning', 'Alerta de plazo', 'Deadline warning', 'system', 'alert-triangle', 'warning', 401),
('auto_renewal', 'Renovación automática', 'Auto renewal', 'system', 'refresh-cw', 'primary', 410),
('import_completed', 'Importación completada', 'Import completed', 'system', 'upload', 'success', 420),
('sync_completed', 'Sincronización completada', 'Sync completed', 'system', 'refresh-cw', 'success', 421)
ON CONFLICT (code) DO NOTHING;

-- RLS for action types (read-only for all)
ALTER TABLE public.activity_action_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "action_types_read" ON public.activity_action_types
  FOR SELECT TO authenticated USING (true);

-- ============================================
-- Auto-logging triggers
-- ============================================

-- Log matter status changes
CREATE OR REPLACE FUNCTION public.log_matter_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.activity_log (
      organization_id, entity_type, entity_id, matter_id,
      action, action_category, title, description,
      old_value, new_value, is_system
    ) VALUES (
      NEW.organization_id, 'matter', NEW.id, NEW.id,
      'status_changed', 'status',
      'Estado del expediente actualizado',
      format('Estado cambiado de %s a %s', COALESCE(OLD.status, 'ninguno'), NEW.status),
      OLD.status, NEW.status, true
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_log_matter_status ON public.matters;
CREATE TRIGGER trg_log_matter_status
  AFTER UPDATE ON public.matters
  FOR EACH ROW
  EXECUTE FUNCTION public.log_matter_status_change();

-- Log document uploads
CREATE OR REPLACE FUNCTION public.log_document_upload()
RETURNS TRIGGER AS $$
DECLARE
  v_matter record;
BEGIN
  SELECT organization_id INTO v_matter FROM public.matters WHERE id = NEW.matter_id;
  
  INSERT INTO public.activity_log (
    organization_id, entity_type, entity_id, matter_id,
    action, action_category, title, description,
    reference_type, reference_id, created_by, is_system
  ) VALUES (
    COALESCE(NEW.organization_id, v_matter.organization_id),
    'document', NEW.id, NEW.matter_id,
    'document_uploaded', 'document',
    'Documento subido',
    NEW.name,
    'document', NEW.id, NEW.uploaded_by, true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_log_document_upload ON public.matter_documents;
CREATE TRIGGER trg_log_document_upload
  AFTER INSERT ON public.matter_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.log_document_upload();

-- Log party additions
CREATE OR REPLACE FUNCTION public.log_party_added()
RETURNS TRIGGER AS $$
DECLARE
  v_party_name text;
  v_role_name text;
BEGIN
  -- Get party name
  v_party_name := COALESCE(
    (SELECT name FROM public.contacts WHERE id = NEW.client_id),
    NEW.external_name,
    'Sin nombre'
  );
  
  -- Get role name
  SELECT name_es INTO v_role_name FROM public.party_roles WHERE code = NEW.party_role;
  
  INSERT INTO public.activity_log (
    organization_id, entity_type, entity_id, matter_id,
    action, action_category, title, description,
    reference_type, reference_id, created_by, is_system
  ) VALUES (
    NEW.organization_id, 'party', NEW.id, NEW.matter_id,
    'party_added', 'party',
    'Parte añadida al expediente',
    format('%s - %s', v_party_name, COALESCE(v_role_name, NEW.party_role)),
    'party', NEW.id, NEW.created_by, true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_log_party_added ON public.matter_parties;
CREATE TRIGGER trg_log_party_added
  AFTER INSERT ON public.matter_parties
  FOR EACH ROW
  EXECUTE FUNCTION public.log_party_added();