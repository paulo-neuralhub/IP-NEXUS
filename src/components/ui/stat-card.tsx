import * as React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  emoji?: string;
  variant: "blue" | "emerald" | "purple" | "orange";
  change?: string;
  className?: string;
}

const variantClasses: Record<StatCardProps["variant"], string> = {
  blue: "ip-stat-blue",
  emerald: "ip-stat-emerald",
  purple: "ip-stat-purple",
  orange: "ip-stat-orange",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  emoji,
  variant,
  change,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-5 shadow-sm",
        "text-primary-foreground",
        variantClasses[variant],
        className,
      )}
    >
      {/* Background icon/emoji */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute right-4 top-4",
          "text-primary-foreground/25",
        )}
      >
        {emoji ? (
          <span className="text-3xl leading-none">{emoji}</span>
        ) : Icon ? (
          <Icon className="h-10 w-10" />
        ) : null}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        <div className="mt-1 text-sm text-primary-foreground/85">{label}</div>

        {change && (
          <div className="mt-3 inline-flex rounded-full bg-primary-foreground/15 px-2.5 py-1 text-xs font-medium text-primary-foreground/90">
            {change}
          </div>
        )}
      </div>
    </div>
  );
}
