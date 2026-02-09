// ============================================================
// IP-NEXUS HELP — PIPELINE VISUAL
// Flujos como diagrama profesional (no texto plano)
// ============================================================

interface PipelineStage {
  emoji: string;
  label: string;
}

interface PipelineVisualProps {
  title: string;
  stages: PipelineStage[];
  accentColor?: string;
}

export function PipelineVisual({ title, stages, accentColor = '#0EA5E9' }: PipelineVisualProps) {
  return (
    <div className="my-5 p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-background border border-border">
      <h4 className="text-[12px] font-bold text-muted-foreground uppercase tracking-[0.06em] mb-4">
        {title}
      </h4>
      <div className="flex items-center gap-0 overflow-x-auto pb-1 scrollbar-thin">
        {stages.map((stage, i) => (
          <div key={i} className="flex items-center flex-shrink-0">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background border border-border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-border/80 cursor-default">
              <span className="text-base">{stage.emoji}</span>
              <span className="text-[12px] font-semibold text-foreground whitespace-nowrap">
                {stage.label}
              </span>
            </div>
            {i < stages.length - 1 && (
              <div className="w-8 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
                  <path
                    d="M0 5h16M12 1l4 4-4 4"
                    stroke={accentColor}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.5"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
