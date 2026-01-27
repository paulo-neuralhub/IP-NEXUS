import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Fallback data for when DB is not available
const FALLBACK_JURISDICTIONS: Record<string, { flag: string; name: string; country: string }> = {
  ES: { flag: '🇪🇸', name: 'OEPM', country: 'España' },
  EU: { flag: '🇪🇺', name: 'EUIPO', country: 'Unión Europea' },
  EM: { flag: '🇪🇺', name: 'EUIPO', country: 'Unión Europea' },
  FR: { flag: '🇫🇷', name: 'INPI', country: 'Francia' },
  DE: { flag: '🇩🇪', name: 'DPMA', country: 'Alemania' },
  GB: { flag: '🇬🇧', name: 'UKIPO', country: 'Reino Unido' },
  US: { flag: '🇺🇸', name: 'USPTO', country: 'Estados Unidos' },
  WO: { flag: '🌐', name: 'WIPO', country: 'Internacional' },
  EP: { flag: '🇪🇺', name: 'EPO', country: 'Europa (Patentes)' },
};

// Hook to get jurisdiction data from DB
function useJurisdictionData() {
  return useQuery({
    queryKey: ['jurisdiction-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ipo_offices')
        .select('code, name_short, name_official, country_code, country_name, flag_emoji')
        .eq('is_active', true);
      
      if (error) throw error;
      
      // Build map by both code and country_code
      const map: Record<string, { flag: string; name: string; country: string }> = {};
      data?.forEach(office => {
        const entry = {
          flag: office.flag_emoji || '🏳️',
          name: office.name_short || office.name_official,
          country: office.country_name || office.country_code
        };
        // Map by office code
        if (office.code) map[office.code] = entry;
        // Also map by country code if different
        if (office.country_code && office.country_code !== office.code) {
          map[office.country_code] = entry;
        }
      });
      
      return map;
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
  });
}

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
  const { data: jurisdictions } = useJurisdictionData();
  
  // Use DB data, fallback to hardcoded if not available
  const data = jurisdictions?.[jurisdiction] || FALLBACK_JURISDICTIONS[jurisdiction];
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
