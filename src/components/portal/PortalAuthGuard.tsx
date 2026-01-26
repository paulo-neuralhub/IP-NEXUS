/**
 * Portal Auth Guard
 * Protege rutas del portal, redirige si no está autenticado
 */

import { ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { Loader2, Shield } from 'lucide-react';

interface PortalAuthGuardProps {
  children: ReactNode;
  requiredPermission?: string;
}

export function PortalAuthGuard({ children, requiredPermission }: PortalAuthGuardProps) {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, isLoading, user } = usePortalAuth();

  // Mostrar loading mientras verifica
  if (isLoading) {
    return <PortalLoadingScreen />;
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated || !user) {
    return <Navigate to={`/portal/${slug}`} replace />;
  }

  // Verificar que el usuario pertenece a este portal
  if (user.portal.slug !== slug) {
    return <Navigate to={`/portal/${slug}`} replace />;
  }

  // Verificar permiso específico si se requiere
  if (requiredPermission && !user.permissions[requiredPermission]) {
    return <PortalAccessDenied permission={requiredPermission} />;
  }

  return <>{children}</>;
}

/**
 * Pantalla de carga del portal
 */
function PortalLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
          <Shield className="absolute inset-0 w-6 h-6 m-auto text-primary" />
        </div>
        <div className="space-y-1">
          <p className="font-medium">Cargando portal</p>
          <p className="text-sm text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Pantalla de acceso denegado
 */
function PortalAccessDenied({ permission }: { permission: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">Acceso restringido</h2>
        <p className="text-muted-foreground">
          No tienes permisos para acceder a esta sección.
          {permission && (
            <span className="block mt-1 text-sm">
              Permiso requerido: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{permission}</code>
            </span>
          )}
        </p>
        <p className="text-sm text-muted-foreground">
          Contacta con tu representante para solicitar acceso.
        </p>
      </div>
    </div>
  );
}

export default PortalAuthGuard;
