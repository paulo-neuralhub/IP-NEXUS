import * as React from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Globe, Send, MessageSquare, ArrowLeftRight, User, 
  Plus
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
        {/* ═══ SILK Header ═══ */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 style={{ 
                fontSize: '22px', fontWeight: 800, color: '#0a2540', 
                letterSpacing: '-0.02em', fontFamily: "'DM Sans', sans-serif" 
              }}>
                IP Market
              </h1>
              {/* LIVE badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
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
              Marketplace profesional de servicios de Propiedad Intelectual
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notification bell with dropdown */}
            <MarketNotificationBell />
            
            {/* CTA */}
            <Link
              to="/app/market/rfq/new"
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white no-underline"
              style={{ background: 'linear-gradient(135deg, #00b4d8, #00d4aa)', boxShadow: '0 3px 12px rgba(0,180,216,0.15)' }}>
              <Plus className="w-4 h-4" />
              Publicar Solicitud
              <span className="absolute bottom-0 left-[22%] right-[22%] h-[2px] rounded-full"
                style={{ background: 'rgba(255,255,255,0.4)' }} />
            </Link>
          </div>
        </div>

        {/* ═══ SILK Neumorphic Tabs with badges — hidden on detail pages ═══ */}
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
                        background: '#f1f4f9',
                        boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff',
                        color: '#0a2540',
                      } : { color: '#94a3b8' }}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                      {badgeCount > 0 && (
                        <span
                          className="min-w-[16px] h-4 rounded-full flex items-center justify-center text-white"
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            background: '#ef4444',
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
