import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, Wrench, Palette, Type, Image, Layers, Box, Music, 
  PenTool, Code, BookOpen, Music2, Brush, Globe, Flag, 
  Brain, Lock, Building, Briefcase, LucideIcon
} from 'lucide-react';
import { AssetType, ASSET_TYPE_CONFIG } from '@/types/market.types';
import { cn } from '@/lib/utils';

const ASSET_ICONS: Record<AssetType, LucideIcon> = {
  patent_invention: Lightbulb,
  patent_utility: Wrench,
  patent_design: Palette,
  trademark_word: Type,
  trademark_figurative: Image,
  trademark_mixed: Layers,
  trademark_3d: Box,
  trademark_sound: Music,
  industrial_design: PenTool,
  copyright_software: Code,
  copyright_literary: BookOpen,
  copyright_musical: Music2,
  copyright_artistic: Brush,
  domain_gtld: Globe,
  domain_cctld: Flag,
  know_how: Brain,
  trade_secret: Lock,
  trade_name: Building,
  portfolio: Briefcase,
};

const CATEGORY_COLORS: Record<string, string> = {
  industrial_property: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
  intellectual_property: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
  intangible_assets: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
};

interface AssetTypeBadgeProps {
  type: AssetType;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AssetTypeBadge({ 
  type, 
  showIcon = true, 
  showLabel = true, 
  size = 'md',
  className 
}: AssetTypeBadgeProps) {
  const config = ASSET_TYPE_CONFIG[type];
  if (!config) return null;
  
  const Icon = ASSET_ICONS[type];

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  };

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        CATEGORY_COLORS[config.category], 
        sizeClasses[size], 
        'inline-flex items-center gap-1 font-medium',
        className
      )}
    >
      {showIcon && Icon && <Icon className={iconSizes[size]} />}
      {showLabel && <span>{config.labelEs}</span>}
    </Badge>
  );
}
