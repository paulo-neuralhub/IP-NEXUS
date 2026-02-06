// ============================================================
// TEMPLATES PAGE — /app/templates — Step 1: Category Menu
// Shows 5 document categories as clickable cards
// ============================================================

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Loader2, ChevronRight, Receipt, Mail, BarChart3, Scale, Shield, Check } from 'lucide-react';
import { useDocumentTypesByCategory } from '@/hooks/documents/useDocumentTypes';
import { useActiveDocumentTypes } from '@/hooks/documents/useTemplatePreferences';
import type { DocumentCategory } from '@/lib/document-templates/designTokens';

const CATEGORY_CONFIG: {
  key: DocumentCategory;
  slug: string;
  label: string;
  emoji: string;
  icon: React.ElementType;
}[] = [
  { key: 'financiero', slug: 'financiero', label: 'Financiero', emoji: '💰', icon: Receipt },
  { key: 'comunicacion', slug: 'comunicacion', label: 'Comunicación', emoji: '📨', icon: Mail },
  { key: 'informe', slug: 'informes', label: 'Informes', emoji: '📊', icon: BarChart3 },
  { key: 'legal', slug: 'legal', label: 'Legal', emoji: '⚖️', icon: Scale },
  { key: 'ip', slug: 'ip', label: 'IP / Propiedad Intelectual', emoji: '🛡️', icon: Shield },
];

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { data: typesByCategory, isLoading } = useDocumentTypesByCategory();
  const { isTypeEnabled } = useActiveDocumentTypes();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Plantillas de Documentos</h1>
        <p className="text-sm text-slate-500 mt-1">
          Selecciona un tipo de documento para ver y personalizar los modelos disponibles
        </p>
      </div>

      {/* CATEGORY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATEGORY_CONFIG.map(({ key, slug, label, emoji, icon: Icon }) => {
          const types = typesByCategory?.[key] || [];
          const totalCount = types.length;
          const activeCount = types.filter(t => isTypeEnabled(t.id)).length;

          if (totalCount === 0) return null;

          return (
            <button
              key={key}
              onClick={() => navigate(`/app/templates/${slug}`)}
              className={cn(
                "group relative bg-white border border-slate-200 rounded-xl p-6 text-left",
                "transition-all duration-200 hover:shadow-lg hover:border-blue-300 hover:-translate-y-0.5",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              )}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center mb-4 transition-colors">
                <span className="text-2xl">{emoji}</span>
              </div>

              {/* Name */}
              <h3 className="text-lg font-semibold text-slate-800 mb-1">{label}</h3>

              {/* Count */}
              <p className="text-sm text-slate-500 mb-3">
                {totalCount} {totalCount === 1 ? 'modelo disponible' : 'modelos disponibles'}
              </p>

              {/* Status */}
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-emerald-600">
                  <Check className="w-3.5 h-3.5" />
                  {activeCount} activos
                </span>
              </div>

              {/* Hover arrow */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-5 h-5 text-blue-500" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
