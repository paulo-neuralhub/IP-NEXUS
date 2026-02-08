import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Globe, Send, MessageSquare, Shield, Loader,
  Clock, Plus, Tag, PenTool, FileText, Lightbulb, Scale,
  DollarSign, HelpCircle, ShieldCheck
} from 'lucide-react';
import { useRfqRequests, RfqRequestFilters } from '@/hooks/market/useRfqRequests';
import { useMarketTransactions } from '@/hooks/use-market';
import { useMyRfqRequests, useMyRfqQuotes } from '@/hooks/market/useRfqRequests';
import { 
  SERVICE_CATEGORY_LABELS, SERVICE_TYPE_LABELS,
  URGENCY_LABELS, JURISDICTIONS,
  type ServiceCategory, type RfqRequest
} from '@/types/quote-request';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const SERVICE_ICONS: Record<string, React.ComponentType<any>> = {
  trademark: Tag, patent: Lightbulb, design: PenTool,
  copyright: FileText, litigation: Scale, licensing: FileText,
  valuation: DollarSign, domain: Globe, general: HelpCircle,
};

const SERVICE_COLORS: Record<string, string> = {
  trademark: '#7c3aed', patent: '#6366f1', design: '#ec4899',
  copyright: '#f59e0b', litigation: '#ef4444', licensing: '#10b981',
  valuation: '#0a2540', domain: '#8b5cf6', general: '#94a3b8',
};

export default function MarketExplorePage() {
  const [filters, setFilters] = useState<RfqRequestFilters>({});
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [jurisdictionFilter, setJurisdictionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useRfqRequests(filters);
  const requests = data?.pages.flatMap(p => p.requests) || [];

  const handleSearch = () => {
    setFilters(f => ({ ...f, search: searchInput || undefined }));
  };

  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    setFilters(f => ({
      ...f,
      service_category: val === 'all' ? undefined : [val as ServiceCategory],
    }));
  };

  const handleJurisdictionChange = (val: string) => {
    setJurisdictionFilter(val);
    setFilters(f => ({
      ...f,
      jurisdictions: val === 'all' ? undefined : [val],
    }));
  };

  return (
    <div>
      {/* ═══ Filters — Market style ═══ */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94a3b8' }} />
          <input 
            placeholder="Buscar por servicio, jurisdicción, oficina..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
            style={{ 
              background: '#fff', 
              border: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(124,58,237,0.03)',
              color: '#1E293B',
              fontFamily: "'Inter', sans-serif",
            }}
          />
        </div>

        <select 
          value={categoryFilter}
          onChange={e => handleCategoryChange(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-xs font-medium appearance-none cursor-pointer"
          style={{ background: '#fff', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(124,58,237,0.03)', color: '#1E293B', minWidth: '160px' }}>
          <option value="all">Todos los servicios</option>
          {Object.entries(SERVICE_CATEGORY_LABELS).map(([key, config]) => (
            <option key={key} value={key}>{config.es}</option>
          ))}
        </select>

        <select
          value={jurisdictionFilter}
          onChange={e => handleJurisdictionChange(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-xs font-medium appearance-none cursor-pointer"
          style={{ background: '#fff', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(124,58,237,0.03)', color: '#1E293B', minWidth: '160px' }}>
          <option value="all">Todas las jurisdicciones</option>
          {JURISDICTIONS.map(j => (
            <option key={j.code} value={j.code}>{j.name}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-xs font-medium appearance-none cursor-pointer"
          style={{ background: '#fff', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(124,58,237,0.03)', color: '#1E293B', minWidth: '140px' }}>
          <option value="recent">Más recientes</option>
          <option value="budget">Mayor presupuesto</option>
          <option value="urgent">Más urgentes</option>
        </select>
      </div>

      {/* ═══ Request Feed — Market card style ═══ */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-2xl p-5 animate-pulse" 
              style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl" style={{ background: '#EDE9FE' }} />
                <div className="flex-1 space-y-2">
                  <div className="h-4 rounded-lg w-3/4" style={{ background: '#EDE9FE' }} />
                  <div className="h-3 rounded-lg w-1/2" style={{ background: '#F5F3FF' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyExplore />
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <RequestCard key={req.id} request={req} />
          ))}

          {hasNextPage && (
            <div className="text-center pt-4">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                style={{ 
                  background: '#EDE9FE', 
                  border: 'none', 
                  color: isFetchingNextPage ? '#94a3b8' : '#6C2BD9' 
                }}>
                {isFetchingNextPage ? 'Cargando...' : 'Cargar más solicitudes'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Request Card — Market style (no border, violet shadow) ───
function RequestCard({ request }: { request: RfqRequest }) {
  const category = request.service_category || 'general';
  const ServiceIcon = SERVICE_ICONS[category] || HelpCircle;
  const serviceColor = SERVICE_COLORS[category] || '#94a3b8';
  const serviceLabel = SERVICE_TYPE_LABELS[request.service_type]?.es || SERVICE_CATEGORY_LABELS[category]?.es || category;
  const urgencyConfig = URGENCY_LABELS[request.urgency];

  const formatBudget = () => {
    if (!request.budget_min && !request.budget_max) return null;
    const cur = request.budget_currency || 'EUR';
    if (request.budget_min && request.budget_max) {
      return `${request.budget_min.toLocaleString()}-${request.budget_max.toLocaleString()} ${cur}`;
    }
    if (request.budget_max) return `Hasta ${request.budget_max.toLocaleString()} ${cur}`;
    return `Desde ${request.budget_min?.toLocaleString()} ${cur}`;
  };

  const timeAgo = request.published_at || request.created_at
    ? formatDistanceToNow(new Date(request.published_at || request.created_at), { addSuffix: true, locale: es })
    : '';

  return (
    <Link to={`/app/market/rfq/${request.id}?from=marketplace`} className="block no-underline">
      <div 
        className="rounded-2xl p-5 transition-all hover:translate-y-[-2px] cursor-pointer"
        style={{ 
          background: '#fff', 
          border: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(124,58,237,0.03)',
          borderRadius: '16px',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(124,58,237,0.08), 0 2px 8px rgba(0,0,0,0.04)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(124,58,237,0.03)';
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: serviceColor + '10' }}>
              <ServiceIcon className="w-5 h-5" style={{ color: serviceColor }} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1E1B4B', fontFamily: "'Inter', sans-serif" }}>
                {request.title}
              </h3>
              {request.description && (
                <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px', lineHeight: 1.4 }}
                  className="line-clamp-1">
                  {request.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{timeAgo}</span>
            <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
              {request.reference_number}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium"
            style={{ background: serviceColor + '10', color: serviceColor }}>
            {serviceLabel}
          </span>

          {request.jurisdictions?.slice(0, 3).map(j => (
            <span key={j} className="flex items-center gap-1 px-2.5 py-1 rounded-full"
              style={{ background: '#F5F3FF' }}>
              <span style={{ fontSize: '11px', fontWeight: 500, color: '#1E293B' }}>{j}</span>
            </span>
          ))}
          {(request.jurisdictions?.length || 0) > 3 && (
            <span className="px-2 py-1 rounded-full text-[10px] font-medium"
              style={{ background: '#F5F3FF', color: '#94a3b8' }}>
              +{request.jurisdictions.length - 3}
            </span>
          )}

          {request.nice_classes && request.nice_classes.length > 0 && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium"
              style={{ background: '#F5F3FF', color: '#1E293B' }}>
              {request.nice_classes.length} {request.nice_classes.length === 1 ? 'clase' : 'clases'}
            </span>
          )}

          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium"
            style={{
              background: request.urgency === 'urgent' ? 'rgba(239,68,68,0.06)' 
                : request.urgency === 'normal' ? 'rgba(59,130,246,0.06)' : 'rgba(16,185,129,0.06)',
              color: request.urgency === 'urgent' ? '#ef4444' 
                : request.urgency === 'normal' ? '#3b82f6' : '#10b981',
            }}>
            {request.urgency === 'urgent' ? '⚡ Urgente' : urgencyConfig?.es || request.urgency}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
              <span style={{ fontSize: '12px', color: '#475569' }}>
                <strong style={{ color: '#1E1B4B' }}>{request.quotes_received || 0}</strong>
                /{request.max_quotes || '∞'} ofertas
              </span>
            </div>

            {formatBudget() && (
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
                <span style={{ fontSize: '12px', color: '#475569' }}>
                  Est: <strong style={{ color: '#1E1B4B' }}>{formatBudget()}</strong>
                </span>
              </div>
            )}

            {request.deadline_response && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Cierra {formatDistanceToNow(new Date(request.deadline_response), { addSuffix: true, locale: es })}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" style={{ color: '#10b981' }} />
              <span style={{ fontSize: '9px', fontWeight: 600, color: '#10b981' }}>Pago Protegido</span>
            </div>
            <span className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', boxShadow: '0 2px 8px rgba(124,58,237,0.15)' }}>
              <Send className="w-3.5 h-3.5" />
              Ver Solicitud
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptyExplore() {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: '#EDE9FE' }}>
        <Globe className="w-7 h-7" style={{ color: '#6C2BD9' }} />
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1E1B4B', marginBottom: '6px', fontFamily: "'Inter', sans-serif" }}>
        No hay solicitudes abiertas
      </h3>
      <p style={{ fontSize: '13px', color: '#475569', maxWidth: '360px', margin: '0 auto 20px' }}>
        Las solicitudes de servicios IP aparecerán aquí. También puedes publicar tu propia solicitud.
      </p>
      <Link
        to="/app/market/rfq/new"
        className="relative inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white no-underline transition-all hover:scale-[1.02]"
        style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', boxShadow: '0 4px 14px rgba(124,58,237,0.25)' }}>
        <Plus className="w-4 h-4" />
        Publicar Solicitud
      </Link>
    </div>
  );
}
