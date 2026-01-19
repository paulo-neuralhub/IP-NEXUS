import { Link } from 'react-router-dom';
import { 
  Settings, 
  User, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  Shield,
  Database,
  Plug,
  FileText,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Smartphone
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { usePWA } from '@/hooks/use-pwa';
import { useHaptic } from '@/hooks/use-mobile';

interface MenuItem {
  icon: typeof Settings;
  label: string;
  href?: string;
  onClick?: () => void;
  badge?: string;
  external?: boolean;
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
}

export function MobileMenuPage() {
  const { user, signOut } = useAuth();
  const { isInstallable, install, isInstalled } = usePWA();
  const { lightTap } = useHaptic();

  const handleInstall = async () => {
    lightTap();
    await install();
  };

  const menuSections: MenuSection[] = [
    {
      title: 'Cuenta',
      items: [
        { icon: User, label: 'Perfil', href: '/app/settings/profile' },
        { icon: Bell, label: 'Notificaciones', href: '/app/settings/notifications' },
        { icon: CreditCard, label: 'Suscripción', href: '/app/settings/billing' },
      ],
    },
    {
      title: 'Configuración',
      items: [
        { icon: Settings, label: 'Ajustes generales', href: '/app/settings' },
        { icon: Shield, label: 'Seguridad', href: '/app/settings/security' },
        { icon: Database, label: 'Datos', href: '/app/settings/data' },
        { icon: Plug, label: 'Integraciones', href: '/app/settings/integrations' },
      ],
    },
    {
      title: 'Soporte',
      items: [
        { icon: HelpCircle, label: 'Centro de ayuda', href: '/app/help' },
        { icon: FileText, label: 'Documentación', href: '/app/help/docs' },
      ],
    },
  ];

  return (
    <div className="min-h-full bg-muted/30 pb-20">
      {/* User info */}
      <div className="bg-background p-4 border-b">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-lg truncate">
              {user?.email || 'Usuario'}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* PWA Install Banner */}
      {isInstallable && !isInstalled && (
        <Card className="mx-4 mt-4">
          <CardContent className="p-4">
            <button 
              onClick={handleInstall}
              className="flex items-center gap-3 w-full"
            >
              <div className="p-2 rounded-full bg-primary/10">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Instalar aplicación</p>
                <p className="text-sm text-muted-foreground">
                  Acceso rápido desde tu pantalla
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>
      )}

      {/* Menu sections */}
      {menuSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mt-6">
          {section.title && (
            <h3 className="px-4 mb-2 text-sm font-medium text-muted-foreground">
              {section.title}
            </h3>
          )}
          <Card className="mx-4">
            <CardContent className="p-0 divide-y divide-border">
              {section.items.map((item, itemIndex) => (
                <Link
                  key={itemIndex}
                  to={item.href || '#'}
                  onClick={() => {
                    lightTap();
                    item.onClick?.();
                  }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3',
                    'hover:bg-muted/50 transition-colors',
                    'active:bg-muted'
                  )}
                >
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary">{item.badge}</Badge>
                  )}
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      ))}

      {/* Logout */}
      <div className="mt-6 mx-4">
        <Card>
          <CardContent className="p-0">
            <button
              onClick={() => {
                lightTap();
                signOut();
              }}
              className={cn(
                'flex items-center gap-3 px-4 py-3 w-full',
                'hover:bg-muted/50 transition-colors text-destructive',
                'active:bg-muted'
              )}
            >
              <LogOut className="h-5 w-5" />
              <span className="flex-1 text-left font-medium">Cerrar sesión</span>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground mt-6 mb-4">
        IP-NEXUS v1.0.0
      </p>
    </div>
  );
}
