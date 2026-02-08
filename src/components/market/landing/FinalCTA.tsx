import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface FinalCTAProps {
  onParticularClick?: () => void;
}

export function FinalCTA({ onParticularClick }: FinalCTAProps) {
  return (
    <section className="relative py-28 overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #0D1B2A 0%, #14213D 50%, #1B2D4F 100%)' }}>

      {/* Gold glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(252,163,17,0.12), transparent 60%)', filter: 'blur(60px)' }} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          ¿Listo para proteger
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #FCA311, #FFB833)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            lo que es tuyo?
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-5"
          style={{ fontSize: '16px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: '480px', margin: '20px auto 0' }}>
          Publicar tu solicitud es gratis. Recibirás presupuestos de profesionales verificados en menos de 24 horas.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10">
          <button
            onClick={onParticularClick}
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-lg font-bold transition-all hover:scale-[1.03]"
            style={{
              background: 'linear-gradient(135deg, #FCA311, #E8930A)',
              color: '#14213D',
              boxShadow: '0 0 60px rgba(252,163,17,0.2), 0 4px 24px rgba(252,163,17,0.15)',
            }}>
            Empezar ahora — Es gratis
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-6"
          style={{ fontSize: '13px', color: 'rgba(255,255,255,0.25)' }}>
          Sin compromiso · Sin tarjeta de crédito · Cancelable en cualquier momento
        </motion.p>
      </div>
    </section>
  );
}
