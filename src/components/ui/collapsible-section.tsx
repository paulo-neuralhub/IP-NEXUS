// ============================================
// src/components/ui/collapsible-section.tsx
// Sección colapsable reutilizable tipo Bitrix24
// ============================================

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
  headerClassName?: string;
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
  children 
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  
  return (
    <div className={cn("border rounded-lg bg-card", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors rounded-t-lg",
          !open && "rounded-b-lg",
          headerClassName
        )}
      >
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-muted-foreground">
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
        <div className="p-3 pt-0 border-t">
          {children}
        </div>
      )}
    </div>
  );
}
