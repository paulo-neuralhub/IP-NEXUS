import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

/**
 * SILK Design System - Progress
 * Barra de progreso sin sombra inset
 */
export interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** Color del estado (hex) para el relleno */
  stateColor?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, stateColor, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      // SILK: Contenedor sin sombra inset
      "relative h-1 w-full overflow-hidden rounded-[3px] bg-black/[0.04]",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 rounded-[3px] transition-all"
      style={{ 
        transform: `translateX(-${100 - (value || 0)}%)`,
        // SILK: Gradiente con glow sutil
        background: stateColor 
          ? `linear-gradient(90deg, ${stateColor}, ${stateColor}88)` 
          : 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.53))',
        boxShadow: stateColor 
          ? `0 0 4px ${stateColor}18` 
          : '0 0 4px hsl(var(--primary) / 0.1)',
      }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
