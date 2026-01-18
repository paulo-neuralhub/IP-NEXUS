-- =====================================================
-- FIX: RLS POLICIES FOR INSERT/UPDATE/DELETE
-- =====================================================

-- =====================================================
-- DROP EXISTING CONFLICTING POLICIES
-- =====================================================

-- Organizations
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Owners and admins can update organizations" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Owners and admins can update their organization" ON organizations;

-- Memberships
DROP POLICY IF EXISTS "Users can create owner membership" ON memberships;
DROP POLICY IF EXISTS "Users can create their own membership" ON memberships;
DROP POLICY IF EXISTS "Owners and admins can manage memberships" ON memberships;
DROP POLICY IF EXISTS "Owners and admins can create memberships in their org" ON memberships;
DROP POLICY IF EXISTS "Owners and admins can update memberships" ON memberships;
DROP POLICY IF EXISTS "Owners and admins can delete memberships" ON memberships;

-- Users
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- =====================================================
-- POLICIES FOR ORGANIZATIONS
-- =====================================================

-- Allow authenticated users to CREATE organizations
CREATE POLICY "Authenticated users can create organizations" ON organizations
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Allow owners/admins to UPDATE their organization
CREATE POLICY "Owners and admins can update their organization" ON organizations
  FOR UPDATE 
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- POLICIES FOR MEMBERSHIPS
-- =====================================================

-- Allow users to create THEIR OWN membership (for onboarding)
CREATE POLICY "Users can create their own membership" ON memberships
  FOR INSERT 
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow owners/admins to create memberships in their org (invitations)
CREATE POLICY "Owners and admins can create memberships in their org" ON memberships
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Allow owners/admins to update memberships (change roles)
CREATE POLICY "Owners and admins can update memberships" ON memberships
  FOR UPDATE 
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Allow owners/admins to delete memberships (except owner)
CREATE POLICY "Owners and admins can delete memberships" ON memberships
  FOR DELETE 
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
    AND role != 'owner' -- Cannot delete the owner
  );

-- =====================================================
-- POLICIES FOR USERS
-- =====================================================

-- Allow inserting own profile (if trigger fails)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT 
  TO authenticated
  WITH CHECK (id = auth.uid());

-- =====================================================
-- VERIFY TRIGGER EXISTS
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;