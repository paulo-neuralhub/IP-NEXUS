// ============================================
// CALENDAR OAUTH CREDENTIALS SECTION
// Allows organization admins to configure OAuth credentials
// ============================================

import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, ExternalLink, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSystemSettings, useUpdateSystemSetting } from '@/hooks/use-admin';
import { Skeleton } from '@/components/ui/skeleton';

interface OAuthCredentials {
  google_calendar_client_id: string;
  google_calendar_client_secret: string;
  microsoft_calendar_client_id: string;
  microsoft_calendar_client_secret: string;
}

export function CalendarOAuthConfig() {
  const { data: settings, isLoading } = useSystemSettings('integrations');
  const updateSetting = useUpdateSystemSetting();

  const [credentials, setCredentials] = useState<OAuthCredentials>({
    google_calendar_client_id: '',
    google_calendar_client_secret: '',
    microsoft_calendar_client_id: '',
    microsoft_calendar_client_secret: '',
  });

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings into state
  useEffect(() => {
    if (settings) {
      const newCreds: Partial<OAuthCredentials> = {};
      settings.forEach((s: any) => {
        if (s.key in credentials) {
          const value = typeof s.value === 'string' ? s.value : JSON.stringify(s.value).replace(/^"|"$/g, '');
          newCreds[s.key as keyof OAuthCredentials] = value;
        }
      });
      setCredentials((prev) => ({ ...prev, ...newCreds }));
    }
  }, [settings]);

  const handleChange = (key: keyof OAuthCredentials, value: string) => {
    setCredentials((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async (provider: 'google' | 'microsoft') => {
    const keys = provider === 'google'
      ? ['google_calendar_client_id', 'google_calendar_client_secret']
      : ['microsoft_calendar_client_id', 'microsoft_calendar_client_secret'];

    for (const key of keys) {
      await updateSetting.mutateAsync({
        key,
        value: JSON.stringify(credentials[key as keyof OAuthCredentials]),
      });
    }
    setHasChanges(false);
  };

  const toggleSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Credenciales OAuth para Calendarios</CardTitle>
        </div>
        <CardDescription>
          Configura las credenciales OAuth para permitir la sincronización de calendarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="google" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="google">📅 Google Calendar</TabsTrigger>
            <TabsTrigger value="microsoft">📆 Microsoft Outlook</TabsTrigger>
          </TabsList>

          <TabsContent value="google" className="space-y-4 pt-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configuración de Google OAuth</AlertTitle>
              <AlertDescription>
                Crea las credenciales OAuth en{' '}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-primary hover:text-primary/80"
                >
                  Google Cloud Console
                  <ExternalLink className="inline w-3 h-3 ml-1" />
                </a>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="google_client_id">Client ID</Label>
                <Input
                  id="google_client_id"
                  value={credentials.google_calendar_client_id}
                  onChange={(e) => handleChange('google_calendar_client_id', e.target.value)}
                  placeholder="xxxx.apps.googleusercontent.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="google_client_secret">Client Secret</Label>
                <div className="relative mt-1">
                  <Input
                    id="google_client_secret"
                    type={showSecrets.google_secret ? 'text' : 'password'}
                    value={credentials.google_calendar_client_secret}
                    onChange={(e) => handleChange('google_calendar_client_secret', e.target.value)}
                    placeholder="GOCSPX-xxxx"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('google_secret')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showSecrets.google_secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                onClick={() => handleSave('google')}
                disabled={updateSetting.isPending}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateSetting.isPending ? 'Guardando...' : 'Guardar Google'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="microsoft" className="space-y-4 pt-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Configuración de Microsoft OAuth</AlertTitle>
              <AlertDescription>
                Registra la app en{' '}
                <a
                  href="https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-primary hover:text-primary/80"
                >
                  Azure Portal
                  <ExternalLink className="inline w-3 h-3 ml-1" />
                </a>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="microsoft_client_id">Application (client) ID</Label>
                <Input
                  id="microsoft_client_id"
                  value={credentials.microsoft_calendar_client_id}
                  onChange={(e) => handleChange('microsoft_calendar_client_id', e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="microsoft_client_secret">Client Secret</Label>
                <div className="relative mt-1">
                  <Input
                    id="microsoft_client_secret"
                    type={showSecrets.microsoft_secret ? 'text' : 'password'}
                    value={credentials.microsoft_calendar_client_secret}
                    onChange={(e) => handleChange('microsoft_calendar_client_secret', e.target.value)}
                    placeholder="xxxxxx~xxxxx"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('microsoft_secret')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  >
                    {showSecrets.microsoft_secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                onClick={() => handleSave('microsoft')}
                disabled={updateSetting.isPending}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateSetting.isPending ? 'Guardando...' : 'Guardar Microsoft'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
