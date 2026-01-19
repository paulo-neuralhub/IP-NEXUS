// src/pages/app/settings/sections/SessionsSettings.tsx
import { useActiveSessions, useRevokeSession, useRevokeAllSessions } from '@/hooks/use-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Laptop, Smartphone, X } from 'lucide-react';

export default function SessionsSettings() {
  const { data: sessions = [], isLoading } = useActiveSessions();
  const revokeMutation = useRevokeSession();
  const revokeAllMutation = useRevokeAllSessions();

  if (isLoading) return <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sesiones Activas</CardTitle>
            <CardDescription>Dispositivos donde has iniciado sesión</CardDescription>
          </div>
          <Button variant="outline" className="text-destructive" onClick={() => revokeAllMutation.mutate(undefined)}>
            Cerrar todas las demás
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No hay sesiones activas</p>
        ) : (
          <div className="space-y-4">
            {sessions.map((session: any) => (
              <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {session.device_info?.device_type === 'mobile' ? (
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Laptop className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">
                      {session.device_info?.browser || 'Navegador'} en {session.device_info?.os || 'Sistema'}
                      {session.is_current && <Badge className="ml-2" variant="secondary">Esta sesión</Badge>}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {session.ip_address} · Última actividad: {new Date(session.last_activity_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!session.is_current && (
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => revokeMutation.mutate(session.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
