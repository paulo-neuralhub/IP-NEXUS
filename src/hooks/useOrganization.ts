// ============================================================
// IP-NEXUS - useOrganization (compat)
// Some modules expect { organizationId } rather than { currentOrganization }.
// ============================================================

import { useOrganization as useOrganizationContext } from "@/contexts/organization-context";

export function useOrganization() {
  const { currentOrganization } = useOrganizationContext();
  return {
    organizationId: currentOrganization?.id,
    currentOrganization,
  };
}
