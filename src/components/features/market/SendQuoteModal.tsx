/**
 * SendQuoteModal — Smart Proposal with auto-fill, phases, preview
 * SILK Design System
 */
import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import {
  X, Send, Plus, Trash2, DollarSign, Clock, Check,
  FileText, Shield, AlertTriangle, Eye, ArrowLeft,
  Sparkles, Info, Star, CheckCircle, Loader2,
} from 'lucide-react';
import { useCreateRfqQuote, useSubmitRfqQuote } from '@/hooks/market/useRfqRequests';
import { useCommissionRates, calculateFeesWithConfig } from '@/hooks/market/usePlatformConfig';
import { useCalculateFees } from '@/hooks/useIpOffices';
import { getDefaultPhases, getDefaultEstimatedDays, getDefaultIncludes, type ServicePhase } from '@/lib/market-service-phases';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { toast } from 'sonner';

interface SendQuoteModalProps {
  open: boolean;
  onClose: () => void;
  requestId: string;
  requestTitle: string;
  currency?: string;
  /** Full request data for smart auto-fill */
  request?: any;
}

export default function SendQuoteModal({ open, onClose, requestId, requestTitle, currency = 'EUR', request }: SendQuoteModalProps) {
  const createQuote = useCreateRfqQuote();
  const submitQuote = useSubmitRfqQuote();
  const { data: commissionConfig } = useCommissionRates();

  // Auto-calculate official fees from DB
  const jurisdictions = (request?.jurisdictions as string[] | null) || [];
  const niceClasses = (request?.nice_classes as number[] | null) || [];
  const serviceCategory = request?.service_category || '';
  const serviceType = request?.service_type || '';

  // Try to auto-calculate from official_fees table
  const ipType = serviceCategory === 'trademark' ? 'trademark' : serviceCategory === 'patent' ? 'patent' : serviceCategory;
  const officeCode = jurisdictions[0] || '';
  const autoFees = useCalculateFees(officeCode, ipType, niceClasses.length || 1);

  const [step, setStep] = useState<1 | 2>(1); // 1=editor, 2=preview
  const [professionalFees, setProfessionalFees] = useState<number>(0);
  const [officialFees, setOfficialFees] = useState<number>(0);
  const [estimatedDays, setEstimatedDays] = useState<number>(30);
  const [validityDays, setValidityDays] = useState<number>(15);
  const [proposalSummary, setProposalSummary] = useState('');
  const [relevantExperience, setRelevantExperience] = useState('');
  const [phases, setPhases] = useState<ServicePhase[]>([]);
  const [includes, setIncludes] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Auto-fill on first open
  useEffect(() => {
    if (open && !initialized) {
      const defaultPhases = getDefaultPhases(serviceType);
      const defaultDays = getDefaultEstimatedDays(serviceType, request?.urgency);
      const defaultIncludes = getDefaultIncludes(serviceType);

      setPhases(defaultPhases);
      setEstimatedDays(defaultDays);
      setIncludes(defaultIncludes);

      if (autoFees.total > 0) {
        setOfficialFees(autoFees.total);
      }
      setInitialized(true);
    }
    if (!open) {
      setInitialized(false);
      setStep(1);
    }
  }, [open, initialized, serviceType, request?.urgency, autoFees.total]);

  if (!open) return null;

  const sellerPct = commissionConfig?.seller_fee_percent ?? 10;
  const buyerPct = commissionConfig?.buyer_fee_percent ?? 5;

  const fees = calculateFeesWithConfig(professionalFees, officialFees, {
    seller_fee_percent: sellerPct,
    buyer_fee_percent: buyerPct,
    official_fees_commission: 0,
    min_platform_fee: 5,
    currency: 'EUR',
  });

  const totalPercentage = phases.reduce((sum, p) => sum + (p.percentage || 0), 0);
  const isFormValid = professionalFees > 0 && proposalSummary.trim().length > 0 && totalPercentage === 100;

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency, minimumFractionDigits: 0 }).format(n);

  const handleSubmit = async () => {
    if (!isFormValid) return;
    try {
      const quote = await createQuote.mutateAsync({
        request_id: requestId,
        total_price: fees.totalBuyerPays,
        currency,
        price_breakdown: {
          professional_fees: professionalFees,
          official_fees: officialFees,
          platform_fee_buyer: fees.platformFeeBuyer,
          platform_fee_seller: fees.platformFeeSeller,
        },
        estimated_duration_days: estimatedDays,
        proposal_summary: proposalSummary,
        relevant_experience: relevantExperience,
        payment_terms: 'milestone',
        payment_milestones: phases.map((p, i) => ({ description: p.name, percentage: p.percentage, days: p.days })),
        deliverables: includes.map(d => ({ item: d, format: 'PDF' })),
      } as any);

      await submitQuote.mutateAsync(quote.id);
      toast.success('Propuesta enviada correctamente');
      onClose();
    } catch {
      toast.error('Error al enviar la propuesta');
    }
  };

  const isSending = createQuote.isPending || submitQuote.isPending;

  const updatePhase = (idx: number, field: keyof ServicePhase, value: any) => {
    setPhases(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };
  const removePhase = (idx: number) => setPhases(prev => prev.filter((_, i) => i !== idx));
  const addPhase = () => setPhases(prev => [...prev, { name: '', percentage: 0, days: 7 }]);

  const toggleInclude = (item: string) => {
    setIncludes(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const urgencyLabel = request?.urgency === 'urgent' ? '⚡ Urgente' : request?.urgency === 'standard' ? 'Normal' : 'Flexible';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 rounded-t-2xl"
          style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-50">
                <ArrowLeft className="w-4 h-4" style={{ color: '#64748b' }} />
              </button>
            )}
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0a2540' }}>
                {step === 1 ? 'Preparar Propuesta' : 'Vista Previa'}
              </h2>
              <p style={{ fontSize: '11px', color: '#64748b' }} className="truncate max-w-md">{requestTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f1f4f9' }}>
            <X className="w-4 h-4" style={{ color: '#64748b' }} />
          </button>
        </div>

        {step === 1 ? (
          <div className="px-6 py-5 space-y-5">

            {/* ═══ SECTION A: Request header (read-only) ═══ */}
            {request && (
              <div className="p-4 rounded-xl" style={{ background: '#f8f9fb', border: '1px solid rgba(0,0,0,0.04)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(0,180,216,0.08)' }}>
                    <FileText className="w-5 h-5" style={{ color: '#00b4d8' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate" style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540' }}>{request.title}</h3>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      {jurisdictions.map((j: string) => j).join(', ')}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {niceClasses.length > 0 && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                      style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', color: '#334155' }}>
                      {niceClasses.length} clases ({niceClasses.join(', ')})
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                    style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', color: '#334155' }}>
                    {currency}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                    style={{
                      background: request?.urgency === 'urgent' ? 'rgba(239,68,68,0.06)' : '#fff',
                      color: request?.urgency === 'urgent' ? '#ef4444' : '#334155',
                      border: '1px solid rgba(0,0,0,0.06)',
                    }}>
                    {urgencyLabel}
                  </span>
                  {(request?.budget_min || request?.budget_max) && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                      style={{ background: 'rgba(245,158,11,0.06)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.1)' }}>
                      Presupuesto: {request.budget_min}–{request.budget_max} {currency}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ═══ SECTION B: Official fees ═══ */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <FieldLabel>Tasas oficiales</FieldLabel>
                {autoFees.total > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                    style={{ background: 'rgba(16,185,129,0.06)', color: '#10b981' }}>
                    <Sparkles className="w-3 h-3" /> Auto-calculado
                  </span>
                )}
              </div>
              {autoFees.breakdown.length > 0 ? (
                <div className="space-y-1.5">
                  {autoFees.breakdown.map((fee, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg"
                      style={{ background: '#f8f9fb', border: '1px solid rgba(0,0,0,0.04)' }}>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>{fee.name}</span>
                        {fee.quantity > 1 && <span style={{ fontSize: '10px', color: '#94a3b8' }}> ×{fee.quantity}</span>}
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#0a2540' }}>{fmt(fee.subtotal)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-2.5 rounded-lg"
                    style={{ background: 'rgba(0,180,216,0.04)', border: '1px solid rgba(0,180,216,0.1)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0a2540' }}>Total tasas</span>
                    <input type="number" value={officialFees || ''} onChange={e => setOfficialFees(Number(e.target.value))}
                      className="w-28 px-2 py-1 rounded-lg text-sm text-right font-semibold outline-none"
                      style={{ border: '1px solid rgba(0,0,0,0.08)', color: '#0a2540' }} />
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
                    No hay tasas auto-calculadas para esta combinación. Introduce manualmente.
                  </p>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{currency}</span>
                    <input type="number" value={officialFees || ''} onChange={e => setOfficialFees(Number(e.target.value))}
                      placeholder="0" className="w-32 px-3 py-2 rounded-xl text-sm text-right font-semibold outline-none"
                      style={{ border: '1px solid rgba(0,0,0,0.08)', color: '#0a2540' }} />
                  </div>
                </div>
              )}
              <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '6px' }}>
                💡 Las tasas oficiales se adelantan del escrow. IP-NEXUS no cobra comisión sobre tasas oficiales.
              </p>
            </div>

            {/* ═══ SECTION C: Professional fees ═══ */}
            <div>
              <FieldLabel>Tus honorarios profesionales *</FieldLabel>
              <p style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '8px' }}>
                Importe sobre el cual IP-NEXUS calcula su comisión ({sellerPct}% agente + {buyerPct}% solicitante).
              </p>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>{currency}</span>
                <input type="number" value={professionalFees || ''} onChange={e => setProfessionalFees(Number(e.target.value))}
                  placeholder="Ej: 850" autoFocus
                  className="w-40 px-4 py-3 rounded-xl text-lg font-semibold outline-none"
                  style={{ border: '1px solid rgba(0,0,0,0.08)', color: '#0a2540' }} />
                {(request?.budget_min || request?.budget_max) && (
                  <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px]"
                    style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                    <Info className="w-3 h-3" />
                    Presupuesto: {request.budget_min}–{request.budget_max}
                  </span>
                )}
              </div>
            </div>

            {/* ═══ SECTION D: Service phases ═══ */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FieldLabel>Fases del servicio</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-5 h-5 rounded-full flex items-center justify-center transition-colors hover:bg-slate-100"
                        style={{ color: '#94a3b8' }}
                        aria-label="¿Qué son las fases del servicio?"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="start" className="w-80 p-4 rounded-xl border-0"
                      style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)' }}>
                      <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#0a2540', marginBottom: '8px' }}>
                        ¿Qué son las fases del servicio?
                      </h5>
                      <p style={{ fontSize: '12px', color: '#334155', lineHeight: 1.6, marginBottom: '10px' }}>
                        Las fases dividen el trabajo en etapas con entregas parciales.
                        Cada fase tiene un porcentaje del pago total que se libera del escrow
                        cuando el solicitante confirma la entrega de esa fase.
                      </p>
                      <div className="space-y-1.5 mb-3">
                        {[
                          { title: 'Protección para ambas partes:', text: 'el solicitante paga por resultados reales, el agente cobra a medida que entrega.' },
                          { title: 'Transparencia total:', text: 'el solicitante ve el avance del trabajo en cada fase.' },
                          { title: 'Pagos progresivos:', text: 'al completar cada fase, el porcentaje asignado se libera automáticamente del escrow.' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, flexShrink: 0 }}>✓</span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              <strong style={{ color: '#334155' }}>{item.title}</strong> {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="p-2.5 rounded-lg" style={{ background: '#f8f9fb' }}>
                        <p style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.5 }}>
                          <strong style={{ color: '#64748b' }}>Ejemplo:</strong> Si tus honorarios son €1.000 y la Fase 1 es el 25%,
                          al completar y confirmar la Fase 1 se liberan €250 del escrow a tu cuenta.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                  style={{ background: 'rgba(16,185,129,0.06)', color: '#10b981' }}>
                  <Sparkles className="w-3 h-3" /> Auto-generado · Editable
                </span>
              </div>
              <div className="space-y-1.5">
                {phases.map((phase, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl"
                    style={{ background: '#f8f9fb', border: '1px solid rgba(0,0,0,0.04)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(135deg, #00b4d8, #00d4aa)' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>{idx + 1}</span>
                    </div>
                    <input type="text" value={phase.name} onChange={e => updatePhase(idx, 'name', e.target.value)}
                      className="flex-1 px-2 py-1 rounded-lg text-xs outline-none"
                      style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)', color: '#334155' }}
                      placeholder="Nombre de la fase" />
                    <input type="number" value={phase.percentage || ''} onChange={e => updatePhase(idx, 'percentage', Number(e.target.value))}
                      className="w-14 px-2 py-1 rounded-lg text-xs text-center outline-none"
                      style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)', color: '#0a2540' }}
                      placeholder="%" />
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>%</span>
                    {phases.length > 1 && (
                      <button onClick={() => removePhase(idx)}>
                        <Trash2 className="w-3 h-3" style={{ color: '#94a3b8' }} />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={addPhase}
                  className="w-full p-2 rounded-xl text-[10px] font-semibold border-2 border-dashed hover:bg-slate-50"
                  style={{ borderColor: 'rgba(0,0,0,0.08)', color: '#64748b' }}>
                  <Plus className="w-3 h-3 inline mr-1" /> Añadir fase
                </button>
                {totalPercentage !== 100 && phases.length > 0 && (
                  <div className="flex items-center gap-1.5 p-2 rounded-lg"
                    style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}>
                    <AlertTriangle className="w-3 h-3" style={{ color: '#ef4444' }} />
                    <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 600 }}>
                      Los porcentajes suman {totalPercentage}% — deben sumar 100%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ═══ SECTION E: Duration + includes + message ═══ */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Plazo estimado (días)</FieldLabel>
                <input type="number" value={estimatedDays} onChange={e => setEstimatedDays(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: '1px solid rgba(0,0,0,0.08)', color: '#0a2540' }} />
              </div>
              <div>
                <FieldLabel>Validez de la propuesta (días)</FieldLabel>
                <input type="number" value={validityDays} onChange={e => setValidityDays(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: '1px solid rgba(0,0,0,0.08)', color: '#0a2540' }} />
              </div>
            </div>

            <div>
              <FieldLabel>Servicios incluidos</FieldLabel>
              <div className="flex flex-wrap gap-1.5">
                {includes.map((item, i) => (
                  <label key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer"
                    style={{ background: 'rgba(0,180,216,0.06)', border: '1px solid rgba(0,180,216,0.15)' }}>
                    <Check className="w-3 h-3" style={{ color: '#00b4d8' }} />
                    <span style={{ fontSize: '11px', fontWeight: 500, color: '#00b4d8' }}>{item}</span>
                    <button onClick={() => toggleInclude(item)} className="ml-1">
                      <X className="w-2.5 h-2.5" style={{ color: '#94a3b8' }} />
                    </button>
                  </label>
                ))}
                <button onClick={() => {
                  const name = prompt('Nombre del servicio incluido:');
                  if (name) setIncludes(prev => [...prev, name]);
                }}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border border-dashed"
                  style={{ borderColor: 'rgba(0,0,0,0.1)', color: '#64748b' }}>
                  + Añadir
                </button>
              </div>
            </div>

            <div>
              <FieldLabel>Propuesta / Mensaje al solicitante *</FieldLabel>
              <textarea rows={3} value={proposalSummary} onChange={e => setProposalSummary(e.target.value)}
                placeholder="Describe tu enfoque, experiencia y valor diferencial..."
                className="w-full px-3 py-2.5 rounded-xl text-xs outline-none resize-none"
                style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)', color: '#0a2540' }} />
            </div>

            <div>
              <FieldLabel>Experiencia relevante</FieldLabel>
              <textarea rows={2} value={relevantExperience} onChange={e => setRelevantExperience(e.target.value)}
                placeholder="Casos similares, certificaciones relevantes..."
                className="w-full px-3 py-2.5 rounded-xl text-xs outline-none resize-none"
                style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)', color: '#0a2540' }} />
            </div>

            {/* ═══ SECTION F: Cost summary ═══ */}
            <div className="rounded-xl p-4" style={{ background: '#f1f4f9', border: '1px solid rgba(0,0,0,0.04)' }}>
              <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>
                Resumen de costes
              </h4>
              <div className="space-y-1.5">
                <SummaryRow label="Tus honorarios" value={fmt(professionalFees)} />
                <SummaryRow label="Tasas oficiales" value={fmt(officialFees)} muted />
                <div className="h-px my-2" style={{ background: 'rgba(0,0,0,0.06)' }} />
                <SummaryRow label={`Comisión IP-NEXUS (${buyerPct}% al solicitante)`} value={`+ ${fmt(fees.platformFeeBuyer)}`} color="#00b4d8" />
                <SummaryRow label="Total solicitante paga" value={fmt(fees.totalBuyerPays)} bold color="#0a2540" />
                <div className="h-px my-2" style={{ background: 'rgba(0,0,0,0.06)' }} />
                <SummaryRow label={`Tu comisión (−${sellerPct}%)`} value={`−${fmt(fees.platformFeeSeller)}`} color="#ef4444" />
                <div className="p-2.5 rounded-lg mt-1"
                  style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)' }}>
                  <SummaryRow label="Tú recibirás" value={fmt(fees.totalSellerReceives)} bold color="#10b981" />
                </div>
                <SummaryRow label={`Ingreso IP-NEXUS (${sellerPct}% + ${buyerPct}%)`} value={fmt(fees.totalPlatformRevenue)} color="#94a3b8" />
              </div>
            </div>
          </div>
        ) : (
          /* ═══ STEP 2: PREVIEW ═══ */
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.1)' }}>
              <Eye className="w-4 h-4" style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#f59e0b' }}>
                Así verá tu propuesta el solicitante
              </span>
            </div>

            <div className="p-5 rounded-2xl" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
              {/* Price breakdown */}
              <div className="p-4 rounded-xl mb-4" style={{ background: '#f8f9fb' }}>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Honorarios profesionales</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0a2540' }}>{fmt(professionalFees)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Tasas oficiales</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0a2540' }}>{fmt(officialFees)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>Comisión plataforma ({buyerPct}%)</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>{fmt(fees.platformFeeBuyer)}</span>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', margin: '8px 0' }} />
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#0a2540' }}>Total</span>
                    <span style={{ fontSize: '24px', fontWeight: 700, color: '#0a2540', letterSpacing: '-0.02em' }}>{fmt(fees.totalBuyerPays)}</span>
                  </div>
                </div>
              </div>

              {/* Phases */}
              <div className="mb-4">
                <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Fases del servicio
                </h4>
                <div className="space-y-1.5">
                  {phases.map((phase, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: '#f8f9fb' }}>
                      <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #00b4d8, #00d4aa)' }}>{idx + 1}</span>
                      <span style={{ fontSize: '13px', color: '#334155', flex: 1 }}>{phase.name}</span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>{phase.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration + includes */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: '#f1f4f9', color: '#334155' }}>
                  ⏱ {estimatedDays} días laborables
                </span>
                {includes.map(inc => (
                  <span key={inc} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: '#f1f4f9', color: '#334155' }}>
                    ✓ {inc}
                  </span>
                ))}
              </div>

              {/* Message */}
              {proposalSummary && (
                <div className="p-3 rounded-lg" style={{ background: 'rgba(0,180,216,0.04)', border: '1px solid rgba(0,180,216,0.08)' }}>
                  <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, fontStyle: 'italic' }}>
                    &ldquo;{proposalSummary}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 px-6 py-4 flex items-center justify-between rounded-b-2xl"
          style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          {step === 1 ? (
            <>
              <button onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold"
                style={{ background: '#f1f4f9', color: '#334155', border: '1px solid rgba(0,0,0,0.06)' }}>
                Cancelar
              </button>
              <button onClick={() => setStep(2)} disabled={!isFormValid}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                style={{ background: '#fff', border: '1px solid rgba(0,180,216,0.2)', color: '#00b4d8' }}>
                <Eye className="w-4 h-4" /> Vista Previa
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold"
                style={{ background: '#f1f4f9', color: '#334155', border: '1px solid rgba(0,0,0,0.06)' }}>
                ← Volver a editar
              </button>
              <button onClick={handleSubmit} disabled={isSending}
                className="relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #00b4d8, #00d4aa)', boxShadow: '0 4px 14px rgba(0,180,216,0.25)' }}>
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Confirmar y Enviar
                <span className="absolute bottom-0 left-[20%] right-[20%] h-[2px] rounded-full"
                  style={{ background: 'rgba(255,255,255,0.4)' }} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' as const, display: 'block', marginBottom: '6px', letterSpacing: '0.3px' }}>
      {children}
    </label>
  );
}

function SummaryRow({ label, value, bold, color, muted }: { label: string; value: string; bold?: boolean; color?: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ fontSize: '11px', color: muted ? '#94a3b8' : '#64748b' }}>{label}</span>
      <span style={{ fontSize: bold ? '14px' : '12px', fontWeight: bold ? 700 : 600, color: color || '#0a2540' }}>
        {value}
      </span>
    </div>
  );
}
