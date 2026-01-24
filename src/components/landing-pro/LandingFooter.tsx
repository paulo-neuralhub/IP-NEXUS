import { Link } from 'react-router-dom';
import { Shield, Linkedin, Twitter, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface LandingFooterProps {
  moduleCode: 'spider' | 'market' | 'docket' | 'nexus';
  moduleName: string;
  columns?: FooterColumn[];
}

const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    title: 'Producto',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Precios', href: '#precios' },
      { label: 'Integraciones', href: '#integraciones' },
      { label: 'Actualizaciones', href: '/changelog' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: 'Centro de Ayuda', href: '/help' },
      { label: 'Documentación', href: '/docs' },
      { label: 'Blog', href: '/blog' },
      { label: 'Webinars', href: '/webinars' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre nosotros', href: '/about' },
      { label: 'Contacto', href: '/contact' },
      { label: 'Trabaja con nosotros', href: '/careers' },
      { label: 'Partners', href: '/partners' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacidad', href: '/privacy' },
      { label: 'Términos', href: '/terms' },
      { label: 'Cookies', href: '/cookies' },
      { label: 'Seguridad', href: '/security' },
    ],
  },
];

export function LandingFooter({
  moduleCode,
  moduleName,
  columns = DEFAULT_COLUMNS,
}: LandingFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
            <Link to={`/${moduleCode}`} className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">IP-{moduleName.toUpperCase()}</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Solución profesional para la gestión de Propiedad Intelectual.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="mailto:info@ip-nexus.com"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {columns.map((column, index) => (
            <div key={index}>
              <h4 className="font-semibold text-white mb-4">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.href}
                      className="text-slate-400 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {currentYear} IP-NEXUS. Todos los derechos reservados.
          </p>
          
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-slate-500 hover:text-slate-400 text-sm">
              Privacidad
            </Link>
            <Link to="/terms" className="text-slate-500 hover:text-slate-400 text-sm">
              Términos
            </Link>
            <Link to="/cookies" className="text-slate-500 hover:text-slate-400 text-sm">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
