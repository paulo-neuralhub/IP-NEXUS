import { Link } from "react-router-dom";
import { Mail, MessageSquare } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CommunicationsTemplatesPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> WhatsApp Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Gestión de templates (tabla: <span className="font-mono">crm_whatsapp_templates</span>).
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Siguiente: listar templates, estado (approved/pending), variables y botón “Sincronizar con Meta”.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" /> Email Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Gestión de templates (tabla: <span className="font-mono">crm_email_templates</span>).
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Mientras tanto, puedes usar el envío desde CRM (contacto/deal) y los templates existentes.
          </p>
          <Link className="text-sm underline mt-3 inline-block" to="/app/crm/contacts">
            Ir a CRM → Contactos
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
