import { useMemo } from 'react';
import { Mail, Save } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

import type { SecureCredentialStatusItem } from '@/hooks/use-secure-credentials';

export type SmtpFormState = {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  default_sender_name: string;
  default_sender_email: string;
};

export function SmtpSettingsCard({
  form,
  setForm,
  encryptionReady,
  credentials,
  isSaving,
  onSave,
}: {
  form: SmtpFormState;
  setForm: React.Dispatch<React.SetStateAction<SmtpFormState>>;
  encryptionReady: boolean;
  credentials: SecureCredentialStatusItem[];
  isSaving: boolean;
  onSave: () => Promise<void>;
}) {
  const smtpPasswordConfigured = useMemo(() => {
    return credentials.some((i) => i.provider === 'smtp' && i.credential_key === 'password' && i.is_configured);
  }, [credentials]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">SMTP personalizado</CardTitle>
        </div>
        <CardDescription>Envía desde tu servidor (o proveedor) SMTP</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>Activar SMTP</Label>
            <p className="text-sm text-muted-foreground">Usar SMTP en lugar del proveedor por defecto</p>
          </div>
          <Switch checked={form.enabled} onCheckedChange={(v) => setForm((p) => ({ ...p, enabled: v }))} />
        </div>

        {form.enabled && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Servidor</Label>
              <Input value={form.host} onChange={(e) => setForm((p) => ({ ...p, host: e.target.value }))} placeholder="smtp.tuempresa.com" />
            </div>
            <div className="space-y-2">
              <Label>Puerto</Label>
              <Input
                type="number"
                value={form.port}
                onChange={(e) => setForm((p) => ({ ...p, port: parseInt(e.target.value || '0', 10) || 587 }))}
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
              <Input value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} placeholder="notificaciones@tuempresa.com" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Contraseña</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder={smtpPasswordConfigured ? '•••••••• (ya configurada)' : '••••••••'}
                disabled={!encryptionReady && form.password.trim().length === 0}
              />
              <p className="text-xs text-muted-foreground">
                {smtpPasswordConfigured
                  ? 'Ya hay una contraseña guardada. Escribe aquí para reemplazarla.'
                  : 'Se guardará cifrada en cuanto exista ENCRYPTION_KEY.'}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="space-y-2">
            <Label>Nombre remitente</Label>
            <Input value={form.default_sender_name} onChange={(e) => setForm((p) => ({ ...p, default_sender_name: e.target.value }))} placeholder="IP-NEXUS" />
          </div>
          <div className="space-y-2">
            <Label>Email remitente</Label>
            <Input value={form.default_sender_email} onChange={(e) => setForm((p) => ({ ...p, default_sender_email: e.target.value }))} placeholder="noreply@tuempresa.com" />
          </div>
        </div>

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
