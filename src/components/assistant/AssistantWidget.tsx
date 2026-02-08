import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useCreateCheckout } from '@/hooks/use-stripe-billing';
import { useQuery } from '@tanstack/react-query';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

function useGeniusPriceId() {
  return useQuery({
    queryKey: ['genius-price-id'],
    queryFn: async () => {
      // Look for a product tagged as genius in stripe_products
      const { data: products } = await supabase
        .from('stripe_products')
        .select('stripe_product_id, name, metadata')
        .eq('active', true);

      const geniusProduct = (products ?? []).find(
        (p: any) =>
          p.name?.toLowerCase().includes('genius') ||
          (p.metadata as any)?.module === 'genius'
      );

      if (!geniusProduct) return null;

      const { data: prices } = await supabase
        .from('stripe_prices')
        .select('stripe_price_id, recurring_interval')
        .eq('stripe_product_id', geniusProduct.stripe_product_id)
        .eq('active', true)
        .eq('recurring_interval', 'month')
        .limit(1);

      return prices?.[0]?.stripe_price_id ?? null;
    },
    staleTime: 1000 * 60 * 30,
  });
}

function monthStartISO(d: Date) {
  const ms = new Date(d.getFullYear(), d.getMonth(), 1);
  return ms.toISOString().slice(0, 10);
}

export function AssistantWidget() {
  const location = useLocation();
  const createCheckout = useCreateCheckout();
  const { data: geniusPriceId } = useGeniusPriceId();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hola, soy el Asistente IP-NEXUS. Puedo ayudarte con dudas generales de PI y con cómo usar la plataforma. ¿Qué necesitas?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [usage, setUsage] = useState<{ used: number; limit: number | null; remaining: number | null } | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const currentPath = location.pathname + location.search;
  const context = useMemo(() => {
    // Minimal context to avoid leaking data: only route info.
    return `Pantalla actual: ${currentPath}`;
  }, [currentPath]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    // Load remaining queries (best-effort) from DB.
    let cancelled = false;
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: cfg } = await supabase
          .from('ai_module_config')
          .select('monthly_limit')
          .eq('module_code', 'assistant')
          .single();

        const limit = (cfg?.monthly_limit ?? 50) as number | null;
        const periodStart = monthStartISO(new Date());
        const { data: u } = await supabase
          .from('ai_module_usage')
          .select('usage_count')
          .eq('user_id', user.id)
          .eq('module_code', 'assistant')
          .eq('period_start', periodStart)
          .maybeSingle();

        const used = u?.usage_count ?? 0;
        const remaining = limit == null ? null : Math.max(limit - used, 0);
        if (!cancelled) {
          setUsage({ used, limit, remaining });
          setLimitReached(limit != null && remaining === 0);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpgrade = () => {
    if (!geniusPriceId) return;
    createCheckout.mutate({
      priceId: geniusPriceId,
      successUrl: `${window.location.origin}/app/genius?upgraded=true`,
      cancelUrl: `${window.location.origin}${currentPath}`,
    });
  };

  const send = async () => {
    if (!input.trim() || isSending || limitReached) return;
    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    setInput('');
    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const normalized = userMsg.content.toLowerCase();
      const faqHit = getFaqResponse(normalized);
      if (faqHit) {
        setMessages((prev) => [...prev, { role: 'assistant', content: faqHit }]);
        setIsSending(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('assistant-widget-chat', {
        body: {
          messages: [...messages.filter((m) => m.role !== 'assistant' || m.content !== ''), userMsg],
          currentPath,
          context,
        },
      });

      if (error) {
        if ((error as any).status === 402) {
          setLimitReached(true);
        }
        throw error;
      }

      const reply = (data?.reply as string) || 'No he podido responder ahora mismo.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      if (data?.usage) {
        setUsage({
          used: data.usage.used,
          limit: data.usage.limit,
          remaining: data.usage.remaining,
        });
        setLimitReached(data.usage.limit != null && data.usage.remaining === 0);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Ahora mismo no puedo responder. Si es una consulta avanzada, prueba con IP‑GENIUS o contacta con soporte.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Panel */}
      {open && (
        <Card className="w-[350px] h-[520px] shadow-xl border bg-card">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">Asistente IP-NEXUS</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {usage?.limit != null
                      ? `Consultas restantes: ${usage.remaining ?? '—'} / ${usage.limit}`
                      : 'Consultas ilimitadas'}
                  </p>
                </div>
              </div>

              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'max-w-[90%] rounded-lg px-3 py-2 text-sm',
                    m.role === 'user'
                      ? 'ml-auto bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  )}
                >
                  {m.content}
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {limitReached ? (
              <div className="p-4 border-t space-y-3">
                <p className="text-sm text-foreground">
                  Has alcanzado el límite mensual del Asistente. Para análisis y uso ilimitado, actualiza a IP‑GENIUS.
                </p>
                <Button onClick={handleUpgrade} disabled={!geniusPriceId || createCheckout.isPending} className="w-full">
                  {geniusPriceId ? 'Actualizar a IP‑GENIUS' : 'Precio no configurado aún'}
                </Button>
              </div>
            ) : (
              <div className="p-3 border-t flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu pregunta…"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  disabled={isSending}
                />
                <Button size="icon" onClick={() => void send()} disabled={!input.trim() || isSending}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* FAB */}
      {!open && (
        <Button
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={() => setOpen(true)}
          aria-label="Abrir Asistente IP-NEXUS"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

function getFaqResponse(text: string): string | null {
  // Very small FAQ router (can be expanded later).
  const matches = (re: RegExp) => re.test(text);

  if (matches(/(qué|que) es una marca|definici(ó|o)n de marca/)) {
    return 'Una marca es un signo que distingue productos o servicios (nombre, logo, etc.). En IP‑NEXUS puedes gestionarlas desde Docket. Si necesitas analizar registrabilidad o riesgos concretos, eso requiere IP‑GENIUS.';
  }

  if (matches(/plazo|tiempo.*registro|cu[aá]nto tarda/)) {
    return 'Los plazos varían por oficina y tipo de derecho (marca/patente/diseño). Como referencia, una marca puede tardar varios meses. Para plazos exactos por jurisdicción y caso, consulta las fuentes oficiales o usa IP‑GENIUS.';
  }

  if (matches(/precio|plan|starter|professional|business/)) {
    return 'Planes IP‑NEXUS: Starter (€99/mes), Professional (€249/mes), Business (€499/mes) y Enterprise (a medida). IP‑GENIUS es premium. ¿Quieres que te explique qué incluye cada plan?';
  }

  if (matches(/ayuda|como usar|d[oó]nde est[aá]/)) {
    return 'Dime qué estás intentando hacer (por ejemplo: crear un expediente, subir documentos, configurar alertas) y te guío paso a paso en la pantalla actual.';
  }

  return null;
}
