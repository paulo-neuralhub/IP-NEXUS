import { useCallback, useEffect, useRef, useState } from 'react';
import { Device } from '@twilio/voice-sdk';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';

type TwilioDeviceState = {
  device: Device | null;
  isReady: boolean;
  error: string | null;
  isConfigured: boolean;
  reinitialize: () => Promise<void>;
};

export function useTwilioDevice(): TwilioDeviceState {
  const { currentOrganization } = useOrganization();
  const [device, setDevice] = useState<Device | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(true);
  
  // Use ref to track current device and prevent infinite loops
  const deviceRef = useRef<Device | null>(null);
  const initializingRef = useRef(false);

  const initialize = useCallback(async () => {
    // Prevent concurrent initializations
    if (initializingRef.current) return;
    initializingRef.current = true;
    
    try {
      setError(null);
      setIsReady(false);

      // Destroy previous device if exists
      if (deviceRef.current) {
        deviceRef.current.destroy();
        deviceRef.current = null;
        setDevice(null);
      }

      const { data: auth } = await supabase.auth.getSession();
      if (!auth.session) {
        setError('No hay sesión');
        return;
      }

      if (!currentOrganization?.id) {
        setError('Selecciona una organización');
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke('twilio-voice-token', {
        body: { organization_id: currentOrganization.id },
      });

      // Handle 503/not configured gracefully
      if (fnError) {
        const errorBody = fnError.message || '';
        if (errorBody.includes('TWILIO_NOT_CONFIGURED') || fnError.message?.includes('503')) {
          setIsConfigured(false);
          setError(null); // Don't show as error, just not configured
          return;
        }
        throw new Error(fnError.message);
      }
      
      if (data?.error === 'TWILIO_NOT_CONFIGURED') {
        setIsConfigured(false);
        setError(null);
        return;
      }

      if (!data?.token) {
        setIsConfigured(false);
        setError(null);
        return;
      }

      setIsConfigured(true);
      const twilioDevice = new Device(data.token);

      twilioDevice.on('registered', () => setIsReady(true));
      twilioDevice.on('unregistered', () => setIsReady(false));
      twilioDevice.on('error', (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error de VoIP';
        setError(msg);
        setIsReady(false);
      });

      twilioDevice.on('tokenWillExpire', async () => {
        try {
          const { data: refresh, error: refreshErr } = await supabase.functions.invoke('twilio-voice-token', {
            body: { organization_id: currentOrganization?.id },
          });
          if (refreshErr) return;
          if (refresh?.token) twilioDevice.updateToken(refresh.token);
        } catch {
          // ignore
        }
      });

      await twilioDevice.register();
      deviceRef.current = twilioDevice;
      setDevice(twilioDevice);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al inicializar VoIP';
      // Check if it's a "not configured" error
      if (msg.includes('503') || msg.includes('TWILIO_NOT_CONFIGURED')) {
        setIsConfigured(false);
        setError(null);
      } else {
        setError(msg);
      }
      setIsReady(false);
    } finally {
      initializingRef.current = false;
    }
  }, [currentOrganization?.id]);

  useEffect(() => {
    void initialize();
    return () => {
      if (deviceRef.current) {
        deviceRef.current.destroy();
        deviceRef.current = null;
      }
    };
  }, [initialize]);

  return { device, isReady, error, isConfigured, reinitialize: initialize };
}
