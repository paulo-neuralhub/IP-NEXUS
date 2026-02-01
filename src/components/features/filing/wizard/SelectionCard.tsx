// ============================================================
// IP-NEXUS - SELECTION CARD PREMIUM
// Reusable selection card with premium styling
// ============================================================

import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SelectionCardProps {
  isSelected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  description?: string;
  badges?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'default' | 'compact';
  colorAccent?: string;
  className?: string;
}

export function SelectionCard({
  isSelected,
  onClick,
  icon,
  title,
  subtitle,
  description,
  badges,
  footer,
  size = 'default',
  colorAccent,
  className,
}: SelectionCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col rounded-xl border-2 cursor-pointer transition-all duration-200",
        "hover:shadow-md hover:shadow-primary/5",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
        isSelected 
          ? "border-primary bg-primary/5 shadow-md shadow-primary/10" 
          : "border-border bg-card hover:border-primary/50 hover:bg-accent/30",
        size === 'compact' ? 'p-3' : 'p-4 sm:p-5',
        className
      )}
    >
      {/* Selection indicator */}
      <div className={cn(
        "absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200",
        isSelected 
          ? "bg-primary text-primary-foreground scale-100" 
          : "bg-muted scale-75 opacity-0 group-hover:opacity-40"
      )}>
        <CheckCircle2 className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex items-start gap-4">
        {/* Icon */}
        {icon && (
          <div className={cn(
            "shrink-0 flex items-center justify-center rounded-xl transition-all duration-200",
            size === 'compact' ? 'w-10 h-10' : 'w-12 h-12',
            isSelected 
              ? "bg-primary/15 text-primary" 
              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
          )}>
            {icon}
          </div>
        )}

        {/* Text content */}
        <div className="flex-1 min-w-0 pr-6">
          <h4 className={cn(
            "font-semibold transition-colors duration-200",
            size === 'compact' ? 'text-sm' : 'text-base',
            isSelected && "text-primary"
          )}>
            {title}
          </h4>
          
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {subtitle}
            </p>
          )}
          
          {description && (
            <p className={cn(
              "text-muted-foreground mt-2",
              size === 'compact' ? 'text-xs' : 'text-sm'
            )}>
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Badges */}
      {badges && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {badges}
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div className="mt-4 pt-4 border-t">
          {footer}
        </div>
      )}

      {/* Color accent bar */}
      {colorAccent && isSelected && (
        <div 
          className="absolute inset-y-0 left-0 w-1 rounded-l-xl"
          style={{ backgroundColor: colorAccent }}
        />
      )}
    </motion.div>
  );
}

// Simplified version for type selection (horizontal cards)
interface TypeSelectionCardProps {
  isSelected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  description?: string;
}

export function TypeSelectionCard({
  isSelected,
  onClick,
  icon,
  label,
  description,
}: TypeSelectionCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "group relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center",
        "hover:shadow-sm",
        isSelected 
          ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20" 
          : "border-border hover:border-primary/50"
      )}
    >
      <div className={cn(
        "w-8 h-8 mx-auto mb-2 flex items-center justify-center rounded-lg transition-colors duration-200",
        isSelected 
          ? "text-primary" 
          : "text-muted-foreground group-hover:text-primary"
      )}>
        {icon}
      </div>
      <p className={cn(
        "text-xs font-medium transition-colors duration-200",
        isSelected ? "text-primary" : "text-foreground"
      )}>
        {label}
      </p>
      {description && (
        <p className="text-[10px] text-muted-foreground mt-0.5">{description}</p>
      )}
    </motion.div>
  );
}
