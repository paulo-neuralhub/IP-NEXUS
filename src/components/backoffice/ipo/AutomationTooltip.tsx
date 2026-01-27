// src/components/backoffice/ipo/AutomationTooltip.tsx
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertTriangle, Bot, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const AUTOMATION_LEVELS = {
  A: { label: 'Nivel A', percentage: 100, color: 'bg-green-500', description: '100% Automatizado' },
  B: { label: 'Nivel B', percentage: 75, color: 'bg-emerald-500', description: '75% Automatizado' },
  C: { label: 'Nivel C', percentage: 50, color: 'bg-yellow-500', description: '50% Automatizado' },
  D: { label: 'Nivel D', percentage: 25, color: 'bg-orange-500', description: '25% Automatizado' },
  E: { label: 'Nivel E', percentage: 0, color: 'bg-red-500', description: '0% Automatizado' },
} as const;

interface Capability {
  available: boolean;
  method: 'api' | 'web' | 'manual';
  notes?: string;
}

interface AutomationTooltipProps {
  officeCode: string;
  officeName: string;
  flagEmoji?: string;
  automationLevel: 'A' | 'B' | 'C' | 'D' | 'E';
  automationPercentage: number;
  capabilities?: {
    filing?: Capability;
    search?: Capability;
    payment?: Capability;
    documentUpload?: Capability;
    statusTracking?: Capability;
    renewal?: Capability;
    opposition?: Capability;
    niceClassification?: Capability;
  };
  lastSyncAt?: string | null;
  lastSyncType?: string | null;
  syncFrequency?: string;
  children: React.ReactNode;
}

const CAPABILITY_LABELS: Record<string, string> = {
  filing: 'Filing de solicitudes',
  search: 'Búsqueda de marcas',
  payment: 'Pagos online',
  documentUpload: 'Subida de documentos',
  statusTracking: 'Seguimiento de expedientes',
  renewal: 'Renovaciones',
  opposition: 'Oposiciones',
  niceClassification: 'Clasificación Nice automática',
};

export function AutomationTooltip({
  officeCode,
  officeName,
  flagEmoji = '🏛️',
  automationLevel,
  automationPercentage,
  capabilities = {},
  lastSyncAt,
  lastSyncType,
  syncFrequency = 'manual',
  children,
}: AutomationTooltipProps) {
  const levelConfig = AUTOMATION_LEVELS[automationLevel];
  
  const automatedCapabilities = Object.entries(capabilities)
    .filter(([_, cap]) => cap?.available && cap?.method === 'api');
  
  const webCapabilities = Object.entries(capabilities)
    .filter(([_, cap]) => cap?.available && cap?.method === 'web');
    
  const manualCapabilities = Object.entries(capabilities)
    .filter(([_, cap]) => !cap?.available || cap?.method === 'manual');

  const getSyncTypeIcon = (type?: string | null) => {
    if (type === 'automatic' || type === 'scheduled') return <Bot className="h-3.5 w-3.5" />;
    return <Clock className="h-3.5 w-3.5" />;
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          align="start"
          className="w-80 p-0 bg-card border shadow-xl"
        >
          {/* Header */}
          <div className="p-3 border-b bg-muted/30">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{flagEmoji}</span>
              <span className="font-semibold text-foreground">{officeCode}</span>
              <span className="text-muted-foreground">-</span>
              <Badge className={cn(
                'text-xs font-medium',
                automationLevel === 'A' && 'bg-green-500/20 text-green-700 border-green-200',
                automationLevel === 'B' && 'bg-emerald-500/20 text-emerald-700 border-emerald-200',
                automationLevel === 'C' && 'bg-yellow-500/20 text-yellow-700 border-yellow-200',
                automationLevel === 'D' && 'bg-orange-500/20 text-orange-700 border-orange-200',
                automationLevel === 'E' && 'bg-red-500/20 text-red-700 border-red-200',
              )}>
                {levelConfig.label} ({automationPercentage}%)
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">{officeName}</p>
          </div>
          
          {/* Automated capabilities */}
          {automatedCapabilities.length > 0 && (
            <div className="p-3 border-b">
              <div className="flex items-center gap-2 text-xs font-medium text-green-600 mb-2">
                <Check className="h-3.5 w-3.5" />
                AUTOMATIZADO DESDE IP-NEXUS:
              </div>
              <ul className="space-y-1">
                {automatedCapabilities.map(([key, cap]) => (
                  <li key={key} className="flex items-start gap-2 text-sm">
                    <Check className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                    <span>
                      {CAPABILITY_LABELS[key] || key}
                      {cap?.notes && (
                        <span className="text-muted-foreground ml-1">({cap.notes})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Web-based capabilities */}
          {webCapabilities.length > 0 && (
            <div className="p-3 border-b">
              <div className="flex items-center gap-2 text-xs font-medium text-yellow-600 mb-2">
                <AlertTriangle className="h-3.5 w-3.5" />
                VÍA WEB (parcialmente automatizado):
              </div>
              <ul className="space-y-1">
                {webCapabilities.map(([key, cap]) => (
                  <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 mt-0.5 shrink-0" />
                    <span>
                      {CAPABILITY_LABELS[key] || key}
                      {cap?.notes && <span className="ml-1">({cap.notes})</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Manual capabilities */}
          {manualCapabilities.length > 0 && (
            <div className="p-3 border-b">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                <X className="h-3.5 w-3.5" />
                REQUIERE ACCIÓN MANUAL:
              </div>
              <ul className="space-y-1">
                {manualCapabilities.map(([key, cap]) => (
                  <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <X className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <span>
                      {CAPABILITY_LABELS[key] || key}
                      {cap?.notes && <span className="ml-1">({cap.notes})</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sync info */}
          <div className="p-3 bg-muted/20 text-xs space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                Última actualización: {lastSyncAt 
                  ? formatDistanceToNow(new Date(lastSyncAt), { addSuffix: true, locale: es })
                  : 'Nunca'
                }
              </span>
            </div>
            {lastSyncType && (
              <div className="flex items-center gap-2 text-muted-foreground">
                {getSyncTypeIcon(lastSyncType)}
                <span>Tipo: {lastSyncType === 'automatic' ? 'Automática (workflow)' : 'Manual'}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Frecuencia: {
                syncFrequency === 'realtime' ? 'Tiempo real' :
                syncFrequency === 'hourly' ? 'Cada hora' :
                syncFrequency === 'daily' ? 'Diaria' :
                syncFrequency === 'weekly' ? 'Semanal' :
                'Manual'
              }</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
