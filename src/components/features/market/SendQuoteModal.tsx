/**
 * SendQuoteModal — SILK Design
 * Agent sends a detailed quote/proposal for an RFQ request
 */
import * as React from 'react';
import { useState } from 'react';
import {
  X, Send, Plus, Trash2, DollarSign, Clock, Check,
  FileText, Shield, AlertCircle,
} from 'lucide-react';
import { useCreateRfqQuote, useSubmitRfqQuote } from '@/hooks/market/useRfqRequests';
import { toast } from 'sonner';

interface SendQuoteModalProps {
  open: boolean;
  onClose: () => void;
  requestId: string;
  requestTitle: string;
  currency?: string;
}

interface Milestone {
  description: string;
  percentage: number;
  days: number;
}

const COMMISSION_BUYER = 0.05;
const COMMISSION_SELLER = 0.10;

export default function SendQuoteModal({ open, onClose, requestId, requestTitle, currency = 'EUR' }: SendQuoteModalProps) {
  const createQuote = useCreateRfqQuote();
  const submitQuote = useSubmitRfqQuote();

  const [professionalFees, setProfessionalFees] = useState<number>(0);
  const [officialFees, setOfficialFees] = useState<number>(0);
  const [estimatedDays, setEstimatedDays] = useState<number>(30);
  const [proposalSummary, setProposalSummary] = useState('');
  const [relevantExperience, setRelevantExperience] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([
    { description: 'Inicio y búsqueda', percentage: 30, days: 7 },
    { description: 'Preparación y presentación', percentage: 40, days: 14 },
    { description: 'Seguimiento y resolución', percentage: 30, days: 30 },
  ]);
  const [deliverables, setDeliverables] = useState<string[]>([
    'Informe de búsqueda',
    'Documentación oficial',
    'Certificado/Resolución',
  ]);

  if (!open) return null;

  // Calculations
  const totalHonorarios = professionalFees;
  const commissionBuyer = totalHonorarios * COMMISSION_BUYER;
  const totalBuyerPays = totalHonorarios + officialFees + commissionBuyer;
  const commissionSeller = totalHonorarios * COMMISSION_SELLER;
  const agentReceives = totalHonorarios - commissionSeller;

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency, minimumFractionDigits: 0 }).format(n);

  const handleSubmit = async () => {
    if (!professionalFees || !proposalSummary) {
      toast.error('Completa los campos obligatorios');
      return;
    }
    try {
      const quote = await createQuote.mutateAsync({
        request_id: requestId,
        total_price: professionalFees + officialFees,
        currency,
        price_breakdown: {
          professional_fees: professionalFees,
          official_fees: officialFees,
        },
        estimated_duration_days: estimatedDays,
        proposal_summary: proposalSummary,
        relevant_experience: relevantExperience,
        payment_terms: 'milestone',
        payment_milestones: milestones.map(m => ({ description: m.description, percentage: m.percentage })),
        deliverables: deliverables.map(d => ({ item: d, format: 'PDF' })),
      } as any);

      await submitQuote.mutateAsync(quote.id);
      toast.success('Oferta enviada correctamente');
      onClose();
    } catch {
      toast.error('Error al enviar la oferta');
    }
  };

  const isSending = createQuote.isPending || submitQuote.isPending;

  const addMilestone = () => setMilestones([...milestones, { description: '', percentage: 0, days: 7 }]);
  const removeMilestone = (i: number) => setMilestones(milestones.filter((_, idx) => idx !== i));
  const updateMilestone = (i: number, field: keyof Milestone, value: any) => {
    const updated = [...milestones];
    updated[i] = { ...updated[i], [field]: value };
    setMilestones(updated);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 rounded-t-2xl"
          style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0a2540' }}>Enviar Oferta</h2>
            <p style={{ fontSize: '11px', color: '#64748b' }} className="truncate max-w-md">{requestTitle}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f1f4f9' }}>
            <X className="w-4 h-4" style={{ color: '#64748b' }} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* ═══ Pricing ═══ */}
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Honorarios profesionales"
              icon={DollarSign}
              type="number"
              value={professionalFees || ''}
              onChange={v => setProfessionalFees(Number(v))}
              placeholder="0"
              suffix={currency}
            />
            <InputField
              label="Tasas oficiales estimadas"
              icon={Shield}
              type="number"
              value={officialFees || ''}
              onChange={v => setOfficialFees(Number(v))}
              placeholder="0"
              suffix={currency}
              hint="Pass-through, 0% comisión"
            />
          </div>

          {/* Estimated time */}
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Plazo estimado"
              icon={Clock}
              type="number"
              value={estimatedDays || ''}
              onChange={v => setEstimatedDays(Number(v))}
              placeholder="30"
              suffix="días"
            />
          </div>

          {/* ═══ Deliverables ═══ */}
          <div>
            <FieldLabel>Qué incluye</FieldLabel>
            <div className="space-y-1.5">
              {deliverables.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-3 h-3 shrink-0" style={{ color: '#10b981' }} />
                  <input
                    value={d}
                    onChange={e => {
                      const updated = [...deliverables];
                      updated[i] = e.target.value;
                      setDeliverables(updated);
                    }}
                    className="flex-1 px-2 py-1 rounded-lg text-xs outline-none"
                    style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.04)', color: '#0a2540' }}
                  />
                  <button onClick={() => setDeliverables(deliverables.filter((_, idx) => idx !== i))}>
                    <Trash2 className="w-3 h-3" style={{ color: '#94a3b8' }} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setDeliverables([...deliverables, ''])}
                className="flex items-center gap-1 text-[10px] font-semibold mt-1"
                style={{ color: '#00b4d8' }}
              >
                <Plus className="w-3 h-3" /> Añadir
              </button>
            </div>
          </div>

          {/* ═══ Milestones ═══ */}
          <div>
            <FieldLabel>Milestones propuestos</FieldLabel>
            <div className="space-y-2">
              {milestones.map((ms, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', width: '20px' }}>#{i + 1}</span>
                  <input
                    value={ms.description}
                    onChange={e => updateMilestone(i, 'description', e.target.value)}
                    placeholder="Descripción"
                    className="flex-1 px-2 py-1 rounded-lg text-xs outline-none"
                    style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)', color: '#0a2540' }}
                  />
                  <input
                    type="number"
                    value={ms.percentage || ''}
                    onChange={e => updateMilestone(i, 'percentage', Number(e.target.value))}
                    className="w-16 px-2 py-1 rounded-lg text-xs text-center outline-none"
                    style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)', color: '#0a2540' }}
                    placeholder="%"
                  />
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>%</span>
                  <input
                    type="number"
                    value={ms.days || ''}
                    onChange={e => updateMilestone(i, 'days', Number(e.target.value))}
                    className="w-14 px-2 py-1 rounded-lg text-xs text-center outline-none"
                    style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.04)', color: '#0a2540' }}
                    placeholder="días"
                  />
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>días</span>
                  {milestones.length > 1 && (
                    <button onClick={() => removeMilestone(i)}>
                      <Trash2 className="w-3 h-3" style={{ color: '#94a3b8' }} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addMilestone}
                className="flex items-center gap-1 text-[10px] font-semibold"
                style={{ color: '#00b4d8' }}
              >
                <Plus className="w-3 h-3" /> Añadir milestone
              </button>
            </div>
          </div>

          {/* Proposal */}
          <div>
            <FieldLabel>Propuesta / Mensaje al solicitante *</FieldLabel>
            <textarea
              value={proposalSummary}
              onChange={e => setProposalSummary(e.target.value)}
              rows={3}
              placeholder="Describe cómo abordarás el servicio, tu enfoque y valor diferencial..."
              className="w-full px-3 py-2.5 rounded-xl text-xs outline-none resize-none"
              style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)', color: '#0a2540' }}
            />
          </div>

          {/* Experience */}
          <div>
            <FieldLabel>Experiencia relevante</FieldLabel>
            <textarea
              value={relevantExperience}
              onChange={e => setRelevantExperience(e.target.value)}
              rows={2}
              placeholder="Casos similares que hayas gestionado, certificaciones relevantes..."
              className="w-full px-3 py-2.5 rounded-xl text-xs outline-none resize-none"
              style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)', color: '#0a2540' }}
            />
          </div>

          {/* ═══ SUMMARY CARD ═══ */}
          <div className="rounded-xl p-4" style={{ background: '#f1f4f9', border: '1px solid rgba(0,0,0,0.04)' }}>
            <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>
              Resumen de la oferta
            </h4>

            <div className="space-y-1.5">
              <SummaryRow label="Honorarios profesionales" value={fmt(totalHonorarios)} />
              <SummaryRow label="Tasas oficiales" value={fmt(officialFees)} muted />
              <div className="h-px my-2" style={{ background: 'rgba(0,0,0,0.06)' }} />
              <SummaryRow label="Comisión IP-NEXUS (5% buyer)" value={fmt(commissionBuyer)} color="#6366f1" />
              <SummaryRow label="Total solicitante paga" value={fmt(totalBuyerPays)} bold color="#0a2540" />
              <div className="h-px my-2" style={{ background: 'rgba(0,0,0,0.06)' }} />
              <SummaryRow label="Comisión IP-NEXUS (10% seller)" value={`-${fmt(commissionSeller)}`} color="#ef4444" />
              <SummaryRow label="Agente recibe" value={fmt(agentReceives)} bold color="#10b981" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="sticky bottom-0 px-6 py-4 flex items-center justify-between rounded-b-2xl"
          style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,0.06)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold"
            style={{ background: '#f1f4f9', color: '#334155', border: '1px solid rgba(0,0,0,0.06)' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSending || !professionalFees || !proposalSummary}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #00b4d8, #00d4aa)' }}
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Enviar Oferta
          </button>
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

function InputField({
  label, icon: Icon, type = 'text', value, onChange, placeholder, suffix, hint,
}: {
  label: string; icon: typeof DollarSign; type?: string; value: any; onChange: (v: string) => void; placeholder?: string; suffix?: string; hint?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative flex items-center">
        <div className="absolute left-3">
          <Icon className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
        </div>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)', color: '#0a2540', fontSize: '13px' }}
        />
        {suffix && (
          <span className="absolute right-3" style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8' }}>
            {suffix}
          </span>
        )}
      </div>
      {hint && <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '3px' }}>{hint}</p>}
    </div>
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
