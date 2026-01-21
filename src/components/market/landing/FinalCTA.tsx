import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinalCTA() {
  return (
    <section className="py-16 bg-muted/50">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-secondary">
          ¿Listo para encontrar al profesional perfecto?
        </h2>
        <p className="text-muted-foreground mt-4">
          Solicita presupuestos gratis y sin compromiso
        </p>
        <Button size="lg" className="mt-6 bg-market hover:bg-market/90" asChild>
          <Link to="/app/market/rfq/new">
            Empezar ahora <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
