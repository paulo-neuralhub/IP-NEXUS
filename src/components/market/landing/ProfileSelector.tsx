import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  Store, User, Briefcase, ArrowRight,
  ShieldCheck, Users, Globe,
} from 'lucide-react';

interface ProfileSelectorProps {
  onSelectParticular: () => void;
}

export function ProfileSelector({ onSelectParticular }: ProfileSelectorProps) {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Logo */}
      <div className="text-center mb-10">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            boxShadow: '0 4px 20px rgba(124,58,237,0.2)',
          }}
        >
          <Store className="w-7 h-7 text-white" />
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0a2540' }}>
          IP-Market
        </h1>
        <p style={{ fontSize: '15px', color: '#64748b', marginTop: '4px' }}>
          El primer marketplace profesional de Propiedad Intelectual
        </p>
      </div>

      {/* Two options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option 1: Particular */}
        <button
          onClick={onSelectParticular}
          className="p-6 rounded-2xl text-left transition-all hover:scale-[1.02] hover:shadow-lg"
          style={{ background: '#fff', border: '2px solid rgba(0,0,0,0.06)' }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(124,58,237,0.08)' }}
          >
            <User className="w-6 h-6" style={{ color: '#7c3aed' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0a2540', marginBottom: '4px' }}>
            Quiero proteger mi marca
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
            Soy empresa, emprendedor o particular.
            Quiero registrar una marca, patente o diseño
            y busco un profesional que me ayude.
          </p>
          <div
            className="flex items-center gap-1.5 mt-4"
            style={{ color: '#7c3aed', fontSize: '12px', fontWeight: 600 }}
          >
            Empezar <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* Option 2: Professional */}
        <Link
          to="/login"
          className="p-6 rounded-2xl text-left transition-all hover:scale-[1.02] hover:shadow-lg no-underline"
          style={{ background: '#fff', border: '2px solid rgba(0,0,0,0.06)' }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(124,58,237,0.08)' }}
          >
            <Briefcase className="w-6 h-6" style={{ color: '#7c3aed' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0a2540', marginBottom: '4px' }}>
            Soy profesional IP
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
            Soy agente de propiedad industrial, abogado IP
            o despacho. Quiero ofrecer mis servicios
            o encontrar corresponsales en otras jurisdicciones.
          </p>
          <div
            className="flex items-center gap-1.5 mt-4"
            style={{ color: '#7c3aed', fontSize: '12px', fontWeight: 600 }}
          >
            Acceder <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Footer trust indicators */}
      <div className="text-center mt-8">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
            <span style={{ fontSize: '11px', color: '#64748b' }}>Pago Protegido</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
            <span style={{ fontSize: '11px', color: '#64748b' }}>Agentes verificados</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
            <span style={{ fontSize: '11px', color: '#64748b' }}>+50 jurisdicciones</span>
          </div>
        </div>
      </div>
    </div>
  );
}
