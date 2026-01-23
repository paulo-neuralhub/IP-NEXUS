import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProfessionalCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const paddingClasses: Record<NonNullable<ProfessionalCardProps["padding"]>, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function ProfessionalCard({
  children,
  className,
  padding = "md",
  hover = false,
}: ProfessionalCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-background-card",
        "shadow-sm",
        paddingClasses[padding],
        hover && "transition-shadow hover:shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export function CardHeader({ title, subtitle, icon, actions }: CardHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="truncate text-base font-semibold leading-tight text-foreground">
            {title}
          </div>
          {subtitle && (
            <div className="mt-1 truncate text-sm text-muted-foreground">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
