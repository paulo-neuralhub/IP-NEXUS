// ============================================================
// TEMPLATE CARD - Card de plantilla con preview y toggle
// Diseño SILK: miniaturas realistas tipo documento A4
// ============================================================

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Eye } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { DocumentThumbnail } from './DocumentThumbnail';
import type { DocumentType, DesignTokens, DocumentCategory } from '@/lib/document-templates/designTokens';
import { CATEGORY_LABELS } from '@/lib/document-templates/designTokens';

// Category emoji map
const CATEGORY_EMOJI: Record<DocumentCategory, string> = {
  financiero: '💰',
  comunicacion: '📨',
  informe: '📊',
  legal: '⚖️',
  ip: '🏆',
};

interface TemplateCardProps {
  documentType: DocumentType;
  defaultStyle: DesignTokens | null;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onPreview: () => void;
  className?: string;
}

export function TemplateCard({
  documentType,
  defaultStyle,
  isEnabled,
  onToggle,
  onPreview,
  className,
}: TemplateCardProps) {
  return (
    <div
      className={cn(
        'group bg-white rounded-xl overflow-hidden transition-all duration-200',
        isEnabled
          ? 'border border-slate-200 hover:border-cyan-300 hover:shadow-lg'
          : 'border border-dashed border-slate-300 opacity-60',
        className
      )}
    >
      {/* Miniatura del documento - click para preview */}
      <button
        onClick={onPreview}
        className="w-full relative"
      >
        <DocumentThumbnail
          typeId={documentType.id}
          category={documentType.category}
          colors={defaultStyle?.colors}
        />
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
              <Eye className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Vista previa</span>
            </div>
          </div>
        </div>
      </button>
      
      {/* Info section */}
      <div className="px-5 pt-4 pb-2">
        <h3 className="font-semibold text-base text-slate-800">
          {documentType.name}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mt-0.5">
          {documentType.description}
        </p>
      </div>
      
      {/* Category badge */}
      <div className="px-5 pb-3">
        <Badge 
          variant="outline" 
          className="text-xs bg-slate-50 border-slate-200"
        >
          <span className="mr-1">{CATEGORY_EMOJI[documentType.category]}</span>
          {CATEGORY_LABELS[documentType.category]}
        </Badge>
      </div>
      
      {/* Footer: Preview link + Toggle */}
      <div className="px-5 pb-4 flex items-center justify-between">
        <button
          onClick={onPreview}
          className="text-sm font-medium text-cyan-600 hover:text-cyan-700 hover:underline flex items-center gap-1.5 transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          Vista previa
        </button>
        
        <div className="flex items-center gap-2">
          <Switch
            checked={isEnabled}
            onCheckedChange={onToggle}
            className="data-[state=checked]:bg-cyan-500"
          />
          <span className={cn(
            'text-xs font-medium min-w-[24px]',
            isEnabled ? 'text-cyan-600' : 'text-slate-400'
          )}>
            {isEnabled ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>
    </div>
  );
}
