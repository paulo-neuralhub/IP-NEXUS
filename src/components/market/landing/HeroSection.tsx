import * as React from 'react';
import { Link } from 'react-router-dom';
import { User, Briefcase, ArrowRight, ShieldCheck, Users, Globe, Store } from 'lucide-react';

interface HeroSectionProps {
  onParticularClick?: () => void;
  onSelectorClick?: () => void;
}

export function HeroSection({ onParticularClick, onSelectorClick }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4C1D95 100%)' }}>
      
      {/* Decorative patterns */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.2), transparent 60%)' }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 20% 80%, rgba(99,102,241,0.1), transparent 50%)' }} />
      
      <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="max-w-3xl">
          {/* Brand badge */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Store className="w-4 h-4 text-white" />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>IP-Market</span>
          </div>
          
          <h1 style={{ fontSize: '48px', fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            Protege tu marca.{' '}
            <br />
            <span style={{ color: '#A78BFA' }}>Encuentra al mejor profesional.</span>
          </h1>
          
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', marginTop: '20px', maxWidth: '540px', lineHeight: 1.6 }}>
            Publica lo que necesitas, recibe presupuestos de profesionales verificados, 
            y contrata con Pago Protegido. Sin riesgo, sin compromiso.
          </p>
          
          {/* Dual CTA */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            <button
              onClick={onParticularClick}
              className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all hover:scale-[1.02]"
              style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,255,255,0.15)' }}>
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff', display: 'block' }}>
                  Proteger mi marca
                </span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                  Soy empresa o particular
                </span>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }} />
            </button>

            <Link
              to="/login"
              className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all hover:scale-[1.02] no-underline"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,255,255,0.1)' }}>
                <Briefcase className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.7)' }} />
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', display: 'block' }}>
                  Soy profesional IP
                </span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                  Agente, abogado o despacho
                </span>
              </div>
              <ArrowRight className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-5 mt-8 flex-wrap">
            {[
              { icon: ShieldCheck, label: 'Pago Protegido' },
              { icon: Users, label: 'Profesionales verificados' },
              { icon: Globe, label: '+50 jurisdicciones' },
            ].map(badge => (
              <div key={badge.label} className="flex items-center gap-1.5">
                <badge.icon className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
