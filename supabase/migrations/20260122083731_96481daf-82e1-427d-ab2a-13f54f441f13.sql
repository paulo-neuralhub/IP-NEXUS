-- Fix workflow trigger for matters: schema uses column "type" not "matter_type" and has no "ip_type".
-- This was causing inserts (including demo seeding) to fail with: record "new" has no field "matter_type".

CREATE OR REPLACE FUNCTION public.trigger_workflow_on_matter_created()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.workflow_queue (
    organization_id, workflow_id, trigger_type, trigger_data, priority
  )
  SELECT 
    NEW.organization_id,
    wt.id,
    'matter_created',
    jsonb_build_object(
      'matter_id', NEW.id,
      'matter_type', NEW.type,
      'matter_data', to_jsonb(NEW)
    ),
    5
  FROM public.workflow_templates wt
  WHERE wt.organization_id = NEW.organization_id
    AND wt.trigger_type = 'matter_created'
    AND wt.is_active = true;

  RETURN NEW;
END;
$$;
