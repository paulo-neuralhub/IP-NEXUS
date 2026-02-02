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
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ExternalLink, 
  Trash2, 
  Search, 
  Star,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { NICE_CLASS_ICONS } from '@/types/nice-classification';
import { useToast } from '@/hooks/use-toast';

interface ParsedItem {
  code: string;
  name: string;
  isGeneric: boolean;
}

interface ParseResult {
  classNumber: number | null;
  className: string;
  items: ParsedItem[];
  errors: string[];
}

/**
 * Parse WIPO text format to extract class and items
 * Format:
 * Class 9 Scientific apparatus...
 * *090658
 * smartphones
 * 090659
 * tablet computers
 */
function parseWIPOText(rawText: string): ParseResult {
  const result: ParseResult = {
    classNumber: null,
    className: '',
    items: [],
    errors: []
  };

  if (!rawText.trim()) {
    result.errors.push('El texto está vacío');
    return result;
  }

  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l);
  
  // Find class number - look for "Class X" pattern
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const classMatch = lines[i].match(/^Class\s+(\d+)/i);
    if (classMatch) {
      result.classNumber = parseInt(classMatch[1]);
      // Get class title (rest of line or next line)
      const titlePart = lines[i].replace(/^Class\s+\d+\s*/i, '').trim();
      if (titlePart) {
        result.className = titlePart;
      } else if (lines[i + 1] && !lines[i + 1].match(/^\*?\d{6}$/)) {
        result.className = lines[i + 1];
      }
      break;
    }
  }

  if (!result.classNumber) {
    result.errors.push('No se encontró el número de clase (formato esperado: "Class 9")');
    return result;
  }

  // Parse items - look for 6-digit codes followed by name on next line
  // Format: *090658 (asterisk optional, indicates generic term)
  //         smartphones (name on next line)
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // Check if line is a code (6 digits, optionally prefixed with *)
    const codeMatch = line.match(/^(\*)?(\d{6})$/);
    
    if (codeMatch) {
      const isGeneric = !!codeMatch[1];
      const code = codeMatch[2];
      
      // Next line should be the name
      i++;
      if (i < lines.length) {
        const nameLine = lines[i];
        // Make sure it's not another code
        if (!nameLine.match(/^\*?\d{6}$/)) {
          result.items.push({
            code,
            name: nameLine,
            isGeneric
          });
        } else {
          // Code without name - go back and process this line as a new code
          result.items.push({
            code,
            name: `[Item ${code}]`,
            isGeneric
          });
          continue; // Don't increment, process this code in next iteration
        }
      } else {
        // Last line is a code without name
        result.items.push({
          code,
          name: `[Item ${code}]`,
          isGeneric
        });
      }
    }
    i++;
  }

  if (result.items.length === 0) {
    result.errors.push('No se encontraron items. Formato esperado: código de 6 dígitos en una línea, nombre en la siguiente');
  }

  return result;
}

interface NiceImporterProps {
  onImportComplete?: () => void;
}

export function NiceImporter({ onImportComplete }: NiceImporterProps) {
  const [rawText, setRawText] = useState('');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; count: number; errors: string[] } | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleAnalyze = () => {
    setImportResult(null);
    const result = parseWIPOText(rawText);
    setParseResult(result);
    
    if (result.errors.length > 0) {
      toast({
        title: 'Problemas detectados',
        description: result.errors[0],
        variant: 'destructive'
      });
    } else {
      toast({
        title: `Clase ${result.classNumber} detectada`,
        description: `${result.items.length} items encontrados (${result.items.filter(i => i.isGeneric).length} genéricos)`
      });
    }
  };

  const handleImport = async () => {
    if (!parseResult || !parseResult.classNumber || parseResult.items.length === 0) {
      toast({
        title: 'Error',
        description: 'Primero analiza el texto',
        variant: 'destructive'
      });
      return;
    }

    setImporting(true);
    setProgress(0);
    setImportResult(null);

    try {
      const itemsToInsert = parseResult.items.map(item => ({
        class_number: parseResult.classNumber!,
        item_code: item.code,
        item_name_en: item.name,
        is_generic_term: item.isGeneric,
        alternate_names: [] as string[]
      }));

      // Insert in batches
      const batchSize = 50;
      let totalInserted = 0;
      const errors: string[] = [];

      for (let i = 0; i < itemsToInsert.length; i += batchSize) {
        const batch = itemsToInsert.slice(i, i + batchSize);
        
        const { data, error } = await supabase
          .from('nice_class_items')
          .upsert(batch, { 
            onConflict: 'class_number,item_code',
            ignoreDuplicates: false 
          })
          .select('id');

        if (error) {
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        } else {
          totalInserted += data?.length || batch.length;
        }

        setProgress(Math.round(((i + batch.length) / itemsToInsert.length) * 100));
      }

      setImportResult({
        success: errors.length === 0,
        count: totalInserted,
        errors
      });

      if (errors.length === 0) {
        toast({
          title: '✅ Importación completada',
          description: `${totalInserted} items importados en Clase ${parseResult.classNumber}`
        });
        onImportComplete?.();
      } else {
        toast({
          title: '⚠️ Importación parcial',
          description: `${totalInserted} items importados, ${errors.length} errores`,
          variant: 'destructive'
        });
      }

    } catch (error: any) {
      setImportResult({
        success: false,
        count: 0,
        errors: [error.message]
      });
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClear = () => {
    setRawText('');
    setParseResult(null);
    setImportResult(null);
    setProgress(0);
  };

  const genericCount = parseResult?.items.filter(i => i.isGeneric).length || 0;

  return (
    <div className="space-y-6">
      {/* Main Import Card */}
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
          <Alert className="bg-muted/50">
            <ExternalLink className="h-4 w-4" />
            <AlertDescription className="flex flex-col gap-1">
              <a 
                href="https://www.wipo.int/classifications/nice/nclpub/en/fr/"
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
              {parseResult?.classNumber && (
                <Badge variant="secondary" className="gap-1">
                  {NICE_CLASS_ICONS[parseResult.classNumber] || '📦'} 
                  Clase {parseResult.classNumber}
                </Badge>
              )}
            </div>
            <Textarea
              placeholder={`Pega aquí el texto copiado de WIPO...

Ejemplo de formato esperado:

Class 9 Scientific apparatus...

*090658
smartphones

090659
tablet computers

090660
laptop computers

(* indica término genérico)`}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setParseResult(null);
                setImportResult(null);
              }}
              className="min-h-[250px] font-mono text-sm"
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
              onClick={handleAnalyze}
              disabled={!rawText.trim() || importing}
              variant="outline"
              className="flex-1"
            >
              <Search className="mr-2 h-4 w-4" />
              Analizar
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!parseResult || parseResult.items.length === 0 || importing}
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
                  Importar
                </>
              )}
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleClear}
              disabled={importing}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Parse Result Preview */}
      {parseResult && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {parseResult.errors.length === 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
                Vista previa
              </span>
              <div className="flex gap-2">
                <Badge variant="default">{parseResult.items.length} items</Badge>
                {genericCount > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3" />
                    {genericCount} genéricos
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Errors */}
            {parseResult.errors.length > 0 && (
              <div className="mb-4 space-y-2">
                {parseResult.errors.map((error, i) => (
                  <Alert key={i} variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Class info */}
            {parseResult.classNumber && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg mb-4">
                <span className="text-3xl">{NICE_CLASS_ICONS[parseResult.classNumber] || '📦'}</span>
                <div>
                  <div className="font-semibold">Clase {parseResult.classNumber}</div>
                  {parseResult.className && (
                    <div className="text-sm text-muted-foreground line-clamp-1">{parseResult.className}</div>
                  )}
                </div>
              </div>
            )}

            {/* Items preview */}
            {parseResult.items.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Items detectados ({parseResult.items.length}):
                </div>
                <ScrollArea className="h-[300px] border rounded-lg">
                  <div className="p-2 space-y-1">
                    {parseResult.items.map((item, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 p-2 rounded hover:bg-muted/50"
                      >
                        {item.isGeneric ? (
                          <Star className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        ) : (
                          <div className="w-4" />
                        )}
                        <Badge variant="outline" className="font-mono text-xs">
                          {item.code}
                        </Badge>
                        <span className="text-sm truncate">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Import Result */}
      {importResult && (
        <Alert 
          variant={importResult.success ? 'default' : 'destructive'}
          className={importResult.success ? 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800' : ''}
        >
          {importResult.success ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            <span className="font-medium">
              {importResult.success ? 'Importación completada: ' : 'Importación con errores: '}
            </span>
            {importResult.count} items importados
            {importResult.errors.length > 0 && (
              <ul className="mt-2 list-disc list-inside text-sm">
                {importResult.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
