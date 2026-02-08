import * as React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { value: '190', suffix: '+', label: 'Oficinas IP', sublabel: 'Conectadas en todo el mundo' },
  { value: '100', suffix: '%', label: 'Pago Protegido', sublabel: 'En cada transacción' },
  { value: '<24', suffix: 'h', label: 'Primer presupuesto', sublabel: 'Tiempo medio de respuesta' },
  { value: '45', suffix: '+', label: 'Sectores', sublabel: 'Clasificación internacional' },
];

export function TopAgentsSection() {
  return (
    <section className="relative py-24 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #14213D 50%, #1B2D4F 100%)' }}>

      {/* Gold orb */}
      <div className="absolute pointer-events-none"
        style={{
          top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(252,163,17,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />

      {/* Grid mesh */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16">
          <h2 style={{ fontSize: '40px', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>
            El ecosistema IP <span style={{ color: '#FCA311' }}>más completo</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center p-6 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(8px)',
              }}>
              <div className="flex items-baseline justify-center gap-0.5">
                <span style={{ fontSize: '48px', fontWeight: 200, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {stat.value}
                </span>
                <span style={{ fontSize: '28px', fontWeight: 300, color: '#FCA311' }}>
                  {stat.suffix}
                </span>
              </div>
              <div className="mt-3" style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                {stat.label}
              </div>
              <div className="mt-1" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
                {stat.sublabel}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
