// ============================================================
// TEMPLATES SETTINGS - 270 Combinaciones (18 estilos × 15 tipos)
// Vista unificada del sistema de plantillas de documentos
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, Palette, ChevronRight, Settings2, Grid3X3,
  Loader2, Check, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useDocumentStyles, useDocumentStylesByPack } from '@/hooks/documents/useDocumentStyles';
import { useDocumentTypes, useDocumentTypesByCategory } from '@/hooks/documents/useDocumentTypes';
import { PACK_COLORS, CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/document-templates/designTokens';
import type { DesignTokens, DocumentType, StylePack, DocumentCategory } from '@/lib/document-templates/designTokens';

export default function TemplatesSettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'styles' | 'types'>('overview');

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
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Sistema de Plantillas</h1>
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Cargando...' : `${totalCombinations} combinaciones disponibles (${styles?.length || 0} estilos × ${types?.length || 0} tipos)`}
            </p>
          </div>
        </div>

        <Button onClick={() => navigate('/app/documents/generator')}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Abrir Generador
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-primary">{isLoading ? '-' : totalCombinations}</div>
            <div className="text-xs text-muted-foreground">Combinaciones</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-finance">{isLoading ? '-' : styles?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Estilos Visuales</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-genius">{isLoading ? '-' : types?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Tipos de Documento</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-crm">3</div>
            <div className="text-xs text-muted-foreground">Packs de Estilo</div>
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
                Logo, colores, datos fiscales y preferencias de numeración
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <Grid3X3 className="w-4 h-4" />
            Vista General
          </TabsTrigger>
          <TabsTrigger value="styles" className="gap-2">
            <Palette className="w-4 h-4" />
            {styles?.length || 0} Estilos
          </TabsTrigger>
          <TabsTrigger value="types" className="gap-2">
            <FileText className="w-4 h-4" />
            {types?.length || 0} Tipos
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          {isLoading ? (
            <LoadingState />
          ) : (
            <div className="space-y-8">
              {/* Styles by Pack */}
              <div>
                <h3 className="text-sm font-medium mb-4">Packs de Estilo</h3>
                <div className="grid grid-cols-3 gap-4">
                  {packs.map((pack) => {
                    const packStyles = stylesByPack?.[pack] || [];
                    const packColors = PACK_COLORS[pack];
                    return (
                      <Card key={pack} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <Badge className={cn(packColors.bg, packColors.text, 'border-0')}>
                              {pack}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {packStyles.length} estilos
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1">
                            {packStyles.slice(0, 6).map((s) => (
                              <div
                                key={s.id}
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: s.colors.headerBg }}
                                title={s.name}
                              />
                            ))}
                            {packStyles.length > 6 && (
                              <div className="w-6 h-6 rounded border bg-muted flex items-center justify-center text-xs">
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

              {/* Types by Category */}
              <div>
                <h3 className="text-sm font-medium mb-4">Tipos por Categoría</h3>
                <div className="grid grid-cols-5 gap-3">
                  {categories.map((cat) => {
                    const catTypes = typesByCategory?.[cat] || [];
                    return (
                      <Card key={cat} className="text-center">
                        <CardContent className="pt-4">
                          <div className="text-2xl mb-1">{CATEGORY_ICONS[cat]}</div>
                          <div className="font-medium text-sm">{CATEGORY_LABELS[cat]}</div>
                          <div className="text-xs text-muted-foreground">{catTypes.length} tipos</div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Matrix Preview */}
              <div>
                <h3 className="text-sm font-medium mb-4">Matriz de Combinaciones</h3>
                <Card>
                  <CardContent className="pt-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr>
                            <th className="text-left p-2 border-b font-medium">Tipo / Estilo</th>
                            {styles?.slice(0, 8).map((s) => (
                              <th key={s.id} className="p-2 border-b text-center">
                                <div
                                  className="w-4 h-4 rounded mx-auto"
                                  style={{ backgroundColor: s.colors.headerBg }}
                                  title={s.name}
                                />
                              </th>
                            ))}
                            {(styles?.length || 0) > 8 && (
                              <th className="p-2 border-b text-center text-muted-foreground">
                                +{(styles?.length || 0) - 8}
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {types?.slice(0, 8).map((t) => (
                            <tr key={t.id} className="hover:bg-muted/50">
                              <td className="p-2 border-b">
                                <span className="mr-1">{t.icon}</span>
                                {t.name}
                              </td>
                              {styles?.slice(0, 8).map((s) => (
                                <td key={s.id} className="p-2 border-b text-center">
                                  <Check className="w-3 h-3 mx-auto text-success" />
                                </td>
                              ))}
                              {(styles?.length || 0) > 8 && (
                                <td className="p-2 border-b text-center text-muted-foreground">•</td>
                              )}
                            </tr>
                          ))}
                          {(types?.length || 0) > 8 && (
                            <tr>
                              <td className="p-2 text-muted-foreground">+{(types?.length || 0) - 8} más</td>
                              <td colSpan={9} className="p-2 text-center text-muted-foreground">...</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      Cada combinación tipo × estilo genera un documento único
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Styles Tab */}
        <TabsContent value="styles" className="mt-6">
          {isLoading ? (
            <LoadingState />
          ) : (
            <div className="space-y-6">
              {packs.map((pack) => {
                const packStyles = stylesByPack?.[pack] || [];
                if (packStyles.length === 0) return null;

                const packColors = PACK_COLORS[pack];

                return (
                  <div key={pack}>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className={cn(packColors.bg, packColors.text, 'border-0 text-sm')}>
                        {pack}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {packStyles.length} estilos
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {packStyles.map((style) => (
                        <StylePreviewCard key={style.id} style={style} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Types Tab */}
        <TabsContent value="types" className="mt-6">
          {isLoading ? (
            <LoadingState />
          ) : (
            <div className="space-y-6">
              {categories.map((cat) => {
                const catTypes = typesByCategory?.[cat] || [];
                if (catTypes.length === 0) return null;

                return (
                  <div key={cat}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xl">{CATEGORY_ICONS[cat]}</span>
                      <span className="font-medium">{CATEGORY_LABELS[cat]}</span>
                      <span className="text-sm text-muted-foreground">
                        {catTypes.length} tipos
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {catTypes.map((type) => (
                        <TypeCard key={type.id} type={type} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Sub-components

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function StylePreviewCard({ style }: { style: DesignTokens }) {
  const colors = style.colors;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Mini preview */}
      <div
        className="aspect-[3/4] relative"
        style={{ backgroundColor: colors.background }}
      >
        {/* Header */}
        <div className="h-8" style={{ backgroundColor: colors.headerBg }} />
        
        {/* Content lines */}
        <div className="p-3 space-y-1.5">
          <div 
            className="h-2 rounded-full w-3/4"
            style={{ backgroundColor: colors.text, opacity: 0.3 }}
          />
          <div 
            className="h-1.5 rounded-full w-full"
            style={{ backgroundColor: colors.text, opacity: 0.15 }}
          />
          <div 
            className="h-1.5 rounded-full w-2/3"
            style={{ backgroundColor: colors.text, opacity: 0.15 }}
          />
        </div>

        {/* Table preview */}
        <div className="mx-3">
          <div className="h-3 rounded-sm" style={{ backgroundColor: colors.tableHeadBg }} />
          <div className="space-y-0.5 mt-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-2 rounded-sm" style={{ backgroundColor: colors.backgroundAlt }} />
            ))}
          </div>
        </div>

        {/* Total bar */}
        <div className="h-3 mx-3 mt-3 rounded-sm" style={{ backgroundColor: colors.totalBg }} />

        {/* Dark indicator */}
        {style.isDark && (
          <Badge variant="secondary" className="absolute top-1 right-1 text-[10px] px-1.5 py-0">
            DARK
          </Badge>
        )}
      </div>

      {/* Info */}
      <CardContent className="p-3 border-t">
        <p className="font-medium text-sm">{style.name}</p>
        <p className="text-xs text-muted-foreground">{style.description}</p>
      </CardContent>
    </Card>
  );
}

function TypeCard({ type }: { type: DocumentType }) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="flex items-center gap-3 p-4">
        <span className="text-2xl">{type.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{type.name}</p>
          <p className="text-xs text-muted-foreground truncate">{type.description}</p>
        </div>
        <Badge variant="outline" className="text-xs shrink-0">
          {type.nameEn}
        </Badge>
      </CardContent>
    </Card>
  );
}
