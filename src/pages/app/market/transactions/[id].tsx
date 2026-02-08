/**
 * TransactionDetailPage — Full 2-column dashboard for service transactions
 * Left: Status, phases stepper, payment audit trail, financial breakdown
 * Right: Production chat with system messages
 */
import * as React from 'react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Check, Shield, ShieldCheck, Clock, Lock, CreditCard,
  CheckCircle, AlertTriangle, FileText, Star, Loader2,
  ArrowLeftRight, Upload, Paperclip, ArrowRight, ArrowUpRight, Package,
} from 'lucide-react';
import {
  useServiceTransaction,
  useSimulateEscrowPayment,
  useDeliverMilestone,
  useApproveMilestone,
  useSubmitServiceReview,
  type ServiceMilestone,
} from '@/hooks/market/useServiceTransactions';
import { usePaymentEvents } from '@/hooks/market/useProductionChat';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductionChat } from '@/components/market/chat/ProductionChat';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
    in_progress: '#7c3aed',
    completed: '#10b981',
    cancelled: '#94a3b8',
    disputed: '#ef4444',
  };
  return colors[status] || '#94a3b8';
}

function getProgressPercentage(status: string, milestones: any[]): number {
  if (status === 'completed') return 100;
  if (status === 'pending_payment') return 10;
  if (!milestones.length) return 20;
  const approved = milestones.filter(m => m.status === 'approved').length;
  return Math.max(15, Math.round((approved / milestones.length) * 100));
}

function getPaymentEventIcon(type: string) {
  switch (type) {
    case 'escrow_deposit': return <Lock className="w-4 h-4" style={{ color: '#7c3aed' }} />;
    case 'official_fees_advance': return <ArrowUpRight className="w-4 h-4" style={{ color: '#8b5cf6' }} />;
    case 'phase_release': return <ArrowRight className="w-4 h-4" style={{ color: '#10b981' }} />;
    case 'platform_fee': return <CreditCard className="w-4 h-4" style={{ color: '#f59e0b' }} />;
    case 'final_release': return <CheckCircle className="w-4 h-4" style={{ color: '#10b981' }} />;
    default: return <CreditCard className="w-4 h-4" style={{ color: '#94a3b8' }} />;
  }
}

function getPaymentEventColor(type: string): string {
  switch (type) {
    case 'escrow_deposit': return '#7c3aed';
    case 'official_fees_advance': return '#8b5cf6';
    case 'phase_release': case 'final_release': return '#10b981';
    case 'platform_fee': return '#f59e0b';
    default: return '#94a3b8';
  }
}

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: tx, isLoading } = useServiceTransaction(id);
  const { data: paymentEvents = [] } = usePaymentEvents(id);
  const simulatePayment = useSimulateEscrowPayment();
  const deliverMilestone = useDeliverMilestone();
  const approveMilestone = useApproveMilestone();
  const submitReview = useSubmitServiceReview();

  const [deliverNote, setDeliverNote] = useState('');
  const [showDeliverModal, setShowDeliverModal] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-5 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-[600px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="text-center py-16">
        <ArrowLeftRight className="w-12 h-12 mx-auto mb-4" style={{ color: '#94a3b8' }} />
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0a2540', marginBottom: '8px' }}>Transacción no encontrada</h2>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>La transacción no existe o no tienes acceso.</p>
        <button onClick={() => navigate('/app/market/transactions')}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
          Volver a En Curso
        </button>
      </div>
    );
  }

  const isBuyer = user?.id === tx.buyer_user_id;
  const isSeller = !isBuyer;
  const statusColor = getStatusColor(tx.status);
  const milestones = tx.milestones || [];
  const currentMilestone = milestones.find(m => m.status === 'in_progress' || m.status === 'delivered');
  const escrowHeld = tx.escrow_held || 0;
  const escrowReleased = tx.escrow_released || 0;
  const escrowRetained = escrowHeld - escrowReleased;

  return (
    <div className="space-y-5 max-w-7xl mx-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Back */}
      <button onClick={() => navigate('/app/market/transactions')}
        className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#64748b' }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Volver a En Curso
      </button>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* ═══ LEFT PANEL ═══ */}
        <div className="lg:col-span-3 space-y-4">

          {/* Header + Status */}
          <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
            {/* Progress bar */}
            <div className="h-1.5 rounded-full mb-5 overflow-hidden" style={{ background: '#f1f4f9' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage(tx.status, milestones)}%`, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }} />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.08)' }}>
                  <ArrowLeftRight className="w-6 h-6" style={{ color: '#7c3aed' }} />
                </div>
                <div>
                  <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#0a2540' }}>{tx.transaction_number}</h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase"
                      style={{ background: statusColor + '15', color: statusColor }}>
                      {getStatusLabel(tx.status)}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{isBuyer ? 'Eres el solicitante' : 'Eres el agente'}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span style={{ fontSize: '24px', fontWeight: 700, color: '#0a2540' }}>
                  {formatCurrency(tx.total_amount, tx.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* ═══ FUND STATUS — Trust indicator ═══ */}
          <div className="rounded-2xl p-5" style={{
            background: tx.status === 'in_progress' ? 'rgba(16,185,129,0.04)'
              : tx.status === 'pending_payment' ? 'rgba(245,158,11,0.04)' : '#fff',
            border: `1px solid ${tx.status === 'in_progress' ? 'rgba(16,185,129,0.12)'
              : tx.status === 'pending_payment' ? 'rgba(245,158,11,0.12)' : 'rgba(0,0,0,0.06)'}`,
          }}>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4" style={{ color: '#7c3aed' }} />
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0a2540' }}>Estado de los fondos</h3>
            </div>

            {tx.status === 'pending_payment' && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
                    <Clock className="w-5 h-5" style={{ color: '#f59e0b' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#f59e0b' }}>Pendiente de depósito en escrow</span>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>
                      {isBuyer ? 'Deposita el importe para que el agente pueda comenzar.' : 'El solicitante debe depositar antes de que puedas comenzar.'}
                    </span>
                  </div>
                </div>
                {isBuyer && (
                  <button onClick={() => simulatePayment.mutate(tx.id)}
                    disabled={simulatePayment.isPending}
                    className="relative w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.01]"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 4px 16px rgba(124,58,237,0.2)' }}>
                    {simulatePayment.isPending ? <Loader2 className="w-4 h-4 inline mr-2 animate-spin" /> : <Lock className="w-4 h-4 inline mr-2" />}
                    Depositar {formatCurrency(tx.total_amount, tx.currency)} en Escrow
                  </button>
                )}
                <div className="flex items-start gap-2 mt-3 p-3 rounded-lg" style={{ background: 'rgba(124,58,237,0.04)' }}>
                  <Shield className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#7c3aed' }} />
                  <p style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.5 }}>
                    <strong style={{ color: '#334155' }}>Pago seguro con escrow:</strong> Tu dinero queda retenido de forma segura hasta que confirmes la entrega de cada fase.
                  </p>
                </div>
              </div>
            )}

            {tx.status === 'in_progress' && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
                    <ShieldCheck className="w-5 h-5" style={{ color: '#10b981' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#10b981' }}>Fondos protegidos en escrow</span>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>
                      {isBuyer ? 'Tu dinero está seguro. Se libera por fases.' : 'Los fondos están depositados. Puedes trabajar con confianza.'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl text-center" style={{ background: '#f8f9fb' }}>
                    <span style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Total escrow</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#0a2540' }}>{formatCurrency(escrowHeld, tx.currency)}</span>
                  </div>
                  <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(16,185,129,0.04)' }}>
                    <span style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Liberado</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>{formatCurrency(escrowReleased, tx.currency)}</span>
                  </div>
                  <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(245,158,11,0.04)' }}>
                    <span style={{ fontSize: '9px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Retenido</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#f59e0b' }}>{formatCurrency(escrowRetained, tx.currency)}</span>
                  </div>
                </div>
              </div>
            )}

            {tx.status === 'completed' && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
                  <CheckCircle className="w-5 h-5" style={{ color: '#10b981' }} />
                </div>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#10b981' }}>Trabajo completado — Fondos liberados</span>
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>
                    Total pagado: {formatCurrency(tx.total_amount, tx.currency)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ═══ PHASES ═══ */}
          {milestones.length > 0 && (
            <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0a2540', marginBottom: '16px' }}>Fases del servicio</h3>

              <div className="space-y-0">
                {milestones.map((ms, idx) => {
                  const isActive = ms.status === 'in_progress';
                  const isCompleted = ms.status === 'approved';
                  const isDelivered = ms.status === 'delivered';
                  const isPending = ms.status === 'pending';
                  const phaseAmount = ms.amount || 0;

                  return (
                    <div key={ms.id}>
                      {idx > 0 && (
                        <div className="ml-5 h-6 w-0.5" style={{ background: isCompleted || isActive ? '#7c3aed' : '#e2e8f0' }} />
                      )}

                      <div className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${isActive ? 'ring-1' : ''}`}
                        style={{
                          background: isActive ? 'rgba(124,58,237,0.03)' : 'transparent',
                          boxShadow: isActive ? 'inset 0 0 0 1px rgba(124,58,237,0.15)' : 'none',
                        }}>
                        {/* Phase indicator */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCompleted || isDelivered || isActive ? 'text-white' : ''}`}
                          style={{
                            background: isCompleted ? '#10b981'
                              : isDelivered ? '#f59e0b'
                              : isActive ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                              : '#f1f4f9',
                          }}>
                          {isCompleted ? <Check className="w-5 h-5" />
                            : isDelivered ? <Package className="w-5 h-5" />
                            : <span style={{ fontSize: '14px', fontWeight: 700, color: isActive ? '#fff' : '#94a3b8' }}>{idx + 1}</span>}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span style={{ fontSize: '14px', fontWeight: 600, color: isCompleted ? '#10b981' : isPending ? '#94a3b8' : '#0a2540' }}>
                              {ms.name}
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: isCompleted ? '#10b981' : '#0a2540' }}>
                              {formatCurrency(phaseAmount, tx.currency)}
                              {ms.percentage && <span style={{ fontSize: '10px', fontWeight: 400, color: '#94a3b8' }}> ({ms.percentage}%)</span>}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isCompleted && (
                              <span className="text-[11px] font-semibold" style={{ color: '#10b981' }}>
                                ✅ Completada y pagada {ms.approved_at && `· ${format(new Date(ms.approved_at), 'dd MMM', { locale: es })}`}
                              </span>
                            )}
                            {isDelivered && (
                              <span className="text-[11px] font-semibold" style={{ color: '#f59e0b' }}>
                                📋 Entregada — Esperando confirmación
                              </span>
                            )}
                            {isActive && !isDelivered && (
                              <span className="text-[11px] font-semibold" style={{ color: '#7c3aed' }}>🔵 En ejecución</span>
                            )}
                            {isPending && <span className="text-[11px]" style={{ color: '#94a3b8' }}>Pendiente</span>}
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-2 mt-3">
                            {isSeller && isActive && !isDelivered && (
                              showDeliverModal === ms.id ? (
                                <div className="flex items-center gap-2">
                                  <input value={deliverNote} onChange={(e) => setDeliverNote(e.target.value)} placeholder="Nota de entrega..."
                                    className="px-2 py-1.5 rounded-lg text-xs" style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)', width: '180px' }} />
                                  <button onClick={() => { deliverMilestone.mutate({ milestoneId: ms.id, note: deliverNote }); setShowDeliverModal(null); setDeliverNote(''); }}
                                    disabled={deliverMilestone.isPending}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                                    style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                                    <Upload className="w-3.5 h-3.5" /> Confirmar Entrega
                                  </button>
                                  <button onClick={() => setShowDeliverModal(null)} className="px-2 py-1 rounded-lg text-xs" style={{ color: '#94a3b8' }}>✕</button>
                                </div>
                              ) : (
                                <button onClick={() => setShowDeliverModal(ms.id)}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                                  style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                                  <Upload className="w-3.5 h-3.5" /> Marcar Fase como Entregada
                                </button>
                              )
                            )}

                            {isBuyer && isDelivered && (
                              showConfirmModal === ms.id ? (
                                <div className="flex items-center gap-2">
                                  <span style={{ fontSize: '11px', color: '#64748b' }}>¿Liberar {formatCurrency(phaseAmount, tx.currency)}?</span>
                                  <button onClick={() => { approveMilestone.mutate({ milestoneId: ms.id, transactionId: tx.id }); setShowConfirmModal(null); }}
                                    disabled={approveMilestone.isPending}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 3px 10px rgba(16,185,129,0.2)' }}>
                                    <CheckCircle className="w-3.5 h-3.5" /> Confirmar y Liberar
                                  </button>
                                  <button onClick={() => setShowConfirmModal(null)} className="px-2 py-1 rounded-lg text-xs" style={{ color: '#94a3b8' }}>✕</button>
                                </div>
                              ) : (
                                <button onClick={() => setShowConfirmModal(ms.id)}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 3px 10px rgba(16,185,129,0.2)' }}>
                                  <CheckCircle className="w-3.5 h-3.5" /> Confirmar y Liberar {formatCurrency(phaseAmount, tx.currency)}
                                </button>
                              )
                            )}

                            {isBuyer && isDelivered && (
                              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.1)', color: '#ef4444' }}>
                                <AlertTriangle className="w-3.5 h-3.5" /> Reportar problema
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ PAYMENT AUDIT TRAIL ═══ */}
          <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0a2540', marginBottom: '16px' }}>Registro de pagos</h3>

            {paymentEvents.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>
                No hay movimientos de pago registrados aún.
              </p>
            ) : (
              <div className="space-y-0">
                {paymentEvents.map((event: any, idx: number) => (
                  <div key={event.id} className="flex items-start gap-3 py-3"
                    style={{ borderTop: idx > 0 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${getPaymentEventColor(event.type)}10` }}>
                      {getPaymentEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0a2540' }}>{event.description || event.type}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>
                        {format(new Date(event.created_at), 'dd MMM yyyy · HH:mm', { locale: es })}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span style={{ fontSize: '14px', fontWeight: 700, color: getPaymentEventColor(event.type) }}>
                        {event.direction === 'in' ? '+' : event.direction === 'fee' ? '−' : '→'} {formatCurrency(event.amount, event.currency)}
                      </span>
                      {event.recipient && <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>{event.recipient}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ═══ FINANCIAL BREAKDOWN ═══ */}
          <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0a2540', marginBottom: '12px' }}>Desglose financiero</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span style={{ fontSize: '13px', color: '#64748b' }}>Honorarios profesionales</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0a2540' }}>{formatCurrency(tx.professional_fees, tx.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ fontSize: '13px', color: '#64748b' }}>Tasas oficiales</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0a2540' }}>{formatCurrency(tx.official_fees, tx.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Comisión plataforma</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>
                  {formatCurrency((tx.platform_fee_buyer || 0) + (tx.platform_fee_seller || 0), tx.currency)}
                </span>
              </div>
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', margin: '8px 0' }} />
              <div className="flex justify-between items-center">
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540' }}>
                  {isBuyer ? 'Total pagado' : 'Total a recibir'}
                </span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: isBuyer ? '#0a2540' : '#10b981' }}>
                  {formatCurrency(isBuyer ? tx.total_amount : (tx.professional_fees || 0) - (tx.platform_fee_seller || 0), tx.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Review section for completed */}
          {tx.status === 'completed' && isBuyer && !tx.buyer_reviewed && (
            <ReviewInline transactionId={tx.id} reviewedUserId={(tx as any).offer?.agent_id || tx.seller_user_id || ''} submitReview={submitReview} />
          )}
          {tx.status === 'completed' && isSeller && !tx.seller_reviewed && (
            <ReviewInline transactionId={tx.id} reviewedUserId={tx.buyer_user_id || ''} submitReview={submitReview} />
          )}
        </div>

        {/* ═══ RIGHT PANEL — Chat ═══ */}
        <div className="lg:col-span-2">
          {user?.id && (
            <div className="sticky top-4">
              <ProductionChat
                transactionId={tx.id}
                currentUserId={user.id}
                isReadOnly={tx.status === 'completed' || tx.status === 'cancelled'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Review inline component ──
function ReviewInline({ transactionId, reviewedUserId, submitReview }: any) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!open) {
    return (
      <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
        <button onClick={() => setOpen(true)}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
          ⭐ Dejar Valoración
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
      <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0a2540', marginBottom: '12px' }}>Tu valoración</h3>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => setRating(n)}>
            <Star className="w-6 h-6" style={{ color: n <= rating ? '#f59e0b' : '#e2e8f0', fill: n <= rating ? '#f59e0b' : 'none' }} />
          </button>
        ))}
      </div>
      <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Comentario (opcional)..."
        className="w-full px-3 py-2.5 rounded-xl text-sm mb-3 resize-none" rows={3}
        style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)', color: '#334155' }} />
      <div className="flex gap-2">
        <button onClick={() => { submitReview.mutate({ transactionId, reviewedUserId, ratingOverall: rating, comment }); setOpen(false); }}
          disabled={submitReview.isPending}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
          {submitReview.isPending ? 'Enviando...' : 'Enviar valoración'}
        </button>
        <button onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-xl text-sm" style={{ background: '#f1f4f9', color: '#94a3b8' }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
