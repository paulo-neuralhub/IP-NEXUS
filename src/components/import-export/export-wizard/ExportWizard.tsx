import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileJson, 
  File,
  Loader2,
  CheckCircle2,
  X,
  Filter
} from 'lucide-react';
import { useOrganization } from '@/contexts/organization-context';
import { useCreateExportJob } from '@/hooks/import-export';
import { ImportExportService } from '@/services/import-export-service';
import { useImportableFields } from '@/hooks/import-export';
import type { EntityType } from '@/types/import-export';

interface ExportWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: string;
}

type ExportFormat = 'csv' | 'xlsx' | 'json' | 'xml';

const FORMATS: { value: ExportFormat; label: string; icon: React.ElementType }[] = [
  { value: 'csv', label: 'CSV', icon: FileText },
  { value: 'xlsx', label: 'Excel', icon: FileSpreadsheet },
  { value: 'json', label: 'JSON', icon: FileJson },
  { value: 'xml', label: 'XML', icon: File }
];

export function ExportWizard({ open, onOpenChange, entityType }: ExportWizardProps) {
  const { currentOrganization } = useOrganization();
  const createJob = useCreateExportJob();
  const { data: fields } = useImportableFields(entityType as EntityType);
  
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [filters] = useState<Record<string, unknown>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{ url: string; records: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Select all columns by default
  React.useEffect(() => {
    if (fields && selectedColumns.length === 0) {
      setSelectedColumns(fields.map(f => f.field_name));
    }
  }, [fields]);

  const toggleColumn = (column: string) => {
    setSelectedColumns(prev => 
      prev.includes(column) 
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  const selectAllColumns = () => {
    if (fields) {
      setSelectedColumns(fields.map(f => f.field_name));
    }
  };

  const deselectAllColumns = () => {
    setSelectedColumns([]);
  };

  const handleExport = async () => {
    if (!currentOrganization || selectedColumns.length === 0) return;

    setIsExporting(true);
    setError(null);

    try {
      // Create export job
      const job = await createJob.mutateAsync({
        entity_type: entityType as EntityType,
        target_format: format === 'xlsx' ? 'excel' : format as any,
        columns: selectedColumns.map(col => ({
          field: col,
          header: fields?.find(f => f.field_name === col)?.field_label || col
        })),
        filters,
        format_options: { include_header: true }
      });

      // Process export
      const fileUrl = await ImportExportService.processExport(
        job.id,
        entityType,
        filters,
        selectedColumns,
        format,
        currentOrganization.id
      );

      setExportResult({ url: fileUrl, records: 0 }); // Records count will be updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al exportar');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    setExportResult(null);
    setError(null);
    onOpenChange(false);
  };

  const handleDownload = () => {
    if (exportResult?.url) {
      window.open(exportResult.url, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Exportar {entityType}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {exportResult ? (
          // Success state
          <div className="flex-1 flex flex-col items-center justify-center gap-6 py-8">
            <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Exportación completada</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tu archivo está listo para descargar
              </p>
            </div>
            <div className="flex gap-4">
              <Button onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" />
                Descargar archivo
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Cerrar
              </Button>
            </div>
          </div>
        ) : isExporting ? (
          // Loading state
          <div className="flex-1 flex flex-col items-center justify-center gap-6 py-8">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Exportando datos...</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Por favor espera mientras se genera el archivo
              </p>
            </div>
            <Progress value={50} className="w-64" />
          </div>
        ) : (
          // Configuration form
          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Format selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Formato de exportación</Label>
              <RadioGroup
                value={format}
                onValueChange={(v) => setFormat(v as ExportFormat)}
                className="grid grid-cols-4 gap-4"
              >
                {FORMATS.map(f => (
                  <Label
                    key={f.value}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      format === f.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value={f.value} className="sr-only" />
                    <f.icon className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium">{f.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            {/* Column selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Columnas a exportar</Label>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAllColumns}>
                    Seleccionar todo
                  </Button>
                  <Button variant="ghost" size="sm" onClick={deselectAllColumns}>
                    Limpiar
                  </Button>
                </div>
              </div>
              <Card className="p-4">
                <ScrollArea className="h-[200px]">
                  <div className="grid grid-cols-2 gap-2">
                    {fields?.map(field => (
                      <Label
                        key={field.field_name}
                        className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedColumns.includes(field.field_name)}
                          onCheckedChange={() => toggleColumn(field.field_name)}
                        />
                        <span className="text-sm">
                          {field.field_label || field.field_name}
                        </span>
                      </Label>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
              <p className="text-sm text-muted-foreground">
                {selectedColumns.length} de {fields?.length || 0} columnas seleccionadas
              </p>
            </div>

            {/* Filters (basic) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Label className="text-base font-semibold">Filtros (opcional)</Label>
              </div>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground text-center py-4">
                  Se exportarán todos los registros de {entityType}
                </p>
              </Card>
            </div>
          </div>
        )}

        {!exportResult && !isExporting && (
          <div className="flex items-center justify-between pt-4 border-t flex-shrink-0">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleExport}
              disabled={selectedColumns.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
