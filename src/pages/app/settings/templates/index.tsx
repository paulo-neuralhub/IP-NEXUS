// ============================================================
// TEMPLATES CATALOG PAGE - Catálogo visual de plantillas
// 15 tipos × 18 estilos - Grid organizado por categorías
// ============================================================

import * as React from 'react';
import { useState } from 'react';
import { 
  Loader2, Banknote, Mail, BarChart3, Scale, Award, Eye, ChevronDown, Check
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { DocumentThumbnail } from '@/components/features/templates/DocumentThumbnail';
import { TemplatePreviewModal } from '@/components/features/templates/TemplatePreviewModal';
import { useDocumentTypes, useDocumentTypesByCategory } from '@/hooks/documents/useDocumentTypes';
import { useDocumentStyles, useDocumentStyle } from '@/hooks/documents/useDocumentStyles';
import { 
  useTemplatePreferences, 
  useSetDefaultStyle, 
  useToggleDocumentType,
  useActiveDocumentTypes 
} from '@/hooks/documents/useTemplatePreferences';
import type { DocumentType, DocumentCategory, DesignTokens } from '@/lib/document-templates/designTokens';

// 5 categorías con iconos
const CATEGORY_CONFIG: { 
  key: DocumentCategory; 
  label: string; 
  emoji: string;
  icon: React.ElementType;
  bgColor: string;
  iconColor: string;
}[] = [
  { key: 'financiero', label: 'Financiero', emoji: '💰', icon: Banknote, bgColor: 'bg-amber-50', iconColor: 'text-amber-600' },
  { key: 'comunicacion', label: 'Comunicación', emoji: '📨', icon: Mail, bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
  { key: 'informe', label: 'Informes', emoji: '📊', icon: BarChart3, bgColor: 'bg-cyan-50', iconColor: 'text-cyan-600' },
  { key: 'legal', label: 'Legal', emoji: '⚖️', icon: Scale, bgColor: 'bg-indigo-50', iconColor: 'text-indigo-600' },
  { key: 'ip', label: 'Propiedad Intelectual', emoji: '🏆', icon: Award, bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600' },
];

// Template Card Component
function TemplateCard({
  docType,
  styleName,
  colors,
  isEnabled,
  onToggle,
  onPreview,
}: {
  docType: DocumentType;
  styleName?: string;
  colors?: any;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onPreview: () => void;
}) {
  return (
    <div className={cn(
      "group bg-white border rounded-xl overflow-hidden transition-all duration-200",
      isEnabled 
        ? "border-slate-200 hover:shadow-lg hover:border-cyan-300" 
        : "border-dashed border-slate-300 opacity-60"
    )}>
      {/* MINIATURA SVG */}
      <div 
        className="p-4 bg-gradient-to-b from-slate-50 to-white cursor-pointer"
        onClick={onPreview}
      >
        <DocumentThumbnail
          typeId={docType.id}
          styleName={styleName}
          colors={colors}
        />
      </div>
      
      {/* INFO */}
      <div className="px-4 pb-4">
        <h3 className="font-semibold text-slate-800 text-sm">{docType.name}</h3>
        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{docType.description}</p>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <button 
            onClick={onPreview}
            className="text-xs text-cyan-600 font-medium hover:text-cyan-700 flex items-center gap-1 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Vista previa
          </button>
          
          {/* Toggle ON/OFF */}
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-[10px] font-medium",
              isEnabled ? "text-cyan-600" : "text-slate-400"
            )}>
              {isEnabled ? 'ON' : 'OFF'}
            </span>
            <Switch 
              checked={isEnabled} 
              onCheckedChange={onToggle}
              className="data-[state=checked]:bg-cyan-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TemplateCatalogPage() {
  const [previewType, setPreviewType] = useState<DocumentType | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Data hooks
  const { data: types, isLoading: typesLoading } = useDocumentTypes();
  const { data: typesByCategory } = useDocumentTypesByCategory();
  const { data: styles, isLoading: stylesLoading } = useDocumentStyles();
  const { data: prefs } = useTemplatePreferences();
  const { isTypeEnabled } = useActiveDocumentTypes();
  
  // Get default style
  const { data: defaultStyle } = useDocumentStyle(prefs?.default_style_id || null);
  const fallbackStyle = styles?.[0] || null;
  const currentDefaultStyle = defaultStyle || fallbackStyle;
  
  // Mutations
  const setDefaultStyleMutation = useSetDefaultStyle();
  const toggleTypeMutation = useToggleDocumentType();
  
  const isLoading = typesLoading || stylesLoading;
  
  // Handlers
  const handlePreview = (type: DocumentType) => {
    setPreviewType(type);
    setIsPreviewOpen(true);
  };
  
  const handleToggle = (typeId: string, enabled: boolean) => {
    toggleTypeMutation.mutate({ typeId, enabled });
  };
  
  const handleStyleChange = (style: any) => {
    if (typeof style === 'string') return; // StyleKey from new modal
    setDefaultStyleMutation.mutate(style.id);
  };
  
  // Stats
  const totalTypes = types?.length || 0;
  const totalStyles = styles?.length || 0;
  const activeCount = types?.filter(t => isTypeEnabled(t.id)).length || 0;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Plantillas de Documentos</h1>
          <p className="text-sm text-slate-500 mt-1">
            Selecciona las plantillas activas y el estilo por defecto
          </p>
        </div>
        
        {/* Dropdown Estilo */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">Estilo:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium bg-white hover:bg-slate-50 transition-colors min-w-[140px]">
                {currentDefaultStyle && (
                  <div 
                    className="w-4 h-5 rounded border shadow-sm overflow-hidden shrink-0"
                    style={{ backgroundColor: currentDefaultStyle.colors.background }}
                  >
                    <div 
                      className="h-1.5" 
                      style={{ backgroundColor: currentDefaultStyle.colors.headerBg }}
                    />
                  </div>
                )}
                <span className="flex-1 text-left">{currentDefaultStyle?.name || 'Moderno'}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
              {styles?.map((style) => (
                <DropdownMenuItem 
                  key={style.id}
                  onClick={() => handleStyleChange(style)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div 
                    className="w-5 h-6 rounded border shadow-sm overflow-hidden shrink-0"
                    style={{ backgroundColor: style.colors.background }}
                  >
                    <div 
                      className="h-1.5" 
                      style={{ backgroundColor: style.colors.headerBg }}
                    />
                  </div>
                  <span className="flex-1 text-sm">{style.name}</span>
                  {currentDefaultStyle?.id === style.id && (
                    <Check className="h-4 w-4 text-cyan-500" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* STATS BAR */}
      <div className="flex items-center gap-6 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-cyan-600">{totalTypes}</span>
          <span className="text-xs text-slate-500 leading-tight">tipos de<br/>documento</span>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-cyan-600">{totalStyles}</span>
          <span className="text-xs text-slate-500 leading-tight">estilos<br/>visuales</span>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-emerald-600">{activeCount}</span>
          <span className="text-xs text-slate-500">activas de {totalTypes}</span>
        </div>
      </div>
      
      {/* 5 CATEGORÍAS + GRIDS */}
      <div className="space-y-10">
        {CATEGORY_CONFIG.map(({ key, label, emoji, icon: Icon, bgColor, iconColor }) => {
          const categoryTypes = typesByCategory?.[key];
          if (!categoryTypes || categoryTypes.length === 0) return null;
          
          return (
            <section key={key}>
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">{emoji}</span>
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", bgColor)}>
                  <Icon className={cn("w-4 h-4", iconColor)} />
                </div>
                <h2 className="font-semibold text-lg text-slate-800">{label}</h2>
                <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">
                  {categoryTypes.length} plantillas
                </span>
              </div>
              
              {/* Grid - 4 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {categoryTypes.map((docType) => (
                  <TemplateCard
                    key={docType.id}
                    docType={docType}
                    styleName={currentDefaultStyle?.name}
                    colors={currentDefaultStyle?.colors}
                    isEnabled={isTypeEnabled(docType.id)}
                    onToggle={(enabled) => handleToggle(docType.id, enabled)}
                    onPreview={() => handlePreview(docType)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
      
      {/* Preview Modal */}
      <TemplatePreviewModal
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        documentType={previewType}
        activeStyle="moderno"
        isEnabled={previewType ? isTypeEnabled(previewType.id) : true}
        onToggle={(enabled) => previewType && handleToggle(previewType.id, enabled)}
        onStyleChange={handleStyleChange as any}
      />
    </div>
  );
}
