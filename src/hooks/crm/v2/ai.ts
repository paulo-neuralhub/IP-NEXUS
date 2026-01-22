import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase";
import { useOrganization } from "@/hooks/useOrganization";
import type { AIDraftFeedback } from "./types";

export function useSubmitAIDraftFeedback() {
  const queryClient = useQueryClient();
  const { organizationId } = useOrganization();

  return useMutation({
    mutationFn: async (feedback: AIDraftFeedback) => {
      if (!organizationId) throw new Error("Missing organizationId");

      // simple normalized distance proxy
      let correctionDistance = 0;
      let semanticSimilarity = 1;
      if (feedback.human_action === "edited" && feedback.final_sent_text) {
        const maxLen = Math.max(feedback.ai_draft.length, feedback.final_sent_text.length);
        const minLen = Math.min(feedback.ai_draft.length, feedback.final_sent_text.length);
        correctionDistance = maxLen === 0 ? 0 : 1 - minLen / maxLen;
        semanticSimilarity = 0.8;
      }

      // Map to existing schema in crm_ai_learning_logs
      const { data, error } = await fromTable("crm_ai_learning_logs")
        .insert({
          organization_id: organizationId,
          interaction_id: feedback.interaction_id,
          context_type: feedback.learning_type,
          input_context: feedback.original_input,
          ai_output: feedback.ai_draft,
          human_action: feedback.human_action,
          human_output: feedback.final_sent_text,
          feedback_notes: feedback.edit_reason,
          correction_distance: correctionDistance,
          semantic_similarity: semanticSimilarity,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-learning-stats"] });
    },
  });
}

export function usePendingRecommendations(accountId?: string) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["crm-recommendations", organizationId, accountId],
    queryFn: async () => {
      if (!organizationId) return [];
      // Keep selection simple to avoid deep TS instantiation and because the
      // join keys may vary by schema.
      let query = fromTable("crm_ai_recommendations")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("status", "pending")
        .order("urgency", { ascending: false });

      if (accountId) query = query.eq("account_id", accountId);

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!organizationId,
  });
}

export function useActionOnRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { recommendationId: string; action: "accepted" | "completed" | "dismissed"; outcome?: string }) => {
      const { data, error } = await fromTable("crm_ai_recommendations")
        .update({
          status: params.action,
          action_taken: params.action,
          actioned_at: new Date().toISOString(),
          outcome: params.outcome,
          outcome_measured: params.action === "completed",
        })
        .eq("id", params.recommendationId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-recommendations"] });
    },
  });
}
