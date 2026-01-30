// src/pages/app/settings/templates/[id]/edit.tsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useDocumentTemplates, DocumentTemplate, TemplateLayout } from '@/hooks/useDocumentTemplates';
import { useTemplateVariables } from '@/hooks/useDocumentTemplates';
import { useTemplatePreview } from '@/hooks/useTemplatePreview';
import { 
  ArrowLeft, Save, Settings2, Eye, Type, Hash, 
  Loader2, RefreshCw, Download, ChevronDown, Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LAYOUTS: { value: TemplateLayout; label: string }[] = [
  { value: 'classic', label: 'Clásico' },
  { value: 'modern', label: 'Moderno' },
  { value: 'minimal', label: 'Minimalista' },
  { value: 'corporate', label: 'Corporativo' },
  { value: 'certificate', label: 'Certificado' },
  { value: 'letter', label: 'Carta' },
];

export default function TemplateEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { updateTemplate, isUpdating } = useDocumentTemplates();
  const { generatePreview, sampleData } = useTemplatePreview();

  // Fetch template
  const { data: template, isLoading } = useQuery({
    queryKey: ['document-template', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as DocumentTemplate;
    },
    enabled: !!id,
  });

  // Fetch variables for this document type
  const { groupedVariables } = useTemplateVariables(template?.document_type);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    layout: 'classic' as TemplateLayout,
    show_logo: true,
    show_header: true,
    show_footer: true,
    numbering_prefix: '',
    numbering_suffix: '',
    numbering_digits: 4,
    is_default: false,
    custom_texts: {} as Record<string, string>,
  });

  const [previewHtml, setPreviewHtml] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || '',
        layout: template.layout,
        show_logo: template.show_logo,
        show_header: template.show_header,
        show_footer: template.show_footer,
        numbering_prefix: template.numbering_prefix || '',
        numbering_suffix: template.numbering_suffix || '',
        numbering_digits: template.numbering_digits,
        is_default: template.is_default,
        custom_texts: (template.custom_texts as Record<string, string>) || {},
      });
      // Generate initial preview - use content_html which has the full HTML
      handleRefreshPreview(template.content_html || template.template_content);
    }
  }, [template]);

  const handleRefreshPreview = useCallback(async (content?: string) => {
    setIsRefreshing(true);
    try {
      // Use content_html which has the full HTML, fallback to template_content
      const templateHtml = content || template?.content_html || template?.template_content || '';
      const html = await generatePreview(templateHtml);
      setPreviewHtml(html);
    } finally {
      setIsRefreshing(false);
    }
  }, [generatePreview, template?.content_html, template?.template_content]);

  const handleSave = async () => {
    if (!id) return;
    try {
      await updateTemplate(id, {
        name: formData.name,
        description: formData.description || null,
        layout: formData.layout,
        show_logo: formData.show_logo,
        show_header: formData.show_header,
        show_footer: formData.show_footer,
        numbering_prefix: formData.numbering_prefix || null,
        numbering_suffix: formData.numbering_suffix || null,
        numbering_digits: formData.numbering_digits,
        is_default: formData.is_default,
        custom_texts: formData.custom_texts,
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const updateField = (field: string, value: unknown) => {
    setFormData(f => ({ ...f, [field]: value }));
  };

  const updateCustomText = (key: string, value: string) => {
    setFormData(f => ({
      ...f,
      custom_texts: { ...f.custom_texts, [key]: value },
    }));
  };

  const copyVariable = (code: string) => {
    navigator.clipboard.writeText(`{{${code}}}`);
    toast({ title: 'Variable copiada', description: `{{${code}}}` });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!template) {
    return <div>Plantilla no encontrada</div>;
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/app/settings/templates/${template.document_type}`}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">Editar: {template.name}</h1>
            <p className="text-sm text-muted-foreground">
              {template.is_system_template && (
                <Badge variant="outline" className="mr-2">Plantilla del sistema</Badge>
              )}
              Tipo: {template.document_type}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Guardar
        </Button>
      </div>

      {/* Main content - two columns */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left panel - Settings */}
        <div className="w-[400px] flex-shrink-0">
          <Card className="h-full flex flex-col">
            <CardHeader className="py-3 flex-shrink-0">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full px-6 pb-6">
                <Tabs defaultValue="general" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="texts">Textos</TabsTrigger>
                    <TabsTrigger value="variables">Variables</TabsTrigger>
                  </TabsList>

                  {/* General Tab */}
                  <TabsContent value="general" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Descripción</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        rows={2}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Layout</Label>
                      <Select 
                        value={formData.layout} 
                        onValueChange={(v) => updateField('layout', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LAYOUTS.map(l => (
                            <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Mostrar logo</Label>
                        <Switch
                          checked={formData.show_logo}
                          onCheckedChange={(v) => updateField('show_logo', v)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Mostrar cabecera</Label>
                        <Switch
                          checked={formData.show_header}
                          onCheckedChange={(v) => updateField('show_header', v)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Mostrar pie</Label>
                        <Switch
                          checked={formData.show_footer}
                          onCheckedChange={(v) => updateField('show_footer', v)}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Numeración
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Prefijo</Label>
                          <Input
                            value={formData.numbering_prefix}
                            onChange={(e) => updateField('numbering_prefix', e.target.value)}
                            placeholder="INV-"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Dígitos</Label>
                          <Input
                            type="number"
                            value={formData.numbering_digits}
                            onChange={(e) => updateField('numbering_digits', parseInt(e.target.value) || 4)}
                            min={1}
                            max={10}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Sufijo</Label>
                          <Input
                            value={formData.numbering_suffix}
                            onChange={(e) => updateField('numbering_suffix', e.target.value)}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Ejemplo: {formData.numbering_prefix}2025-{'0'.repeat(formData.numbering_digits - 1)}1{formData.numbering_suffix}
                      </p>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <Label>Usar por defecto</Label>
                      <Switch
                        checked={formData.is_default}
                        onCheckedChange={(v) => updateField('is_default', v)}
                      />
                    </div>
                  </TabsContent>

                  {/* Texts Tab */}
                  <TabsContent value="texts" className="space-y-4 mt-4">
                    {Object.entries((template.custom_texts as Record<string, string>) || {}).map(([key, defaultValue]) => (
                      <div key={key} className="space-y-2">
                        <Label className="capitalize">{key.replace(/_/g, ' ')}</Label>
                        <Input
                          value={formData.custom_texts[key] ?? defaultValue}
                          onChange={(e) => updateCustomText(key, e.target.value)}
                        />
                      </div>
                    ))}
                    {Object.keys((template.custom_texts as Record<string, string>) || {}).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Esta plantilla no tiene textos personalizables
                      </p>
                    )}
                  </TabsContent>

                  {/* Variables Tab */}
                  <TabsContent value="variables" className="space-y-2 mt-4">
                    <p className="text-xs text-muted-foreground mb-3">
                      Haz clic en una variable para copiarla
                    </p>
                    {Object.entries(groupedVariables).map(([group, vars]) => (
                      <Collapsible key={group} defaultOpen>
                        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:bg-muted/50 rounded px-2">
                          {group}
                          <ChevronDown className="w-4 h-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-1 ml-2">
                          {vars.map((v) => (
                            <button
                              key={v.id}
                              onClick={() => copyVariable(v.variable_code)}
                              className="flex items-center justify-between w-full p-2 text-left text-sm hover:bg-muted rounded group"
                            >
                              <div>
                                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                  {`{{${v.variable_code}}}`}
                                </code>
                                <span className="text-muted-foreground ml-2 text-xs">
                                  {v.variable_name}
                                </span>
                              </div>
                              <Copy className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                            </button>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right panel - Preview */}
        <div className="flex-1 min-w-0">
          <Card className="h-full flex flex-col">
            <CardHeader className="py-3 flex-shrink-0 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Vista Previa
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleRefreshPreview()}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-4">
              <div className="h-full bg-muted rounded-lg overflow-auto p-4">
                <div 
                  className="bg-background shadow-lg mx-auto max-w-[210mm] min-h-[297mm] p-8"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
