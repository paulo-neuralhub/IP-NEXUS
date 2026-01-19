import React, { useCallback, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, FileSpreadsheet, FileJson, File, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ImportExportService } from '@/services/import-export-service';

interface FileUploadStepProps {
  entityType: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  parsedData: {
    headers: string[];
    rows: Record<string, unknown>[];
    totalRows: number;
  } | null;
  onDataParsed: (data: {
    headers: string[];
    rows: Record<string, unknown>[];
    totalRows: number;
  } | null) => void;
}

const ACCEPTED_FORMATS = [
  { ext: 'csv', icon: FileText, label: 'CSV', mime: 'text/csv' },
  { ext: 'xlsx', icon: FileSpreadsheet, label: 'Excel', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  { ext: 'json', icon: FileJson, label: 'JSON', mime: 'application/json' },
  { ext: 'xml', icon: File, label: 'XML', mime: 'application/xml' }
];

export function FileUploadStep({ 
  entityType, 
  file, 
  onFileSelect, 
  parsedData, 
  onDataParsed 
}: FileUploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (selectedFile: File) => {
    setIsLoading(true);
    setError(null);
    onFileSelect(selectedFile);
    
    try {
      const data = await ImportExportService.parseFile(selectedFile);
      onDataParsed(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
      onDataParsed(null);
    } finally {
      setIsLoading(false);
    }
  }, [onFileSelect, onDataParsed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  }, [handleFile]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Info card */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Sube un archivo con los datos de <strong>{entityType}</strong> que deseas importar. 
          Formatos soportados: CSV, Excel, JSON, XML.
        </AlertDescription>
      </Alert>

      {/* Drop zone */}
      <Card
        className={`border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept=".csv,.xlsx,.xls,.json,.xml"
          onChange={handleInputChange}
        />
        
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-muted-foreground">Procesando archivo...</p>
          </div>
        ) : file && parsedData ? (
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(file.size)} • {parsedData.totalRows} registros • {parsedData.headers.length} columnas
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={(e) => {
              e.stopPropagation();
              onFileSelect(null);
              onDataParsed(null);
            }}>
              Cambiar archivo
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div>
              <p className="font-medium">Arrastra tu archivo aquí</p>
              <p className="text-sm text-muted-foreground">o haz clic para seleccionar</p>
            </div>
          </div>
        )}
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Supported formats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {ACCEPTED_FORMATS.map(format => (
          <div 
            key={format.ext} 
            className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
          >
            <format.icon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">.{format.ext}</span>
          </div>
        ))}
      </div>

      {/* Preview */}
      {parsedData && parsedData.rows.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">Vista previa ({Math.min(5, parsedData.rows.length)} de {parsedData.totalRows} filas)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {parsedData.headers.map(header => (
                    <th key={header} className="text-left py-2 px-3 font-medium text-muted-foreground">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.rows.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    {parsedData.headers.map(header => (
                      <td key={header} className="py-2 px-3 truncate max-w-[200px]">
                        {String(row[header] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
