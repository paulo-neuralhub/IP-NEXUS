import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FinalCtaProps {
  moduleCode: 'spider' | 'market' | 'docket' | 'nexus';
  title?: string;
  subtitle?: string;
  showEmailCapture?: boolean;
  ctaText?: string;
  ctaHref?: string;
}

const MODULE_GRADIENTS = {
  spider: 'from-indigo-900 via-slate-900 to-slate-950',
  market: 'from-teal-900 via-slate-900 to-slate-950',
  docket: 'from-blue-900 via-slate-900 to-slate-950',
  nexus: 'from-blue-950 via-slate-900 to-slate-950',
};

export function FinalCta({
  moduleCode,
  title = '¿Listo para empezar?',
  subtitle = 'Únete a cientos de despachos que ya confían en nosotros',
  showEmailCapture = true,
  ctaText = 'Empezar gratis',
  ctaHref = '/register',
}: FinalCtaProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success('¡Gracias! Te contactaremos pronto.');
  };

  return (
    <section className={cn(
      'py-20 lg:py-28 bg-gradient-to-br',
      MODULE_GRADIENTS[moduleCode]
    )}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight">
          {title}
        </h2>
        
        {subtitle && (
          <p className="mt-4 text-lg md:text-xl text-white/70">
            {subtitle}
          </p>
        )}

        {/* Email Capture or CTA */}
        <div className="mt-10">
          {showEmailCapture ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              {!isSubmitted ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 h-12 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 px-8 bg-white text-slate-900 hover:bg-white/90 font-medium"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {ctaText}
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-white">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg">¡Gracias! Te contactaremos pronto.</span>
                </div>
              )}
              
              <p className="mt-4 text-sm text-white/50">
                Prueba gratis durante 14 días. Sin tarjeta de crédito.
              </p>
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="h-14 px-10 bg-white text-slate-900 hover:bg-white/90 font-medium text-lg"
              >
                <Link to={ctaHref}>
                  {ctaText}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 px-10 bg-transparent border-white/20 text-white hover:bg-white/10 font-medium text-lg"
              >
                <Link to="/contact">Hablar con ventas</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-white/60 text-sm">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>14 días gratis</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Sin tarjeta requerida</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Cancela cuando quieras</span>
          </div>
        </div>
      </div>
    </section>
  );
}
