// ============================================================
// IP-NEXUS - DOCUMENT GENERATOR DIALOG
// Simplified dialog for generating documents from phases
// ============================================================

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Eye, Download, Loader2, Check, ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { renderTemplate, previewTemplate } from '@/lib/templateEngine';
import { resolveVariables, type VariableContext } from '@/lib/document-variable-resolver';
import { toast } from 'sonner';

interface Matter {
  id: string;
  reference?: string;
  title?: string;
  denomination?: string;
  type?: string;
  jurisdiction?: string;
  office_code?: string;
  classes?: number[];
  client_id?: string;
  client?: {
    id: string;
    name: string;
    email?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country?: string;
    tax_id?: string;
    is_company?: boolean;
    representative_name?: string;
    representative_title?: string;
  };
  organization_id?: string;
  [key: string]: unknown;
}

interface TemplateVariable {
  key: string;
  label_es?: string;
  label_en?: string;
  source?: string;
  type?: 'text' | 'date' | 'number' | 'boolean' | 'array';
  required?: boolean;
}

interface DocumentTemplate {
  id: string;
  code: string | null;
  name: string;
  description?: string | null;
  template_content: string;
  available_variables?: unknown;
  category?: string;
  category_code?: string | null;
  requires_signature?: boolean | null;
}

interface DocumentGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matter: Matter;
  initialTemplate?: string | null;
  applicablePhase?: string;
  onDocumentGenerated?: (doc: unknown) => void;
}

export function DocumentGeneratorDialog({
  open,
  onOpenChange,
  matter,
  initialTemplate,
  applicablePhase,
  onDocumentGenerated
}: DocumentGeneratorDialogProps) {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, unknown>>({});
  const [previewHtml, setPreviewHtml] = useState('');
  const [activeTab, setActiveTab] = useState<'select' | 'fill' | 'preview'>('select');
  
  // Load available templates
  const { data: templates, isLoading: loadingTemplates } = useQuery({
    queryKey: ['document-templates', applicablePhase],
    queryFn: async () => {
      let query = supabase
        .from('document_templates')
        .select('*, category:category_code')
        .eq('is_active', true);
      
      if (applicablePhase) {
        query = query.contains('applicable_phases', [applicablePhase]);
      }
      
      const { data, error } = await query.order('name_es');
      if (error) throw error;
      return (data || []) as DocumentTemplate[];
    },
    enabled: open
  });
  
  // Load tenant settings
  const { data: tenantSettings } = useQuery({
    queryKey: ['tenant-settings', matter.organization_id],
    queryFn: async () => {
      if (!matter.organization_id) return null;
      
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', matter.organization_id)
        .single();
      
      return data;
    },
    enabled: open && !!matter.organization_id
  });
  
  // Select initial template if provided
  useEffect(() => {
    if (initialTemplate && templates) {
      const template = templates.find(t => t.code === initialTemplate);
      if (template) {
        handleSelectTemplate(template);
      }
    }
  }, [initialTemplate, templates]);
  
  // Reset on close
  useEffect(() => {
    if (!open) {
      setSelectedTemplate(null);
      setVariables({});
      setPreviewHtml('');
      setActiveTab('select');
    }
  }, [open]);
  
  // Select a template and initialize variables
  const handleSelectTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    
    // Build context for variable resolution
    const context: VariableContext = {
      matter: matter as VariableContext['matter'],
      client: matter.client as VariableContext['client'],
      tenant: tenantSettings as VariableContext['tenant'],
    };
    
    // Resolve automatic variables
    const resolvedVars = resolveVariables(context);
    setVariables(resolvedVars);
    
    setActiveTab('fill');
  };
  
  // Update a variable
  const updateVariable = (key: string, value: unknown) => {
    setVariables(prev => ({ ...prev, [key]: value }));
  };
  
  // Generate preview
  const handleGeneratePreview = () => {
    if (!selectedTemplate) return;
    
    try {
      const html = renderTemplate(selectedTemplate.template_content, variables);
      setPreviewHtml(html);
      setActiveTab('preview');
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Error al generar vista previa');
    }
  };
  
  // Generate final document
  const generateDocument = useMutation({
    mutationFn: async () => {
      if (!selectedTemplate) throw new Error('No template selected');
      
      // Render final HTML
      const html = renderTemplate(selectedTemplate.template_content, variables);
      
      // Generate document number
      const docNumber = `DOC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      // Save to database
      const { data, error } = await supabase
        .from('generated_documents')
        .insert({
          organization_id: matter.organization_id || '',
          matter_id: matter.id,
          template_id: selectedTemplate.id,
          name: selectedTemplate.name,
          document_number: docNumber,
          title: selectedTemplate.name,
          category: selectedTemplate.category || 'other',
          content: html,
          content_html: html,
          variables_used: variables,
          status: 'draft'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (doc) => {
      toast.success('Documento generado correctamente');
      queryClient.invalidateQueries({ queryKey: ['generated-documents'] });
      onDocumentGenerated?.(doc);
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error generating document:', error);
      toast.error('Error al generar documento');
    }
  });
  
  // Get input variables that need user input
  const getInputVariables = (): TemplateVariable[] => {
    if (!selectedTemplate?.available_variables) return [];
    const vars = selectedTemplate.available_variables;
    if (!Array.isArray(vars)) return [];
    return (vars as TemplateVariable[]).filter(v => v.source === 'input');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <DialogTitle>Generador de Documentos</DialogTitle>
          </div>
        </DialogHeader>
        
        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-3 mx-6 mt-4 max-w-md">
            <TabsTrigger value="select">1. Seleccionar</TabsTrigger>
            <TabsTrigger value="fill" disabled={!selectedTemplate}>2. Completar</TabsTrigger>
            <TabsTrigger value="preview" disabled={!selectedTemplate}>3. Revisar</TabsTrigger>
          </TabsList>
          
          {/* Template Selection */}
          <TabsContent value="select" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <div className="p-6 grid gap-3">
                {loadingTemplates ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : templates?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No hay plantillas disponibles</p>
                  </div>
                ) : (
                  templates?.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate?.id === template.id 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : ''
                      }`}
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{template.name}</p>
                          {template.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {template.description}
                            </p>
                          )}
                        </div>
                        {template.requires_signature && (
                          <Badge variant="outline">Requiere firma</Badge>
                        )}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          {/* Fill Variables */}
          <TabsContent value="fill" className="flex-1 overflow-hidden m-0">
            {selectedTemplate && (
              <div className="flex flex-col h-full">
                <ScrollArea className="flex-1">
                  <div className="p-6 space-y-6">
                    <p className="text-sm text-muted-foreground">
                      Complete los campos requeridos para el documento:
                    </p>
                    
                    {/* Input variables */}
                    {getInputVariables().map((v) => (
                      <div key={v.key} className="space-y-2">
                        <Label>
                          {v.label_es || v.key}
                          {v.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        {v.type === 'date' ? (
                          <Input
                            type="date"
                            value={String(variables[v.key] || '')}
                            onChange={(e) => updateVariable(v.key, e.target.value)}
                          />
                        ) : v.type === 'boolean' ? (
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={String(variables[v.key] || 'false')}
                            onChange={(e) => updateVariable(v.key, e.target.value === 'true')}
                          >
                            <option value="false">No</option>
                            <option value="true">Sí</option>
                          </select>
                        ) : v.type === 'number' ? (
                          <Input
                            type="number"
                            value={String(variables[v.key] || '')}
                            onChange={(e) => updateVariable(v.key, parseFloat(e.target.value))}
                            placeholder={v.label_es}
                          />
                        ) : (
                          <Input
                            value={String(variables[v.key] || '')}
                            onChange={(e) => updateVariable(v.key, e.target.value)}
                            placeholder={v.label_es}
                          />
                        )}
                        {v.source && v.source !== 'input' && (
                          <p className="text-xs text-muted-foreground">
                            Auto: {v.source}
                          </p>
                        )}
                      </div>
                    ))}
                    
                    {getInputVariables().length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Check className="h-12 w-12 mx-auto mb-4 text-primary" />
                        <p>Todos los campos se completaron automáticamente</p>
                        <p className="text-sm mt-1">
                          Los datos del expediente y cliente se han usado para rellenar el documento.
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="p-4 border-t bg-muted/20">
                  <Button onClick={handleGeneratePreview} className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver vista previa
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Preview */}
          <TabsContent value="preview" className="flex-1 overflow-hidden m-0">
            <div className="flex flex-col h-full">
              <ScrollArea className="flex-1">
                <div className="p-6">
                  <div 
                    className="bg-white border shadow-sm rounded-lg p-8 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t bg-muted/20 flex items-center justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('fill')}
                >
                  Modificar datos
                </Button>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => generateDocument.mutate()}
                    disabled={generateDocument.isPending}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar borrador
                  </Button>
                  <Button 
                    onClick={() => generateDocument.mutate()}
                    disabled={generateDocument.isPending}
                  >
                    {generateDocument.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Generar documento
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
