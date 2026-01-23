import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { MessageSquare } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BackofficeWhatsAppCommunicationsPage() {
  const query = useQuery({
    queryKey: ["bo-communications", "whatsapp"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communications")
        .select("id, organization_id, channel, direction, subject, body_preview, received_at, created_at")
        .eq("channel", "whatsapp")
        .order("received_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">WhatsApp Soporte</h1>
        <p className="text-sm text-muted-foreground">Vista backoffice (últimas 50)</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Inbox</CardTitle>
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (query.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Sin comunicaciones.</p>
          ) : (
            <div className="divide-y">
              {query.data!.map((c) => (
                <div key={c.id} className="py-3 flex items-start gap-3">
                  <div className="mt-0.5 h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{c.subject || "Mensaje WhatsApp"}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{c.body_preview || "—"}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">Org: {c.organization_id}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {c.received_at || c.created_at
                          ? formatDistanceToNow(new Date(c.received_at || c.created_at), { addSuffix: true, locale: es })
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
