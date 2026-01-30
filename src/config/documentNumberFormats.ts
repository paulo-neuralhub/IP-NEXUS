// ============================================================
// Document Number Formats Configuration
// ============================================================

export interface DocumentNumberFormat {
  code: string;
  name: string;
  description: string;
  example: string;
  pattern: string;
}

export const DOCUMENT_NUMBER_FORMATS: DocumentNumberFormat[] = [
  {
    code: 'PREFIX-YYYY-SEQ',
    name: 'Prefijo + Año + Secuencia',
    description: 'Formato estándar con prefijo configurable',
    example: 'DOC-2026-0001',
    pattern: '{PREFIX}-{YYYY}-{SEQ:4}',
  },
  {
    code: 'PREFIX-YYMM-SEQ',
    name: 'Prefijo + Año/Mes + Secuencia',
    description: 'Incluye mes para mejor organización',
    example: 'DOC-2601-0001',
    pattern: '{PREFIX}-{YYMM}-{SEQ:4}',
  },
  {
    code: 'TYPE-YYYY-SEQ',
    name: 'Tipo + Año + Secuencia',
    description: 'Usa el tipo de documento como prefijo',
    example: 'CONTRATO-2026-0001',
    pattern: '{TYPE}-{YYYY}-{SEQ:4}',
  },
  {
    code: 'YYYY/SEQ',
    name: 'Año/Secuencia',
    description: 'Formato simple tipo notarial',
    example: '2026/00001',
    pattern: '{YYYY}/{SEQ:5}',
  },
];

/**
 * Generate a preview of the document number in the frontend
 * This is just for display purposes - actual numbers come from the database
 */
export function generateDocumentNumberPreview(
  formatCode: string,
  options: {
    prefix?: string;
    type?: string;
    clientCode?: string;
  }
): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  
  const prefix = options.prefix || 'DOC';
  const type = (options.type || 'DOC').toUpperCase();
  
  switch (formatCode) {
    case 'PREFIX-YYYY-SEQ':
      return `${prefix}-${year}-0001`;
    case 'PREFIX-YYMM-SEQ':
      return `${prefix}-${year.toString().slice(-2)}${month}-0001`;
    case 'TYPE-YYYY-SEQ':
      return `${type}-${year}-0001`;
    case 'YYYY/SEQ':
      return `${year}/00001`;
    default:
      return `${prefix}-${year}-0001`;
  }
}

/**
 * Get the format object by code
 */
export function getFormatByCode(code: string): DocumentNumberFormat | undefined {
  return DOCUMENT_NUMBER_FORMATS.find(f => f.code === code);
}
