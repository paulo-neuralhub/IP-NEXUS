/**
 * Portal Update Password Page
 * Establecer nueva contraseña después de reset
 */

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, KeyRound, AlertCircle, Eye, EyeOff, ArrowLeft, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { portalSetPassword } from '@/lib/portalAuth';

interface PortalInfo {
  id: string;
  name: string;
  logo_url?: string;
  primary_color?: string;
}

export default function PortalUpdatePassword() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [portalInfo, setPortalInfo] = useState<PortalInfo | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const token = searchParams.get('token');

  // Verificar token y cargar info del portal
  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !slug) {
        setTokenValid(false);
        return;
      }
      
      // Verificar que el token existe y no ha expirado
      const { data: portalUser, error } = await supabase
        .from('portal_users')
        .select(`
          id, reset_token_expires_at,
          portal:client_portals!portal_id(
            id, portal_slug, portal_name, branding_config, is_active
          )
        `)
        .eq('reset_token', token)
        .single();

      if (error || !portalUser) {
        setTokenValid(false);
        return;
      }

      const portal = portalUser.portal as any;
      
      if (!portal || portal.portal_slug !== slug || !portal.is_active) {
        setTokenValid(false);
        return;
      }

      // Verificar expiración
      if (new Date(portalUser.reset_token_expires_at) < new Date()) {
        setTokenValid(false);
        return;
      }

      setTokenValid(true);
      
      const branding = portal.branding_config as Record<string, unknown> || {};
      setPortalInfo({
        id: portal.id,
        name: portal.portal_name || '',
        logo_url: branding.logo_url as string | undefined,
        primary_color: branding.primary_color as string | undefined,
      });
    };

    verifyToken();
  }, [token, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await portalSetPassword(token!, password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargando
  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-6">
            <div className="text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
              <h2 className="text-xl font-semibold">Verificando enlace...</h2>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Token inválido
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold">Enlace inválido o expirado</h2>
              <p className="text-muted-foreground">
                El enlace para restablecer la contraseña no es válido o ha expirado.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-3 pt-0">
            <Button className="w-full" asChild>
              <Link to={`/portal/${slug}/reset-password`}>
                Solicitar nuevo enlace
              </Link>
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link to={`/portal/${slug}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio de sesión
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Éxito
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold">Contraseña actualizada</h2>
              <p className="text-muted-foreground">
                Tu contraseña ha sido actualizada correctamente.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-3 pt-0">
            <Button className="w-full" asChild>
              <Link to={`/portal/${slug}`}>
                Iniciar sesión
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Formulario
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          {/* Logo del portal */}
          <div className="mx-auto">
            {portalInfo?.logo_url ? (
              <img 
                src={portalInfo.logo_url} 
                alt={portalInfo.name}
                className="h-16 w-auto"
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: portalInfo?.primary_color || 'hsl(var(--primary))' }}
              >
                <Lock className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          
          <div>
            <CardTitle className="text-2xl">
              Nueva contraseña
            </CardTitle>
            <CardDescription className="mt-1">
              Introduce tu nueva contraseña
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nueva contraseña</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 pr-10"
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirmar contraseña</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repite la contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10"
                    minLength={8}
                  />
                </div>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading || !password || !confirmPassword}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar contraseña'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <Button variant="ghost" className="w-full" asChild>
            <Link to={`/portal/${slug}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio de sesión
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
