import * as React from "react";

interface DateSeparatorProps {
  date: string;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="my-4 flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <div className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        {date}
      </div>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
