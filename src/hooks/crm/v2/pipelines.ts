import { useQuery } from "@tanstack/react-query";
import { fromTable } from "@/lib/supabase";
import { useOrganization } from "@/hooks/useOrganization";

export type CRMPipelineStage = {
  id: string;
  pipeline_id: string;
  name: string;
  color: string;
  probability: number;
  position: number;
  is_won_stage?: boolean | null;
  is_lost_stage?: boolean | null;
};

export type CRMPipeline = {
  id: string;
  name: string;
  is_default: boolean;
  position: number;
  stages?: CRMPipelineStage[];
};

export function useCRMPipelines() {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["crm-pipelines", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await fromTable("pipelines")
        .select(
          `id, name, is_default, position,
           stages:pipeline_stages(id, pipeline_id, name, color, probability, position, is_won_stage, is_lost_stage)
          `
        )
        .eq("organization_id", organizationId)
        .eq("owner_type", "tenant")
        .order("position", { ascending: true });

      if (error) throw error;

      const rows = (data ?? []) as CRMPipeline[];
      return rows.map((p) => ({
        ...p,
        stages: (p.stages ?? []).slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
      }));
    },
    enabled: !!organizationId,
  });
}

export function useDefaultCRMPipeline() {
  const { data: pipelines = [], ...rest } = useCRMPipelines();
  const defaultPipeline = pipelines.find((p) => p.is_default) ?? pipelines[0];
  return { data: defaultPipeline, ...rest };
}
