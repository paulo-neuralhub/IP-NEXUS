import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, Loader2, Copy, Download, Save, RefreshCw,
  FileText, CalendarIcon, ChevronLeft, Star, CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { DocumentTemplate, TemplateVariable } from '@/types/document-generation';

export default function GenerateDocumentPage() {
  const { id: templateId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrganization: organization } = useOrganization();
  
  const [selectedMatterId, setSelectedMatterId] = useState<string | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string | number>>({});
  const [generatedContent, setGeneratedContent] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const [rating, setRating] = useState(0);

  // Query template
  const { data: template, isLoading: templateLoading } = useQuery({
    queryKey: ['document-template', templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      if (error) throw error;
      return data as unknown as DocumentTemplate;
    },
    enabled: !!templateId,
  });

  // Query matters for selection
  const { data: matters } = useQuery({
    queryKey: ['matters-for-template', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matters')
        .select('id, title, reference, mark_name, registration_number, contact:contacts(id, name)')
        .eq('organization_id', organization?.id)
        .order('updated_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id,
  });

  // Get selected matter details
  const selectedMatter = matters?.find(m => m.id === selectedMatterId);

  // Auto-fill variables from matter
  useEffect(() => {
    if (selectedMatter && template?.variables) {
      const autoValues: Record<string, string | number> = {};
      
      template.variables.forEach((v: TemplateVariable) => {
        if (v.source === 'auto' && v.source_path) {
          const value = getNestedValue(selectedMatter, v.source_path);
          if (value) autoValues[v.key] = String(value);
        }
      });
      
      setVariableValues(prev => ({ ...prev, ...autoValues }));
    }
  }, [selectedMatter, template]);

  // Helper to get nested values
  const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
    if (path === 'TODAY') return format(new Date(), 'yyyy-MM-dd');
    return path.split('.').reduce((acc: unknown, part: string) => {
      if (acc && typeof acc === 'object') {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj);
  };

  // Generate mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-document-ai', {
        body: {
          templateId,
          matterId: selectedMatterId,
          variables: variableValues,
        },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      setEditedContent(data.content);
      toast.success('Documento generado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al generar: ${error.message}`);
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!organization?.id) throw new Error('No organization found');

      const { data, error } = await supabase
        .from('generated_documents')
        .insert({
          organization_id: organization.id,
          template_id: templateId,
          matter_id: selectedMatterId,
          name: `${template?.name} - ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
          content: editedContent || generatedContent,
          variables_input: variableValues,
          status: 'draft',
          user_rating: rating || null,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success('Documento guardado');
      navigate(`/app/genius/documents/${data.id}`);
    },
    onError: (error: Error) => {
      toast.error(`Error al guardar: ${error.message}`);
    },
  });

  // Render variable input
  const renderVariableInput = (variable: TemplateVariable) => {
    const value = variableValues[variable.key] || '';
    const onChange = (newValue: string | number) => {
      setVariableValues(prev => ({ ...prev, [variable.key]: newValue }));
    };

    switch (variable.type) {
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(String(value)), 'PPP', { locale: es }) : 'Seleccionar fecha'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(String(value)) : undefined}
                onSelect={(date) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      
      case 'select':
        return (
          <Select value={String(value)} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {variable.options?.map((opt: string) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'textarea':
        return (
          <Textarea
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Introducir ${variable.label.toLowerCase()}...`}
            rows={3}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0"
          />
        );
      
      default:
        return (
          <Input
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Introducir ${variable.label.toLowerCase()}...`}
          />
        );
    }
  };

  if (templateLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[500px]" />
          <Skeleton className="h-[500px]" />
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium mb-2">Plantilla no encontrada</h3>
        <Button onClick={() => navigate('/app/genius/templates')}>
          Volver a plantillas
        </Button>
      </div>
    );
  }

  const manualVariables = template.variables?.filter((v: TemplateVariable) => v.source === 'manual') || [];
  const autoVariables = template.variables?.filter((v: TemplateVariable) => v.source === 'auto') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/genius/templates')}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{template.name}</h1>
          <p className="text-muted-foreground">{template.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Configuration */}
        <div className="space-y-6">
          {/* Select Matter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expediente (opcional)</CardTitle>
              <CardDescription>
                Vincula a un expediente para auto-completar datos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select 
                value={selectedMatterId || ''} 
                onValueChange={(val) => setSelectedMatterId(val || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar expediente..." />
                </SelectTrigger>
                <SelectContent>
                  {matters?.map((matter) => (
                    <SelectItem key={matter.id} value={matter.id}>
                      {matter.reference || matter.title} {matter.mark_name && `- ${matter.mark_name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedMatter && autoVariables.length > 0 && (
                <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
                  <p className="text-sm text-success font-medium mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Datos auto-completados:
                  </p>
                  <ul className="text-sm text-success/80 space-y-1">
                    {autoVariables.map((v: TemplateVariable) => (
                      <li key={v.key}>
                        {v.label}: {variableValues[v.key] || '-'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Variables */}
          {manualVariables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Datos del documento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {manualVariables.map((variable: TemplateVariable) => (
                  <div key={variable.key} className="space-y-2">
                    <Label>
                      {variable.label}
                      {variable.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {renderVariableInput(variable)}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Generate Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generando con IA...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generar documento
              </>
            )}
          </Button>
        </div>

        {/* Right Panel: Preview */}
        <Card className="flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Documento generado</CardTitle>
            {generatedContent && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                >
                  <RefreshCw className={cn("w-4 h-4 mr-1", generateMutation.isPending && "animate-spin")} />
                  Regenerar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    navigator.clipboard.writeText(editedContent || generatedContent);
                    toast.success('Copiado al portapapeles');
                  }}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copiar
                </Button>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden">
            {generatedContent ? (
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'preview' | 'edit')} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Vista previa</TabsTrigger>
                  <TabsTrigger value="edit">Editar</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="flex-1 overflow-y-auto mt-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{editedContent || generatedContent}</ReactMarkdown>
                  </div>
                </TabsContent>
                
                <TabsContent value="edit" className="flex-1 mt-4">
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="h-full min-h-[400px] resize-none font-mono text-sm"
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Completa los datos y haz clic en</p>
                  <p className="font-medium">"Generar documento"</p>
                </div>
              </div>
            )}
          </CardContent>

          {generatedContent && (
            <CardFooter className="flex flex-col gap-4 border-t pt-4">
              {/* Rating */}
              <div className="flex items-center gap-2 w-full">
                <span className="text-sm text-muted-foreground">Valorar:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                    <Star className={cn(
                        "w-5 h-5",
                        star <= rating 
                          ? "fill-warning text-warning" 
                          : "text-muted-foreground/30"
                      )} />
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
