// ============================================================
// IP-NEXUS HELP - GUIDE PROGRESS (DB)
// Prompt P78: Contextual Help System (100% functional)
// ============================================================

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { useOrganization } from "@/contexts/organization-context";

export type GuideProgressStatus = "completed" | "skipped";

export function useGuideProgress(featureKey: string) {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const qc = useQueryClient();

  const enabled = Boolean(user?.id && currentOrganization?.id && featureKey);

  const queryKey = ["contextual-guide-progress", currentOrganization?.id, user?.id, featureKey] as const;

  const progressQuery = useQuery({
    queryKey,
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contextual_guide_progress")
        .select("status")
        .eq("organization_id", currentOrganization!.id)
        .eq("user_id", user!.id)
        .eq("feature_key", featureKey)
        .maybeSingle();

      if (error) throw error;
      // React Query queryFn must never return `undefined`.
      // Use `null` to represent “no progress yet”.
      return (data?.status as GuideProgressStatus | null) ?? null;
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (status: GuideProgressStatus) => {
      const { error } = await supabase.from("contextual_guide_progress").upsert(
        {
          organization_id: currentOrganization!.id,
          user_id: user!.id,
          feature_key: featureKey,
          status,
        },
        { onConflict: "organization_id,user_id,feature_key" },
      );

      if (error) throw error;
      return status;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
    },
  });

  return {
    status: progressQuery.data,
    isLoading: progressQuery.isLoading || upsertMutation.isPending,
    markCompleted: () => upsertMutation.mutate("completed"),
    markSkipped: () => upsertMutation.mutate("skipped"),
    enabled,
  };
}
