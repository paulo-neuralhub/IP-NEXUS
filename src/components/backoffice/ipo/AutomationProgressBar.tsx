// src/components/backoffice/ipo/AutomationProgressBar.tsx
import { cn } from '@/lib/utils';

const AUTOMATION_LEVELS = {
  A: { label: 'Nivel A', percentage: 100, color: 'bg-green-500', description: '100% Automatizado' },
  B: { label: 'Nivel B', percentage: 75, color: 'bg-emerald-500', description: '75% Automatizado' },
  C: { label: 'Nivel C', percentage: 50, color: 'bg-yellow-500', description: '50% Automatizado' },
  D: { label: 'Nivel D', percentage: 25, color: 'bg-orange-500', description: '25% Automatizado' },
  E: { label: 'Nivel E', percentage: 0, color: 'bg-red-500', description: '0% Automatizado' },
} as const;

interface AutomationProgressBarProps {
  level: 'A' | 'B' | 'C' | 'D' | 'E';
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function AutomationProgressBar({ 
  level, 
  percentage, 
  size = 'md',
  showLabel = true 
}: AutomationProgressBarProps) {
  const config = AUTOMATION_LEVELS[level];
  
  const getProgressColor = (pct: number) => {
    if (pct >= 90) return 'bg-green-500';
    if (pct >= 70) return 'bg-emerald-500';
    if (pct >= 40) return 'bg-yellow-500';
    if (pct >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        'flex-1 bg-muted rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div 
          className={cn(
            'h-full rounded-full transition-all duration-300',
            getProgressColor(percentage)
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn(
          'font-medium tabular-nums',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base',
          percentage >= 90 && 'text-green-600',
          percentage >= 70 && percentage < 90 && 'text-emerald-600',
          percentage >= 40 && percentage < 70 && 'text-yellow-600',
          percentage >= 20 && percentage < 40 && 'text-orange-600',
          percentage < 20 && 'text-red-600',
        )}>
          {percentage}%
        </span>
      )}
    </div>
  );
}

// Circular version
interface CircularAutomationProps {
  level: 'A' | 'B' | 'C' | 'D' | 'E';
  percentage: number;
  size?: number;
}

export function CircularAutomation({ level, percentage, size = 40 }: CircularAutomationProps) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = (pct: number) => {
    if (pct >= 90) return '#22c55e'; // green-500
    if (pct >= 70) return '#10b981'; // emerald-500
    if (pct >= 40) return '#eab308'; // yellow-500
    if (pct >= 20) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="none"
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={getColor(percentage)}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-300"
        />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color: getColor(percentage) }}>
        {level}
      </span>
    </div>
  );
}
