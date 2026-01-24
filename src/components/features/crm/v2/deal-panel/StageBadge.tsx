import { Badge } from "@/components/ui/badge";
import type { CRMPipelineStage } from "@/hooks/crm/v2/pipelines";
import { hexToHSL } from "@/hooks/use-branding";

type Props = {
  label: string;
  stage?: CRMPipelineStage | null;
};

function stageVariant(stage?: CRMPipelineStage | null) {
  if (stage?.is_won_stage) return "default" as const;
  if (stage?.is_lost_stage) return "destructive" as const;
  return "secondary" as const;
}

export function StageBadge({ label, stage }: Props) {
  const colorHex = stage?.color;
  const hsl = colorHex ? hexToHSL(colorHex) : null;

  return (
    <Badge variant={stageVariant(stage)} className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className="h-2.5 w-2.5 rounded-full ring-1 ring-border"
        style={hsl ? { backgroundColor: `hsl(${hsl})` } : undefined}
      />
      <span className="truncate">{label}</span>
    </Badge>
  );
}
