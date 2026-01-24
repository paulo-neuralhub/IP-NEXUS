/**
 * Portal Index Page
 * Shows available client portals or redirects to login
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Building2, ArrowRight, Search } from 'lucide-react';

interface PortalInfo {
  id: string;
  portal_slug: string;
  portal_name: string;
  logo_url?: string;
  primary_color?: string;
}

export default function PortalIndex() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [portals, setPortals] = useState<PortalInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [portalSlug, setPortalSlug] = useState('');

  // Check if there's a direct slug parameter
  const directSlug = searchParams.get('slug');

  useEffect(() => {
    if (directSlug) {
      navigate(`/portal/${directSlug}`, { replace: true });
      return;
    }

    loadPublicPortals();
  }, [directSlug, navigate]);

  const loadPublicPortals = async () => {
    try {
      const { data, error } = await supabase
        .from('client_portals')
        .select('id, portal_slug, portal_name, branding_config')
        .eq('is_active', true)
        .limit(10);

      if (error) throw error;

      setPortals(
        (data || []).map(p => ({
          id: p.id,
          portal_slug: p.portal_slug,
          portal_name: p.portal_name,
          logo_url: (p.branding_config as any)?.logo_url,
          primary_color: (p.branding_config as any)?.primary_color,
        }))
      );
    } catch (err) {
      console.error('Error loading portals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (portalSlug.trim()) {
      navigate(`/portal/${portalSlug.trim()}`);
    }
  };

  const filteredPortals = portals.filter(p =>
    p.portal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.portal_slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">Portal de Clientes</h1>
          <p className="text-muted-foreground mt-1">
            Accede al portal de tu empresa para gestionar expedientes, facturas y más.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Direct Access Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acceso Directo</CardTitle>
            <CardDescription>
              Introduce el código de tu portal para acceder directamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDirectAccess} className="flex gap-3">
              <Input
                placeholder="Código del portal (ej: mi-empresa)"
                value={portalSlug}
                onChange={(e) => setPortalSlug(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!portalSlug.trim()}>
                Acceder
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Available Portals */}
        {portals.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Portales Disponibles</h2>
              {portals.length > 3 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-[200px]"
                  />
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {filteredPortals.map((portal) => (
                <Link
                  key={portal.id}
                  to={`/portal/${portal.portal_slug}`}
                  className="block group"
                >
                  <Card className="transition-all hover:shadow-md hover:border-primary/30">
                    <CardContent className="p-4 flex items-center gap-4">
                      {portal.logo_url ? (
                        <img
                          src={portal.logo_url}
                          alt={portal.portal_name}
                          className="w-12 h-12 rounded-lg object-contain"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: portal.primary_color || 'hsl(var(--primary))' }}
                        >
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {portal.portal_name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          /{portal.portal_slug}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {filteredPortals.length === 0 && searchTerm && (
              <p className="text-center text-muted-foreground py-8">
                No se encontraron portales para "{searchTerm}"
              </p>
            )}
          </div>
        )}

        {/* Help Text */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="p-6 text-center text-muted-foreground">
            <p>
              ¿No encuentras tu portal? Contacta con tu representante para obtener el enlace de acceso correcto.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
