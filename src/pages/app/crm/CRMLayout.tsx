import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutGrid, Building2, Users, TrendingUp, MessageSquareText, CheckSquare, UserPlus, KanbanSquare } from 'lucide-react';
import { ModuleGate } from '@/components/common/ModuleGate';
import { InlineHelp } from '@/components/help';

const navItems = [
  { 
    to: '/app/crm', 
    label: 'Dashboard', 
    icon: LayoutGrid, 
    exact: true,
    help: 'Vista general de tu CRM con métricas clave y actividad reciente.'
  },
  { 
    to: '/app/crm/accounts', 
    label: 'Cuentas', 
    icon: Building2,
    help: 'Empresas y organizaciones con las que trabajas.'
  },
  { 
    to: '/app/crm/contacts', 
    label: 'Contactos', 
    icon: Users,
    help: 'Personas asociadas a tus cuentas y oportunidades.'
  },
  { 
    to: '/app/crm/leads', 
    label: 'Leads', 
    icon: UserPlus,
    help: 'Prospectos potenciales que aún no son clientes.'
  },
  { 
    to: '/app/crm/deals', 
    label: 'Deals', 
    icon: TrendingUp,
    help: 'Oportunidades de negocio en tus pipelines.'
  },
  { 
    to: '/app/crm/pipelines', 
    label: 'Pipelines', 
    icon: KanbanSquare,
    help: 'Configura las etapas de tus procesos de venta.'
  },
  { 
    to: '/app/crm/interactions', 
    label: 'Interacciones', 
    icon: MessageSquareText,
    help: 'Historial de comunicaciones con tus contactos.'
  },
  { 
    to: '/app/crm/tasks', 
    label: 'Tareas', 
    icon: CheckSquare,
    help: 'Seguimiento de actividades pendientes.'
  },
];

export default function CRMLayout() {
  const location = useLocation();
  
  return (
    <ModuleGate module="crm">
      <div className="space-y-4">
        {/* Title */}
        <h1 className="text-2xl font-bold">CRM</h1>
        
        {/* Sub-navigation */}
        <div className="border-b">
          <nav className="flex gap-6 -mb-px overflow-x-auto">
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap',
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.help && <InlineHelp text={item.help} side="bottom" />}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <Outlet />
      </div>
    </ModuleGate>
  );
}
