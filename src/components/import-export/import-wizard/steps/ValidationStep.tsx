import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { ImportExportService } from '@/services/import-export-service';
import type { FieldMapping } from '@/types/import-export';

interface ValidationStepProps {
  data: Record<string, unknown>[];
  mappings: FieldMapping[];
  entityType: string;
  validationResult: {
    isValid: boolean;
    errors: Array<{ row: number; field: string; message: string }>;
    warnings: Array<{ row: number; field: string; message: string }>;
  } | null;
  onValidationComplete: (result: {
    isValid: boolean;
    errors: Array<{ row: number; field: string; message: string }>;
    warnings: Array<{ row: number; field: string; message: string }>;
  }) => void;
}

export function ValidationStep({
  data,
  mappings,
  entityType,
  validationResult,
  onValidationComplete
}: ValidationStepProps) {
  const [isValidating, setIsValidating] = useState(false);

  const runValidation = async () => {
    setIsValidating(true);
    
    // Simulate async validation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = ImportExportService.validateData(data, mappings, entityType);
    onValidationComplete(result);
    setIsValidating(false);
  };

  useEffect(() => {
    if (!validationResult) {
      runValidation();
    }
  }, []);

  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-muted-foreground">Validando {data.length} registros...</p>
      </div>
    );
  }

  if (!validationResult) {
    return null;
  }

  const { isValid, errors, warnings } = validationResult;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-foreground">{data.length}</div>
          <div className="text-sm text-muted-foreground">Total registros</div>
        </Card>
        <Card className={`p-4 text-center ${errors.length > 0 ? 'border-destructive' : 'border-green-500'}`}>
          <div className={`text-3xl font-bold ${errors.length > 0 ? 'text-destructive' : 'text-green-600'}`}>
            {errors.length}
          </div>
          <div className="text-sm text-muted-foreground">Errores</div>
        </Card>
        <Card className={`p-4 text-center ${warnings.length > 0 ? 'border-yellow-500' : ''}`}>
          <div className={`text-3xl font-bold ${warnings.length > 0 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
            {warnings.length}
          </div>
          <div className="text-sm text-muted-foreground">Advertencias</div>
        </Card>
      </div>

      {/* Status alert */}
      {isValid ? (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            ¡Todos los datos son válidos! Puedes proceder con la importación.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Se encontraron {errors.length} errores que deben corregirse antes de importar.
          </AlertDescription>
        </Alert>
      )}

      {/* Error/Warning details */}
      {(errors.length > 0 || warnings.length > 0) && (
        <Tabs defaultValue="errors" className="w-full">
          <TabsList>
            <TabsTrigger value="errors" className="gap-2">
              <XCircle className="h-4 w-4" />
              Errores ({errors.length})
            </TabsTrigger>
            <TabsTrigger value="warnings" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Advertencias ({warnings.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="errors" className="mt-4">
            <Card>
              <ScrollArea className="h-[300px]">
                {errors.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No hay errores
                  </div>
                ) : (
                  <div className="divide-y">
                    {errors.map((error, index) => (
                      <div key={index} className="p-3 flex items-start gap-3">
                        <Badge variant="destructive" className="shrink-0">
                          Fila {error.row}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{error.field}</p>
                          <p className="text-sm text-muted-foreground">{error.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </TabsContent>
          
          <TabsContent value="warnings" className="mt-4">
            <Card>
              <ScrollArea className="h-[300px]">
                {warnings.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No hay advertencias
                  </div>
                ) : (
                  <div className="divide-y">
                    {warnings.map((warning, index) => (
                      <div key={index} className="p-3 flex items-start gap-3">
                        <Badge variant="outline" className="shrink-0 border-yellow-500 text-yellow-600">
                          Fila {warning.row}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{warning.field}</p>
                          <p className="text-sm text-muted-foreground">{warning.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Re-validate button */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={runValidation} disabled={isValidating}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
          Volver a validar
        </Button>
      </div>
    </div>
  );
}
