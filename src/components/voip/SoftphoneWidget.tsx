import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Pause,
  Play,
  Grid3X3,
  X,
  Minimize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTwilioDevice } from '@/hooks/useTwilioDevice';
import { useVoipCall } from '@/hooks/useVoipCall';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { toast } from 'sonner';
import { TransferModal } from '@/components/voip/TransferModal';
import { Button } from '@/components/ui/button';
import { useVoipEnabled } from '@/hooks/useVoipEnabled';
import { useOrganizationSettings, useUpdateOrganizationSettings } from '@/hooks/use-settings';
import { useSecureCredentialStatus } from '@/hooks/use-secure-credentials';

type CallState = 'idle' | 'connecting' | 'ringing' | 'in_call' | 'on_hold' | 'incoming';

type ContactInfo = {
  id?: string;
  name?: string;
  company?: string;
};

function normalizePhone(input: string) {
  return input.replace(/[\s().-]/g, '');
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function SoftphoneWidget() {
  const { currentOrganization } = useOrganization();
  const { data: voipGloballyEnabled, isLoading: voipLoading } = useVoipEnabled();
  const { data: orgSettings } = useOrganizationSettings();
  const updateOrgSettings = useUpdateOrganizationSettings();
  const secureStatus = useSecureCredentialStatus();

  const tenantVoipEnabled = useMemo(() => {
    const raw = orgSettings?.integrations?.voip_enabled;
    return raw === undefined ? true : Boolean(raw);
  }, [orgSettings?.integrations]);

  const twilioCredentialsConfigured = useMemo(() => {
    if (!secureStatus.data?.encryption_ready) return false;
    const items = secureStatus.data?.credentials ?? [];
    const required = ['account_sid', 'api_key_sid', 'api_key_secret', 'twiml_app_sid'];
    return required.every((key) =>
      items.some((i) => i.provider === 'twilio' && i.credential_key === key && i.is_configured)
    );
  }, [secureStatus.data]);

  const widgetEnabled = voipGloballyEnabled === true && tenantVoipEnabled;
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showDialpad, setShowDialpad] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callState, setCallState] = useState<CallState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);

  // Only initialize Twilio when globally+tenant enabled AND credentials exist.
  // This prevents calling the edge function (503) when Twilio isn't configured.
  const shouldInitTwilio = widgetEnabled && twilioCredentialsConfigured;
  const { device, isReady, error: deviceError, isConfigured } = useTwilioDevice(shouldInitTwilio);
  const { makeCall, hangUp, toggleMute, toggleHold, currentCall, acceptIncoming, rejectIncoming } = useVoipCall(device);

  const voipAvailable = useMemo(() => !!currentOrganization?.id, [currentOrganization?.id]);

  // Timer
  useEffect(() => {
    if (!(callState === 'in_call' || callState === 'on_hold')) return;
    const id = window.setInterval(() => setCallDuration((p) => p + 1), 1000);
    return () => window.clearInterval(id);
  }, [callState]);

  // Exponer global click-to-call (abre y prellena, NO llama automático)
  useEffect(() => {
    if (!widgetEnabled) {
      delete window.softphoneCall;
      return;
    }

    window.softphoneCall = (number: string, contactId?: string, contactName?: string) => {
      setPhoneNumber(number);
      setContactInfo(contactId || contactName ? { id: contactId, name: contactName } : null);
      setIsOpen(true);
      setIsMinimized(false);
      setCallState('idle');
    };

    return () => {
      delete window.softphoneCall;
    };
  }, [widgetEnabled]);

  // Lookup contacto por número (screen-pop)
  const lookupContactByNumber = useCallback(
    async (num: string) => {
      if (!currentOrganization?.id) return null;
      const normalized = normalizePhone(num);

      const { data, error } = await supabase
        .from('contacts')
        .select('id,name,company_name')
        .eq('organization_id', currentOrganization.id)
        .or(`phone.eq.${normalized},phone.eq.${num}`)
        .limit(1)
        .maybeSingle();

      if (error) return null;
      if (!data) return null;
      return { id: data.id as string, name: (data as any).name as string, company: (data as any).company_name as string };
    },
    [currentOrganization?.id]
  );

  // Entrantes
  useEffect(() => {
    if (!device) return;

    const onIncoming = async (call: any) => {
      const from = call?.parameters?.From ?? '';
      setPhoneNumber(from);
      setIsOpen(true);
      setIsMinimized(false);
      setCallState('incoming');
      setCallDuration(0);
      setIsMuted(false);
      setIsOnHold(false);

      const info = await lookupContactByNumber(from);
      if (info) setContactInfo(info);
    };

    device.on('incoming', onIncoming);
    return () => {
      try {
        device.off('incoming', onIncoming);
      } catch {
        // ignore
      }
    };
  }, [device, lookupContactByNumber]);

  const resetCallUi = useCallback(() => {
    setCallState('idle');
    setCallDuration(0);
    setIsMuted(false);
    setIsOnHold(false);
    setShowDialpad(true);
  }, []);

  const handleMakeCall = useCallback(async () => {
    if (!voipAvailable) return;
    if (!phoneNumber.trim()) return;
    if (!isReady || !isConfigured) return;

    setCallState('connecting');
    setCallDuration(0);

    try {
      const call = await makeCall(phoneNumber, contactInfo?.id);
      call.on('ringing', () => setCallState('ringing'));
      call.on('accept', () => setCallState('in_call'));
      call.on('disconnect', resetCallUi);
      call.on('cancel', resetCallUi);
      call.on('error', () => resetCallUi());
    } catch {
      resetCallUi();
    }
  }, [contactInfo?.id, isReady, isConfigured, makeCall, phoneNumber, resetCallUi, voipAvailable]);

  const handleHangUp = useCallback(() => {
    hangUp();
    resetCallUi();
  }, [hangUp, resetCallUi]);

  const handleToggleMute = useCallback(() => {
    toggleMute();
    setIsMuted((v) => !v);
  }, [toggleMute]);

  const handleToggleHold = useCallback(() => {
    toggleHold();
    setIsOnHold((v) => !v);
    setCallState((s) => (s === 'on_hold' ? 'in_call' : 'on_hold'));
  }, [toggleHold]);

  const handleDialpadPress = useCallback(
    (digit: string) => {
      setPhoneNumber((p) => p + digit);
      if ((callState === 'in_call' || callState === 'on_hold') && currentCall) {
        try {
          currentCall.sendDigits(digit);
        } catch {
          // ignore
        }
      }
    },
    [callState, currentCall]
  );

  const handleTransfer = useCallback(
    async (targetNumber: string) => {
      if (!currentOrganization?.id) return;
      if (!currentCall) return;

      const callSid = (currentCall as any)?.parameters?.CallSid as string | undefined;
      if (!callSid) {
        toast.error('No se pudo detectar el CallSid para transferir.');
        return;
      }

      try {
        await supabase.functions.invoke('twilio-transfer-call', {
          body: {
            organization_id: currentOrganization.id,
            callSid,
            targetNumber,
          },
        });

        setTransferOpen(false);
        setIsOpen(false);
        setIsMinimized(false);
        resetCallUi();
        toast.success('Llamada transferida.');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Error al transferir la llamada');
      }
    },
    [currentCall, currentOrganization?.id, resetCallUi]
  );

  const handleDisableVoipForOrg = useCallback(async () => {
    try {
      await updateOrgSettings.mutateAsync({
        category: 'integrations',
        updates: { voip_enabled: false },
      });
      setIsOpen(false);
      setIsMinimized(false);
    } catch {
      // handled by mutation
    }
  }, [updateOrgSettings]);

  // Don't render anything if VoIP is globally disabled
  if (!voipLoading && voipGloballyEnabled !== true) {
    return null;
  }

  // Tenant-level disable (per org)
  if (!voipLoading && voipGloballyEnabled === true && !tenantVoipEnabled) {
    return null;
  }

  // Minimized pill (solo en llamada)
  if (isMinimized && callState !== 'idle') {
    return (
      <button
        type="button"
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-success px-4 py-3 text-success-foreground shadow-lg"
      >
        <Phone className="h-4 w-4" />
        <span className="font-mono text-sm">{formatDuration(callDuration)}</span>
        <span className="max-w-[10rem] truncate text-sm">{contactInfo?.name ?? phoneNumber}</span>
      </button>
    );
  }

  // Floating button
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-success text-success-foreground shadow-lg transition-transform hover:scale-105"
        aria-label="Abrir teléfono"
      >
        <Phone className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[22rem] overflow-hidden rounded-2xl border bg-card shadow-xl">
      <TransferModal
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
        onTransfer={handleTransfer}
      />
      {/* Header */}
      <div className="flex items-center justify-between gap-2 bg-accent px-4 py-3 text-accent-foreground">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {callState === 'idle'
              ? 'Teléfono'
              : callState === 'connecting'
                ? 'Conectando…'
                : callState === 'ringing'
                  ? 'Llamando…'
                  : callState === 'incoming'
                    ? 'Llamada entrante'
                    : callState === 'on_hold'
                      ? `En espera · ${formatDuration(callDuration)}`
                      : formatDuration(callDuration)}
          </p>
          <p className="truncate text-xs text-accent-foreground/80">
            {contactInfo?.name ? `${contactInfo.name} · ${phoneNumber}` : phoneNumber || 'Listo para marcar'}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {callState !== 'idle' && (
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="rounded-lg p-1.5 text-accent-foreground/80 hover:bg-accent-foreground/10 hover:text-accent-foreground"
              aria-label="Minimizar"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-accent-foreground/80 hover:bg-accent-foreground/10 hover:text-accent-foreground"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 p-4">
        {!voipAvailable && (
          <div className="rounded-xl border bg-muted p-3 text-sm text-muted-foreground">
            Selecciona una organización para activar VoIP.
          </div>
        )}

        {widgetEnabled && !twilioCredentialsConfigured && (
          <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-warning-foreground">
            <p className="font-medium">VoIP no configurado</p>
            <p className="text-xs mt-1 opacity-80">
              Añade las credenciales de Twilio en Configuraciones → Integraciones, o desactiva VoIP para que no se intente inicializar.
            </p>

            <div className="mt-3 flex items-center justify-end gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/app/settings/integrations">Abrir integraciones</Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDisableVoipForOrg}
                disabled={updateOrgSettings.isPending}
              >
                {updateOrgSettings.isPending ? 'Desactivando…' : 'Desactivar VoIP'}
              </Button>
            </div>
          </div>
        )}

        {isConfigured && deviceError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            Error VoIP: {deviceError}
          </div>
        )}

        {isConfigured && !deviceError && !isReady && (
          <div className="rounded-xl border bg-muted p-3 text-sm text-muted-foreground">Conectando teléfono…</div>
        )}

        {/* Incoming */}
        {callState === 'incoming' && (
          <div className="space-y-3">
            <div className="rounded-xl border bg-muted p-3">
              <p className="text-sm font-medium text-foreground">{contactInfo?.name ?? 'Número desconocido'}</p>
              <p className="text-xs text-muted-foreground">{phoneNumber}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  rejectIncoming();
                  resetCallUi();
                }}
                className="rounded-xl bg-muted px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={() => {
                  acceptIncoming();
                  setCallState('in_call');
                }}
                className="rounded-xl bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
              >
                Aceptar
              </button>
            </div>
          </div>
        )}

        {/* Active call */}
        {(callState === 'connecting' || callState === 'ringing' || callState === 'in_call' || callState === 'on_hold') && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-muted p-3">
              <p className="text-sm font-medium text-foreground">{contactInfo?.name ?? phoneNumber}</p>
              {contactInfo?.name && <p className="text-xs text-muted-foreground">{phoneNumber}</p>}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleToggleMute}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium',
                  isMuted ? 'bg-accent text-accent-foreground' : 'bg-card text-foreground hover:bg-muted'
                )}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                Mute
              </button>
              <button
                type="button"
                onClick={handleToggleHold}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium',
                  isOnHold ? 'bg-accent text-accent-foreground' : 'bg-card text-foreground hover:bg-muted'
                )}
              >
                {isOnHold ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                Hold
              </button>
              <button
                type="button"
                onClick={() => setShowDialpad((v) => !v)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium',
                  showDialpad ? 'bg-accent text-accent-foreground' : 'bg-card text-foreground hover:bg-muted'
                )}
              >
                <Grid3X3 className="h-5 w-5" />
                Teclado
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setTransferOpen(true)}
              className="w-full"
            >
              Transferir
            </Button>

            {showDialpad && (
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDialpadPress(d)}
                    className="rounded-xl bg-muted py-3 text-base font-semibold text-foreground hover:bg-muted/80"
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleHangUp}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive px-4 py-3 text-sm font-semibold text-destructive-foreground hover:opacity-90"
            >
              <PhoneOff className="h-4 w-4" />
              Colgar
            </button>
          </div>
        )}

        {/* Idle */}
        {callState === 'idle' && (
          <div className="space-y-3">
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Introduce un número…"
              className="w-full rounded-xl border bg-muted px-4 py-3 text-center font-mono text-lg text-foreground outline-none focus:ring-2 focus:ring-ring"
            />

            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDialpadPress(d)}
                  className="rounded-xl bg-muted py-4 text-xl font-semibold text-foreground hover:bg-muted/80"
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPhoneNumber('')}
                className="rounded-xl bg-muted px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/80"
                disabled={!phoneNumber}
              >
                Borrar
              </button>
              <button
                type="button"
                onClick={handleMakeCall}
                disabled={!phoneNumber.trim() || !isReady || !!deviceError || !voipAvailable || !isConfigured}
                className="flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
              >
                <Phone className="h-4 w-4" />
                Llamar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
