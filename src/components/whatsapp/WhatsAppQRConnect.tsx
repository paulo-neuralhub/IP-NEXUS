/**
 * WhatsApp QR Connection Component
 * 
 * NOTE: Full QR-based WhatsApp Web connection requires an external Node.js 
 * backend running whatsapp-web.js. This component provides the UI and is 
 * prepared to integrate with such a backend when available.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode, 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Loader2,
  AlertTriangle,
  Wifi,
  WifiOff,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';

type ConnectionStatus = 'idle' | 'loading' | 'qr_ready' | 'connected' | 'error' | 'not_available';

interface WhatsAppSession {
  id: string;
  phone_number?: string;
  status: string;
  last_seen_at?: string;
  device_name?: string;
}

interface WhatsAppQRConnectProps {
  onConnected?: () => void;
}

export function WhatsAppQRConnect({ onConnected }: WhatsAppQRConnectProps) {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [session, setSession] = useState<WhatsAppSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (currentOrganization?.id && user?.id) {
      checkExistingSession();
    }
  }, [currentOrganization?.id, user?.id]);

  const checkExistingSession = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('whatsapp_qr_sessions')
        .select('*')
        .eq('organization_id', currentOrganization?.id)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (sessionError) {
        console.error('Error checking session:', sessionError);
        return;
      }

      if (sessionData) {
        setSession(sessionData as WhatsAppSession);
        if (sessionData.status === 'connected') {
          setStatus('connected');
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  const startQRSession = async () => {
    setStatus('loading');
    setError(null);
    
    try {
      // Call edge function to start WhatsApp QR session
      const { data, error: fnError } = await supabase.functions.invoke('whatsapp-qr-start', {
        body: { 
          organization_id: currentOrganization?.id,
          user_id: user?.id 
        }
      });

      if (fnError) throw fnError;

      if (data?.error === 'not_available') {
        setStatus('not_available');
        setError('El servicio de conexión QR no está disponible en este momento.');
        return;
      }

      if (data?.qrCode) {
        setQrCode(data.qrCode);
        setStatus('qr_ready');
        
        // Start polling for session status
        pollSessionStatus(data.sessionId);
      } else {
        throw new Error('No se recibió código QR');
      }
    } catch (error: any) {
      console.error('Error starting QR session:', error);
      setError(error.message || 'No se pudo iniciar la sesión. Intenta de nuevo.');
      setStatus('error');
    }
  };

  const pollSessionStatus = useCallback(async (sessionId: string) => {
    if (isPolling) return;
    setIsPolling(true);

    const checkStatus = async (): Promise<boolean> => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke('whatsapp-qr-status', {
          body: { session_id: sessionId }
        });

        if (fnError) throw fnError;

        if (data?.status === 'connected') {
          setStatus('connected');
          setSession(data.session);
          onConnected?.();
          toast.success('¡WhatsApp conectado!', {
            description: 'Tu WhatsApp está ahora conectado a IP-NEXUS'
          });
          return true;
        } else if (data?.qrCode && data.qrCode !== qrCode) {
          // QR updated
          setQrCode(data.qrCode);
        }
        return false;
      } catch (error) {
        console.error('Error polling status:', error);
        return false;
      }
    };

    // Poll every 3 seconds for 2 minutes
    for (let i = 0; i < 40; i++) {
      const connected = await checkStatus();
      if (connected) {
        setIsPolling(false);
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Timeout
    setError('El código QR ha expirado. Genera uno nuevo.');
    setStatus('error');
    setIsPolling(false);
  }, [qrCode, isPolling, onConnected]);

  const disconnectSession = async () => {
    try {
      const { error: fnError } = await supabase.functions.invoke('whatsapp-qr-disconnect', {
        body: { 
          session_id: session?.id,
          organization_id: currentOrganization?.id,
          user_id: user?.id
        }
      });

      if (fnError) throw fnError;

      // Update local state in database
      if (session?.id) {
        await supabase
          .from('whatsapp_qr_sessions')
          .update({ status: 'disconnected' })
          .eq('id', session.id);
      }

      setSession(null);
      setStatus('idle');
      setQrCode(null);

      toast.success('WhatsApp desconectado', {
        description: 'Tu sesión de WhatsApp ha sido cerrada'
      });
    } catch (error: any) {
      console.error('Error disconnecting:', error);
      toast.error('Error al desconectar', {
        description: error.message
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Conexión vía código QR
        </CardTitle>
        <CardDescription>
          Conecta tu WhatsApp personal escaneando un código QR
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Important notice */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Al conectar tu WhatsApp, todos los mensajes 
            (personales y de trabajo) llegarán a IP-NEXUS. Te recomendamos usar un 
            número dedicado para el negocio.
          </AlertDescription>
        </Alert>

        {/* Status: Connected */}
        {status === 'connected' && session && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-primary/10 p-4">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">
              WhatsApp conectado
            </h3>
            <p className="text-muted-foreground">
              Número: {session.phone_number || 'Conectado'}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="bg-primary/10 text-primary">
                <Wifi className="h-3 w-3 mr-1" />
                En línea
              </Badge>
              {session.last_seen_at && (
                <span className="text-muted-foreground">
                  Última actividad: {new Date(session.last_seen_at).toLocaleString('es-ES')}
                </span>
              )}
            </div>
            <Button variant="destructive" onClick={disconnectSession}>
              <WifiOff className="h-4 w-4 mr-2" />
              Desconectar WhatsApp
            </Button>
          </div>
        )}

        {/* Status: Idle */}
        {status === 'idle' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-muted p-4">
              <Smartphone className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">
              Conecta tu WhatsApp
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Escanea el código QR con tu teléfono para vincular tu WhatsApp con IP-NEXUS
            </p>
            <Button onClick={startQRSession}>
              <QrCode className="h-4 w-4 mr-2" />
              Generar código QR
            </Button>
          </div>
        )}

        {/* Status: Loading */}
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Generando código QR...</p>
          </div>
        )}

        {/* Status: QR Ready */}
        {status === 'qr_ready' && qrCode && (
          <div className="flex flex-col items-center justify-center py-4 space-y-6">
            <div className="bg-card p-4 rounded-xl shadow-lg border">
              <img 
                src={qrCode} 
                alt="WhatsApp QR Code" 
                className="w-64 h-64"
              />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold">
                Escanea este código QR
              </h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>1. Abre WhatsApp en tu teléfono</p>
                <p>2. Ve a Configuración → Dispositivos vinculados</p>
                <p>3. Toca &quot;Vincular un dispositivo&quot;</p>
                <p>4. Escanea este código QR</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Esperando escaneo...</span>
            </div>
            <Button variant="outline" onClick={startQRSession}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerar QR
            </Button>
          </div>
        )}

        {/* Status: Not Available */}
        {status === 'not_available' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-muted p-4">
              <Info className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">
              Servicio no disponible
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              La conexión vía QR requiere un servicio backend adicional que no está 
              configurado actualmente. Considera usar la integración con WhatsApp Business API.
            </p>
            <Button variant="outline" onClick={() => setStatus('idle')}>
              Volver
            </Button>
          </div>
        )}

        {/* Status: Error */}
        {status === 'error' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-destructive/10 p-4">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold">
              Error de conexión
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              {error || 'No se pudo establecer la conexión'}
            </p>
            <Button onClick={startQRSession}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Intentar de nuevo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WhatsAppQRConnect;
