// ════════════════════════════════════════════════════════════════════════════
// src/components/documents/TemplateSelector.tsx
// PROMPT 5: Template selector for PI document generation
// ════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { FileText, Wand2, Search, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePIDocumentTemplates } from '@/hooks/usePIDocumentTemplates';
import { usePIGenerateDocument, usePIDocumentPreview } from '@/hooks/usePIDocumentGeneration';
import { DOCUMENT_CATEGORIES, type PIDocumentTemplate, type DocumentCategory } from '@/types/documents';
import { cn } from '@/lib/utils';

interface TemplateSelectorProps {
  matterId: string;
  rightType?: string;
  jurisdictionId?: string;
  currentPhase?: string;
  onGenerated?: () => void;
  trigger?: React.ReactNode;
}

export function TemplateSelector({
  matterId,
  rightType,
  jurisdictionId,
  currentPhase,
  onGenerated,
  trigger,
}: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<PIDocumentTemplate | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  const { data: templates, isLoading } = usePIDocumentTemplates({
    category: selectedCategory !== 'all' ? selectedCategory as DocumentCategory : undefined,
    rightType,
    jurisdictionId,
    phase: currentPhase,
    search: search || undefined,
  });

  const generateDocument = usePIGenerateDocument();
  const previewDocument = usePIDocumentPreview();

  const handlePreview = async (template: PIDocumentTemplate) => {
    setSelectedTemplate(template);
    try {
      const result = await previewDocument.mutateAsync({
        templateId: template.id,
        matterId,
      });
      setPreviewContent(result.content);
    } catch (error) {
      console.error('Preview failed:', error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    await generateDocument.mutateAsync({
      matterId,
      templateId: selectedTemplate.id,
    });

    setIsOpen(false);
    setSelectedTemplate(null);
    setPreviewContent(null);
    onGenerated?.();
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedTemplate(null);
    setPreviewContent(null);
    setSearch('');
    setSelectedCategory('all');
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          <Wand2 className="h-4 w-4 mr-2" />
          Generar desde Plantilla
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-5xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generar Documento desde Plantilla
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 h-[60vh]">
            {/* Template List */}
            <div className="flex flex-col gap-3 border-r pr-4">
              {/* Search & Filters */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar plantillas..."
                    className="pl-9"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {Object.entries(DOCUMENT_CATEGORIES).map(([key, { label, icon }]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <span>{icon}</span>
                          <span>{label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Templates */}
              <ScrollArea className="flex-1">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !templates || templates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No se encontraron plantillas
                  </div>
                ) : (
                  <div className="space-y-2 pr-2">
                    {templates.map((template) => {
                      const catInfo = DOCUMENT_CATEGORIES[template.category as DocumentCategory];
                      const isSelected = selectedTemplate?.id === template.id;

                      return (
                        <Card
                          key={template.id}
                          className={cn(
                            'cursor-pointer transition-all hover:shadow-md',
                            isSelected && 'ring-2 ring-primary'
                          )}
                          onClick={() => handlePreview(template)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2 min-w-0">
                                <span className="text-lg shrink-0">{catInfo?.icon || '📄'}</span>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {template.name_en}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {template.code}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {template.jurisdiction && (
                                  <Badge variant="outline" className="text-xs">
                                    {template.jurisdiction.code}
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePreview(template);
                                  }}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Preview */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Vista Previa</h4>
                {selectedTemplate && (
                  <Badge variant="secondary">{selectedTemplate.code}</Badge>
                )}
              </div>
              <div className="flex-1 border rounded-lg overflow-hidden bg-white">
                {previewDocument.isPending ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : previewContent ? (
                  <iframe
                    srcDoc={previewContent}
                    className="w-full h-full"
                    title="Document Preview"
                    sandbox="allow-same-origin"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <FileText className="h-12 w-12 mb-2 opacity-50" />
                    <p className="text-sm">Selecciona una plantilla para previsualizarla</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!selectedTemplate || generateDocument.isPending}
            >
              {generateDocument.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              Generar Documento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TemplateSelector;
