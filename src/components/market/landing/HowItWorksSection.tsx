import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, MessageSquare, ShieldCheck } from 'lucide-react';

const STEPS = [
  {
    step: '1',
    title: 'Describe lo que necesitas',
    desc: 'Cuéntanos qué quieres proteger, en qué país y en qué sector. Sin jerga técnica.',
    icon: FileText,
  },
  {
    step: '2',
    title: 'Recibe presupuestos',
    desc: 'Profesionales verificados te envían presupuestos detallados. Compara precio, experiencia y plazo.',
    icon: MessageSquare,
  },
  {
    step: '3',
    title: 'Contrata con Pago Protegido',
    desc: 'Tu dinero queda retenido hasta que confirmes cada entrega. Solo pagas por resultados.',
    icon: ShieldCheck,
  },
];

export function HowItWorksSection() {
  return (
    <section style={{ background: '#F5F3FF', fontFamily: "'Inter', sans-serif" }} className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#1E1B4B', letterSpacing: '-0.02em' }}>
            Así de fácil funciona
          </h2>
          <p style={{ fontSize: '16px', color: '#475569', marginTop: '8px' }}>
            En 3 pasos, conectamos tu necesidad con el mejor profesional
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {STEPS.map((item) => (
            <div key={item.step} className="relative rounded-2xl p-6"
              style={{ 
                background: '#fff', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(124,58,237,0.03)',
                borderRadius: '16px',
              }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: '#EDE9FE' }}>
                  <item.icon className="w-5 h-5" style={{ color: '#6C2BD9' }} />
                </div>
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}>
                  {item.step}
                </span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1E1B4B', marginBottom: '6px' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Link to="/app/market/rfq/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white no-underline transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', boxShadow: '0 4px 14px rgba(124,58,237,0.25)' }}>
            Solicitar presupuesto gratis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
