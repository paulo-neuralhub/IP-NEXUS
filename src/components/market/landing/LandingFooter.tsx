import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="bg-secondary text-primary-foreground py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-semibold mb-4">IP-MARKET</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/market/agents" className="hover:text-primary-foreground">Explorar Agentes</Link></li>
              <li><Link to="/market/rankings" className="hover:text-primary-foreground">Rankings</Link></li>
              <li><Link to="/market/requests" className="hover:text-primary-foreground">Solicitudes</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Para Agentes</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/register?type=agent" className="hover:text-primary-foreground">Registrarse</Link></li>
              <li><Link to="/market/for-agents" className="hover:text-primary-foreground">Beneficios</Link></li>
              <li><Link to="/pricing" className="hover:text-primary-foreground">Precios</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Soporte</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/help" className="hover:text-primary-foreground">Centro de Ayuda</Link></li>
              <li><Link to="/contact" className="hover:text-primary-foreground">Contacto</Link></li>
              <li><Link to="/faq" className="hover:text-primary-foreground">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/terms" className="hover:text-primary-foreground">Términos</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-foreground">Privacidad</Link></li>
              <li><Link to="/cookies" className="hover:text-primary-foreground">Cookies</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
              <Store className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">IP-NEXUS</span>
          </div>
          <p className="text-sm text-primary-foreground/50 mt-4 md:mt-0">
            © 2026 IP-NEXUS. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
