import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Mail, MessageSquare } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommunication } from "@/hooks/legal-ops/useCommunications";

function iconForChannel(channel?: string | null) {
  if (channel === "email") return Mail;
  if (channel === "whatsapp") return MessageSquare;
  return MessageSquare;
}

export default function CommunicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const query = useCommunication(id || "");

  const CommIcon = iconForChannel(query.data?.channel);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Detalle comunicación</h1>
        <p className="text-sm text-muted-foreground">ID: {id}</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CommIcon className="h-4 w-4" />
            {query.data?.subject || (query.data?.channel === "whatsapp" ? "Mensaje WhatsApp" : "(sin asunto)")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : query.data ? (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">
                <span className="mr-3">Canal: {query.data.channel}</span>
                <span className="mr-3">Dirección: {query.data.direction}</span>
                <span>
                  Fecha: {query.data.received_at ? format(new Date(query.data.received_at), "PPPp", { locale: es }) : "—"}
                </span>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{query.data.body || query.data.body_preview || "—"}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No encontrada.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
