import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Braces,
  Code,
  Eye,
  FunctionSquare,
  Mic,
  Sparkles,
  Video,
} from 'lucide-react';
import { AIModel, AIProvider } from '@/types/ai-brain.types';
import { Skeleton } from '@/components/ui/skeleton';

type CapKey = 'text' | 'code' | 'tools' | 'vision' | 'voice' | 'video' | 'reasoning';

const CAP_ICONS: Record<CapKey, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  text: { label: 'Texto', Icon: Braces },
  code: { label: 'Código', Icon: Code },
  tools: { label: 'Funciones', Icon: FunctionSquare },
  vision: { label: 'Visión', Icon: Eye },
  voice: { label: 'Voz', Icon: Mic },
  video: { label: 'Vídeo', Icon: Video },
  reasoning: { label: 'Razonamiento', Icon: Sparkles },
};

function getProviderHealthBadge(provider: AIProvider) {
  const health = provider.health_status;
  const labelMap: Record<AIProvider['health_status'], string> = {
    healthy: 'Healthy',
    degraded: 'Degraded',
    down: 'Down',
    unknown: 'Unknown',
  };

  const variant: 'default' | 'secondary' | 'destructive' | 'outline' =
    health === 'healthy'
      ? 'default'
      : health === 'degraded'
        ? 'secondary'
        : health === 'down'
          ? 'destructive'
          : 'outline';

  return (
    <Badge variant={variant} className="whitespace-nowrap">
      {labelMap[health]}
    </Badge>
  );
}

function pickCapabilities(model: AIModel): CapKey[] {
  const caps = model.capabilities || {};
  const out: CapKey[] = [];

  const has = (k: CapKey) => {
    const v = (caps as Record<string, boolean | undefined>)[k];
    return v === true;
  };

  // Explicit flags if present
  if (has('vision')) out.push('vision');
  if (has('tools')) out.push('tools');
  if (has('voice')) out.push('voice');
  if (has('video')) out.push('video');
  if (has('reasoning')) out.push('reasoning');

  // Fallback heuristics
  if (!out.length) out.push('text');
  if (model.model_id.toLowerCase().includes('code')) out.push('code');

  return Array.from(new Set(out));
}

function formatPrice(v?: number | null) {
  if (v == null) return '—';
  return `${v.toFixed(2)} / 1M`;
}

interface Props {
  providers: AIProvider[];
  models: AIModel[];
  isLoading: boolean;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDiscover: (providerId: string) => void;
  discoveringProviderId?: string | null;
}

export function ModelsTab({
  providers,
  models,
  isLoading,
  onToggleActive,
  onDiscover,
  discoveringProviderId,
}: Props) {
  const modelsByProvider = useMemo(() => {
    const map = new Map<string, AIModel[]>();
    for (const m of models) {
      const arr = map.get(m.provider_id) || [];
      arr.push(m);
      map.set(m.provider_id, arr);
    }
    return map;
  }, [models]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Modelos</CardTitle>
          <CardDescription>Activación y capacidades por modelo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {providers.map((p) => {
        const list = (modelsByProvider.get(p.id) || []).slice().sort((a, b) => a.name.localeCompare(b.name));
        return (
          <Card key={p.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {p.name}
                  <Badge variant="secondary" className="uppercase">{p.code}</Badge>
                  {getProviderHealthBadge(p)}
                </CardTitle>
                <CardDescription>
                  Modelos detectados: {list.length}. Activa/desactiva modelos y revisa capacidades/precios.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDiscover(p.id)}
                disabled={discoveringProviderId === p.id}
              >
                {discoveringProviderId === p.id ? 'Sincronizando…' : 'Sincronizar modelos'}
              </Button>
            </CardHeader>
            <CardContent>
              {list.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No hay modelos aún. Pulsa “Sincronizar modelos”.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Modelo</th>
                        <th className="text-left py-3 px-4 font-medium">Capacidades</th>
                        <th className="text-left py-3 px-4 font-medium">Context</th>
                        <th className="text-left py-3 px-4 font-medium">Input</th>
                        <th className="text-left py-3 px-4 font-medium">Output</th>
                        <th className="text-left py-3 px-4 font-medium">On/Off</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((m) => (
                        <tr key={m.id} className="border-b">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{m.name}</p>
                              <p className="text-xs text-muted-foreground">{m.model_id}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-2">
                              {pickCapabilities(m).map((k) => {
                                const { Icon, label } = CAP_ICONS[k];
                                return (
                                  <Badge key={k} variant="outline" className="flex items-center gap-1">
                                    <Icon className="h-3.5 w-3.5" />
                                    {label}
                                  </Badge>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {m.context_window ? `${m.context_window.toLocaleString()} tokens` : '—'}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{formatPrice(m.input_cost_per_1m)}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{formatPrice(m.output_cost_per_1m)}</td>
                          <td className="py-3 px-4">
                            <Switch
                              checked={m.is_active}
                              onCheckedChange={(checked) => onToggleActive(m.id, checked)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
