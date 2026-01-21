import { 
  Award, Crown, Medal, TrendingUp, Zap, Shield, Star, Gem, ThumbsUp, 
  CheckCircle, Tag, FileText, Globe, Flag, Sparkles, ArrowUp, Activity, 
  BadgeCheck, Languages 
} from 'lucide-react';
import { BadgeType, BADGE_DETAILS, TIER_COLORS } from '@/types/rankings';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Crown, Medal, Award, TrendingUp, Zap, Shield, Star, Gem, ThumbsUp,
  CheckCircle, Tag, FileText, Globe, Flag, Sparkles, ArrowUp, Activity,
  BadgeCheck, Languages, Bolt: Zap, Gavel: Shield
};

interface BadgeDisplayProps {
  badges: (BadgeType | string)[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export function BadgeDisplay({ 
  badges, 
  maxDisplay = 5, 
  size = 'md',
}: BadgeDisplayProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const validBadges = badges.filter(b => BADGE_DETAILS[b as BadgeType]) as BadgeType[];
  const displayBadges = validBadges.slice(0, maxDisplay);
  const remainingCount = validBadges.length - maxDisplay;

  if (validBadges.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5 flex-wrap">
        {displayBadges.map((badge) => {
          const details = BADGE_DETAILS[badge];
          if (!details) return null;
          
          const IconComponent = ICON_MAP[details.icon] || Award;
          
          return (
            <Tooltip key={badge}>
              <TooltipTrigger asChild>
                <div className={cn(
                  "rounded-full border flex items-center justify-center cursor-help",
                  sizeClasses[size],
                  TIER_COLORS[details.tier]
                )}>
                  <IconComponent className={iconSizes[size]} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <div className="font-semibold">{details.labelEs}</div>
                  <div className="text-xs text-muted-foreground">{details.descriptionEs}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
        
        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium cursor-help",
                sizeClasses[size]
              )}>
                +{remainingCount}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                {validBadges.slice(maxDisplay).map((badge) => (
                  <div key={badge} className="text-sm">
                    {BADGE_DETAILS[badge]?.labelEs}
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
