import * as React from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AiAgentDialog } from "@/components/backoffice/AiAgent/AiAgentDialog";
import { useActiveBackofficeAlertsCount } from "@/hooks/backoffice/useBackofficeAlerts";

export function AiAgentFloatingButton() {
  const [open, setOpen] = React.useState(false);
  const { data: alertsCount = 0 } = useActiveBackofficeAlertsCount();

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-2xl p-0 shadow-lg"
        aria-label="Abrir Nexus (Backoffice)"
      >
        <span className="relative inline-flex">
          <Sparkles className="h-5 w-5" />
          {alertsCount > 0 ? (
            <span className="absolute -right-3 -top-3 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground">
              {alertsCount}
            </span>
          ) : null}
        </span>
      </Button>
      <AiAgentDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
