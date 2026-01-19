// src/components/market/compliance/ComplianceChecklist.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ComplianceCheckItem {
  id: string;
  type: 'aml' | 'sanctions' | 'pep' | 'adverse_media';
  status: 'pending' | 'clear' | 'flagged' | 'blocked';
  lastChecked?: string;
  expiresAt?: string;
  provider?: string;
  details?: string;
}

interface ComplianceChecklistProps {
  checks: ComplianceCheckItem[];
  onRunCheck?: (type: string) => void;
  isLoading?: boolean;
}

const CHECK_CONFIG: Record<string, { 
  label: string; 
  description: string;
  icon: React.ReactNode;
}> = {
  aml: {
    label: 'AML / Blanqueo',
    description: 'Verificación anti-lavado de dinero',
    icon: '🏦',
  },
  sanctions: {
    label: 'Sanciones',
    description: 'Listas de sanciones internacionales (OFAC, EU, UN)',
    icon: '🚫',
  },
  pep: {
    label: 'PEP',
    description: 'Personas Expuestas Políticamente',
    icon: '🏛️',
  },
  adverse_media: {
    label: 'Medios Adversos',
    description: 'Noticias negativas y menciones en medios',
    icon: '📰',
  },
};

const STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  icon: React.ReactNode;
}> = {
  pending: {
    label: 'Pendiente',
    color: 'bg-muted text-muted-foreground',
    icon: <Clock className="w-4 h-4" />,
  },
  clear: {
    label: 'Sin alertas',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  flagged: {
    label: 'Requiere revisión',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  blocked: {
    label: 'Bloqueado',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: <XCircle className="w-4 h-4" />,
  },
};

export function ComplianceChecklist({ 
  checks, 
  onRunCheck, 
  isLoading = false 
}: ComplianceChecklistProps) {
  const allCheckTypes: Array<'aml' | 'sanctions' | 'pep' | 'adverse_media'> = ['aml', 'sanctions', 'pep', 'adverse_media'];
  
  const checkMap = new Map(checks.map(c => [c.type, c]));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Verificaciones de Compliance</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {allCheckTypes.map((type) => {
          const check = checkMap.get(type);
          const config = CHECK_CONFIG[type];
          const statusConfig = check ? STATUS_CONFIG[check.status] : STATUS_CONFIG.pending;

          return (
            <div 
              key={type}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{config.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{config.label}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{config.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {check?.lastChecked && (
                    <p className="text-xs text-muted-foreground">
                      Última: {format(new Date(check.lastChecked), 'dd MMM yyyy', { locale: es })}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={cn('gap-1', statusConfig.color)}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </Badge>
                
                {onRunCheck && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRunCheck(type)}
                    disabled={isLoading}
                    className="h-8 w-8"
                  >
                    <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
