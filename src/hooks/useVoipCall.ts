import { useCallback, useEffect, useState } from 'react';
import type { Call, Device } from '@twilio/voice-sdk';
import { useOrganization } from '@/contexts/organization-context';

export function useVoipCall(device: Device | null) {
  const { currentOrganization } = useOrganization();
  const [currentCall, setCurrentCall] = useState<Call | null>(null);

  const makeCall = useCallback(
    async (phoneNumber: string, contactId?: string) => {
      if (!device) throw new Error('Dispositivo VoIP no disponible');
      if (!currentOrganization?.id) throw new Error('Sin organización');

      const call = await device.connect({
        params: {
          To: phoneNumber,
          ContactId: contactId ?? '',
          OrganizationId: currentOrganization.id,
        },
      });

      setCurrentCall(call);
      return call;
    },
    [device, currentOrganization?.id]
  );

  const hangUp = useCallback(() => {
    currentCall?.disconnect();
    setCurrentCall(null);
  }, [currentCall]);

  const toggleMute = useCallback(() => {
    if (!currentCall) return;
    currentCall.mute(!currentCall.isMuted());
  }, [currentCall]);

  const toggleHold = useCallback(() => {
    // Twilio Voice JS no expone hold nativo; simulamos con mute (MVP).
    if (!currentCall) return;
    currentCall.mute(!currentCall.isMuted());
  }, [currentCall]);

  const acceptIncoming = useCallback(() => {
    currentCall?.accept();
  }, [currentCall]);

  const rejectIncoming = useCallback(() => {
    currentCall?.reject();
    setCurrentCall(null);
  }, [currentCall]);

  useEffect(() => {
    if (!currentCall) return;
    const cleanup = () => setCurrentCall(null);
    currentCall.on('disconnect', cleanup);
    currentCall.on('cancel', cleanup);
    return () => {
      try {
        currentCall.off('disconnect', cleanup);
        currentCall.off('cancel', cleanup);
      } catch {
        // ignore
      }
    };
  }, [currentCall]);

  return {
    currentCall,
    makeCall,
    hangUp,
    toggleMute,
    toggleHold,
    acceptIncoming,
    rejectIncoming,
  };
}
