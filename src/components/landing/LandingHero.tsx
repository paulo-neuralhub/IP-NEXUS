// ============================================
// src/components/landing/LandingHero.tsx
// ============================================

import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LandingHeroProps {
  title: string;
  subtitle?: string | null;
  ctaText: string;
  ctaUrl?: string | null;
  secondaryCtaText?: string | null;
  secondaryCtaUrl?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  moduleCode: string;
}

const MODULE_GRADIENTS: Record<string, string> = {
  spider: 'from-purple-600 to-indigo-600',
  genius: 'from-amber-500 to-orange-500',
  docket: 'from-sky-500 to-blue-600',
  finance: 'from-teal-500 to-emerald-600',
};

const MODULE_BG_PATTERNS: Record<string, string> = {
  spider: 'bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-950/30 dark:to-indigo-950/30',
  genius: 'bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30',
  docket: 'bg-gradient-to-br from-sky-50 to-blue-100 dark:from-sky-950/30 dark:to-blue-950/30',
  finance: 'bg-gradient-to-br from-teal-50 to-emerald-100 dark:from-teal-950/30 dark:to-emerald-950/30',
};

export function LandingHero({
  title,
  subtitle,
  ctaText,
  ctaUrl,
  secondaryCtaText,
  secondaryCtaUrl,
  imageUrl,
  videoUrl,
  moduleCode,
}: LandingHeroProps) {
  const gradient = MODULE_GRADIENTS[moduleCode] || MODULE_GRADIENTS.docket;
  const bgPattern = MODULE_BG_PATTERNS[moduleCode] || MODULE_BG_PATTERNS.docket;

  return (
    <section className={`relative overflow-hidden ${bgPattern} py-20 lg:py-32`}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-3xl`} />
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-3xl`} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                {subtitle}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className={`bg-gradient-to-r ${gradient} hover:opacity-90 text-white shadow-lg`}
              >
                <Link to={ctaUrl || '/auth/register'}>
                  {ctaText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              {secondaryCtaText && secondaryCtaUrl && (
                <Button asChild size="lg" variant="outline">
                  <Link to={secondaryCtaUrl}>
                    {videoUrl && <Play className="mr-2 h-5 w-5" />}
                    {secondaryCtaText}
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            {videoUrl ? (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
                <video
                  src={videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full"
                />
              </div>
            ) : imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full"
                />
              </div>
            ) : (
              <div className={`relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br ${gradient} aspect-video flex items-center justify-center`}>
                <div className="text-white/20 text-9xl font-bold">
                  {moduleCode.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
