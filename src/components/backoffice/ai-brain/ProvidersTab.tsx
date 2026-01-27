import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Settings, Trash2, TestTube, Loader2, RefreshCw,
  MessageSquare, Image, Wrench, Database, Zap
} from 'lucide-react';
import { AIProvider } from '@/types/ai-brain.types';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ProvidersTabProps {
  providers: AIProvider[];
  isLoading: boolean;
  onEdit: (provider: AIProvider) => void;
  onDelete: (id: string) => void;
  onTest: (provider: AIProvider) => void;
  onDiscoverModels: (provider: AIProvider) => void;
  onCreateDefaults?: () => void;
  testingProviderId?: string | null;
  discoveringProviderId?: string | null;
}

export function ProvidersTab({ 
  providers, 
  isLoading, 
  onEdit, 
  onDelete, 
  onTest,
  onDiscoverModels,
  onCreateDefaults,
  testingProviderId,
  discoveringProviderId,
}: ProvidersTabProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge>Activo</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getHealthBadge = (health: string, latency?: number | null) => {
    const latencyText = latency ? ` • ${latency}ms` : '';
    switch (health) {
      case 'healthy':
        return <Badge variant="secondary">{`Healthy${latencyText}`}</Badge>;
      case 'degraded':
        return <Badge variant="outline">{`Degraded${latencyText}`}</Badge>;
      case 'down':
        return <Badge variant="destructive">Down</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const CapabilityIcon = ({ enabled, icon: Icon, label }: { enabled?: boolean; icon: any; label: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`p-1 rounded ${enabled ? 'text-primary' : 'text-muted-foreground/30'}`}>
          <Icon className="h-4 w-4" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}: {enabled ? 'Sí' : 'No'}</p>
      </TooltipContent>
    </Tooltip>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Providers</CardTitle>
          <CardDescription>Gestión de proveedores de IA y sus API keys</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <Skeleton className="h-8 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>AI Providers</CardTitle>
            <CardDescription>
              {providers.length} proveedores • {providers.filter(p => p.status === 'active').length} activos
            </CardDescription>
          </div>

          {onCreateDefaults && (
            <Button variant="outline" size="sm" onClick={onCreateDefaults}>
              Crear providers por defecto
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {providers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No hay providers configurados</p>
              <p className="text-sm">Añade un provider para comenzar</p>
              {onCreateDefaults && (
                <div className="mt-4">
                  <Button variant="outline" onClick={onCreateDefaults}>
                    Crear providers por defecto
                  </Button>
                </div>
              )}
            </div>
          ) : (
            providers.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {provider.is_gateway ? (
                      <Zap className="h-5 w-5 text-primary" />
                    ) : (
                      <Brain className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{provider.name}</p>
                      {provider.is_gateway && (
                        <Badge variant="outline" className="text-xs">Gateway</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {provider.code}
                      {provider.api_key_encrypted && ' • API Key: ••••••••'}
                      {provider.base_url && ` • ${new URL(provider.base_url).hostname}`}
                    </p>
                  </div>
                </div>
                
                {/* Capacidades */}
                <div className="flex items-center gap-1 mx-4">
                  <CapabilityIcon enabled={provider.supports_chat} icon={MessageSquare} label="Chat" />
                  <CapabilityIcon enabled={provider.supports_vision} icon={Image} label="Vision" />
                  <CapabilityIcon enabled={provider.supports_tools} icon={Wrench} label="Tools" />
                  <CapabilityIcon enabled={provider.supports_embeddings} icon={Database} label="Embeddings" />
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(provider.status)}
                  {getHealthBadge(provider.health_status, provider.health_latency_ms)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDiscoverModels(provider)}
                    disabled={discoveringProviderId === provider.id}
                    title="Sincronizar modelos"
                  >
                    {discoveringProviderId === provider.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onTest(provider)}
                    disabled={testingProviderId === provider.id}
                  >
                    {testingProviderId === provider.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onEdit(provider)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive" 
                    onClick={() => onDelete(provider.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
