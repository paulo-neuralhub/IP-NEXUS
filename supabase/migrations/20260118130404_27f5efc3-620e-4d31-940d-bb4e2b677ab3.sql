-- ========================================
-- IP-NEXUS FOUNDATION - Database Schema
-- ========================================

-- 1. ORGANIZATIONS (tenants)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'business', 'enterprise')),
  addons TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS (extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MEMBERSHIPS (user <-> org relationship)
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer', 'external')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX idx_memberships_user ON public.memberships(user_id);
CREATE INDEX idx_memberships_org ON public.memberships(organization_id);
CREATE INDEX idx_organizations_slug ON public.organizations(slug);
CREATE INDEX idx_users_email ON public.users(email);

-- ========================================
-- ENABLE RLS
-- ========================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- ========================================
-- SECURITY DEFINER FUNCTIONS
-- ========================================

-- Function to check if user is member of an organization
CREATE OR REPLACE FUNCTION public.is_member_of_org(org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = auth.uid() AND organization_id = org_id
  );
$$;

-- Function to get user's organizations
CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.memberships WHERE user_id = auth.uid();
$$;

-- Function to check user role in organization
CREATE OR REPLACE FUNCTION public.get_user_role_in_org(org_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.memberships
  WHERE user_id = auth.uid() AND organization_id = org_id
  LIMIT 1;
$$;

-- ========================================
-- RLS POLICIES - USERS
-- ========================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (for trigger)
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ========================================
-- RLS POLICIES - ORGANIZATIONS
-- ========================================

-- Users can view organizations they belong to
CREATE POLICY "Users can view their organizations" ON public.organizations
  FOR SELECT USING (id IN (SELECT public.get_user_org_ids()));

-- Users can insert new organizations (will become owner via trigger)
CREATE POLICY "Users can create organizations" ON public.organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only owners/admins can update organizations
CREATE POLICY "Owners and admins can update organizations" ON public.organizations
  FOR UPDATE USING (
    public.get_user_role_in_org(id) IN ('owner', 'admin')
  );

-- ========================================
-- RLS POLICIES - MEMBERSHIPS
-- ========================================

-- Users can view their own memberships
CREATE POLICY "Users can view own memberships" ON public.memberships
  FOR SELECT USING (user_id = auth.uid());

-- Users can view memberships of their organizations
CREATE POLICY "Users can view org memberships" ON public.memberships
  FOR SELECT USING (
    organization_id IN (SELECT public.get_user_org_ids())
  );

-- Users can insert their own membership when creating org (owner role)
CREATE POLICY "Users can create owner membership" ON public.memberships
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND role = 'owner'
  );

-- Owners and admins can manage memberships
CREATE POLICY "Owners and admins can manage memberships" ON public.memberships
  FOR ALL USING (
    public.get_user_role_in_org(organization_id) IN ('owner', 'admin')
  );

-- ========================================
-- TRIGGERS
-- ========================================

-- Auto-create user profile when auth.user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();