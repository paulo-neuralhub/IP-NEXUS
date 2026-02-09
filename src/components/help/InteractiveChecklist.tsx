// ============================================================
// IP-NEXUS HELP — INTERACTIVE CHECKLIST
// Para Getting Started con barra de progreso
// ============================================================

import { useState } from 'react';
import { Link } from 'react-router-dom';

interface ChecklistItem {
  label: string;
  description?: string;
  link?: string;
}

interface InteractiveChecklistProps {
  items: ChecklistItem[];
}

export function InteractiveChecklist({ items }: InteractiveChecklistProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const progress = items.length > 0 ? (checked.size / items.length) * 100 : 0;

  return (
    <div className="my-6">
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[12px] font-bold text-muted-foreground tabular-nums">
          {checked.size}/{items.length}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {items.map((item, i) => {
          const isChecked = checked.has(i);
          const content = (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                isChecked
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 shadow-sm'
                  : 'bg-background border-border hover:border-border/80 hover:shadow-sm'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200 ${
                  isChecked
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-muted-foreground/30'
                }`}
              >
                {isChecked && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 6l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <span
                  className={`text-sm font-semibold block ${
                    isChecked ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-foreground'
                  }`}
                >
                  {item.label}
                </span>
                {item.description && (
                  <span className="text-xs text-muted-foreground mt-0.5 block">{item.description}</span>
                )}
              </div>
            </button>
          );

          if (item.link) {
            return (
              <div key={i} className="relative">
                {content}
                <Link
                  to={item.link}
                  className="absolute top-4 right-4 text-[10px] text-primary font-semibold hover:underline"
                >
                  Ver guía →
                </Link>
              </div>
            );
          }
          return content;
        })}
      </div>

      {/* Completion message */}
      {progress === 100 && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border border-emerald-100 dark:border-emerald-800/50 text-center">
          <span className="text-2xl block mb-1">🎉</span>
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
            ¡Todo listo! Ya dominas los básicos de IP-NEXUS
          </span>
        </div>
      )}
    </div>
  );
}
