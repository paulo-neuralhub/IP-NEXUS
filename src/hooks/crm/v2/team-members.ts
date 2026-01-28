// ============================================================
// IP-NEXUS CRM - Hook to fetch team members for assignment
// ============================================================

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";

export type TeamMember = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
};

/**
 * Fetches all team members (users) that belong to the current organization
 * via the memberships table.
 */
export function useTeamMembers() {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["team-members", organizationId],
    queryFn: async (): Promise<TeamMember[]> => {
      if (!organizationId) return [];

      // Get user_ids from memberships for this organization
      const { data: memberships, error: membershipError } = await supabase
        .from("memberships")
        .select("user_id")
        .eq("organization_id", organizationId);

      if (membershipError) throw membershipError;
      if (!memberships || memberships.length === 0) return [];

      const userIds = memberships.map((m) => m.user_id).filter(Boolean);

      // Fetch user details
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, full_name, avatar_url, email")
        .in("id", userIds)
        .order("full_name");

      if (usersError) throw usersError;

      return (users ?? []) as TeamMember[];
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
