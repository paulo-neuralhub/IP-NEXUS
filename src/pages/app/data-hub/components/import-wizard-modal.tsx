import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, FileSpreadsheet, ArrowRight, 
  Check, AlertCircle, Loader2, Download, CheckCircle
} from 'lucide-react';
import { useCreateImport, useImport, useValidateImport, useExecuteImport } from '@/hooks/use-data-hub';
import { IMPORT_TYPES, MATTER_FIELD_OPTIONS, CONTACT_FIELD_OPTIONS } from '@/lib/constants/data-hub';
import type { ImportType } from '@/types/data-hub';
import { cn } from '@/lib/utils';

interface ImportWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type WizardStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete';

export function ImportWizardModal({ open, onOpenChange }: ImportWizardModalProps) {
  const [step, setStep] = useState<WizardStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<ImportType>('matters');
  const [importId, setImportId] = useState<string | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [config, setConfig] = useState({
    skip_header: true,
    date_format: 'DD/MM/YYYY',
    update_existing: false,
  });
  
  const { mutateAsync: createImport, isPending: isCreating } = useCreateImport();
  const { data: importData } = useImport(importId || '');
  const { mutateAsync: validateImport, isPending: isValidating } = useValidateImport();
  const { mutateAsync: executeImport, isPending: isExecuting } = useExecuteImport();
  
  // Get target columns based on import type
  const targetColumns = importType === 'matters' ? MATTER_FIELD_OPTIONS : 
                        importType === 'contacts' ? CONTACT_FIELD_OPTIONS : 
                        MATTER_FIELD_OPTIONS;
  
  // Demo source columns (in production, these come from parsing the file)
  const sourceColumns = ['Columna A', 'Columna B', 'Columna C', 'Columna D', 'Columna E'];
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  }, []);
  
  const handleUpload = async () => {
    if (!file) return;
    
    try {
      const result = await createImport({ 
        file, 
        import_type: importType,
        source_type: file.name.endsWith('.csv') ? 'csv' : 
                     file.name.endsWith('.json') ? 'json' : 'excel',
        options: config,
      });
      setImportId(result.id);
      setStep('mapping');
    } catch (error) {
      console.error('Upload error:', error);
    }
  };
  
  const handleMappingChange = (sourceCol: string, targetCol: string) => {
    setMapping(prev => ({
      ...prev,
      [sourceCol]: targetCol,
    }));
  };
  
  const handleValidate = async () => {
    if (!importId) return;
    
    try {
      await validateImport({ importId, mapping });
      setStep('preview');
    } catch (error) {
      console.error('Validation error:', error);
    }
  };
  
  const handleExecute = async () => {
    if (!importId) return;
    
    setStep('importing');
    try {
      await executeImport(importId);
      setStep('complete');
    } catch (error) {
      console.error('Execute error:', error);
    }
  };
  
  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setImportId(null);
    setMapping({});
    onOpenChange(false);
  };
  
  const progress = importData 
    ? Math.round((importData.processed_rows / Math.max(importData.total_rows, 1)) * 100) 
    : 0;
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Datos</DialogTitle>
        </DialogHeader>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[
            { key: 'upload', label: 'Subir' },
            { key: 'mapping', label: 'Mapeo' },
            { key: 'preview', label: 'Preview' },
            { key: 'complete', label: 'Completo' },
          ].map((s, i, arr) => (
            <div key={s.key} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                step === s.key ? "bg-primary text-primary-foreground" :
                arr.findIndex(x => x.key === step) > i
                  ? "bg-green-500 text-white" 
                  : "bg-muted text-muted-foreground"
              )}>
                {arr.findIndex(x => x.key === step) > i ? (
                  <Check className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < arr.length - 1 && (
                <div className={cn(
                  "w-12 md:w-20 h-1 mx-2 transition-colors",
                  arr.findIndex(x => x.key === step) > i
                    ? "bg-green-500" 
                    : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
        
        {/* Step Content */}
        {step === 'upload' && (
          <div className="space-y-6">
            <div>
              <Label>Tipo de datos a importar</Label>
              <Select value={importType} onValueChange={(v) => setImportType(v as ImportType)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(IMPORT_TYPES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        {config.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Archivo</Label>
              <div 
                className="mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors hover:border-primary/50 cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                      Cambiar
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Arrastra un archivo o haz clic</p>
                    <p className="text-sm text-muted-foreground">
                      Soporta Excel (.xlsx), CSV y JSON
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept=".xlsx,.xls,.csv,.json"
                      onChange={handleFileSelect}
                    />
                  </label>
                )}
              </div>
            </div>
            
            {/* Download template */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">¿Necesitas una plantilla?</p>
                <p className="text-sm text-muted-foreground">
                  Descarga una plantilla con las columnas correctas
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleUpload} disabled={!file || isCreating}>
                {isCreating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Continuar
              </Button>
            </div>
          </div>
        )}
        
        {step === 'mapping' && (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Mapea las columnas de tu archivo a los campos de IP-NEXUS
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {sourceColumns.map(sourceCol => (
                <div key={sourceCol} className="flex items-center gap-4">
                  <div className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                    {sourceCol}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Select
                    value={mapping[sourceCol] ? mapping[sourceCol] : '__skip__'}
                    onValueChange={(v) => handleMappingChange(sourceCol, v === '__skip__' ? '' : v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar campo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__skip__">-- No importar --</SelectItem>
                      {targetColumns.map(col => (
                        <SelectItem key={col.value} value={col.value}>
                          {col.label}
                          {col.required && (
                            <Badge className="ml-2" variant="secondary">Requerido</Badge>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="skipHeader"
                  checked={config.skip_header}
                  onCheckedChange={(v) => setConfig(prev => ({ ...prev, skip_header: !!v }))}
                />
                <Label htmlFor="skipHeader">Primera fila es encabezado</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Formato de fecha</Label>
                  <Select 
                    value={config.date_format} 
                    onValueChange={(v) => setConfig(prev => ({ ...prev, date_format: v }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="updateExisting"
                      checked={config.update_existing}
                      onCheckedChange={(v) => setConfig(prev => ({ ...prev, update_existing: !!v }))}
                    />
                    <Label htmlFor="updateExisting">Actualizar existentes</Label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Atrás
              </Button>
              <Button onClick={handleValidate} disabled={isValidating}>
                {isValidating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Validar
              </Button>
            </div>
          </div>
        )}
        
        {step === 'preview' && importData && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{importData.total_rows}</p>
                <p className="text-sm text-blue-700">Total filas</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{importData.success_rows || importData.total_rows - (importData.errors?.length || 0)}</p>
                <p className="text-sm text-green-700">Válidas</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600">{importData.errors?.length || 0}</p>
                <p className="text-sm text-red-700">Con errores</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-600">{importData.skipped_rows || 0}</p>
                <p className="text-sm text-yellow-700">Omitidas</p>
              </div>
            </div>
            
            {importData.errors && importData.errors.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Errores encontrados:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {importData.errors.slice(0, 5).map((err, i) => (
                    <div key={i} className="text-sm flex gap-2 text-red-600">
                      <span className="font-mono">Fila {err.row}:</span>
                      <span>{err.error}</span>
                    </div>
                  ))}
                  {importData.errors.length > 5 && (
                    <p className="text-sm text-muted-foreground">
                      Y {importData.errors.length - 5} errores más...
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('mapping')}>
                Atrás
              </Button>
              <Button onClick={handleExecute} disabled={isExecuting}>
                {isExecuting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Importar
              </Button>
            </div>
          </div>
        )}
        
        {step === 'importing' && (
          <div className="space-y-6 text-center py-8">
            <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin" />
            <div>
              <p className="text-lg font-medium">Importando datos...</p>
              <p className="text-muted-foreground">
                {importData?.processed_rows || 0} de {importData?.total_rows || 0} registros
              </p>
            </div>
            <Progress value={progress} className="max-w-md mx-auto" />
          </div>
        )}
        
        {step === 'complete' && importData && (
          <div className="space-y-6 text-center py-8">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            <div>
              <p className="text-lg font-medium">¡Importación completada!</p>
              <p className="text-muted-foreground">
                Se han procesado {importData.total_rows} registros
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{importData.success_rows}</p>
                <p className="text-sm text-green-700">Exitosos</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-3xl font-bold text-red-600">{importData.error_rows}</p>
                <p className="text-sm text-red-700">Errores</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-3xl font-bold text-yellow-600">{importData.skipped_rows}</p>
                <p className="text-sm text-yellow-700">Omitidos</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button onClick={handleClose}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
