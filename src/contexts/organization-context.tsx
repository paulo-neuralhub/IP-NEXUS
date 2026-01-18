import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { ROLES } from "@/lib/constants";

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  addons: string[];
  status: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface Membership {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
  permissions: unknown;
  created_at: string;
  organization?: Organization;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  memberships: Membership[];
  isLoading: boolean;
  needsOnboarding: boolean;
  setCurrentOrganization: (org: Organization) => void;
  userRole: string | null;
  hasPermission: (module: string, action: string) => boolean;
  hasAddon: (addon: string) => boolean;
  refreshMemberships: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

const ORG_STORAGE_KEY = "ip-nexus-current-org";

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const [currentOrganization, setCurrentOrganizationState] = useState<Organization | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const fetchMemberships = async () => {
    if (!user) {
      setMemberships([]);
      setCurrentOrganizationState(null);
      setIsLoading(false);
      return;
    }

    const { data: membershipData, error: membershipError } = await supabase
      .from("memberships")
      .select("*")
      .eq("user_id", user.id);

    if (membershipError) {
      console.error("Error fetching memberships:", membershipError);
      setIsLoading(false);
      return;
    }

    if (!membershipData || membershipData.length === 0) {
      setMemberships([]);
      setNeedsOnboarding(true);
      setIsLoading(false);
      return;
    }

    // Fetch organizations for memberships
    const orgIds = membershipData.map((m) => m.organization_id);
    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .select("*")
      .in("id", orgIds);

    if (orgError) {
      console.error("Error fetching organizations:", orgError);
      setIsLoading(false);
      return;
    }

    // Combine memberships with organizations
    const membershipsWithOrgs = membershipData.map((m) => ({
      ...m,
      organization: orgData?.find((o) => o.id === m.organization_id) as Organization | undefined,
    }));

    setMemberships(membershipsWithOrgs);
    setNeedsOnboarding(false);

    // Auto-select organization
    const savedOrgId = localStorage.getItem(ORG_STORAGE_KEY);
    const savedOrg = orgData?.find((o) => o.id === savedOrgId);

    if (savedOrg) {
      setCurrentOrganizationState(savedOrg as Organization);
    } else if (orgData && orgData.length === 1) {
      // Only one org, auto-select
      setCurrentOrganizationState(orgData[0] as Organization);
      localStorage.setItem(ORG_STORAGE_KEY, orgData[0].id);
    } else if (orgData && orgData.length > 1) {
      // Multiple orgs, select first
      setCurrentOrganizationState(orgData[0] as Organization);
      localStorage.setItem(ORG_STORAGE_KEY, orgData[0].id);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (session) {
      fetchMemberships();
    } else {
      setMemberships([]);
      setCurrentOrganizationState(null);
      setNeedsOnboarding(false);
      setIsLoading(false);
    }
  }, [session, user]);

  const setCurrentOrganization = (org: Organization) => {
    setCurrentOrganizationState(org);
    localStorage.setItem(ORG_STORAGE_KEY, org.id);
  };

  const userRole = currentOrganization
    ? memberships.find((m) => m.organization_id === currentOrganization.id)?.role || null
    : null;

  const hasPermission = (module: string, action: string): boolean => {
    if (!userRole) return false;

    const roleConfig = ROLES[userRole as keyof typeof ROLES];
    if (!roleConfig) return false;

    // Simple permission check based on role level
    // Owner and Admin can do everything
    if (roleConfig.level >= 80) return true;

    // Manager can view, create, edit most things
    if (roleConfig.level >= 60 && ["view", "create", "edit"].includes(action)) return true;

    // Member can view and edit assigned
    if (roleConfig.level >= 40 && ["view", "edit"].includes(action)) return true;

    // Viewer can only view
    if (roleConfig.level >= 20 && action === "view") return true;

    // External has very limited access
    if (roleConfig.level >= 10 && action === "view" && ["docket"].includes(module)) return true;

    return false;
  };

  const hasAddon = (addon: string): boolean => {
    if (!currentOrganization) return false;
    
    // Business and Enterprise plans include CRM and Marketing
    if (["business", "enterprise"].includes(currentOrganization.plan)) {
      if (["crm", "marketing"].includes(addon)) return true;
    }
    
    return currentOrganization.addons?.includes(addon) || false;
  };

  const refreshMemberships = async () => {
    await fetchMemberships();
  };

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        memberships,
        isLoading,
        needsOnboarding,
        setCurrentOrganization,
        userRole,
        hasPermission,
        hasAddon,
        refreshMemberships,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
}
