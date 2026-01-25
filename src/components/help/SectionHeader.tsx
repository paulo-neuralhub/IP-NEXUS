// ============================================================
// IP-NEXUS - SECTION HEADER WITH INFO TOOLTIP
// Replaces yellow TIP boxes with inline contextual help
// ============================================================

import { ReactNode } from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  helpText?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Section header with optional info tooltip.
 * Use `helpText` to provide contextual guidance without cluttering the UI.
 */
export function SectionHeader({
  title,
  description,
  helpText,
  icon,
  actions,
  className,
  size = "md",
}: SectionHeaderProps) {
  const titleSizes = {
    sm: "text-sm font-medium",
    md: "text-base font-semibold",
    lg: "text-lg font-bold",
  };

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div className="flex-shrink-0 mt-0.5">{icon}</div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={cn(titleSizes[size], "text-foreground")}>{title}</h3>
            {helpText && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "inline-flex h-5 w-5 items-center justify-center rounded-full",
                        "text-muted-foreground hover:text-primary hover:bg-primary/10",
                        "transition-colors duration-150",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      )}
                      aria-label="Más información"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="right" 
                    className="max-w-xs"
                    sideOffset={8}
                  >
                    <p className="text-xs leading-relaxed">{helpText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex-shrink-0">{actions}</div>
      )}
    </div>
  );
}

/**
 * Inline info icon for use next to any label or title.
 * Lighter alternative when you don't need the full SectionHeader.
 */
export function InlineHelp({ 
  text, 
  side = "top",
  className 
}: { 
  text: string; 
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex h-4 w-4 items-center justify-center rounded-full",
              "text-muted-foreground hover:text-primary",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              className
            )}
            aria-label="Información"
          >
            <Info className="h-3 w-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs" sideOffset={6}>
          <p className="text-xs leading-relaxed">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
