import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { generatePDF } from '@/lib/export/pdf-generator';
import { generateExcel, generateCSV } from '@/lib/export/excel-generator';
import { toast } from 'sonner';

interface ExportColumn {
  key: string;
  header: string;
  width?: number;
  format?: (value: unknown, row: Record<string, unknown>) => string;
}

interface ExportButtonProps {
  data: Record<string, unknown>[];
  columns: ExportColumn[];
  filename: string;
  title: string;
  subtitle?: string;
  disabled?: boolean;
}

export function ExportButton({
  data,
  columns,
  filename,
  title,
  subtitle,
  disabled = false,
}: ExportButtonProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (data.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    setExporting(format);

    try {
      switch (format) {
        case 'pdf':
          await generatePDF({
            title,
            subtitle,
            filename,
            columns,
            data,
          });
          break;
        case 'excel':
          generateExcel({ filename, columns, data });
          break;
        case 'csv':
          generateCSV({ filename, columns, data });
          break;
      }
      toast.success(`Exportado correctamente como ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error al exportar');
    } finally {
      setExporting(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || data.length === 0}>
          {exporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          disabled={!!exporting}
        >
          <FileText className="h-4 w-4 mr-2 text-red-500" />
          Exportar PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('excel')}
          disabled={!!exporting}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2 text-green-500" />
          Exportar Excel
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          disabled={!!exporting}
        >
          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
          Exportar CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
