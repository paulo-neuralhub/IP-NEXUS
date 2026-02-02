// ============================================================
// IP-NEXUS - DOCUMENT TEMPLATE PICKER
// PROMPT 23: Selector de plantillas con preview
// ============================================================

import { useState } from 'react';
import { useDocumentTemplates, useTemplateCategories, type DocumentTemplate } from '@/hooks/use-document-templates';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileText,
  Shield,
  ClipboardList,
  FileSignature,
  ArrowLeftRight,
  Mail,
  FolderLock,
  Search,
  Check,
  Eye,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentTemplatePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (template: DocumentTemplate) => void;
  phase?: string;
  matterType?: string;
  jurisdiction?: string;
}

const CATEGORY_ICONS: Record<string, typeof FileText> = {
  commercial: FileText,
  powers: Shield,
  applications: ClipboardList,
  contracts: FileSignature,
  transfers: ArrowLeftRight,
  correspondence: Mail,
  internal: FolderLock,
};

export function DocumentTemplatePicker({
  open,
  onOpenChange,
  onSelect,
  phase,
  matterType,
  jurisdiction,
}: DocumentTemplatePickerProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplate | null>(null);

  const { data: categories, isLoading: loadingCategories } = useTemplateCategories();
  const { data: templates, isLoading: loadingTemplates } = useDocumentTemplates({
    phase,
    matterType,
    jurisdiction,
    search: search || undefined,
    categoryCode: selectedCategory !== 'all' ? selectedCategory : undefined,
  });

  const filteredTemplates = templates || [];

  const handleSelect = (template: DocumentTemplate) => {
    onSelect(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Seleccionar Plantilla de Documento
          </DialogTitle>
          <DialogDescription>
            Elige una plantilla para generar el documento. Las variables se rellenarán automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 h-[60vh]">
          {/* Left side: Categories & Templates */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar plantillas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="w-full flex-wrap h-auto gap-1 mb-4 justify-start bg-muted/50 p-1">
                <TabsTrigger value="all" className="text-xs">
                  Todas
                </TabsTrigger>
                {categories?.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.code] || FileText;
                  return (
                    <TabsTrigger key={cat.code} value={cat.code} className="text-xs gap-1">
                      <Icon className="w-3 h-3" />
                      {cat.name_es}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value={selectedCategory} className="mt-0 flex-1">
                <ScrollArea className="h-[400px] pr-4">
                  {loadingTemplates ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : filteredTemplates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>No se encontraron plantillas</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredTemplates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          isSelected={previewTemplate?.id === template.id}
                          onSelect={() => handleSelect(template)}
                          onPreview={() => setPreviewTemplate(template)}
                        />
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right side: Preview */}
          <div className="w-80 border-l pl-4">
            <h4 className="font-medium mb-3 text-sm text-muted-foreground">Vista previa</h4>
            {previewTemplate ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">{previewTemplate.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {previewTemplate.description || 'Sin descripción'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1">
                  {previewTemplate.requires_signature && (
                    <Badge variant="outline" className="text-xs">
                      <FileSignature className="w-3 h-3 mr-1" />
                      Requiere firma
                    </Badge>
                  )}
                  {previewTemplate.applicable_phases?.map((phase) => (
                    <Badge key={phase} variant="secondary" className="text-xs">
                      {phase}
                    </Badge>
                  ))}
                </div>

                {/* Variables list */}
                {previewTemplate.available_variables && previewTemplate.available_variables.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Variables ({previewTemplate.available_variables.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {previewTemplate.available_variables.slice(0, 8).map((v) => (
                        <Badge key={v.key} variant="outline" className="text-xs font-mono">
                          {v.key}
                        </Badge>
                      ))}
                      {previewTemplate.available_variables.length > 8 && (
                        <Badge variant="outline" className="text-xs">
                          +{previewTemplate.available_variables.length - 8} más
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Button onClick={() => handleSelect(previewTemplate)} className="w-full">
                  <Check className="w-4 h-4 mr-2" />
                  Usar esta plantilla
                </Button>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Selecciona una plantilla para ver los detalles
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =====================================================
// Template Card Component
// =====================================================

interface TemplateCardProps {
  template: DocumentTemplate;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
}

function TemplateCard({ template, isSelected, onSelect, onPreview }: TemplateCardProps) {
  const Icon = CATEGORY_ICONS[template.category_code || template.category || ''] || FileText;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:border-primary/50',
        isSelected && 'border-primary ring-1 ring-primary'
      )}
      onClick={onPreview}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
          )}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm truncate">{template.name}</h4>
              {template.is_system_template && (
                <Badge variant="secondary" className="text-[10px] px-1">Sistema</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {template.description || template.code}
            </p>
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onPreview();
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              <Check className="w-3 h-3 mr-1" />
              Usar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
