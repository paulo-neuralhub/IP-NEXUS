// ============================================================
// IP-NEXUS - GRADIENT BACKGROUND COMPONENT
// L133: Premium gradient mesh background with animated orbs
// Creates the foundation for glassmorphism and WOW effect
// Now with full dark mode support
// ============================================================

import { cn } from '@/lib/utils';

interface GradientBackgroundProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'vibrant';
}

export function GradientBackground({
  children,
  className,
  variant = 'default',
}: GradientBackgroundProps) {
  const orbOpacity = {
    default: { blue: 'opacity-30', purple: 'opacity-25', emerald: 'opacity-20' },
    subtle: { blue: 'opacity-15', purple: 'opacity-12', emerald: 'opacity-10' },
    vibrant: { blue: 'opacity-40', purple: 'opacity-35', emerald: 'opacity-30' },
  };

  const opacity = orbOpacity[variant];

  return (
    <div className={cn(
      "relative min-h-screen overflow-hidden",
      "bg-gradient-to-br from-slate-50 via-background to-blue-50/30",
      "dark:from-slate-950 dark:via-slate-900 dark:to-slate-950",
      className
    )}>
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Blue orb - top right */}
        <div
          className={cn(
            "absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full",
            "bg-gradient-to-br from-blue-400/60 via-blue-500/40 to-indigo-500/30",
            "dark:from-blue-500/40 dark:via-blue-600/30 dark:to-indigo-600/20",
            "blur-[100px] animate-pulse-slow",
            opacity.blue
          )}
        />

        {/* Purple orb - bottom left */}
        <div
          className={cn(
            "absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full",
            "bg-gradient-to-tr from-purple-500/50 via-violet-400/40 to-pink-400/30",
            "dark:from-purple-600/40 dark:via-violet-500/30 dark:to-pink-500/20",
            "blur-[100px] animate-pulse-slow animation-delay-2000",
            opacity.purple
          )}
        />

        {/* Emerald orb - center (subtle) */}
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full",
            "bg-gradient-to-br from-emerald-400/30 via-teal-400/20 to-cyan-400/20",
            "dark:from-emerald-500/25 dark:via-teal-500/15 dark:to-cyan-500/15",
            "blur-[120px] animate-pulse-slow animation-delay-4000",
            opacity.emerald
          )}
        />
      </div>

      {/* Content layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Glass Card Component for use on gradient backgrounds
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'none';
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  glowColor = 'none',
  hover = true,
}: GlassCardProps) {
  const glowStyles = {
    primary: 'shadow-[0_20px_50px_-12px_rgba(59,130,246,0.25)]',
    success: 'shadow-[0_20px_50px_-12px_rgba(16,185,129,0.25)]',
    warning: 'shadow-[0_20px_50px_-12px_rgba(249,115,22,0.25)]',
    danger: 'shadow-[0_20px_50px_-12px_rgba(239,68,68,0.25)]',
    purple: 'shadow-[0_20px_50px_-12px_rgba(147,51,234,0.25)]',
    none: 'shadow-xl shadow-black/5 dark:shadow-black/20',
  };

  return (
    <div
      className={cn(
        // Glass effect base - light mode
        "bg-white/70 backdrop-blur-xl",
        "border border-white/60",
        // Glass effect - dark mode
        "dark:bg-slate-900/70 dark:border-slate-700/60",
        "rounded-2xl",
        // Inner glow effect
        "ring-1 ring-white/30 dark:ring-white/10",
        // Shadow
        glowStyles[glowColor],
        // Hover effects
        hover && "transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-900/80 hover:shadow-2xl hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
}

// Gradient Icon Container
interface GradientIconProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'blue' | 'purple' | 'amber' | 'emerald' | 'rose' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function GradientIcon({
  children,
  className,
  variant = 'blue',
  size = 'md',
}: GradientIconProps) {
  const gradientStyles = {
    blue: 'from-blue-500 via-blue-600 to-indigo-600 shadow-blue-500/40',
    purple: 'from-violet-500 via-purple-500 to-indigo-500 shadow-purple-500/40',
    amber: 'from-amber-500 via-orange-500 to-red-500 shadow-orange-500/40',
    emerald: 'from-emerald-500 via-green-500 to-teal-500 shadow-emerald-500/40',
    rose: 'from-pink-500 via-rose-500 to-red-500 shadow-pink-500/40',
    danger: 'from-orange-500 via-red-500 to-rose-600 shadow-red-500/40',
  };

  const sizeStyles = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-14 h-14 text-xl',
  };

  return (
    <div
      className={cn(
        "relative rounded-xl flex items-center justify-center",
        "bg-gradient-to-br text-white",
        "shadow-lg",
        gradientStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {/* Inner highlight */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
