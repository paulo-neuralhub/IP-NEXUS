// ============================================================
// IP-NEXUS - VALUE HIGHLIGHTS DATA
// Datos de ventajas competitivas para mostrar durante demos
// ============================================================

export interface ValueHighlight {
  id: string;
  section: string;       // Ruta donde aparece
  targetSelector?: string; // Elemento al que apunta (opcional)
  position: 'top' | 'bottom' | 'left' | 'right';
  
  // Contenido
  title: string;
  metric: string;        // El número grande
  metricLabel: string;
  
  comparison: {
    ipnexus: string;
    traditional: string;
  };
  
  savings?: string;      // Ahorro económico
  source?: string;       // Fuente del dato
  
  // Estilo
  type: 'saving' | 'efficiency' | 'unique' | 'security';
}

export const VALUE_HIGHLIGHTS: ValueHighlight[] = [
  // ==========================================
  // DASHBOARD
  // ==========================================
  {
    id: 'dashboard-kpis',
    section: '/app/dashboard',
    targetSelector: '.dashboard-kpis',
    position: 'top',
    title: 'Reporting automatizado',
    metric: '-67%',
    metricLabel: 'Tiempo en generar informes',
    comparison: {
      ipnexus: '20 min/semana',
      traditional: '2+ horas/semana en Excel',
    },
    savings: '€450/mes por empleado',
    type: 'saving',
  },
  {
    id: 'dashboard-realtime',
    section: '/app/dashboard',
    targetSelector: '.dashboard-alerts',
    position: 'right',
    title: 'Datos en tiempo real',
    metric: '<2s',
    metricLabel: 'Actualización de datos',
    comparison: {
      ipnexus: 'Tiempo real automático',
      traditional: 'Actualización manual diaria',
    },
    type: 'efficiency',
  },

  // ==========================================
  // DOCKET / EXPEDIENTES
  // ==========================================
  {
    id: 'matters-search',
    section: '/app/docket',
    targetSelector: '.search-input',
    position: 'bottom',
    title: 'Búsqueda instantánea',
    metric: '0.3s',
    metricLabel: 'Tiempo de búsqueda',
    comparison: {
      ipnexus: 'Encuentra cualquier dato al instante',
      traditional: '3-5 min buscando en carpetas/emails',
    },
    savings: '15 min/búsqueda = 5h/semana',
    type: 'efficiency',
  },
  {
    id: 'matters-unified',
    section: '/app/docket',
    targetSelector: '.matter-header',
    position: 'bottom',
    title: 'Vista unificada 360°',
    metric: '1',
    metricLabel: 'Pantalla para todo',
    comparison: {
      ipnexus: 'Todo en una vista',
      traditional: 'Abrir 5+ sistemas diferentes',
    },
    type: 'efficiency',
  },

  // ==========================================
  // PLAZOS
  // ==========================================
  {
    id: 'deadlines-zero-miss',
    section: '/app/plazos',
    targetSelector: '.deadlines-header',
    position: 'bottom',
    title: 'Cero plazos perdidos',
    metric: '100%',
    metricLabel: 'Tasa de cumplimiento',
    comparison: {
      ipnexus: 'Alertas multinivel garantizan cumplimiento',
      traditional: '3-5% de plazos perdidos por errores',
    },
    savings: '€15,000/año evitados en reclamaciones',
    source: 'Media despacho mediano',
    type: 'security',
  },
  {
    id: 'deadlines-alerts',
    section: '/app/plazos',
    targetSelector: '.deadline-urgent',
    position: 'right',
    title: 'Alertas escalonadas',
    metric: '5',
    metricLabel: 'Niveles de alerta',
    comparison: {
      ipnexus: 'Email → SMS → Llamada → Escalado',
      traditional: 'Solo email (si te acuerdas)',
    },
    type: 'unique',
  },

  // ==========================================
  // IP-SPIDER (VIGILANCIA)
  // ==========================================
  {
    id: 'spider-included',
    section: '/app/spider',
    targetSelector: '.spider-header',
    position: 'bottom',
    title: '¡INCLUIDO en el precio!',
    metric: '€0',
    metricLabel: 'Coste adicional',
    comparison: {
      ipnexus: 'Vigilancia incluida en todos los planes',
      traditional: 'Thomson Reuters: €500/mes extra',
    },
    savings: '€6,000/año de ahorro',
    type: 'unique',
  },
  {
    id: 'spider-ai',
    section: '/app/spider',
    targetSelector: '.similarity-score',
    position: 'left',
    title: 'IA de última generación',
    metric: '95%',
    metricLabel: 'Precisión en detección',
    comparison: {
      ipnexus: 'IA entrenada con millones de marcas',
      traditional: 'Otros sistemas: 65-78% precisión',
    },
    type: 'unique',
  },

  // ==========================================
  // CRM
  // ==========================================
  {
    id: 'crm-specialized',
    section: '/app/crm',
    targetSelector: '.crm-header',
    position: 'bottom',
    title: 'CRM especializado en IP',
    metric: '100%',
    metricLabel: 'Diseñado para PI',
    comparison: {
      ipnexus: 'Campos y workflows específicos para IP',
      traditional: 'CRM genérico que hay que adaptar',
    },
    type: 'unique',
  },

  // ==========================================
  // COMUNICACIONES
  // ==========================================
  {
    id: 'comms-unified',
    section: '/app/communications',
    targetSelector: '.inbox-header',
    position: 'bottom',
    title: 'Bandeja unificada',
    metric: '4',
    metricLabel: 'Canales en uno',
    comparison: {
      ipnexus: 'Email + WhatsApp + SMS + Llamadas',
      traditional: 'Cambiar entre 4-5 aplicaciones',
    },
    savings: '45 min/día',
    type: 'efficiency',
  },
  {
    id: 'comms-softphone',
    section: '/app/communications',
    targetSelector: '.softphone-button',
    position: 'left',
    title: 'Softphone integrado',
    metric: 'Único',
    metricLabel: 'En el mercado IP',
    comparison: {
      ipnexus: 'Llama desde la plataforma sin cambiar de app',
      traditional: 'Ningún competidor tiene softphone',
    },
    type: 'unique',
  },

  // ==========================================
  // FACTURACIÓN
  // ==========================================
  {
    id: 'billing-sii',
    section: '/app/finance/invoices',
    targetSelector: '.sii-status',
    position: 'left',
    title: 'Cumplimiento automático',
    metric: '100%',
    metricLabel: 'Normativas cumplidas',
    comparison: {
      ipnexus: 'SII, TicketBAI, VERI*FACTU automático',
      traditional: 'Integraciones de pago + trabajo manual',
    },
    type: 'security',
  },
  {
    id: 'billing-time',
    section: '/app/finance/invoices',
    targetSelector: '.invoice-list',
    position: 'top',
    title: 'Facturación express',
    metric: '-80%',
    metricLabel: 'Tiempo en facturar',
    comparison: {
      ipnexus: 'De tiempo a factura en 3 clics',
      traditional: '2+ horas mensuales en crear facturas',
    },
    savings: '€300/mes en tiempo',
    type: 'saving',
  },
  {
    id: 'billing-new-catalog',
    section: '/app/finance/invoices/new',
    targetSelector: '.invoice-lines',
    position: 'top',
    title: 'Catálogo de servicios',
    metric: '1 clic',
    metricLabel: 'Para añadir servicios',
    comparison: {
      ipnexus: 'Autocompletado desde catálogo',
      traditional: 'Escribir todo manualmente cada vez',
    },
    type: 'efficiency',
  },

  // ==========================================
  // PRESUPUESTOS
  // ==========================================
  {
    id: 'quotes-tracking',
    section: '/app/finance/quotes',
    targetSelector: '.quotes-list',
    position: 'top',
    title: 'Tracking de presupuestos',
    metric: '+35%',
    metricLabel: 'Tasa de conversión',
    comparison: {
      ipnexus: 'Saber cuándo abren el presupuesto',
      traditional: 'Enviar y esperar',
    },
    type: 'efficiency',
  },

  // ==========================================
  // GASTOS
  // ==========================================
  {
    id: 'expenses-refactura',
    section: '/app/finance/expenses',
    targetSelector: '.expenses-list',
    position: 'top',
    title: 'Refacturación automática',
    metric: '0',
    metricLabel: 'Gastos olvidados',
    comparison: {
      ipnexus: 'Alerta si hay gastos sin facturar',
      traditional: 'Gastos que se quedan sin cobrar',
    },
    savings: '€200/mes recuperados',
    type: 'saving',
  },

  // ==========================================
  // WORKFLOWS
  // ==========================================
  {
    id: 'workflow-hours',
    section: '/app/workflows',
    targetSelector: '.workflow-list',
    position: 'top',
    title: 'Automatización real',
    metric: '15h',
    metricLabel: 'Ahorro semanal',
    comparison: {
      ipnexus: 'Tareas repetitivas automatizadas',
      traditional: 'Todo manual con riesgo de olvidos',
    },
    savings: '€600/mes por despacho',
    source: 'Media de nuestros clientes',
    type: 'saving',
  },
  {
    id: 'workflow-errors',
    section: '/app/workflows',
    targetSelector: '.workflow-stats',
    position: 'right',
    title: 'Sin errores humanos',
    metric: '0',
    metricLabel: 'Errores en automatizaciones',
    comparison: {
      ipnexus: 'Procesos consistentes siempre',
      traditional: '5-10% de errores en tareas manuales',
    },
    type: 'security',
  },

  // ==========================================
  // PORTAL CLIENTE
  // ==========================================
  {
    id: 'portal-calls',
    section: '/app/portal',
    targetSelector: '.portal-stats',
    position: 'bottom',
    title: 'Menos llamadas',
    metric: '-60%',
    metricLabel: 'Consultas de estado',
    comparison: {
      ipnexus: 'Clientes consultan online 24/7',
      traditional: 'Llamadas constantes "¿cómo va mi caso?"',
    },
    savings: '2h/día en atención',
    type: 'saving',
  },
  {
    id: 'portal-nps',
    section: '/app/portal',
    targetSelector: '.portal-users',
    position: 'right',
    title: 'Clientes satisfechos',
    metric: '+40%',
    metricLabel: 'Mejora en NPS',
    comparison: {
      ipnexus: 'Acceso inmediato a información',
      traditional: 'Esperar a que llames de vuelta',
    },
    type: 'efficiency',
  },

  // ==========================================
  // TAREAS
  // ==========================================
  {
    id: 'tasks-integrated',
    section: '/app/tasks',
    targetSelector: '.tasks-header',
    position: 'bottom',
    title: 'Tareas integradas',
    metric: '100%',
    metricLabel: 'Vinculación automática',
    comparison: {
      ipnexus: 'Tareas vinculadas a expedientes',
      traditional: 'Tareas sueltas sin contexto',
    },
    type: 'efficiency',
  },

  // ==========================================
  // TIMETRACKING
  // ==========================================
  {
    id: 'time-billing',
    section: '/app/timetracking',
    targetSelector: '.timetracking-header',
    position: 'bottom',
    title: 'De tiempo a factura',
    metric: '3 clics',
    metricLabel: 'Para facturar tiempo',
    comparison: {
      ipnexus: 'Exportación directa a factura',
      traditional: 'Copiar datos manualmente',
    },
    savings: '€150/mes en tiempo admin',
    type: 'saving',
  },

  // ==========================================
  // DATA HUB
  // ==========================================
  {
    id: 'datahub-sync',
    section: '/app/datahub',
    targetSelector: '.datahub-header',
    position: 'bottom',
    title: 'Sincronización automática',
    metric: '24/7',
    metricLabel: 'Monitorización',
    comparison: {
      ipnexus: 'Estados actualizados automáticamente',
      traditional: 'Consultar manualmente cada oficina',
    },
    savings: '3h/semana',
    type: 'efficiency',
  },

  // ==========================================
  // MARKET
  // ==========================================
  {
    id: 'market-network',
    section: '/app/market',
    targetSelector: '.market-header',
    position: 'bottom',
    title: 'Red de corresponsales',
    metric: '150+',
    metricLabel: 'Países cubiertos',
    comparison: {
      ipnexus: 'Corresponsales verificados con ratings',
      traditional: 'Buscar en Google y confiar',
    },
    type: 'unique',
  },

  // ==========================================
  // GENIUS
  // ==========================================
  {
    id: 'genius-ai',
    section: '/app/genius',
    targetSelector: '.genius-header',
    position: 'bottom',
    title: 'IA especializada en IP',
    metric: '1ª',
    metricLabel: 'IA legal para PI',
    comparison: {
      ipnexus: 'IA entrenada específicamente en PI',
      traditional: 'ChatGPT genérico sin contexto legal',
    },
    type: 'unique',
  },
];

// Función helper para obtener highlights de una sección
export function getHighlightsForSection(pathname: string): ValueHighlight[] {
  return VALUE_HIGHLIGHTS.filter(h => 
    pathname.startsWith(h.section) || h.section === pathname
  );
}
