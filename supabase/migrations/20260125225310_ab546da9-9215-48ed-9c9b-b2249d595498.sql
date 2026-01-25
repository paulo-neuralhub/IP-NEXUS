-- Fix RLS policies to allow viewing system templates and preconfigured services

-- =============================================
-- 1. Fix document_templates RLS policy
-- =============================================

-- Drop old policy
DROP POLICY IF EXISTS "Users can view org templates and public templates" ON document_templates;

-- Create new policy that includes system templates (organization_id IS NULL)
CREATE POLICY "Users can view org templates, public templates and system templates"
  ON document_templates
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM memberships 
      WHERE user_id = auth.uid()
    )
    OR is_public = true
    OR organization_id IS NULL  -- Allow system templates
  );

-- =============================================
-- 2. Fix service_catalog RLS policy
-- =============================================

-- Drop old policy
DROP POLICY IF EXISTS "Users can view services" ON service_catalog;

-- Create new policy that includes preconfigured services (organization_id IS NULL)
CREATE POLICY "Users can view org services and preconfigured services"
  ON service_catalog
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM memberships 
      WHERE user_id = auth.uid()
    )
    OR organization_id IS NULL  -- Allow preconfigured services
  );

COMMENT ON POLICY "Users can view org templates, public templates and system templates" ON document_templates IS
'Allows users to view:
- Templates belonging to their organization
- Public templates (is_public = true)
- System templates (organization_id IS NULL)';

COMMENT ON POLICY "Users can view org services and preconfigured services" ON service_catalog IS
'Allows users to view:
- Services belonging to their organization
- Preconfigured services (organization_id IS NULL)';