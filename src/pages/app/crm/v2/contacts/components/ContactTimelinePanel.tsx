import * as React from "react";
import { ProfessionalCard, CardHeader } from "@/components/ui/professional-card";
import { PendingActivity } from "@/components/ui/pending-activity";
import { CommunicationHistory } from "@/components/features/crm/v2";

export interface ContactTimelinePanelProps {
  contactId: string;
  organizationId: string;
}

export function ContactTimelinePanel({ contactId, organizationId }: ContactTimelinePanelProps) {
  return (
    <div className="space-y-4">
      <ProfessionalCard padding="md">
        <CardHeader title="⚡ Pendientes" subtitle="Próximas acciones" />
        <div className="space-y-3">
          <PendingActivity title="Enviar propuesta" dueDate="Hoy" isUrgent />
          <PendingActivity title="Llamada de seguimiento" dueDate="Mañana" />
        </div>
      </ProfessionalCard>

      <CommunicationHistory contactId={contactId} organizationId={organizationId} maxHeight="520px" />
    </div>
  );
}
