import { useEffect, useMemo, useState } from 'react';
import { QrCode, Save, ShieldAlert } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { useOrganizationSettings, useUpdateOrganizationSettings } from '@/hooks/use-settings';
import { useSecureCredentialStatus, useUpsertSecureCredential } from '@/hooks/use-secure-credentials';
import { toast } from 'sonner';

type WhatsAppWebQrForm = {
  enabled: boolean;
  webhook_url: string;
  webhook_secret: string;
};

export function WhatsAppWebQrSection() {
  const { data: settings } = useOrganizationSettings();
  const updateSettings = useUpdateOrganizationSettings();
  const statusQuery = useSecureCredentialStatus();
  const upsertSecret = useUpsertSecureCredential();

  const [form, setForm] = useState<WhatsAppWebQrForm>({
    enabled: false,
    webhook_url: '',
    webhook_secret: '',
  });

  useEffect(() => {
    const cfg = (settings?.integrations as any)?.whatsapp_web_qr || {};
    setForm((p) => ({
      ...p,
      enabled: !!cfg.enabled,
      webhook_url: cfg.webhook_url || '',
      webhook_secret: '',
    }));
  }, [settings?.id]);

  const encryptionReady = !!statusQuery.data?.encryption_ready;
  const isSaving = updateSettings.isPending || upsertSecret.isPending;

  const secretConfigured = useMemo(() => {
    const items = statusQuery.data?.credentials ?? [];
    return items.some((i) => i.provider === 'whatsapp_web' && i.credential_key === 'webhook_secret' && i.is_configured);
  }, [statusQuery.data]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        category: 'integrations',
        updates: {
          whatsapp_web_qr: {
            enabled: form.enabled,
            webhook_url: form.webhook_url || null,
            webhook_secret_encrypted: secretConfigured ? 'configured' : undefined,
          },
        },
      });

      if (form.enabled && form.webhook_secret.trim().length > 0) {
        const res = await upsertSecret.mutateAsync({
          provider: 'whatsapp_web',
          credential_key: 'webhook_secret',
          value: form.webhook_secret,
        });
        if ((res as any)?.error) throw new Error((res as any).message || (res as any).error);
        toast.success('Webhook secret guardado');
        setForm((p) => ({ ...p, webhook_secret: '' }));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar WhatsApp Web (QR)');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">WhatsApp Web (QR)</h3>
        <p className="text-muted-foreground">Opción B: sincronización vía servicio externo + webhooks</p>
      </div>

      {!encryptionReady && (
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Falta configurar el cifrado</AlertTitle>
          <AlertDescription>
            Puedes rellenar los campos, pero no se guardarán secretos hasta configurar ENCRYPTION_KEY.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Webhook de sincronización</CardTitle>
          </div>
          <CardDescription>
            Configura el endpoint de tu servicio (n8n/whatsapp-web.js) y un secret para firmar/validar eventos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Activar WhatsApp Web (QR)</Label>
              <p className="text-sm text-muted-foreground">Habilita la ingesta de mensajes vía webhook</p>
            </div>
            <Switch checked={form.enabled} onCheckedChange={(v) => setForm((p) => ({ ...p, enabled: v }))} />
          </div>

          {form.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Webhook URL (tu servicio)</Label>
                <Input
                  value={form.webhook_url}
                  onChange={(e) => setForm((p) => ({ ...p, webhook_url: e.target.value }))}
                  placeholder="https://n8n.tu-dominio.com/webhook/ipnexus-whatsapp"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Webhook secret</Label>
                <Input
                  type="password"
                  value={form.webhook_secret}
                  onChange={(e) => setForm((p) => ({ ...p, webhook_secret: e.target.value }))}
                  placeholder={secretConfigured ? '•••••••• (ya configurado)' : '••••••••'}
                />
                <p className="text-xs text-muted-foreground">
                  {secretConfigured
                    ? 'Ya hay un secret guardado. Escribe aquí para reemplazarlo.'
                    : 'Se guardará cifrado cuando exista ENCRYPTION_KEY.'}
                </p>
              </div>
            </div>
          )}

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
