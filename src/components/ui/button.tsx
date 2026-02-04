import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * SILK Design System - Button
 * Botones con gradiente accent y variante neumórfica
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // SILK: Botón primario con gradiente cyan-teal
        default: "relative bg-gradient-to-br from-[#00b4d8] to-[#00d4aa] text-white font-semibold shadow-accent rounded-[11px] overflow-hidden",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-[11px]",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-[11px]",
        // SILK: Botón secundario neumórfico
        secondary: "bg-background text-[#64748b] font-normal shadow-neu-sm rounded-[11px]",
        ghost: "hover:bg-accent hover:text-accent-foreground rounded-[11px]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 text-[13px]",
        sm: "h-9 px-3 text-[13px]",
        lg: "h-11 px-8 text-[13px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const isPrimary = variant === "default" || variant === undefined;
    
    return (
      <Comp 
        className={cn(buttonVariants({ variant, size, className }))} 
        ref={ref} 
        {...props}
      >
        {children}
        {/* SILK: Línea decorativa blanca inferior para botón primario */}
        {isPrimary && (
          <span 
            className="absolute bottom-0 left-[22%] right-[22%] h-0.5 bg-white/40 rounded-full pointer-events-none"
            aria-hidden="true"
          />
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
