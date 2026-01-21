import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutGrid, Users, TrendingUp, Settings } from 'lucide-react';
import { ModuleGate } from '@/components/common/ModuleGate';
import { CrmAiTipCallout } from '@/components/features/crm/crm-ai-tip-callout';

const navItems = [
  { to: '/app/crm', label: 'Kanban', icon: LayoutGrid, exact: true },
  { to: '/app/crm/contacts', label: 'Contactos', icon: Users },
  { to: '/app/crm/deals', label: 'Lista Deals', icon: TrendingUp },
  { to: '/app/crm/pipelines', label: 'Pipelines', icon: Settings },
];

export default function CRMLayout() {
  const location = useLocation();
  
  return (
    <ModuleGate module="crm">
      <div className="space-y-6">
        {/* Sub-navigation */}
        <div className="border-b">
          <div className="flex items-center justify-between gap-4">
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

            {/* Inline tip (desktop) */}
            <div className="hidden lg:flex items-center">
              <CrmAiTipCallout variant="inline" />
            </div>
          </div>
        </div>

        {/* Tip (mobile/tablet) */}
        <div className="lg:hidden">
          <CrmAiTipCallout />
        </div>

        {/* Content */}
        <Outlet />
      </div>
    </ModuleGate>
  );
}
