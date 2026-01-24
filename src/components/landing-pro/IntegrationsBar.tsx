import { cn } from '@/lib/utils';

interface Integration {
  name: string;
  logo?: string;
}

interface IntegrationsBarProps {
  moduleCode: 'spider' | 'market' | 'docket' | 'nexus';
  title?: string;
  subtitle?: string;
  integrations?: Integration[];
}

const DEFAULT_INTEGRATIONS: Integration[] = [
  { name: 'EUIPO' },
  { name: 'OEPM' },
  { name: 'USPTO' },
  { name: 'WIPO' },
  { name: 'EPO' },
  { name: 'UK IPO' },
];

const MODULE_GRADIENTS = {
  spider: 'from-indigo-900 to-slate-900',
  market: 'from-teal-900 to-slate-900',
  docket: 'from-blue-900 to-slate-900',
  nexus: 'from-blue-950 to-slate-950',
};

export function IntegrationsBar({
  moduleCode,
  title = 'Conecta con las principales oficinas de PI',
  subtitle,
  integrations = DEFAULT_INTEGRATIONS,
}: IntegrationsBarProps) {
  return (
    <section id="integraciones" className={cn(
      'py-16 lg:py-24 bg-gradient-to-br',
      MODULE_GRADIENTS[moduleCode]
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 text-lg text-white/70">
              {subtitle}
            </p>
          )}
        </div>

        {/* Logos Grid */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className="group landing-integration-logo"
            >
              {integration.logo ? (
                <img
                  src={integration.logo}
                  alt={integration.name}
                  className="h-10 md:h-12 w-auto filter brightness-0 invert"
                />
              ) : (
                <div className="h-12 px-6 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/15 transition-colors">
                  <span className="text-sm md:text-base font-semibold text-white">
                    {integration.name}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom text */}
        <p className="text-center mt-10 text-white/60 text-sm">
          Y más de 50 oficinas de PI de todo el mundo
        </p>
      </div>
    </section>
  );
}
