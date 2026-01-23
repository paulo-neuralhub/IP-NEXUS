import * as React from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface VipBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

export function VipBadge({ className, size = "sm" }: VipBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        "bg-[hsl(var(--ip-badge-vip-bg))] text-[hsl(var(--ip-badge-vip-text))]",
        size === "sm" && "px-2 py-0.5 text-[10px]",
        size === "md" && "px-3 py-1 text-xs",
        className,
      )}
    >
      <Star
        className={cn(
          "text-[hsl(var(--ip-badge-vip-text))]",
          "fill-current",
          size === "sm" && "h-3 w-3",
          size === "md" && "h-3.5 w-3.5",
        )}
      />
      VIP
    </span>
  );
}
