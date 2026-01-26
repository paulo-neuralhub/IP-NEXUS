/**
 * Portal Profile
 * Perfil del cliente con cambio de contraseña
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { portalRequestMagicLink } from '@/lib/portalAuth';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Lock,
  Bell,
  Shield,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export default function PortalProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = usePortalAuth();
  const [isResetting, setIsResetting] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleResetPassword = async () => {
    if (!user?.email) return;
    
    setIsResetting(true);
    try {
      await portalRequestMagicLink(user.email, user.portal.slug || '');
      toast.success('Se ha enviado un enlace de recuperación a tu email');
    } catch (error) {
      toast.error('Error al enviar el enlace de recuperación');
    } finally {
      setIsResetting(false);
    }
  };

  if (!user) {
    return null;
  }

  const initials = user.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email.charAt(0).toUpperCase();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">
          Gestiona tu información personal y preferencias
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{user.name || 'Usuario'}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                {user.email}
                <Badge variant="outline" className="text-green-600 bg-green-50">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Verificado
                </Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Información Personal
          </CardTitle>
          <CardDescription>
            Datos de tu cuenta (solo lectura)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Nombre completo</Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{user.name || 'No especificado'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Email</Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Para modificar tus datos personales, contacta con tu gestor.
          </p>
        </CardContent>
      </Card>

      {/* Portal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Portal de Cliente
          </CardTitle>
          <CardDescription>
            Información sobre tu acceso al portal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Despacho</Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span>{user.portal.name}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Estado de cuenta</Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Activo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Seguridad
          </CardTitle>
          <CardDescription>
            Gestiona la seguridad de tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Cambiar contraseña</p>
              <p className="text-sm text-muted-foreground">
                Recibirás un enlace en tu email para establecer una nueva contraseña
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleResetPassword}
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Restablecer'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificaciones
          </CardTitle>
          <CardDescription>
            Configura cómo quieres recibir notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificaciones por email</Label>
              <p className="text-sm text-muted-foreground">
                Recibir alertas sobre plazos, documentos y mensajes
              </p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Recordatorios de plazos</Label>
              <p className="text-sm text-muted-foreground">
                Avisos antes del vencimiento de plazos importantes
              </p>
            </div>
            <Switch checked={true} disabled />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Nuevos documentos</Label>
              <p className="text-sm text-muted-foreground">
                Notificación cuando se comparte un documento contigo
              </p>
            </div>
            <Switch checked={true} disabled />
          </div>
        </CardContent>
      </Card>

      {/* Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Permisos
          </CardTitle>
          <CardDescription>
            Funcionalidades disponibles en tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {user.permissions?.view_matters && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Ver expedientes
              </Badge>
            )}
            {user.permissions?.view_documents && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Ver documentos
              </Badge>
            )}
            {user.permissions?.download_documents && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Descargar documentos
              </Badge>
            )}
            {user.permissions?.view_invoices && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Ver facturas
              </Badge>
            )}
            {user.permissions?.send_messages && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Enviar mensajes
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
