// ============================================
// src/components/legal-ops/DocumentValidityBadge.tsx
// ============================================

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CheckCircle, AlertTriangle, XCircle, HelpCircle, Clock } from 'lucide-react';
import { DocValidityStatus } from '@/types/legal-ops';

interface DocumentValidityBadgeProps {
  status: DocValidityStatus;
  daysRemaining?: number | null;
  verified?: boolean;
}

export function DocumentValidityBadge({ 
  status, 
  daysRemaining, 
  verified 
}: DocumentValidityBadgeProps) {
  const config: Record<DocValidityStatus, { 
    icon: React.ReactNode; 
    label: string; 
    className: string 
  }> = {
    valid: {
      icon: <CheckCircle className="w-3 h-3" />,
      label: 'Vigente',
      className: 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
    },
    expiring_soon: {
      icon: <AlertTriangle className="w-3 h-3" />,
      label: daysRemaining ? `Caduca en ${daysRemaining}d` : 'Próximo a caducar',
      className: 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400'
    },
    expired: {
      icon: <XCircle className="w-3 h-3" />,
      label: 'Caducado',
      className: 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
    },
    pending_verification: {
      icon: <HelpCircle className="w-3 h-3" />,
      label: 'Sin verificar',
      className: 'bg-muted text-muted-foreground hover:bg-muted/80'
    },
    revoked: {
      icon: <XCircle className="w-3 h-3" />,
      label: 'Revocado',
      className: 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
    }
  };

  const { icon, label, className } = config[status] || config.pending_verification;

  const tooltipContent = verified 
    ? `Vigencia verificada manualmente`
    : status === 'pending_verification'
      ? 'Vigencia pendiente de verificar por un profesional'
      : 'Vigencia extraída automáticamente por IA - Verificar antes de confiar';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className={`${className} cursor-help gap-1`}>
            {icon}
            <span>{label}</span>
            {!verified && status !== 'pending_verification' && (
              <Clock className="w-2.5 h-2.5 opacity-70" />
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-xs">{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
