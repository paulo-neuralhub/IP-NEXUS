import { useMemo } from 'react';
import { Inbox, Save } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

import type { SecureCredentialStatusItem } from '@/hooks/use-secure-credentials';

export type ImapFormState = {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  mailbox: string;
  poll_minutes: number;
};

export function ImapIngestCard({
  form,
  setForm,
  encryptionReady,
  credentials,
  isSaving,
  onSave,
}: {
  form: ImapFormState;
  setForm: React.Dispatch<React.SetStateAction<ImapFormState>>;
  encryptionReady: boolean;
  credentials: SecureCredentialStatusItem[];
  isSaving: boolean;
  onSave: () => Promise<void>;
}) {
  const imapPasswordConfigured = useMemo(() => {
    return credentials.some((i) => i.provider === 'imap' && i.credential_key === 'password' && i.is_configured);
  }, [credentials]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Inbox className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Ingesta Email (IMAP)</CardTitle>
        </div>
        <CardDescription>
          Conecta una bandeja IMAP para importar emails al Inbox (polling). Las credenciales se guardan por organización.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>Activar IMAP</Label>
            <p className="text-sm text-muted-foreground">Habilita la ingesta de emails entrantes desde IMAP</p>
          </div>
          <Switch checked={form.enabled} onCheckedChange={(v) => setForm((p) => ({ ...p, enabled: v }))} />
        </div>

        {form.enabled && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Servidor IMAP</Label>
              <Input value={form.host} onChange={(e) => setForm((p) => ({ ...p, host: e.target.value }))} placeholder="imap.tuempresa.com" />
            </div>
            <div className="space-y-2">
              <Label>Puerto</Label>
              <Input
                type="number"
                value={form.port}
                onChange={(e) => setForm((p) => ({ ...p, port: parseInt(e.target.value || '0', 10) || 993 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Conexión segura (TLS)</Label>
              <div className="h-10 flex items-center">
                <Switch checked={form.secure} onCheckedChange={(v) => setForm((p) => ({ ...p, secure: v }))} />
              </div>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Usuario</Label>
              <Input
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                placeholder="inbox@tuempresa.com"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Contraseña</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder={imapPasswordConfigured ? '•••••••• (ya configurada)' : '••••••••'}
                disabled={!encryptionReady && form.password.trim().length === 0}
              />
              <p className="text-xs text-muted-foreground">
                {imapPasswordConfigured
                  ? 'Ya hay una contraseña guardada. Escribe aquí para reemplazarla.'
                  : 'Se guardará cifrada en cuanto exista ENCRYPTION_KEY.'}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Mailbox</Label>
              <Input
                value={form.mailbox}
                onChange={(e) => setForm((p) => ({ ...p, mailbox: e.target.value }))}
                placeholder="INBOX"
              />
            </div>
            <div className="space-y-2">
              <Label>Polling (minutos)</Label>
              <Input
                type="number"
                value={form.poll_minutes}
                onChange={(e) => setForm((p) => ({ ...p, poll_minutes: parseInt(e.target.value || '0', 10) || 5 }))}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={onSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
