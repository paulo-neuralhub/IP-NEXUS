import { Crown, Medal, Award, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankBadgeProps {
  position: number;
  percentile?: number;
  change?: number;
  size?: 'sm' | 'md' | 'lg';
  showChange?: boolean;
}

export function RankBadge({ 
  position, 
  percentile, 
  change = 0,
  size = 'md',
  showChange = true 
}: RankBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Top 3 special styling
  if (position <= 3) {
    const colors: Record<number, string> = {
      1: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white',
      2: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800',
      3: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white',
    };
    
    const Icon = position === 1 ? Crown : Medal;
    
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-bold shadow-sm",
        colors[position],
        sizeClasses[size]
      )}>
        <Icon className={iconSizes[size]} />
        <span>#{position}</span>
        {showChange && change !== 0 && (
          <span className={cn(
            "ml-1",
            change > 0 ? "text-green-200" : "text-red-200"
          )}>
            {change > 0 ? `↑${change}` : `↓${Math.abs(change)}`}
          </span>
        )}
      </div>
    );
  }
  
  // Top 10
  if (position <= 10) {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        "bg-purple-100 text-purple-700",
        sizeClasses[size]
      )}>
        <Award className={iconSizes[size]} />
        <span>#{position}</span>
        {showChange && change !== 0 && (
          <span className={change > 0 ? "text-green-600" : "text-red-600"}>
            {change > 0 ? `↑${change}` : `↓${Math.abs(change)}`}
          </span>
        )}
      </div>
    );
  }
  
  // Top percentile
  if (percentile && percentile <= 10) {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        "bg-blue-100 text-blue-700",
        sizeClasses[size]
      )}>
        <TrendingUp className={iconSizes[size]} />
        <span>Top {percentile.toFixed(0)}%</span>
      </div>
    );
  }
  
  // Regular position
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-medium",
      "bg-gray-100 text-gray-600",
      sizeClasses[size]
    )}>
      <span>#{position}</span>
      {showChange && change !== 0 && (
        <span className={change > 0 ? "text-green-600" : "text-red-600"}>
          {change > 0 ? `↑${change}` : `↓${Math.abs(change)}`}
        </span>
      )}
    </div>
  );
}
