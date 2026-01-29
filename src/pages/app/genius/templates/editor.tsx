/**
 * L104: Template Editor Page
 * Full-featured editor with merge fields sidebar and live preview
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChevronLeft, Save, Loader2, Plus, Eye, Code, 
  FileText, Tag, Scale, Lightbulb, Mail, BarChart,
  Building2, User, Calendar, Briefcase, Hash, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { TemplateCategory, TemplateType, OutputFormat, TemplateVariable } from '@/types/document-generation';

// ============================================================
// MERGE FIELDS CONFIGURATION
// ============================================================

const MERGE_FIELD_GROUPS = {
  client: {
    label: 'Cliente',
    icon: Building2,
    color: 'text-primary',
    fields: [
      { key: 'client.name', label: 'Nombre del cliente' },
      { key: 'client.legal_name', label: 'Razón social' },
      { key: 'client.tax_id', label: 'NIF/CIF' },
      { key: 'client.address', label: 'Dirección' },
      { key: 'client.city', label: 'Ciudad' },
      { key: 'client.country', label: 'País' },
      { key: 'client.email', label: 'Email' },
      { key: 'client.phone', label: 'Teléfono' },
    ]
  },
  contact: {
    label: 'Contacto',
    icon: User,
    color: 'text-crm',
    fields: [
      { key: 'contact.name', label: 'Nombre del contacto' },
      { key: 'contact.email', label: 'Email' },
      { key: 'contact.phone', label: 'Teléfono' },
      { key: 'contact.position', label: 'Cargo' },
    ]
  },
  matter: {
    label: 'Expediente',
    icon: Briefcase,
    color: 'text-docket',
    fields: [
      { key: 'matter.reference', label: 'Referencia' },
      { key: 'matter.title', label: 'Título' },
      { key: 'matter.type', label: 'Tipo de expediente' },
      { key: 'matter.ip_type', label: 'Tipo de PI' },
      { key: 'matter.jurisdiction', label: 'Jurisdicción' },
      { key: 'matter.application_number', label: 'Nº solicitud' },
      { key: 'matter.registration_number', label: 'Nº registro' },
      { key: 'matter.filing_date', label: 'Fecha presentación' },
      { key: 'matter.registration_date', label: 'Fecha registro' },
      { key: 'matter.expiry_date', label: 'Fecha vencimiento' },
      { key: 'matter.nice_classes', label: 'Clases Nice' },
      { key: 'matter.mark_name', label: 'Nombre marca' },
    ]
  },
  org: {
    label: 'Organización',
    icon: Building2,
    color: 'text-success',
    fields: [
      { key: 'org.name', label: 'Nombre despacho' },
      { key: 'org.address', label: 'Dirección' },
      { key: 'org.phone', label: 'Teléfono' },
      { key: 'org.email', label: 'Email' },
    ]
  },
  user: {
    label: 'Usuario',
    icon: User,
    color: 'text-warning',
    fields: [
      { key: 'user.name', label: 'Tu nombre' },
      { key: 'user.email', label: 'Tu email' },
      { key: 'user.position', label: 'Tu cargo' },
    ]
  },
  dates: {
    label: 'Fechas',
    icon: Calendar,
    color: 'text-spider',
    fields: [
      { key: 'today', label: 'Fecha de hoy' },
      { key: 'today.long', label: 'Fecha (formato largo)' },
      { key: 'year', label: 'Año actual' },
    ]
  },
  special: {
    label: 'Especiales',
    icon: Hash,
    color: 'text-muted-foreground',
    fields: [
      { key: 'signature_placeholder', label: 'Espacio para firma' },
      { key: 'page_break', label: 'Salto de página' },
    ]
  }
};

const CATEGORIES: { id: TemplateCategory; label: string; icon: typeof FileText }[] = [
  { id: 'trademark', label: 'Marcas', icon: Tag },
  { id: 'patent', label: 'Patentes', icon: Lightbulb },
  { id: 'contract', label: 'Contratos', icon: Scale },
  { id: 'correspondence', label: 'Correspondencia', icon: Mail },
  { id: 'report', label: 'Informes', icon: BarChart },
  { id: 'other', label: 'Otro', icon: FileText },
];

// ============================================================
// COMPONENT
// ============================================================

export default function TemplateEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentOrganization: organization } = useOrganization();
  const { user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isNew = id === 'new';

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('correspondence');
  const [templateType, setTemplateType] = useState<TemplateType>('fill_blanks');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('markdown');
  const [content, setContent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [aiSystemPrompt, setAiSystemPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // Query existing template
  const { data: template, isLoading } = useQuery({
    queryKey: ['document-template', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !isNew && !!id,
  });

  // Load template data
  useEffect(() => {
    if (template) {
      setName(template.name || '');
      setDescription(template.description || '');
      setCategory((template.category as TemplateCategory) || 'correspondence');
      setTemplateType((template.template_type as TemplateType) || 'fill_blanks');
      setOutputFormat((template.output_format as OutputFormat) || 'markdown');
      setContent(template.template_content || '');
      setIsActive(template.is_active !== false);
      setAiSystemPrompt(template.ai_system_prompt || '');
    }
  }, [template]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!organization?.id) throw new Error('No organization');

      const templateData = {
        organization_id: organization.id,
        name,
        description: description || null,
        category,
        template_type: templateType,
        template_content: content,
        output_format: outputFormat,
        is_active: isActive,
        ai_system_prompt: aiSystemPrompt || null,
        updated_at: new Date().toISOString(),
      };

      if (isNew) {
        const { data, error } = await supabase
          .from('document_templates')
          .insert({
            ...templateData,
            created_by: user?.id,
            is_public: false,
            usage_count: 0,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('document_templates')
          .update(templateData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast.success(isNew ? 'Plantilla creada' : 'Plantilla guardada');
      if (isNew) {
        navigate(`/app/genius/templates/edit/${data.id}`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Insert merge field at cursor
  const insertField = (fieldKey: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const fieldText = `{{${fieldKey}}}`;
    
    const newContent = content.substring(0, start) + fieldText + content.substring(end);
    setContent(newContent);

    // Restore cursor position after field
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + fieldText.length, start + fieldText.length);
    }, 0);
  };

  // Render preview with sample data
  const renderPreview = () => {
    const sampleData: Record<string, string> = {
      'client.name': 'ACME Corporation S.L.',
      'client.legal_name': 'ACME Corporation S.L.',
      'client.tax_id': 'B12345678',
      'client.address': 'Calle Mayor 123, 28001 Madrid',
      'client.city': 'Madrid',
      'client.country': 'España',
      'client.email': 'info@acme.com',
      'client.phone': '+34 91 123 4567',
      'contact.name': 'Juan García',
      'contact.email': 'juan.garcia@acme.com',
      'contact.phone': '+34 612 345 678',
      'contact.position': 'Director Legal',
      'matter.reference': 'TM-ES-2026-ABC-0001',
      'matter.title': 'Registro marca ACME',
      'matter.type': 'trademark',
      'matter.ip_type': 'Marca',
      'matter.jurisdiction': 'ES',
      'matter.application_number': 'M-4123456',
      'matter.registration_number': 'M-4123456',
      'matter.filing_date': '15/01/2026',
      'matter.registration_date': '15/07/2026',
      'matter.expiry_date': '15/01/2036',
      'matter.nice_classes': '9, 35, 42',
      'matter.mark_name': 'ACME',
      'org.name': 'García & Asociados IP',
      'org.address': 'Paseo de la Castellana 50, 28046 Madrid',
      'org.phone': '+34 91 987 6543',
      'org.email': 'info@garciaip.com',
      'user.name': 'Ana Rodríguez',
      'user.email': 'ana.rodriguez@garciaip.com',
      'user.position': 'Abogada Senior',
      'today': new Date().toLocaleDateString('es-ES'),
      'today.long': new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      'year': new Date().getFullYear().toString(),
      'signature_placeholder': '\n\n_________________________\nFirma\n\n',
      'page_break': '\n--- Salto de página ---\n',
    };

    let preview = content;
    Object.entries(sampleData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`\\{\\{${key.replace('.', '\\.')}\\}\\}`, 'g'), value);
    });

    return preview;
  };

  if (!isNew && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-6">
          <Skeleton className="w-64 h-[600px]" />
          <Skeleton className="flex-1 h-[600px]" />
          <Skeleton className="w-96 h-[600px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/genius/templates')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              {isNew ? 'Nueva plantilla' : 'Editar plantilla'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Editor con campos dinámicos y vista previa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label className="text-sm">Activa</Label>
          </div>
          
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !name.trim()}
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Guardar
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 pt-4 overflow-hidden">
        {/* Left Sidebar: Merge Fields */}
        <Card className="w-64 flex flex-col">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm">Campos disponibles</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-4">
              {Object.entries(MERGE_FIELD_GROUPS).map(([groupKey, group]) => {
                const Icon = group.icon;
                return (
                  <div key={groupKey}>
                    <div className={cn("flex items-center gap-2 mb-2 text-sm font-medium", group.color)}>
                      <Icon className="w-4 h-4" />
                      {group.label}
                    </div>
                    <div className="space-y-1">
                      {group.fields.map((field) => (
                        <TooltipProvider key={field.key}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-xs h-7 px-2"
                                onClick={() => insertField(field.key)}
                              >
                                <Plus className="w-3 h-3 mr-1 opacity-50" />
                                {field.label}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <code className="text-xs">{`{{${field.key}}}`}</code>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </Card>

        {/* Center: Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Template info bar */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre de la plantilla *"
                className="font-medium"
              />
            </div>
            <Select value={category} onValueChange={(v) => setCategory(v as TemplateCategory)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <cat.icon className="w-4 h-4" />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={templateType} onValueChange={(v) => setTemplateType(v as TemplateType)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fill_blanks">Rellenar campos</SelectItem>
                <SelectItem value="ai_assisted">Con IA</SelectItem>
                <SelectItem value="hybrid">Híbrido</SelectItem>
              </SelectContent>
            </Select>
            <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="markdown">Markdown</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="docx">DOCX</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            className="mb-4"
          />

          {/* Main editor area */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')} className="flex-1 flex flex-col">
              <div className="border-b px-4 py-2">
                <TabsList>
                  <TabsTrigger value="edit" className="gap-2">
                    <Code className="w-4 h-4" />
                    Editar
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-2">
                    <Eye className="w-4 h-4" />
                    Vista previa
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="edit" className="flex-1 m-0">
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-full resize-none border-0 rounded-none font-mono text-sm focus-visible:ring-0"
                  placeholder={`Escribe tu plantilla aquí...

Ejemplo:
---
{{org.name}}
{{org.address}}

{{today.long}}

{{client.name}}
{{client.address}}

Ref: {{matter.reference}}

Estimado/a {{contact.name}},

En relación con el expediente arriba referenciado relativo a la marca "{{matter.mark_name}}", 
nos complace informarle que...

Atentamente,

{{signature_placeholder}}

{{user.name}}
{{user.position}}
---`}
                />
              </TabsContent>

              <TabsContent value="preview" className="flex-1 m-0 overflow-auto p-6 bg-muted/30">
                <div className="max-w-[800px] mx-auto bg-background p-8 shadow-sm rounded-lg border whitespace-pre-wrap font-serif">
                  {content ? renderPreview() : (
                    <p className="text-muted-foreground text-center py-12">
                      Escribe contenido en el editor para ver la vista previa
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Sidebar: AI Config (if AI-assisted) */}
        {(templateType === 'ai_assisted' || templateType === 'hybrid') && (
          <Card className="w-80 flex flex-col">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Configuración IA
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div>
                <Label className="text-xs">System Prompt</Label>
                <Textarea
                  value={aiSystemPrompt}
                  onChange={(e) => setAiSystemPrompt(e.target.value)}
                  placeholder="Instrucciones para la IA..."
                  className="text-xs h-32"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                La IA usará estos datos junto con el contenido de la plantilla
                para generar el documento final.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
