import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const JURISDICTION_DATA: Record<string, { flag: string; name: string; country: string }> = {
  ES: { flag: '🇪🇸', name: 'OEPM', country: 'España' },
  EU: { flag: '🇪🇺', name: 'EUIPO', country: 'Unión Europea' },
  FR: { flag: '🇫🇷', name: 'INPI', country: 'Francia' },
  DE: { flag: '🇩🇪', name: 'DPMA', country: 'Alemania' },
  GB: { flag: '🇬🇧', name: 'UKIPO', country: 'Reino Unido' },
  US: { flag: '🇺🇸', name: 'USPTO', country: 'Estados Unidos' },
  MX: { flag: '🇲🇽', name: 'IMPI', country: 'México' },
  BR: { flag: '🇧🇷', name: 'INPI', country: 'Brasil' },
  CL: { flag: '🇨🇱', name: 'INAPI', country: 'Chile' },
  PE: { flag: '🇵🇪', name: 'INDECOPI', country: 'Perú' },
  CO: { flag: '🇨🇴', name: 'SIC', country: 'Colombia' },
  AR: { flag: '🇦🇷', name: 'INPI', country: 'Argentina' },
  WO: { flag: '🌐', name: 'WIPO', country: 'Internacional' },
  EPO: { flag: '🇪🇺', name: 'EPO', country: 'Europa (Patentes)' },
  CN: { flag: '🇨🇳', name: 'CNIPA', country: 'China' },
  JP: { flag: '🇯🇵', name: 'JPO', country: 'Japón' },
  KR: { flag: '🇰🇷', name: 'KIPO', country: 'Corea del Sur' },
  IN: { flag: '🇮🇳', name: 'IPO', country: 'India' },
  AU: { flag: '🇦🇺', name: 'IP Australia', country: 'Australia' },
  CA: { flag: '🇨🇦', name: 'CIPO', country: 'Canadá' },
};

interface JurisdictionFlagProps {
  jurisdiction: string;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function JurisdictionFlag({ 
  jurisdiction, 
  showName = true, 
  size = 'md',
  className 
}: JurisdictionFlagProps) {
  const data = JURISDICTION_DATA[jurisdiction];
  const flag = data?.flag || '🏳️';

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (!data) {
    return (
      <span className={cn('inline-flex items-center gap-1', sizeClasses[size], className)}>
        {flag} {showName && jurisdiction}
      </span>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn('inline-flex items-center gap-1 cursor-help', sizeClasses[size], className)}>
          <span>{flag}</span>
          {showName && <span>{data.name}</span>}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{data.name}</p>
        <p className="text-xs text-muted-foreground">{data.country}</p>
      </TooltipContent>
    </Tooltip>
  );
}
