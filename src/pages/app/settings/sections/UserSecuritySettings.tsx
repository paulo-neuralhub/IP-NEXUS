// src/pages/app/settings/sections/UserSecuritySettings.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

export default function UserSecuritySettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Cambiar Contraseña</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Contraseña actual</Label><Input type="password" /></div>
          <div className="space-y-2"><Label>Nueva contraseña</Label><Input type="password" /></div>
          <div className="space-y-2"><Label>Confirmar nueva contraseña</Label><Input type="password" /></div>
          <Button>Cambiar Contraseña</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Autenticación de Dos Factores</CardTitle>
          <CardDescription>Añade una capa extra de seguridad a tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">2FA no configurado</p>
                <p className="text-sm text-muted-foreground">Protege tu cuenta con una app de autenticación</p>
              </div>
            </div>
            <Button>Configurar 2FA</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
