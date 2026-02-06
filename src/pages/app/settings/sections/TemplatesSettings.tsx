/**
 * Templates Settings Section
 * Summary view for settings page - links to full catalog
 */

import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, ChevronRight, Loader2,
  Banknote, Mail, BarChart3, Scale, Award
} from 'lucide-react';

import { useDocumentStyles } from '@/hooks/documents/useDocumentStyles';
import { useDocumentTypes, useDocumentTypesByCategory } from '@/hooks/documents/useDocumentTypes';
import type { DocumentCategory } from '@/lib/document-templates/designTokens';

// Category config
const CATEGORY_CONFIG: { key: DocumentCategory; label: string; emoji: string }[] = [
  { key: 'financiero', label: 'Financiero', emoji: '💰' },
  { key: 'comunicacion', label: 'Comunicación', emoji: '📨' },
  { key: 'informe', label: 'Informes', emoji: '📊' },
  { key: 'legal', label: 'Legal', emoji: '⚖️' },
  { key: 'ip', label: 'IP', emoji: '🏆' },
];

export default function TemplatesSettings() {
  // Fetch data
  const { data: styles, isLoading: stylesLoading } = useDocumentStyles();
  const { data: types, isLoading: typesLoading } = useDocumentTypes();
  const { data: typesByCategory } = useDocumentTypesByCategory();

  const isLoading = stylesLoading || typesLoading;
  const totalCombinations = (styles?.length || 0) * (types?.length || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #00b4d8, #00d4aa)',
              boxShadow: '0 4px 14px rgba(0, 180, 216, 0.25)',
            }}
          >
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Plantillas de Documentos</h2>
            <p className="text-sm text-slate-500">
              {isLoading ? 'Cargando...' : (
                <>
                  <span className="font-semibold text-slate-700">{types?.length || 0}</span> tipos × 
                  <span className="font-semibold text-slate-700"> {styles?.length || 0}</span> estilos = 
                  <span className="font-semibold text-cyan-600"> {totalCombinations}</span> combinaciones
                </>
              )}
            </p>
          </div>
        </div>

        <Button asChild>
          <Link to="/app/settings/templates" className="gap-1">
            Gestionar plantillas
            <span>→</span>
          </Link>
        </Button>
      </div>


      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card 
          className="border-0"
          style={{
            background: '#f1f4f9',
            boxShadow: 'inset 2px 2px 5px #cdd1dc, inset -2px -2px 5px #ffffff',
          }}
        >
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-cyan-600">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : totalCombinations}
            </div>
            <div className="text-xs text-slate-500">Combinaciones totales</div>
          </CardContent>
        </Card>
        <Card 
          className="border-0"
          style={{
            background: '#f1f4f9',
            boxShadow: 'inset 2px 2px 5px #cdd1dc, inset -2px -2px 5px #ffffff',
          }}
        >
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-slate-700">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : styles?.length || 0}
            </div>
            <div className="text-xs text-slate-500">Estilos visuales</div>
          </CardContent>
        </Card>
        <Card 
          className="border-0"
          style={{
            background: '#f1f4f9',
            boxShadow: 'inset 2px 2px 5px #cdd1dc, inset -2px -2px 5px #ffffff',
          }}
        >
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-slate-700">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : types?.length || 0}
            </div>
            <div className="text-xs text-slate-500">Tipos de documento</div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Preview */}
      {!isLoading && typesByCategory && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Tipos por Categoría</h3>
          <div className="grid grid-cols-5 gap-3">
            {CATEGORY_CONFIG.map(({ key, label, emoji }) => {
              const catTypes = typesByCategory[key] || [];
              return (
                <div 
                  key={key} 
                  className="text-center p-3 rounded-xl"
                  style={{
                    background: '#f1f4f9',
                    boxShadow: '3px 3px 7px #cdd1dc, -3px -3px 7px #ffffff',
                  }}
                >
                  <div className="text-xl mb-1">{emoji}</div>
                  <div className="font-medium text-xs text-slate-700">{label}</div>
                  <Badge variant="secondary" className="mt-1 text-[10px]">
                    {catTypes.length}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View All Link */}
      <Link 
        to="/app/settings/templates" 
        className="flex items-center justify-center gap-2 text-sm font-medium text-cyan-600 hover:text-cyan-700 py-2 transition-colors"
      >
        <FileText className="w-4 h-4" />
        Abrir catálogo completo
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
