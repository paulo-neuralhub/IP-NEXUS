import { cn } from '@/lib/utils';

interface SocialProofBarProps {
  headline?: string;
  stats?: { value: string; label: string }[];
  logos?: { name: string; src?: string }[];
  className?: string;
}

export function SocialProofBar({
  headline = 'Más de 500 despachos confían en nosotros',
  stats,
  logos,
  className,
}: SocialProofBarProps) {
  // Default logos if not provided
  const defaultLogos: { name: string; src?: string }[] = [
    { name: 'Garrigues' },
    { name: 'Cuatrecasas' },
    { name: 'Uría Menéndez' },
    { name: 'Baker McKenzie' },
    { name: 'Pérez-Llorca' },
    { name: 'Gómez-Acebo' },
  ];

  const displayLogos = logos || defaultLogos;

  return (
    <section className={cn('py-12 bg-slate-50 border-y border-slate-100', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Headline */}
        <p className="text-center text-slate-500 text-sm font-medium uppercase tracking-wider mb-8">
          {headline}
        </p>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-900">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Logos */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {displayLogos.map((logo, index) => (
            <div
              key={index}
              className="landing-logo-gray"
            >
              {logo.src ? (
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="h-8 md:h-10 w-auto"
                />
              ) : (
                <div className="h-8 md:h-10 px-4 flex items-center justify-center bg-slate-200 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">{logo.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
