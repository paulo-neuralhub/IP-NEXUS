import { useEffect, useMemo, useState } from 'react';
import { Mail, ShieldAlert, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useOrganizationSettings, useUpdateOrganizationSettings } from '@/hooks/use-settings';
import { useSecureCredentialStatus, useUpsertSecureCredential } from '@/hooks/use-secure-credentials';
import { toast } from 'sonner';

export default function EmailSettings() {
  const { data: settings, isLoading } = useOrganizationSettings();
  const updateOrg = useUpdateOrganizationSettings();
  const statusQuery = useSecureCredentialStatus();
  const upsertSecret = useUpsertSecureCredential();

  const [form, setForm] = useState({
    enabled: false,
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    default_sender_name: '',
    default_sender_email: '',
  });

  useEffect(() => {
    const email = settings?.email;
    setForm((prev) => ({
      ...prev,
      enabled: !!email?.custom_smtp,
      host: email?.smtp_config?.host || '',
      port: email?.smtp_config?.port || 587,
      secure: !!email?.smtp_config?.secure,
      username: email?.smtp_config?.username || '',
      password: '',
      default_sender_name: email?.default_sender_name || '',
      default_sender_email: email?.default_sender_email || '',
    }));
  }, [settings?.id]);

  const isSaving = updateOrg.isPending || upsertSecret.isPending;

  const smtpPasswordConfigured = useMemo(() => {
    const items = statusQuery.data?.credentials ?? [];
    return items.some((i) => i.provider === 'smtp' && i.credential_key === 'password' && i.is_configured);
  }, [statusQuery.data]);

  const encryptionReady = !!statusQuery.data?.encryption_ready;

  const handleSave = async () => {
    try {
      // Save non-secret config in org settings
      await updateOrg.mutateAsync({
        category: 'email',
        updates: {
          custom_smtp: form.enabled,
          default_sender_name: form.default_sender_name || undefined,
          default_sender_email: form.default_sender_email || undefined,
          smtp_config: form.enabled
            ? {
                host: form.host,
                port: Number.isFinite(form.port) ? form.port : 587,
                secure: !!form.secure,
                username: form.username,
                password_encrypted: smtpPasswordConfigured ? 'configured' : undefined,
              }
            : null,
        },
      });

      // Save password (secret) separately if provided
      if (form.enabled && form.password.trim().length > 0) {
        const res = await upsertSecret.mutateAsync({
          provider: 'smtp',
          credential_key: 'password',
          value: form.password,
        });
        if ((res as any)?.error) throw new Error((res as any).message || (res as any).error);
        toast.success('Contraseña SMTP guardada');
        setForm((p) => ({ ...p, password: '' }));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email</CardTitle>
          <CardDescription>Cargando…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Email</h2>
        <p className="text-muted-foreground">Configura el envío de emails (SMTP)</p>
      </div>

      {!encryptionReady && (
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Falta configurar el cifrado</AlertTitle>
          <AlertDescription>
            Puedes    rellenar los campos, pero no se guardarán contraseñas hasta configurar ENCRYPTION_KEY.
          </AlertDescription>
        </Alert>
      )}

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
