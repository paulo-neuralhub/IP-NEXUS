import * as React from "react";
import ReactMarkdown from "react-markdown";
import { Bot, Send, Trash2, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useBackofficeAiAgent } from "@/hooks/backoffice/useBackofficeAiAgent";

export function AiAgentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [input, setInput] = React.useState("");
  const { messages, isSending, send, clear } = useBackofficeAiAgent();

  const endRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, open]);

  const quick = [
    { label: "Resumen ejecutivo", q: "Dame un resumen ejecutivo de hoy (alertas, eventos, salud del sistema)." },
    { label: "Alertas críticas", q: "¿Qué alertas críticas hay activas ahora?" },
    { label: "Buscar organización", q: "Busca organizaciones con nombre parecido a '...'." },
  ];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    send(trimmed);
    setInput("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bot className="h-5 w-5" />
              </span>
              Nexus (Backoffice)
            </DialogTitle>
            <Button type="button" variant="outline" size="sm" onClick={clear}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </DialogHeader>

        <div className="px-4 py-3 border-b flex gap-2 overflow-x-auto">
          {quick.map((q) => (
            <Button
              key={q.label}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => send(q.q)}
              disabled={isSending}
              className="whitespace-nowrap"
            >
              {q.label}
            </Button>
          ))}
        </div>

        <ScrollArea className="h-[55vh] px-4 py-4">
          {messages.length === 0 ? (
            <div className="rounded-xl border bg-card p-4">
              <p className="font-medium text-foreground">¿En qué te ayudo?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Puedo consultar alertas, eventos, organizaciones y tu base de conocimiento interna.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((m, idx) => (
                <div
                  key={`${m.createdAt}-${idx}`}
                  className={cn(
                    "rounded-xl border p-3",
                    m.role === "user" ? "bg-muted/40" : "bg-card"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      {m.role === "user" ? "Tú" : "Nexus"}
                    </p>
                    {m.toolsUsed?.length ? (
                      <div className="flex flex-wrap gap-1 justify-end">
                        {m.toolsUsed.slice(0, 6).map((t) => (
                          <Badge key={t} variant="secondary" className="gap-1">
                            <Wrench className="h-3 w-3" />
                            {t}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {m.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert mt-2">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground mt-2 whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              ))}
              <div ref={endRef} />
            </div>
          )}
        </ScrollArea>

        <form onSubmit={onSubmit} className="p-4 border-t flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta sobre alertas, clientes, eventos…"
            disabled={isSending}
          />
          <Button type="submit" disabled={isSending || !input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
