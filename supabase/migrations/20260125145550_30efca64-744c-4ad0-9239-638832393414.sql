-- Add organization_id to deadline_rules for tenant-specific rules
ALTER TABLE public.deadline_rules
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add is_system column if it doesn't exist
ALTER TABLE public.deadline_rules
ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false;

-- Create index for faster tenant queries
CREATE INDEX IF NOT EXISTS idx_deadline_rules_org_id ON public.deadline_rules(organization_id);

-- Add organization_id to deadline_types for tenant-specific types
ALTER TABLE public.deadline_types
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create index
CREATE INDEX IF NOT EXISTS idx_deadline_types_org_id ON public.deadline_types(organization_id);

-- Add organization_id and is_active to holiday_calendars for tenant-specific holidays
ALTER TABLE public.holiday_calendars
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.holiday_calendars
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index
CREATE INDEX IF NOT EXISTS idx_holiday_calendars_org_id ON public.holiday_calendars(organization_id);

-- Mark existing rules as system rules
UPDATE public.deadline_rules 
SET is_system = true 
WHERE organization_id IS NULL AND is_system IS NULL;

-- Mark existing types as system types
UPDATE public.deadline_types 
SET is_system = true 
WHERE organization_id IS NULL AND is_system IS NULL;

-- RLS Policies for deadline_rules
DROP POLICY IF EXISTS "Users can view system and org rules" ON public.deadline_rules;
CREATE POLICY "Users can view system and org rules"
ON public.deadline_rules
FOR SELECT
USING (
  organization_id IS NULL 
  OR organization_id IN (
    SELECT m.organization_id FROM public.memberships m WHERE m.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can manage org rules" ON public.deadline_rules;
CREATE POLICY "Users can manage org rules"
ON public.deadline_rules
FOR ALL
USING (
  organization_id IN (
    SELECT m.organization_id FROM public.memberships m WHERE m.user_id = auth.uid()
  )
);

-- RLS Policies for deadline_types
DROP POLICY IF EXISTS "Users can view system and org types" ON public.deadline_types;
CREATE POLICY "Users can view system and org types"
ON public.deadline_types
FOR SELECT
USING (
  organization_id IS NULL 
  OR organization_id IN (
    SELECT m.organization_id FROM public.memberships m WHERE m.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can manage org types" ON public.deadline_types;
CREATE POLICY "Users can manage org types"
ON public.deadline_types
FOR ALL
USING (
  is_system = false AND organization_id IN (
    SELECT m.organization_id FROM public.memberships m WHERE m.user_id = auth.uid()
  )
);

-- RLS Policies for holiday_calendars
DROP POLICY IF EXISTS "Users can view system and org holidays" ON public.holiday_calendars;
CREATE POLICY "Users can view system and org holidays"
ON public.holiday_calendars
FOR SELECT
USING (
  organization_id IS NULL 
  OR organization_id IN (
    SELECT m.organization_id FROM public.memberships m WHERE m.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can manage org holidays" ON public.holiday_calendars;
CREATE POLICY "Users can manage org holidays"
ON public.holiday_calendars
FOR ALL
USING (
  organization_id IN (
    SELECT m.organization_id FROM public.memberships m WHERE m.user_id = auth.uid()
  )
);