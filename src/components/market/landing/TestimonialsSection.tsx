import { Star } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const TESTIMONIALS = [
  {
    quote: "IP-MARKET me ayudó a encontrar un agente especializado en patentes europeas en menos de 24 horas. El proceso fue transparente y el resultado excelente.",
    author: "María García",
    role: "CEO, TechStartup SL",
  },
  {
    quote: "Como agente de marcas, la plataforma me ha permitido llegar a clientes que nunca hubiera encontrado. Las herramientas de gestión son increíbles.",
    author: "Carlos Rodríguez",
    role: "Abogado de Marcas",
  },
  {
    quote: "La seguridad del escrow y la verificación de agentes nos dio la confianza para contratar servicios internacionales sin preocupaciones.",
    author: "Ana Martínez",
    role: "Legal Director, ACME Corp",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-secondary">Lo que dicen nuestros usuarios</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, i) => (
            <div key={i} className="bg-card rounded-2xl border p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t">
                <Avatar>
                  <AvatarFallback>{testimonial.author[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-secondary">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
