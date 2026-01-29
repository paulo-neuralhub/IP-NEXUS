import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ExcelColumn {
  key: string;
  header: string;
  width?: number;
  format?: (value: unknown, row: Record<string, unknown>) => string | number;
}

interface ExcelOptions {
  filename: string;
  sheetName?: string;
  columns: ExcelColumn[];
  data: Record<string, unknown>[];
  includeTimestamp?: boolean;
}

export function generateExcel(options: ExcelOptions): void {
  const {
    filename,
    sheetName = 'Datos',
    columns,
    data,
    includeTimestamp = true,
  } = options;

  // Preparar datos
  const headers = columns.map(col => col.header);
  const rows = data.map(row =>
    columns.map(col => {
      const value = row[col.key];
      return col.format ? col.format(value, row) : value;
    })
  );

  // Crear worksheet
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Aplicar anchos de columna
  ws['!cols'] = columns.map(col => ({
    wch: col.width || 15,
  }));

  // Crear workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Añadir hoja de metadatos si se requiere timestamp
  if (includeTimestamp) {
    const metaWs = XLSX.utils.aoa_to_sheet([
      ['Generado', new Date().toISOString()],
      ['Total registros', data.length],
    ]);
    XLSX.utils.book_append_sheet(wb, metaWs, 'Info');
  }

  // Generar archivo
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  saveAs(blob, `${filename}.xlsx`);
}

export function generateCSV(options: Omit<ExcelOptions, 'sheetName'>): void {
  const { filename, columns, data } = options;

  const headers = columns.map(col => col.header);
  const rows = data.map(row =>
    columns.map(col => {
      const value = row[col.key];
      const formatted = col.format ? col.format(value, row) : value;
      // Escapar comillas y manejar comas
      if (typeof formatted === 'string' && (formatted.includes(',') || formatted.includes('"'))) {
        return `"${formatted.replace(/"/g, '""')}"`;
      }
      return formatted;
    })
  );

  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }); // BOM para Excel
  saveAs(blob, `${filename}.csv`);
}
