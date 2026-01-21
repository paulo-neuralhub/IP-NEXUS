// ============================================
// CALENDAR INTEGRATION SECTION
// Main component for calendar settings in Integrations page
// ============================================

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Plus, Loader2, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type CalendarProvider,
  useCalendarConnections,
  useCalendarOAuthUrl,
  useCalendarOAuthCallback,
} from '@/hooks/use-calendar';
import { CalendarConnectionCard } from './CalendarConnectionCard';

// Available calendar providers
const CALENDAR_PROVIDERS: {
  id: CalendarProvider;
  name: string;
  description: string;
  icon: string;
  color: string;
}[] = [
  {
    id: 'google',
    name: 'Google Calendar',
    description: 'Sincroniza con tu calendario de Google',
    icon: '📅',
    color: '#4285F4',
  },
  {
    id: 'microsoft',
    name: 'Microsoft Outlook',
    description: 'Sincroniza con Outlook o Microsoft 365',
    icon: '📆',
    color: '#0078D4',
  },
];

export function CalendarIntegrationSection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: connections = [], isLoading, error } = useCalendarConnections();
  const oauthUrlMutation = useCalendarOAuthUrl();
  const oauthCallbackMutation = useCalendarOAuthCallback();

  // Handle OAuth callback
  useEffect(() => {
    const isCallback = searchParams.get('calendar_callback') === 'true';
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const provider = searchParams.get('provider') as CalendarProvider | null;

    if (isCallback && code && state && provider) {
      oauthCallbackMutation.mutate(
        { code, state, provider },
        {
          onSettled: () => {
            // Clean up URL params
            searchParams.delete('calendar_callback');
            searchParams.delete('code');
            searchParams.delete('state');
            searchParams.delete('provider');
            setSearchParams(searchParams, { replace: true });
          },
        }
      );
    }
  }, [searchParams]);

  const handleConnectProvider = async (provider: CalendarProvider) => {
    try {
      const result = await oauthUrlMutation.mutateAsync(provider);
      if (result.url) {
        // Store state for callback verification
        sessionStorage.setItem('calendar_oauth_state', result.state);
        sessionStorage.setItem('calendar_oauth_provider', provider);
        // Redirect to OAuth
        window.location.href = result.url;
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Calendarios</h2>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Calendarios</h2>
        </div>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Conectar calendario
        </Button>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Sincronización bidireccional</AlertTitle>
        <AlertDescription>
          Conecta tu calendario para sincronizar vencimientos, tareas y reuniones de IP-NEXUS
          automáticamente. Los cambios se reflejan en ambos sentidos.
        </AlertDescription>
      </Alert>

      {/* OAuth Callback Loading */}
      {oauthCallbackMutation.isPending && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Conectando calendario...</span>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>No se pudieron cargar las conexiones de calendario.</AlertDescription>
        </Alert>
      )}

      {/* Connected Calendars */}
      {connections.length > 0 ? (
        <div className="space-y-3">
          {connections.map((connection) => (
            <CalendarConnectionCard key={connection.id} connection={connection} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">Sin calendarios conectados</h3>
            <p className="text-muted-foreground text-sm mb-4 max-w-md">
              Conecta tu Google Calendar o Microsoft Outlook para sincronizar vencimientos, tareas
              y reuniones automáticamente.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Conectar calendario
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Calendar Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar calendario</DialogTitle>
            <DialogDescription>
              Selecciona el proveedor de calendario que quieres conectar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {CALENDAR_PROVIDERS.map((provider) => {
              const isConnected = connections.some((c) => c.provider === provider.id);

              return (
                <button
                  key={provider.id}
                  onClick={() => handleConnectProvider(provider.id)}
                  disabled={oauthUrlMutation.isPending}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors disabled:opacity-50"
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${provider.color}15` }}
                  >
                    {provider.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{provider.name}</p>
                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                  </div>
                  {isConnected && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      Ya conectado
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Al conectar, autorizarás a IP-NEXUS a acceder a tu calendario.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
