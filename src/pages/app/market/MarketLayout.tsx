import * as React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutGrid, Store, Package, Heart, Bell, User, TrendingUp,
  Users, FileQuestion, Trophy
} from 'lucide-react';
import { ModuleGate } from '@/components/common/ModuleGate';
import { FeatureGuide, InlineHelp } from '@/components/help';
import { useContextualHelp } from '@/hooks/useContextualHelp';

const navItems = [
  { to: '/app/market', label: 'Explorar', icon: LayoutGrid, exact: true },
  { to: '/app/market/listings', label: 'Listings', icon: Store },
  { to: '/app/market/rfq', label: 'Presupuestos', icon: FileQuestion },
  { to: '/app/market/agents', label: 'Agentes', icon: Users },
  { to: '/app/market/rankings', label: 'Rankings', icon: Trophy },
  { to: '/app/market/assets', label: 'Mis Activos', icon: Package },
  { to: '/app/market/transactions', label: 'Transacciones', icon: TrendingUp },
  { to: '/app/market/favorites', label: 'Favoritos', icon: Heart },
  { to: '/app/market/alerts', label: 'Alertas', icon: Bell },
  { to: '/app/market/profile', label: 'Mi Perfil', icon: User },
];

export default function MarketLayout() {
  const location = useLocation();
  const { featureKey, currentGuide, shouldShowGuide } = useContextualHelp();
  
  return (
    <ModuleGate module="market">
      <div className="space-y-0">
        {currentGuide && shouldShowGuide(featureKey) ? (
          <FeatureGuide featureKey={featureKey} title={currentGuide.title} steps={currentGuide.steps} />
        ) : null}

        {/* SILK Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0a2540', letterSpacing: '-0.3px', fontFamily: "'DM Sans', sans-serif" }}>
                IP Market
              </h1>
              {/* LIVE indicator */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-40" />
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', letterSpacing: '0.5px' }}>
                  LIVE
                </span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Marketplace profesional de Propiedad Intelectual
            </p>
          </div>
        </div>

        {/* SILK Neumorphic Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl mb-6 overflow-x-auto"
          style={{ 
            background: '#e8ecf3', 
            boxShadow: 'inset 2px 2px 5px #cdd1dc, inset -2px -2px 5px #ffffff',
            display: 'inline-flex',
          }}>
          {navItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to) && (item.exact ? true : item.to !== '/app/market' || location.pathname === '/app/market');
            
            // Special handling: /app/market exact match for "Explorar"
            const finalActive = item.exact 
              ? location.pathname === item.to 
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className="whitespace-nowrap"
              >
                {({ isActive: navActive }) => (
                  <div
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    style={navActive ? {
                      background: '#f1f4f9',
                      boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff',
                      color: '#0a2540',
                    } : { color: '#94a3b8' }}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Content */}
        <Outlet />
      </div>
    </ModuleGate>
  );
}
