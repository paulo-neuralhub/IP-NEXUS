/**
 * Portal Reset Password Page
 * Solicitar enlace para restablecer contraseña
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle, Shield, ArrowLeft, AlertCircle, KeyRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { portalRequestPasswordReset } from '@/lib/portalAuth';

interface PortalInfo {
  id: string;
  name: string;
  logo_url?: string;
  primary_color?: string;
}

export default function PortalResetPassword() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [portalInfo, setPortalInfo] = useState<PortalInfo | null>(null);
  const [portalNotFound, setPortalNotFound] = useState(false);

  // Cargar info del portal
  useEffect(() => {
    const loadPortalInfo = async () => {
      if (!slug) return;
      
      const { data, error } = await supabase
        .from('client_portals')
        .select('id, portal_name, branding_config, is_active')
        .eq('portal_slug', slug)
        .single();
      
      if (error || !data || !data.is_active) {
        setPortalNotFound(true);
        return;
      }

      const branding = data.branding_config as Record<string, unknown> || {};
      
      setPortalInfo({
        id: data.id,
        name: data.portal_name || '',
        logo_url: branding.logo_url as string | undefined,
        primary_color: branding.primary_color as string | undefined,
      });
    };

    loadPortalInfo();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await portalRequestPasswordReset(email, slug!);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el enlace');
    } finally {
      setIsLoading(false);
    }
  };

  // Portal no encontrado
  if (portalNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold">Portal no disponible</h2>
              <p className="text-muted-foreground">
                El portal solicitado no existe o no está activo.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Email enviado
  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold">Email enviado</h2>
              <p className="text-muted-foreground">
                Si el email está registrado, recibirás instrucciones para restablecer tu contraseña.
              </p>
              <p className="font-medium text-foreground">{email}</p>
              <p className="text-sm text-muted-foreground">
                El enlace expira en 1 hora.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-3 pt-0">
            <Button variant="outline" className="w-full" asChild>
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
                <KeyRound className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          
          <div>
            <CardTitle className="text-2xl">
              Restablecer contraseña
            </CardTitle>
            <CardDescription className="mt-1">
              Te enviaremos un enlace para crear una nueva contraseña
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
            
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading || !email}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar enlace'
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
