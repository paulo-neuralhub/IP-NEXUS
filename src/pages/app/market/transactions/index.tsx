import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftRight, Check, MessageCircle, FileText,
  Search, Shield, Clock, CreditCard, Package,
  Star, AlertTriangle, Globe, Send
} from 'lucide-react';
import { useTransactions } from '@/hooks/market/useTransaction';
import {
  TRANSACTION_STATUS_CONFIG,
  type MarketTransaction,
  type TransactionStatus,
} from '@/types/market.types';
import { Skeleton } from '@/components/ui/skeleton';

// ── Milestone definitions based on transaction status flow ──

interface MilestoneStep {
  id: string;
  label: string;
  icon: typeof Clock;
  statusMatch: TransactionStatus[];
}

const MILESTONE_STEPS: MilestoneStep[] = [
  { id: 'offer', label: 'Oferta', icon: Send, statusMatch: ['inquiry', 'negotiation', 'offer_made', 'offer_accepted'] },
  { id: 'diligence', label: 'Due Diligence', icon: Search, statusMatch: ['due_diligence'] },
  { id: 'contract', label: 'Contrato', icon: FileText, statusMatch: ['contract_draft', 'contract_review'] },
  { id: 'payment', label: 'Pago', icon: CreditCard, statusMatch: ['pending_payment', 'payment_in_escrow'] },
  { id: 'delivery', label: 'Entrega', icon: Package, statusMatch: ['pending_transfer'] },
  { id: 'complete', label: 'Completado', icon: Check, statusMatch: ['completed'] },
];

function getMilestoneState(step: MilestoneStep, txStatus: TransactionStatus) {
  const stepConfig = TRANSACTION_STATUS_CONFIG[txStatus];
  if (!stepConfig) return 'pending';
  
  const currentStepNum = stepConfig.step;
  
  // Find the max step number in this milestone
  const milestoneStepNums = step.statusMatch
    .map(s => TRANSACTION_STATUS_CONFIG[s]?.step || 0)
    .filter(n => n > 0);
  const minStepNum = Math.min(...milestoneStepNums);
  const maxStepNum = Math.max(...milestoneStepNums);
  
  if (txStatus === 'cancelled' || txStatus === 'disputed') {
    // For cancelled/disputed, mark steps up to where it was
    return 'pending';
  }
  
  if (currentStepNum > maxStepNum) return 'completed';
  if (currentStepNum >= minStepNum && currentStepNum <= maxStepNum) return 'current';
  return 'pending';
}

// ── Helpers ──

function formatCurrency(amount: number | null, currency = 'EUR'): string {
  if (amount == null) return '—';
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
}

function getCounterpartyName(tx: any, role: 'buyer' | 'seller'): string {
  if (role === 'buyer') {
    return tx.seller?.display_name || tx.listing?.seller?.display_name || 'Vendedor';
  }
  return tx.buyer?.display_name || 'Comprador';
}

function getCurrentAction(tx: MarketTransaction): string | null {
  switch (tx.status) {
    case 'pending_payment': return 'pay';
    case 'payment_in_escrow':
    case 'pending_transfer': return 'deliver';
    case 'completed': return tx.transfer_completed ? 'review' : 'confirm';
    default: return null;
  }
}

// ── Status filter tabs ──

const STATUS_FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'active', label: 'En curso', statuses: ['inquiry', 'negotiation', 'offer_made', 'offer_accepted', 'due_diligence', 'contract_draft', 'contract_review', 'pending_payment', 'payment_in_escrow', 'pending_transfer'] as TransactionStatus[] },
  { id: 'completed', label: 'Completadas', statuses: ['completed'] as TransactionStatus[] },
  { id: 'issues', label: 'Incidencias', statuses: ['cancelled', 'disputed'] as TransactionStatus[] },
];

// ── Main Component ──

export default function TransactionsPage() {
  const { data: transactions, isLoading } = useTransactions('all');
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
      {/* Status filter pills */}
      <div className="flex items-center gap-2">
        {STATUS_FILTERS.map(f => {
          const count = 'statuses' in f
            ? (transactions?.filter(tx => (f as any).statuses.includes(tx.status)).length || 0)
            : (transactions?.length || 0);
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

      {/* Transaction cards */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        filtered.map(tx => <TransactionCard key={tx.id} transaction={tx} />)
      )}
    </div>
  );
}

// ── Transaction Card ──

function TransactionCard({ transaction: tx }: { transaction: MarketTransaction }) {
  const statusConfig = TRANSACTION_STATUS_CONFIG[tx.status];
  const listing = (tx as any).listing;
  const title = listing?.title || `Transacción`;
  const currentAction = getCurrentAction(tx);
  
  // Determine role (simplified — in real app check against current user id)
  const role = 'buyer' as const;
  const counterpartyName = getCounterpartyName(tx, role);

  // Financial breakdown
  const total = tx.agreed_price || tx.offered_price || 0;
  const commissionRate = tx.commission_rate || 0.10;
  const commissionAmount = tx.commission_amount || total * commissionRate;
  const escrowAmount = tx.escrow_status === 'held' ? total : 0;
  const releasedAmount = tx.status === 'completed' ? total - commissionAmount : 0;

  return (
    <div
      className="rounded-2xl overflow-hidden mb-0"
      style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(0,180,216,0.08)' }}
          >
            <ArrowLeftRight className="w-5 h-5" style={{ color: '#00b4d8' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540' }}>
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                {role === 'buyer' ? 'Agente:' : 'Solicitante:'} {counterpartyName}
              </span>
              <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
                {tx.transaction_number || `TX-${tx.id.slice(0, 6)}`}
              </span>
              {tx.status === 'disputed' && (
                <span
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold"
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}
                >
                  <AlertTriangle className="w-2.5 h-2.5" /> DISPUTA
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#0a2540', display: 'block' }}>
            {formatCurrency(total, tx.currency)}
          </span>
          <span style={{ fontSize: '9px', color: '#94a3b8' }}>
            Comisión IP-NEXUS: {formatCurrency(commissionAmount, tx.currency)}
          </span>
        </div>
      </div>

      {/* ═══ MILESTONES STEPPER ═══ */}
      <div className="px-5 py-5" style={{ background: 'rgba(0,0,0,0.01)' }}>
        <div className="flex items-center justify-between">
          {MILESTONE_STEPS.map((ms, i, arr) => {
            const state = getMilestoneState(ms, tx.status);
            const done = state === 'completed';
            const current = state === 'current';
            const MsIcon = ms.icon;

            return (
              <React.Fragment key={ms.id}>
                <div
                  className="flex flex-col items-center gap-1.5"
                  style={{ width: `${100 / arr.length}%`, maxWidth: '120px' }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                    style={
                      done
                        ? { background: 'linear-gradient(135deg, #00b4d8, #00d4aa)', color: '#fff' }
                        : current
                        ? {
                            background: '#f1f4f9',
                            color: '#00b4d8',
                            boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff',
                            border: '2px solid rgba(0,180,216,0.3)',
                          }
                        : { background: '#f1f4f9', color: '#94a3b8' }
                    }
                  >
                    {done ? <Check className="w-4 h-4" /> : <MsIcon className="w-4 h-4" />}
                  </div>
                  <span
                    style={{
                      fontSize: '8px',
                      fontWeight: 600,
                      textAlign: 'center',
                      color: done ? '#00b4d8' : current ? '#0a2540' : '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                    }}
                  >
                    {ms.label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mx-1 rounded-full"
                    style={{
                      background: done
                        ? 'linear-gradient(135deg, #00b4d8, #00d4aa)'
                        : '#e8ecf3',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Financial breakdown */}
      <div
        className="px-5 py-3 grid grid-cols-5 gap-3"
        style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}
      >
        <FinanceCell label="Total" value={formatCurrency(total, tx.currency)} color="#0a2540" />
        <FinanceCell
          label="Honorarios"
          value={formatCurrency(total - commissionAmount, tx.currency)}
          color="#0a2540"
        />
        <FinanceCell
          label="En escrow"
          value={escrowAmount > 0 ? `🔒 ${formatCurrency(escrowAmount, tx.currency)}` : '—'}
          color="#f59e0b"
        />
        <FinanceCell
          label="Liberado"
          value={releasedAmount > 0 ? formatCurrency(releasedAmount, tx.currency) : '—'}
          color="#10b981"
        />
        <FinanceCell
          label="Fee IP-NEXUS"
          value={formatCurrency(commissionAmount, tx.currency)}
          color="#6366f1"
        />
      </div>

      {/* Actions + Chat */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}
      >
        <div className="flex gap-2">
          <ActionButton icon={MessageCircle} label="Chat" />
          <Link
            to={`/app/market/transactions/${tx.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold no-underline"
            style={{ background: '#f1f4f9', border: '1px solid rgba(0,0,0,0.06)', color: '#334155' }}
          >
            <FileText className="w-3 h-3" /> Detalle
          </Link>
        </div>

        {/* Primary action based on current milestone */}
        <div className="flex gap-2">
          {currentAction === 'pay' && (
            <GradientButton label="💳 Pagar al Escrow" gradient="linear-gradient(135deg, #00b4d8, #00d4aa)" />
          )}
          {currentAction === 'deliver' && (
            <GradientButton label="📦 Entregar Milestone" gradient="linear-gradient(135deg, #00b4d8, #00d4aa)" />
          )}
          {currentAction === 'confirm' && (
            <GradientButton label="✅ Confirmar Entrega" gradient="linear-gradient(135deg, #10b981, #059669)" />
          )}
          {currentAction === 'review' && (
            <GradientButton label="⭐ Dejar Valoración" gradient="linear-gradient(135deg, #f59e0b, #f97316)" />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──

function FinanceCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <span style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontSize: '14px', fontWeight: 600, color, display: 'block' }}>{value}</span>
    </div>
  );
}

function ActionButton({ icon: Icon, label, badge }: { icon: typeof Clock; label: string; badge?: number }) {
  return (
    <button
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
      style={{ background: '#f1f4f9', border: '1px solid rgba(0,0,0,0.06)', color: '#334155' }}
    >
      <Icon className="w-3 h-3" /> {label}
      {badge != null && badge > 0 && (
        <span
          className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
          style={{ background: '#ef4444' }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function GradientButton({ label, gradient }: { label: string; gradient: string }) {
  return (
    <button
      className="px-4 py-2 rounded-xl text-xs font-semibold text-white"
      style={{ background: gradient }}
    >
      {label}
    </button>
  );
}

// ── Empty State ──

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: '#f1f4f9', boxShadow: '6px 6px 14px #cdd1dc, -6px -6px 14px #ffffff' }}
      >
        <ArrowLeftRight className="w-7 h-7" style={{ color: '#94a3b8' }} />
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0a2540', marginBottom: '6px' }}>
        Sin transacciones
      </h3>
      <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '360px', margin: '0 auto' }}>
        Tus transacciones activas con escrow y milestones aparecerán aquí cuando aceptes una oferta o adjudiques un servicio.
      </p>
    </div>
  );
}

// ── Loading Skeleton ──

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden"
          style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}
        >
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="w-24 h-8" />
            </div>
            <div className="flex items-center gap-4 justify-center py-3">
              {[1, 2, 3, 4, 5, 6].map(j => (
                <React.Fragment key={j}>
                  <Skeleton className="w-9 h-9 rounded-xl" />
                  {j < 6 && <Skeleton className="h-0.5 flex-1" />}
                </React.Fragment>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map(j => (
                <Skeleton key={j} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
