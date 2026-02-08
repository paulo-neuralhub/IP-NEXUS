import * as React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Layers, RefreshCcw } from 'lucide-react';

const paymentSteps = [
  { status: 'done', icon: '💰', text: 'Pago realizado', amount: '€1.500', detail: 'Fondos retenidos de forma segura' },
  { status: 'done', icon: '🏛️', text: 'Tasas oficiales adelantadas', amount: '€850', detail: 'Transferidas al profesional' },
  { status: 'done', icon: '✅', text: 'Fase 1 completada', amount: '€163', detail: 'Liberado al profesional' },
  { status: 'active', icon: '🔵', text: 'Fase 2 en ejecución', amount: '€228', detail: 'En progreso...' },
  { status: 'pending', icon: '⏳', text: 'Fase 3 pendiente', amount: '€260', detail: 'Protegido hasta confirmación' },
];

export function ServiceCategoriesSection() {
  return (
    <section style={{ background: '#fff' }} className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
              style={{ background: '#ECFDF5', border: '1px solid #D1FAE5' }}>
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669' }}>Pago Protegido</span>
            </div>
            <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#1E1B4B', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              Tu dinero está seguro.
              <br />
              <span style={{ color: '#10B981' }}>Siempre.</span>
            </h2>
            <p className="mt-5" style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.8, maxWidth: '460px' }}>
              Cuando contratas a un profesional en IP-Market, tu pago se retiene de forma segura
              hasta que confirmes cada entrega. El profesional trabaja por fases y solo cobra
              cuando tú estás satisfecho.
            </p>
            <div className="space-y-4 mt-8">
              {[
                { icon: Lock, text: 'Fondos retenidos por Stripe, líder mundial en pagos' },
                { icon: Layers, text: 'Pago por fases — el profesional cobra según entrega' },
                { icon: RefreshCcw, text: 'Reembolso garantizado si hay incidencia no resuelta' },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: '#F0FDF4' }}>
                    <item.icon className="w-4 h-4" style={{ color: '#10B981' }} />
                  </div>
                  <span style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Visual stepper */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl p-8"
            style={{ background: '#FAFAFE', border: '1px solid #F1F5F9' }}>
            <div className="space-y-0">
              {paymentSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4 relative">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{
                        background: step.status === 'done' ? '#ECFDF5' : step.status === 'active' ? '#EDE9FE' : '#F8FAFC',
                        border: step.status === 'active' ? '2px solid #7C3AED' : 'none',
                      }}>
                      {step.icon}
                    </div>
                    {idx < paymentSteps.length - 1 && (
                      <div className="w-px h-8" style={{ background: step.status === 'done' ? '#A7F3D0' : '#E2E8F0' }} />
                    )}
                  </div>
                  <div className="pt-1.5 pb-4 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: '14px', fontWeight: 600, color: step.status === 'pending' ? '#94A3B8' : '#1E293B' }}>
                        {step.text}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: step.status === 'done' ? '#10B981' : step.status === 'active' ? '#7C3AED' : '#94A3B8' }}>
                        {step.amount}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>{step.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
