import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutGrid, 
  Store, 
  Package, 
  Heart, 
  Bell, 
  User, 
  TrendingUp,
  Users,
  FileQuestion,
  Trophy
} from 'lucide-react';
import { ModuleGate } from '@/components/common/ModuleGate';
import { FeatureGuide, InlineHelp } from '@/components/help';
import { useContextualHelp } from '@/hooks/useContextualHelp';

const navItems = [
  { to: '/app/market', label: 'Explorar', icon: LayoutGrid, exact: true, help: 'Explora activos de PI disponibles en el marketplace' },
  { to: '/app/market/listings', label: 'Listings', icon: Store, help: 'Publica tus activos para venta o licenciamiento' },
  { to: '/app/market/rfq', label: 'Presupuestos', icon: FileQuestion, help: 'Solicita y gestiona presupuestos (RFQ)' },
  { to: '/app/market/agents', label: 'Agentes', icon: Users, help: 'Directorio de agentes de PI verificados' },
  { to: '/app/market/rankings', label: 'Rankings', icon: Trophy, help: 'Rankings de agentes por reputación y rendimiento' },
  { to: '/app/market/assets', label: 'Mis Activos', icon: Package, help: 'Gestiona tus activos de PI listados' },
  { to: '/app/market/transactions', label: 'Transacciones', icon: TrendingUp, help: 'Historial de compras, ventas y licencias' },
  { to: '/app/market/favorites', label: 'Favoritos', icon: Heart, help: 'Activos guardados para seguimiento' },
  { to: '/app/market/alerts', label: 'Alertas', icon: Bell, help: 'Notificaciones de nuevos listings y cambios' },
  { to: '/app/market/profile', label: 'Mi Perfil', icon: User, help: 'Tu perfil público en el marketplace' },
];

export default function MarketLayout() {
  const location = useLocation();
  const { featureKey, currentGuide, shouldShowGuide } = useContextualHelp();
  
  return (
    <ModuleGate module="market">
      <div className="space-y-6">
        {currentGuide && shouldShowGuide(featureKey) ? (
          <FeatureGuide featureKey={featureKey} title={currentGuide.title} steps={currentGuide.steps} />
        ) : null}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Store className="h-6 w-6 text-market" />
              IP Market
              <InlineHelp text="Marketplace para compra, venta y licenciamiento de activos de Propiedad Intelectual. Publica listings, solicita presupuestos (RFQ), encuentra agentes y gestiona transacciones." />
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
