import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  FileText, 
  Users, 
  Calendar, 
  Settings,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

const financeNavItems = [
  { to: '/app/finance', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/app/finance/costs', icon: Receipt, label: 'Costes' },
  { to: '/app/finance/invoices', icon: FileText, label: 'Facturas' },
  { to: '/app/finance/quotes', icon: FileText, label: 'Presupuestos' },
  { to: '/app/finance/clients', icon: Users, label: 'Clientes' },
  { to: '/app/finance/renewals', icon: Calendar, label: 'Renovaciones' },
  { to: '/app/finance/valuation', icon: TrendingUp, label: 'Valoración' },
  { to: '/app/finance/settings', icon: Settings, label: 'Configuración' },
];

export default function FinanceLayout() {
  return (
    <div className="flex h-full">
      {/* Sidebar de navegación */}
      <div className="w-56 border-r bg-muted/30 flex-shrink-0">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-foreground mb-4">Finance</h2>
          <nav className="space-y-1">
            {financeNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
