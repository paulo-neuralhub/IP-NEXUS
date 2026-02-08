import * as React from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, ShieldCheck } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: FileText,
    title: 'Describe tu necesidad',
    description: 'Cuéntanos qué quieres proteger en lenguaje normal. Sin jerga legal, sin formularios complicados. Nuestro sistema traduce tu necesidad al lenguaje técnico.',
    color: '#7C3AED',
  },
  {
    step: '02',
    icon: Users,
    title: 'Compara profesionales',
    description: 'Recibe presupuestos detallados de profesionales verificados. Compara precio, experiencia, valoraciones y plazo de ejecución.',
    color: '#8B5CF6',
  },
  {
    step: '03',
    icon: ShieldCheck,
    title: 'Contrata sin riesgo',
    description: 'Paga con Pago Protegido: tu dinero se retiene hasta que confirmes cada entrega. Solo pagas por resultados.',
    color: '#A78BFA',
  },
];

export function HowItWorksSection() {
  return (
    <section style={{ background: '#F5F3FF' }} className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16">
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Así funciona
          </span>
          <h2 className="mt-3" style={{ fontSize: '40px', fontWeight: 700, color: '#1E1B4B', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            De tu idea a la protección legal
            <br />
            <span style={{ color: '#7C3AED' }}>en 3 pasos</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px" style={{ background: 'linear-gradient(90deg, transparent, #DDD6FE, transparent)' }} />

          {steps.map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="relative text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 relative z-10"
                style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)`, boxShadow: `0 8px 30px ${item.color}33` }}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 select-none pointer-events-none"
                style={{ fontSize: '80px', fontWeight: 800, color: 'rgba(124,58,237,0.04)', lineHeight: 1 }}>
                {item.step}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1E1B4B', marginBottom: '8px' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.7, maxWidth: '320px', margin: '0 auto' }}>
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
