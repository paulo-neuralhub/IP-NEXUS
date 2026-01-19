// src/components/market/kyc/KycLevelBadge.tsx
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, ShieldAlert, Star, Crown, Award } from 'lucide-react';
import { KycLevel, KYC_LEVELS } from '@/types/kyc.types';
import { cn } from '@/lib/utils';

interface KycLevelBadgeProps {
  level: KycLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const LEVEL_ICONS = {
  0: Shield,
  1: Shield,
  2: ShieldCheck,
  3: ShieldAlert,
  4: Crown,
  5: Award,
};

const LEVEL_COLORS = {
  0: 'bg-gray-100 text-gray-600 border-gray-200',
  1: 'bg-blue-100 text-blue-700 border-blue-200',
  2: 'bg-green-100 text-green-700 border-green-200',
  3: 'bg-purple-100 text-purple-700 border-purple-200',
  4: 'bg-amber-100 text-amber-700 border-amber-200',
  5: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

export function KycLevelBadge({ level, size = 'md', showLabel = true }: KycLevelBadgeProps) {
  const config = KYC_LEVELS[level];
  const Icon = LEVEL_ICONS[level];
  const colors = LEVEL_COLORS[level];

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium border flex items-center gap-1',
        colors,
        sizeClasses[size]
      )}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{config.label.es}</span>}
    </Badge>
  );
}
