import { useState } from 'react';
import { 
  FileText, 
  Loader2, 
  Download,
  Edit3,
  Check,
  Sparkles
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GENERATED_DOC_TYPES } from '@/lib/constants/genius';
import type { GeneratedDocType } from '@/types/genius';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';

interface Props {
  matterId?: string;
  onDocumentGenerated?: (docId: string) => void;
}

export function DocumentGenerator({ matterId, onDocumentGenerated }: Props) {
  const [docType, setDocType] = useState<GeneratedDocType>('summary');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ content: string; id: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  
  // Required fields based on document type
  const getRequiredFields = (type: GeneratedDocType): { key: string; label: string; multiline?: boolean }[] => {
    switch (type) {
      case 'opposition':
        return [
          { key: 'own_mark', label: 'Tu marca' },
          { key: 'opposed_mark', label: 'Marca a opositar' },
          { key: 'opposition_grounds', label: 'Motivos de oposición', multiline: true },
          { key: 'jurisdiction', label: 'Jurisdicción' },
        ];
      case 'cease_desist':
        return [
          { key: 'infringer_name', label: 'Nombre del infractor' },
          { key: 'own_mark', label: 'Tu marca infringida' },
          { key: 'infringement_description', label: 'Descripción de la infracción', multiline: true },
        ];
      case 'summary':
        return [
          { key: 'matter_reference', label: 'Referencia del expediente' },
          { key: 'summary_scope', label: '¿Qué incluir en el resumen?', multiline: true },
        ];
      case 'renewal':
        return [
          { key: 'mark_name', label: 'Nombre de la marca' },
          { key: 'registration_number', label: 'Número de registro' },
          { key: 'jurisdiction', label: 'Jurisdicción' },
        ];
      case 'license':
        return [
          { key: 'licensor_name', label: 'Nombre del licenciante' },
          { key: 'licensee_name', label: 'Nombre del licenciatario' },
          { key: 'mark_name', label: 'Marca licenciada' },
          { key: 'license_terms', label: 'Términos de la licencia', multiline: true },
        ];
      case 'assignment':
        return [
          { key: 'assignor_name', label: 'Nombre del cedente' },
          { key: 'assignee_name', label: 'Nombre del cesionario' },
          { key: 'mark_name', label: 'Marca cedida' },
        ];
      default:
        return [
          { key: 'description', label: 'Descripción del documento', multiline: true },
        ];
    }
  };
  
  const handleGenerate = async () => {
    if (!currentOrganization?.id) return;
    
    setIsGenerating(true);
    setResult(null);
    
    try {
      // Build the prompt based on document type and variables
      const prompt = buildDocumentPrompt(docType, variables);
      
      // Call the AI to generate the document
      const { data, error } = await supabase.functions.invoke('genius-chat', {
        body: {
          messages: [{ role: 'user', content: prompt }],
          agentType: 'docs',
          context: {},
        },
      });
      
      if (error) throw error;
      
      const content = typeof data === 'string' ? data : data?.content || '';
      
      // Save the generated document
      const { data: savedDoc, error: saveError } = await supabase
        .from('ai_generated_documents')
        .insert({
          organization_id: currentOrganization.id,
          document_type: docType,
          title: `${GENERATED_DOC_TYPES[docType].label} - ${new Date().toLocaleDateString('es-ES')}`,
          content,
          content_format: 'markdown',
          matter_id: matterId || null,
          created_by: user?.id,
          status: 'draft',
          version: 1,
        })
        .select()
        .single();
      
      if (saveError) throw saveError;
      
      setResult({ content, id: savedDoc.id });
      onDocumentGenerated?.(savedDoc.id);
      
      toast({ title: 'Documento generado correctamente' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al generar documento',
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const buildDocumentPrompt = (type: GeneratedDocType, vars: Record<string, string>): string => {
    const typeLabel = GENERATED_DOC_TYPES[type].label;
    const varsText = Object.entries(vars)
      .map(([key, value]) => `- ${key}: ${value}`)
      .join('\n');
    
    return `Genera un ${typeLabel} profesional en español para uso en propiedad intelectual. 
    
Datos proporcionados:
${varsText}

Requisitos:
- Formato profesional y legal
- Lenguaje formal pero claro
- Incluir todas las secciones relevantes
- Formato Markdown

Por favor genera el documento completo.`;
  };
  
  const handleDownload = () => {
    if (!result) return;
    
    const blob = new Blob([result.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${GENERATED_DOC_TYPES[docType].label.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const requiredFields = getRequiredFields(docType);
  const isComplete = requiredFields.every(f => variables[f.key]?.trim());
  
  return (
    <div className="space-y-6">
      {/* Document type selector */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Tipo de documento
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(GENERATED_DOC_TYPES).slice(0, 6).map(([key, config]) => (
            <button
              key={key}
              onClick={() => {
                setDocType(key as GeneratedDocType);
                setVariables({});
                setResult(null);
              }}
              className={cn(
                "p-3 rounded-lg border text-left transition-colors",
                docType === key 
                  ? "border-primary bg-primary/10" 
                  : "hover:border-muted-foreground/50"
              )}
            >
              <FileText className="w-5 h-5 mb-1 text-muted-foreground" />
              <p className="font-medium text-sm">{config.label}</p>
            </button>
          ))}
        </div>
      </div>
      
      {/* Variables form */}
      <div className="space-y-4">
        <h3 className="font-medium text-foreground">
          Información para {GENERATED_DOC_TYPES[docType].label}
        </h3>
        
        {requiredFields.map(field => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-foreground mb-1">
              {field.label}
            </label>
            {field.multiline ? (
              <Textarea
                value={variables[field.key] || ''}
                onChange={(e) => setVariables(prev => ({ ...prev, [field.key]: e.target.value }))}
                rows={3}
                placeholder={`Ingresa ${field.label.toLowerCase()}...`}
              />
            ) : (
              <Input
                value={variables[field.key] || ''}
                onChange={(e) => setVariables(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={`Ingresa ${field.label.toLowerCase()}...`}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Generate button */}
      <Button
        onClick={handleGenerate}
        disabled={!isComplete || isGenerating}
        className="w-full"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Generando documento...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generar {GENERATED_DOC_TYPES[docType].label}
          </>
        )}
      </Button>
      
      {/* Result */}
      {result && (
        <div className="border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-muted/50 border-b">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="font-medium text-sm">Documento generado</span>
            </div>
            <div className="flex gap-2">
              <button className="text-sm text-primary hover:underline flex items-center gap-1">
                <Edit3 className="w-3 h-3" /> Editar
              </button>
              <button 
                onClick={handleDownload}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> Descargar
              </button>
            </div>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown>{result.content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
