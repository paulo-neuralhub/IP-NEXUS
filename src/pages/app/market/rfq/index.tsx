import * as React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, MessageSquare, CheckCircle, Star, Send, MessageCircle,
  Clock, Globe, Tag, Shield, Zap, ChevronRight, Loader2
} from 'lucide-react';
import { useMyRequestsWithQuotes, type RfqRequestWithQuotes, type QuoteWithAgent } from '@/hooks/market/useMyRequestsWithQuotes';
import { useAcceptQuoteAndCreateTransaction } from '@/hooks/market/useServiceTransactions';
import {
  SERVICE_CATEGORY_LABELS,
  SERVICE_TYPE_LABELS,
  REQUEST_STATUS_LABELS,
  URGENCY_LABELS,
  type RequestStatus,
  type Urgency,
} from '@/types/quote-request';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { PreAcceptanceChat } from '@/components/market/chat/PreAcceptanceChat';

// ── Helpers ──────────────────────────────────────────

const SERVICE_COLORS: Record<string, string> = {
  trademark: '#6366f1', patent: '#0ea5e9', design: '#f59e0b',
  copyright: '#ec4899', domain: '#10b981', litigation: '#ef4444',
  licensing: '#8b5cf6', valuation: '#14b8a6', general: '#64748b',
};

function getServiceColor(cat: string): string { return SERVICE_COLORS[cat] || '#64748b'; }

function getServiceIcon(cat: string) {
  const icons: Record<string, typeof Tag> = { trademark: Shield, patent: Zap, design: Tag, litigation: Shield, general: Globe };
  return icons[cat] || Tag;
}

const STATUS_COLORS: Record<string, string> = {
  draft: '#94a3b8', open: '#10b981', evaluating: '#f59e0b',
  awarded: '#00b4d8', cancelled: '#ef4444', expired: '#94a3b8',
};
const STATUS_GRADIENTS: Record<string, string> = {
  draft: 'linear-gradient(135deg, #94a3b8, #cbd5e1)', open: 'linear-gradient(135deg, #10b981, #34d399)',
  evaluating: 'linear-gradient(135deg, #f59e0b, #fbbf24)', awarded: 'linear-gradient(135deg, #00b4d8, #00d4aa)',
  cancelled: 'linear-gradient(135deg, #ef4444, #f87171)', expired: 'linear-gradient(135deg, #94a3b8, #cbd5e1)',
};

function getJurisdictionFlag(code: string): string {
  const flags: Record<string, string> = {
    ES: '🇪🇸', EU: '🇪🇺', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷',
    IT: '🇮🇹', PT: '🇵🇹', CN: '🇨🇳', JP: '🇯🇵', KR: '🇰🇷', BR: '🇧🇷',
    MX: '🇲🇽', AR: '🇦🇷', CL: '🇨🇱', CO: '🇨🇴', WIPO: '🌍', PCT: '🌐',
  };
  return flags[code] || '🏳️';
}

function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
}

function getAgentInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getAgentColor(name: string): string {
  const colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#ef4444'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ── Status filter tabs ───────────────────────────────

const STATUS_FILTERS: { id: string; label: string; statuses: RequestStatus[] }[] = [
  { id: 'all', label: 'Todas', statuses: [] },
  { id: 'open', label: 'Abiertas', statuses: ['open'] },
  { id: 'evaluating', label: 'Evaluando', statuses: ['evaluating'] },
  { id: 'awarded', label: 'Adjudicadas', statuses: ['awarded'] },
  { id: 'closed', label: 'Cerradas', statuses: ['cancelled', 'expired'] },
];

// ── Main Component ───────────────────────────────────

export default function MyRequestsPage() {
  const { data: requests, isLoading } = useMyRequestsWithQuotes();
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const filtered = React.useMemo(() => {
    if (!requests) return [];
    const filter = STATUS_FILTERS.find(f => f.id === statusFilter);
    if (!filter || filter.statuses.length === 0) return requests;
    return requests.filter(r => filter.statuses.includes(r.status));
  }, [requests, statusFilter]);

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-5">
      {/* ── Status filter pills ── */}
      <div className="flex items-center gap-2">
        {STATUS_FILTERS.map(f => {
          const count = f.statuses.length === 0
            ? (requests?.length || 0)
            : (requests?.filter(r => f.statuses.includes(r.status)).length || 0);
          return (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={statusFilter === f.id ? {
                background: '#f1f4f9',
                boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff',
                color: '#0a2540',
              } : { color: '#94a3b8' }}
            >
              {f.label}
              {count > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-md text-[9px] font-bold"
                  style={statusFilter === f.id
                    ? { background: '#0a2540', color: '#fff' }
                    : { background: 'rgba(0,0,0,0.06)', color: '#94a3b8' }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Request cards ── */}
      {filtered.length === 0 ? (
        <EmptyState hasRequests={(requests?.length || 0) > 0} />
      ) : (
        filtered.map(req => <RequestCard key={req.id} request={req} onNavigate={navigate} />)
      )}
    </div>
  );
}

// ── Request Card ─────────────────────────────────────

function RequestCard({ request: req, onNavigate }: { request: RfqRequestWithQuotes; onNavigate: (path: string) => void }) {
  const serviceColor = getServiceColor(req.service_category);
  const ServiceIcon = getServiceIcon(req.service_category);
  const statusColor = STATUS_COLORS[req.status] || '#94a3b8';
  const statusLabel = REQUEST_STATUS_LABELS[req.status]?.es || req.status;

  return (
    <div className="rounded-2xl overflow-hidden mb-0" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="h-1" style={{ background: STATUS_GRADIENTS[req.status] || STATUS_GRADIENTS.draft }} />

      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
        onClick={() => onNavigate(`/app/market/rfq/${req.id}?from=mis-pedidos`)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: serviceColor + '12' }}>
            <ServiceIcon className="w-5 h-5" style={{ color: serviceColor }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540' }}>{req.title}</h3>
              <ChevronRight className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              {req.jurisdictions?.map(j => getJurisdictionFlag(j)).join(' ')}{' '}
              {req.jurisdictions?.join(', ')}
              {req.nice_classes?.length ? ` · ${req.nice_classes.length} clases` : ''}
              {' · '}
              <span style={{ fontFamily: 'monospace', fontSize: '10px' }}>{req.reference_number || `#${req.id.slice(0, 6)}`}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
            style={{ background: '#f1f4f9', color: statusColor, boxShadow: '2px 2px 5px #cdd1dc, -2px -2px 5px #ffffff' }}>
            {statusLabel}
          </span>
          <div className="w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0"
            style={{ background: '#f1f4f9', boxShadow: '4px 4px 10px #cdd1dc, -4px -4px 10px #ffffff' }}>
            <span style={{ fontSize: '16px', fontWeight: 200, color: '#00b4d8', lineHeight: 1 }}>{req.quotes.length}</span>
            <span style={{ fontSize: '7px', fontWeight: 600, color: '#94a3b8' }}>ofertas</span>
          </div>
        </div>
      </div>

      {/* Quotes list */}
      {req.quotes.length > 0 && (
        <div className="px-5 py-4">
          <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
            Compara ofertas y acepta la mejor
          </h4>
          <div className="space-y-2">
            {req.quotes.map((quote, idx) => (
              <QuoteRow key={quote.id} quote={quote} idx={idx} total={req.quotes.length} requestId={req.id} requestStatus={req.status} />
            ))}
          </div>
        </div>
      )}

      {req.quotes.length === 0 && req.status === 'open' && (
        <div className="px-5 py-8 text-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
            style={{ background: '#f1f4f9', boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff' }}>
            <MessageSquare className="w-5 h-5" style={{ color: '#94a3b8' }} />
          </div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Esperando ofertas de agentes...</p>
          <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Las ofertas aparecerán aquí conforme los agentes respondan</p>
        </div>
      )}
    </div>
  );
}

// ── Quote Row with Accept action ─────────────────────

function QuoteRow({ quote, idx, total, requestId, requestStatus }: {
  quote: QuoteWithAgent; idx: number; total: number; requestId: string; requestStatus: string;
}) {
  const acceptQuote = useAcceptQuoteAndCreateTransaction();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const agent = quote.agent;
  const name = agent?.display_name || 'Agente';
  const initials = getAgentInitials(name);
  const color = getAgentColor(name);
  const isTop = idx === 0 && total > 1;
  const professionalFees = quote.price_breakdown?.professional_fees;
  const officialFees = quote.price_breakdown?.official_fees;
  const canAccept = requestStatus === 'open' && quote.status !== 'awarded' && quote.status !== 'rejected';

  const handleAccept = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    try {
      await acceptQuote.mutateAsync({ quoteId: quote.id, requestId });
      navigate('/app/market/transactions');
    } catch { /* error handled by hook */ }
  };

  return (
    <div
      className="flex items-center gap-4 p-3.5 rounded-xl transition-colors hover:bg-slate-50"
      style={{
        border: isTop ? '1px solid rgba(0,180,216,0.15)' : '1px solid rgba(0,0,0,0.04)',
        background: isTop ? 'rgba(0,180,216,0.02)' : 'transparent',
      }}
    >
      {total > 1 && (
        <span style={{ fontSize: '10px', fontWeight: 700, color: isTop ? '#00b4d8' : '#94a3b8', width: '16px' }}>#{idx + 1}</span>
      )}

      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ background: agent?.avatar_url ? undefined : color }}>
        {agent?.avatar_url ? <img src={agent.avatar_url} className="w-full h-full rounded-xl object-cover" alt={name} /> : initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0a2540' }}>{name}</span>
          {agent?.is_verified_agent && (
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(0,180,216,0.08)' }}>
              <CheckCircle className="w-3 h-3" style={{ color: '#00b4d8' }} />
              <span style={{ fontSize: '8px', fontWeight: 700, color: '#00b4d8' }}>VERIFICADO</span>
            </div>
          )}
          {(agent?.rating_avg ?? 0) > 0 && (
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3" style={{ color: '#f59e0b', fill: '#f59e0b' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#0a2540' }}>{Number(agent!.rating_avg).toFixed(1)}</span>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>({agent!.ratings_count})</span>
            </div>
          )}
          {quote.status === 'awarded' && (
            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold" style={{ background: 'rgba(0,180,216,0.1)', color: '#00b4d8' }}>
              ADJUDICADA
            </span>
          )}
        </div>
        <span style={{ fontSize: '11px', color: '#64748b' }}>
          {agent?.total_transactions || 0} trabajos
          {agent?.response_time_avg ? ` · Responde en ${Math.round(agent.response_time_avg)}h` : ''}
        </span>
      </div>

      <div className="text-right shrink-0 mr-2">
        <span style={{ fontSize: '18px', fontWeight: 700, color: '#0a2540', display: 'block' }}>
          {formatCurrency(quote.total_price, quote.currency)}
        </span>
        <div className="flex items-center gap-2 justify-end">
          {professionalFees != null && <span style={{ fontSize: '9px', color: '#94a3b8' }}>Hon: {formatCurrency(professionalFees, quote.currency)}</span>}
          {officialFees != null && <span style={{ fontSize: '9px', color: '#94a3b8' }}>Tasas: {formatCurrency(officialFees, quote.currency)}</span>}
        </div>
        <span style={{ fontSize: '10px', color: '#64748b' }}>{quote.estimated_duration_days} días</span>
      </div>

      <div className="flex gap-2 shrink-0">
        {/* Pre-acceptance chat button */}
        {quote.status !== 'rejected' && (
          <button
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold"
            style={{ background: '#f1f4f9', border: '1px solid rgba(0,0,0,0.06)', color: '#334155' }}
          >
            <MessageCircle className="w-3.5 h-3.5" style={{ color: '#00b4d8' }} />
            Chat
          </button>
        )}
        <Link to={`/app/market/rfq/${quote.request_id}?from=mis-pedidos`}
          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold no-underline"
          style={{ background: '#f1f4f9', border: '1px solid rgba(0,0,0,0.06)', color: '#334155' }}>
          Detalle
        </Link>
        {canAccept && (
          <button
            onClick={handleAccept}
            disabled={acceptQuote.isPending}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white disabled:opacity-60"
            style={{ background: confirming ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #00b4d8, #00d4aa)' }}
          >
            {acceptQuote.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            {confirming ? '¿Confirmar?' : 'Aceptar'}
          </button>
        )}
      </div>

      {/* Pre-acceptance chat panel */}
      <PreAcceptanceChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        requestId={requestId}
        otherUserId={(agent as any)?.auth_user_id || quote.agent_id}
        otherUserName={name}
      />
    </div>
  );
}

// ── Empty State ──────────────────────────────────────

function EmptyState({ hasRequests }: { hasRequests: boolean }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: '#f1f4f9', boxShadow: '6px 6px 14px #cdd1dc, -6px -6px 14px #ffffff' }}>
        <Send className="w-7 h-7" style={{ color: '#94a3b8' }} />
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0a2540', marginBottom: '6px' }}>
        {hasRequests ? 'Sin resultados' : 'No has publicado solicitudes'}
      </h3>
      <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '360px', margin: '0 auto 16px' }}>
        {hasRequests ? 'Prueba otro filtro.' : 'Publica tu primera solicitud de servicio IP y recibe ofertas de agentes verificados.'}
      </p>
      {!hasRequests && (
        <Link to="/app/market/rfq/new"
          className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white no-underline"
          style={{ background: 'linear-gradient(135deg, #00b4d8, #00d4aa)', boxShadow: '0 3px 12px rgba(0,180,216,0.15)' }}>
          <Plus className="w-4 h-4" /> Publicar Solicitud
        </Link>
      )}
    </div>
  );
}

// ── Loading Skeleton ─────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="h-1" style={{ background: '#e2e8f0' }} />
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-2 flex-1"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/3" /></div>
              <Skeleton className="w-20 h-7 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
