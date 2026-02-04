import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * SILK Design System - Checkbox
 * Checkbox con estilo accent cyan
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // SILK: Checkbox incompleto
      "peer h-[15px] w-[15px] shrink-0 rounded-[5px] border-[1.5px] border-[#94a3b8] bg-transparent ring-offset-background transition-all",
      // SILK: Checkbox completado con glow
      "data-[state=checked]:border-none data-[state=checked]:bg-[#00b4d8] data-[state=checked]:text-white data-[state=checked]:shadow-glow",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="h-2 w-2 stroke-[3]" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
