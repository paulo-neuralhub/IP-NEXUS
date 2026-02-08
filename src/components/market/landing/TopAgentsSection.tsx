import * as React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { value: '190+', label: 'Oficinas IP conectadas', sublabel: 'En todo el mundo' },
  { value: '45+', label: 'Clasificaciones Niza', sublabel: 'Todos los sectores' },
  { value: '100%', label: 'Pago Protegido', sublabel: 'En cada transacción' },
  { value: '<24h', label: 'Primer presupuesto', sublabel: 'Tiempo medio de respuesta' },
];

export function TopAgentsSection() {
  return (
    <section className="relative py-24 overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #0F0A2A 0%, #1E1B4B 50%, #312E81 100%)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16">
          <h2 style={{ fontSize: '40px', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em' }}>
            El ecosistema IP <span style={{ color: '#A78BFA' }}>más completo</span>
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
              <div style={{ fontSize: '42px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {stat.value}
              </div>
              <div className="mt-2" style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
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
