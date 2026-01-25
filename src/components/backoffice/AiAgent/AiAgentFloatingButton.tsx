import * as React from "react";
import { Bot, MessageSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AiAgentDialog } from "@/components/backoffice/AiAgent/AiAgentDialog";
import { useActiveBackofficeAlertsCount } from "@/hooks/backoffice/useBackofficeAlerts";

export function AiAgentFloatingButton() {
  const [open, setOpen] = React.useState(false);
  const { data: alertsCount = 0 } = useActiveBackofficeAlertsCount();

  // Keyboard shortcut: Cmd/Ctrl + K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-24 z-40 h-14 w-14 rounded-2xl p-0 shadow-lg",
          "bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
          "transition-all duration-200 hover:scale-105 active:scale-95"
        )}
        aria-label="Abrir Nexus Assistant (⌘K)"
      >
        <span className="relative inline-flex">
          <Bot className="h-6 w-6" />
          {alertsCount > 0 && (
            <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground animate-pulse">
              {alertsCount > 9 ? "9+" : alertsCount}
            </span>
          )}
        </span>
      </Button>

      {/* Keyboard hint tooltip */}
      <div className="fixed bottom-6 right-[5.5rem] z-40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md">
          ⌘K para abrir
        </div>
      </div>

      <AiAgentDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
