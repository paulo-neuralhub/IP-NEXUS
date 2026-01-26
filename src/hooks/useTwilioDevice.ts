import { useCallback, useEffect, useRef, useState } from 'react';
import { Device } from '@twilio/voice-sdk';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';

interface TwilioDeviceState {
  device: Device | null;
  isReady: boolean;
  error: string | null;
  isConfigured: boolean;
  reinitialize: () => void;
}

export function useTwilioDevice(): TwilioDeviceState {
  const { currentOrganization } = useOrganization();
  const orgId = currentOrganization?.id;

  const [device, setDevice] = useState<Device | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(true);
  const [initTrigger, setInitTrigger] = useState(0);

  const deviceRef = useRef<Device | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (deviceRef.current) {
        deviceRef.current.destroy();
        deviceRef.current = null;
      }
    };
  }, []);

  // Initialize when org changes or reinitialize triggered
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // Cleanup previous device
      if (deviceRef.current) {
        deviceRef.current.destroy();
        deviceRef.current = null;
        if (mountedRef.current) {
          setDevice(null);
          setIsReady(false);
        }
      }

      if (!orgId) {
        if (mountedRef.current) {
          setError('Selecciona una organización');
          setIsConfigured(true);
        }
        return;
      }

      try {
        if (mountedRef.current) {
          setError(null);
          setIsReady(false);
        }

        const { data: auth } = await supabase.auth.getSession();
        if (cancelled || !mountedRef.current) return;

        if (!auth.session) {
          setError('No hay sesión');
          return;
        }

        const { data, error: fnError } = await supabase.functions.invoke('twilio-voice-token', {
          body: { organization_id: orgId },
        });

        if (cancelled || !mountedRef.current) return;

        // Handle 503/not configured or any error gracefully
        if (fnError) {
          // Check if it's a not configured error
          const errorMsg = fnError.message || String(fnError);
          if (errorMsg.includes('503') || errorMsg.includes('TWILIO_NOT_CONFIGURED')) {
            setIsConfigured(false);
            setError(null);
          } else {
            setIsConfigured(true);
            setError(errorMsg);
          }
          return;
        }

        // Handle missing token or explicit not configured error
        if (data?.error === 'TWILIO_NOT_CONFIGURED' || !data?.token) {
          setIsConfigured(false);
          setError(null);
          return;
        }

        setIsConfigured(true);
        
        const twilioDevice = new Device(data.token);

        twilioDevice.on('registered', () => {
          if (mountedRef.current) setIsReady(true);
        });
        
        twilioDevice.on('unregistered', () => {
          if (mountedRef.current) setIsReady(false);
        });
        
        twilioDevice.on('error', (err: unknown) => {
          if (mountedRef.current) {
            const msg = err instanceof Error ? err.message : 'Error de VoIP';
            setError(msg);
            setIsReady(false);
          }
        });

        twilioDevice.on('tokenWillExpire', async () => {
          try {
            const { data: refresh } = await supabase.functions.invoke('twilio-voice-token', {
              body: { organization_id: orgId },
            });
            if (refresh?.token && deviceRef.current) {
              deviceRef.current.updateToken(refresh.token);
            }
          } catch {
            // ignore token refresh errors
          }
        });

        await twilioDevice.register();
        
        if (cancelled || !mountedRef.current) {
          twilioDevice.destroy();
          return;
        }

        deviceRef.current = twilioDevice;
        setDevice(twilioDevice);
      } catch (e) {
        if (cancelled || !mountedRef.current) return;
        
        const msg = e instanceof Error ? e.message : 'Error al inicializar VoIP';
        if (msg.includes('503') || msg.includes('TWILIO_NOT_CONFIGURED')) {
          setIsConfigured(false);
          setError(null);
        } else {
          setError(msg);
        }
        setIsReady(false);
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, [orgId, initTrigger]);

  const reinitialize = useCallback(() => {
    setInitTrigger((n) => n + 1);
  }, []);

  return { device, isReady, error, isConfigured, reinitialize };
}
