import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftRight, Check, MessageCircle, FileText,
  Shield, Clock, CreditCard, Package,
  Star, AlertTriangle, Send, Loader2
} from 'lucide-react';
import {
  useServiceTransactions,
  useSimulateEscrowPayment,
  useDeliverMilestone,
  useApproveMilestone,
  useSubmitServiceReview,
  type ServiceTransaction,
  type ServiceMilestone,
} from '@/hooks/market/useServiceTransactions';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

// ── Helpers ──

function formatCurrency(amount: number | null, currency = 'EUR'): string {
  if (amount == null) return '—';
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending_payment: 'Pendiente de pago',
    in_progress: 'En progreso',
    completed: 'Completada',
    cancelled: 'Cancelada',
    disputed: 'En disputa',
  };
  return labels[status] || status;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending_payment: '#f59e0b',
    in_progress: '#00b4d8',
    completed: '#10b981',
    cancelled: '#94a3b8',
    disputed: '#ef4444',
  };
  return colors[status] || '#94a3b8';
}

// ── Status filter tabs ──

const STATUS_FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'active', label: 'En curso', statuses: ['pending_payment', 'in_progress'] },
  { id: 'completed', label: 'Completadas', statuses: ['completed'] },
  { id: 'issues', label: 'Incidencias', statuses: ['cancelled', 'disputed'] },
];

// ── Main Component ──

export default function TransactionsPage() {
  const { data: transactions, isLoading } = useServiceTransactions('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = React.useMemo(() => {
    if (!transactions) return [];
    const filter = STATUS_FILTERS.find(f => f.id === statusFilter);
    if (!filter || !('statuses' in filter)) return transactions;
    return transactions.filter(tx => (filter as any).statuses.includes(tx.status));
  }, [transactions, statusFilter]);

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        {STATUS_FILTERS.map(f => {
          const count = 'statuses' in f
            ? (transactions?.filter(tx => (f as any).statuses.includes(tx.status)).length || 0)
            : (transactions?.length || 0);
          return (
            <button key={f.id} onClick={() => setStatusFilter(f.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={statusFilter === f.id ? { background: '#f1f4f9', boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff', color: '#0a2540' } : { color: '#94a3b8' }}>
              {f.label}
              {count > 0 && (
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold"
                  style={statusFilter === f.id ? { background: '#0a2540', color: '#fff' } : { background: 'rgba(0,0,0,0.06)', color: '#94a3b8' }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? <EmptyState /> : filtered.map(tx => <TransactionCard key={tx.id} transaction={tx} />)}
    </div>
  );
}

// ── Transaction Card ──

function TransactionCard({ transaction: tx }: { transaction: ServiceTransaction }) {
  const { user } = useAuth();
  const simulatePayment = useSimulateEscrowPayment();
  const deliverMilestone = useDeliverMilestone();
  const approveMilestone = useApproveMilestone();
  const submitReview = useSubmitServiceReview();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [deliverNote, setDeliverNote] = useState('');
  const [showDeliverModal, setShowDeliverModal] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);

  const isBuyer = user?.id === tx.buyer_user_id;
  const statusColor = getStatusColor(tx.status);
  const milestones = tx.milestones || [];
  const completedMilestones = milestones.filter(m => m.status === 'approved').length;
  const currentMilestone = milestones.find(m => m.status === 'in_progress' || m.status === 'delivered');

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,180,216,0.08)' }}>
            <ArrowLeftRight className="w-5 h-5" style={{ color: '#00b4d8' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540' }}>{tx.transaction_number}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase" style={{ background: statusColor + '15', color: statusColor }}>
                {getStatusLabel(tx.status)}
              </span>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                {isBuyer ? 'Comprador' : 'Agente'}
              </span>
              {tx.status === 'in_progress' && !tx.stripe_payment_intent_id && (
                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold" style={{ background: '#fef3c7', color: '#d97706' }}>
                  DEMO
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#0a2540', display: 'block' }}>
            {formatCurrency(tx.total_amount, tx.currency)}
          </span>
          <span style={{ fontSize: '9px', color: '#94a3b8' }}>
            Fee: {formatCurrency((tx.platform_fee_buyer || 0) + (tx.platform_fee_seller || 0), tx.currency)}
          </span>
        </div>
      </div>

      {/* ═══ MILESTONES STEPPER ═══ */}
      {milestones.length > 0 && (
        <div className="px-5 py-5" style={{ background: 'rgba(0,0,0,0.01)' }}>
          <div className="flex items-center justify-between">
            {milestones.map((ms, i) => {
              const done = ms.status === 'approved';
              const current = ms.status === 'in_progress' || ms.status === 'delivered';
              const delivered = ms.status === 'delivered';

              return (
                <React.Fragment key={ms.id}>
                  <div className="flex flex-col items-center gap-1.5" style={{ maxWidth: '120px', flex: 1 }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                      style={
                        done ? { background: 'linear-gradient(135deg, #00b4d8, #00d4aa)', color: '#fff' }
                          : delivered ? { background: '#fef3c7', color: '#d97706', border: '2px solid #fbbf24' }
                          : current ? { background: '#f1f4f9', color: '#00b4d8', boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff', border: '2px solid rgba(0,180,216,0.3)' }
                          : { background: '#f1f4f9', color: '#94a3b8' }
                      }>
                      {done ? <Check className="w-4 h-4" /> : delivered ? <Package className="w-4 h-4" /> : <span style={{ fontSize: '11px', fontWeight: 700 }}>{i + 1}</span>}
                    </div>
                    <span style={{ fontSize: '8px', fontWeight: 600, textAlign: 'center', color: done ? '#00b4d8' : current ? '#0a2540' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.3px', lineHeight: 1.2 }}>
                      {ms.name}
                    </span>
                    {ms.amount != null && (
                      <span style={{ fontSize: '9px', color: done ? '#10b981' : '#94a3b8' }}>
                        {formatCurrency(ms.amount, tx.currency)}
                      </span>
                    )}
                  </div>
                  {i < milestones.length - 1 && (
                    <div className="flex-1 h-0.5 mx-1 rounded-full" style={{ background: done ? 'linear-gradient(135deg, #00b4d8, #00d4aa)' : '#e8ecf3', maxWidth: '60px' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Financial breakdown */}
      <div className="px-5 py-3 grid grid-cols-5 gap-3" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
        <FinanceCell label="Total" value={formatCurrency(tx.total_amount, tx.currency)} color="#0a2540" />
        <FinanceCell label="Honorarios" value={formatCurrency(tx.professional_fees, tx.currency)} color="#0a2540" />
        <FinanceCell label="Tasas" value={formatCurrency(tx.official_fees, tx.currency)} color="#64748b" />
        <FinanceCell label="En escrow" value={tx.escrow_held ? `🔒 ${formatCurrency(tx.escrow_held, tx.currency)}` : '—'} color="#f59e0b" />
        <FinanceCell label="Liberado" value={tx.escrow_released ? formatCurrency(tx.escrow_released, tx.currency) : '—'} color="#10b981" />
      </div>

      {/* Actions */}
      <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
        <div className="flex gap-2">
          <ActionButton icon={MessageCircle} label="Chat" />
          <ActionButton icon={FileText} label="Detalle" />
        </div>

        <div className="flex gap-2">
          {/* Pay escrow (buyer, pending_payment) */}
          {isBuyer && tx.status === 'pending_payment' && (
            <button
              onClick={() => simulatePayment.mutate(tx.id)}
              disabled={simulatePayment.isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #00b4d8, #00d4aa)' }}>
              {simulatePayment.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
              💳 Pagar al Escrow
            </button>
          )}

          {/* Deliver milestone (seller, in_progress) */}
          {!isBuyer && currentMilestone?.status === 'in_progress' && (
            <>
              {showDeliverModal === currentMilestone.id ? (
                <div className="flex items-center gap-2">
                  <input value={deliverNote} onChange={e => setDeliverNote(e.target.value)}
                    placeholder="Nota de entrega..." className="px-2 py-1.5 rounded-lg text-xs" style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)', width: '200px' }} />
                  <button
                    onClick={() => { deliverMilestone.mutate({ milestoneId: currentMilestone.id, note: deliverNote }); setShowDeliverModal(null); setDeliverNote(''); }}
                    disabled={deliverMilestone.isPending}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #00b4d8, #00d4aa)' }}>
                    Confirmar
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowDeliverModal(currentMilestone.id)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #00b4d8, #00d4aa)' }}>
                  📦 Entregar Milestone
                </button>
              )}
            </>
          )}

          {/* Confirm delivery (buyer, delivered) */}
          {isBuyer && currentMilestone?.status === 'delivered' && (
            showConfirmModal === currentMilestone.id ? (
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '11px', color: '#64748b' }}>¿Liberar {formatCurrency(currentMilestone.amount, tx.currency)}?</span>
                <button
                  onClick={() => { approveMilestone.mutate({ milestoneId: currentMilestone.id, transactionId: tx.id }); setShowConfirmModal(null); }}
                  disabled={approveMilestone.isPending}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  {approveMilestone.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : '✅ Sí, liberar'}
                </button>
                <button onClick={() => setShowConfirmModal(null)}
                  className="px-2 py-1.5 rounded-lg text-xs" style={{ background: '#f1f4f9', color: '#94a3b8' }}>Cancelar</button>
              </div>
            ) : (
              <button onClick={() => setShowConfirmModal(currentMilestone.id)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                ✅ Confirmar Entrega
              </button>
            )
          )}

          {/* Review (completed, not yet reviewed) */}
          {tx.status === 'completed' && isBuyer && !tx.buyer_reviewed && (
            <ReviewButton transactionId={tx.id} reviewedUserId={(tx as any).offer?.agent_id || tx.seller_user_id || ''} />
          )}
          {tx.status === 'completed' && !isBuyer && !tx.seller_reviewed && (
            <ReviewButton transactionId={tx.id} reviewedUserId={tx.buyer_user_id || ''} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Review Button ──

function ReviewButton({ transactionId, reviewedUserId }: { transactionId: string; reviewedUserId: string }) {
  const submitReview = useSubmitServiceReview();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
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
      <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Comentario..."
        className="px-2 py-1.5 rounded-lg text-xs" style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)', width: '180px' }} />
      <button
        onClick={() => { submitReview.mutate({ transactionId, reviewedUserId, ratingOverall: rating, comment }); setOpen(false); }}
        disabled={submitReview.isPending}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
        Enviar
      </button>
    </div>
  );
}

// ── Sub-components ──

function FinanceCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <span style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 600, color, display: 'block' }}>{value}</span>
    </div>
  );
}

function ActionButton({ icon: Icon, label }: { icon: typeof Clock; label: string }) {
  return (
    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
      style={{ background: '#f1f4f9', border: '1px solid rgba(0,0,0,0.06)', color: '#334155' }}>
      <Icon className="w-3 h-3" /> {label}
    </button>
  );
}

// ── Empty State ──

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: '#f1f4f9', boxShadow: '6px 6px 14px #cdd1dc, -6px -6px 14px #ffffff' }}>
        <ArrowLeftRight className="w-7 h-7" style={{ color: '#94a3b8' }} />
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0a2540', marginBottom: '6px' }}>Sin transacciones</h3>
      <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '360px', margin: '0 auto' }}>
        Tus transacciones con escrow y milestones aparecerán aquí cuando aceptes una oferta.
      </p>
    </div>
  );
}

// ── Loading Skeleton ──

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-2 flex-1"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/3" /></div>
              <Skeleton className="w-24 h-8" />
            </div>
            <div className="flex items-center gap-4 justify-center py-3">
              {[1, 2, 3, 4].map(j => (
                <React.Fragment key={j}>
                  <Skeleton className="w-9 h-9 rounded-xl" />
                  {j < 4 && <Skeleton className="h-0.5 flex-1" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
