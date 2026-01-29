// ============================================
// src/components/ui/collapsible-section.tsx
// Sección colapsable reutilizable con colores por tipo
// ============================================

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sectionColors, type SectionColorScheme } from '@/lib/section-colors';

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  colorScheme?: SectionColorScheme;
  children: React.ReactNode;
}

export function CollapsibleSection({ 
  title, 
  icon, 
  defaultOpen = true, 
  actions,
  badge,
  className,
  headerClassName,
  colorScheme,
  children 
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const colors = colorScheme ? sectionColors[colorScheme] : null;
  
  return (
    <div className={cn(
      "border rounded-lg bg-card overflow-hidden",
      colors?.border,
      className
    )}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors",
          open && colors?.bg,
          headerClassName
        )}
      >
        <div className="flex items-center gap-2">
          {icon && (
            <span className={cn(
              "flex-shrink-0",
              colors?.icon || "text-muted-foreground"
            )}>
              {icon}
            </span>
          )}
          <span className="font-medium text-sm">{title}</span>
          {badge}
        </div>
        <div className="flex items-center gap-2">
          {actions && (
            <div onClick={e => e.stopPropagation()} className="flex items-center gap-1">
              {actions}
            </div>
          )}
          <ChevronDown 
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )} 
          />
        </div>
      </button>
      
      {open && (
        <div className="p-3 pt-2 border-t">
          {children}
        </div>
      )}
    </div>
  );
}
