import * as React from 'react';
import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50" style={{ 
      background: 'rgba(30,27,75,0.95)', 
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/market" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Store className="h-4 w-4 text-white" />
          </div>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '18px', color: '#fff', letterSpacing: '-0.02em' }}>
            IP-Market
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: 'Explorar Agentes', path: '/app/market/agents' },
            { label: 'Rankings', path: '/app/market/rankings' },
            { label: 'Solicitudes', path: '/app/market/rfq' },
          ].map(item => (
            <Link key={item.label} to={item.path} 
              className="no-underline transition-colors"
              style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.6)', fontFamily: "'Inter', sans-serif" }}>
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-3">
          <Link to="/login" className="no-underline px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ color: 'rgba(255,255,255,0.7)' }}>
            Iniciar sesión
          </Link>
          <Link to="/register" className="no-underline px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
            style={{ 
              background: 'rgba(255,255,255,0.12)', 
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
            }}>
            Registrarse
          </Link>
        </div>
      </div>
    </header>
  );
}
