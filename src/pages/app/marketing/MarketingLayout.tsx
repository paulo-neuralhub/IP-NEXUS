import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutTemplate, Mail, Users, Zap, BarChart3, Megaphone } from 'lucide-react';
import { ModuleGate } from '@/components/common/ModuleGate';
import { InlineHelp } from '@/components/help';

const navItems = [
  { to: '/app/marketing', label: 'Dashboard', icon: BarChart3, exact: true, help: 'Métricas de campañas, tasas de apertura y engagement' },
  { to: '/app/marketing/templates', label: 'Plantillas', icon: LayoutTemplate, help: 'Editor drag-and-drop para crear plantillas de email' },
  { to: '/app/marketing/campaigns', label: 'Campañas', icon: Mail, help: 'Crear y enviar campañas de email a tus listas' },
  { to: '/app/marketing/lists', label: 'Listas', icon: Users, help: 'Gestiona listas de suscriptores y segmentos' },
  { to: '/app/marketing/automations', label: 'Automatizaciones', icon: Zap, help: 'Flujos automáticos de emails basados en triggers' },
];

export default function MarketingLayout() {
  const location = useLocation();
  
  return (
    <ModuleGate module="marketing">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-orange-500" />
              Marketing
              <InlineHelp text="Suite de email marketing: crea plantillas con editor visual, gestiona campañas, segmenta audiencias y automatiza envíos basados en eventos o fechas." />
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Email marketing y automatización para tus clientes
            </p>
          </div>
        </div>

        {/* Sub-navigation */}
        <div className="border-b">
          <nav className="flex gap-6 -mb-px">
            {navItems.map((item) => {
              const isActive = item.exact 
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors',
                    isActive 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  <InlineHelp text={item.help} />
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
