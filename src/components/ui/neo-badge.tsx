/**
 * ═══════════════════════════════════════════════════════════════
 * IP-NEXUS SILK DESIGN SYSTEM — NeoBadge
 * Firma visual neumórfica para indicadores numéricos
 * 
 * USO:
 * <NeoBadge value={16} color="#ef4444" size="md" />
 * <NeoBadge value="F3" color="#3b82f6" size="sm" label="días" />
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface NeoBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The value to display (number, string like "F3", percentage) */
  value: string | number;
  /** State color in hex format */
  color?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Optional small label below the value */
  label?: string;
  /** Whether this badge is in an active/selected state */
  active?: boolean;
}

const sizeClasses = {
  sm: "w-[34px] h-[34px] rounded-[10px] text-sm",
  md: "w-[46px] h-[46px] rounded-xl text-lg",
  lg: "w-[54px] h-[54px] rounded-[14px] text-xl",
};

const labelSizes = {
  sm: "text-[6px]",
  md: "text-[7px]",
  lg: "text-[8px]",
};

export const NeoBadge = React.forwardRef<HTMLDivElement, NeoBadgeProps>(
  ({ value, color = "#64748b", size = "md", label, active, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "relative inline-flex flex-col items-center justify-center overflow-hidden",
          "bg-[#f1f4f9] shadow-neu",
          sizeClasses[size],
          // Active state
          active && "ring-2 ring-primary ring-offset-1",
          className
        )}
        {...props}
      >
        {/* Value with ultra-light weight */}
        <span
          className="relative z-10 font-extralight leading-none"
          style={{ color }}
        >
          {value}
        </span>

        {/* Optional label */}
        {label && (
          <span
            className={cn(
              "absolute z-10 text-[#94a3b8]",
              labelSizes[size],
              size === "sm" ? "bottom-[20%]" : "bottom-[25%]"
            )}
          >
            {label}
          </span>
        )}

        {/* Gradient decoration (45% from bottom) */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[45%] pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${color}0c, transparent)`,
          }}
        />

        {/* Bottom color line (18% from each side) */}
        <div
          className="absolute bottom-0 left-[18%] right-[18%] h-0.5 rounded-full"
          style={{
            backgroundColor: color,
            opacity: 0.25,
            boxShadow: `0 0 5px ${color}30`,
          }}
        />
      </div>
    );
  }
);

NeoBadge.displayName = "NeoBadge";

/**
 * NeoBadgeInline - Versión inline para fases (F1, F2, etc.)
 * Más pequeño, para usar inline con texto
 */
export interface NeoBadgeInlineProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: string | number;
  color?: string;
}

export const NeoBadgeInline = React.forwardRef<HTMLSpanElement, NeoBadgeInlineProps>(
  ({ value, color = "#64748b", className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden",
          "bg-[#f1f4f9] shadow-neu-sm",
          "w-[28px] h-[28px] rounded-lg text-xs",
          className
        )}
        {...props}
      >
        <span
          className="relative z-10 font-extralight leading-none"
          style={{ color }}
        >
          {value}
        </span>

        {/* Bottom color line */}
        <span
          className="absolute bottom-0 left-[20%] right-[20%] h-[2px] rounded-full"
          style={{
            backgroundColor: color,
            opacity: 0.25,
          }}
        />
      </span>
    );
  }
);

NeoBadgeInline.displayName = "NeoBadgeInline";

export default NeoBadge;
