import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PricingPlan {
  name: string;
  description: string;
  priceMonthly: number | null;
  priceYearly: number | null;
  features: string[];
  cta: { text: string; href: string };
  isPopular?: boolean;
  badge?: string;
}

interface PricingSectionProps {
  moduleCode: 'spider' | 'market' | 'docket' | 'nexus';
  sectionTitle?: string;
  sectionSubtitle?: string;
  plans: PricingPlan[];
}

const MODULE_COLORS = {
  spider: { bg: 'bg-indigo-600', ring: 'ring-indigo-600', text: 'text-indigo-600' },
  market: { bg: 'bg-teal-600', ring: 'ring-teal-600', text: 'text-teal-600' },
  docket: { bg: 'bg-blue-600', ring: 'ring-blue-600', text: 'text-blue-600' },
  nexus: { bg: 'bg-blue-700', ring: 'ring-blue-700', text: 'text-blue-700' },
};

export function PricingSection({
  moduleCode,
  sectionTitle = 'Planes y precios',
  sectionSubtitle = 'Elige el plan que mejor se adapte a tu negocio. Cancela cuando quieras.',
  plans,
}: PricingSectionProps) {
  const [isYearly, setIsYearly] = useState(false);
  const colors = MODULE_COLORS[moduleCode];

  return (
    <section id="precios" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
            {sectionTitle}
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            {sectionSubtitle}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-full">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                'px-5 py-2 text-sm font-medium rounded-full transition-all',
                !isYearly ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Mensual
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                'px-5 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-2',
                isYearly ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Anual
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                -20%
              </Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                'relative rounded-2xl p-8 transition-all duration-300',
                plan.isPopular
                  ? `bg-white border-2 ${colors.ring} shadow-xl`
                  : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg'
              )}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className={cn(
                  'absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-medium text-white flex items-center gap-1.5',
                  colors.bg
                )}>
                  <Sparkles className="w-4 h-4" />
                  Popular
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-900">{plan.name}</h3>
                <p className="mt-2 text-slate-600 text-sm">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                {plan.priceMonthly !== null ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">
                      €{isYearly && plan.priceYearly !== null 
                        ? Math.round(plan.priceYearly / 12) 
                        : plan.priceMonthly}
                    </span>
                    <span className="text-slate-500">/mes</span>
                  </div>
                ) : (
                  <div className="text-4xl font-bold text-slate-900">Personalizado</div>
                )}
                {isYearly && plan.priceYearly !== null && (
                  <p className="mt-1 text-sm text-slate-500">
                    Facturado anualmente (€{plan.priceYearly}/año)
                  </p>
                )}
              </div>

              {/* CTA */}
              <Button
                asChild
                className={cn(
                  'w-full mb-8',
                  plan.isPopular
                    ? `${colors.bg} hover:opacity-90 text-white`
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                )}
              >
                <Link to={plan.cta.href}>{plan.cta.text}</Link>
              </Button>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                      plan.isPopular ? colors.bg : 'bg-slate-200'
                    )}>
                      <Check className={cn(
                        'w-3 h-3',
                        plan.isPopular ? 'text-white' : 'text-slate-600'
                      )} />
                    </div>
                    <span className="text-slate-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-600">
            ¿Necesitas un plan personalizado?{' '}
            <Link to="/contact" className={cn('font-medium hover:underline', colors.text)}>
              Contacta con ventas
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
