import * as React from 'react';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: "IP-Market me ayudó a encontrar un agente especializado en patentes europeas en menos de 24 horas. El proceso fue transparente y el resultado excelente.",
    author: "María García",
    role: "CEO, TechStartup SL",
  },
  {
    quote: "Como agente de marcas, la plataforma me ha permitido llegar a clientes que nunca hubiera encontrado. Las herramientas de gestión son increíbles.",
    author: "Carlos Rodríguez",
    role: "Abogado de Marcas",
  },
  {
    quote: "La seguridad del escrow y la verificación de agentes nos dio la confianza para contratar servicios internacionales sin preocupaciones.",
    author: "Ana Martínez",
    role: "Legal Director, ACME Corp",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20" style={{ background: '#F5F3FF', fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#1E1B4B', letterSpacing: '-0.02em' }}>
            Lo que dicen nuestros usuarios
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, i) => (
            <div key={i} className="rounded-2xl p-6"
              style={{ 
                background: '#fff', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(124,58,237,0.03)',
                borderRadius: '16px',
              }}>
              <div className="flex items-center gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4" style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                ))}
              </div>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3 mt-6 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}>
                  {testimonial.author[0]}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E1B4B' }}>{testimonial.author}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
