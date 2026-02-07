/**
 * EscrowCheckoutModal — SILK Design
 * Payment modal with escrow protection and fee breakdown
 */
import * as React from 'react';
import { useState } from 'react';
import {
  X, Shield, Lock, CreditCard, Check, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface EscrowCheckoutModalProps {
  open: boolean;
  onClose: () => void;
  transactionId: string;
  serviceTitle: string;
  agentName: string;
  professionalFees: number;
  officialFees: number;
  currency?: string;
  onPaymentComplete?: () => void;
}

const COMMISSION_RATE = 0.05;

export default function EscrowCheckoutModal({
  open, onClose, transactionId, serviceTitle, agentName,
  professionalFees, officialFees, currency = 'EUR', onPaymentComplete,
}: EscrowCheckoutModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreed, setAgreed] = useState(false);

  if (!open) return null;

  const commission = professionalFees * COMMISSION_RATE;
  const total = professionalFees + officialFees + commission;

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency, minimumFractionDigits: 0 }).format(n);

  const handlePay = async () => {
    if (!agreed) {
      toast.error('Acepta los términos para continuar');
      return;
    }
    setIsProcessing(true);
    try {
      // In production: call Stripe checkout edge function
      // For now, simulate
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Pago procesado y fondos retenidos en escrow');
      onPaymentComplete?.();
      onClose();
    } catch {
      toast.error('Error al procesar el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(0,180,216,0.08)' }}>
              <CreditCard className="w-5 h-5" style={{ color: '#00b4d8' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0a2540' }}>Pago Escrow</h2>
              <p style={{ fontSize: '11px', color: '#64748b' }}>Pago seguro con retención de fondos</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#f1f4f9' }}>
            <X className="w-4 h-4" style={{ color: '#64748b' }} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Service summary */}
          <div className="p-4 rounded-xl" style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.04)' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0a2540', marginBottom: '4px' }}>{serviceTitle}</h4>
            <p style={{ fontSize: '11px', color: '#64748b' }}>Agente: {agentName}</p>
          </div>

          {/* Fee breakdown */}
          <div className="space-y-2">
            <Row label="Honorarios profesionales" value={fmt(professionalFees)} />
            <Row label="Tasas oficiales" value={fmt(officialFees)} />
            <Row label="Comisión plataforma (5%)" value={fmt(commission)} color="#6366f1" />
            <div className="h-px" style={{ background: 'rgba(0,0,0,0.06)' }} />
            <div className="flex items-center justify-between">
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#0a2540' }}>Total a pagar</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#0a2540' }}>{fmt(total)}</span>
            </div>
          </div>

          {/* Card input placeholder (Stripe Elements would go here) */}
          <div
            className="p-4 rounded-xl flex items-center justify-center gap-2"
            style={{ background: '#f1f4f9', border: '2px dashed rgba(0,0,0,0.1)', minHeight: '64px' }}
          >
            <CreditCard className="w-5 h-5" style={{ color: '#94a3b8' }} />
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              Stripe Elements se integrarán aquí
            </span>
          </div>

          {/* Disclaimer */}
          <div
            className="p-3 rounded-xl flex items-start gap-2"
            style={{ background: 'rgba(0,180,216,0.04)', border: '1px solid rgba(0,180,216,0.1)' }}
          >
            <Lock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#00b4d8' }} />
            <p style={{ fontSize: '10px', color: '#334155', lineHeight: 1.5 }}>
              <strong>Escrow protegido:</strong> Los fondos se retienen de forma segura hasta que confirmes la entrega satisfactoria del servicio. Si no estás satisfecho, puedes abrir una disputa.
            </p>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-3 justify-center">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.04)' }}>
              <Shield className="w-3.5 h-3.5" style={{ color: '#6366f1' }} />
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#6366f1' }}>Protegido por Stripe</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.04)' }}>
              <Check className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#10b981' }}>IP-NEXUS Guarantee</span>
            </div>
          </div>

          {/* Agreement checkbox */}
          <label className="flex items-start gap-2 cursor-pointer">
            <div
              className="w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5"
              style={{
                background: agreed ? '#00b4d8' : '#fff',
                border: `1px solid ${agreed ? '#00b4d8' : 'rgba(0,0,0,0.15)'}`,
              }}
              onClick={() => setAgreed(!agreed)}
            >
              {agreed && <Check className="w-3 h-3 text-white" />}
            </div>
            <span style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.5 }}>
              Acepto los <strong style={{ color: '#00b4d8' }}>términos de servicio</strong> y la <strong style={{ color: '#00b4d8' }}>política de escrow</strong> de IP-NEXUS.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold"
            style={{ background: '#f1f4f9', color: '#334155', border: '1px solid rgba(0,0,0,0.06)' }}
          >
            Cancelar
          </button>
          <button
            onClick={handlePay}
            disabled={isProcessing || !agreed}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #00b4d8, #00d4aa)' }}
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {isProcessing ? 'Procesando...' : `Pagar ${fmt(total)} al Escrow`}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ fontSize: '12px', color: '#64748b' }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: 600, color: color || '#0a2540' }}>{value}</span>
    </div>
  );
}
