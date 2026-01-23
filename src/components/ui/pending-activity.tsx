import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Clock } from "lucide-react";

interface PendingActivityProps {
  title: string;
  dueDate: string;
  isUrgent?: boolean;
  onComplete?: () => void;
}

export function PendingActivity({
  title,
  dueDate,
  isUrgent = false,
  onComplete,
}: PendingActivityProps) {
  return (
    <div
      className={cn(
        "group flex items-start justify-between gap-3 rounded-xl border p-4",
        "ip-pending-section",
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-background-card/70">
          <Clock className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="truncate font-semibold">{title}</div>
          <div className="mt-1 flex items-center gap-2 text-xs opacity-90">
            <span className="truncate">{dueDate}</span>
            {isUrgent && (
              <span className="rounded-full border border-current/25 bg-background-card/60 px-2 py-0.5 text-[10px] font-semibold">
                Urgente
              </span>
            )}
          </div>
        </div>
      </div>

      {onComplete && (
        <button
          type="button"
          onClick={onComplete}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-lg",
            "bg-background-card/70 text-foreground",
            "opacity-0 transition-opacity group-hover:opacity-100",
            "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
          aria-label="Marcar como completada"
        >
          <Check className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
