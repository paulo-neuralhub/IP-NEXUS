import * as React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses: Record<NonNullable<PageContainerProps["padding"]>, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function PageContainer({ children, className, padding = "lg" }: PageContainerProps) {
  return (
    <div className={cn("w-full max-w-7xl", paddingClasses[padding], className)}>
      {children}
    </div>
  );
}
