import * as React from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, ShieldCheck } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: FileText,
    title: 'Describe tu necesidad',
    description: 'Cuéntanos qué quieres proteger en lenguaje normal. Sin jerga legal. Nuestro sistema traduce tu necesidad al lenguaje técnico.',
    gradient: 'linear-gradient(135deg, rgba(252,163,17,0.06), rgba(252,163,17,0.02))',
    iconBg: 'linear-gradient(135deg, #FCA311, #E8930A)',
  },
  {
    step: '02',
    icon: Users,
    title: 'Compara profesionales',
    description: 'Recibe presupuestos detallados de profesionales verificados. Compara precio, experiencia, valoraciones y plazo.',
    gradient: 'linear-gradient(135deg, rgba(14,165,233,0.06), rgba(14,165,233,0.02))',
    iconBg: 'linear-gradient(135deg, #0EA5E9, #0284C7)',
  },
  {
    step: '03',
    icon: ShieldCheck,
    title: 'Contrata sin riesgo',
    description: 'Paga con Pago Protegido: tu dinero se retiene hasta que confirmes cada entrega. Pagas solo por resultados.',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(16,185,129,0.02))',
    iconBg: 'linear-gradient(135deg, #10B981, #059669)',
  },
];

export function HowItWorksSection() {
  return (
    <section style={{ background: '#F8F9FC' }} className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16">
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#FCA311', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Así funciona
          </span>
          <h2 className="mt-3" style={{ fontSize: '40px', fontWeight: 700, color: '#14213D', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            De tu idea a la protección legal
            <br />
            <span style={{ color: '#FCA311' }}>en 3 pasos</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="relative rounded-[20px] p-8 transition-all hover:shadow-lg hover:-translate-y-1"
              style={{
                background: item.gradient,
                boxShadow: '0 1px 3px rgba(20,33,61,0.04), 0 4px 20px rgba(20,33,61,0.06)',
              }}>
              {/* Step number — very subtle */}
              <div className="absolute top-4 right-6 select-none pointer-events-none"
                style={{ fontSize: '80px', fontWeight: 800, color: 'rgba(20,33,61,0.03)', lineHeight: 1 }}>
                {item.step}
              </div>
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: item.iconBg, boxShadow: `0 4px 16px rgba(0,0,0,0.1)` }}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#14213D', marginBottom: '8px' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7 }}>
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
