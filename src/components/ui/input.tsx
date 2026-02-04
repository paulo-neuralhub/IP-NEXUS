import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * SILK Design System - Input
 * Input sin sombra, borde sutil
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // SILK: Input de búsqueda
          "flex h-10 w-full rounded-[9px] border border-black/[0.06] bg-background px-[13px] py-[7px] text-xs text-[#94a3b8] ring-offset-background transition-colors",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-[#94a3b8]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Sin sombra
          "shadow-none",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
