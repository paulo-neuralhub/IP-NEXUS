import * as React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer style={{ background: '#0D1B2A', fontFamily: "'Inter', sans-serif" }} className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { title: 'IP-Market', links: [
              { to: '/app/market/agents', label: 'Explorar Agentes' },
              { to: '/app/market/rankings', label: 'Rankings' },
              { to: '/app/market/rfq', label: 'Solicitudes' },
            ]},
            { title: 'Para Agentes', links: [
              { to: '/register?type=agent', label: 'Registrarse' },
              { to: '/market/for-agents', label: 'Beneficios' },
              { to: '/pricing', label: 'Precios' },
            ]},
            { title: 'Soporte', links: [
              { to: '/help', label: 'Centro de Ayuda' },
              { to: '/contact', label: 'Contacto' },
              { to: '/faq', label: 'FAQ' },
            ]},
            { title: 'Legal', links: [
              { to: '/terms', label: 'Términos' },
              { to: '/privacy', label: 'Privacidad' },
              { to: '/cookies', label: 'Cookies' },
            ]},
          ].map(section => (
            <div key={section.title}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
                {section.title}
              </h4>
              <ul className="space-y-2.5 list-none p-0 m-0">
                {section.links.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="no-underline transition-colors hover:text-white/60"
                      style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 flex flex-col md:flex-row items-center justify-between"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>Parte del ecosistema</span>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FCA311, #E8930A)' }}>
                <Zap className="w-3 h-3" style={{ color: '#14213D' }} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
                IP-NEXUS
              </span>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }} className="mt-4 md:mt-0">
            © 2026 IP-Market by IP-NEXUS. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
