import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Plug } from 'lucide-react';
import { useIntegrationProviders, useIntegrationConnections } from '@/hooks/integrations/use-integrations';

export default function BackofficeIntegrationsPage() {
  const { data: providersRaw } = useIntegrationProviders();
  const { data: connections = [], isLoading } = useIntegrationConnections();

  const providers = Array.isArray(providersRaw)
    ? providersRaw
    : Object.values(providersRaw || {});

  const isConnected = (providerId: string) =>
    connections.some((c) => c.provider === providerId && c.is_active);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Integraciones</h1>
          <p className="text-muted-foreground">
            Conecta Stripe, Resend, Google/Microsoft, Zapier/Make/n8n y futuras integraciones.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link to="/app/settings/integrations">
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir Integraciones (App)
          </Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            Hub de Integraciones
          </CardTitle>
          <CardDescription>
            Este panel consolida las integraciones del sistema. La configuración detallada vive en la App.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground">Cargando integraciones…</div>
          ) : providers.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">No hay providers registrados.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {providers.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{p.name}</p>
                      {isConnected(p.id) ? (
                        <Badge>Conectado</Badge>
                      ) : (
                        <Badge variant="secondary">No conectado</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{p.description}</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/app/settings/integrations">Gestionar</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp (Meta)</CardTitle>
          <CardDescription>
            La configuración del token/verify token se realiza por organización desde la App (Integraciones).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Los secretos se guardan cifrados por tenant (secure-credentials). Aquí solo lo monitorizamos.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/app/settings/integrations">
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir configuración
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
