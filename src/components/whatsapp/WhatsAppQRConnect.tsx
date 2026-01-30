/**
 * WhatsApp QR Connection Component
 * 
 * Placeholder funcional con UI completa para conexión vía QR.
 * Requiere backend externo (whatsapp-web.js en Node.js) para funcionar.
 * 
 * Estados:
 * - not_configured: Sin backend configurado
 * - idle: Listo para generar QR (backend configurado)
 * - loading: Generando QR
 * - qr_ready: QR visible, esperando escaneo
 * - connected: WhatsApp vinculado
 * - error: Error de conexión
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  Info,
  ExternalLink,
  Server,
  Settings,
  Copy,
  Check,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';

type ConnectionStatus = 'idle' | 'loading' | 'qr_ready' | 'connected' | 'error' | 'not_configured';

interface WhatsAppSession {
  id: string;
  phone_number?: string;
  status: string;
  last_seen_at?: string;
  device_name?: string;
}

interface WhatsAppQRConnectProps {
  onConnected?: () => void;
  onRequestImplementation?: () => void;
}

export function WhatsAppQRConnect({ onConnected, onRequestImplementation }: WhatsAppQRConnectProps) {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  
  const [status, setStatus] = useState<ConnectionStatus>('not_configured');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [session, setSession] = useState<WhatsAppSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [backendUrl, setBackendUrl] = useState<string>('');
  const [backendUrlInput, setBackendUrlInput] = useState<string>('');
  const [isChecking, setIsChecking] = useState(true);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTechInfo, setShowTechInfo] = useState(false);

  // Check configuration on mount
  useEffect(() => {
    if (currentOrganization?.id) {
      checkConfiguration();
    }
  }, [currentOrganization?.id]);

  const checkConfiguration = async () => {
    if (!currentOrganization?.id) return;
    
    setIsChecking(true);
    try {
      const { data: config } = await supabase
        .from('whatsapp_tenant_config')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .maybeSingle();

      if (config) {
        const backendUrlValue = (config as any).whatsapp_backend_url;
        const connectedPhone = (config as any).connected_phone;
        
        if (backendUrlValue) {
          setBackendUrl(backendUrlValue);
          setBackendUrlInput(backendUrlValue);
          
          // Check if already connected
          if (config.integration_type === 'qr_web' && connectedPhone) {
            setStatus('connected');
            setSession({
              id: config.id,
              phone_number: connectedPhone,
              status: 'connected',
              last_seen_at: config.updated_at,
            });
          } else {
            setStatus('idle');
          }
        } else {
          setStatus('not_configured');
        }
      } else {
        setStatus('not_configured');
      }
    } catch (err) {
      console.error('Error checking config:', err);
      setStatus('not_configured');
    } finally {
      setIsChecking(false);
    }
  };

  const saveBackendUrl = async () => {
    if (!backendUrlInput.trim()) {
      toast.error('Error', {
        description: 'Introduce la URL del servidor WhatsApp'
      });
      return;
    }

    setIsConfiguring(true);
    try {
      // Verify server responds
      try {
        const response = await fetch(`${backendUrlInput.trim()}/api/whatsapp/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });
        
        if (!response.ok) {
          throw new Error('Servidor no responde correctamente');
        }
      } catch (fetchError) {
        toast.error('Error de conexión', {
          description: 'No se pudo conectar con el servidor. Verifica la URL y que esté activo.'
        });
        setIsConfiguring(false);
        return;
      }

      // Upsert configuration
      await supabase
        .from('whatsapp_tenant_config')
        .upsert({
          organization_id: currentOrganization?.id,
          whatsapp_backend_url: backendUrlInput.trim(),
          integration_type: 'qr_web',
          updated_at: new Date().toISOString(),
        } as any);

      setBackendUrl(backendUrlInput.trim());
      setStatus('idle');
      
      toast.success('Configuración guardada', {
        description: 'El servidor WhatsApp ha sido configurado correctamente'
      });
    } catch (err) {
      console.error('Error saving config:', err);
      toast.error('Error', {
        description: 'No se pudo guardar la configuración'
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  const startQRSession = async () => {
    if (!backendUrl) {
      toast.error('Error', {
        description: 'Primero configura la URL del servidor WhatsApp'
      });
      return;
    }

    setStatus('loading');
    setError(null);
    
    try {
      const response = await fetch(`${backendUrl}/api/whatsapp/qr/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: currentOrganization?.id,
          user_id: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Error iniciando sesión');
      }

      const data = await response.json();
      
      if (data.qrCode) {
        setQrCode(data.qrCode);
        setStatus('qr_ready');
        pollSessionStatus(data.sessionId);
      } else {
        throw new Error('No se recibió código QR');
      }
    } catch (err: any) {
      console.error('Error starting QR:', err);
      setError('No se pudo conectar con el servidor de WhatsApp');
      setStatus('error');
    }
  };

  const pollSessionStatus = useCallback(async (sessionId: string) => {
    if (isPolling || !backendUrl) return;
    setIsPolling(true);

    let attempts = 0;
    const maxAttempts = 40; // 2 minutes

    const checkStatus = async (): Promise<boolean> => {
      try {
        const response = await fetch(`${backendUrl}/api/whatsapp/qr/status/${sessionId}`);
        const data = await response.json();

        if (data.status === 'connected') {
          setStatus('connected');
          setSession(data.session);
          
          // Save to DB
          await supabase
            .from('whatsapp_tenant_config')
            .update({
              connected_phone: data.session?.phone_number,
              integration_type: 'qr_web',
              updated_at: new Date().toISOString(),
            } as any)
            .eq('organization_id', currentOrganization?.id);

          toast.success('¡WhatsApp conectado!', {
            description: 'Tu WhatsApp está ahora vinculado'
          });
          
          onConnected?.();
          return true;
        } else if (data.qrCode && data.qrCode !== qrCode) {
          setQrCode(data.qrCode);
        }
        return false;
      } catch (err) {
        return false;
      }
    };

    while (attempts < maxAttempts) {
      const connected = await checkStatus();
      if (connected) {
        setIsPolling(false);
        return;
      }
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    setError('El código QR ha expirado');
    setStatus('error');
    setIsPolling(false);
  }, [qrCode, isPolling, onConnected, backendUrl, currentOrganization?.id]);

  const disconnectSession = async () => {
    try {
      if (backendUrl) {
        await fetch(`${backendUrl}/api/whatsapp/qr/disconnect`, {
          method: 'POST',
        }).catch(() => {});
      }

      await supabase
        .from('whatsapp_tenant_config')
        .update({
          connected_phone: null,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('organization_id', currentOrganization?.id);

      setSession(null);
      setStatus('idle');
      setQrCode(null);

      toast.success('Desconectado', {
        description: 'Tu WhatsApp ha sido desvinculado'
      });
    } catch (err) {
      toast.error('Error', {
        description: 'No se pudo desconectar'
      });
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(`${window.location.origin}/api/whatsapp/webhook`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isChecking) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Conexión vía código QR</CardTitle>
        </div>
        <CardDescription>
          Conecta tu WhatsApp personal escaneando un código QR
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Important notice */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Importante</AlertTitle>
          <AlertDescription>
            Al conectar tu WhatsApp, todos los mensajes (personales y de trabajo) 
            llegarán a IP-NEXUS. Recomendamos usar un número dedicado para el negocio.
          </AlertDescription>
        </Alert>

        {/* Status: Not configured */}
        {status === 'not_configured' && (
          <div className="space-y-6">
            <Alert variant="default" className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <Server className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800 dark:text-amber-200">Configuración requerida</AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                La conexión vía QR requiere un servidor WhatsApp externo. 
                Puedes configurar tu propio servidor o solicitar implementación profesional.
              </AlertDescription>
            </Alert>

            {/* Option 1: Own server */}
            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center gap-2 font-medium">
                <Settings className="h-4 w-4" />
                Opción 1: Servidor propio
              </div>
              <p className="text-sm text-muted-foreground">
                Si tienes un servidor con whatsapp-web.js configurado, introduce la URL:
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="https://whatsapp.tudominio.com"
                  value={backendUrlInput}
                  onChange={(e) => setBackendUrlInput(e.target.value)}
                />
                <Button onClick={saveBackendUrl} disabled={isConfiguring}>
                  {isConfiguring ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Guardar'
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                El servidor debe tener los endpoints: /api/whatsapp/health, /api/whatsapp/qr/start, /api/whatsapp/qr/status/:id
              </p>
            </div>

            {/* Option 2: Professional implementation */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center gap-2 font-medium">
                <ExternalLink className="h-4 w-4 text-primary" />
                Opción 2: Implementación profesional
              </div>
              <p className="text-sm text-muted-foreground">
                Deja que el equipo de IP-NEXUS configure todo por ti. 
                Incluye servidor dedicado, mantenimiento y soporte.
              </p>
              <Button 
                variant="outline" 
                onClick={onRequestImplementation}
                className="w-full"
              >
                Solicitar implementación →
              </Button>
            </div>

            {/* Technical info */}
            <Collapsible open={showTechInfo} onOpenChange={setShowTechInfo}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Información técnica para desarrolladores
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showTechInfo ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-2">
                <div className="rounded-lg bg-muted/50 p-4 space-y-3 text-sm">
                  <p className="font-medium">Requisitos del servidor:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Node.js 18+ con whatsapp-web.js</li>
                    <li>Puppeteer con Chromium</li>
                    <li>2GB RAM mínimo</li>
                    <li>Endpoints REST para QR y mensajes</li>
                  </ul>
                  <p className="font-medium">Webhook URL para mensajes entrantes:</p>
                  <div className="flex items-center gap-2 bg-background rounded-md p-2 border">
                    <code className="flex-1 text-xs break-all">
                      {window.location.origin}/api/whatsapp/webhook
                    </code>
                    <Button size="sm" variant="ghost" onClick={copyWebhookUrl}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Status: Idle (ready to connect) */}
        {status === 'idle' && (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Server className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-lg font-medium">Servidor configurado</p>
            <p className="text-sm text-muted-foreground">
              Conectado a: {backendUrl}
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              Haz clic en el botón para generar un código QR
            </p>
            <Button onClick={startQRSession} className="mt-4">
              <QrCode className="h-4 w-4 mr-2" />
              Generar código QR
            </Button>
          </div>
        )}

        {/* Status: Loading */}
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Generando código QR...</p>
            <p className="text-sm text-muted-foreground">Conectando con el servidor de WhatsApp</p>
          </div>
        )}

        {/* Status: QR Ready */}
        {status === 'qr_ready' && qrCode && (
          <div className="flex flex-col items-center justify-center py-4 text-center space-y-6">
            <p className="text-lg font-medium">Escanea este código QR</p>
            
            {/* QR Code display */}
            <div className="p-4 bg-white rounded-xl shadow-lg">
              <img 
                src={qrCode} 
                alt="WhatsApp QR Code" 
                className="w-64 h-64"
              />
            </div>

            {/* Instructions */}
            <div className="grid grid-cols-1 gap-3 text-left max-w-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <span className="text-sm text-muted-foreground">Abre WhatsApp en tu teléfono</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <span className="text-sm text-muted-foreground">Ve a Configuración → Dispositivos vinculados</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <span className="text-sm text-muted-foreground">Toca "Vincular un dispositivo"</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <span className="text-sm text-muted-foreground">Escanea este código QR</span>
              </div>
            </div>

            <Button variant="outline" onClick={startQRSession}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerar QR
            </Button>
            <p className="text-xs text-muted-foreground">
              El código expira en 2 minutos
            </p>
          </div>
        )}

        {/* Status: Connected */}
        {status === 'connected' && session && (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-lg font-medium text-foreground">
              WhatsApp conectado
            </div>
            <p className="text-sm text-muted-foreground">
              Número: {session.phone_number}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-600">
                <Wifi className="h-3 w-3 mr-1" />
                En línea
              </Badge>
            </div>
            <Button variant="destructive" onClick={disconnectSession} className="mt-4">
              <XCircle className="h-4 w-4 mr-2" />
              Desconectar WhatsApp
            </Button>
          </div>
        )}

        {/* Status: Error */}
        {status === 'error' && (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-lg font-medium text-foreground">
              Error de conexión
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              {error || 'No se pudo establecer la conexión'}
            </p>
            <Button onClick={startQRSession} className="mt-4">
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
