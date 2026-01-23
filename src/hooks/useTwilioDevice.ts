import { useCallback, useEffect, useState } from 'react';
import { Device } from '@twilio/voice-sdk';
import { supabase } from '@/integrations/supabase/client';

type TwilioDeviceState = {
  device: Device | null;
  isReady: boolean;
  error: string | null;
  reinitialize: () => Promise<void>;
};

export function useTwilioDevice(): TwilioDeviceState {
  const [device, setDevice] = useState<Device | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialize = useCallback(async () => {
    try {
      setError(null);
      setIsReady(false);

      // Cerrar anterior si existía
      device?.destroy();
      setDevice(null);

      const { data: auth } = await supabase.auth.getSession();
      if (!auth.session) throw new Error('No hay sesión');

      const { data, error: fnError } = await supabase.functions.invoke('twilio-voice-token', {
        body: {},
      });

      if (fnError) throw new Error(fnError.message);
      if (!data?.token) throw new Error('Token VoIP no disponible');

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
            body: {},
          });
          if (refreshErr) return;
          if (refresh?.token) twilioDevice.updateToken(refresh.token);
        } catch {
          // ignore
        }
      });

      await twilioDevice.register();
      setDevice(twilioDevice);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al inicializar VoIP';
      setError(msg);
      setIsReady(false);
    }
  }, [device]);

  useEffect(() => {
    void initialize();
    return () => {
      device?.destroy();
    };
  }, [initialize, device]);

  return { device, isReady, error, reinitialize: initialize };
}
