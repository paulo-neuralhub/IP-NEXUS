import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutTemplate, Mail, Users, Zap, BarChart3 } from 'lucide-react';

const navItems = [
  { to: '/app/marketing', label: 'Dashboard', icon: BarChart3, exact: true },
  { to: '/app/marketing/templates', label: 'Plantillas', icon: LayoutTemplate },
  { to: '/app/marketing/campaigns', label: 'Campañas', icon: Mail },
  { to: '/app/marketing/lists', label: 'Listas', icon: Users },
  { to: '/app/marketing/automations', label: 'Automatizaciones', icon: Zap },
];

export default function MarketingLayout() {
  const location = useLocation();
  
  return (
    <div className="space-y-6">
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
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <Outlet />
    </div>
  );
}
