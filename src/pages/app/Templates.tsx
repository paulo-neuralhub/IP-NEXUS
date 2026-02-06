// ============================================================
// TEMPLATES PAGE — /app/templates — All templates grouped by category
// Single scrollable page with section headers
// ============================================================

import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Eye, Receipt, Mail, BarChart3, Scale, Shield } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

import { TemplateThumbnailSVG, type StyleKey } from '@/components/templates/TemplateThumbnailSVG';
import { GlobalStyleBar, type GlobalStyleId } from '@/components/templates/GlobalStyleBar';
import { TemplatePreviewModal } from '@/components/features/templates/TemplatePreviewModal';
import { useDocumentTypesByCategory } from '@/hooks/documents/useDocumentTypes';
import { useDocumentStyles, useDocumentStyle } from '@/hooks/documents/useDocumentStyles';
import {
  useTemplatePreferences,
  useSetDefaultStyle,
  useToggleDocumentType,
  useActiveDocumentTypes,
} from '@/hooks/documents/useTemplatePreferences';
import { useOrganization } from '@/contexts/organization-context';
import type { DocumentType, DocumentCategory, DesignTokens } from '@/lib/document-templates/designTokens';

const CATEGORY_ORDER: {
  key: DocumentCategory;
  label: string;
  emoji: string;
  icon: React.ElementType;
}[] = [
  { key: 'financiero', label: 'Financiero', emoji: '💰', icon: Receipt },
  { key: 'comunicacion', label: 'Comunicación', emoji: '📨', icon: Mail },
  { key: 'informe', label: 'Informes', emoji: '📊', icon: BarChart3 },
  { key: 'legal', label: 'Legal', emoji: '⚖️', icon: Scale },
  { key: 'ip', label: 'IP / Propiedad Intelectual', emoji: '🛡️', icon: Shield },
];

function resolveStyleKey(defaultStyle: DesignTokens | null): GlobalStyleId {
  if (!defaultStyle) return 'moderno';
  const code = defaultStyle.code?.toLowerCase() || '';
  if (code.includes('clasic') || code.includes('classic')) return 'clasico';
  if (code.includes('elegant')) return 'elegante';
  if (code.includes('sofistic') || code.includes('executive') || code.includes('luxury')) return 'sofisticado';
  return 'moderno';
}

export default function TemplatesPage() {
  const [previewType, setPreviewType] = useState<DocumentType | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [localStyle, setLocalStyle] = useState<GlobalStyleId>('moderno');

  const { currentOrganization } = useOrganization();
  const { data: typesByCategory, isLoading: typesLoading } = useDocumentTypesByCategory();
  const { data: styles, isLoading: stylesLoading } = useDocumentStyles();
  const { data: prefs } = useTemplatePreferences();
  const { isTypeEnabled } = useActiveDocumentTypes();
  const { data: defaultStyle } = useDocumentStyle(prefs?.default_style_id || null);
  const setDefaultStyleMutation = useSetDefaultStyle();
  const toggleTypeMutation = useToggleDocumentType();

  const fallbackStyle = styles?.[0] || null;
  const currentDefaultStyle = defaultStyle || fallbackStyle;

  React.useEffect(() => {
    setLocalStyle(resolveStyleKey(currentDefaultStyle));
  }, [currentDefaultStyle]);

  const isLoading = typesLoading || stylesLoading;
  const tenantName = currentOrganization?.name || 'Mi Empresa S.L.';

  const handleStyleChange = (styleKey: GlobalStyleId) => {
    setLocalStyle(styleKey);
  };

  const handleApplyToAll = (styleKey: GlobalStyleId) => {
    const match = styles?.find(s => {
      const c = s.code?.toLowerCase() || '';
      if (styleKey === 'clasico') return c.includes('clasic') || c.includes('classic');
      if (styleKey === 'elegante') return c.includes('elegant');
      if (styleKey === 'sofisticado') return c.includes('sofistic') || c.includes('executive') || c.includes('luxury');
      return c.includes('modern') || (!c.includes('clasic') && !c.includes('elegant') && !c.includes('sofistic'));
    });
    if (match) setDefaultStyleMutation.mutate(match.id);
  };

  const handleToggle = (typeId: string, enabled: boolean) => {
    toggleTypeMutation.mutate({ typeId, enabled });
  };

  const handlePreview = (type: DocumentType) => {
    setPreviewType(type);
    setIsPreviewOpen(true);
  };

  const handleModalStyleChange = (style: GlobalStyleId) => {
    setLocalStyle(style);
    handleApplyToAll(style);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Plantillas de Documentos</h1>
        <p className="text-sm text-slate-500 mt-1">
          Personaliza los documentos que genera tu organización
        </p>
      </div>

      {/* GLOBAL STYLE BAR */}
      <div className="mb-8">
        <GlobalStyleBar
          activeStyle={localStyle}
          onStyleChange={handleStyleChange}
          onApplyToAll={handleApplyToAll}
        />
      </div>

      {/* SECTIONS BY CATEGORY */}
      <div className="space-y-10">
        {CATEGORY_ORDER.map(({ key, label, emoji, icon: Icon }) => {
          const types = typesByCategory?.[key] || [];
          if (types.length === 0) return null;

          return (
            <section key={key}>
              {/* Section header */}
              <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-slate-200">
                <span className="text-lg">{emoji}</span>
                <Icon className="h-4.5 w-4.5 text-slate-500" />
                <h2 className="text-base font-semibold text-slate-700">{label}</h2>
                <span className="text-xs text-slate-400 ml-1">
                  {types.length} {types.length === 1 ? 'modelo' : 'modelos'}
                </span>
              </div>

              {/* Model cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {types.map((docType) => {
                  const enabled = isTypeEnabled(docType.id);
                  return (
                    <div
                      key={docType.id}
                      className={cn(
                        "group bg-white border rounded-xl overflow-hidden transition-all duration-200",
                        enabled
                          ? "border-slate-200 hover:shadow-lg hover:border-blue-300"
                          : "border-dashed border-slate-300 opacity-60"
                      )}
                    >
                      {/* THUMBNAIL */}
                      <div
                        className="relative cursor-pointer bg-gradient-to-b from-slate-50 to-white p-3"
                        onClick={() => handlePreview(docType)}
                        style={{ aspectRatio: '210 / 220' }}
                      >
                        <div className="w-full h-full rounded-lg overflow-hidden shadow-sm border border-slate-100">
                          <TemplateThumbnailSVG
                            typeId={docType.id}
                            style={localStyle as StyleKey}
                            tenantName={tenantName}
                          />
                        </div>
                        {/* Hover overlay */}
                        <div className="absolute inset-3 rounded-lg bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            Vista previa
                          </span>
                        </div>
                      </div>

                      {/* INFO */}
                      <div className="px-4 pb-3 pt-1">
                        <h3 className="font-semibold text-slate-800 text-sm">{docType.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{docType.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={enabled}
                              onCheckedChange={(val) => handleToggle(docType.id, val)}
                              className="data-[state=checked]:bg-blue-500 scale-90"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className={cn(
                              "text-xs font-medium",
                              enabled ? "text-blue-600" : "text-slate-400"
                            )}>
                              {enabled ? 'Activa' : 'Inactiva'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* PREVIEW MODAL */}
      <TemplatePreviewModal
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        documentType={previewType}
        activeStyle={localStyle as any}
        isEnabled={previewType ? isTypeEnabled(previewType.id) : true}
        onToggle={(enabled) => previewType && handleToggle(previewType.id, enabled)}
        onStyleChange={handleModalStyleChange}
      />
    </div>
  );
}
