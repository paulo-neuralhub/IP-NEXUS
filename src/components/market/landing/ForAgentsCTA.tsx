import * as React from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';

export function ForAgentsCTA() {
  return (
    <section className="py-20" style={{ 
      background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4C1D95 100%)',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Users className="w-8 h-8" style={{ color: 'rgba(255,255,255,0.7)' }} />
        </div>
        <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
          ¿Eres profesional de PI?
        </h2>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', marginTop: '12px', maxWidth: '540px', margin: '12px auto 0' }}>
          Únete a la red de agentes de IP-Market. Recibe solicitudes de clientes, 
          gestiona tus proyectos y haz crecer tu práctica.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link to="/register?type=agent"
            className="px-6 py-3 rounded-xl text-sm font-semibold no-underline transition-all hover:scale-[1.02]"
            style={{ 
              background: 'rgba(255,255,255,0.15)', 
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
            }}>
            Registrarse como Agente
          </Link>
          <Link to="/market/for-agents"
            className="px-6 py-3 rounded-xl text-sm font-medium no-underline"
            style={{ color: 'rgba(255,255,255,0.6)' }}>
            Saber más →
          </Link>
        </div>
        
        <div className="grid grid-cols-3 gap-8 mt-12 max-w-md mx-auto">
          {[
            { value: '0%', label: 'Comisión para empezar' },
            { value: '100%', label: 'Control de tus precios' },
            { value: '24h', label: 'Soporte dedicado' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
