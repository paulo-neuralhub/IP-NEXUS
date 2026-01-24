/**
 * Jurisdiction Grid Component
 * Shows agent count by jurisdiction
 * Financial terminal style
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JurisdictionData {
  code: string;
  name: string;
  flag: string;
  agentCount: number;
  requestsThisWeek: number;
  change?: number;
}

interface JurisdictionGridProps {
  jurisdictions?: JurisdictionData[];
  isLoading?: boolean;
  className?: string;
}

// Mock data for demo
const MOCK_JURISDICTIONS: JurisdictionData[] = [
  { code: 'ES', name: 'España', flag: '🇪🇸', agentCount: 45, requestsThisWeek: 23, change: 12 },
  { code: 'EU', name: 'Unión Europea', flag: '🇪🇺', agentCount: 38, requestsThisWeek: 31, change: 8 },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', agentCount: 22, requestsThisWeek: 15, change: -3 },
  { code: 'CN', name: 'China', flag: '🇨🇳', agentCount: 18, requestsThisWeek: 9, change: 25 },
  { code: 'JP', name: 'Japón', flag: '🇯🇵', agentCount: 12, requestsThisWeek: 6, change: 5 },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧', agentCount: 15, requestsThisWeek: 8, change: -2 },
  { code: 'DE', name: 'Alemania', flag: '🇩🇪', agentCount: 14, requestsThisWeek: 7, change: 10 },
  { code: 'FR', name: 'Francia', flag: '🇫🇷', agentCount: 11, requestsThisWeek: 5, change: 0 },
];

export function JurisdictionGrid({ 
  jurisdictions = MOCK_JURISDICTIONS, 
  isLoading = false,
  className 
}: JurisdictionGridProps) {
  if (isLoading) {
    return (
      <Card className={cn('bg-[#0d0d12] border-white/10', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-400" />
            Por Jurisdicción
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-12 bg-white/5 animate-pulse rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-[#0d0d12] border-white/10', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-400" />
          Por Jurisdicción
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-1 p-2">
        {jurisdictions.map((j) => (
          <Link
            key={j.code}
            to={`/app/market?jurisdiction=${j.code}`}
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-white/5 transition-colors"
          >
            <span className="text-lg">{j.flag}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-white font-mono text-sm">{j.code}</span>
                {j.change !== undefined && j.change !== 0 && (
                  <span className={cn(
                    'text-[10px] flex items-center',
                    j.change > 0 ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {j.change > 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                  </span>
                )}
              </div>
              <p className="text-white/50 text-[10px] truncate">{j.name}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-mono text-sm">{j.agentCount}</p>
              <p className="text-white/30 text-[10px]">agentes</p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
