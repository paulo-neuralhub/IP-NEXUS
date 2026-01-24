/**
 * Market Stats Component
 * Key metrics displayed in financial terminal style
 */

import { Card, CardContent } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  Clock, 
  CheckCircle,
  FileText,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatItem {
  label: string;
  value: string | number;
  change?: number; // percentage
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface MarketStatsProps {
  stats?: StatItem[];
  isLoading?: boolean;
  className?: string;
}

// Mock stats for demo
const MOCK_STATS: StatItem[] = [
  { 
    label: 'Solicitudes Hoy', 
    value: 23, 
    change: 15, 
    changeLabel: 'vs ayer',
    icon: FileText, 
    color: 'text-emerald-400' 
  },
  { 
    label: 'Completadas (mes)', 
    value: 156, 
    change: 8, 
    changeLabel: 'vs mes ant.',
    icon: CheckCircle, 
    color: 'text-green-400' 
  },
  { 
    label: 'Tiempo Medio', 
    value: '4.2 días', 
    change: -12, 
    changeLabel: 'mejora',
    icon: Clock, 
    color: 'text-blue-400' 
  },
  { 
    label: 'Agentes Activos', 
    value: 89, 
    change: 5, 
    changeLabel: 'nuevos',
    icon: Users, 
    color: 'text-purple-400' 
  },
  { 
    label: 'Volumen (mes)', 
    value: '€245K', 
    change: 22, 
    changeLabel: 'vs mes ant.',
    icon: TrendingUp, 
    color: 'text-amber-400' 
  },
  { 
    label: 'Tasa Éxito', 
    value: '94.8%', 
    change: 2.3, 
    changeLabel: 'mejora',
    icon: Zap, 
    color: 'text-cyan-400' 
  },
];

export function MarketStats({ 
  stats = MOCK_STATS, 
  isLoading = false,
  className 
}: MarketStatsProps) {
  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3', className)}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="bg-[#0d0d12] border-white/10">
            <CardContent className="p-4">
              <div className="h-16 bg-white/5 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3', className)}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isPositiveChange = stat.change !== undefined && stat.change > 0;
        const isNegativeChange = stat.change !== undefined && stat.change < 0;
        
        // For time-related stats, negative change is good (improvement)
        const isImprovement = stat.label.includes('Tiempo') ? isNegativeChange : isPositiveChange;

        return (
          <Card 
            key={index} 
            className="bg-[#0d0d12] border-white/10 hover:border-white/20 transition-colors"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={cn('h-5 w-5', stat.color)} />
                {stat.change !== undefined && (
                  <div className={cn(
                    'flex items-center gap-1 text-xs font-mono',
                    isImprovement ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {isImprovement ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(stat.change)}%
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white font-mono">
                  {stat.value}
                </p>
                <p className="text-xs text-white/50">
                  {stat.label}
                </p>
                {stat.changeLabel && (
                  <p className="text-[10px] text-white/30">
                    {stat.changeLabel}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
