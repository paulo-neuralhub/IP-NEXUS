import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

/**
 * SILK Design System - Tabs
 * Tabs neumórficos con línea accent
 */
const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // SILK: Contenedor neumórfico inset
      "inline-flex items-center justify-center gap-[3px] p-[3px] rounded-[11px] bg-background shadow-neu-inset",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // SILK: Tab inactivo
      "relative inline-flex items-center justify-center whitespace-nowrap px-[15px] py-[7px] rounded-[9px] text-xs font-semibold text-[#94a3b8] bg-transparent ring-offset-background transition-all",
      // SILK: Tab activo neumórfico con línea accent
      "data-[state=active]:bg-background data-[state=active]:text-[#0a2540] data-[state=active]:shadow-neu-sm",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {props.children}
    {/* SILK: Línea accent inferior para tab activo */}
    <span 
      className="absolute bottom-[1px] left-[30%] right-[30%] h-0.5 rounded-full bg-[#00b4d8] opacity-0 data-[state=active]:opacity-100 transition-opacity pointer-events-none"
      aria-hidden="true"
    />
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-[18px] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
