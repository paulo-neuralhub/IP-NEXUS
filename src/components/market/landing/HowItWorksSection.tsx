import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
  {
    step: 1,
    title: 'Describe tu necesidad',
    description: 'Cuéntanos qué servicio necesitas, en qué jurisdicciones y tu presupuesto',
    icon: '📝',
  },
  {
    step: 2,
    title: 'Recibe presupuestos',
    description: 'Agentes verificados te enviarán propuestas personalizadas',
    icon: '📬',
  },
  {
    step: 3,
    title: 'Compara y elige',
    description: 'Revisa perfiles, ratings y elige al mejor profesional',
    icon: '⚖️',
  },
  {
    step: 4,
    title: 'Trabaja con garantía',
    description: 'Pago protegido con escrow y soporte de IP-NEXUS',
    icon: '🛡️',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary">¿Cómo funciona?</h2>
          <p className="text-muted-foreground mt-2">Encuentra al profesional perfecto en 4 simples pasos</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {STEPS.map((item, index) => (
            <div key={item.step} className="relative">
              {index < 3 && (
                <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-border" />
              )}
              <div className="relative bg-card rounded-2xl p-6 text-center shadow-sm">
                <div className="w-16 h-16 bg-market/10 rounded-2xl flex items-center justify-center mx-auto text-3xl">
                  {item.icon}
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-market text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-secondary mt-4">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button size="lg" className="bg-market hover:bg-market/90" asChild>
            <Link to="/app/market/rfq/new">
              Solicitar presupuesto gratis <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
