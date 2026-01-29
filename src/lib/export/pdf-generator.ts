import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PDFColumn {
  key: string;
  header: string;
  width?: number;
  format?: (value: unknown, row: Record<string, unknown>) => string;
}

interface PDFOptions {
  title: string;
  subtitle?: string;
  filename: string;
  orientation?: 'portrait' | 'landscape';
  columns: PDFColumn[];
  data: Record<string, unknown>[];
  footer?: string;
  logo?: string; // Base64
}

export async function generatePDF(options: PDFOptions): Promise<void> {
  const {
    title,
    subtitle,
    filename,
    orientation = 'portrait',
    columns,
    data,
    footer,
  } = options;

  const doc = new jsPDF({ orientation });
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(31, 41, 55); // gray-800
  doc.text(title, 14, 22);

  if (subtitle) {
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128); // gray-500
    doc.text(subtitle, 14, 30);
  }

  // Fecha de generación
  doc.setFontSize(10);
  doc.setTextColor(156, 163, 175); // gray-400
  doc.text(
    `Generado: ${format(new Date(), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}`,
    14,
    subtitle ? 38 : 30
  );

  // Tabla
  autoTable(doc, {
    startY: subtitle ? 45 : 38,
    head: [columns.map(col => col.header)],
    body: data.map(row =>
      columns.map(col => {
        const value = row[col.key];
        return col.format ? col.format(value, row) : (value?.toString() || '-');
      })
    ),
    headStyles: {
      fillColor: [59, 130, 246], // blue-500
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      textColor: [31, 41, 55],
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // gray-50
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    columnStyles: columns.reduce((acc, col, index) => {
      if (col.width) {
        acc[index] = { cellWidth: col.width };
      }
      return acc;
    }, {} as Record<number, { cellWidth: number }>),
  });

  // Footer en cada página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    
    // Número de página
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );

    // Footer personalizado
    if (footer) {
      doc.text(footer, 14, doc.internal.pageSize.getHeight() - 10);
    }
  }

  // Descargar
  doc.save(`${filename}.pdf`);
}
