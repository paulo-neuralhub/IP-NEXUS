import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ForAgentsCTA() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-market to-purple-600 text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <Users className="w-16 h-16 mx-auto mb-6 opacity-80" />
        <h2 className="text-3xl md:text-4xl font-bold">¿Eres profesional de PI?</h2>
        <p className="text-xl text-primary-foreground/80 mt-4 max-w-2xl mx-auto">
          Únete a la red de agentes de IP-MARKET. Recibe solicitudes de clientes, 
          gestiona tus proyectos y haz crecer tu práctica.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Button size="lg" variant="secondary" asChild>
            <Link to="/register?type=agent">
              Registrarse como Agente
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" asChild>
            <Link to="/market/for-agents">
              Saber más
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-8 mt-12 max-w-2xl mx-auto">
          <div>
            <div className="text-2xl font-bold">0%</div>
            <div className="text-sm text-primary-foreground/70">Comisión para empezar</div>
          </div>
          <div>
            <div className="text-2xl font-bold">100%</div>
            <div className="text-sm text-primary-foreground/70">Control de tus precios</div>
          </div>
          <div>
            <div className="text-2xl font-bold">24h</div>
            <div className="text-sm text-primary-foreground/70">Soporte dedicado</div>
          </div>
        </div>
      </div>
    </section>
  );
}
