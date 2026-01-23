import { useEffect, useMemo, useState } from 'react';
import { MessageCircle, Save, ShieldAlert } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useOrganization } from '@/contexts/organization-context';
import { useUpdateOrganization } from '@/hooks/use-organization-members';
import { useSecureCredentialStatus, useUpsertSecureCredential } from '@/hooks/use-secure-credentials';
import { toast } from 'sonner';

import { WhatsAppWebQrSection } from '@/components/settings/WhatsAppWebQrSection';

type WhatsAppFormState = {
  whatsapp_business_id: string;
  whatsapp_phone: string;
  whatsapp_phone_number_id: string;
  access_token: string;
  webhook_verify_token: string;
};

export function WhatsAppIntegrationSection() {
  const { currentOrganization } = useOrganization();
  const updateOrg = useUpdateOrganization();
  const statusQuery = useSecureCredentialStatus();
  const upsertSecret = useUpsertSecureCredential();

  const [form, setForm] = useState<WhatsAppFormState>({
    whatsapp_business_id: '',
    whatsapp_phone: '',
    whatsapp_phone_number_id: '',
    access_token: '',
    webhook_verify_token: '',
  });

  useEffect(() => {
    setForm((p) => ({
      ...p,
      whatsapp_business_id: currentOrganization?.whatsapp_business_id || '',
      whatsapp_phone: currentOrganization?.whatsapp_phone || '',
      whatsapp_phone_number_id: currentOrganization?.whatsapp_phone_number_id || '',
      access_token: '',
      webhook_verify_token: '',
    }));
  }, [currentOrganization?.id]);

  const encryptionReady = !!statusQuery.data?.encryption_ready;
  const isSaving = updateOrg.isPending || upsertSecret.isPending;

  const tokenConfigured = useMemo(() => {
    const items = statusQuery.data?.credentials ?? [];
    return items.some((i) => i.provider === 'whatsapp' && i.credential_key === 'access_token' && i.is_configured);
  }, [statusQuery.data]);

  const verifyTokenConfigured = useMemo(() => {
    const items = statusQuery.data?.credentials ?? [];
    return items.some(
      (i) => i.provider === 'whatsapp' && i.credential_key === 'webhook_verify_token' && i.is_configured
    );
  }, [statusQuery.data]);

  const handleSave = async () => {
    if (!currentOrganization?.id) return;

    try {
      // 1) Guardar IDs no sensibles en organizations
      await updateOrg.mutateAsync({
        whatsapp_business_id: form.whatsapp_business_id || null,
        whatsapp_phone: form.whatsapp_phone || null,
        whatsapp_phone_number_id: form.whatsapp_phone_number_id || null,
      } as any);

      // 2) Guardar secretos cifrados (si se aportan)
      if (form.access_token.trim().length > 0) {
        await upsertSecret.mutateAsync({
          provider: 'whatsapp',
          credential_key: 'access_token',
          value: form.access_token,
        });
        toast.success('Token de WhatsApp guardado');
      }

      if (form.webhook_verify_token.trim().length > 0) {
        await upsertSecret.mutateAsync({
          provider: 'whatsapp',
          credential_key: 'webhook_verify_token',
          value: form.webhook_verify_token,
        });
        toast.success('Verify token guardado');
      }

      setForm((p) => ({ ...p, access_token: '', webhook_verify_token: '' }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar WhatsApp');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">WhatsApp</h2>
        <p className="text-muted-foreground">Configura Meta Cloud API por organización</p>
      </div>

      {!encryptionReady && (
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Falta configurar el cifrado</AlertTitle>
          <AlertDescription>
            Puedes rellenar los campos, pero no se guardarán tokens hasta configurar ENCRYPTION_KEY.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Meta Cloud API</CardTitle>
          </div>
          <CardDescription>
            Los IDs se guardan en tu organización. El token se guarda cifrado (no se muestra).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>WhatsApp Business ID</Label>
              <Input
                value={form.whatsapp_business_id}
                onChange={(e) => setForm((p) => ({ ...p, whatsapp_business_id: e.target.value }))}
                placeholder="1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone (display)</Label>
              <Input
                value={form.whatsapp_phone}
                onChange={(e) => setForm((p) => ({ ...p, whatsapp_phone: e.target.value }))}
                placeholder="+34 600 000 000"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Phone Number ID</Label>
              <Input
                value={form.whatsapp_phone_number_id}
                onChange={(e) => setForm((p) => ({ ...p, whatsapp_phone_number_id: e.target.value }))}
                placeholder="111222333444555"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Access Token</Label>
              <Input
                type="password"
                value={form.access_token}
                onChange={(e) => setForm((p) => ({ ...p, access_token: e.target.value }))}
                placeholder={tokenConfigured ? '•••••••• (ya configurado)' : '••••••••'}
              />
              <p className="text-xs text-muted-foreground">
                {tokenConfigured
                  ? 'Ya hay un token guardado. Escribe aquí para reemplazarlo.'
                  : 'Se guardará cifrado cuando exista ENCRYPTION_KEY.'}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Webhook verify token</Label>
              <Input
                type="password"
                value={form.webhook_verify_token}
                onChange={(e) => setForm((p) => ({ ...p, webhook_verify_token: e.target.value }))}
                placeholder={verifyTokenConfigured ? '•••••••• (ya configurado)' : '••••••••'}
              />
              <p className="text-xs text-muted-foreground">
                {verifyTokenConfigured
                  ? 'Ya hay un verify token guardado. Escribe aquí para reemplazarlo.'
                  : 'Se guardará cifrado cuando exista ENCRYPTION_KEY.'}
              </p>
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

      <WhatsAppWebQrSection />
    </div>
  );
}
