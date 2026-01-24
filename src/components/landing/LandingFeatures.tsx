// ============================================
// src/components/landing/LandingFeatures.tsx
// ============================================

import { 
  Radar, Bell, Shield, BarChart3, Brain, FileText, Search, Globe,
  Folder, Calendar, Users, Zap, TrendingUp, FileCheck, RefreshCw, BarChart2,
  LucideIcon
} from 'lucide-react';
import { LandingFeature } from '@/hooks/useLandingPage';

interface LandingFeaturesProps {
  features: LandingFeature[];
  moduleCode: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  radar: Radar,
  bell: Bell,
  shield: Shield,
  chart: BarChart3,
  brain: Brain,
  'file-text': FileText,
  search: Search,
  globe: Globe,
  folder: Folder,
  calendar: Calendar,
  users: Users,
  zap: Zap,
  'trending-up': TrendingUp,
  'file-check': FileCheck,
  'refresh-cw': RefreshCw,
  'bar-chart': BarChart2,
};

const MODULE_COLORS: Record<string, string> = {
  spider: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
  genius: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
  docket: 'text-sky-600 bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400',
  finance: 'text-teal-600 bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400',
};

export function LandingFeatures({ features, moduleCode }: LandingFeaturesProps) {
  const colorClass = MODULE_COLORS[moduleCode] || MODULE_COLORS.docket;

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Características principales
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Todo lo que necesitas para gestionar tu propiedad intelectual de forma eficiente
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = ICON_MAP[feature.icon] || Shield;
            return (
              <div
                key={index}
                className="group p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-xl ${colorClass} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
                {feature.image_url && (
                  <img
                    src={feature.image_url}
                    alt={feature.title}
                    className="mt-4 rounded-lg border"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
