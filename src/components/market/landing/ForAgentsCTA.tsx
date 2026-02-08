import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Briefcase, ArrowRight, Check } from 'lucide-react';

interface ForAgentsCTAProps {
  onParticularClick?: () => void;
}

export function ForAgentsCTA({ onParticularClick }: ForAgentsCTAProps) {
  const navigate = useNavigate();

  return (
    <section style={{ background: '#fff' }} className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14">
          <h2 style={{ fontSize: '40px', fontWeight: 700, color: '#14213D', letterSpacing: '-0.03em' }}>
            Un marketplace, <span style={{ color: '#FCA311' }}>dos mundos</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Card Empresas — Dark Navy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[20px] p-8 overflow-hidden"
            style={{ background: 'linear-gradient(145deg, #14213D, #1B2D4F)', minHeight: '420px' }}>
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(252,163,17,0.12), transparent 70%)' }} />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                style={{ background: 'rgba(252,163,17,0.12)', border: '1px solid rgba(252,163,17,0.15)' }}>
                <User className="w-6 h-6" style={{ color: '#FCA311' }} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                Para empresas y emprendedores
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '24px' }}>
                Protege el nombre de tu negocio, tu logo o tu invento. Sin conocimientos legales.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  'Wizard guiado — sin jerga técnica',
                  'Presupuestos detallados y comparables',
                  'Chat directo con los profesionales',
                  'Pago Protegido — solo pagas por resultados',
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 shrink-0" style={{ color: '#FCA311' }} />
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{feat}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={onParticularClick}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #FCA311, #E8930A)', color: '#14213D', boxShadow: '0 4px 20px rgba(252,163,17,0.25)' }}>
                Proteger mi marca
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Card Profesionales — Light */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[20px] p-8"
            style={{ background: '#fff', boxShadow: '0 1px 3px rgba(20,33,61,0.04), 0 8px 40px rgba(20,33,61,0.08)', minHeight: '420px' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
              style={{ background: '#EFF6FF' }}>
              <Briefcase className="w-6 h-6" style={{ color: '#14213D' }} />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#14213D', marginBottom: '12px' }}>
              Para profesionales IP
            </h3>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.7, marginBottom: '24px' }}>
              Accede a un flujo continuo de solicitudes de todo el mundo. Amplía tu red y cobra con garantía.
            </p>
            <div className="space-y-3 mb-8">
              {[
                'Feed de solicitudes filtrable por jurisdicción',
                'Presupuestos auto-generados con tasas oficiales',
                'Red de corresponsales internacionales',
                'Cobro garantizado fase a fase',
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 shrink-0" style={{ color: '#10B981' }} />
                  <span style={{ fontSize: '13px', color: '#475569' }}>{feat}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/app/market')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
              style={{ background: '#14213D', color: '#FCA311' }}>
              Acceder como profesional
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
