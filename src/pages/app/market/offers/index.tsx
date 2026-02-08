import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, Clock, CheckCircle, XCircle, 
  Star, Send, FileText, AlertCircle
} from 'lucide-react';
import { useMyRfqQuotes } from '@/hooks/market/useRfqRequests';
import { QUOTE_STATUS_LABELS, SERVICE_TYPE_LABELS, type RfqQuote } from '@/types/quote-request';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { PreAcceptanceChat } from '@/components/market/chat/PreAcceptanceChat';

const STATUS_CONFIG: Record<string, { icon: React.ComponentType<any>; color: string; bg: string }> = {
  draft: { icon: FileText, color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
  submitted: { icon: Send, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
  viewed: { icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  shortlisted: { icon: Star, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
  awarded: { icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  rejected: { icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  withdrawn: { icon: XCircle, color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
};

type FilterTab = 'all' | 'active' | 'awarded' | 'closed';

interface ChatTarget {
  requestId: string;
  otherUserId: string;
  otherUserName: string;
}

export default function MyOffersPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const { data: quotes, isLoading } = useMyRfqQuotes();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState<ChatTarget | null>(null);

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'Todas' },
    { id: 'active', label: 'Activas' },
    { id: 'awarded', label: 'Adjudicadas' },
    { id: 'closed', label: 'Cerradas' },
  ];

  const filteredQuotes = (quotes || []).filter(q => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return ['submitted', 'viewed', 'shortlisted'].includes(q.status);
    if (activeFilter === 'awarded') return q.status === 'awarded';
    if (activeFilter === 'closed') return ['rejected', 'withdrawn'].includes(q.status);
    return true;
  });

  const handleOpenChat = (quote: RfqQuote) => {
    const request = quote.request as any;
    if (!request?.requester_user_id) return;
    setChatTarget({
      requestId: quote.request_id,
      otherUserId: request.requester_user_id,
      otherUserName: request.requester_name || 'Solicitante',
    });
    setChatOpen(true);
  };

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0a2540' }}>
          Mis Ofertas Enviadas
        </h2>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
          {quotes?.length || 0} ofertas en total
        </span>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-1 p-1 rounded-xl mb-5"
        style={{ background: '#e8ecf3', boxShadow: 'inset 2px 2px 5px #cdd1dc, inset -2px -2px 5px #ffffff', display: 'inline-flex' }}>
        {filterTabs.map(tab => (
          <button key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={activeFilter === tab.id ? {
              background: '#f1f4f9',
              boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff',
              color: '#0a2540',
            } : { color: '#94a3b8' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quotes list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl p-5 animate-pulse"
              style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="h-14" />
            </div>
          ))}
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: '#f1f4f9', boxShadow: '6px 6px 14px #cdd1dc, -6px -6px 14px #ffffff' }}>
            <MessageSquare className="w-6 h-6" style={{ color: '#94a3b8' }} />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0a2540', marginBottom: '6px' }}>
            No tienes ofertas {activeFilter !== 'all' ? 'en esta categoría' : ''}
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '320px', margin: '0 auto' }}>
            Explora solicitudes abiertas y envía tus propuestas de servicio
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuotes.map(quote => (
            <QuoteCard key={quote.id} quote={quote} onOpenChat={handleOpenChat} />
          ))}
        </div>
      )}

      {/* Pre-acceptance chat panel */}
      {chatTarget && (
        <PreAcceptanceChat
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          requestId={chatTarget.requestId}
          otherUserId={chatTarget.otherUserId}
          otherUserName={chatTarget.otherUserName}
        />
      )}
    </div>
  );
}

function QuoteCard({ quote, onOpenChat }: { quote: RfqQuote; onOpenChat: (q: RfqQuote) => void }) {
  const statusConfig = STATUS_CONFIG[quote.status] || STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;
  const statusLabel = QUOTE_STATUS_LABELS[quote.status]?.es || quote.status;
  const requestTitle = (quote.request as any)?.title || 'Solicitud';
  const requestRef = (quote.request as any)?.reference_number || '';
  const hasRequester = !!(quote.request as any)?.requester_user_id;
  const canChat = hasRequester && !['rejected', 'withdrawn'].includes(quote.status);

  return (
    <div className="rounded-2xl p-5 transition-all hover:translate-y-[-1px]"
      style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between">
        <Link
          to={`/app/market/rfq/${quote.request_id}?from=mis-propuestas`}
          className="flex items-center gap-3 flex-1 min-w-0 no-underline"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: statusConfig.bg }}>
            <StatusIcon className="w-4.5 h-4.5" style={{ color: statusConfig.color }} />
          </div>
          <div className="min-w-0">
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0a2540' }} className="truncate">
              {requestTitle}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
                {requestRef}
              </span>
              {quote.submitted_at && (
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                  · Enviada {formatDistanceToNow(new Date(quote.submitted_at), { addSuffix: true, locale: es })}
                </span>
              )}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3 shrink-0 ml-4">
          {/* Chat button */}
          {canChat && (
            <button
              onClick={(e) => { e.preventDefault(); onOpenChat(quote); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
              style={{ background: '#f1f4f9', border: '1px solid rgba(0,0,0,0.06)', color: '#334155' }}
              title="Chat con solicitante"
            >
              <MessageSquare className="w-3.5 h-3.5" style={{ color: '#00b4d8' }} />
              Chat
            </button>
          )}
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540' }}>
            {quote.total_price ? `€${quote.total_price.toLocaleString()}` : '—'}
          </span>
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold"
            style={{ background: statusConfig.bg, color: statusConfig.color }}>
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
