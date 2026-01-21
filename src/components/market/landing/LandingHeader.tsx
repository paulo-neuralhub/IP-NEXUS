import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Store } from 'lucide-react';

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/market" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-market rounded-lg flex items-center justify-center">
            <Store className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl text-secondary">IP-MARKET</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/market/agents" className="text-muted-foreground hover:text-market transition-colors">
            Explorar Agentes
          </Link>
          <Link to="/market/rankings" className="text-muted-foreground hover:text-market transition-colors">
            Rankings
          </Link>
          <Link to="/market/requests" className="text-muted-foreground hover:text-market transition-colors">
            Solicitudes
          </Link>
        </nav>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/login">Iniciar sesión</Link>
          </Button>
          <Button asChild className="bg-market hover:bg-market/90">
            <Link to="/register">Registrarse</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
