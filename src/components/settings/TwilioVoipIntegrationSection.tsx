import { useEffect, useMemo, useState } from 'react';
import { PhoneCall, Save, ShieldAlert } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useSecureCredentialStatus, useUpsertSecureCredential } from '@/hooks/use-secure-credentials';
import { toast } from 'sonner';

type TwilioVoipFormState = {
  account_sid: string;
  api_key_sid: string;
  api_key_secret: string;
  twiml_app_sid: string;
};

function configured(status: any, key: string) {
  const items = status?.credentials ?? [];
  return items.some((i: any) => i.provider === 'twilio' && i.credential_key === key && i.is_configured);
}

export function TwilioVoipIntegrationSection() {
  const statusQuery = useSecureCredentialStatus();
  const upsertSecret = useUpsertSecureCredential();

  const [form, setForm] = useState<TwilioVoipFormState>({
    account_sid: '',
    api_key_sid: '',
    api_key_secret: '',
    twiml_app_sid: '',
  });

  useEffect(() => {
    // No precargamos secretos
    setForm({ account_sid: '', api_key_sid: '', api_key_secret: '', twiml_app_sid: '' });
  }, [statusQuery.data?.encryption_ready]);

  const encryptionReady = !!statusQuery.data?.encryption_ready;
  const isSaving = upsertSecret.isPending;

  const accountSidConfigured = useMemo(() => configured(statusQuery.data, 'account_sid'), [statusQuery.data]);
  const apiKeySidConfigured = useMemo(() => configured(statusQuery.data, 'api_key_sid'), [statusQuery.data]);
  const apiKeySecretConfigured = useMemo(() => configured(statusQuery.data, 'api_key_secret'), [statusQuery.data]);
  const twimlAppConfigured = useMemo(() => configured(statusQuery.data, 'twiml_app_sid'), [statusQuery.data]);

  const handleSave = async () => {
    try {
      const writes: Array<Promise<unknown>> = [];
      if (form.account_sid.trim()) {
        writes.push(
          upsertSecret.mutateAsync({ provider: 'twilio', credential_key: 'account_sid', value: form.account_sid.trim() })
        );
      }
      if (form.api_key_sid.trim()) {
        writes.push(
          upsertSecret.mutateAsync({ provider: 'twilio', credential_key: 'api_key_sid', value: form.api_key_sid.trim() })
        );
      }
      if (form.api_key_secret.trim()) {
        writes.push(
          upsertSecret.mutateAsync({ provider: 'twilio', credential_key: 'api_key_secret', value: form.api_key_secret.trim() })
        );
      }
      if (form.twiml_app_sid.trim()) {
        writes.push(
          upsertSecret.mutateAsync({ provider: 'twilio', credential_key: 'twiml_app_sid', value: form.twiml_app_sid.trim() })
        );
      }

      if (writes.length === 0) {
        toast.message('No hay cambios');
        return;
      }

      await Promise.all(writes);
      toast.success('Credenciales VoIP guardadas');
      setForm({ account_sid: '', api_key_sid: '', api_key_secret: '', twiml_app_sid: '' });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar VoIP');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">VoIP (Twilio)</h2>
        <p className="text-muted-foreground">Configura el softphone y tokens de voz por organización</p>
      </div>

      {!encryptionReady && (
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Falta configurar el cifrado</AlertTitle>
          <AlertDescription>
            Puedes rellenar los campos, pero no se guardarán credenciales hasta configurar ENCRYPTION_KEY.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Twilio Voice</CardTitle>
          </div>
          <CardDescription>
            Se guardan cifradas por tenant (secure-credentials) y se usan en la Edge Function <code>twilio-voice-token</code>.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Account SID</Label>
              <Input
                type="password"
                value={form.account_sid}
                onChange={(e) => setForm((p) => ({ ...p, account_sid: e.target.value }))}
                placeholder={accountSidConfigured ? '•••••• (ya configurado)' : 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
              />
            </div>
            <div className="space-y-2">
              <Label>API Key SID</Label>
              <Input
                type="password"
                value={form.api_key_sid}
                onChange={(e) => setForm((p) => ({ ...p, api_key_sid: e.target.value }))}
                placeholder={apiKeySidConfigured ? '•••••• (ya configurado)' : 'SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
              />
            </div>
            <div className="space-y-2">
              <Label>API Key Secret</Label>
              <Input
                type="password"
                value={form.api_key_secret}
                onChange={(e) => setForm((p) => ({ ...p, api_key_secret: e.target.value }))}
                placeholder={apiKeySecretConfigured ? '•••••• (ya configurado)' : '••••••••••••••'}
              />
            </div>
            <div className="space-y-2">
              <Label>TwiML App SID</Label>
              <Input
                type="password"
                value={form.twiml_app_sid}
                onChange={(e) => setForm((p) => ({ ...p, twiml_app_sid: e.target.value }))}
                placeholder={twimlAppConfigured ? '•••••• (ya configurado)' : 'APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
