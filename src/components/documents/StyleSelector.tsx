// ============================================================
// L111: Selector de Estilos de Documento
// ============================================================

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DOCUMENT_STYLES } from '@/config/documentStyles';
import { DocumentStyleCode, StyleColors } from '@/types/documents';

interface StyleSelectorProps {
  selectedStyle: DocumentStyleCode;
  onSelectStyle: (style: DocumentStyleCode) => void;
  tenantColors?: Partial<StyleColors>;
}

const styleIcons: Record<DocumentStyleCode, string> = {
  minimalista: '⬛',
  corporativo: '🔵',
  elegante: '🟡',
  dark: '🖤',
  creativo: '🎨',
  dinamico: '💼',
};

export function StyleSelector({ 
  selectedStyle, 
  onSelectStyle,
  tenantColors 
}: StyleSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">
          Seleccionar estilo visual
        </h3>
        <Badge variant="outline" className="text-xs">
          {DOCUMENT_STYLES[selectedStyle]?.name}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.entries(DOCUMENT_STYLES).map(([code, style]) => {
          const isSelected = selectedStyle === code;
          const colors = tenantColors 
            ? { ...style.colors, ...tenantColors } 
            : style.colors;
          
          return (
            <Card
              key={code}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md',
                isSelected 
                  ? 'ring-2 ring-primary shadow-md' 
                  : 'hover:border-primary/50'
              )}
              onClick={() => onSelectStyle(code as DocumentStyleCode)}
            >
              <CardContent className="p-3">
                {/* Mini preview del estilo */}
                <div 
                  className="relative h-20 rounded-md mb-2 overflow-hidden border"
                  style={{ backgroundColor: colors.background }}
                >
                  {/* Header preview */}
                  <div 
                    className="h-5 flex items-center px-2"
                    style={{ 
                      backgroundColor: colors.headerBg,
                      color: colors.headerText 
                    }}
                  >
                    <div 
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: colors.primary }}
                    />
                    <div className="ml-1 h-1 w-8 rounded" style={{ backgroundColor: colors.headerText, opacity: 0.5 }} />
                  </div>
                  
                  {/* Content preview */}
                  <div className="p-2 space-y-1">
                    <div 
                      className="h-1.5 w-full rounded" 
                      style={{ backgroundColor: colors.text, opacity: 0.3 }} 
                    />
                    <div 
                      className="h-1 w-3/4 rounded" 
                      style={{ backgroundColor: colors.text, opacity: 0.2 }} 
                    />
                    <div 
                      className="h-1 w-1/2 rounded" 
                      style={{ backgroundColor: colors.text, opacity: 0.2 }} 
                    />
                  </div>

                  {/* Decoraciones según estilo */}
                  {style.decorations.hasShapes && style.layout.headerStyle === 'wave' && (
                    <svg 
                      className="absolute bottom-0 left-0 w-full h-3"
                      viewBox="0 0 100 10" 
                      preserveAspectRatio="none"
                    >
                      <path 
                        d="M0,10 Q25,0 50,5 T100,10 L100,10 L0,10 Z" 
                        fill={colors.primary}
                        opacity={0.3}
                      />
                    </svg>
                  )}
                  
                  {style.decorations.hasShapes && style.decorations.shapeStyle === 'diagonal' && (
                    <div 
                      className="absolute top-0 right-0 w-8 h-8 -mr-4 -mt-4 rotate-45"
                      style={{ backgroundColor: colors.accent, opacity: 0.3 }}
                    />
                  )}
                  
                  {style.decorations.hasShapes && style.decorations.shapeStyle === 'circles' && (
                    <>
                      <div 
                        className="absolute top-1 right-1 w-4 h-4 rounded-full"
                        style={{ backgroundColor: colors.accent, opacity: 0.2 }}
                      />
                      <div 
                        className="absolute bottom-2 left-1 w-3 h-3 rounded-full"
                        style={{ backgroundColor: colors.secondary, opacity: 0.2 }}
                      />
                    </>
                  )}

                  {style.decorations.hasShapes && style.decorations.shapeStyle === 'organic' && (
                    <div 
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full"
                      style={{ backgroundColor: colors.accent, opacity: 0.2 }}
                    />
                  )}

                  {style.decorations.hasShapes && style.decorations.shapeStyle === 'geometric' && (
                    <div 
                      className="absolute bottom-1 right-1 w-3 h-3"
                      style={{ 
                        backgroundColor: colors.accent, 
                        opacity: 0.3,
                        clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)'
                      }}
                    />
                  )}
                  
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Info del estilo */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{styleIcons[code as DocumentStyleCode]}</span>
                    <span className="text-xs font-medium text-foreground truncate">
                      {style.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-2">
                    {style.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
