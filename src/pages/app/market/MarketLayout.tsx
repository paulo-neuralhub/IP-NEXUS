import * as React from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { 
  Globe, Send, MessageSquare, ArrowLeftRight, User, 
  Plus, Store, FileText, Users, ShieldCheck
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
  
  useMarketNotificationRealtime();
  
  const isDetailPage = /\/(rfq|transactions|listings|agents|work|assets|kyc)\/[^/]+/.test(location.pathname) 
    && !location.pathname.endsWith('/new');
  
  return (
    <ModuleGate module="market">
      {/* ═══ IP-MARKET WRAPPER — Own visual identity ═══ */}
      <div 
        className="-m-6 min-h-[calc(100vh-64px)]"
        style={{ 
          fontFamily: "'Inter', sans-serif",
          background: '#F5F3FF',
        }}
      >
        {/* ═══ HERO HEADER — Dark indigo, the signature element ═══ */}
        <div 
          className="relative overflow-hidden"
          style={{ 
            background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4C1D95 100%)',
            padding: '32px 32px 28px',
          }}
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.2), transparent 60%)' }} />
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 20% 80%, rgba(99,102,241,0.1), transparent 50%)' }} />
          
          <div className="relative z-10">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                      IP-Market
                    </h1>
                    <span className="px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider"
                      style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>
                      Marketplace
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                    El primer marketplace profesional de Propiedad Intelectual
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MarketNotificationBell />
                <Link
                  to="/app/market/rfq/new"
                  className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white no-underline transition-all hover:scale-[1.02]"
                  style={{ 
                    background: 'rgba(255,255,255,0.15)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}>
                  <Plus className="w-4 h-4" />
                  Publicar Solicitud
                </Link>
              </div>
            </div>

            {/* KPI strip — glassmorphism */}
            {!isDetailPage && (
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Solicitudes activas', value: '—', icon: FileText },
                  { label: 'Profesionales', value: '—', icon: Users },
                  { label: 'Jurisdicciones', value: '52', icon: Globe },
                  { label: 'Pago Protegido', value: '100%', icon: ShieldCheck },
                ].map((kpi, idx) => (
                  <div key={idx} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ 
                      background: 'rgba(255,255,255,0.06)', 
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                    <kpi.icon className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
                    <div>
                      <span style={{ fontSize: '18px', fontWeight: 700, color: '#fff', display: 'block', lineHeight: 1.1 }}>
                        {kpi.value}
                      </span>
                      <span style={{ fontSize: '9px', fontWeight: 500, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {kpi.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ═══ TABS — Pill style on surface background ═══ */}
        {!isDetailPage && (
          <div className="px-8 pt-5">
            <div className="flex items-center gap-1 p-1 rounded-xl"
              style={{ background: '#EDE9FE' }}>
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
                        className="relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-all cursor-pointer"
                        style={isActive ? {
                          background: '#fff',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                          color: '#1E1B4B',
                          fontWeight: 600,
                        } : { 
                          color: '#6B7280',
                          fontWeight: 400,
                        }}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {badgeCount > 0 && (
                          <span
                            className="min-w-[18px] h-[18px] rounded-full flex items-center justify-center"
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              background: isActive ? '#6C2BD9' : 'rgba(108,43,217,0.12)',
                              color: isActive ? '#fff' : '#6C2BD9',
                              padding: '0 5px',
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
          </div>
        )}

        {/* ═══ CONTENT — Market-themed area ═══ */}
        <div className="px-8 py-6">
          <Outlet />
        </div>
      </div>
    </ModuleGate>
  );
}
