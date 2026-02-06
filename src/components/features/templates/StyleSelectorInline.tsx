// ============================================================
// STYLE SELECTOR INLINE - Selector horizontal de 18 estilos
// ============================================================

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useDocumentStyles } from '@/hooks/documents/useDocumentStyles';
import type { DesignTokens } from '@/lib/document-templates/designTokens';

interface StyleSelectorInlineProps {
  selectedStyleId: string | null;
  onSelect: (style: DesignTokens) => void;
  className?: string;
}

export function StyleSelectorInline({ 
  selectedStyleId, 
  onSelect,
  className 
}: StyleSelectorInlineProps) {
  const { data: styles, isLoading } = useDocumentStyles();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!styles?.length) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No hay estilos disponibles
      </div>
    );
  }
  
  return (
    <ScrollArea className={cn('w-full whitespace-nowrap', className)}>
      <div className="flex items-center gap-3 pb-3">
        {styles.map((style) => {
          const isSelected = selectedStyleId === style.id;
          const colors = style.colors;
          
          return (
            <button
              key={style.id}
              onClick={() => onSelect(style)}
              className={cn(
                'relative flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all duration-200 shrink-0',
                isSelected
                  ? 'bg-slate-100 ring-2 ring-cyan-400'
                  : 'hover:bg-slate-50'
              )}
              title={style.name}
            >
              {/* Mini preview swatch - LARGER SIZE */}
              <div
                className="w-16 h-20 rounded-md overflow-hidden border border-slate-200 shadow-sm"
                style={{ backgroundColor: colors.background }}
              >
                {/* Header */}
                <div
                  className="h-4"
                  style={{ backgroundColor: colors.headerBg }}
                />
                {/* Content lines */}
                <div className="p-1.5 space-y-1">
                  <div 
                    className="h-1 rounded-full w-2/3"
                    style={{ backgroundColor: colors.text, opacity: 0.3 }}
                  />
                  <div 
                    className="h-0.5 rounded-full w-full"
                    style={{ backgroundColor: colors.text, opacity: 0.15 }}
                  />
                  <div 
                    className="h-0.5 rounded-full w-4/5"
                    style={{ backgroundColor: colors.text, opacity: 0.15 }}
                  />
                  <div 
                    className="h-0.5 rounded-full w-3/5"
                    style={{ backgroundColor: colors.text, opacity: 0.15 }}
                  />
                </div>
                {/* Table */}
                <div className="mx-1.5">
                  <div 
                    className="h-2 rounded-sm"
                    style={{ backgroundColor: colors.tableHeadBg }}
                  />
                  <div className="mt-0.5 space-y-0.5">
                    <div className="h-1 rounded-sm" style={{ backgroundColor: colors.backgroundAlt }} />
                    <div className="h-1 rounded-sm bg-slate-100" />
                  </div>
                </div>
              </div>
              
              {/* Label */}
              <span className={cn(
                'text-xs font-medium truncate max-w-16',
                isSelected ? 'text-cyan-600' : 'text-slate-500'
              )}>
                {style.name}
              </span>
              
              {/* Check indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center shadow-sm">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
