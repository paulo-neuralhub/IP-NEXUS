/**
 * IP-Market — Default service phases per service type
 * These replace the concept of "milestones" in the UI (now "Fases del Servicio")
 */

export interface ServicePhase {
  name: string;
  percentage: number;
  days: number;
}

export const SERVICE_PHASES: Record<string, ServicePhase[]> = {
  trademark_registration: [
    { name: 'Búsqueda de anterioridades', percentage: 15, days: 5 },
    { name: 'Preparación y presentación', percentage: 35, days: 10 },
    { name: 'Seguimiento del expediente', percentage: 35, days: 30 },
    { name: 'Certificado de registro', percentage: 15, days: 5 },
  ],
  patent_registration: [
    { name: 'Estudio de patentabilidad', percentage: 15, days: 10 },
    { name: 'Redacción de la solicitud', percentage: 30, days: 20 },
    { name: 'Presentación ante la oficina', percentage: 20, days: 5 },
    { name: 'Respuesta a requerimientos', percentage: 25, days: 30 },
    { name: 'Concesión y certificado', percentage: 10, days: 10 },
  ],
  design_registration: [
    { name: 'Preparación de documentación', percentage: 30, days: 7 },
    { name: 'Presentación ante la oficina', percentage: 40, days: 5 },
    { name: 'Certificado de registro', percentage: 30, days: 14 },
  ],
  opposition: [
    { name: 'Análisis del caso y estrategia', percentage: 25, days: 7 },
    { name: 'Redacción y presentación del escrito', percentage: 50, days: 14 },
    { name: 'Seguimiento y resolución', percentage: 25, days: 30 },
  ],
  prior_art_search: [
    { name: 'Búsqueda en bases de datos', percentage: 60, days: 7 },
    { name: 'Informe de resultados', percentage: 40, days: 5 },
  ],
  renewal: [
    { name: 'Verificación y preparación', percentage: 40, days: 3 },
    { name: 'Presentación y confirmación', percentage: 60, days: 5 },
  ],
  surveillance: [
    { name: 'Configuración del servicio', percentage: 40, days: 3 },
    { name: 'Primer informe de vigilancia', percentage: 60, days: 14 },
  ],
  legal_opinion: [
    { name: 'Estudio del caso', percentage: 50, days: 7 },
    { name: 'Emisión del dictamen', percentage: 50, days: 7 },
  ],
  search: [
    { name: 'Búsqueda en bases de datos', percentage: 60, days: 5 },
    { name: 'Informe de resultados', percentage: 40, days: 5 },
  ],
};

export function getDefaultPhases(serviceType?: string | null): ServicePhase[] {
  if (!serviceType) return [{ name: 'Fase 1', percentage: 50, days: 7 }, { name: 'Fase 2', percentage: 50, days: 7 }];
  // Try exact match, then prefix match, then fallback
  return SERVICE_PHASES[serviceType]
    || SERVICE_PHASES[Object.keys(SERVICE_PHASES).find(k => serviceType.startsWith(k)) || '']
    || [{ name: 'Fase 1', percentage: 50, days: 7 }, { name: 'Fase 2', percentage: 50, days: 7 }];
}

export function getDefaultEstimatedDays(serviceType?: string | null, urgency?: string | null): number {
  const phases = getDefaultPhases(serviceType);
  const totalDays = phases.reduce((sum, p) => sum + p.days, 0);
  if (urgency === 'urgent') return Math.ceil(totalDays * 0.6);
  if (urgency === 'flexible') return Math.ceil(totalDays * 1.3);
  return totalDays;
}

export const DEFAULT_INCLUDES: Record<string, string[]> = {
  trademark_registration: ['Informe de búsqueda', 'Documentación oficial', 'Certificado de registro', 'Seguimiento de publicaciones'],
  patent_registration: ['Estudio de patentabilidad', 'Redacción de reivindicaciones', 'Documentación oficial', 'Certificado de patente'],
  design_registration: ['Documentación oficial', 'Certificado de registro'],
  opposition: ['Análisis estratégico', 'Escrito de oposición', 'Seguimiento procesal'],
  prior_art_search: ['Informe de búsqueda', 'Análisis de resultados'],
  renewal: ['Verificación de datos', 'Presentación ante la oficina', 'Confirmación de renovación'],
  surveillance: ['Configuración de alertas', 'Informe periódico'],
  legal_opinion: ['Dictamen legal', 'Recomendaciones'],
  search: ['Informe de búsqueda', 'Resumen ejecutivo'],
};

export function getDefaultIncludes(serviceType?: string | null): string[] {
  if (!serviceType) return ['Documentación oficial', 'Informe'];
  return DEFAULT_INCLUDES[serviceType]
    || DEFAULT_INCLUDES[Object.keys(DEFAULT_INCLUDES).find(k => serviceType.startsWith(k)) || '']
    || ['Documentación oficial', 'Informe'];
}
