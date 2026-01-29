/**
 * Matter Reference Utilities
 * Helpers para gestionar referencias de expedientes en comunicaciones
 */

/**
 * Genera el prefijo de referencia para comunicaciones
 * @param matterReference - Número de expediente (ej: "TM-2024-0015")
 * @returns Prefijo formateado (ej: "[TM-2024-0015] ")
 */
export function getMatterPrefix(matterReference: string | null | undefined): string {
  if (!matterReference) return '';
  return `[${matterReference}] `;
}

/**
 * Añade referencia al asunto del email si no existe
 */
export function addReferenceToSubject(subject: string, matterReference: string | null | undefined): string {
  if (!matterReference) return subject;
  const prefix = `[${matterReference}]`;
  // No duplicar si ya tiene la referencia
  if (subject.startsWith(prefix)) return subject;
  if (subject.includes(prefix)) return subject;
  return `${prefix} ${subject}`;
}

/**
 * Añade referencia al inicio del mensaje
 */
export function addReferenceToMessage(message: string, matterReference: string | null | undefined): string {
  if (!matterReference) return message;
  const prefix = `[${matterReference}]`;
  // No duplicar si ya tiene la referencia
  if (message.startsWith(prefix)) return message;
  return `${prefix} ${message}`;
}

/**
 * Extrae la referencia de un mensaje entrante (para auto-vincular respuestas)
 * Soporta formatos: [TM-2024-001], [REF: TM-2024-001], etc.
 */
export function extractMatterReference(text: string): string | null {
  // Pattern para formatos comunes de referencia
  const patterns = [
    /\[([A-Z]{2,}-\d{4}-\d+(?:-[A-Z0-9]+)*)\]/,  // [TM-2024-001] o [TM-ES-20240127-A7K-0001-X9]
    /\[REF:\s*([A-Z]{2,}-\d{4}-\d+(?:-[A-Z0-9]+)*)\]/i, // [REF: TM-2024-001]
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * Verifica si un texto ya contiene una referencia de expediente
 */
export function hasReference(text: string, matterReference: string | null | undefined): boolean {
  if (!matterReference || !text) return false;
  return text.includes(`[${matterReference}]`) || text.includes(`[REF: ${matterReference}]`);
}
