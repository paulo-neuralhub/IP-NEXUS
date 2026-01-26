-- =============================================
-- ADDITIONAL WORKFLOW TRIGGERS
-- L61-B: Complete workflow trigger coverage
-- =============================================

-- 1. Trigger on document uploaded
CREATE OR REPLACE FUNCTION public.trigger_workflow_on_document_uploaded()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_workflow RECORD;
BEGIN
  -- Get organization_id from matter
  SELECT organization_id INTO v_org_id 
  FROM matters 
  WHERE id = NEW.matter_id;

  IF v_org_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Find matching workflows
  FOR v_workflow IN 
    SELECT id, requires_approval 
    FROM workflow_templates 
    WHERE organization_id = v_org_id 
      AND trigger_type = 'document.uploaded'
      AND is_active = true
  LOOP
    INSERT INTO workflow_queue (
      organization_id,
      workflow_id,
      trigger_type,
      trigger_data,
      entity_type,
      entity_id,
      status,
      priority,
      scheduled_for
    ) VALUES (
      v_org_id,
      v_workflow.id,
      'document.uploaded',
      jsonb_build_object(
        'document_id', NEW.id,
        'document_name', NEW.name,
        'document_type', NEW.document_type,
        'matter_id', NEW.matter_id,
        'file_path', NEW.file_path,
        'uploaded_by', NEW.uploaded_by
      ),
      'document',
      NEW.id,
      CASE WHEN v_workflow.requires_approval THEN 'pending_approval' ELSE 'pending' END,
      1,
      NOW()
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workflow_trigger_document_uploaded ON matter_documents;
CREATE TRIGGER workflow_trigger_document_uploaded
  AFTER INSERT ON public.matter_documents
  FOR EACH ROW EXECUTE FUNCTION trigger_workflow_on_document_uploaded();


-- 2. Trigger on invoice created
CREATE OR REPLACE FUNCTION public.trigger_workflow_on_invoice_created()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workflow RECORD;
BEGIN
  IF NEW.organization_id IS NULL THEN
    RETURN NEW;
  END IF;

  FOR v_workflow IN 
    SELECT id, requires_approval 
    FROM workflow_templates 
    WHERE organization_id = NEW.organization_id 
      AND trigger_type = 'invoice.created'
      AND is_active = true
  LOOP
    INSERT INTO workflow_queue (
      organization_id,
      workflow_id,
      trigger_type,
      trigger_data,
      entity_type,
      entity_id,
      status,
      priority,
      scheduled_for
    ) VALUES (
      NEW.organization_id,
      v_workflow.id,
      'invoice.created',
      jsonb_build_object(
        'invoice_id', NEW.id,
        'invoice_number', NEW.invoice_number,
        'amount', NEW.amount,
        'currency', NEW.currency,
        'status', NEW.status,
        'due_date', NEW.due_date,
        'client_id', NEW.client_id,
        'matter_id', NEW.matter_id
      ),
      'invoice',
      NEW.id,
      CASE WHEN v_workflow.requires_approval THEN 'pending_approval' ELSE 'pending' END,
      1,
      NOW()
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workflow_trigger_invoice_created ON invoices;
CREATE TRIGGER workflow_trigger_invoice_created
  AFTER INSERT ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION trigger_workflow_on_invoice_created();


-- 3. Trigger on payment received (invoice status changes to paid)
CREATE OR REPLACE FUNCTION public.trigger_workflow_on_payment_received()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workflow RECORD;
BEGIN
  -- Only trigger if status changed to 'paid'
  IF NEW.status <> 'paid' OR OLD.status = 'paid' THEN
    RETURN NEW;
  END IF;

  IF NEW.organization_id IS NULL THEN
    RETURN NEW;
  END IF;

  FOR v_workflow IN 
    SELECT id, requires_approval 
    FROM workflow_templates 
    WHERE organization_id = NEW.organization_id 
      AND trigger_type = 'payment.received'
      AND is_active = true
  LOOP
    INSERT INTO workflow_queue (
      organization_id,
      workflow_id,
      trigger_type,
      trigger_data,
      entity_type,
      entity_id,
      status,
      priority,
      scheduled_for
    ) VALUES (
      NEW.organization_id,
      v_workflow.id,
      'payment.received',
      jsonb_build_object(
        'invoice_id', NEW.id,
        'invoice_number', NEW.invoice_number,
        'amount', NEW.amount,
        'currency', NEW.currency,
        'paid_at', NOW(),
        'client_id', NEW.client_id,
        'matter_id', NEW.matter_id
      ),
      'invoice',
      NEW.id,
      CASE WHEN v_workflow.requires_approval THEN 'pending_approval' ELSE 'pending' END,
      1,
      NOW()
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workflow_trigger_payment_received ON invoices;
CREATE TRIGGER workflow_trigger_payment_received
  AFTER UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION trigger_workflow_on_payment_received();


-- 4. Trigger on deadline completed
CREATE OR REPLACE FUNCTION public.trigger_workflow_on_deadline_completed()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workflow RECORD;
BEGIN
  -- Only trigger if status changed to 'completed'
  IF NEW.status <> 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  IF NEW.organization_id IS NULL THEN
    RETURN NEW;
  END IF;

  FOR v_workflow IN 
    SELECT id, requires_approval 
    FROM workflow_templates 
    WHERE organization_id = NEW.organization_id 
      AND trigger_type = 'deadline.completed'
      AND is_active = true
  LOOP
    INSERT INTO workflow_queue (
      organization_id,
      workflow_id,
      trigger_type,
      trigger_data,
      entity_type,
      entity_id,
      status,
      priority,
      scheduled_for
    ) VALUES (
      NEW.organization_id,
      v_workflow.id,
      'deadline.completed',
      jsonb_build_object(
        'deadline_id', NEW.id,
        'deadline_date', NEW.deadline_date,
        'deadline_description', NEW.description,
        'deadline_type', NEW.deadline_type,
        'matter_id', NEW.matter_id,
        'completed_at', NOW()
      ),
      'deadline',
      NEW.id,
      CASE WHEN v_workflow.requires_approval THEN 'pending_approval' ELSE 'pending' END,
      1,
      NOW()
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workflow_trigger_deadline_completed ON matter_deadlines;
CREATE TRIGGER workflow_trigger_deadline_completed
  AFTER UPDATE ON public.matter_deadlines
  FOR EACH ROW EXECUTE FUNCTION trigger_workflow_on_deadline_completed();


-- 5. Trigger on portal message received
CREATE OR REPLACE FUNCTION public.trigger_workflow_on_portal_message()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_workflow RECORD;
BEGIN
  -- Only trigger for client messages (not staff responses)
  IF NEW.sender_type <> 'client' THEN
    RETURN NEW;
  END IF;

  -- Get organization_id from portal
  SELECT organization_id INTO v_org_id 
  FROM client_portals 
  WHERE id = NEW.portal_id;

  IF v_org_id IS NULL THEN
    RETURN NEW;
  END IF;

  FOR v_workflow IN 
    SELECT id, requires_approval 
    FROM workflow_templates 
    WHERE organization_id = v_org_id 
      AND trigger_type = 'message.received'
      AND is_active = true
  LOOP
    INSERT INTO workflow_queue (
      organization_id,
      workflow_id,
      trigger_type,
      trigger_data,
      entity_type,
      entity_id,
      status,
      priority,
      scheduled_for
    ) VALUES (
      v_org_id,
      v_workflow.id,
      'message.received',
      jsonb_build_object(
        'message_id', NEW.id,
        'thread_id', NEW.thread_id,
        'portal_id', NEW.portal_id,
        'subject', NEW.subject,
        'content_preview', LEFT(NEW.content, 200),
        'sender_type', NEW.sender_type
      ),
      'message',
      NEW.id,
      CASE WHEN v_workflow.requires_approval THEN 'pending_approval' ELSE 'pending' END,
      1,
      NOW()
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workflow_trigger_portal_message ON portal_messages;
CREATE TRIGGER workflow_trigger_portal_message
  AFTER INSERT ON public.portal_messages
  FOR EACH ROW EXECUTE FUNCTION trigger_workflow_on_portal_message();


-- 6. Add trigger_config column to workflow_templates if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'workflow_templates' 
    AND column_name = 'trigger_config'
  ) THEN
    ALTER TABLE workflow_templates ADD COLUMN trigger_config JSONB DEFAULT '{}';
  END IF;
END $$;