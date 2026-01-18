import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Download, FileSpreadsheet, FileText, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import { IMPORT_TYPES, MATTER_FIELD_OPTIONS, CONTACT_FIELD_OPTIONS } from '@/lib/constants/data-hub';
import type { ImportType } from '@/types/data-hub';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ExportFormat = 'xlsx' | 'csv' | 'json';

export function ExportModal({ open, onOpenChange }: ExportModalProps) {
  const [exportType, setExportType] = useState<ImportType>('matters');
  const [format, setFormat] = useState<ExportFormat>('xlsx');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  
  const availableColumns = exportType === 'matters' ? MATTER_FIELD_OPTIONS :
                           exportType === 'contacts' ? CONTACT_FIELD_OPTIONS :
                           MATTER_FIELD_OPTIONS;
  
  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success('Exportación completada');
    setIsExporting(false);
    onOpenChange(false);
  };
  
  const toggleColumn = (col: string) => {
    setSelectedColumns(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };
  
  const selectAllColumns = () => {
    setSelectedColumns(availableColumns.map(c => c.value));
  };
  
  const clearColumns = () => {
    setSelectedColumns([]);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Exportar Datos</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Data type */}
          <div>
            <Label>Tipo de datos</Label>
            <Select value={exportType} onValueChange={(v) => {
              setExportType(v as ImportType);
              setSelectedColumns([]);
            }}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(IMPORT_TYPES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Format */}
          <div>
            <Label>Formato de archivo</Label>
            <RadioGroup
              value={format}
              onValueChange={(v) => setFormat(v as ExportFormat)}
              className="grid grid-cols-3 gap-4 mt-2"
            >
              <div>
                <RadioGroupItem value="xlsx" id="xlsx" className="peer sr-only" />
                <Label
                  htmlFor="xlsx"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <FileSpreadsheet className="h-6 w-6 mb-2 text-green-600" />
                  Excel
                </Label>
              </div>
              <div>
                <RadioGroupItem value="csv" id="csv" className="peer sr-only" />
                <Label
                  htmlFor="csv"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <FileText className="h-6 w-6 mb-2 text-blue-600" />
                  CSV
                </Label>
              </div>
              <div>
                <RadioGroupItem value="json" id="json" className="peer sr-only" />
                <Label
                  htmlFor="json"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <FileJson className="h-6 w-6 mb-2 text-yellow-600" />
                  JSON
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Columns */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Columnas a exportar</Label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAllColumns}>
                  Todas
                </Button>
                <Button variant="ghost" size="sm" onClick={clearColumns}>
                  Ninguna
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border rounded-lg">
              {availableColumns.map(col => (
                <div key={col.value} className="flex items-center gap-2">
                  <Checkbox
                    id={col.value}
                    checked={selectedColumns.includes(col.value)}
                    onCheckedChange={() => toggleColumn(col.value)}
                  />
                  <Label htmlFor={col.value} className="text-sm cursor-pointer">
                    {col.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isExporting || selectedColumns.length === 0}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Exportar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
