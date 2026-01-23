import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Mail, MessageSquare, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { useCommunications, useToggleStar } from "@/hooks/legal-ops/useCommunications";
import type { CommChannel, Communication } from "@/types/legal-ops";

type Props = {
  title: string;
  channel?: CommChannel;
  basePath: string;
};

function channelIcon(channel: CommChannel | string) {
  if (channel === "email") return Mail;
  if (channel === "whatsapp") return MessageSquare;
  return MessageSquare;
}

export function CommunicationsList({ title, channel, basePath }: Props) {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useCommunications(
    {
      channel,
      search: search.trim() ? search.trim() : undefined,
      is_read: undefined,
    },
    1,
    50
  );

  const toggleStar = useToggleStar();

  const rows = useMemo(() => data?.data ?? [], [data?.data]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">Bandeja unificada (tabla: communications)</p>
        </div>
        <div className="w-[320px] max-w-full">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por asunto o contenido..."
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Últimas comunicaciones</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay comunicaciones.</p>
          ) : (
            <div className="divide-y">
              {rows.map((c) => {
                const CommIcon = channelIcon(c.channel);
                const when = c.received_at || c.created_at;
                return (
                  <div key={c.id} className="py-3 flex items-start gap-3">
                    <div className={cn(
                      "mt-0.5 h-9 w-9 rounded-lg flex items-center justify-center",
                      "bg-muted text-foreground"
                    )}>
                      <CommIcon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            to={`${basePath}/${c.id}`}
                            className={cn(
                              "block font-medium truncate",
                              c.is_read ? "text-foreground" : "text-foreground"
                            )}
                          >
                            {c.subject || (c.channel === "whatsapp" ? "Mensaje WhatsApp" : "(sin asunto)")}
                          </Link>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {c.body_preview || c.body || "—"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleStar.mutate({ id: c.id, is_starred: !c.is_starred })}
                            disabled={toggleStar.isPending}
                            aria-label={c.is_starred ? "Quitar estrella" : "Marcar con estrella"}
                          >
                            <Star className={cn("h-4 w-4", c.is_starred && "fill-current")} />
                          </Button>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {when
                              ? formatDistanceToNow(new Date(when), { addSuffix: true, locale: es })
                              : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
