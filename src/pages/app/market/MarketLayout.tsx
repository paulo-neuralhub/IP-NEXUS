import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutGrid, 
  Store, 
  Package, 
  Gavel, 
  Heart, 
  Bell, 
  User, 
  Shield,
  TrendingUp,
  Users
} from 'lucide-react';
import { ModuleGate } from '@/components/common/ModuleGate';

const navItems = [
  { to: '/app/market', label: 'Explorar', icon: LayoutGrid, exact: true },
  { to: '/app/market/listings', label: 'Listings', icon: Store },
  { to: '/app/market/agents', label: 'Agentes', icon: Users },
  { to: '/app/market/assets', label: 'Mis Activos', icon: Package },
  { to: '/app/market/transactions', label: 'Transacciones', icon: TrendingUp },
  { to: '/app/market/favorites', label: 'Favoritos', icon: Heart },
  { to: '/app/market/alerts', label: 'Alertas', icon: Bell },
  { to: '/app/market/profile', label: 'Mi Perfil', icon: User },
];

export default function MarketLayout() {
  const location = useLocation();
  
  return (
    <ModuleGate module="market">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Store className="h-6 w-6 text-market" />
              IP Market
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Marketplace para compra, venta y licenciamiento de Propiedad Intelectual
            </p>
          </div>
        </div>

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
                      ? 'border-market text-market' 
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
    </ModuleGate>
  );
}
