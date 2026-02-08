import * as React from 'react';
import { Link } from 'react-router-dom';
import { Store, Zap } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer style={{ background: '#1E1B4B', fontFamily: "'Inter', sans-serif" }} className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { title: 'IP-Market', links: [
              { to: '/market/agents', label: 'Explorar Agentes' },
              { to: '/market/rankings', label: 'Rankings' },
              { to: '/market/requests', label: 'Solicitudes' },
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
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '12px' }}>
                {section.title}
              </h4>
              <ul className="space-y-2 list-none p-0 m-0">
                {section.links.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="no-underline transition-colors"
                      style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-10 pt-8 flex flex-col md:flex-row items-center justify-between"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Powered by IP-NEXUS */}
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Parte del ecosistema</span>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #00b4d8, #00d4aa)' }}>
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
                IP-NEXUS
              </span>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginTop: '12px' }}
            className="md:mt-0">
            © 2026 IP-NEXUS. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
