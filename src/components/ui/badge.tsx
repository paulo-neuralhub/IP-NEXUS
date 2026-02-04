import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * SILK Design System - Badge
 * Firma visual neumórfica de IP-NEXUS
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        outline: "text-foreground border-border",
        // SILK: Badge neumórfico (firma visual) - bg #f1f4f9
        neu: "border-none bg-[#f1f4f9] shadow-neu relative overflow-hidden",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs font-semibold rounded-full",
        sm: "px-2 py-0.5 text-[10px] font-semibold rounded-full",
        lg: "px-3 py-1 text-sm font-semibold rounded-full",
        // SILK: Tamaños neumórficos cuadrados
        "neu-sm": "w-[34px] h-[34px] rounded-[10px] text-xs",
        "neu-md": "w-[46px] h-[46px] rounded-xl text-base",
        "neu-lg": "w-[54px] h-[54px] rounded-[14px] text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  /** Color del estado para badges neumórficos (hex) */
  stateColor?: string;
  /** Label inferior para badges neumórficos */
  label?: string;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, stateColor, label, children, ...props }, ref) => {
    const isNeu = variant === "neu";
    
    return (
      <div 
        ref={ref} 
        className={cn(badgeVariants({ variant, size }), className)} 
        {...props}
      >
        {isNeu ? (
          <>
            {/* Número con peso ultralight */}
            <span 
              className="relative z-10 font-extralight leading-none"
              style={{ color: stateColor }}
            >
              {children}
            </span>
            {label && (
              <span className="absolute bottom-[30%] text-[7px] text-[#94a3b8] z-10">
                {label}
              </span>
            )}
            {/* Gradiente inferior decorativo */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-[45%] pointer-events-none"
              style={{ 
                background: stateColor 
                  ? `linear-gradient(to top, ${stateColor}0c, transparent)` 
                  : undefined 
              }}
            />
            {/* Línea de color inferior */}
            <div 
              className="absolute bottom-0 left-[18%] right-[18%] h-0.5 rounded-full opacity-25"
              style={{ 
                backgroundColor: stateColor,
                boxShadow: stateColor ? `0 0 5px ${stateColor}30` : undefined
              }}
            />
          </>
        ) : (
          children
        )}
      </div>
    );
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
