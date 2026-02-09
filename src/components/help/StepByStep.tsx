// ============================================================
// IP-NEXUS HELP — STEP BY STEP PREMIUM
// Pasos numerados con ilustraciones y callouts inline
// ============================================================

import type { ReactNode } from 'react';

export interface StepItem {
  title: string;
  description: string | ReactNode;
  illustration?: ReactNode;
  tip?: string;
  warning?: string;
  note?: string;
}

interface StepByStepProps {
  steps: StepItem[];
  accentColor?: string;
}

export function StepByStep({ steps, accentColor = '#0EA5E9' }: StepByStepProps) {
  return (
    <div className="my-8 space-y-0">
      {steps.map((step, i) => (
        <div key={i} className="relative pl-16 pb-10 last:pb-0 group">
          {/* Connector line */}
          {i < steps.length - 1 && (
            <div
              className="absolute left-[22px] top-[48px] bottom-0 w-[2px]"
              style={{
                background: `linear-gradient(to bottom, ${accentColor}40, ${accentColor}10, transparent)`,
              }}
            />
          )}

          {/* Step number */}
          <div
            className="absolute left-0 top-0 w-[44px] h-[44px] rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
              boxShadow: `0 4px 14px ${accentColor}30`,
            }}
          >
            <span className="text-[14px] font-bold text-white">{i + 1}</span>
          </div>

          {/* Content */}
          <div className="pt-1">
            <h4 className="text-[16px] font-bold text-foreground mb-2">{step.title}</h4>

            {typeof step.description === 'string' ? (
              <p className="text-[14px] text-muted-foreground leading-[1.7]">{step.description}</p>
            ) : (
              <div className="text-[14px] text-muted-foreground leading-[1.7]">{step.description}</div>
            )}

            {/* Illustration / UI Mockup */}
            {step.illustration && (
              <div className="mt-4 rounded-xl overflow-hidden border border-border shadow-sm transition-shadow hover:shadow-md">
                <div className="bg-muted px-4 py-2.5 flex items-center gap-2 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]" />
                    <div className="w-[10px] h-[10px] rounded-full bg-[#FFBD2E]" />
                    <div className="w-[10px] h-[10px] rounded-full bg-[#28CA41]" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-background rounded-md px-4 py-1 text-[10px] text-muted-foreground border border-border font-mono">
                      app.ip-nexus.com
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-b from-muted/30 to-background p-6">
                  {step.illustration}
                </div>
              </div>
            )}

            {/* Tip */}
            {step.tip && (
              <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">💡</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.08em]">
                    Consejo
                  </span>
                  <p className="text-[13px] text-emerald-800 dark:text-emerald-300 mt-0.5 leading-relaxed">
                    {step.tip}
                  </p>
                </div>
              </div>
            )}

            {/* Warning */}
            {step.warning && (
              <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">⚠️</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-[0.08em]">
                    Importante
                  </span>
                  <p className="text-[13px] text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                    {step.warning}
                  </p>
                </div>
              </div>
            )}

            {/* Note */}
            {step.note && (
              <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">ℹ️</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-[0.08em]">
                    Nota
                  </span>
                  <p className="text-[13px] text-blue-800 dark:text-blue-300 mt-0.5 leading-relaxed">
                    {step.note}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
