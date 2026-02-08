import * as React from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Globe, Send, MessageSquare, ArrowLeftRight, User, 
  Plus, Store
} from 'lucide-react';
import { ModuleGate } from '@/components/common/ModuleGate';
import { MarketNotificationBell } from '@/components/features/market/MarketNotificationPanel';
import { useMarketNotificationRealtime } from '@/hooks/market/useMarketNotifications';
import { useMarketTabCounts } from '@/hooks/market/useMarketNotifications';

const tabs = [
  { to: '/app/market', label: 'Marketplace', icon: Globe, exact: true, badgeKey: null },
  { to: '/app/market/rfq', label: 'Mis Pedidos', icon: Send, badgeKey: 'rfq' as const },
  { to: '/app/market/offers', label: 'Mis Propuestas', icon: MessageSquare, badgeKey: 'offers' as const },
  { to: '/app/market/transactions', label: 'En Curso', icon: ArrowLeftRight, badgeKey: 'transactions' as const },
  { to: '/app/market/profile', label: 'Mi Perfil', icon: User, badgeKey: null },
];

export default function MarketLayout() {
  const location = useLocation();
  const tabCounts = useMarketTabCounts();
  
  // Activate real-time subscription for market notifications
  useMarketNotificationRealtime();
  
  // Check if we're on a detail page (hide tabs for cleaner detail views)
  const isDetailPage = /\/(rfq|transactions|listings|agents|work|assets|kyc)\/[^/]+/.test(location.pathname) 
    && !location.pathname.endsWith('/new');
  
  return (
    <ModuleGate module="market">
      <div className="space-y-0">
        {/* ═══ IP-Market Header with violet branding ═══ */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* Logo IP-Market */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 3px 10px rgba(124,58,237,0.2)' }}>
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 style={{ 
                  fontSize: '20px', fontWeight: 800, color: '#0a2540', 
                  letterSpacing: '-0.02em', fontFamily: "'DM Sans', sans-serif" 
                }}>
                  IP-Market
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed' }}>
                  Marketplace
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                El primer marketplace profesional de Propiedad Intelectual
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notification bell with dropdown */}
            <MarketNotificationBell />
            
            {/* CTA — violet gradient */}
            <Link
              to="/app/market/rfq/new"
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white no-underline transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 3px 12px rgba(124,58,237,0.2)' }}>
              <Plus className="w-4 h-4" />
              Publicar Solicitud
              <span className="absolute bottom-0 left-[22%] right-[22%] h-[2px] rounded-full"
                style={{ background: 'rgba(255,255,255,0.4)' }} />
            </Link>
          </div>
        </div>

        {/* ═══ Tabs with violet active state ═══ */}
        {!isDetailPage && (
          <div className="flex items-center gap-1 p-1 rounded-xl mb-6 overflow-x-auto"
            style={{ 
              background: '#e8ecf3', 
              boxShadow: 'inset 2px 2px 5px #cdd1dc, inset -2px -2px 5px #ffffff',
              display: 'inline-flex',
            }}>
            {tabs.map((tab) => {
              const badgeCount = tab.badgeKey ? tabCounts[tab.badgeKey] : 0;
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  end={tab.exact}
                  className="whitespace-nowrap no-underline"
                >
                  {({ isActive }) => (
                    <div
                      className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      style={isActive ? {
                        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                        boxShadow: '0 2px 8px rgba(124,58,237,0.2)',
                        color: '#fff',
                      } : { color: '#94a3b8' }}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                      {badgeCount > 0 && (
                        <span
                          className="min-w-[16px] h-4 rounded-full flex items-center justify-center"
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(124,58,237,0.08)',
                            color: isActive ? '#fff' : '#7c3aed',
                            padding: '0 4px',
                          }}
                        >
                          {badgeCount > 99 ? '99+' : badgeCount}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        )}

        {/* Content */}
        <Outlet />
      </div>
    </ModuleGate>
  );
}
