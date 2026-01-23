import * as React from "react";
import { cn } from "@/lib/utils";

export interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "call" | "email" | "whatsapp" | "default";
  icon?: React.ReactNode;
}

const variantClasses: Record<ActionButtonProps["variant"], string> = {
  call: "ip-btn-call",
  email: "ip-btn-email",
  whatsapp: "ip-btn-whatsapp",
  default: "bg-muted text-muted-foreground hover:bg-muted/80",
};

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ variant, icon, children, className, disabled, type, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "rounded-lg px-3 py-2 text-sm font-medium",
          "transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        {icon}
        {children}
      </button>
    );
  },
);

ActionButton.displayName = "ActionButton";
