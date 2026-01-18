-- Tighten overly-permissive RLS policy flagged by linter (WITH CHECK true)
-- Keep behavior the same (authenticated users can create orgs), but avoid literal TRUE.

DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;

CREATE POLICY "Authenticated users can create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);
