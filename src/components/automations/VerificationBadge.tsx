// ============================================================
// IP-NEXUS - VERIFICATION BADGE
// Shows verification status of legal deadlines
// ============================================================

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface VerificationBadgeProps {
  date: string;
  showLabel?: boolean;
}

export function VerificationBadge({ date, showLabel = false }: VerificationBadgeProps) {
  const verifiedDate = new Date(date);
  const daysSince = differenceInDays(new Date(), verifiedDate);
  
  // Determine status based on age
  let status: 'verified' | 'outdated' | 'stale';
  let statusColor: string;
  let Icon: React.ElementType;
  let statusText: string;

  if (daysSince <= 90) {
    status = 'verified';
    statusColor = 'text-green-600 bg-green-50 border-green-200';
    Icon = CheckCircle2;
    statusText = 'Verificado';
  } else if (daysSince <= 180) {
    status = 'stale';
    statusColor = 'text-amber-600 bg-amber-50 border-amber-200';
    Icon = Clock;
    statusText = 'Revisar pronto';
  } else {
    status = 'outdated';
    statusColor = 'text-red-600 bg-red-50 border-red-200';
    Icon = AlertCircle;
    statusText = 'Requiere verificación';
  }

  const formattedDate = format(verifiedDate, "d MMM yyyy", { locale: es });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={cn(
              "gap-1 cursor-help",
              statusColor
            )}
          >
            <Icon className="h-3 w-3" />
            {showLabel ? statusText : formattedDate}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{statusText}</p>
          <p className="text-xs text-muted-foreground">
            Última verificación: {formattedDate}
          </p>
          {status === 'outdated' && (
            <p className="text-xs text-red-600 mt-1">
              Han pasado más de 6 meses desde la última verificación
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
