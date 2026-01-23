import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Clock,
  Plus,
  Menu,
  FileText,
  CheckSquare,
  Calendar,
  DollarSign,
  Settings,
  Search,
  Bell,
  MessageSquare,
  LucideIcon
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useHaptic } from '@/hooks/use-mobile';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  badge?: number;
}

interface QuickAction {
  icon: LucideIcon;
  label: string;
  path?: string;
  action?: string;
}

const mainNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
  { icon: Briefcase, label: 'Expedientes', path: '/app/docket' },
  { icon: Users, label: 'CRM', path: '/app/crm' },
  { icon: Clock, label: 'Tiempo', path: '/app/legal-ops/time' },
];

const quickActions: QuickAction[] = [
  { icon: Briefcase, label: 'Nuevo Expediente', path: '/app/docket/new' },
  { icon: Users, label: 'Nuevo Contacto', path: '/app/crm/contacts/new' },
  { icon: CheckSquare, label: 'Nueva Tarea', path: '/app/legal-ops/tasks' },
  { icon: Calendar, label: 'Nuevo Evento', path: '/app/legal-ops/calendar' },
  { icon: FileText, label: 'Nuevo Documento', path: '/app/legal-ops/documents' },
  { icon: Clock, label: 'Registrar Tiempo', action: 'start-timer' },
];

const moreMenuItems: NavItem[] = [
  { icon: Search, label: 'IP Spider', path: '/app/spider' },
  { icon: MessageSquare, label: 'Comunicaciones', path: '/app/communications' },
  { icon: FileText, label: 'Documentos', path: '/app/legal-ops/documents' },
  { icon: CheckSquare, label: 'Tareas', path: '/app/legal-ops/tasks' },
  { icon: Calendar, label: 'Calendario', path: '/app/legal-ops/calendar' },
  { icon: DollarSign, label: 'Finanzas', path: '/app/finance' },
  { icon: Bell, label: 'Notificaciones', path: '/app/notifications' },
  { icon: Settings, label: 'Configuración', path: '/app/settings' },
];

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { lightTap, success } = useHaptic();
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleQuickAction = (action: QuickAction) => {
    lightTap();
    setQuickActionsOpen(false);
    if (action.action === 'start-timer') {
      // Disparar evento global para iniciar timer
      window.dispatchEvent(new CustomEvent('start-global-timer'));
      success();
    } else if (action.path) {
      navigate(action.path);
    }
  };

  const handleNavClick = (path: string) => {
    lightTap();
    navigate(path);
  };

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
          {/* Primeros 2 items */}
          {mainNavItems.slice(0, 2).map((item) => (
            <NavButton
              key={item.path}
              item={item}
              isActive={isActive(item.path)}
              onClick={() => handleNavClick(item.path)}
            />
          ))}

          {/* FAB Central - Quick Actions */}
          <Sheet open={quickActionsOpen} onOpenChange={setQuickActionsOpen}>
            <SheetTrigger asChild>
              <button 
                className="relative -top-4 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center touch-target"
                onClick={() => lightTap()}
              >
                <Plus className="w-6 h-6 text-primary-foreground" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl">
              <SheetHeader className="text-left pb-4">
                <SheetTitle>{t('common.new')}</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-3 gap-4 pb-safe">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-muted active:bg-muted/80 touch-target"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <action.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs text-center text-foreground font-medium">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Últimos 2 items */}
          {mainNavItems.slice(2, 4).map((item) => (
            <NavButton
              key={item.path}
              item={item}
              isActive={isActive(item.path)}
              onClick={() => handleNavClick(item.path)}
            />
          ))}

          {/* More Menu */}
          <Sheet open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
            <SheetTrigger asChild>
              <button 
                className="flex flex-col items-center justify-center min-w-[64px] py-2 touch-target"
                onClick={() => lightTap()}
              >
                <Menu className="w-5 h-5 text-muted-foreground" />
                <span className="text-[10px] mt-1 text-muted-foreground">Más</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl max-h-[70vh]">
              <SheetHeader className="text-left pb-4">
                <SheetTitle>{t('nav.settings')}</SheetTitle>
              </SheetHeader>
              <div className="space-y-1 pb-safe overflow-y-auto">
                {moreMenuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      lightTap();
                      setMoreMenuOpen(false);
                      navigate(item.path);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-3 rounded-xl touch-target",
                      isActive(item.path) 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted active:bg-muted/80"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  );
}

function NavButton({ 
  item, 
  isActive, 
  onClick 
}: { 
  item: NavItem; 
  isActive: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center min-w-[64px] py-2 touch-target transition-colors",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    >
      <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
      <span className={cn(
        "text-[10px] mt-1",
        isActive ? "font-semibold" : "font-medium"
      )}>
        {item.label}
      </span>
      {item.badge && item.badge > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
    </button>
  );
}
