-- Fix recursive RLS policy on memberships
-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view org memberships" ON public.memberships;

-- The existing policy "Users can view own memberships" should be sufficient
-- It uses (user_id = auth.uid()) which doesn't cause recursion

-- Make the get_user_org_ids function SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.memberships WHERE user_id = auth.uid();
$$;