import { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Loader2, 
  Copy, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useProcessOCR, useOCRResults } from '@/hooks/use-ocr';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function OCRProcessor({ documentId }: { documentId?: string }) {
  const { data: results = [] } = useOCRResults(documentId);
  const processOCR = useProcessOCR();
  
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  const handleProcess = async () => {
    if (!file) return;
    
    try {
      await processOCR.mutateAsync({ file, documentId });
      toast.success('OCR iniciado');
      setFile(null);
    } catch (error) {
      toast.error('Error al procesar OCR');
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFile(droppedFile)) {
      setFile(droppedFile);
    }
  };
  
  const isValidFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    return validTypes.includes(file.type);
  };
  
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Texto copiado');
  };
  
  const latestResult = results[0];
  
  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-border",
          file && "border-green-500 bg-green-50"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-green-500" />
            <div className="text-left">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="ml-4 text-muted-foreground hover:text-destructive text-xl"
            >
              &times;
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-muted-foreground">Arrastra una imagen o PDF</p>
            <p className="text-xs text-muted-foreground/70 mt-1">JPG, PNG, WebP, PDF</p>
            <label className="mt-3 inline-block px-4 py-2 bg-muted text-foreground rounded-lg cursor-pointer hover:bg-muted/80 text-sm">
              Seleccionar archivo
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f && isValidFile(f)) setFile(f);
                }}
              />
            </label>
          </>
        )}
      </div>
      
      {file && (
        <button
          onClick={handleProcess}
          disabled={processOCR.isPending}
          className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {processOCR.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" /> Extraer texto
            </>
          )}
        </button>
      )}
      
      {/* Results */}
      {latestResult && (
        <div className="bg-card rounded-xl border">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">Texto Extraído</h3>
              {latestResult.status === 'completed' && (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  {latestResult.confidence?.toFixed(1)}% confianza
                </span>
              )}
              {latestResult.status === 'processing' && (
                <span className="flex items-center gap-1 text-xs text-blue-600">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Procesando...
                </span>
              )}
              {latestResult.status === 'failed' && (
                <span className="flex items-center gap-1 text-xs text-red-600">
                  <AlertTriangle className="w-3 h-3" />
                  Error
                </span>
              )}
            </div>
            
            {latestResult.extracted_text && (
              <button
                onClick={() => copyText(latestResult.extracted_text!)}
                className="p-2 hover:bg-muted rounded text-muted-foreground"
                title="Copiar texto"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {latestResult.extracted_text && (
            <div className="p-4">
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans max-h-64 overflow-y-auto">
                {latestResult.extracted_text}
              </pre>
              
              {/* Entities */}
              {latestResult.entities && latestResult.entities.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium text-foreground mb-2">
                    Entidades detectadas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {latestResult.entities.map((entity, i) => (
                      <span
                        key={i}
                        className={cn(
                          "px-2 py-1 text-xs rounded-full",
                          entity.type === 'date' && "bg-blue-100 text-blue-700",
                          entity.type === 'reference' && "bg-purple-100 text-purple-700",
                          entity.type === 'amount' && "bg-green-100 text-green-700",
                          entity.type === 'email' && "bg-yellow-100 text-yellow-700",
                          entity.type === 'phone' && "bg-orange-100 text-orange-700"
                        )}
                      >
                        {entity.type}: {entity.text}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
