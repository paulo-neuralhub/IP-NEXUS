// ============================================
// src/components/landing/LandingCta.tsx
// ============================================

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface LandingCtaProps {
  title?: string | null;
  subtitle?: string | null;
  type?: 'form' | 'button' | 'calendly';
  moduleCode: string;
}

const MODULE_GRADIENTS: Record<string, string> = {
  spider: 'from-purple-600 to-indigo-600',
  genius: 'from-amber-500 to-orange-500',
  docket: 'from-sky-500 to-blue-600',
  finance: 'from-teal-500 to-emerald-600',
};

export function LandingCta({ title, subtitle, type = 'form', moduleCode }: LandingCtaProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const gradient = MODULE_GRADIENTS[moduleCode] || MODULE_GRADIENTS.docket;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simular envío - en producción conectar a supabase o servicio de email
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success('¡Gracias! Te contactaremos pronto.');
  };

  return (
    <section className={`relative py-20 lg:py-28 bg-gradient-to-br ${gradient}`}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {title || '¿Listo para empezar?'}
          </h2>
          {subtitle && (
            <p className="text-lg opacity-90 mb-8">
              {subtitle}
            </p>
          )}

          {type === 'form' && !isSubmitted && (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
              <div className="grid gap-4">
                <div className="text-left">
                  <Label htmlFor="cta-name" className="text-white/80">Nombre</Label>
                  <Input
                    id="cta-name"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                <div className="text-left">
                  <Label htmlFor="cta-email" className="text-white/80">Email *</Label>
                  <Input
                    id="cta-email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-white text-foreground hover:bg-white/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Solicitar información
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          )}

          {type === 'form' && isSubmitted && (
            <div className="flex flex-col items-center gap-4 py-8">
              <CheckCircle className="w-16 h-16 text-white" />
              <p className="text-xl">¡Gracias por tu interés!</p>
              <p className="opacity-80">Te contactaremos en las próximas 24 horas.</p>
            </div>
          )}

          {type === 'button' && (
            <Button
              asChild
              size="lg"
              className="bg-white text-foreground hover:bg-white/90"
            >
              <Link to="/register">
                Empezar ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
