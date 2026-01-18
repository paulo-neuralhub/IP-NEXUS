-- Fix infinite recursion in memberships RLS policies by removing self-referencing subqueries
-- and using existing SECURITY DEFINER function get_user_role_in_org(org_id).

-- Drop recursive policies
DROP POLICY IF EXISTS "Owners and admins can create memberships in their org" ON public.memberships;
DROP POLICY IF EXISTS "Owners and admins can update memberships" ON public.memberships;
DROP POLICY IF EXISTS "Owners and admins can delete memberships" ON public.memberships;

-- Recreate policies without referencing public.memberships directly
CREATE POLICY "Owners and admins can create memberships in their org"
ON public.memberships
FOR INSERT
TO authenticated
WITH CHECK (
  public.get_user_role_in_org(organization_id) = ANY (ARRAY['owner'::text, 'admin'::text])
);

CREATE POLICY "Owners and admins can update memberships"
ON public.memberships
FOR UPDATE
TO authenticated
USING (
  public.get_user_role_in_org(organization_id) = ANY (ARRAY['owner'::text, 'admin'::text])
)
WITH CHECK (
  public.get_user_role_in_org(organization_id) = ANY (ARRAY['owner'::text, 'admin'::text])
);

CREATE POLICY "Owners and admins can delete memberships"
ON public.memberships
FOR DELETE
TO authenticated
USING (
  public.get_user_role_in_org(organization_id) = ANY (ARRAY['owner'::text, 'admin'::text])
  AND role <> 'owner'::text
);
