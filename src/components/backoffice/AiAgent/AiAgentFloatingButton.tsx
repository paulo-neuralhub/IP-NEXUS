import * as React from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AiAgentDialog } from "@/components/backoffice/AiAgent/AiAgentDialog";

export function AiAgentFloatingButton() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-2xl p-0 shadow-lg"
        aria-label="Abrir Nexus (Backoffice)"
      >
        <Sparkles className="h-5 w-5" />
      </Button>
      <AiAgentDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
