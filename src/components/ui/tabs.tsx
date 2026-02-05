import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

/**
 * SILK Design System - Neumorphic Tabs
 * Inset container with elevated active state + accent line
 */
const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // SILK: Neumorphic inset container
      "inline-flex items-center justify-center gap-[3px] p-[3px] rounded-[11px]",
      className,
    )}
    style={{
      background: '#f1f4f9',
      boxShadow: 'inset 2px 2px 5px #cdd1dc, inset -2px -2px 5px #ffffff',
    }}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    accentColor?: string;
  }
>(({ className, accentColor = '#00b4d8', children, ...props }, ref) => {
  const [isActive, setIsActive] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  // Sync active state via data attribute
  React.useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const observer = new MutationObserver(() => {
      setIsActive(el.getAttribute('data-state') === 'active');
    });
    observer.observe(el, { attributes: true, attributeFilter: ['data-state'] });
    setIsActive(el.getAttribute('data-state') === 'active');
    return () => observer.disconnect();
  }, []);

  return (
    <TabsPrimitive.Trigger
      ref={(node) => {
        triggerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      className={cn(
        // SILK: Base tab styling
        "relative inline-flex items-center justify-center whitespace-nowrap px-[15px] py-[7px] rounded-[9px] text-xs font-semibold transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      style={{
        background: isActive ? '#f1f4f9' : 'transparent',
        boxShadow: isActive 
          ? '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff' 
          : 'none',
        color: isActive ? '#0a2540' : '#94a3b8',
      }}
      {...props}
    >
      {children}
      {/* SILK: Accent line for active tab */}
      <span 
        style={{
          position: 'absolute',
          bottom: '4px',
          left: '30%',
          right: '30%',
          height: '2px',
          background: accentColor,
          borderRadius: '2px',
          opacity: isActive ? 1 : 0,
          transition: 'opacity 0.2s ease',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
    </TabsPrimitive.Trigger>
  );
});
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
