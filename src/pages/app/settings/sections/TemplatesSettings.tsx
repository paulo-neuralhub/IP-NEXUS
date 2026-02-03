/**
 * Templates Settings Section
 * Summary view of 270 combinations for settings page
 */

import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Palette, ChevronRight, Settings2, Grid3X3,
  Loader2, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useDocumentStyles, useDocumentStylesByPack } from '@/hooks/documents/useDocumentStyles';
import { useDocumentTypes, useDocumentTypesByCategory } from '@/hooks/documents/useDocumentTypes';
import { PACK_COLORS, CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/document-templates/designTokens';
import type { StylePack, DocumentCategory } from '@/lib/document-templates/designTokens';

export default function TemplatesSettings() {
  // Fetch data
  const { data: styles, isLoading: stylesLoading } = useDocumentStyles();
  const { data: types, isLoading: typesLoading } = useDocumentTypes();
  const { data: stylesByPack } = useDocumentStylesByPack();
  const { data: typesByCategory } = useDocumentTypesByCategory();

  const isLoading = stylesLoading || typesLoading;
  const totalCombinations = (styles?.length || 0) * (types?.length || 0);

  const packs: StylePack[] = ['Classic', 'Modern', 'Executive'];
  const categories: DocumentCategory[] = ['financiero', 'comunicacion', 'informe', 'legal', 'ip'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Sistema de Plantillas</h2>
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Cargando...' : `${totalCombinations} combinaciones (${styles?.length || 0} estilos × ${types?.length || 0} tipos)`}
            </p>
          </div>
        </div>

        <Button asChild>
          <Link to="/app/documents/generator">
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir Generador
          </Link>
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : totalCombinations}
            </div>
            <div className="text-xs text-muted-foreground">Combinaciones</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-finance">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : styles?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground">Estilos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-genius">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : types?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground">Tipos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-crm">3</div>
            <div className="text-xs text-muted-foreground">Packs</div>
          </CardContent>
        </Card>
      </div>

      {/* Branding Config */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-primary/10">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Identidad de Marca</h3>
              <p className="text-sm text-muted-foreground">
                Logo, colores y datos de empresa
              </p>
            </div>
          </div>
          <Button asChild size="sm">
            <Link to="/app/settings/templates/branding">
              <Settings2 className="w-4 h-4 mr-2" />
              Configurar
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Packs Preview */}
      {!isLoading && stylesByPack && (
        <div>
          <h3 className="text-sm font-medium mb-3">Packs de Estilo</h3>
          <div className="grid grid-cols-3 gap-4">
            {packs.map((pack) => {
              const packStyles = stylesByPack[pack] || [];
              const packColors = PACK_COLORS[pack];
              return (
                <Card key={pack} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={cn(packColors.bg, packColors.text, 'border-0')}>
                        {pack}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {packStyles.length} estilos
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {packStyles.slice(0, 6).map((s) => (
                        <div
                          key={s.id}
                          className="w-5 h-5 rounded border"
                          style={{ backgroundColor: s.colors.headerBg }}
                          title={s.name}
                        />
                      ))}
                      {packStyles.length > 6 && (
                        <div className="w-5 h-5 rounded border bg-muted flex items-center justify-center text-[10px]">
                          +{packStyles.length - 6}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Categories Preview */}
      {!isLoading && typesByCategory && (
        <div>
          <h3 className="text-sm font-medium mb-3">Tipos por Categoría</h3>
          <div className="grid grid-cols-5 gap-2">
            {categories.map((cat) => {
              const catTypes = typesByCategory[cat] || [];
              return (
                <Card key={cat} className="text-center">
                  <CardContent className="p-3">
                    <div className="text-xl mb-1">{CATEGORY_ICONS[cat]}</div>
                    <div className="font-medium text-xs">{CATEGORY_LABELS[cat]}</div>
                    <div className="text-[10px] text-muted-foreground">{catTypes.length} tipos</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* View All Link */}
      <Link 
        to="/app/settings/templates" 
        className="flex items-center justify-center gap-2 text-sm text-primary hover:underline py-2"
      >
        <Grid3X3 className="w-4 h-4" />
        Ver todos los estilos y tipos
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
