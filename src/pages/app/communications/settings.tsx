import { Link } from "react-router-dom";
import { ExternalLink, MessageSquare, Mail } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CommunicationsSettingsPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Configuración de canales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Para evitar duplicados, la configuración se centraliza en <span className="font-mono">Ajustes → Integraciones</span>.
            Aquí vamos a consolidar el selector A/B (Business API vs Web QR) y los estados de conexión.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/app/settings#integrations">
                <ExternalLink className="h-4 w-4 mr-2" /> Abrir Integraciones
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/app/settings#whatsapp">
                <MessageSquare className="h-4 w-4 mr-2" /> WhatsApp (Meta)
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/app/settings#email">
                <Mail className="h-4 w-4 mr-2" /> Email (SMTP)
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">WhatsApp Web QR (Opción B)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Preparación UI/DB: usaremos <span className="font-mono">whatsapp_sessions</span> para almacenar estado y consentimiento.
            La conexión real requiere un servicio externo (n8n/whatsapp-web.js) + webhooks.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
