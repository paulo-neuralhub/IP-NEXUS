/**
 * Portal Login Page
 * Página de inicio de sesión para clientes del portal
 */

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle, Shield, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PortalInfo {
  id: string;
  name: string;
  logo_url?: string;
  primary_color?: string;
  organization_name?: string;
}

export default function PortalLogin() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login, verifyMagicLink, isAuthenticated } = usePortalAuth();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [portalInfo, setPortalInfo] = useState<PortalInfo | null>(null);
  const [portalNotFound, setPortalNotFound] = useState(false);

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate(`/portal/${slug}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, navigate, slug]);

  // Cargar info del portal
  useEffect(() => {
    const loadPortalInfo = async () => {
      if (!slug) return;
      
      const { data, error } = await supabase
        .from('client_portals')
        .select(`
          id, portal_name, branding_config, is_active,
          organization:organizations!organization_id(name)
        `)
        .eq('portal_slug', slug)
        .single();
      
      if (error || !data) {
        setPortalNotFound(true);
        return;
      }

      if (!data.is_active) {
        setPortalNotFound(true);
        return;
      }

      const branding = data.branding_config as Record<string, unknown> || {};
      const org = data.organization as { name: string } | null;
      
      setPortalInfo({
        id: data.id,
        name: data.portal_name || '',
        logo_url: branding.logo_url as string | undefined,
        primary_color: branding.primary_color as string | undefined,
        organization_name: org?.name
      });
    };

    loadPortalInfo();
  }, [slug]);

  // Verificar magic link token en URL
  useEffect(() => {
    const token = searchParams.get('token');
    if (token && !isVerifying) {
      handleVerifyToken(token);
    }
  }, [searchParams]);

  const handleVerifyToken = async (token: string) => {
    setIsVerifying(true);
    setError('');
    
    try {
      await verifyMagicLink(token);
      navigate(`/portal/${slug}/dashboard`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('portal.login.error.verify_error'));
      // Limpiar el token de la URL
      navigate(`/portal/${slug}`, { replace: true });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, slug!);
      setEmailSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('portal.login.error.verify_error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Demo mode - Auto login for development
  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // First get the portal ID for this slug
      const { data: portal, error: portalError } = await supabase
        .from('client_portals')
        .select('id, portal_name, branding_config, organization_id')
        .eq('portal_slug', slug)
        .eq('is_active', true)
        .single();

      if (portalError || !portal) {
        throw new Error('Portal no encontrado');
      }

      // Find first active user for this specific portal
      const { data: portalUser, error } = await supabase
        .from('portal_users')
        .select('id, email, name, role, permissions')
        .eq('portal_id', portal.id)
        .eq('status', 'active')
        .limit(1)
        .single();

      if (error || !portalUser) {
        throw new Error('No hay usuarios demo disponibles para este portal');
      }

      // Create demo session directly
      const sessionToken = crypto.randomUUID();
      const sessionData = {
        token: sessionToken,
        odisplayP: portalUser.id,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      };

      localStorage.setItem('portal_session', JSON.stringify(sessionData));
      
      // Reload to trigger auth check
      window.location.href = `/portal/${slug}/dashboard`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en modo demo');
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
              <h2 className="text-xl font-semibold">{t('portal.login.not_available')}</h2>
              <p className="text-muted-foreground">
                {t('portal.login.not_available_desc')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verificando token
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-6">
            <div className="text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
              <h2 className="text-xl font-semibold">{t('portal.login.verifying')}</h2>
              <p className="text-muted-foreground">
                {t('portal.login.validating')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Email enviado
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold">{t('portal.login.check_email')}</h2>
              <p className="text-muted-foreground">
                {t('portal.login.link_sent')}
              </p>
              <p className="font-medium text-foreground">{email}</p>
              <p className="text-sm text-muted-foreground">
                {t('portal.login.link_expires')}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-3 pt-0">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setEmailSent(false)}
            >
              {t('portal.login.use_another')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Formulario de login
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
                <Shield className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          
          <div>
            <CardTitle className="text-2xl">
              {portalInfo?.name || t('portal.login.title')}
            </CardTitle>
            {portalInfo?.organization_name && (
              <CardDescription className="mt-1">
                {portalInfo.organization_name}
              </CardDescription>
            )}
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
                  placeholder={t('portal.login.email_placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t('portal.login.secure_link')}
              </p>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading || !email}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('portal.login.sending')}
                </>
              ) : (
                <>
                  {t('portal.login.submit')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-3 text-center text-xs text-muted-foreground">
          {/* Forgot Password Link */}
          <Button 
            type="button" 
            variant="link" 
            className="text-sm" 
            onClick={() => navigate(`/portal/${slug}/reset-password`)}
          >
            ¿Olvidaste tu contraseña?
          </Button>
          
          {/* Demo Mode Button */}
          <Button 
            type="button" 
            variant="outline" 
            className="w-full border-dashed" 
            onClick={handleDemoLogin}
            disabled={isLoading}
          >
            🔓 Acceso Demo (desarrollo)
          </Button>
          
          <p>{t('portal.login.authorized_only')}</p>
          <p>{t('portal.login.contact_rep')}</p>
        </CardFooter>
      </Card>
    </div>
  );
}
