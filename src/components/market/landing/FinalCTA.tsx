import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="py-20" style={{ background: '#fff', fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: '#EDE9FE' }}>
          <ShieldCheck className="w-7 h-7" style={{ color: '#6C2BD9' }} />
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#1E1B4B', letterSpacing: '-0.02em' }}>
          ¿Listo para proteger tu marca?
        </h2>
        <p style={{ fontSize: '16px', color: '#475569', marginTop: '8px' }}>
          Solicita presupuestos gratis y sin compromiso
        </p>
        <Link to="/app/market/rfq/new"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl text-sm font-semibold text-white no-underline transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', boxShadow: '0 4px 14px rgba(124,58,237,0.25)' }}>
          Empezar ahora <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
