import { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Loader2,
  Copy,
  Sparkles
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
  documentName?: string;
}

type AnalysisType = 'extract' | 'summarize' | 'compare';

export function DocumentAnalyzerModal({ isOpen, onClose, initialContent, documentName }: Props) {
  const [content, setContent] = useState(initialContent || '');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('summarize');
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  
  const handleAnalyze = async () => {
    if (!content.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('genius-chat', {
        body: {
          messages: [{ role: 'user', content: getAnalysisPrompt(analysisType, content) }],
          agentType: 'docs',
          context: {},
        },
      });
      
      if (error) throw error;
      
      // Handle streaming response or direct response
      if (typeof data === 'string') {
        setResult(data);
      } else if (data?.content) {
        setResult(data.content);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al analizar',
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const getAnalysisPrompt = (type: AnalysisType, text: string): string => {
    switch (type) {
      case 'summarize':
        return `Resume el siguiente documento de forma clara y concisa, destacando los puntos más importantes:\n\n${text}`;
      case 'extract':
        return `Extrae los datos clave del siguiente documento (fechas, nombres, cantidades, plazos, obligaciones, etc.) en formato estructurado:\n\n${text}`;
      case 'compare':
        return `Analiza y compara los elementos del siguiente documento, identificando inconsistencias, duplicidades o aspectos destacables:\n\n${text}`;
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // For text files
    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const text = await file.text();
      setContent(text);
    } else {
      toast({
        variant: 'destructive',
        title: 'Formato no soportado',
        description: 'Por ahora solo se aceptan archivos .txt y .md',
      });
    }
  };
  
  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      toast({ title: 'Copiado al portapapeles' });
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">NEXUS DOCS</h2>
              <p className="text-sm text-muted-foreground">Análisis inteligente de documentos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Input side */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tipo de análisis
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'summarize', label: 'Resumir' },
                    { value: 'extract', label: 'Extraer datos' },
                    { value: 'compare', label: 'Analizar' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setAnalysisType(opt.value as AnalysisType)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        analysisType === opt.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Documento
                </label>
                
                {/* File upload */}
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors mb-2">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {documentName || 'Subir archivo (.txt, .md)'}
                  </span>
                  <input
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                
                {/* Text area */}
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="O pega el contenido del documento aquí..."
                  rows={12}
                  className="w-full border rounded-lg p-3 text-sm resize-none bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              <Button
                onClick={handleAnalyze}
                disabled={!content.trim() || isAnalyzing}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analizar documento
                  </>
                )}
              </Button>
            </div>
            
            {/* Result side */}
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground">Resultado</h3>
                {result && (
                  <button
                    onClick={handleCopy}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copiar
                  </button>
                )}
              </div>
              
              {!result && !isAnalyzing && (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <FileText className="w-12 h-12 mb-2 opacity-50" />
                  <p className="text-sm">El resultado aparecerá aquí</p>
                </div>
              )}
              
              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Analizando documento...</p>
                </div>
              )}
              
              {result && (
                <div className="prose prose-sm max-w-none dark:prose-invert max-h-80 overflow-y-auto">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
