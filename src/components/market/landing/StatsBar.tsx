import * as React from 'react';
import { motion } from 'framer-motion';

export function StatsBar() {
  const offices = ['EUIPO', 'OEPM', 'USPTO', 'WIPO', 'UKIPO', 'DPMA', 'INPI', 'JPO'];

  return (
    <section className="py-12" style={{ background: '#F8F9FC', borderBottom: '1px solid rgba(20,33,61,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-8"
          style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Conectado con las principales oficinas de propiedad intelectual
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
          {offices.map((office) => (
            <span key={office}
              style={{ fontSize: '15px', fontWeight: 700, color: '#C1CAD6', letterSpacing: '0.05em' }}>
              {office}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
