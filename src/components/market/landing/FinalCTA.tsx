import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface FinalCTAProps {
  onParticularClick?: () => void;
}

export function FinalCTA({ onParticularClick }: FinalCTAProps) {
  return (
    <section className="relative py-28 overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #1E1B4B 0%, #312E81 50%, #3B1F7E 100%)' }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.2), transparent 60%)', filter: 'blur(60px)' }} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          ¿Listo para proteger
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #A78BFA, #C4B5FD)',
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
          style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '480px', margin: '20px auto 0' }}>
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
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-lg font-semibold text-white transition-all hover:scale-[1.03]"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
              boxShadow: '0 0 60px rgba(124,58,237,0.35), 0 4px 24px rgba(124,58,237,0.25)',
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
          style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
          Sin compromiso · Sin tarjeta de crédito · Cancelable en cualquier momento
        </motion.p>
      </div>
    </section>
  );
}
