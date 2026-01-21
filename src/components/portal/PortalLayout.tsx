/**
 * Portal Layout
 * Layout para el portal público de clientes
 */

import { Outlet, Link, useLocation, Navigate, useParams } from 'react-router-dom';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Receipt, 
  MessageSquare,
  LogOut,
  Loader2,
  CheckCircle,
  Clock,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function PortalLayout() {
  const { slug } = useParams<{ slug: string }>();
  const { user, isLoading, isAuthenticated, logout } = usePortalAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={`/portal/${slug}`} replace />;
  }

  const navItems = [
    { href: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { href: 'matters', label: 'Expedientes', icon: Briefcase },
    { href: 'documents', label: 'Documentos', icon: FileText },
    { href: 'invoices', label: 'Facturas', icon: Receipt },
    { href: 'messages', label: 'Mensajes', icon: MessageSquare },
  ];

  // Aplicar colores personalizados del portal
  const portalStyle: React.CSSProperties = user.portal.primary_color 
    ? { '--portal-primary': user.portal.primary_color } as React.CSSProperties
    : {};

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col" style={portalStyle}>
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Nombre del portal */}
            <Link to={`/portal/${slug}/dashboard`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              {user.portal.logo_url ? (
                <img 
                  src={user.portal.logo_url} 
                  alt={user.portal.name}
                  className="h-8 w-auto"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: user.portal.primary_color || 'hsl(var(--primary))' }}
                >
                  <span className="text-white font-bold text-lg">
                    {user.portal.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="font-semibold text-lg hidden sm:block">
                {user.portal.name}
              </span>
            </Link>

            {/* Usuario y acciones */}
            <div className="flex items-center gap-3">
              {/* Notificaciones */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                  3
                </Badge>
              </Button>

              {/* Info usuario */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">
                    {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium max-w-[150px] truncate">
                  {user.name || user.email}
                </span>
              </div>

              {/* Logout */}
              <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground">
                <LogOut className="w-4 h-4" />
                <span className="ml-2 hidden sm:inline">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación */}
      <nav className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const fullPath = `/portal/${slug}/${item.href}`;
              const isActive = location.pathname === fullPath || location.pathname.startsWith(`${fullPath}/`);
              
              return (
                <Link
                  key={item.href}
                  to={fullPath}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    isActive 
                      ? "border-primary text-primary" 
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Status bar */}
      <div className="bg-green-50 border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span>Portal activo</span>
            <span className="text-green-600/70">•</span>
            <Clock className="w-3 h-3" />
            <span className="text-green-600/70">
              Sesión válida por 7 días
            </span>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-background border-t py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>Portal de cliente • {user.portal.name}</p>
            <div className="flex gap-4">
              <Link to="#" className="hover:text-foreground transition-colors">
                Política de privacidad
              </Link>
              <Link to="#" className="hover:text-foreground transition-colors">
                Términos de uso
              </Link>
              <Link to={`/portal/${slug}/messages`} className="hover:text-foreground transition-colors">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
