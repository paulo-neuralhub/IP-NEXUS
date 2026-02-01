// ============================================================
// IP-NEXUS - SUMMARY DETAIL CARD
// Premium styling for review step summary cards
// ============================================================

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SummaryDetailCardProps {
  title: string;
  icon: React.ReactNode;
  step?: number;
  children: React.ReactNode;
  className?: string;
  accentColor?: 'blue' | 'purple' | 'green' | 'amber' | 'rose';
}

const ACCENT_COLORS = {
  blue: 'from-blue-500/10 to-transparent border-l-blue-500',
  purple: 'from-purple-500/10 to-transparent border-l-purple-500',
  green: 'from-emerald-500/10 to-transparent border-l-emerald-500',
  amber: 'from-amber-500/10 to-transparent border-l-amber-500',
  rose: 'from-rose-500/10 to-transparent border-l-rose-500',
};

export function SummaryDetailCard({
  title,
  icon,
  step,
  children,
  className,
  accentColor = 'blue',
}: SummaryDetailCardProps) {
  return (
    <Card className={cn(
      "overflow-hidden border-l-4 transition-all duration-200 hover:shadow-md",
      ACCENT_COLORS[accentColor],
      className
    )}>
      <CardHeader className={cn(
        "pb-3 bg-gradient-to-r",
        ACCENT_COLORS[accentColor].split(' ')[0],
        ACCENT_COLORS[accentColor].split(' ')[1]
      )}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span className="text-muted-foreground">{icon}</span>
            {title}
          </CardTitle>
          {step && (
            <Badge variant="outline" className="text-[10px] font-normal h-5">
              Paso {step}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-3">{children}</CardContent>
    </Card>
  );
}

interface InfoRowProps {
  label: string;
  value?: string | React.ReactNode;
  icon?: React.ReactNode;
}

export function InfoRow({ label, value, icon }: InfoRowProps) {
  return (
    <div className="flex justify-between items-start py-2 gap-4">
      <span className="text-muted-foreground text-sm flex items-center gap-2">
        {icon && <span className="text-muted-foreground/60">{icon}</span>}
        {label}
      </span>
      <span className="font-medium text-sm text-right flex-shrink-0">
        {value || <span className="text-muted-foreground/50">—</span>}
      </span>
    </div>
  );
}

interface ValidationBannerProps {
  isValid: boolean;
  validTitle?: string;
  validMessage?: string;
  invalidTitle?: string;
  invalidMessage?: string;
}

export function ValidationBanner({
  isValid,
  validTitle = 'Solicitud lista para presentar',
  validMessage = 'Todos los campos obligatorios están completos.',
  invalidTitle = 'Faltan datos obligatorios',
  invalidMessage = 'Revisa los pasos anteriores para completar la información necesaria.',
}: ValidationBannerProps) {
  return (
    <div className={cn(
      "flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200",
      isValid 
        ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800" 
        : "border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800"
    )}>
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
        isValid ? "bg-emerald-100 dark:bg-emerald-900" : "bg-amber-100 dark:bg-amber-900"
      )}>
        <svg
          className={cn(
            "h-5 w-5",
            isValid ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          {isValid ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          )}
        </svg>
      </div>
      <div>
        <p className={cn(
          "font-semibold",
          isValid ? "text-emerald-800 dark:text-emerald-200" : "text-amber-800 dark:text-amber-200"
        )}>
          {isValid ? validTitle : invalidTitle}
        </p>
        <p className={cn(
          "text-sm mt-0.5",
          isValid ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"
        )}>
          {isValid ? validMessage : invalidMessage}
        </p>
      </div>
    </div>
  );
}

interface InfoBannerProps {
  title: string;
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'success';
}

export function InfoBanner({ title, children, variant = 'info' }: InfoBannerProps) {
  const variantStyles = {
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
    warning: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
    success: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800',
  };

  const iconColors = {
    info: 'text-blue-600 dark:text-blue-400',
    warning: 'text-amber-600 dark:text-amber-400',
    success: 'text-emerald-600 dark:text-emerald-400',
  };

  const textColors = {
    info: 'text-blue-800 dark:text-blue-200',
    warning: 'text-amber-800 dark:text-amber-200',
    success: 'text-emerald-800 dark:text-emerald-200',
  };

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-xl border",
      variantStyles[variant]
    )}>
      <svg
        className={cn("h-5 w-5 mt-0.5 shrink-0", iconColors[variant])}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="text-sm">
        <p className={cn("font-semibold mb-1.5", textColors[variant])}>
          {title}
        </p>
        <div className={cn("space-y-1", textColors[variant].replace('800', '700').replace('200', '300'))}>
          {children}
        </div>
      </div>
    </div>
  );
}
