import { Link } from 'react-router-dom';
import { ArrowRight, Play, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  moduleCode: 'spider' | 'market' | 'docket' | 'nexus';
  headline: string;
  subheadline: string;
  ctaPrimary: { text: string; href: string };
  ctaSecondary?: { text: string; href: string };
  features?: string[];
  screenshotUrl?: string;
  videoUrl?: string;
}

const MODULE_GRADIENTS = {
  spider: 'from-indigo-900 via-slate-900 to-slate-900',
  market: 'from-teal-900 via-slate-900 to-slate-900',
  docket: 'from-blue-900 via-slate-900 to-slate-900',
  nexus: 'from-blue-950 via-slate-900 to-slate-950',
};

export function HeroSection({
  moduleCode,
  headline,
  subheadline,
  ctaPrimary,
  ctaSecondary,
  features,
  screenshotUrl,
  videoUrl,
}: HeroSectionProps) {
  return (
    <section className={cn(
      'relative min-h-[90vh] flex items-center pt-20 lg:pt-24',
      'bg-gradient-to-br',
      MODULE_GRADIENTS[moduleCode]
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJoLTRzLTIgMC00IDJjMCAyIDIgNCAyIDRzMiAyIDQgMmg0czItMiAyLTQiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-50" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight landing-animate-in">
              {headline}
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed landing-animate-in landing-animate-delay-1">
              {subheadline}
            </p>

            {/* Feature Pills */}
            {features && features.length > 0 && (
              <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3 landing-animate-in landing-animate-delay-2">
                {features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/90"
                  >
                    <Check className="w-4 h-4 text-green-400" />
                    {feature}
                  </span>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4 landing-animate-in landing-animate-delay-3">
              <Button
                size="lg"
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-6 text-lg rounded-xl shadow-lg shadow-blue-600/25"
              >
                <Link to={ctaPrimary.href}>
                  {ctaPrimary.text}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              
              {ctaSecondary && (
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="bg-transparent border-white/20 text-white hover:bg-white/10 font-medium px-8 py-6 text-lg rounded-xl"
                >
                  <Link to={ctaSecondary.href}>
                    <Play className="mr-2 w-5 h-5" />
                    {ctaSecondary.text}
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Screenshot/Video */}
          <div className="landing-animate-in landing-animate-delay-4">
            {videoUrl ? (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
                <video
                  src={videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-auto"
                />
              </div>
            ) : screenshotUrl ? (
              <div className="relative">
                <img
                  src={screenshotUrl}
                  alt="Product screenshot"
                  className="w-full h-auto rounded-2xl shadow-2xl shadow-black/50"
                />
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-blue-500/20 blur-3xl -z-10 rounded-3xl" />
              </div>
            ) : (
              <div className="relative aspect-[16/10] rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4">
                      <span className="text-3xl font-bold text-white">IP</span>
                    </div>
                    <p className="text-white/60">Screenshot del producto</p>
                  </div>
                </div>
                {/* Mock UI elements */}
                <div className="absolute top-4 left-4 right-4 h-8 bg-white/5 rounded-lg" />
                <div className="absolute bottom-4 left-4 right-4 h-12 bg-white/5 rounded-lg" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
