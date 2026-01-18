import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard,
  Settings,
  Flag,
  Megaphone,
  MessageSquare,
  FileText,
  Shield,
  Key
} from 'lucide-react';
import { useIsSuperadmin } from '@/hooks/use-admin';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

const ADMIN_NAV = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/organizations', label: 'Organizaciones', icon: Building2 },
  { path: '/admin/users', label: 'Usuarios', icon: Users },
  { path: '/admin/subscriptions', label: 'Suscripciones', icon: CreditCard },
  { path: '/admin/api-keys', label: 'API Keys', icon: Key },
  { path: '/admin/feature-flags', label: 'Feature Flags', icon: Flag },
  { path: '/admin/announcements', label: 'Anuncios', icon: Megaphone },
  { path: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
  { path: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
  { path: '/admin/settings', label: 'Configuración', icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const { data: isSuperadmin, isLoading } = useIsSuperadmin();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="w-8 h-8" />
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }
  
  if (!isSuperadmin) {
    return <Navigate to="/app" replace />;
  }
  
  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary text-secondary-foreground flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">Admin Panel</span>
          </div>
        </div>
        
        <nav className="p-4 space-y-1 flex-1">
          {ADMIN_NAV.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive 
                    ? "bg-white/10 text-white" 
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <Link 
            to="/app"
            className="block text-center py-2 text-white/60 hover:text-white text-sm"
          >
            ← Volver a la app
          </Link>
        </div>
      </aside>
      
      {/* Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
