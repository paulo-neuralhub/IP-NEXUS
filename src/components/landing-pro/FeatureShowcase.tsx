import { LucideIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  bullets?: string[];
  imageUrl?: string;
}

interface FeatureShowcaseProps {
  moduleCode: 'spider' | 'market' | 'docket' | 'nexus';
  sectionTitle?: string;
  sectionSubtitle?: string;
  features: Feature[];
}

const MODULE_COLORS = {
  spider: 'bg-indigo-600',
  market: 'bg-teal-600',
  docket: 'bg-blue-600',
  nexus: 'bg-blue-700',
};

export function FeatureShowcase({
  moduleCode,
  sectionTitle = 'Funcionalidades potentes',
  sectionSubtitle,
  features,
}: FeatureShowcaseProps) {
  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
            {sectionTitle}
          </h2>
          {sectionSubtitle && (
            <p className="mt-4 text-lg text-slate-600">
              {sectionSubtitle}
            </p>
          )}
        </div>

        {/* Features */}
        <div className="space-y-24 lg:space-y-32">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                'grid lg:grid-cols-2 gap-12 lg:gap-20 items-center',
                index % 2 === 1 && 'lg:flex-row-reverse'
              )}
            >
              {/* Text Content */}
              <div className={cn(index % 2 === 1 && 'lg:order-2')}>
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-6',
                  MODULE_COLORS[moduleCode]
                )}>
                  <feature.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                
                <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Bullets */}
                {feature.bullets && feature.bullets.length > 0 && (
                  <ul className="space-y-3">
                    {feature.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="flex items-start gap-3">
                        <div className={cn(
                          'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                          MODULE_COLORS[moduleCode]
                        )}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-slate-600">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Image */}
              <div className={cn(
                'relative',
                index % 2 === 1 && 'lg:order-1'
              )}>
                {feature.imageUrl ? (
                  <img
                    src={feature.imageUrl}
                    alt={feature.title}
                    className="w-full h-auto rounded-2xl shadow-xl border border-slate-200"
                  />
                ) : (
                  <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center">
                    <feature.icon className="w-16 h-16 text-slate-300" strokeWidth={1} />
                  </div>
                )}
                
                {/* Decorative elements */}
                <div className={cn(
                  'absolute -z-10 w-full h-full rounded-2xl top-4 -right-4',
                  index % 2 === 1 ? '-left-4' : '-right-4',
                  'bg-gradient-to-br from-slate-100 to-slate-50'
                )} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
