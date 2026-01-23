import * as React from "react";
import { cn } from "@/lib/utils";

export interface ColorTagProps {
  children: React.ReactNode;
  variant?:
    | "blue"
    | "purple"
    | "emerald"
    | "rose"
    | "amber"
    | "gray"
    | "teal"
    | "indigo";
  className?: string;
}

const variantClasses: Record<NonNullable<ColorTagProps["variant"]>, string> = {
  // Use existing semantic/module tokens (HSL) instead of hardcoded palette
  blue: "bg-module-dashboard/10 text-module-dashboard",
  purple: "bg-module-spider/10 text-module-spider",
  emerald: "bg-module-market/10 text-module-market",
  rose: "bg-module-crm/10 text-module-crm",
  amber: "bg-module-genius/10 text-module-genius",
  teal: "bg-module-finance/10 text-module-finance",
  indigo: "bg-primary/10 text-primary",
  gray: "bg-muted text-muted-foreground",
};

export function ColorTag({ children, variant = "blue", className }: ColorTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
