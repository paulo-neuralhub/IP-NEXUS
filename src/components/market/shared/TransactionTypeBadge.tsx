import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, GitBranch, ArrowLeftRight, Lock, Unlock, 
  Repeat, Store, Calendar, Gavel, FileSearch, Handshake, Scale,
  LucideIcon
} from 'lucide-react';
import { TransactionType, TRANSACTION_TYPE_CONFIG } from '@/types/market.types';
import { cn } from '@/lib/utils';

const TRANSACTION_ICONS: Record<TransactionType, LucideIcon> = {
  full_sale: ShoppingCart,
  partial_assignment: GitBranch,
  swap: ArrowLeftRight,
  exclusive_license: Lock,
  non_exclusive_license: Unlock,
  cross_license: Repeat,
  franchise: Store,
  option_to_buy: Calendar,
  auction: Gavel,
  rfp: FileSearch,
  coexistence: Handshake,
  settlement: Scale,
};

const CATEGORY_COLORS: Record<string, string> = {
  transfer: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-800',
  license: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800',
  auction: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-200 dark:border-orange-800',
  agreement: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
};

interface TransactionTypeBadgeProps {
  type: TransactionType;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TransactionTypeBadge({ 
  type, 
  showIcon = true, 
  size = 'md',
  className 
}: TransactionTypeBadgeProps) {
  const config = TRANSACTION_TYPE_CONFIG[type];
  if (!config) return null;
  
  const Icon = TRANSACTION_ICONS[type];

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        CATEGORY_COLORS[config.category], 
        sizeClasses[size], 
        'inline-flex items-center gap-1 font-medium',
        className
      )}
    >
      {showIcon && Icon && <Icon className="h-3.5 w-3.5" />}
      <span>{config.labelEs}</span>
    </Badge>
  );
}
