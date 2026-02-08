import * as React from 'react';
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Check, MessageCircle, FileText,
  Package, Star, Clock, CreditCard,
  Loader2, ArrowLeftRight
} from 'lucide-react';
import {
  useServiceTransaction,
  useSimulateEscrowPayment,
  useDeliverMilestone,
  useApproveMilestone,
  useSubmitServiceReview,
  type ServiceMilestone,
} from '@/hooks/market/useServiceTransactions';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

function formatCurrency(amount: number | null, currency = 'EUR'): string {
  if (amount == null) return '—';
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending_payment: 'Pendiente de pago', in_progress: 'En progreso',
    completed: 'Completada', cancelled: 'Cancelada', disputed: 'En disputa',
  };
  return labels[status] || status;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending_payment: '#f59e0b', in_progress: '#00b4d8',
    completed: '#10b981', cancelled: '#94a3b8', disputed: '#ef4444',
  };
  return colors[status] || '#94a3b8';
}

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: tx, isLoading } = useServiceTransaction(id);
  const simulatePayment = useSimulateEscrowPayment();
  const deliverMilestone = useDeliverMilestone();
  const approveMilestone = useApproveMilestone();
  const submitReview = useSubmitServiceReview();

  const [deliverNote, setDeliverNote] = useState('');
  const [showDeliverModal, setShowDeliverModal] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-5 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="text-center py-16">
        <ArrowLeftRight className="w-12 h-12 mx-auto mb-4" style={{ color: '#94a3b8' }} />
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0a2540', marginBottom: '8px' }}>
          Transacción no encontrada
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
          La transacción no existe o no tienes acceso.
        </p>
        <button onClick={() => navigate('/app/market/transactions')}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #00b4d8, #00d4aa)' }}>
          Volver a En Curso
        </button>
      </div>
    );
  }

  const isBuyer = user?.id === tx.buyer_user_id;
  const statusColor = getStatusColor(tx.status);
  const milestones = tx.milestones || [];
  const currentMilestone = milestones.find(m => m.status === 'in_progress' || m.status === 'delivered');

  return (
    <div className="space-y-5 max-w-4xl mx-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Back */}
      <button onClick={() => navigate('/app/market/transactions')}
        className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#64748b' }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Volver a En Curso
      </button>

      {/* Header */}
      <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(0,180,216,0.08)' }}>
              <ArrowLeftRight className="w-6 h-6" style={{ color: '#00b4d8' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0a2540' }}>{tx.transaction_number}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase"
                  style={{ background: statusColor + '15', color: statusColor }}>
                  {getStatusLabel(tx.status)}
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{isBuyer ? 'Eres el comprador' : 'Eres el agente'}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#0a2540' }}>
              {formatCurrency(tx.total_amount, tx.currency)}
            </span>
          </div>
        </div>

        {/* Financial breakdown */}
        <div className="grid grid-cols-5 gap-4 p-4 rounded-xl" style={{ background: '#f8fafc' }}>
          <div>
            <span style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Honorarios</span>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#0a2540', display: 'block' }}>{formatCurrency(tx.professional_fees, tx.currency)}</span>
          </div>
          <div>
            <span style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Tasas oficiales</span>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#64748b', display: 'block' }}>{formatCurrency(tx.official_fees, tx.currency)}</span>
          </div>
          <div>
            <span style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Fee plataforma</span>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#64748b', display: 'block' }}>{formatCurrency((tx.platform_fee_buyer || 0) + (tx.platform_fee_seller || 0), tx.currency)}</span>
          </div>
          <div>
            <span style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>En escrow</span>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#f59e0b', display: 'block' }}>
              {tx.escrow_held ? `🔒 ${formatCurrency(tx.escrow_held, tx.currency)}` : '—'}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Liberado</span>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#10b981', display: 'block' }}>
              {tx.escrow_released ? formatCurrency(tx.escrow_released, tx.currency) : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Milestones */}
      {milestones.length > 0 && (
        <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540', marginBottom: '16px' }}>Milestones</h3>

          {/* Visual stepper */}
          <div className="flex items-center justify-between mb-6">
            {milestones.map((ms, i) => {
              const done = ms.status === 'approved';
              const current = ms.status === 'in_progress' || ms.status === 'delivered';
              const delivered = ms.status === 'delivered';
              return (
                <React.Fragment key={ms.id}>
                  <div className="flex flex-col items-center gap-1.5" style={{ flex: 1, maxWidth: '140px' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={
                        done ? { background: 'linear-gradient(135deg, #00b4d8, #00d4aa)', color: '#fff' }
                          : delivered ? { background: '#fef3c7', color: '#d97706', border: '2px solid #fbbf24' }
                          : current ? { background: '#f1f4f9', color: '#00b4d8', boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff', border: '2px solid rgba(0,180,216,0.3)' }
                          : { background: '#f1f4f9', color: '#94a3b8' }
                      }>
                      {done ? <Check className="w-4 h-4" /> : delivered ? <Package className="w-4 h-4" /> : <span style={{ fontSize: '12px', fontWeight: 700 }}>{i + 1}</span>}
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 600, textAlign: 'center', color: done ? '#00b4d8' : current ? '#0a2540' : '#94a3b8', textTransform: 'uppercase' }}>
                      {ms.name}
                    </span>
                    {ms.amount != null && (
                      <span style={{ fontSize: '10px', color: done ? '#10b981' : '#94a3b8' }}>
                        {formatCurrency(ms.amount, tx.currency)}
                      </span>
                    )}
                  </div>
                  {i < milestones.length - 1 && (
                    <div className="flex-1 h-0.5 mx-1 rounded-full" style={{ background: done ? 'linear-gradient(135deg, #00b4d8, #00d4aa)' : '#e8ecf3', maxWidth: '80px' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Milestone detail list */}
          <div className="space-y-2">
            {milestones.map((ms, i) => (
              <MilestoneRow key={ms.id} ms={ms} i={i} tx={tx} isBuyer={isBuyer}
                deliverNote={deliverNote} setDeliverNote={setDeliverNote}
                showDeliverModal={showDeliverModal} setShowDeliverModal={setShowDeliverModal}
                showConfirmModal={showConfirmModal} setShowConfirmModal={setShowConfirmModal}
                deliverMilestone={deliverMilestone} approveMilestone={approveMilestone}
              />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
              style={{ background: '#f1f4f9', border: '1px solid rgba(0,0,0,0.06)', color: '#334155' }}>
              <MessageCircle className="w-3 h-3" /> Chat
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
              style={{ background: '#f1f4f9', border: '1px solid rgba(0,0,0,0.06)', color: '#334155' }}>
              <FileText className="w-3 h-3" /> Documentos
            </button>
          </div>
          <div className="flex gap-2">
            {isBuyer && tx.status === 'pending_payment' && (
              <button
                onClick={() => simulatePayment.mutate(tx.id)}
                disabled={simulatePayment.isPending}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #00b4d8, #00d4aa)' }}>
                {simulatePayment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                💳 Pagar al Escrow
              </button>
            )}
            {tx.status === 'completed' && isBuyer && !tx.buyer_reviewed && (
              <ReviewInline transactionId={tx.id} reviewedUserId={(tx as any).offer?.agent_id || tx.seller_user_id || ''} submitReview={submitReview} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MilestoneRow({ ms, i, tx, isBuyer, deliverNote, setDeliverNote, showDeliverModal, setShowDeliverModal, showConfirmModal, setShowConfirmModal, deliverMilestone, approveMilestone }: any) {
  const done = ms.status === 'approved';
  const delivered = ms.status === 'delivered';
  const current = ms.status === 'in_progress';

  return (
    <div className="flex items-center gap-4 p-3.5 rounded-xl"
      style={{ background: done ? 'rgba(16,185,129,0.03)' : current || delivered ? 'rgba(0,180,216,0.03)' : '#f8fafc', border: `1px solid ${done ? 'rgba(16,185,129,0.1)' : current || delivered ? 'rgba(0,180,216,0.1)' : 'rgba(0,0,0,0.04)'}` }}>
      <span style={{ fontSize: '11px', fontWeight: 700, color: done ? '#10b981' : current ? '#00b4d8' : '#94a3b8', width: '20px' }}>#{i + 1}</span>
      <div className="flex-1">
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0a2540' }}>{ms.name}</span>
        {ms.description && <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{ms.description}</span>}
      </div>
      <span style={{ fontSize: '13px', fontWeight: 600, color: done ? '#10b981' : '#0a2540' }}>
        {formatCurrency(ms.amount, tx.currency)}
      </span>
      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase"
        style={{ background: done ? 'rgba(16,185,129,0.08)' : delivered ? 'rgba(217,119,6,0.08)' : current ? 'rgba(0,180,216,0.08)' : 'rgba(0,0,0,0.04)', color: done ? '#10b981' : delivered ? '#d97706' : current ? '#00b4d8' : '#94a3b8' }}>
        {done ? 'Aprobado' : delivered ? 'Entregado' : current ? 'En curso' : 'Pendiente'}
      </span>

      {/* Actions */}
      {!isBuyer && current && (
        showDeliverModal === ms.id ? (
          <div className="flex items-center gap-2">
            <input value={deliverNote} onChange={(e: any) => setDeliverNote(e.target.value)} placeholder="Nota..."
              className="px-2 py-1.5 rounded-lg text-xs" style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)', width: '150px' }} />
            <button onClick={() => { deliverMilestone.mutate({ milestoneId: ms.id, note: deliverNote }); setShowDeliverModal(null); setDeliverNote(''); }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #00b4d8, #00d4aa)' }}>
              📦 Entregar
            </button>
          </div>
        ) : (
          <button onClick={() => setShowDeliverModal(ms.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #00b4d8, #00d4aa)' }}>
            📦 Entregar
          </button>
        )
      )}
      {isBuyer && delivered && (
        showConfirmModal === ms.id ? (
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '10px', color: '#64748b' }}>¿Liberar {formatCurrency(ms.amount, tx.currency)}?</span>
            <button onClick={() => { approveMilestone.mutate({ milestoneId: ms.id, transactionId: tx.id }); setShowConfirmModal(null); }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              ✅ Liberar
            </button>
            <button onClick={() => setShowConfirmModal(null)}
              className="px-2 py-1 rounded-lg text-xs" style={{ background: '#f1f4f9', color: '#94a3b8' }}>✕</button>
          </div>
        ) : (
          <button onClick={() => setShowConfirmModal(ms.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            ✅ Confirmar
          </button>
        )
      )}
      {done && ms.payment_released && (
        <span style={{ fontSize: '9px', color: '#10b981', fontWeight: 600 }}>💰 Liberado</span>
      )}
    </div>
  );
}

function ReviewInline({ transactionId, reviewedUserId, submitReview }: any) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-xl text-xs font-semibold text-white"
        style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
        ⭐ Dejar Valoración
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => setRating(n)}>
            <Star className="w-4 h-4" style={{ color: n <= rating ? '#f59e0b' : '#e2e8f0', fill: n <= rating ? '#f59e0b' : 'none' }} />
          </button>
        ))}
      </div>
      <input value={comment} onChange={(e: any) => setComment(e.target.value)} placeholder="Comentario..."
        className="px-2 py-1.5 rounded-lg text-xs" style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)', width: '180px' }} />
      <button
        onClick={() => { submitReview.mutate({ transactionId, reviewedUserId, ratingOverall: rating, comment }); setOpen(false); }}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
        Enviar
      </button>
    </div>
  );
}
