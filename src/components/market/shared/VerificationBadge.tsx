import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Shield, ShieldCheck, ShieldAlert, Clock, LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type VerificationStatus = 'verified' | 'pending' | 'unverified' | 'official';

const STATUS_CONFIG: Record<VerificationStatus, {
  icon: LucideIcon;
  color: string;
  label: string;
  tooltip: string;
}> = {
  verified: {
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    label: 'Verificado',
    tooltip: 'Verificado por IP-NEXUS',
  },
  pending: {
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    label: 'Pendiente',
    tooltip: 'Verificación en proceso',
  },
  unverified: {
    icon: ShieldAlert,
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    label: 'Sin verificar',
    tooltip: 'No verificado',
  },
  official: {
    icon: ShieldCheck,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    label: 'Oficial',
    tooltip: 'Verificado con registros oficiales',
  },
};

interface VerificationBadgeProps {
  status: VerificationStatus;
  officeName?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function VerificationBadge({ 
  status, 
  officeName, 
  showLabel = true, 
  size = 'md',
  className 
}: VerificationBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  };

  const tooltipText = officeName ? `${config.tooltip} (${officeName})` : config.tooltip;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="secondary" 
          className={cn(
            config.color, 
            sizeClasses[size], 
            'inline-flex items-center gap-1 cursor-help',
            className
          )}
        >
          <Icon className={iconSizes[size]} />
          {showLabel && <span>{config.label}</span>}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
}
