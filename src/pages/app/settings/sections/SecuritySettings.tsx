// src/pages/app/settings/sections/SecuritySettings.tsx
import { useState, useEffect } from 'react';
import { useOrganizationSettings, useUpdateOrganizationSettings } from '@/hooks/use-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, Shield } from 'lucide-react';

export default function SecuritySettings() {
  const { data: settings, isLoading } = useOrganizationSettings();
  const updateMutation = useUpdateOrganizationSettings();

  const [formData, setFormData] = useState({
    require_2fa: false,
    session_timeout_minutes: 480,
    max_sessions_per_user: 5,
    login_alerts: true,
    password_policy: {
      min_length: 12,
      require_uppercase: true,
      require_lowercase: true,
      require_numbers: true,
      require_symbols: false,
      max_age_days: 0,
      prevent_reuse: 0,
    },
  });

  useEffect(() => {
    if (settings?.security) {
      setFormData({
        require_2fa: settings.security.require_2fa || false,
        session_timeout_minutes: settings.security.session_timeout_minutes || 480,
        max_sessions_per_user: settings.security.max_sessions_per_user || 5,
        login_alerts: settings.security.login_alerts ?? true,
        password_policy: {
          min_length: settings.security.password_policy?.min_length || 12,
          require_uppercase: settings.security.password_policy?.require_uppercase ?? true,
          require_lowercase: settings.security.password_policy?.require_lowercase ?? true,
          require_numbers: settings.security.password_policy?.require_numbers ?? true,
          require_symbols: settings.security.password_policy?.require_symbols ?? false,
          max_age_days: settings.security.password_policy?.max_age_days || 0,
          prevent_reuse: settings.security.password_policy?.prevent_reuse || 0,
        },
      });
    }
  }, [settings]);

  const updatePasswordPolicy = (key: string, value: any) => {
    setFormData({
      ...formData,
      password_policy: {
        ...formData.password_policy,
        [key]: value,
      },
    });
  };

  const handleSave = () => {
    updateMutation.mutate({
      category: 'security',
      updates: formData,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Autenticación
          </CardTitle>
          <CardDescription>
            Configura los requisitos de seguridad para tu equipo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Requerir 2FA</Label>
              <p className="text-sm text-muted-foreground">
                Todos los usuarios deberán activar autenticación de dos factores
              </p>
            </div>
            <Switch
              checked={formData.require_2fa}
              onCheckedChange={(checked) => setFormData({ ...formData, require_2fa: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Alertas de inicio de sesión</Label>
              <p className="text-sm text-muted-foreground">
                Enviar notificación al usuario cuando inicie sesión desde un nuevo dispositivo
              </p>
            </div>
            <Switch
              checked={formData.login_alerts}
              onCheckedChange={(checked) => setFormData({ ...formData, login_alerts: checked })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Single Sign-On (SSO)</Label>
              <p className="text-sm text-muted-foreground">
                Permite inicio de sesión con proveedor de identidad corporativo
              </p>
            </div>
            <Badge variant="outline">Enterprise</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Password Policy */}
      <Card>
        <CardHeader>
          <CardTitle>Política de Contraseñas</CardTitle>
          <CardDescription>
            Define los requisitos mínimos para las contraseñas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Longitud mínima</Label>
              <Input
                type="number"
                min={8}
                max={32}
                value={formData.password_policy.min_length}
                onChange={(e) => updatePasswordPolicy('min_length', parseInt(e.target.value) || 12)}
              />
            </div>
            <div className="space-y-2">
              <Label>Caducidad (días)</Label>
              <Input
                type="number"
                min={0}
                value={formData.password_policy.max_age_days}
                onChange={(e) => updatePasswordPolicy('max_age_days', parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">0 = Sin caducidad</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Requisitos</Label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2">
                <Switch
                  checked={formData.password_policy.require_uppercase}
                  onCheckedChange={(checked) => updatePasswordPolicy('require_uppercase', checked)}
                />
                <span className="text-sm">Mayúsculas (A-Z)</span>
              </label>
              <label className="flex items-center gap-2">
                <Switch
                  checked={formData.password_policy.require_lowercase}
                  onCheckedChange={(checked) => updatePasswordPolicy('require_lowercase', checked)}
                />
                <span className="text-sm">Minúsculas (a-z)</span>
              </label>
              <label className="flex items-center gap-2">
                <Switch
                  checked={formData.password_policy.require_numbers}
                  onCheckedChange={(checked) => updatePasswordPolicy('require_numbers', checked)}
                />
                <span className="text-sm">Números (0-9)</span>
              </label>
              <label className="flex items-center gap-2">
                <Switch
                  checked={formData.password_policy.require_symbols}
                  onCheckedChange={(checked) => updatePasswordPolicy('require_symbols', checked)}
                />
                <span className="text-sm">Símbolos (!@#$)</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Sesiones</CardTitle>
          <CardDescription>
            Configura el comportamiento de las sesiones de usuario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Timeout de sesión (minutos)</Label>
              <Input
                type="number"
                min={15}
                value={formData.session_timeout_minutes}
                onChange={(e) => setFormData({ ...formData, session_timeout_minutes: parseInt(e.target.value) || 480 })}
              />
              <p className="text-xs text-muted-foreground">
                Tiempo de inactividad antes de cerrar sesión automáticamente
              </p>
            </div>
            <div className="space-y-2">
              <Label>Máximo sesiones por usuario</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={formData.max_sessions_per_user}
                onChange={(e) => setFormData({ ...formData, max_sessions_per_user: parseInt(e.target.value) || 5 })}
              />
              <p className="text-xs text-muted-foreground">
                Número máximo de dispositivos activos simultáneamente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </div>
  );
}
