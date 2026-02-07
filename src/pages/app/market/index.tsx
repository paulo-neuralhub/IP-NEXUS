import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Plus, Package, ArrowRight, Bell, User, LayoutGrid, Terminal,
  FileText, CheckCircle, Clock, Users, TrendingUp, Target,
  ArrowUp, ArrowDown, Star, ShoppingBag, Globe, Zap, AlertTriangle,
  ChevronRight, Eye
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMarketListings, useToggleFavorite, useMarketFavorites } from '@/hooks/use-market';
import { 
  ASSET_TYPE_CONFIG, TRANSACTION_TYPE_CONFIG,
  type AssetType, type TransactionType 
} from '@/types/market.types';
import { ListingCard } from '@/components/market/listings/ListingCard';
import { 
  MarketSummaryCards, ActiveRequestsList, MyQuotesList,
  type RfqRequest, type RfqQuote 
} from '@/components/features/market';
import { 
  MarketTicker, TopAgents, RecentRequests, MarketStats, JurisdictionGrid 
} from '@/components/market/terminal';
import { cn } from '@/lib/utils';

// ─── KPI Data ───
const kpiData = [
  { label: 'Solicitudes Hoy', value: '23', trend: '+15%', trendUp: true, icon: FileText },
  { label: 'Completadas (mes)', value: '156', trend: '+9%', trendUp: true, icon: CheckCircle },
  { label: 'Tiempo Medio', value: '4.2', suffix: 'días', trend: '-12%', trendUp: true, icon: Clock },
  { label: 'Agentes Activos', value: '89', trend: '+5%', trendUp: true, icon: Users },
  { label: 'Volumen (mes)', value: '€245K', trend: '+22%', trendUp: true, icon: TrendingUp },
  { label: 'Tasa Éxito', value: '94.8', suffix: '%', trend: '+2.3%', trendUp: true, icon: Target },
];

// ─── Mock data for sidebar cards ───
const topAgentsData = [
  { id: '1', name: 'Clarke, Modet & Co', initials: 'CM', avatarColor: '#2563eb', verified: true, jurisdictions: ['🇪🇸', '🇪🇺'], rating: '4.9' },
  { id: '2', name: 'Elzaburu', initials: 'EL', avatarColor: '#0ea5e9', verified: true, jurisdictions: ['🇪🇸', '🇵🇹'], rating: '4.8' },
  { id: '3', name: 'Pons IP', initials: 'PI', avatarColor: '#10b981', verified: true, jurisdictions: ['🇪🇸', '🇩🇪', '🇫🇷'], rating: '4.7' },
  { id: '4', name: 'ABG IP', initials: 'AB', avatarColor: '#f59e0b', verified: false, jurisdictions: ['🇪🇸'], rating: '4.6' },
  { id: '5', name: 'H&A IP', initials: 'HA', avatarColor: '#ec4899', verified: true, jurisdictions: ['🇬🇧', '🇺🇸'], rating: '4.5' },
];

const jurisdictionsData = [
  { code: 'ES', name: 'España', flag: '🇪🇸', agents: 34 },
  { code: 'EU', name: 'EUIPO', flag: '🇪🇺', agents: 28 },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', agents: 21 },
  { code: 'DE', name: 'Alemania', flag: '🇩🇪', agents: 15 },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧', agents: 12 },
  { code: 'FR', name: 'Francia', flag: '🇫🇷', agents: 9 },
];

const alertsData = [
  { id: '1', type: 'opportunity' as const, title: 'Nuevo listing destacado', description: 'Marca registrada clase 9 en ES disponible para licenciamiento' },
  { id: '2', type: 'warning' as const, title: 'Solicitud próxima a vencer', description: 'REQ-2026-001 vence en 2 días sin agente asignado' },
  { id: '3', type: 'opportunity' as const, title: 'Agente verificado disponible', description: 'Nuevo agente con especialización en patentes farmacéuticas' },
];

export default function MarketDashboard() {
  const [viewMode, setViewMode] = useState<'dashboard' | 'terminal'>('dashboard');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('all');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>('all');
  const [activePeriod, setActivePeriod] = useState('30D');
  
  const { data: listings, isLoading } = useMarketListings({
    status: 'active',
    asset_type: assetTypeFilter !== 'all' ? assetTypeFilter as AssetType : undefined,
    transaction_type: transactionTypeFilter !== 'all' ? transactionTypeFilter as TransactionType : undefined,
    search: searchQuery || undefined,
  });

  const { data: favorites } = useMarketFavorites();
  const toggleFavorite = useToggleFavorite();
  const favoriteIds = favorites?.map(f => f.listing_id) || [];

  const handleFavoriteToggle = (listingId: string) => {
    const isFav = favoriteIds.includes(listingId);
    toggleFavorite.mutate({ listingId, isFavorite: isFav });
  };

  const maxAgents = Math.max(...jurisdictionsData.map(j => j.agents));

  // Mock RFQ data
  const mockRequests: RfqRequest[] = [
    { id: '1', reference: '#REQ-2026-001', title: 'Registro marca "TechBrand" España + EUIPO', service_category: 'trademark_registration', jurisdictions: ['ES', 'EUIPO'], budget_min: 2500, budget_max: 4000, currency: 'EUR', deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), quotes_count: 4, status: 'open', client_name: 'Cliente Corp', created_at: new Date().toISOString() },
    { id: '2', reference: '#REQ-2026-002', title: 'Búsqueda de anterioridades EU-wide', service_category: 'trademark_search', jurisdictions: ['EU'], budget_min: 800, budget_max: 1500, currency: 'EUR', deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), quotes_count: 2, status: 'evaluating', client_name: 'Startup SL', created_at: new Date().toISOString() },
  ];

  const mockQuotes: RfqQuote[] = [
    { id: '1', rfq_request_id: '3', request_reference: '#REQ-2026-003', request_title: 'Oposición marca clase 9', client_name: 'Acme Inc', amount: 3200, currency: 'EUR', status: 'submitted', created_at: new Date().toISOString() },
    { id: '2', rfq_request_id: '1', request_reference: '#REQ-2026-001', request_title: 'Registro marca España + EUIPO', client_name: 'Beta Corp', amount: 4500, currency: 'EUR', status: 'accepted', submitted_at: new Date().toISOString(), created_at: new Date().toISOString() },
  ];

  // ═══════════════════════════════════════
  // TERMINAL VIEW
  // ═══════════════════════════════════════
  if (viewMode === 'terminal') {
    return (
      <div>
        {/* View Toggle */}
        <div className="flex items-center justify-end mb-5">
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-5 py-3" 
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
                IP-MARKET TERMINAL
              </span>
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-40" />
                </div>
                <span style={{ fontSize: '9px', fontWeight: 600, color: '#10b981', letterSpacing: '1px' }}>LIVE</span>
              </div>
            </div>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
              {new Date().toLocaleString('es-ES')}
            </span>
          </div>
          
          {/* Ticker strip */}
          <div className="flex items-center gap-6 px-5 py-2.5 overflow-x-auto"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.02)' }}>
            {kpiData.map(kpi => (
              <div key={kpi.label} className="flex items-center gap-2 whitespace-nowrap">
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const }}>{kpi.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{kpi.value}{kpi.suffix ? kpi.suffix : ''}</span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: kpi.trendUp ? '#10b981' : '#ef4444' }}>{kpi.trend}</span>
              </div>
            ))}
          </div>
          
          {/* 3-column grid */}
          <div className="grid grid-cols-3 divide-x divide-white/5" style={{ minHeight: '480px' }}>
            {/* Panel 1: Activity Feed */}
            <div className="p-4">
              <h3 style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '12px' }}>
                Feed de Actividad
              </h3>
              <div className="space-y-2">
                {mockRequests.map(req => (
                  <div key={req.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#00b4d8' }} />
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }} className="truncate">{req.title}</span>
                    <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', marginLeft: 'auto', whiteSpace: 'nowrap' as const }}>
                      {req.quotes_count} ofertas
                    </span>
                  </div>
                ))}
                {mockQuotes.map(q => (
                  <div key={q.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: q.status === 'accepted' ? '#10b981' : '#f59e0b' }} />
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }} className="truncate">{q.request_title}</span>
                    <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', marginLeft: 'auto', whiteSpace: 'nowrap' as const }}>
                      €{q.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Panel 2: Active Requests */}
            <div className="p-4">
              <h3 style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '12px' }}>
                Solicitudes Activas
              </h3>
              <div className="space-y-1">
                {mockRequests.map(sol => (
                  <div key={sol.id} className="grid grid-cols-4 gap-2 py-2 px-2 rounded hover:bg-white/5"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '11px', color: '#fff', fontWeight: 600 }} className="truncate col-span-2">{sol.title}</span>
                    <span style={{ fontSize: '11px', color: '#00b4d8', fontWeight: 600, textAlign: 'right' as const }}>
                      €{sol.budget_min?.toLocaleString()}-{sol.budget_max?.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '10px', color: sol.status === 'open' ? '#f59e0b' : '#10b981', textAlign: 'right' as const }}>
                      {sol.status === 'open' ? 'Abierta' : 'Evaluando'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Panel 3: Rankings */}
            <div className="p-4">
              <h3 style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '12px' }}>
                Rankings
              </h3>
              <div className="space-y-2">
                {topAgentsData.slice(0, 5).map((agent, i) => (
                  <div key={agent.id} className="flex items-center gap-2">
                    <span style={{ fontSize: '10px', color: i < 3 ? '#f59e0b' : 'rgba(255,255,255,0.3)', fontWeight: 700, width: '16px' }}>{i + 1}</span>
                    <div className="w-6 h-6 rounded-md overflow-hidden shrink-0 flex items-center justify-center text-white text-[9px] font-bold"
                      style={{ background: agent.avatarColor }}>
                      {agent.initials}
                    </div>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }} className="flex-1 truncate">{agent.name}</span>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5" style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                      <span style={{ fontSize: '10px', color: '#fff', fontWeight: 600 }}>{agent.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // DASHBOARD VIEW (default)
  // ═══════════════════════════════════════
  return (
    <div>
      {/* View Toggle + Action */}
      <div className="flex items-center justify-between mb-5">
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        <Link 
          to="/app/market/listings/new"
          className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #00b4d8, #00d4aa)', boxShadow: '0 3px 12px rgba(0, 180, 216, 0.15)' }}>
          <Plus className="w-4 h-4" />
          Nuevo Listing
          <span className="absolute bottom-0 left-[22%] right-[22%] h-[2px] rounded-full" style={{ background: 'rgba(255,255,255,0.4)' }} />
        </Link>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-6 gap-3 mb-6">
        {kpiData.map(kpi => (
          <div key={kpi.label} className="rounded-2xl p-4"
            style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <kpi.icon className="w-4 h-4" style={{ color: '#94a3b8' }} />
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ 
                  background: kpi.trendUp ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  color: kpi.trendUp ? '#10b981' : '#ef4444',
                }}>
                {kpi.trendUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                <span style={{ fontSize: '10px', fontWeight: 700 }}>{kpi.trend}</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#0a2540', letterSpacing: '-0.5px' }}>
                {kpi.value}
              </span>
              {kpi.suffix && (
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>{kpi.suffix}</span>
              )}
            </div>
            <span style={{ fontSize: '10px', fontWeight: 500, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
              {kpi.label}
            </span>
          </div>
        ))}
      </div>

      {/* Main 2/3 + 1/3 Layout */}
      <div className="grid grid-cols-3 gap-5">
        
        {/* ═══ MAIN COLUMN (2/3) ═══ */}
        <div className="col-span-2 space-y-5">
          
          {/* Activity Card */}
          <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540' }}>Actividad del Marketplace</h2>
              <div className="flex gap-1">
                {['7D', '30D', '90D', '1A'].map(period => (
                  <button key={period} 
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
                    style={activePeriod === period 
                      ? { background: '#0a2540', color: '#fff' } 
                      : { color: '#94a3b8', background: 'transparent' }}
                    onClick={() => setActivePeriod(period)}>
                    {period}
                  </button>
                ))}
              </div>
            </div>
            {/* Placeholder chart area */}
            <div className="h-[180px] rounded-xl flex items-center justify-center" style={{ background: '#f8fafc' }}>
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: '#00b4d8', opacity: 0.4 }} />
                <p style={{ fontSize: '11px', color: '#94a3b8' }}>Gráfico de actividad</p>
              </div>
            </div>
          </div>

          {/* Listings Table */}
          <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540' }}>Listings Destacados</h2>
              <Link to="/app/market/listings" style={{ fontSize: '12px', fontWeight: 600, color: '#00b4d8' }}>
                Ver todos →
              </Link>
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: '#f1f4f9' }} />
                ))}
              </div>
            ) : listings && listings.length > 0 ? (
              <div className="space-y-0">
                {/* Header */}
                <div className="grid grid-cols-12 gap-3 px-3 py-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <span className="col-span-5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Activo</span>
                  <span className="col-span-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Tipo</span>
                  <span className="col-span-2 text-[10px] font-semibold uppercase tracking-wider text-right" style={{ color: '#94a3b8' }}>Precio</span>
                  <span className="col-span-3 text-[10px] font-semibold uppercase tracking-wider text-right" style={{ color: '#94a3b8' }}>Estado</span>
                </div>
                {listings.slice(0, 5).map((listing: any, i: number) => (
                  <Link 
                    key={listing.id}
                    to={`/app/market/listings/${listing.id}`}
                    className="grid grid-cols-12 gap-3 px-3 py-3 rounded-xl transition-colors hover:bg-slate-50 cursor-pointer"
                    style={{ borderBottom: i < Math.min(listings.length, 5) - 1 ? '1px solid rgba(0,0,0,0.03)' : 'none' }}>
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(0,180,216,0.08)', color: '#00b4d8' }}>
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#0a2540' }} className="truncate">{listing.title}</p>
                        <p style={{ fontSize: '10px', color: '#94a3b8' }} className="truncate">{listing.asset?.owner_name || 'Sin propietario'}</p>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                        style={{ background: 'rgba(0,180,216,0.08)', color: '#00b4d8' }}>
                        {listing.asset?.asset_type || 'N/A'}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0a2540' }}>
                        {listing.asking_price ? `€${Number(listing.asking_price).toLocaleString()}` : 'Negociable'}
                      </span>
                    </div>
                    <div className="col-span-3 flex items-center justify-end">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold"
                        style={{ 
                          background: '#f1f4f9', 
                          color: listing.status === 'active' ? '#10b981' : '#f59e0b',
                          boxShadow: '2px 2px 5px #cdd1dc, -2px -2px 5px #ffffff',
                        }}>
                        {listing.status === 'active' ? 'Activo' : listing.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>

          {/* Recent Requests */}
          <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540', marginBottom: '16px' }}>
              Solicitudes Recientes
            </h2>
            <div className="space-y-3">
              {mockRequests.map(sol => (
                <div key={sol.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: sol.status === 'open' ? '#2563eb' : '#10b981' }}>
                    {sol.reference.slice(-2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#0a2540' }} className="truncate">{sol.title}</p>
                    <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {sol.client_name} · {sol.jurisdictions.join(', ')} · {sol.quotes_count} ofertas
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0a2540' }}>
                      €{sol.budget_min?.toLocaleString()}-{sol.budget_max?.toLocaleString()}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                      style={{ 
                        background: sol.status === 'open' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                        color: sol.status === 'open' ? '#f59e0b' : '#10b981',
                      }}>
                      {sol.status === 'open' ? 'Abierta' : 'Evaluando'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ SIDEBAR (1/3) ═══ */}
        <div className="space-y-5">
          
          {/* Top Agents */}
          <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540' }}>Top Agentes</h2>
              <Link to="/app/market/rankings" style={{ fontSize: '11px', fontWeight: 600, color: '#00b4d8' }}>Ver todos</Link>
            </div>
            <div className="space-y-3">
              {topAgentsData.map((agent, i) => (
                <div key={agent.id} className="flex items-center gap-3">
                  {i < 3 ? (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ 
                        background: '#f1f4f9', 
                        boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff',
                        color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#cd7f32',
                        fontSize: '12px', fontWeight: 700,
                      }}>
                      {i + 1}
                    </div>
                  ) : (
                    <div className="w-7 h-7 flex items-center justify-center shrink-0"
                      style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>
                      {i + 1}
                    </div>
                  )}
                  <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: agent.avatarColor }}>
                    {agent.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#0a2540' }} className="truncate">{agent.name}</p>
                      {agent.verified && <CheckCircle className="w-3 h-3 shrink-0" style={{ color: '#00b4d8' }} />}
                    </div>
                    <div className="flex items-center gap-1">
                      {agent.jurisdictions.map(j => <span key={j} className="text-[10px]">{j}</span>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-3 h-3" style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0a2540' }}>{agent.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Coverage */}
          <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540', marginBottom: '16px' }}>Cobertura Global</h2>
            <div className="space-y-2.5">
              {jurisdictionsData.map(j => (
                <div key={j.code} className="flex items-center gap-3">
                  <span className="text-lg w-6 text-center">{j.flag}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>{j.name}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#0a2540' }}>{j.agents}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: '#e8ecf3' }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(j.agents / maxAgents) * 100}%`, background: 'linear-gradient(135deg, #00b4d8, #00d4aa)' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Alerts */}
          <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540', marginBottom: '16px' }}>Alertas de Mercado</h2>
            <div className="space-y-3">
              {alertsData.map(alert => (
                <div key={alert.id} className="flex items-start gap-3 p-2.5 rounded-xl"
                  style={{ background: alert.type === 'opportunity' ? 'rgba(0,180,216,0.04)' : 'rgba(245,158,11,0.04)' }}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ 
                      background: alert.type === 'opportunity' ? 'rgba(0,180,216,0.1)' : 'rgba(245,158,11,0.1)',
                      color: alert.type === 'opportunity' ? '#00b4d8' : '#f59e0b',
                    }}>
                    {alert.type === 'opportunity' ? <Zap className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#0a2540' }}>{alert.title}</p>
                    <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{alert.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── View Toggle Component ───
function ViewToggle({ viewMode, setViewMode }: { viewMode: string; setViewMode: (v: 'dashboard' | 'terminal') => void }) {
  return (
    <div className="flex p-1 rounded-xl" 
      style={{ background: '#e8ecf3', boxShadow: 'inset 2px 2px 5px #cdd1dc, inset -2px -2px 5px #ffffff' }}>
      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
        style={viewMode === 'dashboard' ? { background: '#f1f4f9', boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff', color: '#0a2540' } : { color: '#94a3b8' }}
        onClick={() => setViewMode('dashboard')}>
        <LayoutGrid className="w-3.5 h-3.5 inline mr-1.5" />
        Dashboard
      </button>
      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
        style={viewMode === 'terminal' ? { background: '#f1f4f9', boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff', color: '#0a2540' } : { color: '#94a3b8' }}
        onClick={() => setViewMode('terminal')}>
        <Terminal className="w-3.5 h-3.5 inline mr-1.5" />
        Terminal
      </button>
    </div>
  );
}

// ─── Empty State ───
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: '#f1f4f9', boxShadow: '6px 6px 14px #cdd1dc, -6px -6px 14px #ffffff' }}>
        <ShoppingBag className="w-7 h-7" style={{ color: '#00b4d8' }} />
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0a2540', marginBottom: '6px' }}>
        Marketplace listo
      </h3>
      <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center' as const, maxWidth: '360px', marginBottom: '20px' }}>
        Publica tu primer listing o explora agentes verificados en cualquier jurisdicción
      </p>
      <Link 
        to="/app/market/listings/new"
        className="relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
        style={{ background: 'linear-gradient(135deg, #00b4d8, #00d4aa)', boxShadow: '0 4px 15px rgba(0, 180, 216, 0.2)' }}>
        <Globe className="w-4 h-4" />
        Explorar Marketplace
        <span className="absolute bottom-0 left-[22%] right-[22%] h-[2px] rounded-full" style={{ background: 'rgba(255,255,255,0.4)' }} />
      </Link>
    </div>
  );
}
