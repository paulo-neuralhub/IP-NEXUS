/**
 * L104: Generate Document Modal
 * Modal to generate documents from matter detail, with template selection and preview
 */

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, Sparkles, Loader2, Download, Save, 
  CheckCircle2, Tag, Scale, Lightbulb, Mail, BarChart, Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GenerateDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matterId: string;
  matterReference?: string;
  preselectedTemplateId?: string;
}

const CATEGORY_ICONS: Record<string, typeof FileText> = {
  trademark: Tag,
  patent: Lightbulb,
  contract: Scale,
  correspondence: Mail,
  report: BarChart,
  other: FileText,
};

export function GenerateDocumentModal({
  open,
  onOpenChange,
  matterId,
  matterReference,
  preselectedTemplateId,
}: GenerateDocumentModalProps) {
  const queryClient = useQueryClient();
  const { currentOrganization: organization } = useOrganization();
  const { user } = useAuth();

  const [selectedTemplateId, setSelectedTemplateId] = useState(preselectedTemplateId || '');
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [generatedContent, setGeneratedContent] = useState('');
  const [activeTab, setActiveTab] = useState<'select' | 'preview'>('select');

  // Reset on open
  useEffect(() => {
    if (open) {
      setSelectedTemplateId(preselectedTemplateId || '');
      setCustomValues({});
      setGeneratedContent('');
      setActiveTab('select');
    }
  }, [open, preselectedTemplateId]);

  // Fetch available templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['document-templates-for-modal', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_templates')
        .select('id, name, description, category, template_type, template_content')
        .or(`organization_id.is.null,organization_id.eq.${organization?.id}`)
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: open && !!organization?.id,
  });

  // Fetch matter details for merge
  const { data: matter } = useQuery({
    queryKey: ['matter-for-document', matterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matters')
        .select('*')
        .eq('id', matterId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: open && !!matterId,
  });

  // Get selected template
  const selectedTemplate = useMemo(() => 
    templates?.find(t => t.id === selectedTemplateId),
    [templates, selectedTemplateId]
  );

  // Build merge data from matter
  const mergeData = useMemo(() => {
    if (!matter || !organization) return {};

    return {
      // Client/Account
      'client.name': (matter as Record<string, unknown>).client_name as string || '',
      'client.legal_name': '',
      'client.tax_id': '',
      'client.address': '',
      'client.city': '',
      'client.country': '',
      'client.email': '',
      'client.phone': '',
      // Contact
      'contact.name': '',
      'contact.email': '',
      'contact.phone': '',
      'contact.position': '',
      // Matter
      'matter.reference': matter.reference || '',
      'matter.title': matter.title || '',
      'matter.type': matter.mark_type || '',
      'matter.ip_type': matter.ip_type || '',
      'matter.jurisdiction': matter.jurisdiction || '',
      'matter.application_number': matter.application_number || '',
      'matter.registration_number': matter.registration_number || '',
      'matter.filing_date': matter.filing_date ? format(new Date(matter.filing_date), 'dd/MM/yyyy') : '',
      'matter.registration_date': matter.registration_date ? format(new Date(matter.registration_date), 'dd/MM/yyyy') : '',
      'matter.expiry_date': matter.expiry_date ? format(new Date(matter.expiry_date), 'dd/MM/yyyy') : '',
      'matter.nice_classes': Array.isArray(matter.nice_classes) ? matter.nice_classes.join(', ') : '',
      'matter.mark_name': matter.mark_name || '',
      // Organization
      'org.name': organization.name || '',
      'org.address': '', // Would come from org settings
      'org.phone': '',
      'org.email': '',
      // User
      'user.name': user?.email?.split('@')[0] || '',
      'user.email': user?.email || '',
      'user.position': '',
      // Dates
      'today': format(new Date(), 'dd/MM/yyyy'),
      'today.long': format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }),
      'year': new Date().getFullYear().toString(),
      // Special
      'signature_placeholder': '\n\n_________________________\nFirma\n\n',
      'page_break': '\n\n---\n\n',
    };
  }, [matter, organization, user]);

  // Generate preview content
  const previewContent = useMemo(() => {
    if (!selectedTemplate?.template_content) return '';

    let content = selectedTemplate.template_content;
    const allData = { ...mergeData, ...customValues };

    Object.entries(allData).forEach(([key, value]) => {
      content = content.replace(
        new RegExp(`\\{\\{${key.replace('.', '\\.')}\\}\\}`, 'g'),
        String(value)
      );
    });

    return content;
  }, [selectedTemplate, mergeData, customValues]);

  // Generate document mutation (for AI-assisted)
  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-document-ai', {
        body: {
          templateId: selectedTemplateId,
          matterId,
          variables: { ...mergeData, ...customValues },
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      setActiveTab('preview');
      toast.success('Documento generado con IA');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Save document mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!organization?.id) throw new Error('No organization');

      const content = generatedContent || previewContent;

      const { data, error } = await supabase
        .from('generated_documents')
        .insert({
          organization_id: organization.id,
          template_id: selectedTemplateId,
          matter_id: matterId,
          name: `${selectedTemplate?.name || 'Documento'} - ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
          content,
          variables_input: { ...mergeData, ...customValues },
          status: 'draft',
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-documents'] });
      queryClient.invalidateQueries({ queryKey: ['matter-documents'] });
      toast.success('Documento guardado en el expediente');
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setActiveTab('preview');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Generar documento
          </DialogTitle>
          <DialogDescription>
            {matterReference && `Expediente: ${matterReference}`}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'select' | 'preview')} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-2 w-[300px]">
            <TabsTrigger value="select">Seleccionar</TabsTrigger>
            <TabsTrigger value="preview" disabled={!selectedTemplateId}>Vista previa</TabsTrigger>
          </TabsList>

          {/* Template Selection */}
          <TabsContent value="select" className="flex-1 overflow-hidden mt-4">
            {templatesLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-2 gap-4">
                  {templates?.map((template) => {
                    const CategoryIcon = CATEGORY_ICONS[template.category] || FileText;
                    const isSelected = template.id === selectedTemplateId;

                    return (
                      <Card
                        key={template.id}
                        className={cn(
                          "p-4 cursor-pointer transition-all hover:shadow-md",
                          isSelected && "ring-2 ring-primary bg-primary/5"
                        )}
                        onClick={() => handleSelectTemplate(template.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                          )}>
                            <CategoryIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium truncate">{template.name}</h4>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {template.description || 'Sin descripción'}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {template.category}
                              </Badge>
                              {template.template_type === 'ai_assisted' && (
                                <Badge className="text-xs bg-primary/20 text-primary border-0">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  IA
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}

                  {templates?.length === 0 && (
                    <div className="col-span-2 text-center py-12 text-muted-foreground">
                      No hay plantillas disponibles
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Preview */}
          <TabsContent value="preview" className="flex-1 overflow-hidden mt-4">
            <div className="flex gap-4 h-[400px]">
              {/* Custom values sidebar */}
              <div className="w-64 border rounded-lg p-4 overflow-auto">
                <h4 className="font-medium text-sm mb-3">Datos del documento</h4>
                <div className="space-y-3">
                  {/* Show some key auto-filled values */}
                  {mergeData['client.name'] && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Cliente:</span>
                      <span className="ml-1 font-medium">{mergeData['client.name']}</span>
                    </div>
                  )}
                  {mergeData['matter.reference'] && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Referencia:</span>
                      <span className="ml-1 font-medium">{mergeData['matter.reference']}</span>
                    </div>
                  )}
                  {mergeData['matter.mark_name'] && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Marca:</span>
                      <span className="ml-1 font-medium">{mergeData['matter.mark_name']}</span>
                    </div>
                  )}

                  <div className="border-t pt-3 mt-3">
                    <Label className="text-xs">Personalizar valores</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Puedes sobrescribir cualquier campo
                    </p>
                    
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Saludo personalizado</Label>
                        <Input
                          value={customValues['custom_greeting'] || ''}
                          onChange={(e) => setCustomValues(prev => ({
                            ...prev,
                            'custom_greeting': e.target.value
                          }))}
                          placeholder="Ej: Estimado Sr. García"
                          className="text-xs h-8"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview content */}
              <Card className="flex-1 overflow-auto p-6 bg-muted/30">
                <div className="max-w-[600px] mx-auto bg-background p-6 shadow-sm rounded border whitespace-pre-wrap font-serif text-sm">
                  {generatedContent || previewContent || (
                    <p className="text-muted-foreground text-center">
                      Selecciona una plantilla para ver la vista previa
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>

          {selectedTemplate?.template_type === 'ai_assisted' && activeTab === 'preview' && (
            <Button
              variant="outline"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Generar con IA
            </Button>
          )}

          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!selectedTemplateId || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Guardar documento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
