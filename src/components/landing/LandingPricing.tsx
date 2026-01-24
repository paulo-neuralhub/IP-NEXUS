// ============================================
// src/components/landing/LandingPricing.tsx
// ============================================

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LandingPricingPlan } from '@/hooks/useLandingPage';

interface LandingPricingProps {
  plans: LandingPricingPlan[];
  moduleCode: string;
}

const MODULE_COLORS: Record<string, { gradient: string; button: string }> = {
  spider: { 
    gradient: 'from-purple-600 to-indigo-600', 
    button: 'bg-purple-600 hover:bg-purple-700' 
  },
  genius: { 
    gradient: 'from-amber-500 to-orange-500', 
    button: 'bg-amber-600 hover:bg-amber-700' 
  },
  docket: { 
    gradient: 'from-sky-500 to-blue-600', 
    button: 'bg-sky-600 hover:bg-sky-700' 
  },
  finance: { 
    gradient: 'from-teal-500 to-emerald-600', 
    button: 'bg-teal-600 hover:bg-teal-700' 
  },
};

export function LandingPricing({ plans, moduleCode }: LandingPricingProps) {
  const colors = MODULE_COLORS[moduleCode] || MODULE_COLORS.docket;

  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Planes y precios
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades. Todos incluyen 14 días de prueba gratis.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative flex flex-col ${
                plan.is_popular 
                  ? 'border-2 border-primary shadow-xl scale-105' 
                  : 'border-border'
              }`}
            >
              {plan.is_popular && (
                <Badge className={`absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r ${colors.gradient} text-white`}>
                  Más popular
                </Badge>
              )}
              <CardHeader className="text-center pb-2">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <div className="mt-4">
                  {plan.price !== null ? (
                    <>
                      <span className="text-4xl font-bold">{plan.price}€</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </>
                  ) : (
                    <span className="text-2xl font-semibold text-muted-foreground">Personalizado</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className={`w-full ${plan.is_popular ? colors.button + ' text-white' : ''}`}
                  variant={plan.is_popular ? 'default' : 'outline'}
                >
                  <Link to={plan.cta_url || '/auth/register'}>
                    {plan.cta_text}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
