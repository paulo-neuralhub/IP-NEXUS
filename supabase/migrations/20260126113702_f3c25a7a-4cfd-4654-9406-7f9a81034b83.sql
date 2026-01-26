-- =============================================
-- WORKFLOW APPROVAL SYSTEM
-- Allows users to approve/reject workflow executions
-- =============================================

-- Add approval fields to workflow_queue
ALTER TABLE workflow_queue 
ADD COLUMN IF NOT EXISTS requires_approval boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT NULL CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS approval_requested_at timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS approved_at timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rejection_reason text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS requested_by uuid REFERENCES auth.users(id) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS matter_id uuid DEFAULT NULL,
ADD COLUMN IF NOT EXISTS contact_id uuid DEFAULT NULL;

-- Add requires_approval to workflow templates
ALTER TABLE workflow_templates 
ADD COLUMN IF NOT EXISTS requires_approval boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS approval_message text DEFAULT NULL;

-- Create index for pending approvals
CREATE INDEX IF NOT EXISTS idx_workflow_queue_pending_approval 
ON workflow_queue(organization_id, approval_status) 
WHERE approval_status = 'pending';

-- Function to create workflow with approval request
CREATE OR REPLACE FUNCTION public.request_workflow_approval(
  p_workflow_id uuid,
  p_organization_id uuid,
  p_trigger_type text,
  p_trigger_data jsonb DEFAULT '{}',
  p_matter_id uuid DEFAULT NULL,
  p_contact_id uuid DEFAULT NULL,
  p_requested_by uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_queue_id uuid;
  v_workflow_name text;
  v_requires_approval boolean;
BEGIN
  -- Get workflow info
  SELECT name, requires_approval INTO v_workflow_name, v_requires_approval
  FROM workflow_templates
  WHERE id = p_workflow_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Workflow not found';
  END IF;

  -- Insert into queue
  INSERT INTO workflow_queue (
    organization_id,
    workflow_id,
    trigger_type,
    trigger_data,
    status,
    requires_approval,
    approval_status,
    approval_requested_at,
    requested_by,
    matter_id,
    contact_id,
    scheduled_for
  ) VALUES (
    p_organization_id,
    p_workflow_id,
    p_trigger_type,
    p_trigger_data,
    CASE WHEN v_requires_approval THEN 'awaiting_approval' ELSE 'pending' END,
    v_requires_approval,
    CASE WHEN v_requires_approval THEN 'pending' ELSE NULL END,
    CASE WHEN v_requires_approval THEN now() ELSE NULL END,
    p_requested_by,
    p_matter_id,
    p_contact_id,
    now()
  )
  RETURNING id INTO v_queue_id;

  -- If requires approval, create notification
  IF v_requires_approval THEN
    -- Create notification for the requesting user and admins
    INSERT INTO notifications (
      organization_id,
      user_id,
      type,
      title,
      body,
      action_url,
      metadata
    )
    SELECT 
      p_organization_id,
      COALESCE(p_requested_by, m.user_id),
      'workflow_approval',
      'Workflow pendiente de aprobación',
      format('El workflow "%s" requiere tu aprobación antes de ejecutarse.', v_workflow_name),
      format('/app/workflow/approvals/%s', v_queue_id),
      jsonb_build_object(
        'queue_id', v_queue_id,
        'workflow_id', p_workflow_id,
        'workflow_name', v_workflow_name,
        'matter_id', p_matter_id
      )
    FROM memberships m
    WHERE m.organization_id = p_organization_id
      AND m.role IN ('owner', 'admin', 'manager')
    LIMIT 5; -- Limit notifications
  END IF;

  RETURN v_queue_id;
END;
$$;

-- Function to approve workflow
CREATE OR REPLACE FUNCTION public.approve_workflow(
  p_queue_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  -- Get org and validate
  SELECT organization_id INTO v_org_id
  FROM workflow_queue
  WHERE id = p_queue_id AND approval_status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Workflow approval not found or already processed';
  END IF;

  -- Update queue to approved
  UPDATE workflow_queue
  SET 
    approval_status = 'approved',
    approved_by = p_user_id,
    approved_at = now(),
    status = 'pending', -- Ready to execute
    scheduled_for = now()
  WHERE id = p_queue_id;

  -- Create notification
  INSERT INTO notifications (
    organization_id,
    user_id,
    type,
    title,
    body,
    action_url
  )
  SELECT 
    v_org_id,
    requested_by,
    'workflow_approved',
    'Workflow aprobado',
    'Tu workflow ha sido aprobado y se ejecutará ahora.',
    format('/app/workflow/queue/%s', p_queue_id)
  FROM workflow_queue
  WHERE id = p_queue_id AND requested_by IS NOT NULL;

  RETURN true;
END;
$$;

-- Function to reject workflow
CREATE OR REPLACE FUNCTION public.reject_workflow(
  p_queue_id uuid,
  p_user_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  -- Get org and validate
  SELECT organization_id INTO v_org_id
  FROM workflow_queue
  WHERE id = p_queue_id AND approval_status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Workflow approval not found or already processed';
  END IF;

  -- Update queue to rejected
  UPDATE workflow_queue
  SET 
    approval_status = 'rejected',
    approved_by = p_user_id,
    approved_at = now(),
    rejection_reason = p_reason,
    status = 'cancelled'
  WHERE id = p_queue_id;

  -- Create notification
  INSERT INTO notifications (
    organization_id,
    user_id,
    type,
    title,
    body,
    action_url
  )
  SELECT 
    v_org_id,
    requested_by,
    'workflow_rejected',
    'Workflow rechazado',
    COALESCE('Motivo: ' || p_reason, 'Tu workflow ha sido rechazado.'),
    format('/app/workflow/queue/%s', p_queue_id)
  FROM workflow_queue
  WHERE id = p_queue_id AND requested_by IS NOT NULL;

  RETURN true;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.request_workflow_approval TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_workflow TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_workflow TO authenticated;