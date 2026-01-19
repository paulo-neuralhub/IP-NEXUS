// ============================================================
// IP-NEXUS HELP - CATEGORY CARD COMPONENT
// ============================================================

import { Link } from 'react-router-dom';
import { HelpCategory } from '@/types/help';
import { 
  BookOpen, 
  Zap, 
  Settings, 
  CreditCard, 
  Shield, 
  Users,
  Database,
  Target,
  Brain,
  TrendingUp,
  Mail,
  HelpCircle,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  'book-open': BookOpen,
  'zap': Zap,
  'settings': Settings,
  'credit-card': CreditCard,
  'shield': Shield,
  'users': Users,
  'database': Database,
  'target': Target,
  'brain': Brain,
  'trending-up': TrendingUp,
  'mail': Mail,
  'help-circle': HelpCircle,
};

interface HelpCategoryCardProps {
  category: HelpCategory;
  articleCount?: number;
  basePath?: string;
}

export function HelpCategoryCard({ 
  category, 
  articleCount = 0,
  basePath = '/app/help'
}: HelpCategoryCardProps) {
  const Icon = iconMap[category.icon || 'help-circle'] || HelpCircle;
  
  return (
    <Link
      to={`${basePath}/category/${category.slug}`}
      className="group block"
    >
      <div className={cn(
        "p-6 rounded-xl border border-border bg-card hover:border-primary/50",
        "hover:shadow-md transition-all duration-200"
      )}>
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
          style={{ backgroundColor: `${category.color || '#3B82F6'}20` }}
        >
          <Icon 
            className="h-6 w-6" 
            style={{ color: category.color || '#3B82F6' }}
          />
        </div>
        
        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors mb-2">
          {category.name}
        </h3>
        
        {category.description && (
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
            {category.description}
          </p>
        )}
        
        <p className="text-sm text-muted-foreground">
          {articleCount} {articleCount === 1 ? 'artículo' : 'artículos'}
        </p>
      </div>
    </Link>
  );
}
