// ============================================================
// IP-NEXUS HELP — INFO CALLOUT PREMIUM (6 variantes)
// ============================================================

import type { ReactNode } from 'react';

type CalloutType = 'info' | 'tip' | 'warning' | 'danger' | 'note' | 'success';

const styles: Record<CalloutType, {
  bg: string; border: string; iconBg: string; emoji: string;
  label: string; labelColor: string; textColor: string;
}> = {
  info:    { bg: 'bg-sky-50/60 dark:bg-sky-950/30',     border: 'border-sky-200/50 dark:border-sky-800/40',     iconBg: 'bg-sky-100 dark:bg-sky-900/50',     emoji: 'ℹ️',  label: 'Información',  labelColor: 'text-sky-700 dark:text-sky-400',     textColor: 'text-sky-900 dark:text-sky-200' },
  tip:     { bg: 'bg-emerald-50/60 dark:bg-emerald-950/30', border: 'border-emerald-200/50 dark:border-emerald-800/40', iconBg: 'bg-emerald-100 dark:bg-emerald-900/50', emoji: '💡', label: 'Consejo Pro', labelColor: 'text-emerald-700 dark:text-emerald-400', textColor: 'text-emerald-900 dark:text-emerald-200' },
  warning: { bg: 'bg-amber-50/60 dark:bg-amber-950/30',   border: 'border-amber-200/50 dark:border-amber-800/40',   iconBg: 'bg-amber-100 dark:bg-amber-900/50',   emoji: '⚠️', label: 'Importante',  labelColor: 'text-amber-700 dark:text-amber-400',   textColor: 'text-amber-900 dark:text-amber-200' },
  danger:  { bg: 'bg-rose-50/60 dark:bg-rose-950/30',     border: 'border-rose-200/50 dark:border-rose-800/40',     iconBg: 'bg-rose-100 dark:bg-rose-900/50',     emoji: '🚨', label: 'Atención',    labelColor: 'text-rose-700 dark:text-rose-400',     textColor: 'text-rose-900 dark:text-rose-200' },
  note:    { bg: 'bg-muted/60',                            border: 'border-border',                                    iconBg: 'bg-muted',                              emoji: '📝', label: 'Nota',        labelColor: 'text-muted-foreground',                 textColor: 'text-foreground/80' },
  success: { bg: 'bg-green-50/60 dark:bg-green-950/30',   border: 'border-green-200/50 dark:border-green-800/40',   iconBg: 'bg-green-100 dark:bg-green-900/50',   emoji: '✅', label: 'Completado',  labelColor: 'text-green-700 dark:text-green-400',   textColor: 'text-green-900 dark:text-green-200' },
};

interface InfoCalloutProps {
  type: CalloutType;
  title?: string;
  children: ReactNode;
}

export function InfoCallout({ type, title, children }: InfoCalloutProps) {
  const s = styles[type];
  return (
    <div className={`flex items-start gap-3.5 p-5 rounded-2xl ${s.bg} border ${s.border} my-6 transition-all duration-200 hover:shadow-sm`}>
      <div className={`w-8 h-8 rounded-xl ${s.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <span className="text-base">{s.emoji}</span>
      </div>
      <div className="flex-1 min-w-0">
        <span className={`text-[10px] font-bold ${s.labelColor} uppercase tracking-[0.08em] block mb-1`}>
          {title || s.label}
        </span>
        <div className={`text-[13px] ${s.textColor} leading-relaxed`}>{children}</div>
      </div>
    </div>
  );
}
