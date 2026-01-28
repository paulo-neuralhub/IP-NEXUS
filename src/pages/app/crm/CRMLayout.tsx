import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  KanbanSquare, UserPlus, Briefcase, Building2, 
  Users, Activity, CheckSquare, Settings2 
} from 'lucide-react';
import { ModuleGate } from '@/components/common/ModuleGate';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Tipo para items de navegación
interface NavItem {
  to: string;
  label: string;
  icon: typeof KanbanSquare;
  description: string;
  exact?: boolean;
  hasBadge?: boolean;
}

// Navegación completa del CRM estilo Bitrix/HubSpot
const navItems: NavItem[] = [
  { 
    to: '/app/crm', 
    label: 'Pipeline', 
    icon: KanbanSquare,
    description: 'Kanban de ventas',
    exact: true,
  },
  { 
    to: '/app/crm/leads', 
    label: 'Leads', 
    icon: UserPlus,
    description: 'Prospectos nuevos',
    hasBadge: true,
  },
  { 
    to: '/app/crm/deals', 
    label: 'Negocios', 
    icon: Briefcase,
    description: 'Oportunidades',
    hasBadge: true,
  },
  { 
    to: '/app/crm/accounts', 
    label: 'Clientes', 
    icon: Building2,
    description: 'Empresas/Cuentas',
  },
  { 
    to: '/app/crm/contacts', 
    label: 'Contactos', 
    icon: Users,
    description: 'Personas',
  },
  { 
    to: '/app/crm/interactions', 
    label: 'Actividades', 
    icon: Activity,
    description: 'Timeline/Historial',
  },
  { 
    to: '/app/crm/tasks', 
    label: 'Tareas', 
    icon: CheckSquare,
    description: 'Pendientes',
    hasBadge: true,
  },
];

const configItem: NavItem = { 
  to: '/app/crm/pipelines', 
  label: 'Configuración', 
  icon: Settings2,
  description: 'Pipelines y etapas',
};

export default function CRMLayout() {
  const location = useLocation();
  
  // Determinar si estamos en una sub-ruta de detalle (no mostrar tabs)
  const isDetailRoute = location.pathname.match(/\/app\/crm\/(accounts|contacts|deals|leads)\/[^/]+/);
  
  // TODO: Conectar con hooks reales para obtener contadores
  const badgeCounts: Record<string, number> = {
    '/app/crm/leads': 12,
    '/app/crm/deals': 8,
    '/app/crm/tasks': 5,
  };

  const renderNavItem = (item: typeof navItems[0], isConfig = false) => {
    const isActive = item.exact
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to);
    const badgeCount = badgeCounts[item.to] || 0;

    return (
      <TooltipProvider key={item.to} delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 border-l-4 border-primary text-primary'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800',
                isConfig && 'mt-2'
              )}
            >
              <item.icon 
                className={cn(
                  'w-5 h-5 shrink-0',
                  isActive ? 'text-primary' : 'text-slate-500'
                )} 
              />
              <div className="flex-1 min-w-0">
                <span className="block truncate">{item.label}</span>
                {item.description && (
                  <span className="block text-xs text-slate-400 truncate">
                    {item.description}
                  </span>
                )}
              </div>
              {item.hasBadge && badgeCount > 0 && (
                <Badge 
                  className={cn(
                    'text-xs font-bold px-2 py-0.5 rounded-full',
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  )}
                >
                  {badgeCount}
                </Badge>
              )}
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            {item.description || item.label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };
  
  return (
    <ModuleGate module="crm">
      <div className="flex gap-6 min-h-[calc(100vh-12rem)]">
        {/* Sidebar de navegación CRM - Solo mostrar en rutas principales */}
        {!isDetailRoute && (
          <aside className="w-64 shrink-0 hidden lg:block">
            <div className="sticky top-4 space-y-1 bg-card rounded-xl border p-3 shadow-sm">
              {/* Header */}
              <div className="px-3 py-2 mb-2">
                <h2 className="text-lg font-bold text-foreground">CRM</h2>
                <p className="text-xs text-muted-foreground">Gestión comercial</p>
              </div>
              
              {/* Main navigation items */}
              <nav className="space-y-1">
                {navItems.map((item) => renderNavItem(item))}
              </nav>
              
              {/* Separator */}
              <Separator className="my-3" />
              
              {/* Config item */}
              {renderNavItem(configItem, true)}
            </div>
          </aside>
        )}
        
        {/* Mobile navigation - horizontal tabs */}
        {!isDetailRoute && (
          <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-background border-t px-2 py-2 overflow-x-auto">
            <nav className="flex gap-1 min-w-max px-2">
              {[...navItems, configItem].map((item) => {
                const isActive = item.exact
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="truncate max-w-[60px]">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}

        {/* Content */}
        <main className={cn("flex-1 min-w-0", !isDetailRoute && "lg:max-w-[calc(100%-16rem-1.5rem)]")}>
          {/* Page header for detail routes */}
          {isDetailRoute && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold">CRM</h1>
              <p className="text-muted-foreground">Gestión comercial</p>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </ModuleGate>
  );
}
