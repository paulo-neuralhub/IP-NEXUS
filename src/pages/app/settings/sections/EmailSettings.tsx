import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useOrganizationSettings, useUpdateOrganizationSettings } from '@/hooks/use-settings';
import { useSecureCredentialStatus, useUpsertSecureCredential } from '@/hooks/use-secure-credentials';
import { toast } from 'sonner';

import { ImapIngestCard, type ImapFormState } from './email/ImapIngestCard';
import { SmtpSettingsCard, type SmtpFormState } from './email/SmtpSettingsCard';

export default function EmailSettings() {
  const { data: settings, isLoading } = useOrganizationSettings();
  const updateOrg = useUpdateOrganizationSettings();
  const statusQuery = useSecureCredentialStatus();
  const upsertSecret = useUpsertSecureCredential();

  const [smtpForm, setSmtpForm] = useState<SmtpFormState>({
    enabled: false,
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    default_sender_name: '',
    default_sender_email: '',
  });

  const [imapForm, setImapForm] = useState<ImapFormState>({
    enabled: false,
    host: '',
    port: 993,
    secure: true,
    username: '',
    password: '',
    mailbox: 'INBOX',
    poll_minutes: 5,
  });

  useEffect(() => {
    const email = settings?.email;
    setSmtpForm((prev) => ({
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

    setImapForm((prev) => ({
      ...prev,
      enabled: !!email?.inbound_imap,
      host: email?.imap_config?.host || '',
      port: email?.imap_config?.port || 993,
      secure: email?.imap_config ? !!email.imap_config.secure : true,
      username: email?.imap_config?.username || '',
      password: '',
      mailbox: email?.imap_config?.mailbox || 'INBOX',
      poll_minutes: email?.imap_config?.poll_minutes || 5,
    }));
  }, [settings?.id]);

  const isSaving = updateOrg.isPending || upsertSecret.isPending;
  const credentials = statusQuery.data?.credentials ?? [];
  const encryptionReady = !!statusQuery.data?.encryption_ready;

  const handleSaveSmtp = async () => {
    try {
      await updateOrg.mutateAsync({
        category: 'email',
        updates: {
          custom_smtp: smtpForm.enabled,
          default_sender_name: smtpForm.default_sender_name || undefined,
          default_sender_email: smtpForm.default_sender_email || undefined,
          smtp_config: smtpForm.enabled
            ? {
                host: smtpForm.host,
                port: Number.isFinite(smtpForm.port) ? smtpForm.port : 587,
                secure: !!smtpForm.secure,
                username: smtpForm.username,
                password_encrypted: 'configured',
              }
            : null,
        },
      });

      if (smtpForm.enabled && smtpForm.password.trim().length > 0) {
        const res = await upsertSecret.mutateAsync({
          provider: 'smtp',
          credential_key: 'password',
          value: smtpForm.password,
        });
        if ((res as any)?.error) throw new Error((res as any).message || (res as any).error);
        toast.success('Contraseña SMTP guardada');
        setSmtpForm((p) => ({ ...p, password: '' }));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar');
    }
  };

  const handleSaveImap = async () => {
    try {
      await updateOrg.mutateAsync({
        category: 'email',
        updates: {
          inbound_imap: imapForm.enabled,
          imap_config: imapForm.enabled
            ? {
                host: imapForm.host,
                port: Number.isFinite(imapForm.port) ? imapForm.port : 993,
                secure: !!imapForm.secure,
                username: imapForm.username,
                mailbox: imapForm.mailbox || 'INBOX',
                poll_minutes: Number.isFinite(imapForm.poll_minutes) ? imapForm.poll_minutes : 5,
                password_encrypted: 'configured',
              }
            : null,
        },
      });

      if (imapForm.enabled && imapForm.password.trim().length > 0) {
        const res = await upsertSecret.mutateAsync({
          provider: 'imap',
          credential_key: 'password',
          value: imapForm.password,
        });
        if ((res as any)?.error) throw new Error((res as any).message || (res as any).error);
        toast.success('Contraseña IMAP guardada');
        setImapForm((p) => ({ ...p, password: '' }));
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
        <p className="text-muted-foreground">Configura el envío (SMTP) y la ingesta (IMAP) de emails</p>
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

      <SmtpSettingsCard
        form={smtpForm}
        setForm={setSmtpForm}
        encryptionReady={encryptionReady}
        credentials={credentials}
        isSaving={isSaving}
        onSave={handleSaveSmtp}
      />

      <ImapIngestCard
        form={imapForm}
        setForm={setImapForm}
        encryptionReady={encryptionReady}
        credentials={credentials}
        isSaving={isSaving}
        onSave={handleSaveImap}
      />
    </div>
  );
}
