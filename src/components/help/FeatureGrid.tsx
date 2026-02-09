// ============================================================
// IP-NEXUS HELP — FEATURE GRID
// Tarjetas de funcionalidades con hover premium
// ============================================================

interface Feature {
  emoji: string;
  title: string;
  description: string;
  items?: string[];
  accentColor?: string;
}

interface FeatureGridProps {
  features: Feature[];
  columns?: 2 | 3;
}

export function FeatureGrid({ features, columns = 2 }: FeatureGridProps) {
  return (
    <div className={`grid grid-cols-1 ${columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 my-6`}>
      {features.map((f, i) => (
        <div
          key={i}
          className="group p-5 rounded-2xl bg-background border border-border transition-all duration-300 hover:shadow-lg hover:shadow-muted/40 hover:-translate-y-1 hover:border-border/80"
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
              style={f.accentColor ? { background: `${f.accentColor}10` } : {}}
            >
              {f.emoji}
            </div>
            <h4 className="text-[14px] font-bold text-foreground">{f.title}</h4>
          </div>

          <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">{f.description}</p>

          {f.items && f.items.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-border/50">
              {f.items.map((item, j) => (
                <div key={j} className="flex items-start gap-2.5 text-[12px] text-foreground/70">
                  <div
                    className="w-[6px] h-[6px] rounded-full mt-[5px] flex-shrink-0"
                    style={{ background: f.accentColor || '#0EA5E9' }}
                  />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
