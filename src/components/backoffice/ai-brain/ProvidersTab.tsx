import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Settings, Trash2, TestTube, Loader2, RefreshCw } from 'lucide-react';
import { AIProvider } from '@/types/ai-brain.types';
import { Skeleton } from '@/components/ui/skeleton';

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

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'healthy':
        return <Badge variant="secondary">Healthy</Badge>;
      case 'degraded':
        return <Badge variant="secondary">Degraded</Badge>;
      case 'down':
        return <Badge variant="destructive">Down</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

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
            <CardDescription>Gestión de proveedores de IA y sus API keys</CardDescription>
          </div>

          {onCreateDefaults && (
            <Button variant="outline" size="sm" onClick={onCreateDefaults}>
              Crear providers por defecto
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
              <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{provider.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {provider.code} • {provider.is_gateway ? 'Gateway' : 'Direct API'}
                      {provider.api_key_encrypted && ' • API Key: ••••••••'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(provider.status)}
                  {getHealthBadge(provider.health_status)}
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
