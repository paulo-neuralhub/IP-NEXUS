import * as React from 'react';
import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft, Clock, MapPin, DollarSign, Eye, Calendar, FileText,
  Send, MessageSquare, CheckCircle, AlertCircle, Star, Lock,
  Shield, Zap, Tag, Globe, Users, Check, Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import SendQuoteModal from '@/components/features/market/SendQuoteModal';
import { useAcceptQuoteAndCreateTransaction } from '@/hooks/market/useServiceTransactions';
import {
  SERVICE_CATEGORY_LABELS,
  SERVICE_TYPE_LABELS,
  URGENCY_LABELS,
  REQUEST_STATUS_LABELS,
  QUOTE_STATUS_LABELS,
} from '@/types/quote-request';

// ── Helpers ──────────────────────────────────────────

const SERVICE_COLORS: Record<string, string> = {
  trademark: '#6366f1', patent: '#0ea5e9', design: '#f59e0b',
  copyright: '#ec4899', domain: '#10b981', litigation: '#ef4444',
  licensing: '#8b5cf6', valuation: '#14b8a6', general: '#64748b',
};
function getServiceColor(cat: string) { return SERVICE_COLORS[cat] || '#64748b'; }
function getServiceIcon(cat: string) {
  const icons: Record<string, typeof Tag> = { trademark: Shield, patent: Zap, design: Tag, litigation: Shield, general: Globe };
  return icons[cat] || Tag;
}

const JURISDICTION_FLAGS: Record<string, string> = {
  ES: '🇪🇸', EU: '🇪🇺', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷',
  IT: '🇮🇹', PT: '🇵🇹', CN: '🇨🇳', JP: '🇯🇵', KR: '🇰🇷', BR: '🇧🇷',
  MX: '🇲🇽', AR: '🇦🇷', CL: '🇨🇱', CO: '🇨🇴', IN: '🇮🇳', AU: '🇦🇺',
  CA: '🇨🇦', CH: '🇨🇭', WO: '🌐',
};

const BACK_LABELS: Record<string, string> = {
  marketplace: 'Volver al Marketplace',
  'mis-pedidos': 'Volver a Mis Pedidos',
  'mis-propuestas': 'Volver a Mis Propuestas',
  'en-curso': 'Volver a En Curso',
};
const BACK_URLS: Record<string, string> = {
  marketplace: '/app/market',
  'mis-pedidos': '/app/market/rfq',
  'mis-propuestas': '/app/market/offers',
  'en-curso': '/app/market/transactions',
};

export default function RfqRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const acceptQuote = useAcceptQuoteAndCreateTransaction();

  const from = searchParams.get('from') || 'marketplace';
  const backLabel = BACK_LABELS[from] || 'Volver';
  const backUrl = BACK_URLS[from] || '/app/market';

  // ── Fetch request ──────────────────────────────────
  const { data: request, isLoading } = useQuery({
    queryKey: ['rfq-request', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rfq_requests')
        .select(`
          *,
          requester:market_users!rfq_requests_requester_id_fkey(
            id, display_name, avatar_url, user_type, is_verified_agent
          ),
          quotes:rfq_quotes(
            *,
            agent:market_users!rfq_quotes_agent_id_fkey(
              id, display_name, avatar_url, rating_avg, ratings_count, is_verified_agent
            )
          )
        `)
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // ── Current market user ────────────────────────────
  const { data: currentMarketUser } = useQuery({
    queryKey: ['current-market-user'],
    queryFn: async (): Promise<{ id: string; user_type: string } | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const result = await (supabase as any)
        .from('market_users')
        .select('id, user_type')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      return result.data;
    },
  });

  // ═══ ROLE DETECTION ═══
  const isRequester = currentMarketUser?.id === request?.requester_id;
  const isAgent = !isRequester;
  const canSendQuote = isAgent && !!currentMarketUser;

  // Check if current agent already sent a quote
  const myQuote = request?.quotes?.find(
    (q: any) => q.agent_id === currentMarketUser?.id
  );
  const hasAlreadySent = !!myQuote;

  // ── Loading skeleton ───────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <div className="rounded-2xl p-6 space-y-4" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
          <Skeleton className="h-6 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-7 w-28 rounded-lg" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" style={{ color: '#94a3b8' }} />
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0a2540' }}>Solicitud no encontrada</h2>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px', marginBottom: '16px' }}>
          La solicitud que buscas no existe o no tienes acceso.
        </p>
        <button onClick={() => navigate(backUrl)}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
          {backLabel}
        </button>
      </div>
    );
  }

  const categoryConfig = SERVICE_CATEGORY_LABELS[request.service_category as keyof typeof SERVICE_CATEGORY_LABELS];
  const serviceConfig = SERVICE_TYPE_LABELS[request.service_type as keyof typeof SERVICE_TYPE_LABELS];
  const urgencyConfig = URGENCY_LABELS[request.urgency as keyof typeof URGENCY_LABELS];
  const statusConfig = REQUEST_STATUS_LABELS[request.status as keyof typeof REQUEST_STATUS_LABELS];
  const serviceColor = getServiceColor(request.service_category);
  const ServiceIcon = getServiceIcon(request.service_category);

  const timeAgo = request.published_at || request.created_at
    ? formatDistanceToNow(new Date(request.published_at || request.created_at), { addSuffix: true, locale: es })
    : '';

  const niceClasses = request.nice_classes as number[] | null;
  const jurisdictions = request.jurisdictions as string[] | null;
  const quotesCount = request.quotes?.length || 0;

  return (
    <div className="max-w-3xl mx-auto">

      {/* ═══ BACK BUTTON ═══ */}
      <button onClick={() => navigate(backUrl)}
        className="flex items-center gap-1.5 mb-5 text-xs font-semibold transition-colors hover:opacity-80"
        style={{ color: '#64748b' }}>
        <ArrowLeft className="w-4 h-4" />
        {backLabel}
      </button>

      {/* ═══ REQUEST HEADER (shared) ═══ */}
      <div className="rounded-2xl p-6 mb-4" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>

        {/* Title + status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: serviceColor + '10' }}>
              <ServiceIcon className="w-6 h-6" style={{ color: serviceColor }} />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#0a2540', fontFamily: "'DM Sans', sans-serif" }}>
                {request.title}
              </h1>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                {request.reference_number} · {timeAgo}
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase shrink-0"
            style={{
              background: '#f1f4f9',
              color: statusConfig?.color?.replace('text-', '') || '#64748b',
              boxShadow: '2px 2px 5px #cdd1dc, -2px -2px 5px #ffffff',
            }}>
            {statusConfig?.es || request.status}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {/* Category */}
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ background: serviceColor + '10' }}>
            <ServiceIcon className="w-3.5 h-3.5" style={{ color: serviceColor }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: serviceColor }}>
              {categoryConfig?.es || request.service_category}
            </span>
          </span>
          {/* Service type */}
          {serviceConfig && (
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: '#f1f4f9', color: '#334155', border: '1px solid rgba(0,0,0,0.04)' }}>
              {serviceConfig.es}
            </span>
          )}
          {/* Jurisdictions */}
          {jurisdictions?.map((j) => (
            <span key={j} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ background: '#f1f4f9', border: '1px solid rgba(0,0,0,0.04)' }}>
              <span className="text-sm">{JURISDICTION_FLAGS[j] || '🏳️'}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>{j}</span>
            </span>
          ))}
          {/* Urgency */}
          {urgencyConfig && (
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background: request.urgency === 'urgent' ? 'rgba(239,68,68,0.06)' : request.urgency === 'standard' ? 'rgba(245,158,11,0.06)' : 'rgba(16,185,129,0.06)',
                color: request.urgency === 'urgent' ? '#ef4444' : request.urgency === 'standard' ? '#f59e0b' : '#10b981',
              }}>
              {request.urgency === 'urgent' ? '⚡ ' : '● '}{urgencyConfig.es}
            </span>
          )}
          {/* Currency */}
          <span className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: '#f1f4f9', color: '#334155' }}>
            {request.budget_currency || 'EUR'}
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {(request.budget_min || request.budget_max) && (
            <div className="p-3 rounded-xl" style={{ background: '#f8f9fb' }}>
              <span style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>
                Presupuesto
              </span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#0a2540', letterSpacing: '-0.02em' }}>
                {request.budget_min && request.budget_max
                  ? `${request.budget_min.toLocaleString()} – ${request.budget_max.toLocaleString()}`
                  : request.budget_max ? `≤ ${request.budget_max.toLocaleString()}` : `≥ ${request.budget_min?.toLocaleString()}`
                }
              </span>
              <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>
                {request.budget_currency || 'EUR'}
              </span>
            </div>
          )}

          {niceClasses && niceClasses.length > 0 && (
            <div className="p-3 rounded-xl" style={{ background: '#f8f9fb' }}>
              <span style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>
                Clases Niza
              </span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#0a2540', letterSpacing: '-0.02em' }}>
                {niceClasses.length}
              </span>
              <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>
                {niceClasses.join(', ')}
              </span>
            </div>
          )}

          <div className="p-3 rounded-xl" style={{ background: '#f8f9fb' }}>
            <span style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>
              Cierre
            </span>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#0a2540', letterSpacing: '-0.02em' }}>
              {request.closes_at ? format(new Date(request.closes_at), 'dd MMM', { locale: es }) : '—'}
            </span>
          </div>

          <div className="p-3 rounded-xl" style={{ background: '#f8f9fb' }}>
            <span style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>
              Propuestas
            </span>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#0a2540', letterSpacing: '-0.02em' }}>
              {quotesCount}{request.max_quotes ? ` / ${request.max_quotes}` : ''}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-5">
          <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '8px' }}>
            Descripción
          </h4>
          <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {request.description}
          </p>
        </div>

        {/* Attachments */}
        {request.attachments && Array.isArray(request.attachments) && (request.attachments as any[]).length > 0 && (
          <div className="mb-5">
            <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '8px' }}>
              Adjuntos
            </h4>
            <div className="flex flex-wrap gap-2">
              {(request.attachments as any[]).map((att: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: '#f1f4f9', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <FileText className="w-3.5 h-3.5" style={{ color: '#64748b' }} />
                  <span style={{ fontSize: '12px', color: '#334155' }}>{att.name || `Adjunto ${idx + 1}`}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requester info (for agents) */}
        {isAgent && (
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f8f9fb' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: '#7c3aed' }}>
              {request.is_blind ? '?' : (request.requester as any)?.display_name?.charAt(0) || 'U'}
            </div>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0a2540' }}>
                {request.is_blind ? 'Solicitante anónimo' : (request.requester as any)?.display_name || 'Solicitante'}
              </span>
              <div className="flex items-center gap-1">
                {(request.requester as any)?.is_verified_agent && (
                  <CheckCircle className="w-3 h-3" style={{ color: '#7c3aed' }} />
                )}
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {(request.requester as any)?.user_type === 'ip_agent' ? 'Agente IP' : 'Solicitante'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Privacy note (for agents) */}
        {isAgent && (
          <div className="mt-4 p-3 rounded-xl flex items-start gap-2"
            style={{ background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.1)' }}>
            <Lock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#7c3aed' }} />
            <p style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.5 }}>
              Los datos confidenciales del cliente se revelarán únicamente al agente cuya propuesta sea aceptada y el pago esté en escrow.
            </p>
          </div>
        )}
      </div>

      {/* ═══ AGENT VIEW: Send quote CTA ═══ */}
      {isAgent && (
        <>
          {!hasAlreadySent && (request.status === 'open' || request.status === 'evaluating') && (
            <div className="rounded-2xl p-5 mb-4" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0a2540' }}>
                    ¿Te interesa este servicio?
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Envía tu propuesta con precio, plazo y condiciones.
                  </p>
                </div>
                <button onClick={() => setQuoteModalOpen(true)}
                  className="relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 4px 14px rgba(124,58,237,0.25)' }}>
                  <Send className="w-4 h-4" />
                  Enviar Mi Propuesta
                  <span className="absolute bottom-0 left-[22%] right-[22%] h-[2px] rounded-full"
                    style={{ background: 'rgba(255,255,255,0.4)' }} />
                </button>
              </div>
            </div>
          )}

          {hasAlreadySent && (
            <div className="rounded-2xl p-5 mb-4" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(16,185,129,0.08)' }}>
                  <Check className="w-5 h-5" style={{ color: '#10b981' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>
                    Ya has enviado una propuesta
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>
                    Enviada {formatDistanceToNow(new Date(myQuote.created_at), { addSuffix: true, locale: es })} ·&nbsp;
                    {myQuote.total_price?.toLocaleString()} {myQuote.currency} ·&nbsp;
                    Estado: {QUOTE_STATUS_LABELS[myQuote.status as keyof typeof QUOTE_STATUS_LABELS]?.es || myQuote.status}
                  </p>
                </div>
              </div>
            </div>
          )}

          {request.status !== 'open' && request.status !== 'evaluating' && !hasAlreadySent && (
            <div className="rounded-2xl p-5 mb-4 text-center" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                Esta solicitud ya no acepta propuestas.
              </p>
            </div>
          )}
        </>
      )}

      {/* ═══ OWNER VIEW: Received quotes ═══ */}
      {isRequester && (
        <div className="rounded-2xl p-5 mb-4" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540', marginBottom: '4px' }}>
            Propuestas recibidas
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
            Compara las propuestas y acepta la que mejor se adapte a tus necesidades.
          </p>

          {quotesCount > 0 ? (
            <div className="space-y-3">
              {(request.quotes as any[])
                .sort((a, b) => (a.total_price || 0) - (b.total_price || 0))
                .map((quote: any, idx: number) => {
                  const qStatus = QUOTE_STATUS_LABELS[quote.status as keyof typeof QUOTE_STATUS_LABELS];
                  return (
                    <div key={quote.id} className="p-4 rounded-xl transition-colors"
                      style={{
                        border: idx === 0 && quotesCount > 1 ? '1px solid rgba(0,180,216,0.15)' : '1px solid rgba(0,0,0,0.06)',
                        background: idx === 0 && quotesCount > 1 ? 'rgba(0,180,216,0.02)' : 'transparent',
                      }}>

                      {/* Best price badge */}
                      {idx === 0 && quotesCount > 1 && (
                        <span className="inline-block px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider text-white mb-2"
                          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                          Mejor precio
                        </span>
                      )}

                      <div className="flex items-center gap-4">
                        {/* Agent avatar */}
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{ background: serviceColor }}>
                          {quote.agent?.display_name?.substring(0, 2) || '??'}
                        </div>

                        {/* Agent info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540' }}>
                              {quote.agent?.display_name || 'Agente'}
                            </span>
                            {quote.agent?.is_verified_agent && (
                              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md"
                                style={{ background: 'rgba(124,58,237,0.08)' }}>
                                <CheckCircle className="w-3 h-3" style={{ color: '#7c3aed' }} />
                                <span style={{ fontSize: '8px', fontWeight: 700, color: '#7c3aed' }}>VERIFICADO</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs">
                            {quote.agent?.rating_avg && (
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3" style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                                <span style={{ fontWeight: 600, color: '#0a2540' }}>{Number(quote.agent.rating_avg).toFixed(1)}</span>
                                <span style={{ color: '#94a3b8' }}>({quote.agent.ratings_count || 0})</span>
                              </span>
                            )}
                            {quote.estimated_duration_days && (
                              <span style={{ color: '#64748b' }}>{quote.estimated_duration_days} días</span>
                            )}
                          </div>

                          {quote.proposal_summary && (
                            <p className="line-clamp-2 mt-1" style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                              &ldquo;{quote.proposal_summary}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* Price + Action */}
                        <div className="text-right shrink-0">
                          <span style={{ fontSize: '20px', fontWeight: 700, color: '#0a2540', display: 'block', letterSpacing: '-0.02em' }}>
                            {Number(quote.total_price).toLocaleString()} {quote.currency}
                          </span>

                          {quote.professional_fees != null && (
                            <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>
                              Hon. {Number(quote.professional_fees).toLocaleString()}
                            </span>
                          )}
                          {quote.official_fees != null && (
                            <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>
                              Tasas {Number(quote.official_fees).toLocaleString()}
                            </span>
                          )}

                          <Badge className={`mt-1 ${qStatus?.bgColor} ${qStatus?.color}`} style={{ fontSize: '10px' }}>
                            {qStatus?.es || quote.status}
                          </Badge>

                          {quote.status === 'submitted' && (request.status === 'open' || request.status === 'evaluating') && (
                            <button
                              disabled={acceptQuote.isPending}
                              onClick={async () => {
                                await acceptQuote.mutateAsync({ quoteId: quote.id, requestId: request.id });
                                navigate('/app/market/transactions');
                              }}
                              className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50 block ml-auto"
                              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                              {acceptQuote.isPending ? (
                                <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Procesando...</span>
                              ) : (
                                <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Aceptar Propuesta</span>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: '#f1f4f9', boxShadow: '4px 4px 10px #cdd1dc, -4px -4px 10px #ffffff' }}>
                <MessageSquare className="w-6 h-6" style={{ color: '#94a3b8' }} />
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540', marginBottom: '4px' }}>
                Esperando propuestas...
              </h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '300px', margin: '0 auto' }}>
                Los agentes del marketplace verán tu solicitud y enviarán sus propuestas. Te notificaremos cuando llegue la primera.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ═══ Requirements (shared, if any) ═══ */}
      {request.requirements && typeof request.requirements === 'object' && Object.keys(request.requirements as any).length > 0 && (
        <div className="rounded-2xl p-5 mb-4" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
          <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '12px' }}>
            Requisitos del agente
          </h4>
          <div className="flex flex-wrap gap-2">
            {(request.requirements as any).min_rating && (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs"
                style={{ background: '#f1f4f9' }}>
                <Star className="w-3 h-3" style={{ color: '#f59e0b' }} />
                <span style={{ fontWeight: 600, color: '#334155' }}>Rating min. {(request.requirements as any).min_rating}</span>
              </span>
            )}
            {(request.requirements as any).verified_only && (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs"
                style={{ background: 'rgba(124,58,237,0.06)' }}>
                <CheckCircle className="w-3 h-3" style={{ color: '#7c3aed' }} />
                <span style={{ fontWeight: 600, color: '#7c3aed' }}>Solo verificados</span>
              </span>
            )}
            {(request.requirements as any).experience_years && (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs"
                style={{ background: '#f1f4f9' }}>
                <Users className="w-3 h-3" style={{ color: '#64748b' }} />
                <span style={{ fontWeight: 600, color: '#334155' }}>Min. {(request.requirements as any).experience_years} años</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Send Quote Modal */}
      <SendQuoteModal
        open={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        requestId={request.id}
        requestTitle={request.title}
        currency={request.budget_currency || 'EUR'}
        request={request}
      />
    </div>
  );
}
