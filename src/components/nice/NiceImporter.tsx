// ============================================================
// IP-NEXUS - Nice Classification Importer Component
// Visual interface for importing WIPO data
// ============================================================

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle2, XCircle, Loader2, ExternalLink, Trash2 } from 'lucide-react';
import { importNiceClass, importMultipleClasses, clearClassItems } from '@/lib/nice/import-service';
import { detectMultipleClasses } from '@/lib/nice/wipo-parser';
import { NICE_CLASS_ICONS, type NiceImportResult } from '@/types/nice-classification';
import { useToast } from '@/hooks/use-toast';

export function NiceImporter() {
  const [rawText, setRawText] = useState('');
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<NiceImportResult[]>([]);
  const [detectedClasses, setDetectedClasses] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleTextChange = (text: string) => {
    setRawText(text);
    setResults([]);
    if (text.trim()) {
      setDetectedClasses(detectMultipleClasses(text));
    } else {
      setDetectedClasses([]);
    }
  };

  const handleImport = async () => {
    if (!rawText.trim()) {
      toast({ 
        title: 'Error', 
        description: 'Pega el texto de WIPO primero', 
        variant: 'destructive' 
      });
      return;
    }

    setImporting(true);
    setResults([]);
    setProgress(10);

    try {
      let importResults: NiceImportResult[];
      
      if (detectedClasses.length > 1) {
        setProgress(20);
        importResults = await importMultipleClasses(rawText);
      } else {
        setProgress(50);
        const result = await importNiceClass(rawText);
        importResults = [result];
      }

      setResults(importResults);
      setProgress(100);
      
      const successCount = importResults.filter(r => r.success).length;
      const totalItems = importResults.reduce((sum, r) => sum + r.items_imported, 0);
      
      toast({
        title: successCount === importResults.length ? '✅ Importación completada' : '⚠️ Importación parcial',
        description: `${successCount}/${importResults.length} clases importadas, ${totalItems} items totales`
      });
      
    } catch (error: any) {
      toast({ 
        title: 'Error de importación', 
        description: error.message || 'Error durante la importación', 
        variant: 'destructive' 
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClear = () => {
    setRawText('');
    setResults([]);
    setDetectedClasses([]);
    setProgress(0);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          <CardTitle>Importar desde WIPO</CardTitle>
        </div>
        <CardDescription>
          Copia el texto de una clase desde el sitio oficial de WIPO y pégalo aquí
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Link to WIPO */}
        <Alert>
          <ExternalLink className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-1">
            <a 
              href="https://www.wipo.int/nice/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Abrir WIPO Nice Classification →
            </a>
            <span className="text-xs text-muted-foreground">
              Selecciona una clase, copia todo el contenido (Ctrl+A, Ctrl+C) y pégalo aquí
            </span>
          </AlertDescription>
        </Alert>

        {/* Text area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Texto de WIPO</span>
            {detectedClasses.length > 0 && (
              <div className="flex gap-1">
                {detectedClasses.map(c => (
                  <Badge key={c} variant="secondary" className="text-xs">
                    {NICE_CLASS_ICONS[c]} Clase {c}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Textarea
            placeholder={`Pega aquí el texto copiado de WIPO...

Ejemplo:
Class 9
Scientific, nautical, surveying...

Explanatory Note
This Class includes, in particular:
- apparatus and instruments for conducting...

This Class does not include, in particular:
- surgical instruments (Cl. 10);

090001
electron tubes

090002
chromatography apparatus for laboratory use`}
            value={rawText}
            onChange={(e) => handleTextChange(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            {rawText.length > 0 ? `${rawText.length} caracteres` : 'Sin contenido'}
          </p>
        </div>

        {/* Progress */}
        {importing && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground text-center">
              Importando... {progress}%
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={handleImport} 
            disabled={importing || !rawText.trim()} 
            className="flex-1"
          >
            {importing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Importar {detectedClasses.length > 1 ? `${detectedClasses.length} clases` : ''}
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleClear}
            disabled={importing}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Limpiar
          </Button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="font-medium text-sm">Resultados de importación</h4>
            {results.map((r, i) => (
              <Alert 
                key={i} 
                variant={r.success ? 'default' : 'destructive'}
                className={r.success ? 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800' : ''}
              >
                {r.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    <span className="font-medium">
                      {NICE_CLASS_ICONS[r.class_number]} Clase {r.class_number}:
                    </span>{' '}
                    {r.items_imported} items importados
                  </span>
                  {r.errors.length > 0 && (
                    <span className="text-xs text-destructive">
                      {r.errors.join(', ')}
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            ))}
            
            {/* Summary */}
            <div className="text-sm text-muted-foreground pt-2">
              Total: {results.filter(r => r.success).length}/{results.length} clases,{' '}
              {results.reduce((sum, r) => sum + r.items_imported, 0)} items
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
